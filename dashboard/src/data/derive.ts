import type { Ledger, MistakeLogEntry, PatternStatus, PlanData, RoadmapWeek, Verdict } from "./types";
import { parseShortDate, formatShortDate, addDays, daysBetween, sameDay, ARC_START, ARC_END } from "./dates";

export function currentWeek(plan: PlanData, day: Date): RoadmapWeek | undefined {
  return plan.roadmap.find((w) => day >= w.start && day <= w.end);
}

/* ─── reps due (the 1–3–7 queue) ─── */

export interface DueRep {
  entry: MistakeLogEntry;
  entryIndex: number;
  repIndex: number;
  date: string;
  overdueDays: number;
}

/** First pending rep per mistake-log entry whose date is on or before `day`. */
export function dueReps(ledger: Ledger, day: Date): DueRep[] {
  const out: DueRep[] = [];
  ledger.mistakeLog.forEach((entry, entryIndex) => {
    const repIndex = entry.reps.findIndex((r) => r.state === "pending");
    if (repIndex === -1) return;
    const d = parseShortDate(entry.reps[repIndex].date);
    if (!d || d.getTime() > day.getTime()) return;
    out.push({ entry, entryIndex, repIndex, date: entry.reps[repIndex].date, overdueDays: daysBetween(d, day) });
  });
  return out.sort((a, b) => b.overdueDays - a.overdueDays);
}

/* ─── studied days: logged activity (≤ today) ∪ punched-in days ─── */

export function studiedDays(ledger: Ledger, punched: ReadonlySet<string>, today: Date): Set<string> {
  const set = new Set<string>(punched);
  const clampAdd = (dateStr: string) => {
    const d = parseShortDate(dateStr);
    if (d && d.getTime() <= today.getTime()) set.add(formatShortDate(d));
  };
  for (const e of ledger.mistakeLog) {
    if (e.date) clampAdd(e.date);
    for (const r of e.reps) if (r.state === "done") clampAdd(r.date);
  }
  for (const q of ledger.quizLog) if (q.date) clampAdd(q.date);
  return set;
}

export function streakOf(studied: ReadonlySet<string>, today: Date): number {
  let n = 0;
  let cursor = today;
  if (!studied.has(formatShortDate(cursor))) cursor = addDays(cursor, -1); // today may still be in progress
  while (studied.has(formatShortDate(cursor))) {
    n++;
    cursor = addDays(cursor, -1);
  }
  return n;
}

/* ─── the board: 62 tiles, 7 columns Mon→Sun, rows = weeks W0–W8 ─── */

export const GATE_LABELS = ["Sep 20", "Oct 4", "Oct 18", "Nov 1"];

export interface BoardDay {
  i: number; // 1-based day number, Sep 1 = 1 … Nov 1 = 62
  date: Date;
  label: string; // "Sep 2"
  gr: number; // grid row (week)
  gc: number; // grid column (Mon=1 … Sun=7)
  studied: boolean;
  isToday: boolean;
  gate: boolean;
}

export function boardDays(studied: ReadonlySet<string>, today: Date): BoardDay[] {
  const total = daysBetween(ARC_START, ARC_END) + 1; // 62
  const out: BoardDay[] = [];
  for (let i = 1; i <= total; i++) {
    const date = addDays(ARC_START, i - 1);
    const label = formatShortDate(date);
    out.push({
      i,
      date,
      label,
      gr: Math.floor(i / 7) + 1,
      gc: (i % 7) + 1,
      studied: studied.has(label),
      isToday: sameDay(date, today),
      gate: GATE_LABELS.includes(label),
    });
  }
  return out;
}

export function dayNumber(d: Date): number {
  return daysBetween(ARC_START, d) + 1;
}

export function daysRemaining(day: Date): number {
  return Math.max(0, daysBetween(day, ARC_END));
}

export function nextGate(today: Date): { label: string; inDays: number } | null {
  for (const label of GATE_LABELS) {
    const d = parseShortDate(label);
    if (d && d.getTime() >= today.getTime()) return { label, inDays: daysBetween(today, d) };
  }
  return null;
}

/* ─── pattern status ladder + the 8 confidence blocks ─── */

export const STATUS_RANK: Record<PatternStatus, number> = { Untouched: 0, Learning: 1, Shaky: 2, Solid: 3 };
export const STATUS_SCORE: Record<PatternStatus, number> = { Untouched: 0, Learning: 1 / 3, Shaky: 0.5, Solid: 1 };

export function statusCounts(ledger: Ledger): Record<PatternStatus, number> {
  const counts: Record<PatternStatus, number> = { Untouched: 0, Learning: 0, Shaky: 0, Solid: 0 };
  for (const p of ledger.patterns) counts[p.status] += 1;
  return counts;
}

export const BLOCK_NAMES = [
  "Arrays",
  "2-Ptr · BS",
  "Window · Stack",
  "Lists · Trees I",
  "Trees II · Heaps",
  "Backtrack · Tries",
  "Graphs · Intvl",
  "DP · Greedy",
];

