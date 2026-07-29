import projects from "@/data/projects.json";
import { timelineIntro, interstitials, featuredLabel } from "@/lib/config";
import { Reveal } from "@/components/Reveal";

type ProjectLinks = {
  project?: string;
  github?: string;
  youtube?: string;
};

type ProjectStat = {
  label: string;
  value: string;
};

type Project = {
  slug: string;
  group: string;
  date: string;
  title: string;
  description: string;
  image: string;
  featured?: boolean;
  tagline?: string;
  badge?: string;
  stars?: string;
  stats?: ProjectStat[];
  stack?: string[];
  links?: ProjectLinks;
};

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.5 3.8 5.7 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.7-3.8-9S9.5 5.5 12 3Z" />
    </svg>
  );
}

function GitHubMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M12 .5a12 12 0 0 0-3.79 23.4c.6.1.82-.26.82-.58v-2c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5 1 .1-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.95 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.53.11-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.65 1.65.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.62-2.8 5.64-5.48 5.94.43.37.81 1.1.81 2.22v3.29c0 .32.22.69.83.57A12 12 0 0 0 12 .5Z" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function ProjectLinkRow({ links }: { links: ProjectLinks }) {
  return (
    <div className="flex items-center gap-3 text-muted">
      {links.youtube && (
        <a href={links.youtube} target="_blank" rel="noopener noreferrer" aria-label="Video" className="hover:text-foreground">
          <PlayIcon />
        </a>
      )}
      {links.github && (
        <a href={links.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="hover:text-foreground">
          <GitHubMark />
        </a>
      )}
    </div>
  );
}

/** "https://www.getlexie.ai/" -> "getlexie.ai" for link labels. */
function hostLabel(url: string) {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function FeaturedCard({ project }: { project: Project }) {
  const links = project.links ?? {};
  const href = links.project || links.github;

  return (
    <article className="featured-card overflow-hidden">
      <a
        href={href || "#"}
        target="_blank"
        rel="noopener noreferrer"
        className="group block overflow-hidden border-b border-border"
        tabIndex={-1}
        aria-hidden={Boolean(links.project)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={project.image}
          alt={`${project.title} — product screenshot`}
          width={1600}
          height={900}
          className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />
      </a>

      <div className="p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-accent-soft px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
            {featuredLabel}
          </span>
          <span className="font-mono text-xs text-muted">{project.date}</span>
        </div>

        <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h3 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {project.title}
          </h3>
          {project.tagline && (
            <p className="text-lg text-accent/90">{project.tagline}</p>
          )}
        </div>

        <p className="mt-4 max-w-2xl leading-relaxed text-muted">
          {project.description}
        </p>

        {project.stats && project.stats.length > 0 && (
          <dl className="mt-7 grid grid-cols-1 gap-x-8 gap-y-5 border-t border-border pt-6 sm:grid-cols-3">
            {project.stats.map((stat) => (
              <div key={stat.label}>
                <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                  {stat.label}
                </dt>
                <dd className="mt-1.5 font-medium text-foreground">{stat.value}</dd>
              </div>
            ))}
          </dl>
        )}

        {project.stack && project.stack.length > 0 && (
          <ul className="mt-6 flex flex-wrap gap-2">
            {project.stack.map((tech) => (
              <li
                key={tech}
                className="rounded-md border border-border bg-background px-2 py-1 font-mono text-[11px] text-muted"
              >
                {tech}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-7 flex flex-wrap items-center gap-4">
          {links.project && (
            <a
              href={links.project}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              {hostLabel(links.project)} <span aria-hidden>↗</span>
            </a>
          )}
          <ProjectLinkRow links={links} />
        </div>
      </div>
    </article>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const links = project.links ?? {};
  const primary = links.project;

  return (
    <article className="relative pl-8 md:pl-10">
      <span className="timeline-dot" aria-hidden />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_1.05fr] md:items-start md:gap-8">
        <div>
          <p className="font-mono text-xs text-muted">{project.date}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-semibold">{project.title}</h3>
            {project.badge && (
              <span className="rounded-full border border-accent/40 px-2.5 py-0.5 font-mono text-[11px] text-accent">
                {project.badge}
              </span>
            )}
            {project.stars && (
              <span className="font-mono text-xs text-muted">★ {project.stars}</span>
            )}
          </div>
          <p className="mt-3 max-w-md leading-relaxed text-muted">
            {project.description}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            {primary && (
              <a
                href={primary}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-foreground transition-colors hover:text-accent"
              >
                View project <span aria-hidden>↗</span>
              </a>
            )}
            <div className="flex items-center gap-3 text-muted">
              {links.project && !primary && (
                <a href={links.project} target="_blank" rel="noopener noreferrer" aria-label="Website" className="hover:text-foreground">
                  <GlobeIcon />
                </a>
              )}
              {links.youtube && (
                <a href={links.youtube} target="_blank" rel="noopener noreferrer" aria-label="Video" className="hover:text-foreground">
                  <PlayIcon />
                </a>
              )}
              {links.github && (
                <a href={links.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="hover:text-foreground">
                  <GitHubMark />
                </a>
              )}
            </div>
          </div>
        </div>

        <a
          href={primary || links.github || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="group block overflow-hidden rounded-xl border border-border bg-surface"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={project.image}
            alt={project.title}
            width={1280}
            height={720}
            className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </a>
      </div>
    </article>
  );
}

export function ProjectTimeline() {
  const items = projects as Project[];
  const featured = items.filter((p) => p.featured);
  const rest = items.filter((p) => !p.featured);

  // Build a flat render list, inserting an interstitial before each new group.
  const seen = new Set<string>();
  const rendered: React.ReactNode[] = [];

  rest.forEach((project, i) => {
    if (!seen.has(project.group)) {
      seen.add(project.group);
      const line = interstitials[project.group];
      if (line) {
        rendered.push(
          <Reveal key={`intro-${project.group}`}>
            <p className="py-6 text-center text-lg text-foreground/70">{line}</p>
          </Reveal>
        );
      }
    }
    rendered.push(
      <Reveal key={project.slug} delay={(i % 2) * 60}>
        <ProjectCard project={project} />
      </Reveal>
    );
  });

  return (
    <section className="mx-auto max-w-4xl px-6 py-12">
      <Reveal className="text-center">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted">
          {timelineIntro.caption}
        </p>
        <h2 className="mx-auto mt-4 max-w-2xl text-2xl font-medium leading-snug sm:text-3xl">
          {timelineIntro.headline}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted">{timelineIntro.subhead}</p>
      </Reveal>

      {featured.length > 0 && (
        <div className="mt-12 space-y-8">
          {featured.map((project) => (
            <Reveal key={project.slug}>
              <FeaturedCard project={project} />
            </Reveal>
          ))}
        </div>
      )}

      {rendered.length > 0 && (
        <div className="timeline-rail mt-16 space-y-14">{rendered}</div>
      )}
    </section>
  );
}
