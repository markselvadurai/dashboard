import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, type PanInfo } from "motion/react";
import { Board, BoardLegend } from "@/components/game/Board";
import { StreakChip, ProgressChip, FlagIcon } from "@/components/game/Frame";
import { WorklistItems } from "@/components/game/Worklist";
import { useLedgerStore } from "@/data/store";
import {
  dueReps,
  boardDays,
  studiedDays,
  streakOf,
  daysRemaining,
  dayNumber,
  nextGate,
  upcomingReps,
  currentWeek,
  worklistForWeek,
  type DueRep,
} from "@/data/derive";
import { formatShortDate, parseShortDate } from "@/data/dates";
import type { Verdict } from "@/data/types";
import { cn } from "@/lib/utils";

const VERDICTS: { v: Verdict; bg: string; drop: string }[] = [
  { v: "Clean", bg: "var(--clean)", drop: "var(--clean-drop)" },
  { v: "Slow", bg: "var(--slow)", drop: "var(--slow-drop)" },
  { v: "Hints", bg: "var(--hints)", drop: "var(--hints-drop)" },
  { v: "Fail", bg: "var(--fail)", drop: "var(--fail-drop)" },
];

function weekdayOf(label: string): string {
  const d = parseShortDate(label);
  return d ? d.toLocaleDateString("en-US", { weekday: "short" }) : "";
}

const COUNT_WORDS = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];

