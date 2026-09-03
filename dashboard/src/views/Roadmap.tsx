import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Board } from "@/components/game/Board";
import { FlagIcon } from "@/components/game/Frame";
import { WorklistItems } from "@/components/game/Worklist";
import { useLedgerStore } from "@/data/store";
import { boardDays, studiedDays, cumulativeSolves, worklistForWeek, worklistProgress } from "@/data/derive";
import { parseShortDate } from "@/data/dates";
import type { WorklistItem } from "@/data/types";
import { cn } from "@/lib/utils";

const X = (d: number) => 20 + (d - 1) * (460 / 61);
const Y = (n: number) => 180 - n * (160 / 110);

function bandPath(top: number, bottom: number): string {
  let s = "";
  for (let d = 1; d <= 62; d++) s += (d === 1 ? "M" : "L") + X(d).toFixed(1) + "," + Y((top * (d - 1)) / 61).toFixed(1);
  for (let d = 62; d >= 1; d--) s += "L" + X(d).toFixed(1) + "," + Y((bottom * (d - 1)) / 61).toFixed(1);
  return s + "Z";
}
function linePath(top: number): string {
  let s = "";
  for (let d = 1; d <= 62; d++) s += (d === 1 ? "M" : "L") + X(d).toFixed(1) + "," + Y((top * (d - 1)) / 61).toFixed(1);
  return s;
}

