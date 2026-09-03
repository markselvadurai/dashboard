# FAANG Coding Interview Plan — Sept 1 Start
**Core curriculum: Tue Sep 1 → Sun Nov 1, 2026 · Polish + interviews: November**

Built for: starting rusty · variable daily time (1 hr on busy days, 3–5 hrs split up on normal days) · Big Tech loops · labuladong frameworks as the theory layer.

**The honest math:** ~60 calendar days of core runway, ~45–55 real study days after off days. The buffer is thinner than the original August plan — you can still miss days, but the "at least 3 full study days per week" floor is now load-bearing. Stretch problems (marked hard) are the first thing to cut, never the reps.

**Do this week, non-negotiable:** send out applications. Pipeline lag from application to phone screen is 3–6 weeks — apply now and your first screens arrive right as you hit the back half of the curriculum.

---

## 1. The Two-Gear System

You don't have consistent days, so you get two daily plans. Every morning, pick your gear. Both count as a study day.

### Gear 1 — Busy Day (~60 min, splittable into 2×30)
Maintenance only. Never new hard material.

| Slot | Time | What |
|---|---|---|
| A | 25–30 min | Re-solve **one** problem from your mistake log (reps due today) |
| B | 15 min | Pattern notes / flashcard review — phone-friendly, do it on a commute |
| C | 15–20 min | Watch or read the solution for a problem you'll attempt tomorrow |

### Gear 2 — Normal Day (3–5 hrs, split into blocks anywhere in the day)

| Block | Time | What |
|---|---|---|
| A — Learn | 60–90 min | This week's labuladong framework essay (**one max**) + 1 guided problem + template written from memory |
| B — Solve | 60–90 min | 2 timed solo problems on the pattern (timer caps below) |
| C — Review | 45–60 min | 1–2 spaced reps from the log + update the log + queue tomorrow |
| D — Bonus | 45 min | *Only on 5-hr days:* 1 extra medium, timed, no notes open |

Blocks don't need to be consecutive — morning, lunch, evening works. Phone-friendly work (essays, videos, flashcards) goes in the gaps; timed solves need a keyboard.

**Weekly rhythm:** minimum **3 Gear-2 days per week** — this floor is what keeps the compressed timeline viable. Typical week: 3–4 normal days, 1–2 busy days, 1 rest day. Saturday: longest block + (from Week 4) contest day. Sunday: rest or Gear 1 + a 20-minute weekly review.

---

## 2. Rules of Engagement (non-negotiable)

1. **Timer on every problem.** Easy: 20 min cap. Medium: 35 min cap.
2. **Hit the cap → read the solution.** Actively: understand it, close it, re-implement from blank. This is the system working, not you failing.
3. **Log everything.** Every problem gets a row in the mistake log (§7).
4. **The 1–3–7 rule.** Anything not solved clean gets re-solved: next day, +3 days, +7 days. Reps come *before* new problems.
5. **One language.** Python recommended for interview speed unless you're already fluent in Java/C++. Pick on Day 1, no switching.
6. **Labuladong cap: one essay per learn block.** Read → close the tab → write the template from memory → solve. Reading feels like progress; it isn't until you've reproduced it blind.
7. **Talk out loud** on at least one problem per Gear-2 day starting Week 3. Narrate before typing, like an interviewer is in the room.
8. **Protect sleep.** Pattern memory consolidates offline. A 1-hour rested day beats a 4-hour exhausted one.

---

## 3. Roadmap at a Glance

Follow the **NeetCode 150** roadmap order. Within each topic: Blind-75 problems first, the rest as time allows. Hard-marked problems are for 5-hr days or November — cut freely.

| Week | Dates | Topics | New problems | Milestone |
|---|---|---|---|---|
| 0 | Sep 1–6 | Setup, Big-O reboot, diagnostic, early Arrays | 6–8 | Apps sent · baseline set |
| 1 | Sep 7–13 | Arrays & Hashing (finish) | 8–10 | First clean mediums |
| 2 | Sep 14–20 | Two Pointers + Binary Search | 10–12 | **Checkpoint 1** |
| 3 | Sep 21–27 | Sliding Window + Stack | 11–13 | Narrating aloud |
| 4 | Sep 28–Oct 4 | Linked Lists + Trees I | 12–14 | First contest · **Checkpoint 2** |
| 5 | Oct 5–11 | Trees II + Heaps | 12–14 | Weekly mocks begin |
| 6 | Oct 12–18 | Backtracking + Tries | 10–12 | **Checkpoint 3** |
| 7 | Oct 19–25 | Graphs + Intervals | 12–14 | Hardest week — protect it |
| 8 | Oct 26–Nov 1 | 1D DP + Greedy + consolidation | 10–12 | **Checkpoint 4: interview-ready** |
| 9+ | November | Company tags, 2D DP, mocks 2–3×/wk | flexible | Real interviews |

