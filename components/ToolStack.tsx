import tools from "@/data/tools.json";
import { toolStack } from "@/lib/config";
import { Reveal } from "@/components/Reveal";

type Tool = {
  slug: string;
  title: string;
  stars: string;
  href: string;
  blurb: string;
  image: string;
  imageAlt: string;
};

// Positioning for the three-card fan: left card dips and tilts left, the
// middle sits upright and raised in front, the right card mirrors the left.
// Cards straighten and lift on hover.
const FAN = [
  "z-10 origin-bottom-right rotate-[-8deg] translate-y-6 sm:-mr-10 hover:rotate-[-4deg] hover:-translate-y-1",
  "z-20 -translate-y-2 hover:-translate-y-4",
  "z-10 origin-bottom-left rotate-[8deg] translate-y-6 sm:-ml-10 hover:rotate-[4deg] hover:-translate-y-1",
];

function ToolCard({ tool, fan }: { tool: Tool; fan: string }) {
  const isCenter = fan.includes("z-20");
  return (
    <a
      href={tool.href}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative block w-52 shrink-0 transition-transform duration-500 ease-out sm:w-60 ${fan}`}
    >
      <div
        className={`aspect-[4/3] overflow-hidden rounded-xl border bg-[#0e0e11] shadow-2xl shadow-black/50 ${
          isCenter
            ? "border-accent/40 ring-1 ring-accent/20"
            : "border-border"
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={tool.image}
          alt={tool.imageAlt}
          width={900}
          height={675}
          loading="lazy"
          className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
      {/* Title + stars overlapping the bottom edge, like the reference fan. */}
      <div className="absolute -bottom-3 left-4 flex items-center gap-2 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
        <span className="text-base font-semibold text-foreground">{tool.title}</span>
        <span className="font-mono text-[11px] text-muted">★ {tool.stars}</span>
      </div>
    </a>
  );
}

// Inline repo link used inside the combined explanation paragraph.
function RepoLink({ tool }: { tool?: Tool }) {
  if (!tool) return null;
  return (
    <a
      href={tool.href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-foreground underline decoration-border underline-offset-2 transition-colors hover:text-accent hover:decoration-accent"
    >
      {tool.title}
    </a>
  );
}

export function ToolStack() {
  const items = tools as Tool[];
  const bySlug = (slug: string) => items.find((t) => t.slug === slug);

  return (
    <section className="mx-auto max-w-4xl px-6 py-12">
      <Reveal className="text-center">
        <h2 className="text-xl font-medium leading-snug sm:text-2xl">
          {toolStack.caption}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-muted">{toolStack.subhead}</p>
      </Reveal>

      <Reveal className="mt-14 sm:mt-20">
        <div className="flex flex-col items-center gap-10 sm:flex-row sm:justify-center sm:gap-0 sm:[perspective:1200px]">
          {items.map((tool, i) => (
            <ToolCard key={tool.slug} tool={tool} fan={FAN[i] ?? FAN[1]} />
          ))}
        </div>
      </Reveal>

      {/* One paragraph covering all three, with amux explained in more depth. */}
      <Reveal className="mt-16 text-center sm:mt-24">
        <p className="mx-auto max-w-2xl text-sm leading-relaxed text-muted">
          The one I lean on hardest is <RepoLink tool={bySlug("amux")} /> — an
          open-source control plane for coding agents that I run as a modified
          fork. It spins up and supervises dozens of parallel Claude Code and
          Codex sessions, each on its own branch, and surfaces them as a live
          board of sessions, tasks, and progress. Because it's web-based, I can
          kick off a run, watch every agent work, and steer or merge them
          straight from my phone — so a batch of work keeps moving whether I'm at
          my desk or not. Every session also writes to{" "}
          <a
            href="https://mycelicmemory.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground underline decoration-border underline-offset-2 transition-colors hover:text-accent hover:decoration-accent"
          >
            MycelicMemory
          </a>
          , my own MCP server that gives every agent local, persistent memory
          that survives across runs — no cloud, no leakage. Alongside those,{" "}
          <RepoLink tool={bySlug("backdoor")} /> lets me point Claude Code at any
          provider (DeepSeek, Groq, Ollama, OpenRouter) to route each task to
          whatever's cheapest or fastest, and{" "}
          <RepoLink tool={bySlug("agentflow")} /> wires agents and harnesses into
          a graph when a job needs real fan-out instead of a linear script.
        </p>
      </Reveal>
    </section>
  );
}
