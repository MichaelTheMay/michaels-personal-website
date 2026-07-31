import Link from "next/link";
import { getIssues, lastUpdated, formatIssueDate } from "@/lib/reading";
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
    <div className="mx-auto max-w-4xl px-6 pt-24 pb-16 sm:pt-28">
      <Reveal>
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">
          ~/reading
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          A daily dispatch on AI research
        </h1>

        <div className="mt-6 rounded-2xl border border-border bg-surface/60 p-5 backdrop-blur-sm">
          <p className="text-sm leading-relaxed text-muted">
            <span className="font-mono text-accent">[auto-updating]</span>{" "}
            Every day an agentic pipeline searches that day&apos;s new AI research
            papers and essays, ranks them for depth and originality, and files
            the best of them as a dated issue below. Open an issue to read that
            day&apos;s picks.
          </p>
          <p className="mt-3 font-mono text-xs text-muted">
            {issues.length} {issues.length === 1 ? "issue" : "issues"} ·{" "}
            {totalItems} {totalItems === 1 ? "entry" : "entries"} · last updated{" "}
            {lastUpdated}
          </p>
        </div>
      </Reveal>

      {/* Get it by email instead of checking back. */}
      <Reveal>
        <div className="mt-4 rounded-2xl border border-accent/25 bg-accent-soft p-5">
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
      </Reveal>

      <div className="section-divider mt-12" />

      <ol className="mt-10 space-y-4">
        {issues.map((issue, i) => (
          <Reveal key={issue.date} delay={(i % 3) * 60}>
            <li>
              <Link
                href={`/reading/${issue.date}`}
                className="group block rounded-xl border border-border bg-surface/40 p-6 transition-colors hover:border-accent/60 hover:bg-surface/60"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-accent/40 px-2.5 py-0.5 font-mono text-xs text-accent">
                    No. {String(issue.number).padStart(2, "0")}
                  </span>
                  <span className="font-mono text-xs text-muted">
                    {formatIssueDate(issue.date)}
                  </span>
                  <span className="font-mono text-xs text-muted/60">
                    {issue.items.length}{" "}
                    {issue.items.length === 1 ? "entry" : "entries"}
                  </span>
                </div>

                <h2 className="mt-3 text-xl font-medium text-foreground transition-colors group-hover:text-accent">
                  {issue.title}
                </h2>

                {issue.blurb && (
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {issue.blurb}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  {issue.topTags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-border bg-background px-2.5 py-1 font-mono text-xs text-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <p className="mt-5 font-mono text-xs text-muted transition-colors group-hover:text-accent">
                  Read issue <span aria-hidden>→</span>
                </p>
              </Link>
            </li>
          </Reveal>
        ))}
      </ol>
    </div>
  );
}
