import { useLedgerStore } from "@/data/store";
import type { WorklistStatus } from "@/data/derive";
import type { WorklistItem } from "@/data/types";
import { cn } from "@/lib/utils";

/** One week's targets: the Block A essay + the solve list.
 *  Problems are never "checked" by hand — clicking one preloads the Quick log,
 *  because a solve only counts with a verdict. Readings check straight into
 *  the Reading Log. */
export function WorklistItems({
  items,
  week,
  onLogProblem,
  limit,
}: {
  items: WorklistStatus[];
  week: string;
  onLogProblem?: (item: WorklistItem) => void;
  limit?: number;
}) {
  const { addReading, readOnly } = useLedgerStore();
  const reading = items.find((i) => i.item.kind === "reading");
  const problems = items.filter((i) => i.item.kind === "problem");
  const undone = problems.filter((p) => !p.done);
  const shown = limit ? undone.slice(0, limit) : problems;
  const hidden = limit ? undone.length - shown.length : 0;
  const doneCount = problems.length - undone.length;

  return (
    <div className="flex flex-col gap-2">
      {reading && (
        <div
          className={cn(
            "flex items-center gap-2.5 rounded-xl px-3 py-2",
            reading.done ? "bg-clean/15" : "bg-table",
          )}
        >
          <span className="kicker shrink-0 text-ink-soft">Essay</span>
          <a
            href="https://labuladong.online/en/"
            target="_blank"
            rel="noreferrer"
            className="min-w-0 flex-1 truncate text-[13px] font-bold text-ink underline decoration-shadow underline-offset-2 hover:decoration-ink"
            title={`${reading.item.item} — labuladong.online`}
          >
            {reading.item.item}
          </a>
          {reading.done ? (
            <span className="shrink-0 rounded-full bg-clean px-2.5 py-1 text-[11px] font-[900] text-white shadow-[0_3px_0_var(--clean-drop)]">
              read ✓
            </span>
          ) : (
            <button
              disabled={readOnly}
              onClick={() => void addReading({ essay: reading.item.item, week })}
              className="press-sm shrink-0 px-2.5 py-1 text-[11px] font-[900] text-ink disabled:opacity-50"
              style={{ background: "var(--shaky)", ["--drop" as string]: "var(--shaky-drop)" }}
              title="Read it, closed the tab, wrote the template from memory"
            >
              mark read
            </button>
          )}
        </div>
      )}
      <div className="flex flex-wrap gap-1.5">
        {shown.map(({ item, done }) => (
          <button
            key={item.item}
            disabled={done || readOnly || !onLogProblem}
            onClick={() => onLogProblem?.(item)}
            title={done ? "In the mistake log" : `Log ${item.item} (${item.pattern})`}
            className={cn(
              "flex items-center gap-1.5 rounded-[10px] px-2.5 py-1.5 text-xs font-[900] transition-transform",
              done
                ? "bg-clean text-white shadow-[0_3px_0_var(--clean-drop)]"
                : "bg-card text-ink shadow-[inset_0_0_0_2px_var(--shadow)]",
              !done && onLogProblem && !readOnly && "cursor-pointer hover:-translate-y-0.5 hover:shadow-[inset_0_0_0_2px_var(--ink)]",
            )}
          >
            <i
              className={cn(
                "grid size-3.5 shrink-0 place-items-center rounded-[4px] text-[9px] not-italic",
                done ? "bg-white/25" : "bg-table",
              )}
            >
              {done ? "✓" : ""}
            </i>
            {item.item}
          </button>
        ))}
        {limit !== undefined && (hidden > 0 || doneCount > 0) && (
          <span className="self-center px-1 text-[11px] font-bold text-ink-soft">
            {hidden > 0 && `+${hidden} more`}
            {hidden > 0 && doneCount > 0 && " · "}
            {doneCount > 0 && `${doneCount} logged ✓`}
          </span>
        )}
      </div>
    </div>
  );
}
