// Sends today's reading issue to the Resend audience as a broadcast.
//
// Runs from the GitHub Action right after the curation job commits and pushes,
// and shares issue grouping with the site via lib/reading-core.mjs so the email
// and the archive page always agree on titles and numbering.
//
//   node scripts/send-digest.mjs              # real broadcast to the audience
//   DRY_RUN=1 node scripts/send-digest.mjs    # print subject + HTML, send nothing
//   TEST_EMAIL=me@x.com node ...              # one-off send to a single address
//
// Env: RESEND_API_KEY, RESEND_AUDIENCE_ID (not needed for DRY_RUN).

import { readFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import {
  groupIssues,
  formatIssueDate,
  formatIssueNumber,
} from "../lib/reading-core.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const RESEND_API = "https://api.resend.com";
const SITE = "https://michaelmay.dev";
const FROM = "Michael May <digest@michaelmay.dev>";

const DRY_RUN = process.env.DRY_RUN === "1";
const TEST_EMAIL = process.env.TEST_EMAIL || "";

// How long to wait for the archive page to go live before sending anyway.
const DEPLOY_POLL_ATTEMPTS = 10;
const DEPLOY_POLL_INTERVAL_MS = 30_000;

const ACCENT = "#6b6cf0";
const INK = "#16171c";
const MUTED = "#5c6370";
const FAINT = "#8a8f98";
const RULE = "#e7e8ee";
const TYPE_COLORS = {
  tool: ACCENT,
  harness: ACCENT,
  repo: "#0369a1",
  release: "#b45309",
  article: "#b45309",
  paper: ACCENT,
  essay: "#b45309",
  scenario: "#047857",
};

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function renderItem(item, rank) {
  const color = TYPE_COLORS[item.type] || MUTED;
  const tags = (item.tags || []).join(" · ");
  const rankLabel =
    rank !== undefined
      ? `<span style="font:600 11px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.16em;color:${ACCENT};">${String(rank).padStart(2, "0")}</span> &nbsp;·&nbsp; `
      : "";
  const returning = item.returning
    ? ` &nbsp;·&nbsp; <span style="color:${FAINT};">returning</span>`
    : "";
  const usecase = item.usecase
    ? `<div style="margin:12px 0 0;padding:0 0 0 12px;border-left:2px solid ${ACCENT};font:400 14px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:${INK};"><span style="display:block;font:600 10px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.16em;text-transform:uppercase;color:${ACCENT};margin:0 0 4px;">Use case</span>${escapeHtml(item.usecase)}</div>`
    : "";

  return `
      <tr><td style="padding:0 0 26px 0;">
        <div style="font:600 11px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.08em;text-transform:uppercase;color:${color};">
          ${rankLabel}${escapeHtml(item.type)}${returning} &nbsp;·&nbsp; <span style="color:${MUTED};">${escapeHtml(item.source)}</span>
        </div>
        <a href="${escapeHtml(item.url)}" style="display:block;margin:6px 0 0;font:600 17px/1.35 -apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:${INK};text-decoration:none;">${escapeHtml(item.title)}</a>
        ${item.authors ? `<div style="margin:4px 0 0;font:400 12px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;color:${FAINT};">${escapeHtml(item.authors)}</div>` : ""}
        <p style="margin:10px 0 0;font:400 14px/1.65 -apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:${MUTED};">${escapeHtml(item.summary)}</p>
        ${usecase}
        ${tags ? `<div style="margin:10px 0 0;font:400 11px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;color:${FAINT};">${escapeHtml(tags)}</div>` : ""}
      </td></tr>`;
}

function renderSection(kicker, title, rows) {
  if (!rows) return "";
  return `
      <tr><td style="padding:8px 0 18px;">
        <div style="font:600 10px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.2em;text-transform:uppercase;color:${ACCENT};">${escapeHtml(kicker)}</div>
        <div style="margin:4px 0 0;font:600 18px/1.3 -apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:${INK};">${escapeHtml(title)}</div>
      </td></tr>
      ${rows}`;
}

/** Table-based, inline-CSS, light background, the layout email clients render most reliably. */
function renderDigestHtml(issue) {
  const archive = `${SITE}/reading/${issue.date}`;
  const number = formatIssueNumber(issue.number);
  const legacy = issue.isLegacy;

  const toolRows = (issue.tools || []).map((item, i) => renderItem(item, i + 1)).join("");
  const headlineRows = (issue.headlines || []).map((item) => renderItem(item)).join("");
  const restRows = (issue.rest || []).map((item) => renderItem(item)).join("");
  const legacyRows = (issue.items || []).map((item) => renderItem(item)).join("");

  const body = legacy
    ? legacyRows
    : [
        renderSection("01 — Power tools", "The stack", toolRows),
        renderSection("02 — In the wild", "Articles and releases", headlineRows),
        restRows ? renderSection("Archive", "Also filed", restRows) : "",
      ].join("");

  const meta = legacy
    ? `${issue.items.length} ${issue.items.length === 1 ? "entry" : "entries"}`
    : `${(issue.tools || []).length} tools · ${(issue.headlines || []).length} headlines`;

  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f3f3f6;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f3f6;padding:28px 12px;">
<tr><td align="center">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid ${RULE};border-radius:18px;">
    <tr><td style="padding:32px 32px 8px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="width:72px;vertical-align:top;font:600 40px/1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:-0.04em;color:${ACCENT};">${number}</td>
          <td style="vertical-align:top;padding-left:8px;">
            <div style="font:600 11px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.18em;text-transform:uppercase;color:${ACCENT};">Issue ${number} &nbsp;·&nbsp; ~/reading</div>
            <h1 style="margin:8px 0 0;font:600 24px/1.28 -apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:${INK};">${escapeHtml(issue.title)}</h1>
            <div style="margin:6px 0 0;font:400 12px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;color:${FAINT};">${formatIssueDate(issue.date)} &nbsp;·&nbsp; ${meta}</div>
          </td>
        </tr>
      </table>
      ${issue.blurb ? `<p style="margin:18px 0 0;font:400 15px/1.65 -apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:${MUTED};">${escapeHtml(issue.blurb)}</p>` : ""}
    </td></tr>
    <tr><td style="padding:8px 32px 0;"><div style="border-top:1px solid ${RULE};"></div></td></tr>
    <tr><td style="padding:20px 32px 8px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${body}
      </table>
    </td></tr>
    <tr><td style="padding:8px 32px 28px;">
      <div style="border-top:1px solid ${RULE};padding-top:18px;font:400 12px/1.7 ui-monospace,SFMono-Regular,Menlo,monospace;color:${FAINT};">
        <a href="${archive}" style="color:${ACCENT};text-decoration:none;">Read this issue on the web</a> &nbsp;·&nbsp;
        <a href="${SITE}/rss.xml" style="color:${ACCENT};text-decoration:none;">RSS</a><br/>
        Five tools. Three headlines. One email. &nbsp;
        <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color:${FAINT};">Unsubscribe</a>
      </div>
    </td></tr>
  </table>
</td></tr>
</table>
</body></html>`;
}

async function resend(pathname, init = {}) {
  const res = await fetch(`${RESEND_API}${pathname}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = { raw: text };
  }
  if (!res.ok) {
    throw new Error(`Resend ${init.method || "GET"} ${pathname} -> ${res.status}: ${text}`);
  }
  return body;
}

