"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { newsletter } from "@/lib/config";
import { SubscribeForm, SUBSCRIBED_KEY } from "@/components/SubscribeForm";

/** Dismissals last the browsing session, so the popup returns on the next visit. */
const DISMISSED_KEY = "digest-dismissed";
const OPEN_DELAY_MS = 2000;

export function SubscribeModal() {
  const [open, setOpen] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const restoreFocusRef = useRef<Element | null>(null);

  // Storage is only read in an effect so the server and first client render agree.
  useEffect(() => {
    let skip = false;
    try {
      skip =
        window.localStorage.getItem(SUBSCRIBED_KEY) === "1" ||
        window.sessionStorage.getItem(DISMISSED_KEY) === "1";
    } catch {
      // Storage blocked — fall through and show it.
    }
    if (skip) return;

    const timer = window.setTimeout(() => {
      restoreFocusRef.current = document.activeElement;
      setOpen(true);
    }, OPEN_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  const close = useCallback(() => {
    try {
      window.sessionStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // Nothing to remember — it will simply show again.
    }
    setOpen(false);
    if (restoreFocusRef.current instanceof HTMLElement) {
      restoreFocusRef.current.focus();
    }
  }, []);

  // Escape to close, Tab kept inside the panel while it is open.
  useEffect(() => {
    if (!open) return;

    inputRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        close();
        return;
      }
      if (event.key !== "Tab") return;

      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([tabindex="-1"])'
      );
      if (!focusables || focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center"
      onClick={close}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="digest-modal-heading"
        onClick={(e) => e.stopPropagation()}
        className="reveal reveal-in w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl shadow-black/60"
      >
        <div className="flex items-start justify-between gap-4">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">
            ~/reading
          </p>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="-mr-1 -mt-1 rounded-lg px-2 py-1 font-mono text-sm text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
          >
            ✕
          </button>
        </div>

        <h2
          id="digest-modal-heading"
          className="mt-3 text-xl font-medium leading-snug"
        >
          {newsletter.heading}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {newsletter.blurb}
        </p>

        <div className="mt-5">
          <SubscribeForm
            inputRef={inputRef}
            onSuccess={() => setSubscribed(true)}
          />
        </div>

        {subscribed ? (
          <button
            type="button"
            onClick={close}
            className="mt-4 font-mono text-xs text-muted transition-colors hover:text-foreground"
          >
            Close
          </button>
        ) : (
          <p className="mt-4 font-mono text-xs text-muted/70">
            No spam, unsubscribe any time ·{" "}
            <a
              href={newsletter.feedPath}
              className="underline decoration-border underline-offset-2 transition-colors hover:text-foreground"
            >
              or grab the {newsletter.rssLabel} feed
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
