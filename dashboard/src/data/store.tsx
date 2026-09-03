import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Ledger, PlanData, PatternStatus, Verdict, Rep } from "./types";
import { parseProgress, parsePlan, serializeReps } from "./parse";
import { formatShortDate, addDays, today } from "./dates";
import type { DueRep } from "./derive";

interface LedgerOpAppend {
  op: "appendRow";
  section: string;
  cells: string[];
}
interface LedgerOpUpdate {
  op: "updateRow";
  section: string;
  match: Record<number, string>;
  set: Record<number, string>;
}
type LedgerOp = LedgerOpAppend | LedgerOpUpdate;

interface StoreValue {
  ledger: Ledger | null;
  plan: PlanData | null;
  error: string | null;
  loading: boolean;
  /** true on a static deploy (no dev server): the ledger is a read-only snapshot */
  readOnly: boolean;
  completeRep: (due: DueRep) => Promise<void>;
  missRep: (due: DueRep) => Promise<void>;
  addSolve: (input: { problem: string; pattern: string; verdict: Verdict; takeaway: string }) => Promise<void>;
  addQuiz: (input: { quiz: string; score: string; outcome: string }) => Promise<void>;
  setPatternStatus: (pattern: string, status: PatternStatus) => Promise<void>;
  setCheckpointResult: (num: string, result: string) => Promise<void>;
}

const StoreContext = createContext<StoreValue | null>(null);

export function useLedgerStore(): StoreValue {
  const v = useContext(StoreContext);
  if (!v) throw new Error("useLedgerStore outside provider");
  return v;
}

async function fetchFile(name: "progress" | "plan"): Promise<{ content: string; static?: boolean }> {
  const res = await fetch(`/api/file/${name}`);
  if (!res.ok) throw new Error(`failed to load ${name}.md`);
  return (await res.json()) as { content: string; static?: boolean };
}

export function LedgerProvider({ children }: { children: ReactNode }) {
  const [progressMd, setProgressMd] = useState<string | null>(null);
  const [planMd, setPlanMd] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [readOnly, setReadOnly] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const [p, pl] = await Promise.all([fetchFile("progress"), fetchFile("plan")]);
      setProgressMd(p.content);
      setPlanMd(pl.content);
      setReadOnly(Boolean(p.static));
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  useEffect(() => {
    void refresh();
    if (import.meta.hot) {
      const handler = () => void refresh();
      import.meta.hot.on("ledger:changed", handler);
      return () => import.meta.hot?.off("ledger:changed", handler);
    }
  }, [refresh]);

  const ledger = useMemo(() => (progressMd !== null ? parseProgress(progressMd) : null), [progressMd]);
  const plan = useMemo(() => (planMd !== null ? parsePlan(planMd) : null), [planMd]);

  const send = useCallback(async (op: LedgerOp) => {
    if (readOnly) {
      const msg = "Read-only mirror — log from the machine that holds the ledger.";
      setError(msg);
      throw new Error(msg);
    }
    const res = await fetch("/api/ledger", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(op),
    });
    const data = (await res.json()) as { ok: boolean; content?: string; error?: string };
    if (!data.ok || data.content === undefined) {
      const msg = data.error ?? "write failed";
      setError(msg);
      throw new Error(msg);
    }
    setProgressMd(data.content);
    setError(null);
  }, [readOnly]);

  const value = useMemo<StoreValue>(() => {
    const repCellUpdate = (due: DueRep, mutate: (reps: Rep[]) => Rep[]): LedgerOpUpdate => ({
      op: "updateRow",
      section: "Mistake Log",
      match: { 0: due.entry.date, 1: due.entry.problem },
      set: { 5: serializeReps(mutate(due.entry.reps.map((r) => ({ ...r })))) },
    });

    return {
      ledger,
      plan,
      error,
      loading: ledger === null || plan === null,
      readOnly,

      completeRep: (due) =>
        send(
          repCellUpdate(due, (reps) => {
            reps[due.repIndex].state = "done";
            return reps;
          }),
        ),

      missRep: (due) => {
        const t = today();
        return send(
          repCellUpdate(due, (reps) => {
            reps[due.repIndex].state = "missed";
            // reset the chain: drop later pending reps, restart 1–3–7 from today
            const kept = reps.slice(0, due.repIndex + 1);
            for (const n of [1, 3, 7]) kept.push({ date: formatShortDate(addDays(t, n)), state: "pending" });
            return kept;
          }),
        );
      },

      addSolve: ({ problem, pattern, verdict, takeaway }) => {
        const t = today();
        const reps: Rep[] =
          verdict === "Clean"
            ? []
            : [1, 3, 7].map((n) => ({ date: formatShortDate(addDays(t, n)), state: "pending" }));
        return send({
          op: "appendRow",
          section: "Mistake Log",
          cells: [formatShortDate(t), problem, pattern, verdict, takeaway, serializeReps(reps)],
        });
      },

      addQuiz: ({ quiz, score, outcome }) =>
        send({
          op: "appendRow",
          section: "Quiz Log",
          cells: [formatShortDate(today()), quiz, score, outcome],
        }),

      setPatternStatus: (pattern, status) =>
        send({
          op: "updateRow",
          section: "Pattern Confidence",
          match: { 0: pattern },
          set: { 2: status === "Shaky" ? "**Shaky**" : status, 3: formatShortDate(today()) },
        }),

      setCheckpointResult: (num, result) =>
        send({
          op: "updateRow",
          section: "## 4. Checkpoints",
          match: { 0: num },
          set: { 3: result },
        }),
    };
  }, [ledger, plan, error, send, readOnly]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
