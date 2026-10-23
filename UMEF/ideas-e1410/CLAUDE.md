# UMEF · E1410 — notes for Claude

Split out of the root `CLAUDE.md` on 23 Oct 2026 (one file per course, loaded when working in this folder). The site-wide rules — shared runtime, data model, rules, secrets, conventions — stay in the root `CLAUDE.md`; read that first.

## Getting back up: the top-bar link

Every session and tool page carries a link home in its existing `.topbar`, because
the only way back used to be the browser button or a link in the page footer:

- `session1…8.html` — `← Course`, after the `.tb-spacer`, next to `▶ Lecture`.
- a tool page that belongs to one session — `← Session N` (class `home up`) before
  the `✕ Course` it already had: `wbs-check`→2, `cost-model`→3,
  `primer-infrastructure`→3, `risk-matrix`→4, `simulator`→6, `defence`→7.
- everything else keeps `✕ Course` alone, because it belongs to the course rather
  than to a session: `board-pack`, `compile`, `followup`, `mekong-data`, the four
  readings and the five video primers.

The `.home` rule lives in `session.css` and `research.css` — except sessions 1 and
2, which predate the stylesheet extraction and carry it inline. Same trap as
`exercises.js`: a rule added only to `session.css` reaches six pages out of eight.

## E1410's tool pages

E1410 has a second layer on top of the sessions: pages that *do something with* what a
student wrote, rather than teaching more. They share one rule — **read the workbook,
write back to the workbook**, so nothing is typed twice.

| Page | Reads | Writes back to |
|---|---|---|
| `cost-model.html` | — | `s3_cost_driver` (appends, never overwrites) |
| `wbs-check.html` | `s2_wbs` | `s2_wbs` |
| `risk-matrix.html` | own register | `s4_risks`, `s4_top`, `s4_top_pi`, `s4_mitigation` |
| `simulator.html` | — | `s6_threshold`, `s6_retrain` |
| `board-pack.html` | everything | `bp_ask`, `bp_amount`, `bp_by` |
| `defence.html` | everything | — |
| `followup.html` | everything | `fu_w1`…`fu_w6` |

They write the same shape `/shared/progress.js` writes (`localStorage e1410_work_<id>`
plus `<sid>/work/<id> = {v,label,mod,ts}`), so the dashboard picks them up with no
change — but they do it themselves rather than loading `progress.js`, because they are
standalone like `compile.html` and must not depend on its init order.

## The final-quiz trainer — `exam-trainer.html`

The eight session self-checks pooled into one deck of **81 cards**, with three
things the session banks do not have:

- **Options re-ordered.** In the session banks the correct answer sat in slot B
  **69 times out of 81** — trainable in exactly the wrong way. The deck is
  21/20/20/20 across A–D, no session dominated by one slot, and never more than
  three cards in a row on the same slot. The shuffle is baked in at build time
  (seeded), not randomised per load, so it stays testable.
- **A hint per card** — a nudge that narrows the field without naming the answer.
  Written per question; reusing the explanation would give it away. Taking the
  hint costs half the points (10 → 5), which is what makes it a real choice.
- **Clickable concepts.** `CONCEPTS` is ~90 terms of the course's own vocabulary,
  defined in the course's own words. `mark()` underlines them in the question,
  the options, the hint and the explanation — longest term first, so
  *concept drift* wins over *drift*, and once per card, or a card about drift
  becomes a field of dotted underlines. 70 of the 81 cards surface at least one;
  the rest genuinely contain no term and are left alone rather than padded.

Exam mode adds 20 seconds a card and removes the Back button; a card the clock
runs out on scores nothing. Practice mode has neither.

⚠️ **It must never be added to `courseprogress.js` CHAPTERS.** The course
percentage divides by `counted()`, so a new chapter mid-cohort silently drops
every enrolled student's displayed progress — the same trap the primers document.
It writes one summary line to `work/quiz_trainer` instead, the way the tool pages
and `exercises.js` do, so engagement reaches the dashboard without touching a
grade or a bar. `mod/exam` is likewise off limits: it is already in CHAPTERS as
the real final assessment.

