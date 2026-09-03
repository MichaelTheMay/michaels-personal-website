// Issue grouping shared by the site (lib/reading.ts) and the newsletter job
// (scripts/send-digest.mjs). Plain JS with no imports so bare `node` can run it.
// The digest email and the pages must derive identical titles and numbering.

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
 * @property {string} [usecase]
 * @property {boolean} [returning]
 */

/** Tool types lead the issue. Headlines sit in a second block. Papers remain for older issues. */
export const TOOL_TYPES = ["tool", "harness", "repo"];
export const HEADLINE_TYPES = ["release", "article"];

/**
 * @param {string} type
 * @returns {boolean}
 */
export function isToolType(type) {
  return TOOL_TYPES.includes(type);
}

/**
 * @param {string} type
 * @returns {boolean}
 */
export function isHeadlineType(type) {
  return HEADLINE_TYPES.includes(type);
}

/**
 * @param {ReadingItem[]} items
 */
export function partitionItems(items) {
  /** @type {ReadingItem[]} */
  const tools = [];
  /** @type {ReadingItem[]} */
  const headlines = [];
  /** @type {ReadingItem[]} */
  const rest = [];
  for (const item of items) {
    if (isToolType(item.type)) tools.push(item);
    else if (isHeadlineType(item.type)) headlines.push(item);
    else rest.push(item);
  }
  return { tools, headlines, rest };
}

/**
 * @param {number} number
 * @returns {string}
 */
export function formatIssueNumber(number) {
  return String(number).padStart(2, "0");
}

/**
 * @typedef {Object} Issue
 * @property {string} date
 * @property {number} number
 * @property {string} title
 * @property {string | undefined} blurb
 * @property {ReadingItem[]} items
 * @property {ReadingItem[]} tools
 * @property {ReadingItem[]} headlines
 * @property {ReadingItem[]} rest
 * @property {boolean} isLegacy
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
  const { tools } = partitionItems(items);
  if (tools.length > 0) {
    const names = tools.slice(0, 3).map((item) => item.title);
    if (names.length === 1) return names[0];
    if (names.length === 2) return `${names[0]} and ${names[1]}`;
    return `${names[0]}, ${names[1]}, and ${names[2]}`;
  }
  const tags = topTags(items, 3);
  if (tags.length === 0) return "New in agentic tools";
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

  // Number ascending by date so Issue 01 is always the first issue ever published.
  const ascending = [...byDate.keys()].sort();
  const numbers = new Map(ascending.map((date, i) => [date, i + 1]));

  return ascending
    .slice()
    .reverse()
    .map((date) => {
      const items = /** @type {ReadingItem[]} */ (byDate.get(date));
      const meta = stored.get(date);
      const { tools, headlines, rest } = partitionItems(items);
      return {
        date,
        number: /** @type {number} */ (numbers.get(date)),
        title: meta?.title?.trim() || deriveTitle(items),
        blurb: meta?.blurb?.trim() || undefined,
        items,
        tools,
        headlines,
        rest,
        isLegacy: tools.length === 0,
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
