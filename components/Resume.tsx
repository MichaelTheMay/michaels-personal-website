import { Reveal } from "@/components/Reveal";

// Source PDF lives in /public. The download filename is set via the `download`
// attribute so viewers save a cleanly named copy regardless of the URL.
const RESUME_SRC = "/michael_may_resume_2026.pdf";
const DOWNLOAD_NAME = "Michaels_Primary_Resume_2026.pdf";

function DownloadIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 20 20"
      fill="none"
      className="h-4 w-4"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 3v9" />
      <path d="m6 9 4 4 4-4" />
      <path d="M4 15.5h12" />
    </svg>
  );
}

export function Resume() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-12">
      <Reveal className="text-center">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted">
          Resume
        </p>
        <h2 className="mx-auto mt-4 max-w-2xl text-xl font-medium leading-snug sm:text-2xl">
          The one-page version, ready to download.
        </h2>
        <div className="mt-8">
          <a
            href={RESUME_SRC}
            download={DOWNLOAD_NAME}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            <DownloadIcon />
            Download resume
          </a>
        </div>
      </Reveal>
    </section>
  );
}