The bank is generated, not hand-maintained: if a session's `QUIZ` array changes,
re-extract rather than editing the deck by hand, or the two drift apart.

## Primers — and the `opt:true` rule

Six primers now: five StatQuest video pages (`v1`…`v5`) and one long reading
primer, `primer-infrastructure.html` (`inf`) — cloud infrastructure in Azure
terms, for Session 3's infrastructure and budget questions.

**Every primer is registered in `courseprogress.js` with `opt:true`.** That flag
means it is listed and ticked but excluded from the course percentage, and it is
deliberate twice over: a student who already knows the material is told to skip
it, so it must not count against them — and adding required chapters mid-cohort
would silently drop everyone's displayed progress. The percentage denominator is
`counted()`, currently 14 chapters; adding a primer must never change it. Add a
new primer's tasks to its `TASKS` array and set `total` to match.

## Remembering what students chose — `answers.js`

Three different things used to happen to an answer. Workbook fields were saved
and restored. The **quiz** sent the pick to `mod/<m>/quiz/q<i>` (which is what
feeds the dashboards' per-question stats) but stored only a boolean locally, so
a reload showed a blank quiz and every unlocked explanation was gone. The
**"try it" classifiers** saved *nothing* — a wrong pick disabled one button and
the attempt was discarded.

`answers.js` adds the missing half: picks are kept in **`progress.picks`**, a
new key inside the same localStorage blob, and replayed on the next visit.
`progress.steps` is untouched, no DOM is added and `SECTIONS` is unchanged, so
`totalSteps()` / `doneSteps()` and both progress bars behave exactly as before —
verified at runtime (session 3: `.q`=10, `.cl-row`=24, `data-work`=7, bar 7%).

Two rules worth keeping:

- **First attempt wins.** A replayed answer never re-sends to the database.
  Before this, a reload let a student answer again and overwrite their own
  record, so the dashboards showed the *latest* attempt.
- **Classifier attempts go to `mod/<m>/cls/<group>`, not to `work/`.** They are
  not assignment work and must not land in the graded workbook. Each wrong item
  carries its own scenario text, so `/shared/insights.html` can show what
  actually misled people instead of an index.

## Exercises inside the sessions — `exercises.js`

Two widgets, added to the live session pages: a **retrieval opener** (two
questions about the *previous* session, on the home screen — sessions 2–8;
Session 1 has nothing to retrieve) and **diagnose the artefact** (a plausible
piece of work with planted faults — Session 2 s3 · WBS, Session 4 s4 · risk
register, Session 6 s2 · monitoring plan).

⚠️ **They must never touch what counts.** Each session page computes its bar as
`totalSteps() = 1 + .cl-row + .q + [data-work]`, and reports completion to the
DB as `SECTIONS.length`. So anything added to a live page using `.q`,
`.cl-row`, `data-work`, `markSection()` or `StatsTrack.complete()` **silently
lowers every enrolled student's displayed progress** — the same trap
`courseprogress.js` documents for the five primers. The widgets therefore use
their own class names (`.rc-*`, `.sp-*`), call none of those functions, and
keep state under `e1410_ex_*`. They write one summary line to
`work/rec_<session>` and `work/spot_<id>` so engagement is visible in the
dashboard, with prefixes that cannot collide with real field ids.

Their CSS is **injected by `exercises.js`, not added to `session.css`** —
sessions 1 and 2 predate the stylesheet extraction and still carry inline
`<style>`, so a rule in `session.css` would apply to six pages out of eight.

**`project-map.js` is the single client-side definition of the project's field list.**
`compile.html` and `board-pack.html` both consume it. Adding a workbook field means
editing it in **two** places: `project-map.js` (`SECTIONS`) and `courses.json`
(`project.sections`, which drives the dashboard). Nowhere else.

`followup.html` has a `COURSE_END` constant at the top of its script — set it to the
last session's date to turn on the weekly unlock; left `null`, all six weeks are open.
`showcase.html` is public and un-gated, and its `CASES` array is empty until real
student work is published (consent form: `_private/showcase-consent.html`).
