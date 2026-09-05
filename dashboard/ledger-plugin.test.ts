import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { appendRow, updateRow } from "./ledger-plugin";
import { parseProgress, parseRepsCell, serializeReps, parsePlan } from "./src/data/parse";

const progress = fs.readFileSync(path.join(__dirname, "..", "progress.md"), "utf8");
const plan = fs.readFileSync(path.join(__dirname, "..", "plan.md"), "utf8");

describe("markdown surgery on the real ledger", () => {
  it("appendRow adds exactly one line to the mistake log, touching nothing else", () => {
    const after = appendRow(progress, "Mistake Log", [
      "Sep 2",
      "Two Sum",
      "Arrays & Hashing",
      "Clean",
      "hash map lookup",
      "—",
    ]);
    const beforeLines = progress.split("\n");
    const afterLines = after.split("\n");
    expect(afterLines.length).toBe(beforeLines.length + 1);
    const added = afterLines.filter((l) => !beforeLines.includes(l));
    expect(added).toEqual(["| Sep 2 | Two Sum | Arrays & Hashing | Clean | hash map lookup | — |"]);
    // the italic note under the table survives, still after the appended row
    const noteIdx = afterLines.findIndex((l) => l.startsWith("*("));
    const rowIdx = afterLines.findIndex((l) => l === added[0]);
    expect(noteIdx).toBeGreaterThan(-1);
    expect(rowIdx).toBeLessThan(noteIdx);
  });

  it("updateRow rewrites only the matched row's target cells", () => {
    const after = updateRow(
      progress,
      "Mistake Log",
      { 0: "Sep 2", 1: "Cue quiz: BS-on-the-answer" },
      { 5: "Sep 3 ✅ · Sep 5 ✅ · Sep 9" },
    );
    const changed = after
      .split("\n")
      .filter((l, i) => l !== progress.split("\n")[i]);
    expect(changed.length).toBe(1);
    expect(changed[0]).toContain("Sep 5 ✅");
    expect(changed[0]).toContain("Cue quiz: BS-on-the-answer");
  });

  it("updateRow throws when nothing matches", () => {
    expect(() => updateRow(progress, "Mistake Log", { 0: "Jan 1", 1: "Nope" }, { 5: "x" })).toThrow(/matched 0/);
  });

  it("pattern status update hits the right row", () => {
    const after = updateRow(progress, "Pattern Confidence", { 0: "Monotonic Stack" }, { 2: "Learning", 3: "Sep 2" });
    expect(after).toContain("| Monotonic Stack | 3 | Learning | Sep 2 |");
    expect(after).toContain("| Binary Search on the Answer | 2 | **Shaky** |"); // untouched sibling
  });
});

describe("parsers on the real files", () => {
  it("parses all four progress tables", () => {
    const ledger = parseProgress(progress);
    expect(ledger.patterns.length).toBe(19);
    // the ledger grows; assert floors + shape, not snapshots
    expect(ledger.mistakeLog.length).toBeGreaterThanOrEqual(12);
    expect(ledger.quizLog.length).toBeGreaterThanOrEqual(2);
    expect(ledger.checkpoints.length).toBe(4);
    expect(ledger.openDecisions.length).toBeGreaterThan(0);
    expect(ledger.patterns.find((p) => p.pattern === "Monotonic Stack")?.status).toBe("Shaky");
  });

  it("parses rep chains with states", () => {
    // literal cell, not the live ledger — chain states evolve daily
    expect(parseRepsCell("Sep 3 ✅ · Sep 5 ❌ · Sep 9")).toEqual([
      { date: "Sep 3", state: "done" },
      { date: "Sep 5", state: "missed" },
      { date: "Sep 9", state: "pending" },
    ]);
  });

  it("reps cell round-trips exactly", () => {
    const cell = "Sep 3 ✅ · Sep 5 · Sep 9";
    expect(serializeReps(parseRepsCell(cell))).toBe(cell);
    expect(serializeReps(parseRepsCell("—"))).toBe("—");
  });

  it("parses the plan roadmap and gear tables", () => {
    const p = parsePlan(plan);
    // the "9+" November row has no parseable date range and is dropped by design
    expect(p.roadmap.length).toBe(9);
    expect(p.roadmap[0].start.getMonth()).toBe(8);
    expect(p.roadmap[8].dates).toContain("Oct 26");
    expect(p.gear1.length).toBe(3);
    expect(p.gear2.length).toBe(4);
  });

  it("parses the week worklists", () => {
    const p = parsePlan(plan);
    expect(p.worklist.length).toBe(109);
    expect(p.worklist.filter((w) => w.kind === "reading").length).toBe(14);
    expect(p.worklist.filter((w) => w.kind === "diagnostic").length).toBe(4);
    const koko = p.worklist.find((w) => w.item === "Koko Eating Bananas");
    expect(koko).toMatchObject({ week: "2", kind: "problem", pattern: "Binary Search on the Answer" });
    // reading cells are markdown links → title + url split apart
    const dp = p.worklist.find((w) => w.item.startsWith("Dynamic Programming"));
    expect(dp?.link).toBe("https://labuladong.online/en/algo/essential-technique/dynamic-programming-framework/");
    expect(dp?.item).not.toContain("](");
  });

  it("one log row checks off one worklist copy, earliest week first", async () => {
    const { worklistStatuses } = await import("./src/data/derive");
    const p = parsePlan(plan);
    const ledger = parseProgress(progress);
    // Valid Parentheses is logged once (Sep 5 diagnostic): W0 copy done, W3 in-topic copy still open
    const copies = worklistStatuses(p, ledger).filter((s) => s.item.item === "Valid Parentheses");
    expect(copies.map((c) => [c.item.week, c.item.kind, c.done])).toEqual([
      ["0", "diagnostic", true],
      ["3", "problem", false],
    ]);
    // Two Sum ≠ Two Sum II — no cross-crediting
    const ts2 = worklistStatuses(p, ledger).find((s) => s.item.item === "Two Sum II");
    expect(ts2?.done).toBe(false);
  });

  it("parses the (empty) reading log and accepts appended rows", () => {
    expect(parseProgress(progress).readingLog).toEqual([]);
    const after = appendRow(progress, "Reading Log", ["Sep 3", "Framework thinking intro", "0"]);
    expect(parseProgress(after).readingLog).toEqual([
      { date: "Sep 3", essay: "Framework thinking intro", week: "0" },
    ]);
  });
});
