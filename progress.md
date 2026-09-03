# progress.md — the ledger

This file is the memory of the whole system. Session ritual: **open this file to Claude at the start of every session** → Claude runs whatever reps are due and quizzes weak patterns → every problem and quiz gets logged before the session ends. If it isn't in this file, it didn't happen.

Statuses: **Untouched** → **Learning** (currently studying) → **Shaky** (touched, not reliable) → **Solid** (survived a +7 rep clean).

---

## 1. Pattern Confidence

| Pattern | Week | Status | Last touched | Notes |
|---|---|---|---|---|
| Arrays & Hashing | 0–1 | Learning | Sep 3 | 8/9 NeetCode solved Sep 3 (3 Clean, 4 Slow, 1 Hints) → 5 rep chains running; Big-O phrasing needs polish |
| Two Pointers | 2 | Untouched | Sep 3 | Cue confirmed Sep 3 quiz (sorted+pair → converge + discard proof); solving starts W2 |
| Binary Search (classic) | 2 | Untouched | — | |
| Binary Search on the Answer | 2 | **Shaky** | Sep 2 | Failed cue quiz; cue = "smallest/largest X such that condition holds" |
| Sliding Window | 3 | Untouched | — | Cue recognized twice in quizzes — solving still untouched |
| Stack (classic) | 3 | Untouched | — | |
| Monotonic Stack | 3 | **Shaky** | Sep 2 | Failed cue quiz; cue = "next greater / first X to the right" |
| Linked Lists | 4 | Untouched | — | |
| Trees I (traversal) | 4 | Untouched | — | |
| Trees II (BST) | 5 | Untouched | — | |
| Heaps | 5 | Untouched | — | |
| Backtracking | 6 | Untouched | — | |
| Tries | 6 | Untouched | — | |
| Graphs (BFS/DFS) | 7 | Untouched | — | |
| Intervals | 7 | Untouched | — | |
| 1D DP | 8 | Untouched | — | |
| Greedy | 8 | Untouched | — | |
| 2D DP | Nov | Untouched | — | |
| Advanced Graphs | Nov | Untouched | — | Only if Google-style loops |

---

## 2. Mistake Log (1–3–7 reps)

Verdicts: **Clean** · **Slow** · **Hints** · **Fail**. Anything not Clean gets reps at +1, +3, +7 days. Survives its +7 clean → retire the row, upgrade the pattern.

| Date | Problem | Pattern | Verdict | One-line takeaway | Reps due |
|---|---|---|---|---|---|
| Sep 2 | Cue quiz: BS-on-the-answer | Binary search (answer) | Fail | "Smallest X satisfying condition" → search the answer space, greedy feasibility check | Sep 4 · Sep 6 · Sep 10 |
| Sep 2 | Cue quiz: monotonic stack | Monotonic stack | Fail | "Next greater / first taller to the right" → mono stack, newcomers resolve waiters | with W3 Stack study |
| Sep 3 | Contains Duplicate | Arrays & Hashing | Clean | Seen-before? → hash-set membership | — |
| Sep 3 | Valid Anagram | Arrays & Hashing | Clean | Compare letter-count maps (or sorted strings) | — |
| Sep 3 | Two Sum | Arrays & Hashing | Clean | Unsorted pair-target → one-pass hashmap of complements; sorting is O(n log n) and loses indices | — |
| Sep 3 | Group Anagrams | Arrays & Hashing | Slow | Anagram bucket key = 26-letter count tuple (immutable → hashable) | Sep 4 · Sep 6 · Sep 10 |
| Sep 3 | Top K Frequent Elements | Arrays & Hashing | Slow | Count map first, then heap or bucket-by-frequency for the top k | Sep 4 · Sep 6 · Sep 10 |
| Sep 3 | Encode and Decode Strings | Arrays & Hashing | Hints | Length-prefix each string ("4#abcd") — delimiters can appear inside the data | Sep 4 · Sep 6 · Sep 10 |
| Sep 3 | Product of Array Except Self | Arrays & Hashing | Slow | output[i] = prefix product (before i) × suffix product (after i); follow-up: fold a running product into output for O(1) space | Sep 4 · Sep 6 · Sep 10 |
| Sep 3 | Valid Sudoku | Arrays & Hashing | Slow | 9 row sets + 9 col sets + 9 box sets; box id = (r//3, c//3) | Sep 4 · Sep 6 · Sep 10 |

*(Sep 2 cue chains re-aligned to roadmap order Sep 3: BS-on-answer rep runs with the W2 start (Sep 4); monotonic stack waits for W3 Stack study. Nothing failed — deferred by design: quiz only touched material.)*

---

## 3. Quiz Log

| Date | Quiz | Score | Outcome |
|---|---|---|---|
| Sep 2 | Pattern cues #1 (5Q) | 3/5* | Missed BS-on-answer + mono stack → seeded reps above. *Q2 (two pointers) never reported |
| Sep 3 | Cue rep #1 (4Q, A&H edition) | 4/4* | Q1: two-pointers cue confirmed (sorted+pair → converge, each move *discards* candidates). Q2–Q4 A&H retention all passed. *Language flags: said "O(log n)" for sort cost and pass count (→ O(n log n) / O(n)); said "sum" for "product" and swapped prefix/suffix names — drill Big-O phrasing aloud. W2/W3 cue reps deferred to topic start. Bonus AM rep: hashmap key immutability + Java cached-hash — Clean |

---

## 4. Checkpoints

| # | Date | Bar | Result |
|---|---|---|---|
| 1 | Sun Sep 20 | 2 unseen easies, 40 min, both clean | — |
| 2 | Sun Oct 4 | 1 easy + 1 medium, 60 min | — |
| 3 | Sun Oct 18 | 2 mediums, 75 min, narrated | — |
| 4 | Sun Nov 1 | 2 mediums, 60–70 min, clean + narrated | — |

---

## 5. Open Decisions

- **System Design Primer placement:** RESOLVED Sep 2 — targeting **new-grad roles**, so the Primer is November-optional. Week 6 stays as scheduled; revisit only if a specific loop adds a design round.

---

## 6. Application Pipeline (new-grad)

Second job of this repo: track the hunt. One row per application; update status as it moves. Statuses: **Applied** → **OA** → **Phone** → **Onsite** → **Offer** / **Rejected** / **Ghosted**.

**Warm referral channels (agreed Sep 2026):** RBC (former RBC Edge colleagues) · TD. Activate when a specific new-grad req opens: send the referrer the posting link + tailored resume same-day — referrals attach to a requisition, not to a person in the abstract. Watch both banks' early-talent boards; ask contacts to flag internal postings early.

| Company | Role | Applied | Status | Next step |
|---|---|---|---|---|

---

## 7. Reading Log

One row per labuladong essay finished (read → tab closed → template written from memory). The dashboard checks worklist readings (plan.md §10) against this table.

| Date | Essay | Week |
|---|---|---|
