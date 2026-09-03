import { useCallback, useState } from "react";

const KEY = "mc-punched-days";

function load(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as unknown;
    return new Set(Array.isArray(arr) ? arr.filter((x): x is string => typeof x === "string") : []);
  } catch {
    return new Set();
  }
}

/** Punched-in days ("claim the day" ritual) — per-browser, additive to logged activity. */
export function usePunched(): { punched: Set<string>; punchIn: (label: string) => void } {
  const [punched, setPunched] = useState<Set<string>>(load);
  const punchIn = useCallback((label: string) => {
    setPunched((prev) => {
      if (prev.has(label)) return prev;
      const next = new Set(prev);
      next.add(label);
      try {
        localStorage.setItem(KEY, JSON.stringify([...next]));
      } catch {
        /* per-browser convenience only */
      }
      return next;
    });
  }, []);
  return { punched, punchIn };
}
