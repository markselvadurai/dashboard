import type {
  Ledger,
  PlanData,
  PatternConfidence,
  PatternStatus,
  MistakeLogEntry,
  Rep,
  Verdict,
  RoadmapWeek,
} from "./types";
import { parseDateRange } from "./dates";

// ---------- generic markdown-table extraction (mirrors ledger-plugin.ts) ----------

function splitRow(line: string): string[] {
  return line
    .replace(/^\s*\|/, "")
    .replace(/\|\s*$/, "")
    .split("|")
    .map((c) => c.trim());
}

const isTableLine = (l: string) => /^\s*\|.*\|\s*$/.test(l);
const isSeparatorLine = (l: string) => /^\s*\|[\s:|-]+\|\s*$/.test(l);

export function tableInSection(content: string, sectionMatch: string): string[][] {
  const lines = content.split("\n");
  let headingIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^#{2,3}\s/.test(lines[i]) && lines[i].includes(sectionMatch)) {
      headingIdx = i;
      break;
    }
  }
  if (headingIdx === -1) return [];
  for (let i = headingIdx + 1; i < lines.length; i++) {
    if (/^#{2,3}\s/.test(lines[i])) return [];
    if (isTableLine(lines[i]) && i + 1 < lines.length && isSeparatorLine(lines[i + 1])) {
      const rows: string[][] = [];
      let j = i + 2;
      while (j < lines.length && isTableLine(lines[j]) && !isSeparatorLine(lines[j])) {
        rows.push(splitRow(lines[j]));
        j++;
      }
      return rows;
    }
  }
  return [];
}

const unbold = (s: string) => s.replace(/\*\*/g, "").trim();

// ---------- progress.md ----------

export function parseRepsCell(cell: string): Rep[] {
  const c = cell.trim();
  if (!c || c === "—" || c === "-") return [];
  return c
    .split("·")
    .map((tok) => tok.trim())
    .filter(Boolean)
    .map((tok) => {
      const done = tok.includes("✅");
      const missed = tok.includes("❌");
      const date = tok.replace(/[✅❌]/g, "").trim();
      return { date, state: done ? "done" : missed ? "missed" : "pending" } as Rep;
    });
}

export function serializeReps(reps: Rep[]): string {
  if (reps.length === 0) return "—";
  return reps
    .map((r) => (r.state === "done" ? `${r.date} ✅` : r.state === "missed" ? `${r.date} ❌` : r.date))
    .join(" · ");
}

export function parseProgress(content: string): Ledger {
  const patterns: PatternConfidence[] = tableInSection(content, "Pattern Confidence").map((c) => ({
    pattern: unbold(c[0] ?? ""),
    week: c[1] ?? "",
    status: (unbold(c[2] ?? "Untouched") || "Untouched") as PatternStatus,
    lastTouched: c[3] ?? "—",
    notes: c[4] ?? "",
  }));

  const mistakeLog: MistakeLogEntry[] = tableInSection(content, "Mistake Log").map((c) => ({
    date: c[0] ?? "",
    problem: c[1] ?? "",
    pattern: c[2] ?? "",
    verdict: (unbold(c[3] ?? "") || "Fail") as Verdict,
    takeaway: c[4] ?? "",
    reps: parseRepsCell(c[5] ?? ""),
    rawRepsCell: c[5] ?? "",
  }));

  const quizLog = tableInSection(content, "Quiz Log").map((c) => ({
    date: c[0] ?? "",
    quiz: c[1] ?? "",
    score: c[2] ?? "",
    outcome: c[3] ?? "",
  }));

  const checkpoints = tableInSection(content, "Checkpoints").map((c) => ({
    num: c[0] ?? "",
    date: c[1] ?? "",
    bar: c[2] ?? "",
    result: c[3] ?? "—",
  }));

  // §5 Open Decisions — bullet lines after the heading
  const openDecisions: string[] = [];
  const lines = content.split("\n");
  const odIdx = lines.findIndex((l) => /^##\s/.test(l) && l.includes("Open Decisions"));
  if (odIdx !== -1) {
    for (let i = odIdx + 1; i < lines.length && !/^##\s/.test(lines[i]); i++) {
      const m = /^\s*-\s+(.*)$/.exec(lines[i]);
      if (m) openDecisions.push(m[1]);
    }
  }

  return { patterns, mistakeLog, quizLog, checkpoints, openDecisions };
}

// ---------- plan.md ----------

export function parsePlan(content: string): PlanData {
  const roadmap: RoadmapWeek[] = tableInSection(content, "Roadmap at a Glance")
    .map((c) => {
      const range = parseDateRange(c[1] ?? "");
      return {
        week: c[0] ?? "",
        dates: c[1] ?? "",
        topics: c[2] ?? "",
        newProblems: c[3] ?? "",
        milestone: unbold(c[4] ?? ""),
        start: range?.[0] ?? new Date(NaN),
        end: range?.[1] ?? new Date(NaN),
      };
    })
    .filter((w) => !Number.isNaN(w.start.getTime()));

  const gear1 = tableInSection(content, "Gear 1").map((c) => ({
    slot: c[0] ?? "",
    time: c[1] ?? "",
    what: unbold(c[2] ?? ""),
  }));
  const gear2 = tableInSection(content, "Gear 2").map((c) => ({
    slot: unbold(c[0] ?? ""),
    time: c[1] ?? "",
    what: (c[2] ?? "").replace(/\*/g, ""),
  }));

  return { roadmap, gear1, gear2 };
}
