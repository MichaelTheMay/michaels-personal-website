// Issue grouping shared by the site (lib/reading.ts) and the newsletter job
// (scripts/send-digest.mjs). Plain JS with no imports so bare `node` can run it
// — the digest email and the pages must derive identical titles and numbering.

/**
 * @typedef {Object} ReadingItem
 * @property {string} id
 * @property {string} title
 * @property {string} authors
 * @property {string} source
 * @property {string} url
 * @property {string} type
 * @property {string} dateAdded
 * @property {string} summary
 * @property {string[]} tags
 */

/**
 * @typedef {Object} Issue
 * @property {string} date
 * @property {number} number
 * @property {string} title
 * @property {string | undefined} blurb
 * @property {ReadingItem[]} items
 * @property {string[]} topTags
 */

/**
 * Most frequent tags first, alphabetical on ties.
 * @param {ReadingItem[]} items
 * @param {number} limit
 * @returns {string[]}
 */
export function topTags(items, limit) {
  /** @type {Map<string, number>} */
  const counts = new Map();
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

/**
 * Fallback headline for days curated before the job started writing titles.
 * @param {ReadingItem[]} items
 * @returns {string}
 */
export function deriveTitle(items) {
  const tags = topTags(items, 3);
  if (tags.length === 0) return "New in AI research";
  const label = tags.map((t) => t[0].toUpperCase() + t.slice(1)).join(", ");
  return label.replace(/, ([^,]*)$/, " & $1");
}

/**
 * Group items into one dated issue per curation run, newest first.
 * @param {{ issues?: { date: string, title?: string, blurb?: string }[], items: ReadingItem[] }} data
 * @returns {Issue[]}
 */
export function groupIssues(data) {
  const stored = new Map((data.issues ?? []).map((i) => [i.date, i]));

  /** @type {Map<string, ReadingItem[]>} */
  const byDate = new Map();
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
      const items = /** @type {ReadingItem[]} */ (byDate.get(date));
      const meta = stored.get(date);
      return {
        date,
        number: /** @type {number} */ (numbers.get(date)),
        title: meta?.title?.trim() || deriveTitle(items),
        blurb: meta?.blurb?.trim() || undefined,
        items,
        topTags: topTags(items, 4),
      };
    });
}

/**
 * "2026-07-29" -> "July 29, 2026" (UTC, so the label never drifts by timezone).
 * @param {string} date
 * @returns {string}
 */
export function formatIssueDate(date) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