First-pass total: ~95–110 problems plus ~50–60 spaced reps — the full Blind 75 and most of NeetCode 150.

---

## 4. Phase Details

Each week lists its labuladong reading — that essay is your Block A material for the week's Gear-2 days.

### Phase 0 — Reboot Week (Tue Sep 1 – Sun Sep 6)
- **Day 1–2:** Send applications. Pick your language, set up LeetCode + editor, bookmark NeetCode roadmap and the labuladong repo. Big-O refresher: complexity of every operation on arrays, hash maps, sets, sorting.
- **Day 2 or 3 — Diagnostic:** attempt 4 problems cold, timed — Two Sum, Valid Parentheses, Best Time to Buy/Sell Stock, Reverse Linked List. Don't study for it. Log honestly; you'll re-run these in Week 8.
- **Day 3–6:** Start Arrays & Hashing early — Two Sum, Valid Anagram, Contains Duplicate, Group Anagrams.
- Set up the mistake log (§7).
- *Reading:* labuladong's overall "framework thinking" intro — how templates beat memorization.

### Phase 1 — Foundations (Weeks 1–3)
Goal: pattern recognition on workhorse structures. Week 1 feeling slow is normal when rusty; by Week 3 mediums shouldn't scare you.

- **W1 Arrays & Hashing (finish):** Top K Frequent, Product Except Self, Valid Sudoku, Longest Consecutive Sequence, Encode/Decode Strings. *Reading:* prefix sum + hash map technique essays.
- **W2 Two Pointers:** Valid Palindrome, Two Sum II, 3Sum, Container With Most Water. **Binary Search:** Binary Search, Search Rotated Array, Min in Rotated Array, Koko Eating Bananas, Search 2D Matrix. *Reading:* the binary search boundary framework — this one alone cures off-by-one errors for good.
- **W3 Sliding Window:** Buy/Sell Stock, Longest Substring No Repeats, Character Replacement, Permutation in String. **Stack:** Valid Parens, Min Stack, Evaluate RPN, Daily Temperatures, Generate Parentheses, Car Fleet. *Reading:* sliding window template + monotonic stack essay.

### Phase 2 — Core Patterns (Weeks 4–6)
Where FAANG interviews live.

- **W4 Linked Lists:** Reverse, Merge Two, Cycle Detect, Reorder, Remove Nth, Copy Random Pointer, Add Two Numbers, LRU Cache. **Trees I:** Invert, Max Depth, Diameter, Balanced, Same Tree, Subtree. *Reading:* the two-pointer linked list tricks + the "traverse vs. decompose" tree recursion essays — labuladong's core thesis, and his best work. Don't skip these.
- **W5 Trees II:** LCA of BST, Level Order, Right Side View, Good Nodes, Validate BST, Kth Smallest, Build from Preorder+Inorder. **Heaps:** Kth Largest in Stream, Last Stone Weight, K Closest Points, Kth Largest in Array, Task Scheduler. *Reading:* BST framework essays.
- **W6 Backtracking:** Subsets I/II, Combination Sum I/II, Permutations, Word Search, Palindrome Partitioning, Letter Combinations. **Tries:** Implement Trie, Word Dictionary. *Reading:* the backtracking choose/explore/unchoose framework — read it *before* your first backtracking problem, not after.
- **Saturday of W4 onward:** enter the weekend LeetCode contest (virtual fine). Score irrelevant; the clock is the point.