export function TodayView({
  today,
  punched,
  punchIn,
  prefill,
  onPrefillConsumed,
}: {
  today: Date;
  punched: Set<string>;
  punchIn: (label: string) => void;
  prefill?: { problem: string; pattern: string } | null;
  onPrefillConsumed?: () => void;
}) {
  const { ledger, plan } = useLedgerStore();
  const [punchPulse, setPunchPulse] = useState(0);
  const [quickFill, setQuickFill] = useState<{ problem: string; pattern: string } | null>(null);

  useEffect(() => {
    if (prefill) {
      setQuickFill(prefill);
      onPrefillConsumed?.();
    }
  }, [prefill, onPrefillConsumed]);

  const todayLabel = formatShortDate(today);
  const studied = useMemo(() => (ledger ? studiedDays(ledger, punched, today) : new Set<string>()), [ledger, punched, today]);
  const days = useMemo(() => boardDays(studied, today), [studied, today]);
  const due = useMemo(() => (ledger ? dueReps(ledger, today) : []), [ledger, today]);
  const streak = ledger ? streakOf(studied, today) : 0;
  const upcoming = ledger ? upcomingReps(ledger, today) : null;
  const punchedToday = punched.has(todayLabel);

  if (!ledger) return null;

  const nextCp = ledger.checkpoints.find((c) => {
    const d = parseShortDate(c.date.replace(/^\w{3}\s+/, ""));
    return c.result === "—" && d && d.getTime() >= today.getTime();
  });
  const gate = nextGate(today);
  const week = plan ? currentWeek(plan, today) : undefined;
  const weekItems = plan && week ? worklistForWeek(plan, ledger, week.week) : [];

  return (
    <div>
      <div className="mt-2.5 grid items-center gap-10 lg:grid-cols-[640px_1fr]">
        {/* the board */}
        <div className="relative hidden h-[560px] lg:block" style={{ perspective: 1400 }}>
          <div className="absolute top-10 left-[120px]">
            <Board days={days} size="lg" punchPulse={punchPulse} />
          </div>
          <div className="absolute bottom-[-10px] left-0">
            <BoardLegend />
          </div>
        </div>

        <div>
          <div className="kicker text-ink-soft">Days to Nov 1</div>
          <div className="flex flex-wrap items-end gap-5">
            <div
              className="font-display text-[96px] leading-[.9] sm:text-[168px]"
              style={{ textShadow: "0 8px 0 var(--shadow)" }}
            >
              {daysRemaining(today)}
            </div>
            {/* mobile mini board */}
            <div className="relative h-[150px] w-[190px] flex-none lg:hidden" style={{ perspective: 900 }}>
              <div className="absolute -top-5 left-10">
                <Board days={days} size="sm" punchPulse={punchPulse} />
              </div>
            </div>
            <div className="flex flex-col gap-2.5">
              <div className="hidden lg:block">
                <StreakChip streak={streak} />
              </div>
              <ProgressChip studiedCount={studied.size} today={today} />
            </div>
          </div>

          {/* today's card */}
          <div className="relative mt-[22px] overflow-hidden rounded-[22px] bg-ink px-6 py-[22px] text-table">
            <div className="absolute -top-5 -right-5 size-[120px] rounded-full bg-pawn" />
            <div className="kicker relative text-xs opacity-70">Today's card</div>
            <div className="font-display relative mt-1.5 text-[28px] leading-[1.05]">
              {due.length === 0 ? "No reps due." : `${due.length} rep${due.length === 1 ? "" : "s"} due.`}
              <br />
              <span className="font-sans text-lg font-medium">
                {due.length > 0
                  ? "Reps before new problems — clear the queue first."
                  : upcoming
                    ? `${COUNT_WORDS[upcoming.count] ?? upcoming.count} rep${upcoming.count === 1 ? "" : "s"} land${upcoming.count === 1 ? "s" : ""} ${weekdayOf(upcoming.date)} ${upcoming.date}. Free turn — play Gear 2.`
                    : "Nothing queued. Free turn — play Gear 2."}
              </span>
            </div>
            <button
              className="press relative mt-[18px] px-[26px] py-3.5 text-base font-[900] text-ink"
              style={{ background: "var(--pawn)", ["--drop" as string]: "var(--pawn-drop)" }}
              disabled={punchedToday}
              onClick={() => {
                punchIn(todayLabel);
                setPunchPulse((p) => p + 1);
              }}
            >
              {punchedToday ? "Punched in ✓" : `Punch in · claim day ${dayNumber(today)} ✓`}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-12 grid items-start gap-8 lg:grid-cols-3">
        <RepsColumn due={due} />
        <div className="flex min-w-0 flex-col gap-8">
          {week && weekItems.length > 0 && (
            <div className="gcard px-[22px] py-5">
              <div className="flex items-baseline justify-between gap-3">
                <div className="font-display text-[22px]">This week's targets</div>
                <span className="text-xs font-[900] text-ink-soft">W{week.week}</span>
              </div>
              <div className="mt-1 mb-3 text-[13px] font-bold text-ink-soft">
                tap a problem → it loads the Quick log · essays check into the reading log
              </div>
              <WorklistItems
                items={weekItems}
                week={week.week}
                limit={4}
                onLogProblem={(item) => setQuickFill({ problem: item.item, pattern: item.pattern })}
              />
            </div>
          )}
          <GearCard today={today} nextCpTitle={nextCp ? `Checkpoint ${nextCp.num} · ${nextCp.date}` : null} nextCpBar={nextCp?.bar ?? null} gateTiles={gate?.inDays ?? null} />
        </div>
        <QuickLog fill={quickFill} onFillConsumed={() => setQuickFill(null)} />
      </div>
    </div>
  );
}

/* ─── reps due + docks ─── */

