import education from "@/data/education.json";
import { Reveal } from "@/components/Reveal";

type Degree = {
  degree: string;
  institution: string;
  note: string;
  years: string;
};

export function Education() {
  const degrees = education as Degree[];

  return (
    <section className="mx-auto max-w-4xl px-6 py-12">
      <Reveal>
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted">
          Education
        </p>
      </Reveal>

      <div className="mt-6 space-y-4">
        {degrees.map((degree) => (
          <Reveal key={degree.degree}>
            <div className="flex flex-col gap-1 rounded-2xl border border-border bg-surface/40 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold">{degree.degree}</h3>
                <p className="text-sm text-muted">
                  {degree.institution} · {degree.note}
                </p>
              </div>
              <p className="font-mono text-xs text-muted">{degree.years}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
