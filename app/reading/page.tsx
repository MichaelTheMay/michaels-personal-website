import Link from "next/link";
import { getIssues, lastUpdated, formatIssueDate, formatIssueNumber } from "@/lib/reading";
import { newsletter } from "@/lib/config";
import { Reveal } from "@/components/Reveal";
import { SubscribeForm } from "@/components/SubscribeForm";

export const metadata = {
  title: "Reading",
};

export default function ReadingPage() {
  const issues = getIssues();
  const totalItems = issues.reduce((sum, issue) => sum + issue.items.length, 0);

  return (
    <div className="mx-auto max-w-4xl px-6 pt-24 pb-20 sm:pt-28">
      <Reveal>
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">
          ~/reading
        </p>
        <h1 className="mt-4 max-w-[18ch] text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
          The daily agentic tools digest
        </h1>
        <p className="mt-4 max-w-[62ch] text-base leading-relaxed text-muted">
          Every morning an agentic pipeline ranks the five most powerful coding
          agents, harnesses, and repos a working engineer can actually use, then
          files three articles or releases that are not research papers.
        </p>

        <div className="mt-8 font-mono text-xs text-muted">
          <span className="text-accent">[auto-updating]</span>{" "}
          {issues.length} {issues.length === 1 ? "issue" : "issues"} ·{" "}
          {totalItems} {totalItems === 1 ? "entry" : "entries"} · last updated{" "}
          {lastUpdated}
        </div>
      </Reveal>

      <Reveal>
        <div className="mt-8 rounded-[1.35rem] border border-accent/20 bg-accent-soft/80 p-1.5">
          <div className="rounded-[calc(1.35rem-0.375rem)] px-5 py-5">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h2 className="text-lg font-medium">{newsletter.heading}</h2>
              <a
                href={newsletter.feedPath}
                className="font-mono text-xs text-muted transition-colors hover:text-accent"
              >
                {newsletter.rssLabel} <span aria-hidden>↗</span>
              </a>
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
              {newsletter.blurb}
            </p>
            <div className="mt-4 max-w-md">
              <SubscribeForm />
            </div>
          </div>
        </div>
      </Reveal>

      <ol className="mt-14 space-y-4">
        {issues.map((issue, i) => {
          const numbered = formatIssueNumber(issue.number);
          const preview = issue.isLegacy
            ? issue.topTags
            : issue.tools.map((tool) => tool.title).slice(0, 5);

          return (
            <Reveal key={issue.date} delay={(i % 3) * 60}>
              <li>
                <Link
                  href={`/reading/${issue.date}`}
                  className="group grid gap-5 rounded-[1.35rem] border border-white/10 bg-white/[0.03] p-1.5 transition-[border-color,background-color] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-accent/40 hover:bg-white/[0.05] sm:grid-cols-[5.5rem_1fr]"
                >
                  <div className="flex items-end rounded-[calc(1.35rem-0.375rem)] px-5 pt-5 sm:items-start sm:px-4 sm:pt-6">
                    <span className="font-mono text-4xl font-medium tabular-nums leading-none tracking-tight text-accent/85 transition-colors duration-500 group-hover:text-accent">
                      {numbered}
                    </span>
                  </div>

                  <div className="rounded-[calc(1.35rem-0.375rem)] px-5 pb-6 pt-1 sm:pt-6 sm:pr-6 sm:pl-2">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
                      <span>Issue {numbered}</span>
                      <span className="text-border">/</span>
                      <span>{formatIssueDate(issue.date)}</span>
                      <span className="text-border">/</span>
                      <span>
                        {issue.isLegacy
                          ? `${issue.items.length} entries`
                          : `${issue.tools.length} tools · ${issue.headlines.length} headlines`}
                      </span>
                    </div>

                    <h2 className="mt-3 text-xl font-medium tracking-tight text-balance text-foreground transition-colors duration-500 group-hover:text-accent">
                      {issue.title}
                    </h2>

                    {issue.blurb && (
                      <p className="mt-2 max-w-[62ch] text-sm leading-relaxed text-muted">
                        {issue.blurb}
                      </p>
                    )}

                    {preview.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {preview.map((label) => (
                          <span
                            key={label}
                            className="rounded-full border border-border bg-background/70 px-2.5 py-1 font-mono text-[11px] text-muted"
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                    )}

                    <p className="mt-5 font-mono text-xs text-muted transition-colors group-hover:text-accent">
                      Read issue <span aria-hidden>→</span>
                    </p>
                  </div>
                </Link>
              </li>
            </Reveal>
          );
        })}
      </ol>
    </div>
  );
}
