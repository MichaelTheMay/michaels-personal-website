import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getIssue,
  getIssues,
  formatIssueDate,
  formatIssueNumber,
} from "@/lib/reading";
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
    title: `Issue ${formatIssueNumber(issue.number)} · ${issue.title}`,
    description: issue.blurb,
  };
}

function SectionLabel({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent">
          {kicker}
        </p>
        <h2 className="mt-1 text-xl font-medium tracking-tight sm:text-2xl">
          {title}
        </h2>
      </div>
    </div>
  );
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
  const newer = position > 0 ? issues[position - 1] : undefined;
  const older =
    position < issues.length - 1 ? issues[position + 1] : undefined;

  const numbered = formatIssueNumber(issue.number);
  const toolCount = issue.tools.length;
  const headlineCount = issue.headlines.length;
  const restCount = issue.rest.length;

  return (
    <div className="mx-auto max-w-4xl px-6 pt-24 pb-20 sm:pt-28">
      <Reveal>
        <Link
          href="/reading"
          className="font-mono text-xs uppercase tracking-[0.25em] text-accent transition-colors hover:text-foreground"
        >
          <span aria-hidden>←</span> ~/reading
        </Link>

        <div className="mt-8 grid gap-8 md:grid-cols-[auto_1fr] md:items-end">
          <p className="font-mono text-6xl font-medium tabular-nums leading-none tracking-tight text-accent/90 sm:text-7xl">
            {numbered}
          </p>
          <div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-muted">
              <span>Issue {numbered}</span>
              <span className="text-border">/</span>
              <span>{formatIssueDate(issue.date)}</span>
              <span className="text-border">/</span>
              <span>
                {issue.isLegacy
                  ? `${issue.items.length} ${issue.items.length === 1 ? "entry" : "entries"}`
                  : `${toolCount} tools · ${headlineCount} headlines`}
              </span>
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              {issue.title}
            </h1>
            {issue.blurb && (
              <p className="mt-4 max-w-[65ch] leading-relaxed text-muted">
                {issue.blurb}
              </p>
            )}
          </div>
        </div>
      </Reveal>

      {issue.isLegacy ? (
        <ol className="mt-14 space-y-5">
          {issue.items.map((item, i) => (
            <li key={item.id}>
              <Reveal delay={(i % 3) * 60}>
                <ReadingItemCard item={item} />
              </Reveal>
            </li>
          ))}
        </ol>
      ) : (
        <>
          {toolCount > 0 && (
            <section className="mt-16">
              <Reveal>
                <SectionLabel kicker="01 — Power tools" title="The stack" />
              </Reveal>
              <ol
                className={
                  toolCount > 8
                    ? "grid grid-cols-1 gap-4 sm:grid-cols-2"
                    : "space-y-5"
                }
              >
                {issue.tools.map((item, i) => (
                  <li key={item.id}>
                    <Reveal delay={(i % 6) * 40}>
                      <ReadingItemCard item={item} rank={i + 1} />
                    </Reveal>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {headlineCount > 0 && (
            <section className="mt-16">
              <Reveal>
                <SectionLabel kicker="02 — In the wild" title="Articles and releases" />
              </Reveal>
              <ol className="space-y-5">
                {issue.headlines.map((item, i) => (
                  <li key={item.id}>
                    <Reveal delay={(i % 3) * 60}>
                      <ReadingItemCard item={item} />
                    </Reveal>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {restCount > 0 && (
            <section className="mt-16">
              <Reveal>
                <SectionLabel kicker="Archive" title="Also filed" />
              </Reveal>
              <ol className="space-y-5">
                {issue.rest.map((item, i) => (
                  <li key={item.id}>
                    <Reveal delay={(i % 3) * 60}>
                      <ReadingItemCard item={item} />
                    </Reveal>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </>
      )}

      <div className="section-divider mt-16" />

      <Reveal>
        <div className="mt-10 rounded-[1.35rem] border border-accent/20 bg-accent-soft/80 p-1.5">
          <div className="rounded-[calc(1.35rem-0.375rem)] px-5 py-5">
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
        </div>
      </Reveal>

      {(newer || older) && (
        <nav className="mt-12 flex flex-wrap justify-between gap-4 border-t border-border pt-6">
          {older ? (
            <Link
              href={`/reading/${older.date}`}
              className="max-w-[45%] font-mono text-sm text-muted transition-colors hover:text-accent"
            >
              <span aria-hidden>←</span> Issue {formatIssueNumber(older.number)}{" "}
              · {older.title}
            </Link>
          ) : (
            <span />
          )}
          {newer && (
            <Link
              href={`/reading/${newer.date}`}
              className="ml-auto max-w-[45%] text-right font-mono text-sm text-muted transition-colors hover:text-accent"
            >
              Issue {formatIssueNumber(newer.number)} · {newer.title}{" "}
              <span aria-hidden>→</span>
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