/**
 * Check the credentials actually work. Run during rehearsals so an empty or
 * mistyped secret surfaces then, instead of at 13:00 UTC on the first real send.
 */
async function preflight() {
  const key = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;

  if (!key) {
    console.warn("[preflight] RESEND_API_KEY is missing or empty.");
    return false;
  }
  console.log(`[preflight] RESEND_API_KEY present (${key.length} chars).`);

  try {
    const res = await fetch(`${RESEND_API}/audiences`, {
      headers: { Authorization: `Bearer ${key}` },
    });
    if (!res.ok) {
      console.warn(`[preflight] auth check failed: ${res.status} ${await res.text()}`);
      return false;
    }
    const body = await res.json();
    const found = (body.data || []).some((a) => a.id === audienceId);
    console.log(
      `[preflight] auth OK · audience ${audienceId} ${found ? "found" : "NOT found in /audiences"}.`
    );
    return true;
  } catch (error) {
    console.warn(`[preflight] auth check errored: ${error}`);
    return false;
  }
}

/** The push may not have deployed yet; the known failure mode is a skipped webhook. */
async function waitForArchive(url) {
  for (let attempt = 1; attempt <= DEPLOY_POLL_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(url, { method: "HEAD" });
      if (res.ok) {
        console.log(`Archive page is live (attempt ${attempt}).`);
        return true;
      }
    } catch {
      // Network hiccup, just try again.
    }
    if (attempt < DEPLOY_POLL_ATTEMPTS) await sleep(DEPLOY_POLL_INTERVAL_MS);
  }
  console.warn(
    `WARNING: ${url} did not return 200 after ${DEPLOY_POLL_ATTEMPTS} attempts. ` +
      `Sending anyway; the email is self-contained, but check that the deploy landed.`
  );
  return false;
}

