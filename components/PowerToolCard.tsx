import type { PowerTool } from "@/lib/power-tools";

const typeStyles: Record<string, string> = {
  tool: "border-accent/40 text-accent",
  harness: "border-accent/40 text-accent",
  repo: "border-sky-400/40 text-sky-300",
};

export function PowerToolCard({ tool }: { tool: PowerTool }) {
  return (
    <a
      href={tool.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex h-full flex-col rounded-[1.35rem] border border-white/10 bg-white/[0.03] p-1.5 transition-[border-color,background-color,transform] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-accent/40 hover:bg-white/[0.05] active:scale-[0.99]"
    >
      <div className="flex h-full flex-col rounded-[calc(1.35rem-0.375rem)] border border-white/5 bg-surface/70 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] ${
              typeStyles[tool.type] ?? "border-border text-muted"
            }`}
          >
            {tool.type}
          </span>
          <span className="font-mono text-[11px] text-muted">{tool.source}</span>
        </div>

        <h2 className="mt-3 text-lg font-medium tracking-tight text-foreground transition-colors duration-500 group-hover:text-accent">
          {tool.title}
          <span className="ml-2 inline-flex h-5 w-5 translate-y-[-1px] items-center justify-center rounded-full bg-white/5 text-[11px] text-muted transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent">
            ↗
          </span>
        </h2>

        {tool.authors ? (
          <p className="mt-1 font-mono text-xs text-muted">{tool.authors}</p>
        ) : null}

        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
          {tool.summary}
        </p>

        {tool.usecase ? (
          <p className="mt-4 border-l border-accent/40 pl-3 text-sm leading-relaxed text-foreground/85">
            <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
              Use case
            </span>
            <span className="mt-1 block">{tool.usecase}</span>
          </p>
        ) : null}

        {tool.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {tool.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border bg-background/60 px-2.5 py-1 font-mono text-[11px] text-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </a>
  );
}