### Phase 3 — The Hard Stuff (Weeks 7–8)
- **W7 Graphs:** Number of Islands, Clone Graph, Max Area of Island, Rotting Oranges, Pacific Atlantic, Surrounded Regions, Course Schedule I/II, Graph Valid Tree, Count Components. **Intervals:** Insert, Merge, Non-Overlapping, Meeting Rooms I/II. Highest-ROI FAANG topic — if any week gets extra Gear-2 days, it's this one. *Reading:* BFS framework + island/flood-fill series.
- **W8 1D DP:** Climbing Stairs, Min Cost Climbing, House Robber I/II, Longest Palindromic Substring, Palindromic Substrings, Decode Ways, Coin Change, Word Break, Longest Increasing Subsequence. **Greedy:** Max Subarray, Jump Game I/II. Re-run the Phase-0 diagnostic and enjoy the before/after. *Reading:* the DP framework series (state → choices → base case) — the best free DP teaching there is.

### Phase 4 — November (Polish + Real Interviews)
- Switch from roadmap order to **company-tagged problems** (LeetCode Premium earns its cost here — most-frequent tags for your targets, last 6 months).
- 2–3 timed mocks per week: 2 unseen mediums, 45–70 min, out loud, ideally with a peer playing interviewer.
- 2D DP intro (Unique Paths, Longest Common Subsequence, Target Sum) and advanced graphs (topo sort variants, union-find, Dijkstra) — especially for Google.
- Behavioral prep in parallel: 2×30 min/week building STAR stories. Amazon weights this as heavily as coding.
- Keep spaced reps running — old patterns decay fast under new-material pressure.

---

## 5. Checkpoints — How You Know You're On Track

Cold, timed, closed-notes self-tests on the listed Sunday. Pick unseen problems (random button, filtered by difficulty).

| # | Date | The bar |
|---|---|---|
| 1 | Sun Sep 20 | 2 unseen **easies**, 40 min total, both clean |
| 2 | Sun Oct 4 | 1 unseen easy + 1 unseen **medium**, 60 min |
| 3 | Sun Oct 18 | 2 unseen **mediums**, 75 min, narrating aloud |
| 4 | Sun Nov 1 | 2 unseen **mediums**, 60–70 min, clean code + narration |

