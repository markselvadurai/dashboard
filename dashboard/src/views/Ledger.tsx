import { useMemo } from "react";
import { useLedgerStore } from "@/data/store";
import { verdictWindow, verdictTotals, chainsInFlight } from "@/data/derive";
import { parseShortDate } from "@/data/dates";
import type { Verdict } from "@/data/types";
import { cn } from "@/lib/utils";

const V_COLOR: Record<Verdict, { bg: string; drop: string }> = {
  Clean: { bg: "var(--clean)", drop: "var(--clean-drop)" },
  Slow: { bg: "var(--slow)", drop: "var(--slow-drop)" },
  Hints: { bg: "var(--hints)", drop: "var(--hints-drop)" },
  Fail: { bg: "var(--fail)", drop: "var(--fail-drop)" },
};

function withWeekday(label: string): string {
  const d = parseShortDate(label);
  return d ? `${d.toLocaleDateString("en-US", { weekday: "short" })} ${label}` : label;
}

export function LedgerView({ today }: { today: Date }) {
  const { ledger } = useLedgerStore();
  const window14 = useMemo(() => (ledger ? verdictWindow(ledger, today) : []), [ledger, today]);
  if (!ledger) return null;

  const totals = verdictTotals(ledger);
  const chains = chainsInFlight(ledger);
  const entries = ledger.mistakeLog;

  return (
    <div className="mt-8 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_420px]">
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-4">
          <h2 className="font-display m-0 text-[34px]">Mistake log</h2>
          <span className="text-sm font-bold text-ink-soft">
            {entries.length} entr{entries.length === 1 ? "y" : "ies"} · the sacred part
          </span>
        </div>

        <div className="mt-[18px] flex flex-col gap-[18px]">
          {entries.map((e, i) => {
            const vc = V_COLOR[e.verdict];
            return (
              <div
                key={`${e.date}-${e.problem}`}
                className="grid grid-cols-[86px_1fr] overflow-hidden rounded-[22px] bg-card shadow-[0_10px_0_var(--shadow)] transition-transform duration-200 hover:-translate-y-[3px] sm:grid-cols-[120px_1fr]"
              >
                <div className="flex flex-col justify-between px-4 py-5 text-white" style={{ background: vc.bg }}>
                  <div className="kicker opacity-85">{e.date}</div>
                  <div className="font-display text-[26px]">{e.verdict}</div>
                </div>
                <div className="px-[22px] py-[18px]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-table px-3 py-1 text-xs font-[900]">{e.pattern}</span>
                    <span className="text-xs font-bold text-ink-soft">#{i + 1}</span>
                  </div>
                  <div className="font-display mt-2.5 text-[22px]">{e.problem}</div>
                  <p className="mt-1.5 text-[15px] leading-[1.45] font-semibold text-ink-soft">{e.takeaway.replace(/\*/g, "")}</p>
                  {e.reps.length > 0 && (
                    <div className="mt-3.5 flex flex-wrap items-center gap-1.5 text-xs font-[900]">
                      <span className="mr-1 text-ink-soft">Reps</span>
                      {e.reps.map((r, j) => (
                        <span
                          key={j}
                          className={cn(
                            "rounded-[10px] px-3 py-1.5",
                            r.state === "done" && "bg-clean text-white shadow-[0_3px_0_var(--clean-drop)]",
                            r.state === "missed" && "bg-fail text-white shadow-[0_3px_0_var(--fail-drop)]",
                            r.state === "pending" && "bg-table",
                          )}
                        >
                          {r.date}
                          {r.state === "done" && " ✓"}
                          {r.state === "missed" && " ✗"}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <h3 className="font-display mt-9 mb-0 text-2xl">Quiz log</h3>
        <div className="mt-3 grid gap-4 xl:grid-cols-2">
          {ledger.quizLog.map((q, i) => {
            const m = /(\d+)\s*\/\s*(\d+)/.exec(q.score);
            const total = m ? Number(m[2]) : (Number(/\((\d+)Q\)/.exec(q.quiz)?.[1]) || 0);
            const done = m ? Number(m[1]) : null;
            const future = (parseShortDate(q.date)?.getTime() ?? 0) > today.getTime();
            return (
              <div
                key={i}
                title={q.outcome.replace(/\*/g, "")}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-[18px] bg-card px-5 py-4 shadow-[0_8px_0_var(--shadow)]",
                  done === null && "opacity-85",
                )}
              >
                <div>
                  <div className="font-display text-lg">
                    {q.quiz.replace(/\s*\(\d+Q\)/, "")}{" "}
                    <span className="text-sm font-medium text-ink-soft">({total}Q)</span>
                  </div>
                  <div className="text-[13px] font-bold text-ink-soft">
                    {q.date}
                    {future && " · tomorrow"}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: total }, (_, k) =>
                    done === null ? (
                      <i key={k} className="h-[26px] w-3.5 rounded-[4px] border-2 border-dashed border-shadow" />
                    ) : (
                      <i
                        key={k}
                        className="h-[26px] w-3.5 rounded-[4px]"
                        style={{ background: k < done ? "var(--clean)" : "var(--fail)" }}
                      />
                    ),
                  )}
                  {done !== null ? (
                    <span className="font-display ml-2 text-xl">
                      {done}/{total}
                    </span>
                  ) : (
                    <span className="ml-2 rounded-full bg-shaky px-2.5 py-1 text-xs font-[900]">pending</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <div className="gcard px-[22px] py-5">
          <div className="font-display text-[22px]">Verdicts over time</div>
          <div className="text-[13px] font-bold text-ink-soft">
            {window14[0]?.label} → {window14[window14.length - 1]?.label} · one block per verdict
          </div>
          <div
            className="mt-4 grid h-[150px] items-end gap-[5px] border-b-[3px] border-ink pb-1.5"
            style={{ gridTemplateColumns: `repeat(${window14.length}, 1fr)` }}
          >
            {window14.map((v) => (
              <div key={v.label} title={v.label} className="flex h-full flex-col-reverse justify-start gap-[3px]">
                {v.verdicts.length === 0 ? (
                  <i className="h-1.5 rounded-[3px] bg-table" />
                ) : (
                  v.verdicts.map((verdict, k) => (
                    <i
                      key={k}
                      className="h-[22px] rounded-[5px] shadow-[0_3px_0_rgba(0,0,0,.25)]"
                      style={{ background: V_COLOR[verdict].bg }}
                    />
                  ))
                )}
              </div>
            ))}
          </div>
          <div className="mt-1.5 grid gap-[5px]" style={{ gridTemplateColumns: `repeat(${window14.length}, 1fr)` }}>
            {window14.map((v, k) => (
              <span
                key={v.label}
                className="text-center text-[10px] font-[900]"
                style={{ color: v.isToday || v.verdicts.length > 0 ? "var(--ink)" : "var(--muted)" }}
              >
                {v.isToday ? v.label : k % 2 === 0 ? v.date.getDate() : ""}
              </span>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-[900]">
            {(Object.keys(V_COLOR) as Verdict[]).map((v) => (
              <span key={v} className="flex items-center gap-[5px]">
                <i className="size-3.5 rounded-[4px]" style={{ background: V_COLOR[v].bg }} />
                {v} {totals[v]}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-[22px] bg-ink px-[22px] py-5 text-table">
          <div className="kicker text-xs opacity-70">Chains in flight</div>
          <div className="font-display mt-1 text-[26px]">
            {chains.count === 0 ? "None — clear board" : `${chains.count} in flight`}
          </div>
          <div className="mt-1 text-sm font-semibold opacity-85">
            {chains.count === 0 ? (
              "Log a non-Clean solve and a 1–3–7 chain starts."
            ) : (
              <>
                Next reps {chains.nextDates.map(withWeekday).join(", then ")}. Survive the +7 clean and the pattern
                jumps to <b style={{ color: "var(--clean)" }}>Solid</b>.
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
