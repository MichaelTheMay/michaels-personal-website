import Link from "next/link";
import { notFound } from "next/navigation";
import { getIssue, getIssues, formatIssueDate } from "@/lib/reading";
import { newsletter } from "@/lib/config";
import { ReadingItemCard } from "@/components/ReadingItemCard";
import { Reveal } from "@/components/Reveal";
import { SubscribeForm } from "@/components/SubscribeForm";

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
    <div className="mx-auto max-w-4xl px-6 pt-24 pb-16 sm:pt-28">
      <Reveal>
        <Link
          href="/reading"
          className="font-mono text-xs uppercase tracking-[0.25em] text-accent transition-colors hover:text-foreground"
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
      </Reveal>

      <ol className="mt-10 space-y-6">
        {issue.items.map((item, i) => (
          <li key={item.id}>
            <Reveal delay={(i % 3) * 60}>
              <ReadingItemCard item={item} />
            </Reveal>
          </li>
        ))}
      </ol>

      <div className="section-divider mt-12" />

      <Reveal>
        <div className="mt-10 rounded-2xl border border-accent/25 bg-accent-soft p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 className="text-base font-medium">{newsletter.heading}</h2>
            <a
              href={newsletter.feedPath}
              className="font-mono text-xs text-muted transition-colors hover:text-accent"
            >
              {newsletter.rssLabel} <span aria-hidden>↗</span>
            </a>
          </div>
          <div className="mt-3 max-w-md">
            <SubscribeForm compact />
          </div>
        </div>
      </Reveal>

      {(newer || older) && (
        <nav className="mt-10 flex flex-wrap justify-between gap-4 border-t border-border pt-6">
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
