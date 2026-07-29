import Link from "next/link";
import { notFound } from "next/navigation";
import { getIssue, getIssues, formatIssueDate } from "@/lib/reading";
import { ReadingItemCard } from "@/components/ReadingItemCard";

type Params = { date: string };

export function generateStaticParams(): Params[] {
  return getIssues().map((issue) => ({ date: issue.date }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { date } = await params;
  const issue = getIssue(date);
  if (!issue) return { title: "Issue not found" };
  return {
    title: `${issue.title} — ${formatIssueDate(issue.date)}`,
    description: issue.blurb,
  };
}

export default async function IssuePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { date } = await params;
  const issue = getIssue(date);
  if (!issue) notFound();

  const issues = getIssues();
  const position = issues.findIndex((i) => i.date === issue.date);
  // issues are newest-first, so the next-newest sits at the lower index.
  const newer = position > 0 ? issues[position - 1] : undefined;
  const older =
    position < issues.length - 1 ? issues[position + 1] : undefined;

  return (
    <div className="mx-auto max-w-4xl px-6 py-16 sm:py-24">
      <Link
        href="/reading"
        className="font-mono text-sm text-accent transition-colors hover:text-foreground"
      >
        <span aria-hidden>←</span> ~/reading
      </Link>

      <div className="mt-6 flex flex-wrap items-center gap-3">
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

      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
        {issue.title}
      </h1>

      {issue.blurb && (
        <p className="mt-4 max-w-2xl leading-relaxed text-muted">
          {issue.blurb}
        </p>
      )}

      <ol className="mt-10 space-y-6">
        {issue.items.map((item) => (
          <ReadingItemCard key={item.id} item={item} />
        ))}
      </ol>

      {(newer || older) && (
        <nav className="mt-12 flex flex-wrap justify-between gap-4 border-t border-border pt-6">
          {older ? (
            <Link
              href={`/reading/${older.date}`}
              className="font-mono text-sm text-muted transition-colors hover:text-accent"
            >
              <span aria-hidden>←</span> No.{" "}
              {String(older.number).padStart(2, "0")} · {older.title}
            </Link>
          ) : (
            <span />
          )}
          {newer && (
            <Link
              href={`/reading/${newer.date}`}
              className="font-mono text-sm text-muted transition-colors hover:text-accent"
            >
              No. {String(newer.number).padStart(2, "0")} · {newer.title}{" "}
              <span aria-hidden>→</span>
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
