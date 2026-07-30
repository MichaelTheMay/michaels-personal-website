import projects from "@/data/projects.json";
import { timelineIntro, interstitials, philosophy } from "@/lib/config";
import { Reveal } from "@/components/Reveal";
import { TimelineBeam } from "@/components/TimelineBeam";

type ProjectLinks = {
  project?: string;
  github?: string;
  youtube?: string;
};

type Project = {
  slug: string;
  group: string;
  date: string;
  title: string;
  description: string;
  image: string;
  /** Optional looping demo. When set, the card plays this instead of `image`
      (poster falls back to `image`) and uses a wider, full-bleed layout so
      fine detail like a terminal recording is legible. */
  video?: { mp4: string; webm?: string; caption?: string };
  badge?: string;
  stars?: string;
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

function ProjectCard({ project }: { project: Project }) {
  const links = project.links ?? {};
  const primary = links.project;
  const href = primary || links.github || "#";
  const hasVideo = Boolean(project.video);

  const details = (
    <div>
      <div className="flex flex-wrap items-center gap-2">
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
      <p
        className={`mt-3 leading-relaxed text-muted ${hasVideo ? "max-w-2xl" : "max-w-md"}`}
      >
        {project.description}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
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
        {links.github && (
          <a
            href={links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-sm text-muted transition-colors hover:border-accent/40 hover:bg-surface-hover hover:text-foreground"
          >
            <GitHubMark />
            GitHub
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
        </div>
      </div>
    </div>
  );

  return (
    <article className="relative pl-8 md:pl-[108px]">
      <span className="timeline-dot" aria-hidden />

      {/* In the left gutter next to the rail on desktop, inline above the
          title on mobile where there is no room for a gutter. */}
      <p className="font-mono text-xs leading-4 text-muted md:absolute md:left-0 md:top-1 md:w-16 md:text-right">
        {project.date}
      </p>

      {hasVideo && project.video ? (
        // Wide layout: text on top, the demo full-bleed below so it's large
        // enough to read.
        <div className="mt-1 md:mt-0">
          {details}
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="video-frame group mt-6 block overflow-hidden rounded-xl"
          >
            <video
              className="aspect-video w-full bg-[#0e0e11] object-cover transition-transform duration-500 group-hover:scale-[1.015]"
              poster={project.image}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-label={`${project.title} demo`}
            >
              {project.video.webm && (
                <source src={project.video.webm} type="video/webm" />
              )}
              <source src={project.video.mp4} type="video/mp4" />
            </video>
          </a>
          {project.video.caption && (
            <p className="mt-3 flex items-center gap-2 font-mono text-xs text-muted">
              <span className="live-dot" aria-hidden />
              {project.video.caption}
            </p>
          )}
        </div>
      ) : (
        <div className="mt-1 grid grid-cols-1 gap-6 md:mt-0 md:grid-cols-[1fr_1.05fr] md:items-start md:gap-8">
          {details}
          <a
            href={href}
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
      )}
    </article>
  );
}

function PhilosophyBand() {
  return (
    <Reveal>
      <div className="relative py-6 pl-8 md:pl-[108px]">
        <span
          className="absolute left-[calc(var(--rail-x)-6px)] top-8 h-[13px] w-[13px] rotate-45 rounded-[3px] border border-accent/70 bg-background"
          aria-hidden
        />
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">
          {philosophy.label}
        </p>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-foreground/90">
          {philosophy.body}
        </p>
      </div>
    </Reveal>
  );
}

export function ProjectTimeline() {
  const items = projects as Project[];

  // Build a flat render list, inserting an interstitial before each new group.
  const seen = new Set<string>();
  const rendered: React.ReactNode[] = [];

  // The philosophy band drops in right after the last flagship project, so it
  // renders whether or not any non-flagship groups follow.
  const lastFlagship = items.reduce(
    (last, project, i) => (project.group === "flagship" ? i : last),
    -1
  );

  items.forEach((project, i) => {
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
    if (i === lastFlagship) {
      rendered.push(<PhilosophyBand key="philosophy" />);
    }
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

      <TimelineBeam>
        <div className="mt-12 space-y-14">{rendered}</div>
      </TimelineBeam>
    </section>
  );
}