function RepsColumn({ due }: { due: DueRep[] }) {
  const { completeRep, missRep } = useLedgerStore();
  const reduced = useReducedMotion();
  const doneRef = useRef<HTMLDivElement>(null);
  const missRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [over, setOver] = useState<"done" | "miss" | null>(null);

  const hitTest = (info: PanInfo): "done" | "miss" | null => {
    for (const [zone, ref] of [
      ["done", doneRef],
      ["miss", missRef],
    ] as const) {
      const r = ref.current?.getBoundingClientRect();
      if (r && info.point.x >= r.left && info.point.x <= r.right && info.point.y >= r.top && info.point.y <= r.bottom) return zone;
    }
    return null;
  };

  return (
    <div>
      <div className="flex items-baseline gap-2.5">
        <div className="font-display text-2xl">Reps due</div>
        <span className="rounded-full bg-ink px-2.5 py-0.5 text-xs font-[900] text-table">{due.length}</span>
      </div>

      {due.length === 0 ? (
        <div className="gcard mt-3 p-5 text-sm font-bold text-ink-soft">
          No reps due. Free turn — the queue refills as chains come due.
        </div>
      ) : (
        <ul className="mt-3 flex flex-col gap-3.5">
          <AnimatePresence mode="popLayout">
            {due.map((d) => (
              <motion.li
                key={`${d.entry.date}-${d.entry.problem}`}
                layout
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.18 } }}
                drag={!reduced}
                dragSnapToOrigin
                dragElastic={0.9}
                whileDrag={{ rotate: 0, scale: 1.04, zIndex: 30 }}
                onDragStart={() => setDragging(true)}
                onDrag={(_, info) => setOver(hitTest(info))}
                onDragEnd={(_, info) => {
                  const zone = hitTest(info);
                  setDragging(false);
                  setOver(null);
                  if (zone === "done") void completeRep(d);
                  if (zone === "miss") void missRep(d);
                }}
                whileHover={{ rotate: 0, y: -4 }}
                initial={false}
                animate={{ rotate: reduced ? 0 : -2 }}
                className="cursor-grab rounded-[22px] bg-card p-5 shadow-[0_10px_0_var(--shadow)] active:cursor-grabbing"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-table px-3 py-1 text-xs font-[900]">{d.entry.pattern}</span>
                  <span className="text-xs font-[900] text-fail">
                    due {d.date} · {d.overdueDays}d late
                  </span>
                </div>
                <div className="font-display mt-3 text-[22px] leading-[1.1]">{d.entry.problem}</div>
                <p className="mt-2 text-sm leading-[1.45] font-semibold text-ink-soft">{d.entry.takeaway.replace(/\*/g, "")}</p>
                <div className="mt-3.5 flex gap-1.5">
                  {d.entry.reps.map((r, j) => (
                    <div
                      key={j}
                      className={cn(
                        "flex-1 rounded-xl p-2 text-center text-xs font-[900]",
                        r.state === "done" && "bg-clean text-white shadow-[0_4px_0_var(--clean-drop)]",
                        r.state === "missed" && "bg-fail text-white shadow-[0_4px_0_var(--fail-drop)]",
                        r.state === "pending" && "bg-table text-ink-soft",
                      )}
                    >
                      +{[1, 3, 7][Math.min(j, 2)]} {r.date}
                      {r.state === "done" && " ✓"}
                      {r.state === "missed" && " ✗"}
                    </div>
                  ))}
                </div>
                <div className="mt-3.5 flex gap-2">
                  <button
                    className="press-sm px-4 py-2 text-[13px] font-[900] text-white"
                    style={{ background: "var(--clean)", ["--drop" as string]: "var(--clean-drop)" }}
                    onClick={() => void completeRep(d)}
                  >
                    Clean
                  </button>
                  <button
                    className="rounded-full border-2 border-ink bg-card px-4 py-2 text-[13px] font-[900]"
                    onClick={() => void missRep(d)}
                  >
                    Missed
                  </button>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3" style={{ perspective: 700 }}>
        <div
          ref={doneRef}
          className="font-display flex min-h-24 items-end rounded-2xl p-3.5 text-[17px] text-white transition-transform duration-250"
          style={{
            background: "var(--clean)",
            transformOrigin: "50% 100%",
            transform: `rotateX(${over === "done" ? 10 : 30}deg)`,
            boxShadow: "inset 0 10px 14px rgba(0,0,0,.25)",
            filter: over === "done" ? "brightness(1.1)" : dragging ? "brightness(1.03)" : undefined,
          }}
        >
          Solved clean
        </div>
        <div
          ref={missRef}
          className="font-display flex min-h-24 items-end rounded-2xl p-3.5 text-[17px] text-white transition-transform duration-250"
          style={{
            background: "var(--fail)",
            transformOrigin: "50% 100%",
            transform: `rotateX(${over === "miss" ? 10 : 30}deg)`,
            boxShadow: "inset 0 10px 14px rgba(0,0,0,.25)",
            filter: over === "miss" ? "brightness(1.1)" : dragging ? "brightness(1.03)" : undefined,
          }}
        >
          Missed — reset chain
        </div>
      </div>
      <div className="mt-2 text-xs font-bold text-ink-soft">Drag a card into a dock · chain: ✓ done · ✗ missed · blank pending</div>
    </div>
  );
}

/* ─── gear ─── */

const GEAR2 = [
  ["A", "60–90 min", "Framework essay + guided problem + template from memory"],
  ["B", "60–90 min", "2 timed solo problems"],
  ["C", "45–60 min", "Spaced reps + update log"],
  ["D", "45 min", "Bonus timed medium"],
] as const;
const GEAR1 = [
  ["A", "25–30 min", "Re-solve one problem from the mistake log"],
  ["B", "15 min", "Pattern notes / flashcard review"],
  ["C", "15–20 min", "Watch tomorrow's solution"],
] as const;

function GearCard({
  today,
  nextCpTitle,
  nextCpBar,
  gateTiles,
}: {
  today: Date;
  nextCpTitle: string | null;
  nextCpBar: string | null;
  gateTiles: number | null;
}) {
  const storageKey = `gear-${formatShortDate(today)}`;
  const [gear, setGearState] = useState<1 | 2>(() => {
    try {
      return localStorage.getItem(storageKey) === "1" ? 1 : 2;
    } catch {
      return 2;
    }
  });
  const setGear = (g: 1 | 2) => {
    setGearState(g);
    try {
      localStorage.setItem(storageKey, String(g));
    } catch {
      /* per-browser convenience */
    }
  };
  const rows = gear === 2 ? GEAR2 : GEAR1;

  return (
    <div className="gcard px-[22px] py-5">
      <div className="flex items-center justify-between">
        <div className="font-display text-[22px]">Gear</div>
        <div role="tablist" aria-label="Gear" className="flex rounded-full bg-table p-1 text-[13px] font-[900]">
          {([1, 2] as const).map((g) => (
            <button
              key={g}
              role="tab"
              aria-selected={gear === g}
              onClick={() => setGear(g)}
              className={cn(
                "rounded-full px-3.5 py-1.5 transition-colors",
                gear === g ? "bg-ink text-table shadow-[0_3px_0_rgba(0,0,0,.25)]" : "text-ink-soft",
              )}
            >
              Gear {g}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-1 text-[13px] font-bold text-ink-soft">
        {gear === 2 ? "Normal day · 3–5 hrs" : "Busy day · ~60 min"}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={gear}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="mt-3.5 flex flex-col gap-2.5 text-sm font-semibold"
        >
          {rows.map(([slot, time, what]) => (
            <div key={slot} className="grid grid-cols-[34px_78px_1fr] items-start gap-2">
              <b className="grid size-7 place-items-center rounded-full bg-pawn text-[13px] shadow-[0_3px_0_var(--pawn-drop)]">
                {slot}
              </b>
              <span className="pt-1 text-ink-soft">{time}</span>
              <span className="pt-1">{what}</span>
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
      <div className="mt-3.5 rounded-xl bg-table px-3 py-2.5 text-xs font-semibold text-ink-soft">
        {gear === 2
          ? "Gear 1 · busy, ~60 min: A 25–30 re-solve from the mistake log · B 15 pattern notes/flashcards · C 15–20 watch tomorrow's solution."
          : "Gear 2 · normal, 3–5 hrs: A framework essay · B 2 timed solos · C spaced reps + log · D bonus timed medium."}
      </div>
      {nextCpTitle && (
        <div className="mt-4 flex items-center gap-3 border-t-2 border-dashed border-shadow pt-3.5">
          <FlagIcon />
          <div>
            <div className="kicker text-fail">Next gate{gateTiles !== null && ` · ${gateTiles} tiles`}</div>
            <div className="font-display text-[17px]">{nextCpTitle}</div>
            {nextCpBar && <div className="text-[13px] font-semibold text-ink-soft">{nextCpBar.replace(/\*\*/g, "")}.</div>}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── quick log ─── */

function QuickLog({
  fill,
  onFillConsumed,
}: {
  fill?: { problem: string; pattern: string } | null;
  onFillConsumed?: () => void;
}) {
  const { addSolve } = useLedgerStore();
  const [problem, setProblem] = useState("");
  const [pattern, setPattern] = useState("");
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [takeaway, setTakeaway] = useState("");
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const { ledger } = useLedgerStore();

  useEffect(() => {
    if (fill) {
      setProblem(fill.problem);
      setPattern(fill.pattern);
      setFlash(null);
      onFillConsumed?.();
    }
  }, [fill, onFillConsumed]);

  const ready = problem.trim() && pattern.trim() && verdict !== null;

  const submit = async () => {
    if (!ready || busy) return;
    setBusy(true);
    try {
      await addSolve({ problem: problem.trim(), pattern: pattern.trim(), verdict: verdict!, takeaway: takeaway.trim() || "—" });
      setFlash(verdict === "Clean" ? `${problem.trim()} → ledger. Clean, no reps.` : `${problem.trim()} → ledger. Reps queued +1/+3/+7.`);
      setProblem("");
      setTakeaway("");
      setVerdict(null);
      setTimeout(() => setFlash(null), 3500);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="gcard px-[22px] py-5">
      <div className="font-display text-[22px]">Quick log</div>
      <div className="mt-3 flex flex-col gap-[9px]">
        <input aria-label="Problem" className="ginput" placeholder="Problem" value={problem} onChange={(e) => setProblem(e.target.value)} />
        <input
          aria-label="Pattern"
          className="ginput"
          placeholder="Pattern"
          list="patterns"
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
        />
        <datalist id="patterns">{ledger?.patterns.map((p) => <option key={p.pattern} value={p.pattern} />)}</datalist>
        <div role="radiogroup" aria-label="Verdict" className="mt-1 grid grid-cols-4 gap-1.5">
          {VERDICTS.map(({ v, bg, drop }) => {
            const selected = verdict === v;
            return (
              <button
                key={v}
                role="radio"
                aria-checked={selected}
                onClick={() => setVerdict(v)}
                className="rounded-xl py-[9px] text-center text-[13px] font-[900] text-white transition-all"
                style={{
                  background: bg,
                  boxShadow: selected ? `0 1px 0 ${drop}, inset 0 0 0 2px var(--ink)` : `0 4px 0 ${drop}`,
                  transform: selected ? "translateY(3px)" : undefined,
                  opacity: verdict !== null && !selected ? 0.55 : 1,
                }}
              >
                {v}
              </button>
            );
          })}
        </div>
        <div className="text-xs font-semibold text-ink-soft">Anything not Clean auto-queues reps at +1 / +3 / +7 days.</div>
        <input
          aria-label="One-line takeaway"
          className="ginput"
          placeholder="One-line takeaway"
          value={takeaway}
          onChange={(e) => setTakeaway(e.target.value)}
        />
        <button
          className="press mt-1 px-4 py-[13px] text-[15px] font-[900] text-table disabled:opacity-60"
          style={{ background: "var(--ink)", ["--drop" as string]: "var(--ink-drop)" }}
          disabled={!ready || busy}
          onClick={() => void submit()}
        >
          {busy ? "Writing…" : "Commit to ledger"}
        </button>
        <AnimatePresence>
          {flash && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-xs font-[900] text-clean-drop"
            >
              ✓ {flash}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
