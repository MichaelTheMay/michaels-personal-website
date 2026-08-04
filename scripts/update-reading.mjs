// Daily agentic curation job, run by .github/workflows/update-reading.yml
// Uses xAI's Grok API (Live Search + structured outputs) to find the day's most
// interesting AI research papers / essays and append the best to data/reading.json.
//
// Requires env var XAI_API_KEY (set as a GitHub Actions secret; never commit it).
// Optional env var XAI_MODEL (defaults to "grok-4").
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.join(__dirname, "..", "data", "reading.json");
const MAX_ITEMS = 300;
const TARGET_COUNT = 10;

const API_URL = "https://api.x.ai/v1/responses";
const MODELS_URL = "https://api.x.ai/v1/models";
const MODEL = process.env.XAI_MODEL || "grok-4.5";
const API_KEY = process.env.XAI_API_KEY;

// Pull the assistant's final text out of an xAI Responses API payload. The
// response is an array of output items (tool calls + a final message); the
// answer lives in the message item's output_text content parts.
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

// Grok may wrap JSON in prose or a ```json fence; grab the outermost object.
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

async function curateNewItems(existingUrls) {
  const prompt = `Use the web_search tool to find AI research papers and technical essays published very recently (prioritize the last 24-48 hours; widen to the last week if nothing recent enough qualifies).

Evaluate candidates for technical depth and intellectual originality. Favor formal rigor, novel systems/research results, and substantive technically-serious writing. Avoid press releases, listicles, marketing content, and shallow news summaries.

Select the ${TARGET_COUNT} best qualifying items. Return only entries you are confident are real, currently-live pages you found via search.

Do not include any of these URLs, which are already in the collection:
${existingUrls.slice(0, 200).join("\n") || "(none yet)"}

These items are published together as one dated issue of a daily reading digest, so also write a headline and a standfirst for the issue as a whole. The headline must name the actual through-line in today's selection (e.g. "Long-horizon memory and the limits of context"), not a generic phrase like "Today's AI research". The standfirst is one or two sentences on what ties the items together.

Respond with ONLY a JSON object (no prose, no code fence) of this exact shape:
{"issueTitle":string,"issueBlurb":string,"items":[{"title":string,"authors":string,"source":string,"url":string,"type":"paper"|"essay"|"scenario","summary":string,"tags":string[]}]}
Each summary must be 2-3 sentences describing the actual argument, model, or result, not a generic description of the topic.
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
    // If the model isn't available to this account, list what is, so the CI
    // log tells us exactly which id to put in the XAI_MODEL secret/var.
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
    items: parsed.items ?? [],
    issueTitle: typeof parsed.issueTitle === "string" ? parsed.issueTitle.trim() : "",
    issueBlurb: typeof parsed.issueBlurb === "string" ? parsed.issueBlurb.trim() : "",
  };
}

async function main() {
  if (!API_KEY) {
    throw new Error("XAI_API_KEY is not set. Add it as a GitHub Actions secret.");
  }

  const data = await loadReadingData();
  const existingUrls = new Set(data.items.map((item) => item.url));

  const { items: candidates, issueTitle, issueBlurb } = await curateNewItems([
    ...existingUrls,
  ]);
  const today = new Date().toISOString().slice(0, 10);

  const fresh = candidates
    .filter((item) => item.url && !existingUrls.has(item.url))
    .map((item) => ({
      id: `${slugify(item.title)}-${today}`,
      title: item.title,
      authors: item.authors,
      source: item.source,
      url: item.url,
      type: item.type,
      dateAdded: today,
      summary: item.summary,
      tags: item.tags,
    }));

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

  // Each run publishes one dated issue. Re-running on the same day replaces
  // that day's heading rather than filing a duplicate.
  const issues = [
    { date: today, title: issueTitle, blurb: issueBlurb },
    ...(data.issues ?? []).filter((issue) => issue.date !== today),
  ];

  // Drop headings whose items have all aged out of the trimmed list.
  const liveDates = new Set(items.map((item) => item.dateAdded));
  const next = {
    lastUpdated: today,
    issues: issues.filter((issue) => liveDates.has(issue.date)),
    items,
  };

  await writeFile(DATA_PATH, JSON.stringify(next, null, 2) + "\n", "utf-8");
  console.log(
    `Issue ${today}${issueTitle ? ` · ${issueTitle}` : ""}: added ${fresh.length} item(s): ` +
      fresh.map((i) => i.title).join(", ")
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
