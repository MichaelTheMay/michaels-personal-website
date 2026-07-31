import Link from "next/link";
import { siteConfig, newsletter } from "@/lib/config";

export function Footer() {
  return (
    <footer className="mt-8 border-t border-border">
      <div className="mx-auto max-w-4xl px-6 py-10 text-center">
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 font-mono text-xs text-muted">
          <Link
            href="/reading"
            className="transition-colors hover:text-foreground"
          >
            ~/reading
          </Link>
          <a
            href={newsletter.feedPath}
            className="transition-colors hover:text-foreground"
          >
            {newsletter.rssLabel}
          </a>
          <a
            href={`mailto:${siteConfig.email}`}
            className="transition-colors hover:text-foreground"
          >
            Email
          </a>
        </div>
        <p className="mt-5 font-mono text-xs uppercase tracking-[0.25em] text-muted">
          {siteConfig.location ||
            `© ${new Date().getFullYear()} ${siteConfig.name}`}
        </p>
      </div>
    </footer>
  );
}