export function RoadmapView({
  today,
  punched,
  onPickProblem,
}: {
  today: Date;
  punched: Set<string>;
  onPickProblem?: (item: WorklistItem) => void;
}) {
  const { ledger, plan, setCheckpointResult } = useLedgerStore();
  const studied = useMemo(() => (ledger ? studiedDays(ledger, punched, today) : new Set<string>()), [ledger, punched, today]);
  const days = useMemo(() => boardDays(studied, today), [studied, today]);
  const cumulative = useMemo(() => (ledger ? cumulativeSolves(ledger, today) : []), [ledger, today]);
  const currentWeekKey = plan?.roadmap.find((w) => today >= w.start && today <= w.end)?.week;
  const [openWeeks, setOpenWeeks] = useState<Set<string>>(() => new Set(currentWeekKey ? [currentWeekKey] : []));
  const progress = useMemo(
    () => (ledger && plan ? worklistProgress(plan, ledger) : new Map<string, { done: number; total: number }>()),
    [ledger, plan],
  );

  if (!ledger || !plan) return null;

  const toggleWeek = (w: string) =>
    setOpenWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(w)) next.delete(w);
      else next.add(w);
      return next;
    });

  const last = cumulative[cumulative.length - 1] ?? { day: 1, count: 0 };
  const actualPts = cumulative.map((p) => `${X(p.day).toFixed(1)},${Y(p.count).toFixed(1)}`).join(" ");
  const gateDays = [20, 34, 48, 62];
  const flagsLeft = ledger.checkpoints.filter((c) => c.result === "—").length;

  return (
    <div className="mt-2.5 grid items-start gap-10 lg:grid-cols-[560px_minmax(0,1fr)]">
      <div>
        <div className="relative hidden h-[520px] lg:block" style={{ perspective: 1400 }}>
          <div className="absolute top-[30px] left-[100px]">
            <Board days={days} size="md" />
          </div>
        </div>

        <div className="gcard mt-2.5 px-[22px] py-5">
          <div className="font-display text-[22px]">Pace</div>
          <div className="text-[13px] font-bold text-ink-soft">Planned cumulative problems (95–110 band) vs actual</div>
          <svg viewBox="0 0 500 200" width="100%" className="mt-3 block overflow-visible">
            <path d={bandPath(110, 95)} fill="var(--table)" />
            <path d={linePath(110)} fill="none" stroke="var(--shadow)" strokeWidth={2} strokeDasharray="4 4" />
            <path d={linePath(95)} fill="none" stroke="var(--shadow)" strokeWidth={2} strokeDasharray="4 4" />
            <line x1={20} y1={180} x2={480} y2={180} stroke="var(--ink)" strokeWidth={3} />
            {gateDays.map((d) => (
              <line key={d} x1={X(d)} y1={20} x2={X(d)} y2={180} stroke="var(--fail)" strokeWidth={2} strokeDasharray="3 5" />
            ))}
            {actualPts && <polyline points={actualPts} fill="none" stroke="var(--ink)" strokeWidth={4} strokeLinecap="round" />}
            <circle cx={X(last.day)} cy={Y(last.count)} r={9} fill="var(--pawn)" stroke="var(--ink)" strokeWidth={3} />
            <text
              x={X(last.day) + 16}
              y={Y(last.count) - 6}
              fontFamily="Nunito"
              fontWeight={900}
              fontSize={13}
              fill="var(--ink)"
            >
              {last.count} solved · day {last.day}
            </text>
            <text x={480} y={30} textAnchor="end" fontFamily="Nunito" fontWeight={900} fontSize={12} fill="var(--ink-soft)">
              110
            </text>
            <text x={480} y={52} textAnchor="end" fontFamily="Nunito" fontWeight={900} fontSize={12} fill="var(--ink-soft)">
              95
            </text>
            <text x={20} y={196} fontFamily="Nunito" fontWeight={900} fontSize={11} fill="var(--ink-soft)">
              Sep 1
            </text>
            <text x={480} y={196} textAnchor="end" fontFamily="Nunito" fontWeight={900} fontSize={11} fill="var(--ink-soft)">
              Nov 1
            </text>
          </svg>
        </div>
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-4">
          <h2 className="font-display m-0 text-[34px]">9 weeks</h2>
          <span className="text-sm font-bold text-ink-soft">
            W{plan.roadmap.find((w) => today >= w.start && today <= w.end)?.week ?? "?"} is live · {flagsLeft} flag
            {flagsLeft === 1 ? "" : "s"} to plant
          </span>
        </div>
        <div className="mt-4 flex flex-col gap-2">
          {plan.roadmap.map((w) => {
            const cur = today >= w.start && today <= w.end;
            const gate = /checkpoint/i.test(w.milestone);
            const open = openWeeks.has(w.week);
            const prog = progress.get(w.week);
            return (
              <div key={w.week}>
                <button
                  onClick={() => toggleWeek(w.week)}
                  aria-expanded={open}
                  className={cn(
                    "grid w-full grid-cols-[52px_1fr_auto] items-center gap-3.5 rounded-[14px] px-4 py-2.5 text-left xl:grid-cols-[52px_120px_1fr_auto]",
                    cur ? "scale-[1.02] bg-ink text-table shadow-[0_8px_0_var(--ink-drop)]" : "bg-card shadow-[0_5px_0_var(--shadow)]",
                  )}
                >
                  <span className="font-display text-xl">W{w.week}</span>
                  <span className="hidden text-[13px] font-bold opacity-80 xl:block">{w.dates}</span>
                  <div className="min-w-0">
                    <div className="text-[15px] font-[900]">{w.topics}</div>
                    <div className="text-xs font-semibold opacity-80">{w.milestone || "—"}</div>
                  </div>
                  <span className="flex items-center gap-2">
                    {prog && prog.total > 0 && (
                      <span
                        className={cn(
                          "rounded-full px-2 py-1 text-[11px] font-[900] whitespace-nowrap",
                          prog.done === prog.total ? "bg-clean text-white" : cur ? "bg-table/20" : "bg-table text-ink-soft",
                        )}
                      >
                        {prog.done}/{prog.total}
                      </span>
                    )}
                    <span
                      className="rounded-full px-2.5 py-1 text-[11px] font-[900] whitespace-nowrap"
                      style={{
                        background: cur ? "var(--pawn)" : gate ? "var(--gate)" : "var(--table)",
                        color: cur ? "var(--ink)" : gate ? "var(--fail-drop)" : "var(--ink-soft)",
                      }}
                    >
                      {cur ? "CURRENT WEEK" : gate ? "⚑ gate" : "ahead"}
                    </span>
                    <span className={cn("text-xs transition-transform", open && "rotate-180")}>▾</span>
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mx-2 rounded-b-[14px] bg-card/70 px-4 py-3 shadow-[0_5px_0_var(--shadow-light)]">
                        <WorklistItems
                          items={worklistForWeek(plan, ledger, w.week)}
                          week={w.week}
                          onLogProblem={onPickProblem}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        <div className="mt-5 grid items-start gap-4 xl:grid-cols-2">
          <div className="gcard px-5 py-[18px]">
            <div className="font-display text-xl">Study days</div>
            <div className="text-xs font-bold text-ink-soft">{studied.size} lit · Mon → Sun</div>
            <div className="mt-2.5 grid grid-cols-7 gap-1">
              {days.map((d) => (
                <i
                  key={d.i}
                  title={d.label}
                  className="aspect-square rounded-[5px]"
                  style={{
                    gridColumn: d.gc,
                    gridRow: d.gr,
                    background: d.studied ? "var(--clean)" : d.gate ? "var(--gate)" : "var(--table)",
                    boxShadow: d.studied ? "0 3px 0 var(--clean-drop)" : "none",
                  }}
                />
              ))}
            </div>
            <div className="mt-1.5 flex justify-between text-[10px] font-[900] text-ink-soft">
              <span>Sep 1 ↑ top-left</span>
              <span>Nov 1 ↓ bottom-right</span>
            </div>
          </div>

          <div className="gcard px-5 py-[18px]">
            <div className="font-display text-xl">Checkpoints</div>
            <div className="text-xs font-bold text-ink-soft">
              {ledger.checkpoints.filter((c) => c.result !== "—").length} attempted · record pass / miss
            </div>
            <div className="mt-2.5 flex flex-col gap-2.5">
              {ledger.checkpoints.map((c) => {
                const passed = c.result.includes("✅") || /pass/i.test(c.result);
                const missed = !passed && (c.result.includes("❌") || /miss|fail/i.test(c.result));
                const recorded = c.result !== "—";
                const due = (parseShortDate(c.date.replace(/^\w{3}\s+/, ""))?.getTime() ?? 0) <= today.getTime();
                return (
                  <div key={c.num} className="flex items-center gap-2.5">
                    <FlagIcon size={16} />
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-[900]">
                        Checkpoint {c.num} · {c.date}
                      </div>
                      <div className="truncate text-[11px] font-semibold text-ink-soft" title={c.bar.replace(/\*\*/g, "")}>
                        {c.bar.replace(/\*\*/g, "")}
                      </div>
                    </div>
                    {recorded ? (
                      <span
                        className="rounded-full px-2.5 py-1.5 text-[11px] font-[900] text-white"
                        style={{
                          background: passed ? "var(--clean)" : "var(--fail)",
                          boxShadow: `0 3px 0 ${passed ? "var(--clean-drop)" : "var(--fail-drop)"}`,
                        }}
                      >
                        {passed ? "Passed ✓" : missed ? "Missed ✗" : c.result}
                      </span>
                    ) : (
                      <>
                        <button
                          className="press-sm px-2.5 py-1.5 text-[11px] font-[900] text-white disabled:cursor-default"
                          style={{ background: "var(--clean)", ["--drop" as string]: "var(--clean-drop)", opacity: due ? 1 : 0.55 }}
                          disabled={!due}
                          title={due ? "Record a pass" : `Opens ${c.date}`}
                          onClick={() => void setCheckpointResult(c.num, "✅ Passed")}
                        >
                          Pass
                        </button>
                        <button
                          className="press-sm px-2.5 py-1.5 text-[11px] font-[900] text-white disabled:cursor-default"
                          style={{ background: "var(--fail)", ["--drop" as string]: "var(--fail-drop)", opacity: due ? 1 : 0.55 }}
                          disabled={!due}
                          title={due ? "Record a miss" : `Opens ${c.date}`}
                          onClick={() => void setCheckpointResult(c.num, "❌ Missed — reviewing")}
                        >
                          Miss
                        </button>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
