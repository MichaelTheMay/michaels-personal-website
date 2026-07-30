import { siteConfig } from "@/lib/config";

export function Footer() {
  return (
    <footer className="mt-8 border-t border-border">
      <div className="mx-auto max-w-4xl px-6 py-10 text-center font-mono text-xs uppercase tracking-[0.25em] text-muted">
        {siteConfig.location || `© ${new Date().getFullYear()} ${siteConfig.name}`}
      </div>
    </footer>
  );
}