const BLOCK_OF: Record<string, number> = {
  "Arrays & Hashing": 0,
  "Two Pointers": 1,
  "Binary Search": 1,
  "Binary Search on the Answer": 1,
  "Sliding Window": 2,
  Stack: 2,
  "Monotonic Stack": 2,
  "Linked Lists": 3,
  "Trees I": 3,
  "Trees II": 4,
  Heaps: 4,
  Backtracking: 5,
  Tries: 5,
  Graphs: 6,
  Intervals: 6,
  "Advanced Graphs": 6,
  "1D DP": 7,
  Greedy: 7,
  "2D DP": 7,
};

export function blockOfPattern(name: string): number | undefined {
  return BLOCK_OF[name] ?? BLOCK_OF[name.replace(/\s*\(.*\)\s*$/, "").trim()];
}

export interface BlockScore {
  short: string;
  frac: number; // 0..1 mean of status scores
  pct: string; // "33%"
  topRank: number; // highest STATUS_RANK in the block
}

export function blockScores(ledger: Ledger): BlockScore[] {
  const buckets: { scores: number[]; top: number }[] = BLOCK_NAMES.map(() => ({ scores: [], top: 0 }));
  for (const p of ledger.patterns) {
    const b = blockOfPattern(p.pattern);
    if (b === undefined) continue;
    buckets[b].scores.push(STATUS_SCORE[p.status]);
    buckets[b].top = Math.max(buckets[b].top, STATUS_RANK[p.status]);
  }
  return buckets.map((bk, i) => {
    const frac = bk.scores.length ? bk.scores.reduce((a, s) => a + s, 0) / bk.scores.length : 0;
    return { short: BLOCK_NAMES[i], frac, pct: `${Math.round(frac * 100)}%`, topRank: bk.top };
  });
}

/* ─── ledger-derived charts ─── */

export interface VerdictDay {
  date: Date;
  label: string;
  verdicts: Verdict[];
  isToday: boolean;
}

/** Rolling 14-day window (clamped to the arc start) of verdicts per day. */
export function verdictWindow(ledger: Ledger, today: Date, span = 14): VerdictDay[] {
  let start = addDays(today, -(span - 1));
  if (start.getTime() < ARC_START.getTime()) start = ARC_START;
  const byDay = new Map<string, Verdict[]>();
  for (const e of ledger.mistakeLog) {
    const list = byDay.get(e.date) ?? [];
    list.push(e.verdict);
    byDay.set(e.date, list);
  }
  const out: VerdictDay[] = [];
  for (let k = 0; k < span; k++) {
    const date = addDays(start, k);
    if (date.getTime() > ARC_END.getTime()) break;
    const label = formatShortDate(date);
    out.push({ date, label, verdicts: byDay.get(label) ?? [], isToday: sameDay(date, today) });
  }
  return out;
}

export function verdictTotals(ledger: Ledger): Record<Verdict, number> {
  const t: Record<Verdict, number> = { Clean: 0, Slow: 0, Hints: 0, Fail: 0 };
  for (const e of ledger.mistakeLog) t[e.verdict] += 1;
  return t;
}

/** Cumulative solves per day number 1..today (for the pace polyline). */
export function cumulativeSolves(ledger: Ledger, today: Date): { day: number; count: number }[] {
  const byDay = new Map<number, number>();
  for (const e of ledger.mistakeLog) {
    const d = parseShortDate(e.date);
    if (d) byDay.set(dayNumber(d), (byDay.get(dayNumber(d)) ?? 0) + 1);
  }
  const out: { day: number; count: number }[] = [];
  let cum = 0;
  const lastDay = Math.min(dayNumber(today), 62);
  for (let day = 1; day <= lastDay; day++) {
    cum += byDay.get(day) ?? 0;
    out.push({ day, count: cum });
  }
  return out;
}

/* ─── chains in flight (pending rep chains) ─── */

export interface ChainsInfo {
  count: number;
  /** unique upcoming pending dates, soonest first */
  nextDates: string[];
}

export function chainsInFlight(ledger: Ledger): ChainsInfo {
  const dates = new Set<string>();
  let count = 0;
  for (const e of ledger.mistakeLog) {
    const next = e.reps.find((r) => r.state === "pending");
    if (next) {
      count++;
      dates.add(next.date);
    }
  }
  const nextDates = [...dates].sort(
    (a, b) => (parseShortDate(a)?.getTime() ?? 0) - (parseShortDate(b)?.getTime() ?? 0),
  );
  return { count, nextDates };
}

/** Reps that land strictly after `today` (for the "Two +1 reps land Thu Sep 3" copy). */
export function upcomingReps(ledger: Ledger, today: Date): { date: string; count: number } | null {
  const counts = new Map<string, number>();
  for (const e of ledger.mistakeLog) {
    const next = e.reps.find((r) => r.state === "pending");
    if (!next) continue;
    const d = parseShortDate(next.date);
    if (d && d.getTime() > today.getTime()) counts.set(next.date, (counts.get(next.date) ?? 0) + 1);
  }
  let best: { date: string; count: number } | null = null;
  for (const [date, count] of counts) {
    const t = parseShortDate(date)?.getTime() ?? Infinity;
    if (!best || t < (parseShortDate(best.date)?.getTime() ?? Infinity)) best = { date, count };
  }
  return best;
}
