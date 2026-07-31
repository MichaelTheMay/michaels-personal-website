import experience from "@/data/experience.json";
import { Reveal } from "@/components/Reveal";

type Role = {
  company: string;
  role: string;
  meta?: string;
  logo?: string;
  start: string;
  end: string;
  current?: boolean;
};

// Company logo on a white tile (object-contain so any logo shape fits), with a
// monogram fallback for companies we don't have a logo for.
function CompanyIcon({ company, logo }: { company: string; logo?: string }) {
  if (logo) {
    return (
      <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-white p-1.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logo}
          alt={`${company} logo`}
          width={40}
          height={40}
          className="h-full w-full object-contain"
        />
      </span>
    );
  }
  const initial = company.trim().charAt(0).toUpperCase();
  return (
    <span
      aria-hidden
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-accent/25 bg-accent-soft font-mono text-base font-semibold text-accent"
    >
      {initial}
    </span>
  );
}

export function Experience() {
  const roles = experience as Role[];

  return (
    <section className="mx-auto max-w-4xl px-6 py-12">
      <Reveal>
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted">
          Experience
        </p>
        <h2 className="mt-4 max-w-2xl text-2xl font-medium leading-snug">
          Where I&apos;ve engineered and shipped.
        </h2>
      </Reveal>

      <div className="mt-8 divide-y divide-border rounded-2xl border border-border bg-surface/40">
        {roles.map((role) => (
          <Reveal key={`${role.company}-${role.start}`}>
            <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="flex items-center gap-4">
                <CompanyIcon company={role.company} logo={role.logo} />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{role.role}</h3>
                    {role.current && (
                      <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 font-mono text-[11px] text-emerald-400">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted">
                    {role.company}
                    {role.meta ? ` · ${role.meta}` : ""}
                  </p>
                </div>
              </div>
              <p className="font-mono text-xs text-muted sm:text-right">
                {role.start && role.end ? `${role.start} – ${role.end}` : ""}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
