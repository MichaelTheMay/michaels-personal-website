import { getIssues, lastUpdated, formatIssueDate, formatIssueNumber } from "@/lib/reading";
import { siteConfig } from "@/lib/config";

// reading.json is a build-time import and every curation run redeploys the
// site, so a static feed is regenerated exactly when there is news.
export const dynamic = "force-static";

const SITE = "https://michaelmay.dev";
const FEED = `${SITE}/rss.xml`;

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** The curation job publishes at 13:00 UTC; dates in the data are day-only. */
function pubDate(date: string) {
  return new Date(`${date}T13:00:00Z`).toUTCString();
}

export async function GET() {
  const issues = getIssues();

  const items = issues
    .map((issue) => {
      const link = `${SITE}/reading/${issue.date}`;
      // Older issues predate stored blurbs, so fall back to a generated line.
      const description =
        issue.blurb ??
        `${issue.items.length} picks from ${formatIssueDate(issue.date)}: ${issue.topTags.join(", ")}.`;

      const listItem = (item: (typeof issue.items)[number]) =>
        `<li><a href="${escapeXml(item.url)}">${escapeXml(item.title)}</a>` +
        ` · <em>${escapeXml(item.type)} · ${escapeXml(item.source)}</em><br/>${escapeXml(item.summary)}` +
        `${item.usecase ? `<br/>${escapeXml(item.usecase)}` : ""}</li>`;

      const tools = issue.tools ?? [];
      const headlines = issue.headlines ?? [];
      const rest = issue.rest ?? [];

      const body = issue.isLegacy
        ? [
            issue.blurb ? `<p>${escapeXml(issue.blurb)}</p>` : "",
            "<ul>",
            ...issue.items.map(listItem),
            "</ul>",
            `<p><a href="${link}">Read the full issue</a></p>`,
          ].join("")
        : [
            issue.blurb ? `<p>${escapeXml(issue.blurb)}</p>` : "",
            "<p><strong>The stack</strong></p>",
            "<ul>",
            ...tools.map(listItem),
            "</ul>",
            "<p><strong>In the wild</strong></p>",
            "<ul>",
            ...headlines.map(listItem),
            "</ul>",
            rest.length
              ? `<p><strong>Also filed</strong></p><ul>${rest.map(listItem).join("")}</ul>`
              : "",
            `<p><a href="${link}">Read the full issue</a></p>`,
          ].join("");

      return `    <item>
      <title>${escapeXml(`Issue ${formatIssueNumber(issue.number)} · ${issue.title}`)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate(issue.date)}</pubDate>
      <description>${escapeXml(description)}</description>
      <content:encoded><![CDATA[${body}]]></content:encoded>
${issue.topTags.map((tag) => `      <category>${escapeXml(tag)}</category>`).join("\n")}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`${siteConfig.name} · Agentic Tools Digest`)}</title>
    <link>${SITE}/reading</link>
    <atom:link href="${FEED}" rel="self" type="application/rss+xml" />
    <description>A daily dispatch of the five most powerful agentic devtools, plus three articles or releases. Not research papers.</description>
    <language>en-us</language>
    <lastBuildDate>${pubDate(lastUpdated)}</lastBuildDate>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
