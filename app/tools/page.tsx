import { getPowerTools, powerToolsLastUpdated } from "@/lib/power-tools";
import { PowerToolCard } from "@/components/PowerToolCard";
import { Reveal } from "@/components/Reveal";

export const metadata = {
  title: "Tools",
};

export default function ToolsPage() {
  const tools = getPowerTools();

  return (
    <div className="mx-auto max-w-6xl px-6 pt-24 pb-20 sm:pt-28">
      <Reveal>
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">
          ~/tools
        </p>
        <h1 className="mt-4 max-w-[16ch] text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
          Power-user tools log
        </h1>
        <p className="mt-4 max-w-[62ch] text-base leading-relaxed text-muted">
          A running catalog of agentic harnesses, runtimes, and repos the daily
          digest keeps finding. Deduped. No household CLIs. Each card is
          something you can clone and run.
        </p>
        <p className="mt-6 font-mono text-xs text-muted">
          <span className="text-accent">[auto-updating]</span> {tools.length}{" "}
          {tools.length === 1 ? "tool" : "tools"} · last updated{" "}
          {powerToolsLastUpdated}
        </p>
      </Reveal>

      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {tools.map((tool, i) => (
          <Reveal key={tool.url} delay={(i % 6) * 40}>
            <PowerToolCard tool={tool} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
