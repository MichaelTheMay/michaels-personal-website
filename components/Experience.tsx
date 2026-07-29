import experience from "@/data/experience.json";
import { Reveal } from "@/components/Reveal";

type Role = {
  company: string;
  role: string;
  start: string;
  end: string;
  current?: boolean;
};

export function Experience() {
  const roles = experience as Role[];

  return (
    <section className="mx-auto max-w-4xl px-6 py-12">
      <Reveal>
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted">
          Experience
        </p>
        <h2 className="mt-4 max-w-2xl text-2xl font-medium leading-snug">
          A few years of building and shipping.
        </h2>
      </Reveal>

      <div className="mt-8 divide-y divide-border rounded-2xl border border-border bg-surface/40">
        {roles.map((role) => (
          <Reveal key={`${role.company}-${role.start}`}>
            <div className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{role.company}</h3>
                  {role.current && (
                    <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 font-mono text-[11px] text-emerald-400">
                      Current
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted">{role.role}</p>
              </div>
              <p className="font-mono text-xs text-muted">
                {role.start} – {role.end}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
