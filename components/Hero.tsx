import { siteConfig } from "@/lib/config";
import { SocialIcons } from "@/components/SocialIcons";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="hero-glow" aria-hidden />
      <div className="relative mx-auto grid max-w-4xl grid-cols-1 items-center gap-10 px-6 pb-16 pt-24 sm:pt-32 md:grid-cols-[1fr_auto] md:gap-14">
        <div>
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            {siteConfig.name}
          </h1>
          <p className="mt-3 font-mono text-sm uppercase tracking-[0.2em] text-muted">
            {siteConfig.role}
          </p>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-foreground/85">
            {siteConfig.bio}
          </p>
          <div className="mt-8">
            <SocialIcons />
          </div>
        </div>

        <div className="justify-self-center md:justify-self-end">
          <div className="headshot-frame">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={siteConfig.headshot}
              alt={siteConfig.name}
              width={288}
              height={346}
              className="h-auto w-[220px] rounded-2xl sm:w-[288px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
