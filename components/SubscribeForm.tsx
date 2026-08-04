"use client";

import { useState } from "react";
import { newsletter } from "@/lib/config";

/** Remembered forever so the popup never nags someone who already signed up. */
export const SUBSCRIBED_KEY = "digest-subscribed";

type Status = "idle" | "sending" | "success" | "error";

type Props = {
  /** Tighter single-row layout for the strip at the bottom of an issue. */
  compact?: boolean;
  /** Lets the modal react once the visitor is on the list. */
  onSuccess?: () => void;
  /** The modal focuses this input when it opens. */
  inputRef?: React.Ref<HTMLInputElement>;
};

export function SubscribeForm({ compact, onSuccess, inputRef }: Props) {
  const [email, setEmail] = useState("");
  // Honeypot: real people never see it, bots fill it in.
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (status === "sending") return;

    setStatus("sending");
    setError("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, website }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };

      if (!res.ok || !data.ok) {
        setStatus("error");
        setError(data.error || "Something went wrong. Try again in a moment.");
        return;
      }

      try {
        window.localStorage.setItem(SUBSCRIBED_KEY, "1");
      } catch {
        // Private mode or storage disabled; subscribing still worked.
      }
      setStatus("success");
      onSuccess?.();
    } catch {
      setStatus("error");
      setError("Network error. Try again in a moment.");
    }
  }

  if (status === "success") {
    return (
      <p className="font-mono text-sm text-accent" role="status">
        {newsletter.success}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className={compact ? "" : "w-full"} noValidate>
      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="digest-email" className="sr-only">
          Email address
        </label>
        <input
          ref={inputRef}
          id="digest-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder={newsletter.placeholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted/60 focus:border-accent focus:outline-none"
        />

        {/* Off-screen rather than display:none so bots still fill it in. */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          className="absolute -left-[9999px] h-0 w-0 opacity-0"
        />

        <button
          type="submit"
          disabled={status === "sending"}
          className="rounded-lg border border-border bg-foreground px-4 py-2 font-mono text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {status === "sending" ? "Adding…" : newsletter.cta}
        </button>
      </div>

      {status === "error" && (
        <p className="mt-2 font-mono text-xs text-amber-300" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
