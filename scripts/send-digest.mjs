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
import { fileURLToPath } from "node:url";
import path from "node:path";
import { groupIssues, formatIssueDate } from "../lib/reading-core.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const RESEND_API = "https://api.resend.com";
const SITE = "https://michaelmay.dev";
const FROM = "Michael May <digest@michaelmay.dev>";

const DRY_RUN = process.env.DRY_RUN === "1";
const TEST_EMAIL = process.env.TEST_EMAIL || "";

// How long to wait for the archive page to go live before sending anyway.
const DEPLOY_POLL_ATTEMPTS = 10;
const DEPLOY_POLL_INTERVAL_MS = 30_000;

const ACCENT = "#8b8cf6";
const TYPE_COLORS = {
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

/** Table-based, inline-CSS, light background — the layout email clients render most reliably. */
function renderDigestHtml(issue) {
  const archive = `${SITE}/reading/${issue.date}`;
  const number = String(issue.number).padStart(2, "0");

  const items = issue.items
    .map((item) => {
      const color = TYPE_COLORS[item.type] || "#57606a";
      const tags = (item.tags || []).join(" · ");
      return `
      <tr><td style="padding:0 0 28px 0;">
        <div style="font:600 11px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.08em;text-transform:uppercase;color:${color};">
          ${escapeHtml(item.type)} &nbsp;·&nbsp; <span style="color:#57606a;">${escapeHtml(item.source)}</span>
        </div>
        <a href="${escapeHtml(item.url)}" style="display:block;margin:6px 0 0;font:600 17px/1.4 -apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#111318;text-decoration:none;">${escapeHtml(item.title)}</a>
        ${item.authors ? `<div style="margin:4px 0 0;font:400 12px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;color:#8a8f98;">${escapeHtml(item.authors)}</div>` : ""}
        <p style="margin:10px 0 0;font:400 14px/1.65 -apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#3d434d;">${escapeHtml(item.summary)}</p>
        ${tags ? `<div style="margin:10px 0 0;font:400 11px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;color:#8a8f98;">${escapeHtml(tags)}</div>` : ""}
      </td></tr>`;
    })
    .join("");

  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f6f6f8;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f6f8;padding:24px 12px;">
<tr><td align="center">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid #e5e6eb;border-radius:14px;padding:32px;">
    <tr><td>
      <div style="font:600 11px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.22em;text-transform:uppercase;color:${ACCENT};">~/reading &nbsp;·&nbsp; No. ${number}</div>
      <h1 style="margin:12px 0 0;font:600 24px/1.3 -apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#111318;">${escapeHtml(issue.title)}</h1>
      <div style="margin:6px 0 0;font:400 12px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;color:#8a8f98;">${formatIssueDate(issue.date)} &nbsp;·&nbsp; ${issue.items.length} ${issue.items.length === 1 ? "entry" : "entries"}</div>
      ${issue.blurb ? `<p style="margin:16px 0 0;font:400 15px/1.65 -apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#3d434d;">${escapeHtml(issue.blurb)}</p>` : ""}
      <hr style="border:none;border-top:1px solid #e5e6eb;margin:24px 0;" />
    </td></tr>
    ${items}
    <tr><td style="border-top:1px solid #e5e6eb;padding-top:20px;">
      <div style="font:400 12px/1.7 ui-monospace,SFMono-Regular,Menlo,monospace;color:#8a8f98;">
        <a href="${archive}" style="color:${ACCENT};text-decoration:none;">Read this issue on the web</a> &nbsp;·&nbsp;
        <a href="${SITE}/rss.xml" style="color:${ACCENT};text-decoration:none;">RSS</a><br/>
        Curated daily by an agentic pipeline. &nbsp;
        <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color:#8a8f98;">Unsubscribe</a>
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
      // Network hiccup — just try again.
    }
    if (attempt < DEPLOY_POLL_ATTEMPTS) await sleep(DEPLOY_POLL_INTERVAL_MS);
  }
  console.warn(
    `WARNING: ${url} did not return 200 after ${DEPLOY_POLL_ATTEMPTS} attempts. ` +
      `Sending anyway — the email is self-contained, but check that the deploy landed.`
  );
  return false;
}

async function main() {
  const raw = await readFile(path.join(ROOT, "data", "reading.json"), "utf8");
  const issues = groupIssues(JSON.parse(raw));

  // DIGEST_DATE lets a rehearsal render a past issue; the cron always uses today.
  const today = process.env.DIGEST_DATE || new Date().toISOString().slice(0, 10);
  const issue = issues.find((i) => i.date === today);
  if (!issue) {
    console.log(`No issue dated ${today} — nothing to send.`);
    return;
  }

  const subject = `Reading Digest No. ${String(issue.number).padStart(2, "0")} — ${issue.title}`;
  const html = renderDigestHtml(issue);
  const broadcastName = `digest-${issue.date}`;

  if (DRY_RUN) {
    console.log(`[dry run] subject: ${subject}`);
    console.log(`[dry run] name: ${broadcastName}`);
    console.log(`[dry run] items: ${issue.items.length}`);
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
    console.log(`Broadcast ${broadcastName} already exists (${already.id}) — skipping.`);
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
