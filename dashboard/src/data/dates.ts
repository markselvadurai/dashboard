/** All plan dates live in Sep–Nov 2026; the ledger writes them as "Sep 3". */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const YEAR = 2026;

export const ARC_START = new Date(YEAR, 8, 1); // Sep 1
export const ARC_END = new Date(YEAR, 10, 1); // Nov 1

export function parseShortDate(s: string): Date | null {
  const m = /^([A-Z][a-z]{2})\s+(\d{1,2})$/.exec(s.trim());
  if (!m) return null;
  const month = MONTHS.indexOf(m[1]);
  if (month === -1) return null;
  return new Date(YEAR, month, Number(m[2]));
}

export function formatShortDate(d: Date): string {
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

export function today(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function addDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
}

export function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

export function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** "Sep 1–6", "Sep 28–Oct 4", "Oct 26–Nov 1" → [start, end] */
export function parseDateRange(s: string): [Date, Date] | null {
  const parts = s.split(/[–-]/).map((p) => p.trim());
  if (parts.length !== 2) return null;
  const start = parseShortDate(parts[0]);
  if (!start) return null;
  const end = parseShortDate(parts[1]) ?? new Date(YEAR, start.getMonth(), Number(parts[1]) || start.getDate());
  return [start, end];
}
