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

// Positioning + sizing for the three-card fan. The fan stays on at every width:
// amux is the larger, raised center card; Backdoor and AgentFlow are smaller
// cards tilted off to each side. Widths and overlap scale up at sm+ so the
// compact mobile fan fits a phone without the cards or labels colliding.
const FAN = [
  "z-10 w-24 origin-bottom-right rotate-[-8deg] translate-y-4 -mr-5 sm:w-52 sm:translate-y-6 sm:-mr-10 sm:hover:rotate-[-4deg] sm:hover:-translate-y-1",
  "z-20 w-40 -translate-y-1 sm:w-60 sm:-translate-y-2 sm:hover:-translate-y-4",
  "z-10 w-24 origin-bottom-left rotate-[8deg] translate-y-4 -ml-5 sm:w-52 sm:translate-y-6 sm:-ml-10 sm:hover:rotate-[4deg] sm:hover:-translate-y-1",
];

function ToolCard({ tool, fan }: { tool: Tool; fan: string }) {
  const isCenter = fan.includes("z-20");
  return (
    <a
      href={tool.href}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative block shrink-0 transition-transform duration-500 ease-out ${fan}`}
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
      {/* Title + stars overlapping the bottom edge, like the reference fan.
          Shrinks on the compact mobile side cards, full size at sm+. */}
      <div className="absolute -bottom-2.5 left-2 flex items-center gap-1.5 whitespace-nowrap drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)] sm:-bottom-3 sm:left-4 sm:gap-2">
        <span className="text-[11px] font-semibold text-foreground sm:text-base">{tool.title}</span>
        <span className="font-mono text-[9px] text-muted sm:text-[11px]">★ {tool.stars}</span>
      </div>
    </a>
  );
}

// Inline link styling shared by every reference in the explanation paragraphs.
const LINK_CLASS =
  "font-medium text-foreground underline decoration-border underline-offset-2 transition-colors hover:text-accent hover:decoration-accent";

function ExtLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
      {children}
    </a>
  );
}

// Inline repo link used inside the combined explanation paragraph.
function RepoLink({ tool }: { tool?: Tool }) {
  if (!tool) return null;
  return <ExtLink href={tool.href}>{tool.title}</ExtLink>;
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
        <div className="flex items-center justify-center [perspective:1200px]">
          {items.map((tool, i) => (
            <ToolCard key={tool.slug} tool={tool} fan={FAN[i] ?? FAN[1]} />
          ))}
        </div>
      </Reveal>

      {/* The day-to-day loop: harness + terminal, then the two tools I still
          reach past it for, then how models get routed. */}
      <Reveal className="mt-16 text-center sm:mt-24">
        <p className="mx-auto max-w-2xl text-sm leading-relaxed text-muted">
          The one I lean on hardest is <RepoLink tool={bySlug("amux")} />, an
          open-source control plane I run as a modified fork with{" "}
          <ExtLink href="https://claude.com/claude-code">Claude Code</ExtLink> as
          its base. It supervises dozens of parallel Claude Code and Codex
          sessions, all of it inside{" "}
          <ExtLink href="https://github.com/tmux/tmux">tmux</ExtLink>. Sessions
          outlive a dropped connection or a closed laptop, panes split so I can
          watch several agents at once, and I can detach and reattach from my
          phone to check a run or merge a branch. Every session writes to{" "}
          <ExtLink href="https://mycelicmemory.com">MycelicMemory</ExtLink>, my
          own MCP server for local, persistent memory across runs.
        </p>

        <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-muted">
          Anything large used to go through{" "}
          <ExtLink href="https://github.com/MichaelTheMay/parallely">
            Parallely
          </ExtLink>
          , which I built and ran constantly to keep big jobs parallelized across
          separate worktrees. I still reach for it sometimes, but Claude
          Code&apos;s recently released ultracode does most of that natively now,
          which has made it more or less obsolete.
        </p>

        <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-muted">
          When a job needs massive parallelism, I use{" "}
          <RepoLink tool={bySlug("agentflow")} />. It wires agents into a graph
          and runs thousands of them programmatically, which is the right shape
          for work too wide to hold in a single session.
        </p>

        <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-muted">
          Model choice follows the same discipline every time. I start on the most
          capable frontier model I have access to, Fable 5 as of writing this on
          July 29th, and once the hard part is settled I route the rest through{" "}
          <RepoLink tool={bySlug("backdoor")} /> to something significantly
          cheaper: usually DeepSeek, more recently Kimi K3.
        </p>

        <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-muted">
          For browser work my go-to is{" "}
          <ExtLink href="https://github.com/vercel-labs/agent-browser">
            agent-browser
          </ExtLink>{" "}
          (Vercel Labs), the base for all my headless browser agents. Its plugin
          system lets them work through real user-auth flows and, where a
          site&apos;s terms allow, captchas.
        </p>
      </Reveal>
    </section>
  );
}
