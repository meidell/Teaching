# SUMAS · MA/MBA500 Capstone (wind) — notes for Claude

Split out of the root `CLAUDE.md` on 23 Oct 2026 (one file per course, loaded when working in this folder). The site-wide rules — shared runtime, data model, rules, secrets, conventions — stay in the root `CLAUDE.md`; read that first.

## SUMAS · MA/MBA500 Capstone "AI for Good" — `SUMAS/wind/`

Rebuilt 6 Oct 2026 from the SUMAS Moodle export of the online Capstone
(ten weeks, seven students, fully asynchronous, individual work; the
instructor's job is to follow up and generate discussion). The folder's
previous single-page, PIN-gated wind course was **dissolved into the ten
week pages** — `wind_energy_2040_course.html` is now a redirect stub — and
its eight modules live on inside Weeks 1, 2, 4, 5 and 9. The open
showcase page and the 2026 cohort's report PDF are untouched and still
public (the hub links them as "last year's cohort"). Course id, folder
and `wind-showcase` entry were kept so no link broke; the course gained
a namespace (`wind`, prefix `wind`), the SUMAS theme, and `listed:false`.

- **Not the MBA406 engine.** An online course has no deck, no presence,
  no exercise release. The week page is a long scroll (`capstone.css` +
  `capstone.js`), Moodle-shaped: learning focus → readings → core concepts
  with widgets → forum cards → tools → consulting file → self-check →
  checkpoint → next-week preview. `CAP.quiz`, `CAP.recall` (two questions
  on last week), `CAP.classify` and `CAP.wright` (the Wright's Law fitter,
  Weeks 3, 7 and 10) are the shared widgets; everything else is inline.
- ⚠ **`schedule.js` is the single source of truth for every date, forum,
  phase deadline, the exam window and the grade weights.** `START` (the
  Monday of Week 1) is the one line to change per term; everything is
  computed from it, including the CET/CEST switch. The hub, the week
  pages, `forum.html`, `followup.html` and `courseprogress.js` all render
  from it. The Moodle export still carried the previous run's dates
  (April–June 2026); **START = 5 Oct 2026** was confirmed by Jan Erik on 6 Oct
  2026; the **grade weights (10/10/55/25) are ASSUMED** from the gradebook items and
  Week 9's "55%" — the syllabus PDF is the authority. Confirm both.
- ⚠ **The progress denominator is `.sec[data-step]` + `#recall` + `#quiz`
  + `[data-work]`**, counted by `capstone.js` at runtime and carried as
  constants in `courseprogress.js`. **Run `_build/count.py` after editing
  any week page**; it recounts and rewrites `WEEK_TOTALS`. Widget-internal
  steps (`tvu`, `loopA`, `fp`…) are reported to the DB but never counted.
  Chapters go `live` when their week's Monday arrives, not when the page
  ships — all ten shipped at once, and a bar with 20 locked chapters on
  day one is what the mba406 pattern would have produced.
- **Forums are the course and they live on the site.** `forum.html?f=<id>`
  is OMBA401's Forum 2 engine generalised (posts at
  `wind/_forum/<id>/posts/<sid>/p`, replies pushed under `re/`, one post
  per student by construction, soft client-side deadline). Seventeen
  forums, each a module in `courses.json` so the dashboard grows a
  column; optional ones are `(opt)`. The brief per forum is in
  `forum.html`'s `BRIEFS`; the full task is on the week page — keep the
  two in step by hand. **The instructor replies from the same page**: a
  gate-unlocked device gets `sid:'i'`, never posts, and its replies are
  drawn tinted. No sign-in is needed for that — the `_forum` rule lets any
  client create a reply — the gate only decides what is shown.
- **`followup.html` is the instructor's morning screen**: a student ×
  forum register (✓ / ⏰ late / ✗ missing / —), what is due this week with
  who has not posted and which posts have no reply from you, and three
  facilitation questions per forum (`NUDGES`) with a copy button. Gated
  by `AdminGate.mount`; reads the forums anonymously (they are
  world-readable) and the roster from `_chat/_people` plus everyone who
  has posted — a student who has done neither appears only on the
  dashboard. Also linked from `admin.html` (the redirect stub).
- **Phase reports and the exam stay on Moodle.** The site carries each
  phase's brief, rubric and deadline (`[data-phase]` cards) and the
  consulting-file fields (`data-work`, listed in `courses.json →
  project.sections`) that feed them. The Week 10 practice prompt has a
  90-minute timer and a solar-PV Wright's Law drill.
- **Every number was recomputed in Python before shipping** — the unit
  conversions, the 54%-not-70% LCOE correction (the briefing's own
  arithmetic error, now a teaching point in Week 2), the three
  learning-rate projections ($64/$54/$45 from $86 at 83 → 600 GW), the
  footprint and water calculators, the OLS fit of the fitter's default
  rows. ⚠ One slipped through until a student caught it (20 Oct 2026):
  Week 3's time-series widget hard-coded the S-curve's midpoint (2031),
  so the projection left 2024 at 133 GW while the series ended at 220.
  The midpoint is now solved from the anchor in all three copies (`wind`,
  `omba500`, `capstone-ba`): L = 600, k = 0.18 → t0 ≈ 2027, 2040 ≈ 547 GW.
  A projection "from today" must leave the last historical point. The fitter's defaults are rounded IRENA/GWEC figures and every
  page says so; they are a check on the student's AI, not a source.
- **Rules:** the `wind` block in `firebase-database-rules.json` is
  `mba406`'s minus presence/release plus `omba401`'s `_forum`, and **must
  be deployed before the link goes to students**. `robots.txt` disallows
  the hub, week, forum and follow-up pages by path and deliberately
  leaves the showcase and PDF indexable. Mirror entry in
  `/shared/config.js`; the SUMAS landing page picks the course up from
  `courses.json` by itself.
