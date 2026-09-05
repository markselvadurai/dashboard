export type PatternStatus = "Untouched" | "Learning" | "Shaky" | "Solid";
export type Verdict = "Clean" | "Slow" | "Hints" | "Fail";

export interface PatternConfidence {
  pattern: string;
  week: string; // "0–1", "2", "Nov"
  status: PatternStatus;
  lastTouched: string; // "Sep 2" or "—"
  notes: string;
}

export interface Rep {
  /** e.g. "Sep 5" */
  date: string;
  state: "pending" | "done" | "missed";
}

export interface MistakeLogEntry {
  date: string;
  problem: string;
  pattern: string;
  verdict: Verdict;
  takeaway: string;
  reps: Rep[]; // empty when the cell is "—"
  rawRepsCell: string;
}

export interface QuizLogEntry {
  date: string;
  quiz: string;
  score: string;
  outcome: string;
}

export interface CheckpointRow {
  num: string;
  date: string;
  bar: string;
  result: string; // "—" until recorded
}

export interface RoadmapWeek {
  week: string; // "0".."8", "9+"
  dates: string; // "Sep 1–6"
  topics: string;
  newProblems: string;
  milestone: string;
  /** resolved date range */
  start: Date;
  end: Date;
}

export interface GearBlock {
  slot: string;
  time: string;
  what: string;
}

export interface ReadingLogEntry {
  date: string;
  essay: string;
  week: string;
}

export interface Ledger {
  patterns: PatternConfidence[];
  mistakeLog: MistakeLogEntry[];
  quizLog: QuizLogEntry[];
  checkpoints: CheckpointRow[];
  openDecisions: string[];
  readingLog: ReadingLogEntry[];
}

export interface WorklistItem {
  week: string; // "0".."8"
  /** diagnostic = W0 cold baseline probe (re-appears as `problem` in its home week) */
  kind: "problem" | "reading" | "diagnostic";
  item: string;
  pattern: string; // "—" for readings
  /** essay URL, when the plan.md cell is a markdown link */
  link?: string;
}

export interface PlanData {
  roadmap: RoadmapWeek[];
  gear1: GearBlock[];
  gear2: GearBlock[];
  worklist: WorklistItem[];
}
