import { Hero } from "@/components/Hero";
import { ProjectTimeline } from "@/components/ProjectTimeline";
import { ToolStack } from "@/components/ToolStack";
import { Experience } from "@/components/Experience";
import { Education } from "@/components/Education";

export default function Home() {
  return (
    <>
      <Hero />
      <div className="section-divider" />
      <ProjectTimeline />
      <div className="section-divider" />
      <ToolStack />
      <div className="section-divider" />
      <Experience />
      <div className="section-divider" />
      <Education />
    </>
  );
}
