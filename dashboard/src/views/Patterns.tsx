import { useMemo } from "react";
import { motion } from "motion/react";
import { useLedgerStore } from "@/data/store";
import { blockScores, statusCounts, STATUS_RANK } from "@/data/derive";
import type { PatternStatus } from "@/data/types";
import { cn } from "@/lib/utils";

const STATUS_COL = ["#fff", "var(--pawn)", "var(--shaky)", "var(--clean)"];
const NEXT_STATUS: Record<PatternStatus, PatternStatus | null> = {
  Untouched: "Learning",
  Learning: "Shaky",
  Shaky: null, // Solid is earned by surviving the +7 rep clean, not by tapping
  Solid: null,
};

export function PatternsView() {
  const { ledger, setPatternStatus } = useLedgerStore();
  const blocks = useMemo(() => (ledger ? blockScores(ledger) : []), [ledger]);
  if (!ledger) return null;

  const counts = statusCounts(ledger);
  const avg = blocks.reduce((a, b) => a + b.frac, 0) / Math.max(1, blocks.length);
  const headline =
    avg < 0.15 ? "Mostly still in the box." : avg < 0.5 ? "Opening moves made." : avg < 0.85 ? "Board control building." : "Endgame ready.";

  return (
    <div className="mt-8 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_440px]">
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-4">
          <h2 className="font-display m-0 text-[34px]">19 patterns</h2>
          <span className="text-sm font-bold text-ink-soft">tap a row to move it up the ladder</span>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[13px] font-[900]">
          <span className="rounded-full bg-card px-3.5 py-1.5 shadow-[0_4px_0_var(--shadow)]">{counts.Untouched} untouched</span>
          <span className="rounded-full bg-pawn px-3.5 py-1.5 shadow-[0_4px_0_var(--pawn-drop)]">{counts.Learning} learning</span>
          <span className="rounded-full bg-shaky px-3.5 py-1.5 shadow-[0_4px_0_var(--shaky-drop)]">{counts.Shaky} shaky</span>
          <span className="rounded-full bg-clean px-3.5 py-1.5 text-white shadow-[0_4px_0_var(--clean-drop)]">{counts.Solid} solid</span>
          <span className="ml-1.5 text-xs font-bold text-ink-soft">Solid = survived a +7 rep clean</span>
        </div>

        <div className="mt-[18px] flex flex-col gap-2">
          {ledger.patterns.map((p, k) => {
            const r = STATUS_RANK[p.status];
            const next = NEXT_STATUS[p.status];
            const note =
              p.status === "Shaky"
                ? p.notes.replace(/\*/g, "") || "failed cue quiz"
                : p.status === "Learning"
                  ? `touched ${p.lastTouched}`
                  : p.status === "Solid"
                    ? "survived the +7"
                    : "untouched";
            return (
              <motion.button
                key={p.pattern}
                whileHover={{ x: 6 }}
                whileTap={next ? { scale: 0.99 } : { x: [0, -4, 4, 0] }}
                onClick={() => next && void setPatternStatus(p.pattern, next)}
                title={next ? `Move to ${next}` : "Solid is earned by a clean +7 rep"}
                className={cn(
                  "grid w-full grid-cols-[34px_1fr_100px] items-center gap-3.5 rounded-[14px] px-4 py-2.5 text-left xl:grid-cols-[34px_1fr_150px_130px]",
                  r > 0 ? "bg-card shadow-[0_6px_0_var(--shadow)]" : "bg-white/55 shadow-[0_3px_0_var(--shadow-light)]",
                )}
              >
                <span className="text-xs font-[900] text-ink-soft">{String(k + 1).padStart(2, "0")}</span>
                <div className="min-w-0">
                  <div className="font-display text-lg leading-[1.1]">{p.pattern}</div>
                  <div
                    title={note}
                    className="line-clamp-1 text-xs font-bold"
                    style={{
                      color: p.status === "Shaky" ? "var(--shaky-drop)" : p.status === "Learning" ? "var(--pawn-drop)" : p.status === "Solid" ? "var(--clean-drop)" : "var(--muted)",
                    }}
                  >
                    {note}
                  </div>
                </div>
                <div className="hidden gap-1 xl:flex">
                  {[0, 1, 2, 3].map((s) => (
                    <i
                      key={s}
                      className="h-2.5 flex-1 rounded-[3px]"
                      style={{ background: s <= r && r > 0 ? STATUS_COL[r] : "var(--table)" }}
                    />
                  ))}
                </div>
                <span
                  className="justify-self-end rounded-full px-3 py-[5px] text-xs font-[900]"
                  style={{
                    background: r > 0 ? STATUS_COL[r] : "#fff",
                    color: r === 3 ? "#fff" : "var(--ink)",
                    boxShadow: r > 0 ? "0 3px 0 rgba(0,0,0,.2)" : "inset 0 0 0 2px var(--shadow)",
                  }}
                >
                  {p.status}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="lg:sticky lg:top-5">
        <div className="rounded-[22px] bg-ink px-6 py-[22px] text-table">
          <div className="kicker text-xs opacity-70">Confidence across the 8 blocks</div>
          <div className="font-display mt-1 text-2xl">{headline}</div>
          <div className="mt-[18px]" style={{ perspective: 900 }}>
            <div
              className="grid h-[190px] grid-cols-8 items-end gap-2.5"
              style={{ transform: "rotateX(14deg)", transformOrigin: "50% 100%" }}
            >
              {blocks.map((b) => (
                <div key={b.short} className="relative flex h-full flex-col justify-end">
                  <div className="absolute inset-0 rounded-lg border-2 border-dashed border-[rgba(223,245,233,.25)]" />
                  <div
                    className="relative min-h-2 rounded-t-lg rounded-b-[4px] shadow-[0_8px_0_rgba(0,0,0,.35)] transition-[height] duration-300"
                    style={{
                      height: `${Math.max(4, b.frac * 100)}%`,
                      background: b.topRank > 0 ? STATUS_COL[b.topRank] : "rgba(223,245,233,.35)",
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-3.5 grid grid-cols-8 gap-2.5">
              {blocks.map((b) => (
                <div key={b.short} className="text-center text-[10px] leading-[1.2] font-[900] opacity-85">
                  {b.short}
                  <div
                    className="font-display mt-[3px] text-sm"
                    style={{ color: b.topRank > 0 ? STATUS_COL[b.topRank] : "rgba(223,245,233,.6)" }}
                  >
                    {b.pct}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 text-xs font-semibold opacity-75">
            Dashed = full confidence (every pattern Solid). Block score: Learning ⅓ · Shaky ½ · Solid 1.
          </div>
        </div>

        <div className="mt-4 rounded-[22px] bg-card px-[22px] py-[18px] shadow-[0_8px_0_var(--shadow)]">
          <div className="kicker text-ink-soft">Status ladder</div>
          <div className="mt-2.5 flex items-center gap-1.5 text-xs font-[900]">
            <span className="flex-1 rounded-[10px] bg-white py-2 text-center shadow-[inset_0_0_0_2px_var(--shadow)]">Untouched</span>
            <span>→</span>
            <span className="flex-1 rounded-[10px] bg-pawn py-2 text-center">Learning</span>
            <span>→</span>
            <span className="flex-1 rounded-[10px] bg-shaky py-2 text-center">Shaky</span>
            <span>→</span>
            <span className="flex-1 rounded-[10px] bg-clean py-2 text-center text-white">Solid</span>
          </div>
        </div>
      </div>
    </div>
  );
}
