"use client";

import { useEffect, useRef } from "react";

// Vertical rail for the project timeline: a dim full-height track with a
// gradient beam drawn over it as the reader scrolls past.
//
// Progress is written straight to a CSS custom property inside a rAF callback
// rather than to React state, so scrolling never triggers a re-render.
export function TimelineBeam({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Reduced motion: show the beam fully drawn instead of animating it.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.setProperty("--beam-progress", "1");
      return;
    }

    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      // Draw the beam down to roughly the middle of the viewport, so the tip
      // tracks whichever card the reader is looking at.
      const marker = window.innerHeight * 0.5;
      const progress = (marker - rect.top) / rect.height;
      el.style.setProperty(
        "--beam-progress",
        String(Math.min(1, Math.max(0, progress)))
      );
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div ref={ref} className="timeline-rail">
      <span className="timeline-beam" aria-hidden />
      {children}
    </div>
  );
}
