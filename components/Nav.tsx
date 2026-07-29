import Link from "next/link";
import { siteConfig } from "@/lib/config";

export function Nav() {
  return (
    <div className="pointer-events-none sticky top-4 z-50 px-4">
      <nav className="pointer-events-auto mx-auto flex max-w-4xl items-center justify-between gap-4 rounded-2xl border border-border bg-surface/70 px-5 py-3 backdrop-blur-md">
        <Link
          href="/"
          className="font-mono text-sm text-muted transition-colors hover:text-foreground"
        >
          <span className="text-accent">~/</span>
          {siteConfig.handle}
        </Link>
        <div className="flex items-center gap-2 font-mono text-sm">
          <Link
            href="/reading"
            className="hidden rounded-lg px-3 py-1.5 text-muted transition-colors hover:bg-surface-hover hover:text-foreground sm:inline-block"
          >
            ~/reading
          </Link>
          <a
            href={`mailto:${siteConfig.email}`}
            className="rounded-lg border border-border bg-foreground px-4 py-1.5 font-medium text-background transition-opacity hover:opacity-90"
          >
            Contact
          </a>
        </div>
      </nav>
    </div>
  );
}
