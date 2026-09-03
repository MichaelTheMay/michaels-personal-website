// Daily agentic curation job, run by .github/workflows/update-reading.yml
// Uses xAI's Grok API (Live Search + structured outputs) to find the day's most
// powerful agentic devtools plus a short set of articles/releases, then writes
// them to data/reading.json.
//
// Requires env var XAI_API_KEY (set as a GitHub Actions secret; never commit it).
// Optional env var XAI_MODEL (defaults to "grok-4.5").
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { isToolType } from "../lib/reading-core.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.join(__dirname, "..", "data", "reading.json");
const LOG_PATH = path.join(__dirname, "..", "data", "power-tools.json");
const MAX_ITEMS = 600;
const TOOL_COUNT = 20;
const HEADLINE_COUNT = 3;
const RETURNING_MAX = 6;

const API_URL = "https://api.x.ai/v1/responses";
const MODELS_URL = "https://api.x.ai/v1/models";
const MODEL = process.env.XAI_MODEL || "grok-4.5";
const API_KEY = process.env.XAI_API_KEY;

const ALLOWED_TOOL_TYPES = new Set(["tool", "harness", "repo"]);
const ALLOWED_HEADLINE_TYPES = new Set(["release", "article"]);

function extractOutputText(data) {
  if (typeof data.output_text === "string" && data.output_text.trim()) {
    return data.output_text;
  }
  const parts = [];
  for (const item of data.output ?? []) {
    if (item.type !== "message") continue;
    for (const part of item.content ?? []) {
      if (part.type === "output_text" && typeof part.text === "string") {
        parts.push(part.text);
      }
    }
  }
  return parts.join("");
}

function parseJsonLoose(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error(`No JSON object found in model output: ${text.slice(0, 300)}`);
  }
  return JSON.parse(candidate.slice(start, end + 1));
}

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

