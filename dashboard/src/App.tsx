import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useLedgerStore } from "./data/store";
import { today as getToday } from "./data/dates";
import { currentWeek, boardDays, studiedDays, streakOf } from "./data/derive";
import { Brand, NavPill, ContextLine, ArcRail, StreakChip, type ViewId } from "./components/game/Frame";
import { TodayView } from "./views/Today";
import { PatternsView } from "./views/Patterns";
import { LedgerView } from "./views/Ledger";
import { RoadmapView } from "./views/Roadmap";
import { usePunched } from "./lib/punch";
import { STATIC_MODE } from "./lib/motion-mode";

export default function App() {
  const { ledger, plan, error, loading, readOnly } = useLedgerStore();
  const [view, setView] = useState<ViewId>("today");
  const { punched, punchIn } = usePunched();
  const reduced = useReducedMotion();
  const today = getToday();

  useEffect(() => {
    if (STATIC_MODE) document.documentElement.classList.add("static-mode");
  }, []);

  const week = plan ? currentWeek(plan, today) : undefined;
  const dateLabel = today.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  const weekLine = week ? `Week ${week.week} — ${week.topics}` : "off the map";

  const studied = useMemo(
    () => (ledger ? studiedDays(ledger, punched, today) : new Set<string>()),
    [ledger, punched, today],
  );
  const days = useMemo(() => boardDays(studied, today), [studied, today]);
  const streak = ledger ? streakOf(studied, today) : 0;

  return (
    <div className="mx-auto max-w-[1440px] overflow-x-clip px-[18px] pt-5 pb-28 sm:px-10 lg:px-14 lg:pt-7 lg:pb-14">
      {/* header */}
      <div className="flex items-center justify-between gap-4 lg:justify-start lg:gap-[30px]">
        <Brand />
        <NavPill view={view} onChange={setView} className="hidden lg:flex" />
        <div className="lg:hidden">
          <StreakChip streak={streak} small />
        </div>
        <div className="ml-auto hidden lg:block">
          <ContextLine dateLabel={dateLabel} weekLine={weekLine} />
        </div>
      </div>
      <div className="mt-2.5 text-[13px] leading-snug font-bold text-ink-soft lg:hidden">
        <b className="text-ink">{dateLabel}</b> · {weekLine}
      </div>

      {(view === "patterns" || view === "ledger") && ledger && <ArcRail days={days} streak={streak} today={today} />}

      {readOnly && (
        <div className="mt-4 rounded-2xl bg-card px-5 py-3 text-[13px] font-[900] text-ink-soft shadow-[0_6px_0_var(--shadow)]">
          📖 Read-only mirror — this copy shows the ledger as of the last deploy. Logging happens on the machine that
          holds progress.md.
        </div>
      )}
      {error && (
        <div role="alert" className="mt-4 rounded-2xl bg-fail px-5 py-3 text-sm font-[900] text-white shadow-[0_6px_0_var(--fail-drop)]">
          Ledger error: {error}
        </div>
      )}

      <main>
        {loading || !ledger || !plan ? (
          <div className="font-display animate-pulse py-24 text-center text-2xl text-ink-soft">Setting up the board…</div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={reduced || STATIC_MODE ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced || STATIC_MODE ? undefined : { opacity: 0, y: -8, transition: { duration: 0.12 } }}
              transition={{ type: "spring", stiffness: 420, damping: 34 }}
            >
              {view === "today" && <TodayView today={today} punched={punched} punchIn={punchIn} />}
              {view === "patterns" && <PatternsView />}
              {view === "ledger" && <LedgerView today={today} />}
              {view === "roadmap" && <RoadmapView today={today} punched={punched} />}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      {/* mobile sticky nav */}
      <div className="fixed inset-x-[18px] bottom-3 z-20 lg:hidden">
        <NavPill view={view} onChange={setView} stretch />
      </div>
    </div>
  );
}