Checkpoint 4 is the phone-screen bar at most Big Tech companies. (Meta runs faster — ~2 mediums in 40 min — which is what November's tagged, timed practice is for.)

**If you miss a checkpoint:** don't advance. Convert the next week's busy days into review for the gap, retest midweek, and borrow from November. With the tighter runway, missing a checkpoint and rolling forward anyway is the one failure mode this plan can't absorb.

---

## 6. FAANG Tuning Notes

- **Meta:** speed + tagged questions. Famously predictable pool — November tagged grinding matters most here.
- **Google:** novel problems + follow-ups. Prioritize graphs, DP, and explaining trade-offs aloud. Do the 2D DP block.
- **Amazon:** behavioral is half the loop. Leadership Principles stories need real prep in late October/November.
- **Apple/Netflix and most others:** core curriculum covers you; expect practical/domain flavor per team.

---

## 7. The Mistake Log

One spreadsheet or note, one row per problem. This log *is* the plan — the schedule just feeds it.

| Date | Problem | Pattern | Verdict | One-line takeaway | Reps due |
|---|---|---|---|---|---|
| Sep 9 | 3Sum | Two pointers | Hints | Sort first; skip duplicates *after* moving pointer | 10th, 12th, 16th |

Verdicts: **Clean** (in time, no help) · **Slow** (solved, over cap) · **Hints** (peeked) · **Fail** (read full solution). Anything not Clean gets 1–3–7 reps. When a problem survives its +7 rep clean, retire it.

---

## 8. When Life Happens

- **Missed a day?** Resume at the next scheduled day. Never double up.
- **Missed most of a week?** Shift the map right and eat it from November. Order matters more than dates — but know that November is also interview month now, so a lost week costs polish time.
- **A topic isn't clicking?** One extra Gear-2 day max, log it as a weak spot, move on, let the 1–3–7 reps plus November handle it. Momentum beats completeness.
- **Motivation dip (~Week 5, it's coming):** shrink to Gear 1 for a few days rather than stopping. The streak is the asset.

---

## 9. Resources (all you need)

- **NeetCode roadmap + videos** — free; the problem list above follows it.
- **Labuladong** (the *fucking-algorithm* repo / labuladong site) — the framework/theory layer for Block A. Free repo is enough; one essay per block, template from memory, then solve.
- **LeetCode** — where all solving happens. Premium from late October for company tags.
- **Weekend LeetCode contests** — free mock pressure from Week 4.
- A **mistake log** and a **timer**. More resources than this is procrastination with extra steps.

---

## 10. Week Worklists

The §4 phase details as a checkable list — the dashboard reads this table. One `reading` row per week (the Block A essay, labuladong.online) and one `problem` row per solve target. A problem counts as done when it has a mistake-log row; a reading counts as done when it has a Reading Log row (progress.md §7).

| Week | Kind | Item | Pattern |
|---|---|---|---|
| 0 | reading | [How to Think About Data Structure and Algorithm](https://labuladong.online/en/algo/essential-technique/algorithm-summary/) | — |
| 0 | problem | Two Sum | Arrays & Hashing |
| 0 | problem | Valid Parentheses | Stack (classic) |
| 0 | problem | Best Time to Buy and Sell Stock | Sliding Window |
| 0 | problem | Reverse Linked List | Linked Lists |
| 0 | problem | Contains Duplicate | Arrays & Hashing |
| 0 | problem | Valid Anagram | Arrays & Hashing |
| 0 | problem | Group Anagrams | Arrays & Hashing |
| 1 | reading | [Prefix Sum Array Technique](https://labuladong.online/en/algo/data-structure/prefix-sum/) | — |
| 1 | reading | [Basic Concept of HashMap](https://labuladong.online/en/algo/data-structure-basic/hashmap-basic/) | — |
| 1 | problem | Top K Frequent Elements | Arrays & Hashing |
| 1 | problem | Product of Array Except Self | Arrays & Hashing |
| 1 | problem | Valid Sudoku | Arrays & Hashing |
| 1 | problem | Longest Consecutive Sequence | Arrays & Hashing |
| 1 | problem | Encode and Decode Strings | Arrays & Hashing |
| 2 | reading | [Two Pointer Techniques for Array Problems](https://labuladong.online/en/algo/essential-technique/array-two-pointers-summary/) | — |
| 2 | reading | [Binary Search Algorithm Code Template](https://labuladong.online/en/algo/essential-technique/binary-search-framework/) | — |
| 2 | problem | Valid Palindrome | Two Pointers |
| 2 | problem | Two Sum II | Two Pointers |
| 2 | problem | 3Sum | Two Pointers |
| 2 | problem | Container With Most Water | Two Pointers |
| 2 | problem | Binary Search | Binary Search (classic) |
| 2 | problem | Search in Rotated Sorted Array | Binary Search (classic) |
| 2 | problem | Find Minimum in Rotated Sorted Array | Binary Search (classic) |
| 2 | problem | Koko Eating Bananas | Binary Search on the Answer |
| 2 | problem | Search a 2D Matrix | Binary Search (classic) |
| 3 | reading | [Sliding Window Algorithm Code Template](https://labuladong.online/en/algo/essential-technique/sliding-window-framework/) | — |
| 3 | reading | [Monotonic Stack Code Template](https://labuladong.online/en/algo/data-structure/monotonic-stack/) | — |
| 3 | problem | Longest Substring Without Repeating Characters | Sliding Window |
| 3 | problem | Longest Repeating Character Replacement | Sliding Window |
| 3 | problem | Permutation in String | Sliding Window |
| 3 | problem | Min Stack | Stack (classic) |
| 3 | problem | Evaluate Reverse Polish Notation | Stack (classic) |
| 3 | problem | Daily Temperatures | Monotonic Stack |
| 3 | problem | Generate Parentheses | Stack (classic) |
| 3 | problem | Car Fleet | Monotonic Stack |
| 4 | reading | [Two Pointer Techniques for Linked List Problems](https://labuladong.online/en/algo/essential-technique/linked-list-skills-summary/) | — |
| 4 | reading | [Thinking Recursion Algorithms from Binary Tree Perspective](https://labuladong.online/en/algo/essential-technique/binary-tree-summary/) | — |
| 4 | problem | Merge Two Sorted Lists | Linked Lists |
| 4 | problem | Linked List Cycle | Linked Lists |
| 4 | problem | Reorder List | Linked Lists |
| 4 | problem | Remove Nth Node From End of List | Linked Lists |
| 4 | problem | Copy List with Random Pointer | Linked Lists |
| 4 | problem | Add Two Numbers | Linked Lists |
| 4 | problem | LRU Cache | Linked Lists |
| 4 | problem | Invert Binary Tree | Trees I (traversal) |
| 4 | problem | Maximum Depth of Binary Tree | Trees I (traversal) |
| 4 | problem | Diameter of Binary Tree | Trees I (traversal) |
| 4 | problem | Balanced Binary Tree | Trees I (traversal) |
| 4 | problem | Same Tree | Trees I (traversal) |
| 4 | problem | Subtree of Another Tree | Trees I (traversal) |
| 5 | reading | [Binary Search Tree in Action, Part 1 (In-order)](https://labuladong.online/en/algo/data-structure/bst-part1/) | — |
| 5 | problem | Lowest Common Ancestor of a BST | Trees II (BST) |
| 5 | problem | Binary Tree Level Order Traversal | Trees II (BST) |
| 5 | problem | Binary Tree Right Side View | Trees II (BST) |
| 5 | problem | Count Good Nodes in Binary Tree | Trees II (BST) |
| 5 | problem | Validate Binary Search Tree | Trees II (BST) |
| 5 | problem | Kth Smallest Element in a BST | Trees II (BST) |
| 5 | problem | Construct Binary Tree from Preorder and Inorder | Trees II (BST) |
| 5 | problem | Kth Largest Element in a Stream | Heaps |
| 5 | problem | Last Stone Weight | Heaps |
| 5 | problem | K Closest Points to Origin | Heaps |
| 5 | problem | Kth Largest Element in an Array | Heaps |
| 5 | problem | Task Scheduler | Heaps |
| 6 | reading | [Backtracking Algorithm Common Patterns and Code Template](https://labuladong.online/en/algo/essential-technique/backtrack-framework/) | — |
| 6 | problem | Subsets | Backtracking |
| 6 | problem | Subsets II | Backtracking |
| 6 | problem | Combination Sum | Backtracking |
| 6 | problem | Combination Sum II | Backtracking |
| 6 | problem | Permutations | Backtracking |
| 6 | problem | Word Search | Backtracking |
| 6 | problem | Palindrome Partitioning | Backtracking |
| 6 | problem | Letter Combinations of a Phone Number | Backtracking |
| 6 | problem | Implement Trie | Tries |
| 6 | problem | Design Add and Search Words | Tries |
| 7 | reading | [BFS Algorithm Common Patterns and Code Template](https://labuladong.online/en/algo/essential-technique/bfs-framework/) | — |
| 7 | reading | [Solve All Island Problems with DFS](https://labuladong.online/en/algo/frequency-interview/island-dfs-summary/) | — |
| 7 | problem | Number of Islands | Graphs (BFS/DFS) |
| 7 | problem | Clone Graph | Graphs (BFS/DFS) |
| 7 | problem | Max Area of Island | Graphs (BFS/DFS) |
| 7 | problem | Rotting Oranges | Graphs (BFS/DFS) |
| 7 | problem | Pacific Atlantic Water Flow | Graphs (BFS/DFS) |
| 7 | problem | Surrounded Regions | Graphs (BFS/DFS) |
| 7 | problem | Course Schedule | Graphs (BFS/DFS) |
| 7 | problem | Course Schedule II | Graphs (BFS/DFS) |
| 7 | problem | Graph Valid Tree | Graphs (BFS/DFS) |
| 7 | problem | Count Connected Components | Graphs (BFS/DFS) |
| 7 | problem | Insert Interval | Intervals |
| 7 | problem | Merge Intervals | Intervals |
| 7 | problem | Non-Overlapping Intervals | Intervals |
| 7 | problem | Meeting Rooms | Intervals |
| 7 | problem | Meeting Rooms II | Intervals |
| 8 | reading | [Dynamic Programming Common Patterns and Code Template](https://labuladong.online/en/algo/essential-technique/dynamic-programming-framework/) | — |
| 8 | problem | Climbing Stairs | 1D DP |
| 8 | problem | Min Cost Climbing Stairs | 1D DP |
| 8 | problem | House Robber | 1D DP |
| 8 | problem | House Robber II | 1D DP |
| 8 | problem | Longest Palindromic Substring | 1D DP |
| 8 | problem | Palindromic Substrings | 1D DP |
| 8 | problem | Decode Ways | 1D DP |
| 8 | problem | Coin Change | 1D DP |
| 8 | problem | Word Break | 1D DP |
| 8 | problem | Longest Increasing Subsequence | 1D DP |
| 8 | problem | Maximum Subarray | Greedy |
| 8 | problem | Jump Game | Greedy |
| 8 | problem | Jump Game II | Greedy |
