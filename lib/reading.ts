import readingData from "@/data/reading.json";

export type ReadingItem = {
  id: string;
  title: string;
  authors: string;
  source: string;
  url: string;
  type: string;
  dateAdded: string;
  summary: string;
  tags: string[];
};

/** Optional per-day metadata written by the curation job. */
type StoredIssue = {
  date: string;
  title?: string;
  blurb?: string;
};

export type Issue = {
  date: string;
  /** 1-based, oldest issue is No. 1 so numbers never shift as days are added. */
  number: number;
  title: string;
  blurb?: string;
  items: ReadingItem[];
  topTags: string[];
};

const data = readingData as {
  lastUpdated: string;
  issues?: StoredIssue[];
  items: ReadingItem[];
};

export const lastUpdated = data.lastUpdated;

function topTags(items: ReadingItem[], limit: number) {
  const counts = new Map<string, number>();
  for (const item of items) {
    for (const tag of item.tags ?? []) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([tag]) => tag);
}

/** Fallback headline for days curated before the job started writing titles. */
function deriveTitle(items: ReadingItem[]) {
  const tags = topTags(items, 3);
  if (tags.length === 0) return "New in AI research";
  const label = tags.map((t) => t[0].toUpperCase() + t.slice(1)).join(", ");
  return label.replace(/, ([^,]*)$/, " & $1");
}

/** Group items into one dated issue per curation run, newest first. */
export function getIssues(): Issue[] {
  const stored = new Map((data.issues ?? []).map((i) => [i.date, i]));

  const byDate = new Map<string, ReadingItem[]>();
  for (const item of data.items) {
    const bucket = byDate.get(item.dateAdded);
    if (bucket) bucket.push(item);
    else byDate.set(item.dateAdded, [item]);
  }

  // Number ascending by date so No. 1 is always the first issue ever published.
  const ascending = [...byDate.keys()].sort();
  const numbers = new Map(ascending.map((date, i) => [date, i + 1]));

  return ascending
    .slice()
    .reverse()
    .map((date) => {
      const items = byDate.get(date)!;
      const meta = stored.get(date);
      return {
        date,
        number: numbers.get(date)!,
        title: meta?.title?.trim() || deriveTitle(items),
        blurb: meta?.blurb?.trim() || undefined,
        items,
        topTags: topTags(items, 4),
      };
    });
}

export function getIssue(date: string): Issue | undefined {
  return getIssues().find((issue) => issue.date === date);
}

/** "2026-07-29" -> "July 29, 2026" (UTC, so the label never drifts by timezone). */
export function formatIssueDate(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
