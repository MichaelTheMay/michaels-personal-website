// Central place to edit your identity/links. Update these with your real info.
export const siteConfig = {
  name: "Michael May",
  handle: "mm",
  role: "AI Engineer",
  // Short bio shown in the hero. Keep it to 2-3 lines. Replace with your own.
  bio: "Builder at heart. I design and ship AI systems — agents, LLM tooling, and the infrastructure that makes them reliable in production.",
  location: "City, Country",
  email: "you@example.com",
  headshot: "/headshot-placeholder.svg",
  links: {
    github: "https://github.com/MichaelTheMay",
    x: "https://x.com/your-handle",
    linkedin: "https://linkedin.com/in/your-handle",
    youtube: "https://youtube.com/@your-handle",
  },
};

// Narrative lines shown between groups of projects on the home page (like the
// interstitial sentences on the reference site). Placeholder copy — replace.
export const timelineIntro = {
  caption: "WHAT I'VE SHIPPED IN 2026...",
  headline: "Lately, I've been obsessed with building AI systems that actually ship.",
  subhead:
    "Placeholder line. Replace this with a sentence about the theme running through your recent work.",
};

// Interstitial sentences keyed to a project group. Placeholder copy.
export const interstitials: Record<string, string> = {
  agents: "And of course, like everybody else — falling for autonomous agents.",
  tooling: "I believe the most valuable skill right now is orchestrating AI well.",
  infra: "With AI, I fell in love with building things again, and shipped a bunch...",
};
