# SUMAS · Capstone Bachelors — notes for Claude

Split out of the root `CLAUDE.md` on 23 Oct 2026 (one file per course, loaded when working in this folder). The site-wide rules — shared runtime, data model, rules, secrets, conventions — stay in the root `CLAUDE.md`; read that first.

## SUMAS · Capstone "AI for Good" — Bachelors — `SUMAS/capstone-ba/`

The **Bachelors edition** of the capstone above, built 6 Oct 2026 from the
SUMAS Moodle course "2026 - Milan & Gland - Capstone: AI for Good -
Bachelors" (id 1447) as an **independent copy of `SUMAS/wind`** with its own
namespace and forums — then **reshaped on 7 Oct 2026, the first teaching
day**, on five instructions from Jan Erik: *forums and hand-ins on the site,
not Moodle · no letter-grade list on the hub · the exam is open book · the
capstone report is integrated into the site, modelled on last year's report
PDF · Week 1 is only about organising the project — eight students, two
teams of four · replace TotalEnergies with a similar Italian company active
in wind.* Everything the `SUMAS/wind` section says about the engine
(`capstone.js`, `schedule.js`, `forum.html`, `followup.html`,
`_build/count.py`, the progress denominator) still applies. What differs:

- **Own id / ns / keyPrefix `capstone-ba`**, folder `SUMAS/capstone-ba/`,
  rules block in `firebase-database-rules.json`; mirror entry in
  `/shared/config.js`; in `robots.txt`. Unlisted; the SUMAS landing page
  picks it up from `courses.json` by itself. ⚠ **The rules block grew three
  nodes on 7 Oct 2026 — `_files`, `_submissions` (copied from `omba401`) and
  `_teams` — and must be re-deployed** before the first group hour or every
  team write is refused (the pages say so; nothing is swallowed).
- ⚠ **Eight students, TWO TEAMS OF FOUR, ONE REPORT PER TEAM.** Declared in
  `schedule.js → TEAMS / TEAM_SIZE` and mirrored as `teams` in
  `courses.json`. **Team 1 may hold FIVE** since 21 Oct 2026 (Jan Erik: a
  ninth student, Tatiana): `schedule.js → TEAM_CAP = {t1:5}` and `S.cap(id)`,
  which the Week 1 picker reads instead of `TEAM_SIZE`. She was not in
  `_chat/_people`, `_teams` or any forum when the seat was opened, so she
  joins herself from `week1.html#team` once signed in. Teams form on `week1.html#team` (the picker refuses a
  fifth member, a student may move until the other team fills, may leave)
  and live at `<ns>/_teams/<t1|t2>/{name, members/<sid>{n,role,ts}}` —
  world-readable, names only; the hub paints both cards from it. The
  student's `<sid>/team` and `localStorage capstone-ba_team` remember the
  choice, but **the `_teams` node is authoritative** (`report.html`
  re-derives it on every load). Forums, self-checks and the exam stay
  individual; the three phase marks are the team's.
