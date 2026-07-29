import Link from "next/link";
import { getIssues, lastUpdated, formatIssueDate } from "@/lib/reading";
import { Reveal } from "@/components/Reveal";

export const metadata = {
  title: "Reading",
};

export default function ReadingPage() {
  const issues = getIssues();
  const totalItems = issues.reduce((sum, issue) => sum + issue.items.length, 0);

  return (
    <div className="mx-auto max-w-4xl px-6 py-16 sm:py-24">
      <p className="font-mono text-sm text-accent">~/reading</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
        A daily dispatch on AI research
      </h1>

      <div className="mt-6 rounded-lg border border-border bg-surface p-5">
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

      <ol className="mt-10 space-y-4">
        {issues.map((issue) => (
          <Reveal key={issue.date}>
            <li>
              <Link
                href={`/reading/${issue.date}`}
                className="group block rounded-lg border border-border bg-surface p-6 transition-colors hover:border-accent"
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
