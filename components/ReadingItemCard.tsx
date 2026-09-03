import type { ReadingItem } from "@/lib/reading";
import { isHeadlineType, isToolType } from "@/lib/reading";

const typeStyles: Record<string, string> = {
  tool: "border-accent/40 text-accent",
  harness: "border-accent/40 text-accent",
  repo: "border-sky-400/40 text-sky-300",
  release: "border-amber-400/40 text-amber-300",
  article: "border-amber-400/40 text-amber-300",
  paper: "border-accent/40 text-accent",
  essay: "border-amber-400/40 text-amber-300",
  scenario: "border-emerald-400/40 text-emerald-300",
};

type Props = {
  item: ReadingItem;
  /** 1-based rank for the day's tool stack. */
  rank?: number;
};

/** Renders a div, not an li; the issue page wraps it so Reveal stays inside the li. */
export function ReadingItemCard({ item, rank }: Props) {
  const tool = isToolType(item.type);
  const headline = isHeadlineType(item.type);

  return (
    <div className="group relative rounded-[1.35rem] border border-white/10 bg-white/[0.03] p-1.5 transition-[border-color,background-color] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-accent/35 hover:bg-white/[0.045]">
      <div className="rounded-[calc(1.35rem-0.375rem)] border border-white/5 bg-surface/70 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
        <div className="flex flex-wrap items-center gap-3">
          {rank !== undefined && (
            <span className="font-mono text-[11px] tabular-nums tracking-[0.18em] text-accent">
              {String(rank).padStart(2, "0")}
            </span>
          )}
          <span
            className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] ${
              typeStyles[item.type] ?? "border-border text-muted"
            }`}
          >
            {item.type}
          </span>
          {item.returning && (
            <span className="rounded-full border border-border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
              returning
            </span>
          )}
          <span className="font-mono text-xs text-muted">{item.source}</span>
        </div>

        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 block text-lg font-medium tracking-tight text-balance text-foreground transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-accent"
        >
          {item.title}
          <span className="ml-2 inline-flex h-5 w-5 translate-y-[-1px] items-center justify-center rounded-full bg-white/5 text-[11px] text-muted transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent">
            ↗
          </span>
        </a>

        {item.authors ? (
          <p className="mt-1 font-mono text-xs text-muted">{item.authors}</p>
        ) : null}

        <p className="mt-3 max-w-[65ch] text-sm leading-relaxed text-muted">
          {item.summary}
        </p>

        {tool && item.usecase ? (
          <p className="mt-4 max-w-[65ch] border-l border-accent/40 pl-3 text-sm leading-relaxed text-foreground/85">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
              Use case
            </span>
            <span className="mt-1 block">{item.usecase}</span>
          </p>
        ) : null}

        {item.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border bg-background/60 px-2.5 py-1 font-mono text-[11px] text-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {headline ? (
          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-muted/70">
            {item.type === "release" ? "Shipped" : "Read"}
          </p>
        ) : null}
      </div>
    </div>
  );
}
