# FAANG Prep — Sept 1 → November 2026

Adaptive interview-prep repo. The schedule lives in `plan.md`; the state lives in `progress.md`. Claude is the quiz engine; this repo is its memory.

## Layout

```
plan.md          The 8-week curriculum + rules + checkpoints (read once, revisit weekly)
progress.md      THE ledger — pattern confidence, mistake log, quiz log, checkpoints
dashboard/       Mission Control web app — visualizes + edits the ledger (npm run dev, port 5173)
system-design/   System Design Primer — PARKED, not scheduled (see progress.md §5)
```

The dashboard reads plan.md/progress.md live and writes log rows, rep check-offs, and status bumps back into progress.md — the markdown stays the single source of truth.

## Hosting the mobile mirror

`npm run build` (inside `dashboard/`) bakes a **read-only snapshot** of plan.md + progress.md into `dist/` — deploy that anywhere static and the phone gets the full dashboard, banner-marked read-only (logging stays on this machine, via the dev server).

Point Vercel/Netlify/Cloudflare Pages at this repo with:
- **Root directory:** `dashboard` · **Build:** `npm run build` · **Output:** `dist`

Every push redeploys, so the mirror is only ever as stale as your last commit — which the session ritual already requires. Keep the repo private; the ledger is personal.

## The session ritual

1. **Open:** share `progress.md` with Claude. It runs whatever 1–3–7 reps are due, quizzes shaky patterns, then you start your gear blocks (`plan.md` §1).
2. **During:** every timed solve gets a verdict the moment it ends — Clean / Slow / Hints / Fail — plus a one-line cue takeaway ("sorted + pair → two pointers").
3. **Close:** update `progress.md` — new log rows, rep boxes checked, statuses bumped. Commit. Anything not written down is forgotten by both of us.

## The two rules that make this work

- **Log everything.** The ledger is the adaptive engine; skipped logging = flying blind.
- **1–3–7 without mercy.** Reps come before new problems, always.

## Anti-rule

If you're editing this repo more than you're solving problems, the repo has become the procrastination. Three files is the ceiling — resist the urge to build tooling.
