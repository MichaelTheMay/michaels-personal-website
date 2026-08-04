import { getIssues, lastUpdated, formatIssueDate } from "@/lib/reading";
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

      const body = [
        issue.blurb ? `<p>${escapeXml(issue.blurb)}</p>` : "",
        "<ul>",
        ...issue.items.map(
          (item) =>
            `<li><a href="${escapeXml(item.url)}">${escapeXml(item.title)}</a>` +
            ` · <em>${escapeXml(item.source)}</em><br/>${escapeXml(item.summary)}</li>`
        ),
        "</ul>",
        `<p><a href="${link}">Read the full issue</a></p>`,
      ].join("");

      return `    <item>
      <title>${escapeXml(`No. ${String(issue.number).padStart(2, "0")} · ${issue.title}`)}</title>
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
    <title>${escapeXml(`${siteConfig.name} · Reading Digest`)}</title>
    <link>${SITE}/reading</link>
    <atom:link href="${FEED}" rel="self" type="application/rss+xml" />
    <description>A daily dispatch on AI research: the best new papers and essays, curated every morning.</description>
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
