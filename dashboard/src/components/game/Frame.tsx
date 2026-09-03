import { cn } from "@/lib/utils";
import type { BoardDay } from "@/data/derive";
import { daysRemaining, GATE_LABELS, nextGate } from "@/data/derive";

/* ─── shared header: brand · nav pill · context ─── */

export type ViewId = "today" | "patterns" | "ledger" | "roadmap";
export const VIEW_LABELS: Record<ViewId, string> = {
  today: "Today",
  patterns: "Patterns",
  ledger: "Ledger",
  roadmap: "Roadmap",
};

export function Brand({ small }: { small?: boolean }) {
  return (
    <div className={cn("font-display flex items-center whitespace-nowrap", small ? "gap-2 text-xl" : "gap-2.5 text-[26px]")}>
      <i
        className={cn("inline-block rounded-full bg-pawn", small ? "size-6" : "size-[30px]")}
        style={{ boxShadow: "inset -6px -6px 0 rgba(0,0,0,.15)" }}
      />
      Mission Control
    </div>
  );
}

export function NavPill({
  view,
  onChange,
  className,
  stretch,
}: {
  view: ViewId;
  onChange: (v: ViewId) => void;
  className?: string;
  stretch?: boolean;
}) {
  return (
    <nav
      aria-label="Views"
      className={cn("flex gap-1.5 rounded-full bg-card p-[5px] shadow-[0_6px_0_var(--shadow)]", className)}
    >
      {(Object.keys(VIEW_LABELS) as ViewId[]).map((v) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          aria-current={view === v ? "page" : undefined}
          className={cn(
            "rounded-full px-[18px] py-2 text-sm transition-colors",
            stretch && "flex-1 px-0 text-center",
            view === v ? "bg-ink font-[900] text-table" : "font-bold hover:bg-table",
          )}
        >
          {VIEW_LABELS[v]}
        </button>
      ))}
    </nav>
  );
}

export function ContextLine({ dateLabel, weekLine }: { dateLabel: string; weekLine: string }) {
  return (
    <div className="text-[15px] font-bold text-ink-soft">
      <b className="text-ink">{dateLabel}</b> · {weekLine}
    </div>
  );
}

/* ─── compact arc rail (Patterns / Ledger) ─── */

export function ArcRail({ days, streak, today }: { days: BoardDay[]; streak: number; today: Date }) {
  return (
    <div className="grail mt-[22px] flex items-center gap-[22px] px-[22px] py-3">
      <div className="flex items-baseline gap-1.5">
        <span className="font-display text-[40px] leading-none">{daysRemaining(today)}</span>
        <span className="text-[13px] font-bold text-ink-soft">days to Nov 1</span>
      </div>
      <div className="flex items-center gap-1.5 text-[13px] font-[900]">
        <span className="anim-flick">🔥</span>
        {streak}d
      </div>
      <div className="flex flex-1 items-center gap-[3px]">
        {days.map((d) => {
          const fill = d.isToday
            ? "var(--pawn)"
            : d.studied
              ? "var(--clean)"
              : d.gate
                ? "var(--fail)"
                : "var(--table)";
          const h = d.gate ? 26 : d.studied || d.isToday ? 20 : 12;
          return (
            <i
              key={d.i}
              title={d.label}
              style={{
                flex: 1,
                height: h,
                borderRadius: 3,
                background: fill,
                boxShadow: d.studied || d.gate || d.isToday ? "0 3px 0 rgba(0,0,0,.2)" : "none",
              }}
            />
          );
        })}
      </div>
      <div className="hidden text-xs font-[900] text-fail lg:block">⚑ {GATE_LABELS.join(" · ")}</div>
    </div>
  );
}

/* ─── chips ─── */

export function StreakChip({ streak, small }: { streak: number; small?: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-2xl bg-card shadow-[0_6px_0_var(--shadow)]",
        small ? "px-3 py-1.5" : "px-3.5 py-2.5",
      )}
    >
      <span className={cn("anim-flick", small ? "text-base" : "text-2xl")}>🔥</span>
      <div>
        <div className={cn("font-display leading-none", small ? "text-base" : "text-[22px]")}>
          {streak} day{streak === 1 ? "" : "s"}
        </div>
        {!small && <div className="text-xs font-bold text-ink-soft">roll again tomorrow → {streak + 1}</div>}
      </div>
    </div>
  );
}

export function ProgressChip({ studiedCount, today }: { studiedCount: number; today: Date }) {
  const gate = nextGateText(today);
  return (
    <div className="rounded-2xl bg-card px-3.5 py-2.5 shadow-[0_6px_0_var(--shadow)]">
      <div className="font-display text-[22px] leading-none">
        {studiedCount} <span className="text-[13px]">of 62 tiles</span>
      </div>
      <div className="text-xs font-bold text-ink-soft">{gate}</div>
    </div>
  );
}

export function nextGateText(today: Date): string {
  const g = nextGate(today);
  return g ? `next flag: ${g.label} · ${g.inDays} tiles` : "all flags planted";
}

export function FlagIcon({ size = 22 }: { size?: number }) {
  const h = Math.round(size * 0.55);
  return (
    <i
      aria-hidden
      style={{
        width: 0,
        height: 0,
        borderTop: `${h}px solid transparent`,
        borderBottom: `${h}px solid transparent`,
        borderLeft: `${size}px solid var(--fail)`,
        display: "inline-block",
      }}
    />
  );
}
