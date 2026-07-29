import readingData from "@/data/reading.json";

export const metadata = {
  title: "Reading",
};

const typeStyles: Record<string, string> = {
  paper: "border-accent/40 text-accent",
  essay: "border-amber-400/40 text-amber-300",
  scenario: "border-emerald-400/40 text-emerald-300",
};

export default function ReadingPage() {
  const { lastUpdated, items } = readingData;

  return (
    <div className="mx-auto max-w-4xl px-6 py-16 sm:py-24">
      <p className="font-mono text-sm text-accent">~/reading</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
        Essays, papers &amp; blog posts worth your time
      </h1>

      <div className="mt-6 rounded-lg border border-border bg-surface p-5">
        <p className="text-sm leading-relaxed text-muted">
          <span className="font-mono text-accent">[auto-updating]</span> This
          feed is refreshed automatically every day by an agentic pipeline
          that searches the day&apos;s new AI research papers and essays,
          ranks them for depth and originality, and appends the ten most
          interesting to this list. Everything below was either seeded by hand
          or added by that pipeline — nothing is filler.
        </p>
        <p className="mt-3 font-mono text-xs text-muted">
          last updated: {lastUpdated}
        </p>
      </div>

      <ol className="mt-10 space-y-6">
        {items.map((item) => (
          <li
            key={item.id}
            className="rounded-lg border border-border bg-surface p-6 transition-colors hover:border-accent"
          >
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`rounded-full border px-2.5 py-0.5 font-mono text-xs uppercase tracking-wide ${
                  typeStyles[item.type] ?? "border-border text-muted"
                }`}
              >
                {item.type}
              </span>
              <span className="font-mono text-xs text-muted">
                {item.source}
              </span>
              <span className="font-mono text-xs text-muted/60">
                added {item.dateAdded}
              </span>
            </div>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 block text-lg font-medium text-foreground hover:text-accent transition-colors"
            >
              {item.title}
            </a>
            <p className="mt-1 font-mono text-xs text-muted">
              {item.authors}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {item.summary}
            </p>
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
          </li>
        ))}
      </ol>
    </div>
  );
}