function applyVariant(issue, variantId) {
  if (!variantId) return { issue, label: "" };
  const pack = JSON.parse(
    readFileSync(path.join(ROOT, "data", "digest-variants.json"), "utf8")
  );
  const variant = pack.variants?.[variantId];
  if (!variant) throw new Error(`Unknown DIGEST_VARIANT "${variantId}"`);

  const today = issue.date;
  const tools = variant.tools.map((tool, i) => ({
    id: `${variantId}-tool-${i}`,
    dateAdded: today,
    returning: false,
    tags: tool.tags || [],
    ...tool,
  }));
  const headlines = (pack.headlines || []).map((item) => ({ ...item, dateAdded: today }));
  const items = [...tools, ...headlines];
  return {
    label: variant.label,
    algorithm: variant.algorithm,
    issue: {
      ...issue,
      title: variant.title,
      blurb: variant.blurb,
      items,
      tools,
      headlines,
      rest: [],
      isLegacy: false,
      topTags: tools.flatMap((t) => t.tags || []).slice(0, 4),
    },
  };
}

async function main() {
  const raw = await readFile(path.join(ROOT, "data", "reading.json"), "utf8");
  const issues = groupIssues(JSON.parse(raw));

  // DIGEST_DATE lets a rehearsal render a past issue; the cron always uses today.
  const today = process.env.DIGEST_DATE || new Date().toISOString().slice(0, 10);
  const found = issues.find((i) => i.date === today);
  if (!found) {
    console.log(`No issue dated ${today}, nothing to send.`);
    return;
  }

  const variantId = process.env.DIGEST_VARIANT || "";
  const { issue, label, algorithm } = applyVariant(found, variantId);
  const variantPrefix = label ? `[${label}] ` : "";
  const subject = `${variantPrefix}Issue ${formatIssueNumber(issue.number)} · ${issue.title}`;
  let html = renderDigestHtml(issue);
  if (algorithm) {
    html = html.replace(
      "</h1>",
      `</h1><div style="margin:8px 0 0;font:400 12px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;color:#8a8f98;">${algorithm}</div>`
    );
  }
  const broadcastName = variantId ? `digest-${issue.date}-${variantId}` : `digest-${issue.date}`;

  if (DRY_RUN) {
    console.log(`[dry run] subject: ${subject}`);
    console.log(`[dry run] name: ${broadcastName}`);
    console.log(`[dry run] items: ${issue.items.length}`);
    // Preflight the credentials too, so a rehearsal catches a missing or empty
    // secret rather than the first real send failing at 13:00 UTC.
    await preflight();
    console.log(html);
    return;
  }

  if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY is not set.");

  if (TEST_EMAIL) {
    // Bypasses the audience and the idempotency record so a real send can follow.
    const sent = await resend("/emails", {
      method: "POST",
      body: JSON.stringify({
        from: FROM,
        to: [TEST_EMAIL],
        subject: `[test] ${subject}`,
        html: html.replace("{{{RESEND_UNSUBSCRIBE_URL}}}", `${SITE}/reading`),
      }),
    });
    console.log(`Test email sent to ${TEST_EMAIL} (id ${sent.id}).`);
    return;
  }

  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!audienceId) throw new Error("RESEND_AUDIENCE_ID is not set.");

  // Resend's own broadcast list is the record of what already went out, so a
  // re-run of the workflow can never double-send.
  const existing = await resend("/broadcasts");
  const already = (existing.data || []).find((b) => b.name === broadcastName);
  if (already) {
    console.log(`Broadcast ${broadcastName} already exists (${already.id}), skipping.`);
    return;
  }

  await waitForArchive(`${SITE}/reading/${issue.date}`);

  const created = await resend("/broadcasts", {
    method: "POST",
    body: JSON.stringify({
      audience_id: audienceId,
      from: FROM,
      subject,
      name: broadcastName,
      html,
    }),
  });

  await resend(`/broadcasts/${created.id}/send`, { method: "POST" });
  console.log(`Sent broadcast ${broadcastName} (${created.id}): ${subject}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
