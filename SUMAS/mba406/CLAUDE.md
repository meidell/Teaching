# SUMAS · MBA406 — notes for Claude

Split out of the root `CLAUDE.md` on 23 Oct 2026 (one file per course, loaded when working in this folder). The site-wide rules — shared runtime, data model, rules, secrets, conventions — stay in the root `CLAUDE.md`; read that first.

## SUMAS · MBA406 Managerial Finance — `SUMAS/mba406/`

Built 2 Oct 2026 on the **MBA401 pattern** — same engine, same page
anatomy, same grading — for the SUMAS Fall 2026 syllabus: 9 teaching weeks
of 3 h (Thursdays 9–12, Gland, Butterfly I) + Week 10, the final exam.
Textbook: Brealey, Myers & Marcus, *Fundamentals of Corporate Finance*,
11th ed. Everything the HEG/statistics and MBA401 sections say about the
engine (exercises.js, answers.js, releases, the progress-denominator trap,
presence needing an account) applies. What differs:

- **One page per week, no A/B parts.** `week1.html`, `week2.html` …; module
  ids `w1`, `w1-hw`, `w2`, `w2-hw`; attendance sessions `w1`…`w9`, one per
  week, so presence mounts with `mod:MOD`. `presenceSessions` is 9. Weeks
  3–10 have **no pages yet** — `live:false` in `courseprogress.js`, locked
  on the hub, no scaffolds; the hub card is a `div` with no href.
- **The runtime files are renamed ports of MBA401's**, byte-comparable apart
  from the namespace, the `mba406_*` keys and the copy: `exercises.js`,
  `answers.js`, `presence.js` (its `SESSIONS` list is the nine weeks),
  `courseprogress.js`. `fin.css` is `stats.css` **unchanged, plus a block
  at the END** (`.fs` statement tables, `.kpi` tiles, `.lea` the founder's
  voice, `.timeline`, `.amort`, `.steps`/`.turn` walkers, `.lever`), so a
  diff against `SUMAS/mba401/stats.css` shows exactly what was added.
- ⚠ **The textbook is commercial, so nothing of it is quoted.** No `.book`
  blocks, no end-of-chapter problems reproduced, no PDF mirrored. Chapters
  are *referenced* ("BMM ch. 4"); exercises and homework are the course's
  own, written in the textbook's style on the running case or a second
  company. Keep it that way — the repo is the web root.
- **The running case is Atelier Rochat SA**, a furniture workshop in Nyon
  (founder Léa Rochat, 12 staff, CHF 2.4m sales, three hotel clients); the
  student is its first finance manager. Every week is one decision from
  the syllabus's "Decision:" line — Week 1 *healthy enough to expand?*,
  Week 2 *lease or borrow the router?*, then the second site, its hurdle
  rate, the firm's value, the cash squeeze, the low-carbon project's
  financing, 30% growth. **The FY2025 statements are the canonical dataset**
  (CHF 000: revenue 2,400 · NI 240 · total assets 2,000 · equity 1,000 ·
  cash 150 → 90; CFO 230, capex 280, dividend 70) and later weeks should
  build on them, not invent new ones. Week 2's quotes: lease 2,400 × 60 +
  12,000 buy-back vs 120,000 at 6% (payment 2,319.94; PV lease 133,037.81;
  break-even lease 2,147.94). The homework company is **Nyon Cycles SA**.
- **Every number was verified in Python before shipping** — statements that
  balance, a cash-flow statement that reconciles, the amortisation
  schedule, every `ans:` in the exercises, quizzes and homework. The script
  is not in the repo; recompute for any new week the same way.
