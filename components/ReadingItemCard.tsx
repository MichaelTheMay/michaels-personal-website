import type { ReadingItem } from "@/lib/reading";

const typeStyles: Record<string, string> = {
  paper: "border-accent/40 text-accent",
  essay: "border-amber-400/40 text-amber-300",
  scenario: "border-emerald-400/40 text-emerald-300",
};

/** Renders a div, not an li — the issue page wraps it so Reveal stays inside the li. */
export function ReadingItemCard({ item }: { item: ReadingItem }) {
  return (
    <div className="rounded-xl border border-border bg-surface/40 p-6 transition-colors hover:border-accent/50 hover:bg-surface/60">
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={`rounded-full border px-2.5 py-0.5 font-mono text-xs uppercase tracking-wide ${
            typeStyles[item.type] ?? "border-border text-muted"
          }`}
        >
          {item.type}
        </span>
        <span className="font-mono text-xs text-muted">{item.source}</span>
      </div>
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 block text-lg font-medium text-foreground transition-colors hover:text-accent"
      >
        {item.title}
      </a>
      <p className="mt-1 font-mono text-xs text-muted">{item.authors}</p>
      <p className="mt-3 text-sm leading-relaxed text-muted">{item.summary}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {item.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-border bg-background px-2.5 py-1 font-mono text-xs text-muted"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
