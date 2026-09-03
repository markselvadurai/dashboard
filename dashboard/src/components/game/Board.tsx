import { motion, useReducedMotion } from "motion/react";
import type { BoardDay } from "@/data/derive";

/** The arc as an isometric 62-tile board. rows = weeks W0–W8, cols Mon→Sun. */

const SIZES = {
  lg: { tile: 46, gap: 6, radius: 8, pole: { w: 4, h: 70, left: 20, bottom: 20 }, pennant: { w: 34, h: 14 }, pawn: 28, hover: true },
  md: { tile: 42, gap: 6, radius: 7, pole: { w: 4, h: 64, left: 18, bottom: 18 }, pennant: { w: 30, h: 12 }, pawn: 26, hover: false },
  sm: { tile: 16, gap: 3, radius: 3, pole: { w: 2, h: 26, left: 7, bottom: 7 }, pennant: { w: 12, h: 5 }, pawn: 10, hover: false },
} as const;

export function Board({
  days,
  size = "lg",
  punchPulse = 0,
}: {
  days: BoardDay[];
  size?: keyof typeof SIZES;
  /** bump to make the pawn hop (punch-in) */
  punchPulse?: number;
}) {
  const s = SIZES[size];
  const reduced = useReducedMotion();
  const unrotate = "rotateZ(38deg) rotateX(-58deg)";

  return (
    <div
      role="img"
      aria-label="The 62-day board: green tiles are studied days, flags are checkpoint gates, the pawn stands on today"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(7, ${s.tile}px)`,
        gridAutoRows: `${s.tile}px`,
        gap: s.gap,
        transform: "rotateX(58deg) rotateZ(-38deg)",
        transformStyle: "preserve-3d",
      }}
    >
      {days.map((d) => {
        const fill = d.studied ? "var(--clean)" : d.gate ? "var(--gate)" : "#fff";
        const shadow =
          size === "sm"
            ? d.studied
              ? "0 4px 0 var(--clean-drop)"
              : "0 2px 0 var(--shadow)"
            : d.studied
              ? "0 10px 0 var(--clean-drop), 0 16px 12px rgba(0,0,0,.18)"
              : "0 6px 0 var(--shadow), 0 10px 10px rgba(0,0,0,.08)";
        return (
          <div
            key={d.i}
            title={`${d.label}${d.studied ? " · studied" : ""}${d.gate ? " · checkpoint gate" : ""}`}
            className={s.hover ? "board-tile" : undefined}
            style={{
              gridColumn: d.gc,
              gridRow: d.gr,
              background: fill,
              borderRadius: s.radius,
              boxShadow: shadow,
              transform: d.studied ? "translateZ(10px)" : "translateZ(0)",
              transformStyle: "preserve-3d",
              position: "relative",
              transition: "transform .25s, background .25s",
            }}
          >
            {d.gate && (
              <div
                style={{
                  position: "absolute",
                  left: s.pole.left,
                  bottom: s.pole.bottom,
                  width: s.pole.w,
                  height: s.pole.h,
                  background: "var(--ink)",
                  transformOrigin: "50% 100%",
                  transform: unrotate,
                  transformStyle: "preserve-3d",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: s.pole.w,
                    top: 0,
                    width: 0,
                    height: 0,
                    borderTop: `${s.pennant.h}px solid transparent`,
                    borderBottom: `${s.pennant.h}px solid transparent`,
                    borderLeft: `${s.pennant.w}px solid var(--fail)`,
                  }}
                />
              </div>
            )}
            {d.isToday && (
              <motion.div
                key={punchPulse}
                initial={reduced || punchPulse === 0 ? false : { y: -18 }}
                animate={{ y: 0 }}
                transition={{ type: "spring", stiffness: 420, damping: 26 }}
                style={{
                  position: "absolute",
                  left: Math.round(s.tile * 0.18),
                  bottom: Math.round(s.tile * 0.24),
                  width: s.pawn,
                  transformOrigin: "50% 100%",
                  transform: `${unrotate} translateZ(4px)`,
                  transformStyle: "preserve-3d",
                }}
              >
                <div
                  className="anim-wob"
                  style={{
                    width: s.pawn,
                    height: s.pawn,
                    borderRadius: "50%",
                    background: "var(--pawn)",
                    boxShadow: "inset -6px -6px 0 rgba(0,0,0,.15), 0 10px 6px -4px rgba(0,0,0,.3)",
                  }}
                />
                <div
                  style={{
                    width: Math.round(s.pawn * 1.2),
                    height: Math.round(s.pawn * 0.7),
                    margin: `-${Math.round(s.pawn * 0.2)}px 0 0 -${Math.round(s.pawn * 0.1)}px`,
                    borderRadius: "0 0 12px 12px",
                    background: "var(--pawn)",
                    boxShadow: "inset -6px -4px 0 rgba(0,0,0,.15)",
                  }}
                />
              </motion.div>
            )}
          </div>
        );
      })}
      <style>{`.board-tile:hover{transform:translateZ(18px) !important}`}</style>
    </div>
  );
}

export function BoardLegend() {
  return (
    <div className="flex flex-wrap gap-4 text-[13px] font-bold text-ink-soft">
      <span className="flex items-center gap-1.5">
        <i className="inline-block size-3 rounded-[3px] bg-clean" /> studied
      </span>
      <span className="flex items-center gap-1.5">
        <i className="inline-block size-3 rounded-[3px] bg-white shadow-[0_2px_0_var(--shadow)]" /> ahead
      </span>
      <span className="flex items-center gap-1.5">
        <i
          className="inline-block"
          style={{ width: 0, height: 0, borderTop: "6px solid transparent", borderBottom: "6px solid transparent", borderLeft: "12px solid var(--fail)" }}
        />{" "}
        checkpoint gate
      </span>
      <span>rows = weeks W0–W8</span>
    </div>
  );
}