- **Slide ↔ section mapping is COMPUTED**, the qm1 way: Part 1 slides carry
  `site:'sX'`, `wireSlides()` sets `SECTIONS[].slide` and paints the chips
  on the section cards and headings. Never put a literal slide number in.
  Part 2's slides come from `EXERCISES`; `SLIDES = P1 + [part2] + exercise
  slides + P2END`.
- **Ratios use year-end balances** (the book sometimes averages), stated on
  the page and on the slide. Week 1's `ratios()` is the one definition for
  the tiles, the what-if and the deck.
- ⚠ **Grading is NOT MBA401's** (changed 8 Oct 2026, Jan Erik): **20%
  participation — attendance, contribution and the weekly homework** (5+
  absences bar the exam) · **30% individual case study** (2,000 words, due
  23 Jan 2027) · **50% final exam**, closed book. **There are no weekly
  quizzes**: every "Moodle quiz" line was removed from the hub, the two
  decks' closing slides and the self-check copy, and the homework pages'
  eyebrow reads "counts toward participation" instead of "not graded".
  The site's checkpoint is still a self-check; the workshop ("the Rochat
  file") is ungraded practice for the case study. Stated in the hub's intro
  modal, its assessment block, `presence.js` (two strings) and the decks.
- **`crash-course.html` is the one tool (8 Oct 2026): a crash course in
  accounting for the two students who never had any**, framed as a learning
  path through Léa's 2025 — seven "stops" (her three questions · **the
  year booked as twelve aggregated transactions from Week 1's 31 Dec 2024
  balance sheet, with the income statement and the three cash buckets
  filling in live, ending on Week 1's exact statements** — Jan Erik's ask:
  show how Week 1's amounts arise from the underlying transactions · the
  year's income statement · the hotel that pays in February (accrual) · the
  router, 280 over seven years (depreciation) · where the 240 went (cash
  flow, direct and indirect routes both give 230) · the whole set of books +
  vocabulary + an 8-question self-check). The twelve: deliveries 2,400 ·
  collections 2,300 · purchases on credit 1,510 · COGS 1,440 · suppliers
  paid 1,470 · SG&A 480 · router 280 · depreciation 120 · interest 60 · tax
  60 · bank line +60 · dividend 70. Change a Week 1 number and this path
  must be re-derived. Module `acct`, `opt:true` in `courseprogress.js`
  (listed, never counted), its own progress key `mba406_acct`, a column in
  the dashboard via `courses.json → modules`; no deck, no release, no
  presence, no `data-work`. Sections complete through `SECDEPS` like qm1.
  Every number was recomputed in Python (the balance sheet balances after
  each transaction and the path ends at 2,000 / NI 240 / cash 90).
  Linked from the hub (`.primer` under the how-cards) and Week 1's home.
- **Own namespace `mba406` and localStorage prefix `mba406_`.** Its rules
  block in `firebase-database-rules.json` is a copy of `mba401`'s with the
  one self-reference changed and **must be deployed** before the link goes
  to students — until then registration silently fails (see *Cross-device
  login*). Unlisted; in `robots.txt`; the mirror entry is in
  `/shared/config.js`; reachable from `/SUMAS/index.html`. The hub has no
  teaching-plan page and no toolkit section — there is nothing to link yet.
- ⚠ **The course runs one session behind the syllabus** (22 Oct 2026, Jan
  Erik: "I missed the 8 October as I was in China and did week 2 on
  15 October"). Week 1 was 1 Oct, Week 2 15 Oct, Week 3 22 Oct; the hub's
  `DATES` runs the remaining teaching Thursdays in order (29 Oct, 26 Nov,
  10 Dec, 14 Jan, 21 Jan), so **Week 9 prints "date to be confirmed"**
  until a make-up date is agreed with SUMAS (Giorgia offered a project or
  study week). `courses.json → schedule.first` is still `2026-10-01` and
  right. The syllabus Jan Erik sent on 28 Sep is
  `~/Documents/Jan Erik/SUMAS/MBA406_…Part2_Fall2026_1.docx`.
- ⚠ **SUMAS has changed the grading and the site has not followed yet**
  (Giorgia, 24 Sep, repeated 18 Oct; Jan Erik: "Excellent news. Love
  that"): participation is **no longer graded** at all, and the final is
  an **oral exam** (≈15 min per student, 3–4 questions) **or an individually
  assessed presentation** — not a written closed-book paper. The hub's
  grade block, the two homework eyebrows ("counts toward participation"),
  `presence.js`'s two strings and the decks' closing slides still print
  20 / 30 / 50 and "closed book". **The new weights are Jan Erik's to set**;
  when he does, change all of those in one pass. The five-absence rule is
  SUMAS policy and stays.
- **Week 2 was checked on 21 Oct 2026** (every number recomputed — 120+
  checks — a headless probe of every widget, exercise, quiz and the
  workbook to 9/9 and 52/52, the homework to 18/18, the deck printed one
  page per slide). Two multipliers in the homework solutions were
  misprinted ((1 + 0.035⁄12)²⁴⁰ is 2.011702, not 2.011570; 1.004²⁴ is
  1.100548, not 1.100553) — the answers were right.
- **Week 3 — capital budgeting (`week3.html`, `week3-homework.html`, built
  22 Oct 2026, the morning of the session)** on the Week 2 engine: the
  engine blocks (SVG palette, navigation, glossary, classify/steps/turn
  builders, quiz and deck engines) are byte-copies of week2's with the
  `w2`→`w3` keys swapped; everything else is new. **The Lausanne plan is
  the canonical project** (CHF 000): fit-out 400 straight-line over five
  years, working capital 60 back in year 5, sales 650, cash costs 480,
  lost contribution at Nyon 20, resale 50 taxed at 20%, hurdle 10% *given*
  (Week 4 must derive something near it) → OCF 136, stream −460 · 136 × 4 ·
  236, **NPV +117.64, IRR 18.80%, payback 3.38, discounted 4.20, PI 0.256,
  break-even sales 611.21** (accounting break-even 580); the showroom
  alternative −150 / 55 × 5 (NPV 58.49, IRR 24.32%) is the scale trap, the
  kiln rental −100 / +230 / −132 the two-IRR trap (10% and 20%), +100 / −115
  the borrowing trap. `lausanne(o)` in the page is the one definition the
  walkers, the profile, the sliders and the captions all read. Later weeks
  should build on these numbers (Week 4's WACC, Week 6's cash budget,
  Week 7's financing of the 460). Homework: **Nyon Cycles' Morges shop**
  (180 + 30, sales 420, costs 330, 9%: OCF 79.2, NPV 117.56, IRR 27.83%,
  break-even sales 382.22), eighteen problems. Its eyebrow reads
  "practice for the case study and the exam", not "counts toward
  participation" — see the grading note. Denominator `EXTRA_STEPS (12) +
  EXERCISES (9) + .cl-row (20) + .q (10) + [data-work] (4) = 55`; deck 28
  slides; `w3`/`w3-hw` in `courseprogress.js` (totals 9 and 18),
  `courses.json` modules and `project.sections` (`w3_npv`, `w3_cf`,
  `w3_sens`, `w3_verdict`). Every number recomputed in Python; the probe
  pattern (copy the folder, strip the network scripts, stub `fetch`, serve
  from a root that holds `/shared` because the pages carry `<base href>`,
  `--dump-dom` with a probe that writes `<pre id="RESULT">`) is the test
  to rerun. The instructor's timed run sheet is
  `_private/week3-runsheet.md`.
- **Week 4 — risk and the cost of capital (`week4.html`, `week4-homework.html`,
  built 27 Oct 2026 for the 29 Oct session)** on the Week 3 engine (blocks
  byte-copied from week3.html, `w3`→`w4`). **The canonical rate inputs**:
  r_f 1% and market premium 6% are *stated course assumptions* (low Swiss
  rates; say so, never present them as market data); equity β 1.5, borrowed
  from an illustrative listed comparable → r_E 10.0%; cost of debt = the
  bank's 6% for NEW money (Week 2), not last year's 60 ⁄ 760 = 7.9% → 4.8%
  after tax; target mix 30% debt → **company WACC 8.44%** (book weights
  1,000 ⁄ 760 would give 7.75%). **Lausanne's own rate: β 1.8 → 11.8% →
  9.70%**, NPV +122.47 (8.44%: 143.46 · 10%: 117.64 · rates up r_f 3% / bank
  8% → 10.32%: 112.56); the father's 10% "was close, by luck". Teaching
  points that later weeks rely on: the rate belongs to the project; Léa is
  undiversified (an owner's premium is stated openly, not hidden in the rate);
  more debt raises r_E (deferred to Week 7). `capm()`/`waccOf()` and the
  constants `RF MRP BETA RD DV BETA_P` in the page are the one definition.
  Widgets: required-return instinct, σ walk, diversification curve with a
  prediction (σ 40%, ρ 0.3 → floor 21.9%), beta walk (illustrative 5-year
  series built so β is exactly 1.50), security market line, the editable WACC
  table, the project-rate walk. Denominator `EXTRA_STEPS (12) + EXERCISES (9)
  + .cl-row (12) + .q (10) + [data-work] (4) = 47`; deck 25 slides. Headless
  probe: 23/23 widget checks, homework 18/18. Homework: **Nyon Cycles** β 1.2
  → 8.2%, bank 5% → 4%, 25% debt → WACC 7.15%; **Morges** β 1.6 → 10.6% →
  8.95% (≈ the 9% Week 3 gave), NPV 118.00 (134.68 at 7.15%; rates up →
  10.85%, 101.75). Fields `w4_re · w4_wacc · w4_project · w4_verdict` in
  `courses.json → project.sections` ("Week 4 · What hurdle rate?"). Run
  sheet `_private/week4-runsheet.md`.
