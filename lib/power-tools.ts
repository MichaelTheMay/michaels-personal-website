import catalog from "@/data/power-tools.json";

export type PowerTool = {
  slug: string;
  title: string;
  authors: string;
  source: string;
  url: string;
  type: string;
  summary: string;
  usecase?: string;
  tags: string[];
  firstSeen: string;
  lastSeen: string;
  algorithms: string[];
};

const data = catalog as {
  lastUpdated: string;
  count: number;
  tools: PowerTool[];
};

export const powerToolsLastUpdated = data.lastUpdated;

export function getPowerTools(): PowerTool[] {
  return data.tools;
}