function canonicalUrl(url) {
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    if (parsed.pathname.endsWith("/") && parsed.pathname !== "/") {
      parsed.pathname = parsed.pathname.slice(0, -1);
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

function recentToolTitles(data, days = 7) {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const titles = new Set();
  for (const item of data.items ?? []) {
    if (!isToolType(item.type)) continue;
    const added = Date.parse(`${item.dateAdded}T00:00:00Z`);
    if (!Number.isNaN(added) && added >= cutoff) {
      titles.add(item.title.toLowerCase());
    }
  }
  return [...titles];
}

async function listModels() {
  try {
    const res = await fetch(MODELS_URL, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.data ?? json.models ?? []).map((m) => m.id).filter(Boolean);
  } catch {
    return [];
  }
}

async function loadReadingData() {
  const raw = await readFile(DATA_PATH, "utf-8");
  return JSON.parse(raw);
}

const HOUSEHOLD_BANNED = [
  "Claude Code",
  "Cursor",
  "OpenAI Codex",
  "Codex CLI",
  "Gemini CLI",
  "OpenCode",
  "Cline",
  "Warp",
  "Continue",
  "Aider",
  "OpenHands",
  "Goose",
  "Zed",
  "Browser Use",
  "AutoGPT",
  "Devin",
  "ChatGPT",
  "Copilot",
];

const CURATION_VARIANTS = {
  default: `Search GitHub first (search/repositories), then HN, then docs. Rank for power-user leverage, not brand recognition.
Prefer tools created in the last 18 months, still pushed in the last 2 weeks, with roughly 100 to 20,000 stars. Obscure and recently released beats famous.
Household names are banned: ${HOUSEHOLD_BANNED.join(", ")}.
A research-paper origin is one valid angle, not a requirement. Clone-and-run repos, sandboxes, memory graphs, control planes, and eval harnesses all qualify if a power user would actually wire them into a loop.`,
  velocity: `ALGORITHM: GitHub velocity. Search GitHub for coding-agent / harness / MCP / sandbox repos created after 2026-01-01, stars 100-15000, pushed in the last 14 days. Rank by recency of push, then star growth, then whether a power user can run it tonight. Ban household names: ${HOUSEHOLD_BANNED.join(", ")}.`,
  research: `ALGORITHM: Research-origin. Prefer tools that started as a paper, lab, or benchmark (SWE-bench lineage, OSWorld, computer-use evals, university labs) and now ship as a clone-and-run repo. Still must be usable today. Ban household names: ${HOUSEHOLD_BANNED.join(", ")}.`,
  infra: `ALGORITHM: Infra under the agent. Do not pick another coding CLI. Pick runtimes, sandboxes, memory, context compression, computer-use drivers, policy/isolation, observability. The reader already has a coding agent; these make it survive. Ban household names: ${HOUSEHOLD_BANNED.join(", ")}.`,
  systems: `ALGORITHM: Systems-language harnesses. Prefer Go, Rust, Zig, C++ agent runtimes and orchestrators under 2,000 stars. Ban Electron wrappers and household names: ${HOUSEHOLD_BANNED.join(", ")}.`,
};

function variantSpec() {
  const id = process.env.CURATION_VARIANT || "default";
  return CURATION_VARIANTS[id] || CURATION_VARIANTS.default;
}

async function curateNewItems({ existingUrls, recentTitles }) {
  const prompt = `Use the web_search tool to curate today's agentic-devtools digest. Start with GitHub repository search, not vendor blogs.

TODAY'S DATE: ${new Date().toISOString().slice(0, 10)}

CURATION ALGORITHM:
${variantSpec()}

SECTION 1 — POWER-USER TOOLS (exactly ${TOOL_COUNT})
Find ${TOOL_COUNT} agentic developer tools, coding harnesses, or code repositories a power user should actually clone or run. Combine angles: GitHub velocity, research-origin loops, infra under the agent, and systems-language harnesses. Advanced, recently shipped, and non-obvious. Famous IDEs and terminal chatbots are out. This is a large daily list, not a top-five.

Hard rules:
- Search GitHub first. Confirm each URL is a live repo or docs page.
- Popularity is a weak gate (enough that it is real), not the ranking. Empowerment ranks.
- Ban household consumer tools: ${HOUSEHOLD_BANNED.join(", ")}.
- At most ${RETURNING_MAX} of the five may be tools that appeared in the last 7 days. The other three must be new or rising relative to that list.
- Tools seen in the last 7 days (do not return more than ${RETURNING_MAX} of these titles): ${recentTitles.join(", ") || "(none)"}
- For every tool write: one-line what-it-is in "summary", and one concrete "usecase" starting with "Use it to".
- Mark returning:true only on the repeats. Fresh picks get returning:false.
- type must be one of: "tool" (product/CLI/IDE agent), "harness" (orchestration/control plane), "repo" (open-source codebase the reader can clone and run).
- Prefer GitHub repos, official homepages, or primary docs. No affiliate blogs.

SECTION 2 — IN THE WILD (exactly ${HEADLINE_COUNT})
Pick ${HEADLINE_COUNT} articles or releases that are NOT research papers. Target mix: 2 product releases / changelogs / model drops, plus 1 essay, launch post, or engineering writeup. These can mention papers only if the link is a product, changelog, or magazine-style article.
- type must be "release" or "article".
- summary is 2 sentences on what shipped or what the argument is. No usecase field.

Do not include arXiv papers, conference PDFs, or academic abstracts unless they are attached to a real product/model drop the reader can use today.

Do not include any of these URLs, which are already in the collection:
${existingUrls.slice(0, 200).join("\n") || "(none yet)"}

Write a headline and standfirst for the issue as a whole. The headline must name the actual through-line in today's tools (e.g. "Open harnesses that outrun closed IDEs"), not a generic phrase like "Today's AI tools". The standfirst is one or two sentences on what ties the five tools together.

Respond with ONLY a JSON object (no prose, no code fence) of this exact shape:
{"issueTitle":string,"issueBlurb":string,"tools":[{"title":string,"authors":string,"source":string,"url":string,"type":"tool"|"harness"|"repo","summary":string,"usecase":string,"returning":boolean,"tags":string[]}],"headlines":[{"title":string,"authors":string,"source":string,"url":string,"type":"release"|"article","summary":string,"tags":string[]}]}
Never use em dashes anywhere in the text you produce. Use commas, colons, parentheses, or separate sentences instead.`;

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      input: [{ role: "user", content: prompt }],
      tools: [{ type: "web_search" }],
      max_output_tokens: 8000,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    if (response.status === 404 && body.includes("does not exist")) {
      const available = await listModels();
      throw new Error(
        `xAI model "${MODEL}" is not available to this account. ` +
          `Set the XAI_MODEL env var to one of: ${available.join(", ") || "(none returned)"}`
      );
    }
    throw new Error(`xAI API error ${response.status}: ${body.slice(0, 500)}`);
  }

  const data = await response.json();
  const text = extractOutputText(data);
  if (!text.trim()) {
    throw new Error("No text output in xAI response.");
  }

  const parsed = parseJsonLoose(text);
  return {
    tools: Array.isArray(parsed.tools) ? parsed.tools : [],
    headlines: Array.isArray(parsed.headlines) ? parsed.headlines : [],
    issueTitle: typeof parsed.issueTitle === "string" ? parsed.issueTitle.trim() : "",
    issueBlurb: typeof parsed.issueBlurb === "string" ? parsed.issueBlurb.trim() : "",
  };
}

function normalizeItem(item, today, kind) {
  const type = String(item.type || "").toLowerCase();
  const allowed = kind === "tool" ? ALLOWED_TOOL_TYPES : ALLOWED_HEADLINE_TYPES;
  if (!allowed.has(type)) return null;
  if (!item.url || !item.title) return null;

  const record = {
    id: `${slugify(item.title)}-${today}`,
    title: String(item.title).trim(),
    authors: typeof item.authors === "string" ? item.authors.trim() : "",
    source: typeof item.source === "string" ? item.source.trim() : "",
    url: String(item.url).trim(),
    type,
    dateAdded: today,
    summary: typeof item.summary === "string" ? item.summary.trim() : "",
    tags: Array.isArray(item.tags) ? item.tags.map((tag) => String(tag)) : [],
  };

  if (kind === "tool") {
    record.usecase = typeof item.usecase === "string" ? item.usecase.trim() : "";
    record.returning = Boolean(item.returning);
  }

  return record;
}

async function main() {
  if (!API_KEY) {
    throw new Error("XAI_API_KEY is not set. Add it as a GitHub Actions secret.");
  }

  const data = await loadReadingData();
  const existingUrls = new Set(
    data.items.map((item) => canonicalUrl(item.url)).filter(Boolean)
  );
  const recentTitles = recentToolTitles(data, 7);

  const { tools, headlines, issueTitle, issueBlurb } = await curateNewItems({
    existingUrls: [...existingUrls],
    recentTitles,
  });
  const today = new Date().toISOString().slice(0, 10);

  const seen = new Set(existingUrls);
  const take = (raw, kind, limit) => {
    const out = [];
    for (const candidate of raw) {
      const item = normalizeItem(candidate, today, kind);
      if (!item) continue;
      const url = canonicalUrl(item.url);
      if (seen.has(url)) continue;
      seen.add(url);
      out.push(item);
      if (out.length >= limit) break;
    }
    return out;
  };

  let freshTools = take(tools, "tool", TOOL_COUNT);
  let freshHeadlines = take(headlines, "headline", HEADLINE_COUNT);

  const returningCount = freshTools.filter((item) => item.returning).length;
  if (returningCount > RETURNING_MAX) {
    let extra = returningCount - RETURNING_MAX;
    freshTools = freshTools.filter((item) => {
      if (item.returning && extra > 0) {
        extra -= 1;
        return false;
      }
      return true;
    });
  }

  const fresh = [...freshTools, ...freshHeadlines];
  if (fresh.length === 0) {
    console.log("No new qualifying items found today.");
    return;
  }

  let items = [...fresh, ...data.items];
  if (items.length > MAX_ITEMS) {
    const dropped = items.length - MAX_ITEMS;
    console.log(`Trimming ${dropped} oldest item(s) to stay under ${MAX_ITEMS}.`);
    items = items.slice(0, MAX_ITEMS);
  }

  const issues = [
    { date: today, title: issueTitle, blurb: issueBlurb },
    ...(data.issues ?? []).filter((issue) => issue.date !== today),
  ];

  const liveDates = new Set(items.map((item) => item.dateAdded));
  const next = {
    lastUpdated: today,
    issues: issues.filter((issue) => liveDates.has(issue.date)),
    items,
  };

  await writeFile(DATA_PATH, JSON.stringify(next, null, 2) + "\n", "utf-8");
  await appendPowerToolsLog(freshTools, today);
  console.log(
    `Issue ${today}${issueTitle ? ` · ${issueTitle}` : ""}: added ${freshTools.length} tool(s), ${freshHeadlines.length} headline(s): ` +
      fresh.map((i) => i.title).join(", ")
  );
}

function slugFromUrl(url, title) {
  try {
    const parsed = new URL(url);
    const last = parsed.pathname.split("/").filter(Boolean).pop();
    if (last) return last.toLowerCase();
  } catch {
    // fall through
  }
  return slugify(title);
}

async function appendPowerToolsLog(freshTools, today) {
  let log = { lastUpdated: today, count: 0, tools: [] };
  try {
    log = JSON.parse(await readFile(LOG_PATH, "utf-8"));
  } catch {
    // first run
  }
  const byUrl = new Map((log.tools ?? []).map((tool) => [canonicalUrl(tool.url), tool]));
  for (const item of freshTools) {
    const key = canonicalUrl(item.url);
    const existing = byUrl.get(key);
    if (existing) {
      existing.lastSeen = today;
      if (item.summary) existing.summary = item.summary;
      if (item.usecase) existing.usecase = item.usecase;
      continue;
    }
    byUrl.set(key, {
      slug: slugFromUrl(item.url, item.title),
      title: item.title,
      authors: item.authors,
      source: item.source,
      url: item.url,
      type: item.type,
      summary: item.summary,
      usecase: item.usecase || "",
      tags: item.tags || [],
      firstSeen: today,
      lastSeen: today,
      algorithms: ["digest"],
    });
  }
  const tools = [...byUrl.values()].sort(
    (a, b) => b.lastSeen.localeCompare(a.lastSeen) || a.title.localeCompare(b.title)
  );
  const nextLog = { lastUpdated: today, count: tools.length, tools };
  await writeFile(LOG_PATH, JSON.stringify(nextLog, null, 2) + "\n", "utf-8");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
