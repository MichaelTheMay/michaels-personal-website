import readingData from "@/data/reading.json";
import { groupIssues, formatIssueDate } from "./reading-core.mjs";

export type ReadingItem = {
  id: string;
  title: string;
  authors: string;
  source: string;
  url: string;
  type: string;
  dateAdded: string;
  summary: string;
  tags: string[];
};

/** Optional per-day metadata written by the curation job. */
type StoredIssue = {
  date: string;
  title?: string;
  blurb?: string;
};

export type Issue = {
  date: string;
  /** 1-based, oldest issue is No. 1 so numbers never shift as days are added. */
  number: number;
  title: string;
  blurb?: string;
  items: ReadingItem[];
  topTags: string[];
};

const data = readingData as {
  lastUpdated: string;
  issues?: StoredIssue[];
  items: ReadingItem[];
};

export const lastUpdated = data.lastUpdated;

/** Grouping lives in reading-core.mjs so the newsletter job shares it exactly. */
export function getIssues(): Issue[] {
  return groupIssues(data) as Issue[];
}

export function getIssue(date: string): Issue | undefined {
  return getIssues().find((issue) => issue.date === date);
}

export { formatIssueDate };