- **The report is `report.html` — one document per team, written on the
  site.** Eighteen sections (`r0`…`r18`) of a consulting report, a short
  guidance note under each heading, plus a four-answer **charter**
  (`c1`…`c4`, Week 1's work). ⚠ **This course never links or names last
  year's showcase report or its PDF** — Jan Erik, 7 Oct 2026: "they would
  only copy it". The sections were originally modelled on it and every
  page, the hub, the glossary, the report page and the deck notes carried
  a "last year: …" pointer; all of those were removed, and the few
  teaching passages that quoted the previous cohort's findings were
  de-attributed. Don't put the link, the "June 2026 cohort" or a
  "last year" note back into `SUMAS/capstone-ba/`. The showcase stays
  public under `/SUMAS/wind/`, where the MBA course still links it.
  `schedule.js → PHASES[].secs` names which sections each phase covers, so
  the hand-in panel counts words per phase from the same list. Data lives
  at `_teams/<t>/report/<sec> = {v,by,n,ts,owner}` and `charter/<key>`.
  **Editing model**: focus takes a lock (`lock/<sec> = {sid,n,ts}`,
  heartbeat 25 s, stale after 75 s), typing saves 1.2 s after the last
  keystroke, the page re-reads the team node every 8 s and refreshes every
  box nobody here is in; a box someone else holds is read-only with their
  name on it. Last save wins — the lock is what makes that safe; there is
  no merge and no history. **A hand-in is a snapshot**: `POST
  _teams/<t>/handin/<pid>` = `{ts,by,n,words,late,secs:{…}}` (create-once),
  plus a one-line `work/handin_<pid>` summary written into **every member's**
  node so each drawer shows it. `?team=t2` reads the other team (both teams
  can; the gate makes the page read-only for the instructor); `&v=<id>`
  reads a phase as handed in. Document view / Print renders the cover and
  the sections as a document. `handin.html?p=<id>` is the side door for a
  PDF (figures, an appendix) — the E1410 chunked uploader ported, recording
  `k` (the phase id) and `team`.
- **The dashboard's Handed in tab grew two axes** (`/shared/admin2.html`):
  a file with `k` lands in a column per hand-in kind (`courses.json →
  handins` fixes the order), and a course with `_teams` gets a team × phase
  table of snapshots above it, linking to `report.html?team=&v=`. A course
  with neither renders exactly as before.
- ⚠ **Week 1 is ORGANISING THE PROJECT, nothing else**: the brief, the plan
  table and grade weights (rendered from `schedule.js`), the team picker,
  the charter, a tools checklist, the live team presentation (no forum —
  see below), two films, fields `w1_role · w1_question · w1_group`, a six-question
  self-check on how the course works. The frameworks that used to open the
  course — the cone, trends vs uncertainties, scenarios, loops, the
  doughnut, the Ørsted case, the 2026 starting line — moved verbatim to
  **`toolkit.html`** (`data-module="toolkit"`, no `data-step`, counts for
  nothing; Week 2 assumes it has been read). The Thursday card on Week 1 is
  the slim one-line strip (`.thu.slim`); weeks 2–10 keep the full card.
  Forum **f1b was dropped** (Week 2's f2a is the same task) and **f1c moved
  to Week 2** (`wk:2`; the id is a database path and was kept), so Week 2
  has three required posts. ⚠ **Week 1 has NO forum at all** (Jan Erik,
  7 Oct 2026, the evening of the first session: "presentations to be done
  online — not in a forum"): `f1a` (introduce yourself) was removed from
  `schedule.js → FORUMS`, `forum.html`'s `BRIEFS`, `followup.html`'s
  `NUDGES` and the `courses.json` modules, and the teams **present
  themselves live on the call** instead — five minutes, four voices, the
  card on `week1.html` §1.6 (`s6`, still a `data-step` so the week total
  stayed 10). That presentation is Week 1's participation mark. Forum
  titles are therefore numbered **1–15** (f2a is "Forum 1"); the literal
  numbers in `report.html`'s section guidance, `thursday.html` and
  `week5.html` were renumbered with them — grep `Forum [0-9]` after any
  further change. `week1.html` also carries **two films** (a `.films` grid,
  no `data-step`, so it counts for nothing): euronews, *Europe bets on
  offshore wind and smart tech to cut energy costs* (May 2025, 8:00,
  `ceH6_VVmaP0`) and DW News, *EU wind power deal: how much Russian energy
  can it replace?* (Jan 2026, 6:46, `h0EgssV1i3E`) — runtimes read from
  YouTube's own metadata, never guessed; they are played in class from
  slides 6–7 of `week1-slides.html` (19 slides, embedded frames; print
  hides the frame and prints the link). `_private/week1-transcript.md` is
  the spoken script for that deck and `_private/week1-runsheet.md` is
  generated from the deck's notes — regenerate both if the deck changes.
- **The shared canvas is `canvas.html` — on the site since 8 Oct 2026, not a
  Google Doc.** The group hour's output (the scribe's table, the one line to
  bring to 18:15) is written there: one block per team per week, both blocks
  on the page, yours editable and the other team's read-only, so the class
  compares them on the screen at 18:15. It is `report.html`'s editing engine
  (lock per box with a 25 s heartbeat, stale after 75 s; save 1.2 s after the
  last keystroke; an 8 s re-read of `_teams`) pointed at
  `_teams/<t>/canvas/w<k>/<key>` — a **table row is one record** (`<box>_r<i>`,
  cells tab-joined), so four people fill four rows at once, which is what the
  Doc's tables were for. `BOXES` in `canvas.html` is the only definition of
  each week's boxes and was written from `thursday.html`'s "By 18:15 you
  have…" lists; change one and change the other. `schedule.js → CANVAS` is
  now `'canvas.html'`; the `[data-canvas]` handler in `capstone.js` and
  `thursday.html` appends `?w=<week>` and opens it in the same tab (an
  `http(s)` value would be treated as an external document again). Week 5's
  loops are written as `A → B (+)` lines; a sketch goes in the Phase 1 PDF.
  No history and no undo: last save wins, as on the report page.
  ⚠ **The `_teams` rules block grew a `canvas` node and must be re-deployed**
  before the next group hour, or every canvas write is refused (reported on
  the box, never swallowed). The instructor's device is read-only on both
  blocks; `followup.html` and the hub link the page.
- **The two companies are `schedule.js → COMPANIES`: Ørsted and Eni.**
  Eni (through Plenitude, with minority offshore stakes in Dogger Bank and
  Vårgrønn) is the hedged oil-and-gas major that TotalEnergies represented;
  every page, forum brief, nudge, quiz and glossary entry says Eni, and the
  Eni-specific numbers were rewritten (Plenitude ≈ 4 GW installed, 2024;
  the Week 9 signal is Plenitude's capacity against Eni's own plan). The
  `/SUMAS/wind/` course still says TotalEnergies; this course no longer
  mentions it at all. **Verify Plenitude's figures against the
  latest Eni report before Week 2; they were written from memory.**
- **The exam is OPEN BOOK** (`schedule.js → EXAM.openBook`): notes, the
  readings, the site, the team's report; not an AI, not a classmate. Stated
  on the hub, Week 9's preview, Week 10's page and logistics lists, the
  glossary ("Open book") and the Week 10 Thursday rehearsal. Its venue is
  no longer named — "online, the link is posted here when the window
  opens" — because nothing goes through Moodle; **there is no exam engine
  on the site yet**.
- **No letter-grade scale.** `SCALE` was removed from `schedule.js` and the
  hub (7 Oct 2026); the Bachelors Moodle page's A 93–100 … F 0–62 block is
  the only record of it.
- ⚠ **Meets weekly on WEDNESDAYS** (corrected 14 Oct 2026, Jan Erik: "the
  sessions are on wednesdays not thursdays"): `START = 2026-10-05`,
  `SESSION.day = 2`, `SESSION_DATES = {}`; 17:15–18:15 the student-run group
  hour (`wednesday.html`, written on **the shared canvas, `canvas.html`**,
  see below), 18:15–20:15 the class. `thursday.html` is a redirect stub that
  keeps the `#wN` hash — keep it, links to it are in students' history. The
  CSS class `.thu` on the session card was kept as an internal name. Forum
  deadlines did **not** move with the session (Forum 1 is still due
  Thursday of Week 2). Every "Thursday group hour" workbook label became
  "Wednesday group hour", in the pages and in `courses.json`.
- **Forums never close** (14 Oct 2026, Jan Erik: "write the deadline, but let
  them be open") — `omba500`'s change ported verbatim: `closed()` and
  `reClosed()` in `forum.html` return false, the chips read "… · still
  open", a late post keeps its ⏰ in `followup.html`.
- **Dates print in Geneva time.** `schedule.js → fmtDay()` shifts by the
  Zurich offset before formatting; it used the reader's timezone, so on a
  +08:00 laptop every 23:59 deadline showed one day late. Fixed here only —
  `wind` and `omba500` still have the old `fmtDay`.
- ⚠ **Week 3 is the TEAM's week (14 Oct 2026, "a logical continuation of
  week 1 and week 2 · two teams × 4")**: the Moodle content stays, framed by
  the roles from Week 1 and the numbers from Week 2. A bridge table (W1 → W2
  → W3), four role cards (`s9`; coordinator = audit protocol + one change to
  the charter's AI policy, data lead = verifies the 2010/2024 rows and picks
  $79 vs $86, model lead = the fit and the sensitivity test, editor = the AI
  log + report §3), highlighted for the signed-in student from `_teams`; a
  numbers-first doubling ladder before the formula; the time-series widget
  converts 2040 GW into a share of Week 2's 4,530 TWh; a four-assistant team
  audit; `s10` "into the report" (§3, §4, the charter). New field
  `w3_role`; the week total went 14 → 17 (count.py). Canvas BOXES[3] gained
  `team`, `rows`, `policy`; `wednesday.html#w3` was rewritten to match.
  Verified in Python: default rows fit **19.8% (R² 0.944)**, 2010/2024 move
  it most (±20% → 17.5–21.6%), $86 → $54 and $79 → $50 at 15% / 600 GW. Weeks
  4–10 are still the online-course copies; continue the same pattern. Week 1's group hour is *form the team*; its
  deck `week1-slides.html` (16 slides, N = notes, P = print) and
  `_private/week1-runsheet.md` were regenerated for the organising session.
- **Grade weights are the same assumption as `wind`'s** (10/10/55/25).
- **`stakeholders-to-systems-slides.html`** (8 Oct 2026) is a second deck on
  the Week 1 deck's engine: a 30-slide, two-hour session (18:15–20:15,
  `data-clock` per slide) on toolkit idea 4 — inventory → interactions →
  dynamics — with three canvas exercises, the course's own two loops drawn
  as SVG rings with signed arrows, the sign-counting rule, delays, Meadows'
  ladder, the boundary, the doughnut, and how it all lands in report §5.
  Not attached to a week and linked from nowhere yet; Ørsted and Eni, never
  TotalEnergies. Numbers on it are the course's own (the 70% LCOE fall);
  the Ørsted 2023 write-down is cited as a mechanism, not a figure.
- **`glossary.html`** grows with the course; 7 Oct added *Team report ·
  Charter · Hand-in · Plenitude* and turned *Closed book* into *Open book*.
- **Still on Moodle, deliberately**: the Zoom link. Week 2's two slide decks
  are on the site since 21 Oct 2026 (`w2slides/`, copied from `wind`'s
  `w2slides/` and `w1slides/`, linked as downloads from `week2.html` with a
  note that their "TotalEnergies" reads Eni here). Everything else on the site.
- ⚠ **The two folders are independent.** A fix in `wind` reaches
  `capstone-ba` only if ported by hand, and vice versa.
