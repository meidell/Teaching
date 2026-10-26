# SUMAS · MBA401 — notes for Claude

Split out of the root `CLAUDE.md` on 23 Oct 2026 (one file per course, loaded when working in this folder). The site-wide rules — shared runtime, data model, rules, secrets, conventions — stay in the root `CLAUDE.md`; read that first.

## SUMAS · MBA401 Quantitative Methods — `SUMAS/mba401/`

Started 27 Sep 2026 as a copy of `HEG/statistics` restyled for SUMAS, then
**restructured on 28 Sep 2026 to the SUMAS syllabus**: 9 teaching weeks of
3 h (Mondays 9–12, Gland) + Week 10, the final exam. Everything the
HEG/statistics section says about the engine (exercises.js, answers.js,
releases, the progress-denominator trap) still applies. What differs:

- **Most weeks have two parts, each an HEG lesson page:** 1A/1B = HEG 1/2,
  2A/2B = HEG 4/5, 3 = HEG 6, 4A/4B = 7/8, 5 = 9, 6 = 10, 7 = 11, 8 = 13,
  9A/9B = 14/15, 10 = 16. HEG's Week 12 (Python) was **dropped**, and so —
  on 2 Oct 2026, Jan Erik's call — was **HEG Week 3, discrete random
  variables** (Saylor ch. 3–4): Week 2 is now **2A = the normal (ch. 5)**
  and **2B = sampling distributions (ch. 6)**, and Week 3 is **estimation
  alone** (`week3.html`, `w3`, a one-part week like 5–8). The old `week3a`
  pages are redirect stubs to `week2b`; `week3b.html` was renamed. Files,
  module ids and workbook ids follow the labels (`week2b.html`, `w2b`,
  `w2b_se`), and section numbers read `2B.3`. The ids `w2a`/`w2b` were
  **reused** for different content: a student who did the discrete week
  before 2 Oct keeps a `w2a` record that no longer matches the page.
- ⚠ **Week 2 follows the BOOK, example by example.** Each lesson section
  quotes Saylor's own definition (a `.book` block with a `cite`), walks the
  book's worked Example — `buildSteps()`, one step per press, replayed on
  reload — and ends in a `buildTurn()` "your turn" that checks the book's
  next example numerically (thousands commas and decimal commas both parse;
  `num()`). 2B walks Examples 1–8 of ch. 6 (rowing team, all 16 samples;
  the 0/1 population at n = 1, 5, 10, 20 — the book's own tables; Examples
  3–8), 2A walks Examples 10, 16, 17, 18 of ch. 5. Every walked number was
  recomputed in Python the book's way. The step ids of walkers and turns
  are in `EXTRA_STEPS`, so they count toward the week bar like any widget.
  The headless probe that exercised every widget, classify, quiz and deck
  is the pattern to rerun after editing: strip the network scripts, inject
  a probe that writes into `<pre id="RESULT">`, `--dump-dom`.
- ⚠ **Attendance is per WEEK, not per part.** Parts A and B share one
  session: the pages mount presence with `mod:'w1'`, not `MOD`. presence.js
  has its own `SESSIONS` list (w1…w9, with the pages each covers) because the
  course-progress chapters are per part. `presenceSessions` is 9.
- **One class, no groups** — removed from courses.json, the config.js mirror
  and presence.js (whose group machinery is kept but inert: `multi()` is false).
- **Grading is the syllabus's:** 10% participation (attendance a fifth of it;
  5+ absences bar the student from the final exam) · 25% individual case study
  (2,000 words, due 23 Jan 2027) · 30% weekly quizzes · 35% final exam.
  The weekly workshop ("pizzeria file") is ungraded practice for the case
  study, not a graded project. The site's per-week checkpoint is still labelled
  a self-check, not the graded quiz.
- **No scaffold generator in this folder** — the scaffolds were relabelled by
  hand and `_build/` was removed; re-running HEG's generator here would undo it.
- ⚠ **Week 2 was rebuilt again on 4 Oct 2026 to follow Saylor SECTION BY
  SECTION** (Jan Erik: "follow the sequence of Saylor chapter 5–6 in the
  slides and the sub cards … mix theory, explanations and examples … add
  interactive widgets"). `week2a.html`'s six lesson sections are now §5.1
  (density, Examples 1–2), §5.1 normal family (Example 3), §5.2 (Examples
  4–8), §5.3 (Examples 9–11, the hook closes), §5.4 tails of Z (Examples
  12–14) and §5.4 tails of X (Examples 15–18, the delivery promise); every
  definition and Key Takeaways list is quoted in a `.book` block and
  **all eighteen examples** are walked (`buildSteps`) or set as a "your
  turn" (`buildTurn`). `week2b.html` kept its §6.1–6.3 order and gained
  the book's Figures 6.1, 6.4 and 6.5/6.6 as widgets plus the Key
  Takeaways. New widgets worth knowing: `revLook(p)` reads the table in
  reverse the book's way (closer entry; **average on an exact tie**, so
  0.9500 → 1.645) and drives the reverse-lookup finder, the middle-%
  slider and the promise; `tableExcerpt(z)` prints the 3-row slice of
  Figure 12.2 around a z. **Sections now complete by combination through
  `secCheck()`** (the section's walked examples + its classify group), so
  classify groups are built with `secId=null` — same pattern as qm1's
  `SECDEPS`. The exercise sets, checkpoints and workshop fields are
  unchanged (same `w2a_*` / `w2b_*` ids); the week totals stayed 9.
  Verification: a headless probe plays every widget to 100 % and a Python
  script recomputes every stated number the book's way (77 checks for 2A).
- **Week 3 (estimation, Saylor ch. 7) was built on 17 Oct 2026** (Jan Erik:
  "keep it close to the saylor on github — but add a lot of interactivity")
  as a **port of `HEG/statistics/week6.html`** (scripted HEG→SUMAS transform:
  chrome, `mba401_w3_*` keys, colours, week/section relabels — the book's
  own cross-references such as 'Section 6.3 "The Sample Proportion"' were
  protected from the relabel) **upgraded to the Week 2B standard**: the
  page follows ch. 7 section by section — each section opens on the book's
  Learning Objectives and closes on its Key Takeaways, every definition and
  formula box is quoted, **all eleven Examples are walked** (`buildSteps`,
  one step per press, in the book's words), and after each group a numeric
  **"your turn" on the book's even-numbered exercises** (`buildTurn`: §7.1
  #2 and #4, §7.2 #4, §7.3 #2, §7.4 #2 and #4 — no key in the book, every
  answer recomputed in Python). The book's figures are widgets: 7.1 (one
  winged dot on a slider), 7.2 (the capture simulation), 7.3–7.4 (α split
  between the tails, eight levels from Figure 12.3's last line), 7.5 (t
  against z), plus the HEG widgets (interval builder, t-table explorer, the
  lakeside eight, the proportion check, the two sample-size dials, the
  misinterpretation clinic, the which-formula tree). **Sections complete by
  combination through `secCheck()`**; classify groups are built with
  `secId=null`. Denominator = 30 `EXTRA_STEPS` + 10 exercises + 23 `.cl-row`
  + 10 `.q` + 3 `[data-work]` = 76. The deck (65 slides) is HEG's verbatim
  ch. 7 deck; **`stats.css` gained the deck's textbook-block CSS at its
  END** (`.lect-body .book/.fbox/.gl/table.bk`, `.lect-slide.text`) because
  the SUMAS copy predated it — without it the quoted slides render unstyled.
  Part 2 and `week3-homework.html` are the book's own exercises (ten in
  class, thirteen at home, all odd-numbered). Workbook fields `w3_ci`,
  `w3_t`, `w3_n` are in `courses.json → project.sections`; modules `w3`
  and `w3-hw`; `courseprogress.js` totals 9 and 14. The headless probe
  (strip network scripts, stub `fetch`, play every walker, your-turn,
  widget, classify and quiz to 8/8 sections) is the test to rerun.
- ⚠ **Week 3 was re-laid out on 26 Oct 2026 in the SAYLOR GRAMMAR** (Jan
  Erik: "I really like the structure in the online book (saylor), with 1
  color cards for theory, another colour for examples and explanations in
  between. just use that but in the style of my site"). This is now the
  standard for a lesson section in this course; weeks 4+ are built in it
  from the start, and Weeks 1–2 are NOT retrofitted unless being edited.
  Four blocks, in `stats.css` (last section) — nothing else on a lesson
  section except the site's own pizzeria / "Try it" / hook `.card`s:
  `.tcard` (THEORY, green: `.tc-bar` + `.tc-body` — Learning Objectives,
  a formula box under the book's own callout title, a definition, Key
  Takeaways; one colour for all of them, the bar says which), `.xcard`
  (EXAMPLE, teal: `.xc-bar` "Example N" / "Your turn · Exercise N" +
  `.xc-body` with the question as `.stem`, a `.sol` "Solution" line and
  the `buildSteps` walker or `buildTurn` rows — Saylor colours its
  exercises like its examples, so your-turns are teal too), `.fig`
  (white, a gold `.fig-t` figure title like the book's, with a `live`
  pill — the book's figures turned into widgets, and the site's tools;
  the inner `.lab` goes flat), `.prose` (no box: the book's running text
  and the page's own explanation, with a `.src` source line). The teal is
  new: `--ex-wash/--ex-bar/--ex-ink` and `--th-wash` exist only in the
  dark block of `sumas-stats.css`; the light values are the `var()`
  fallbacks. Every widget, walker, your-turn, id and the denominator (76)
  are unchanged — the splice was verified by an id diff and a headless
  probe (no errors, all 11 walkers + 6 turns mounted, ex3 played to its
  step, the Geneva hook computed), and screenshotted light / dark / 390px
  (the 390px clipping is a headless-window artefact, identical before).
  The old `.book` block stays for the deck (`.lect-body .book`) and the
  exercise section.
- **Own namespace `mba401` and localStorage prefix `mba401_`**; its rules
  block is in `firebase-database-rules.json` and must be deployed.
- **Theme `/shared/themes/sumas-stats.css`** (heg.css colour-mapped to SUMAS
  green/sand), Georgia headings, `sumas-logo.png`. Unlisted; in robots.txt;
  reachable from the SUMAS landing page `/SUMAS/index.html` (a copy of
  `/GBS/index.html` — never link it from the root catalogue).
- **The course menu — `nav.js` (19 Oct 2026, a test, this course only).** A ☰
  Menu pill **bottom-left, the mirror of the 💬 Messages launcher** (same
  pill, and its `bottom` is copied from `#jc-btn` every second so the two
  stay level when login.js lifts the launcher to 62px) on every week and
  homework page opens a drawer
  with the whole course as a tree: week ▸ part ▸ section, done ticks from
  each part's `mba401_<mod>_progress_v1` blob, the open section highlighted,
  locked weeks greyed "in preparation", the homework as an `HW` chip, and the
  tools at the foot. `NAV` in `nav.js` is the one copy of that tree — it
  mirrors the hub's `WEEKS` and each page's `SECTIONS`, and nothing checks
  it, so a renamed section or a shipped week is changed there too. A section
  link on the SAME page calls the page's `show(id)` and sets `#<id>`; on
  another page it is `weekX.html#<id>`, which `nav.js` turns into `show(id)`
  on arrival (`#lecture` stays the deck's). It wraps `show()` to keep the
  hash current, so a reload lands on the section. Styles in **`nav.css`,
  which `nav.js` injects itself** — so the hub, which does not load
  `stats.css`, carries the menu too (19 Oct 2026). ⚠ **Every page here carries
  `<base href="/SUMAS/mba401/">`**, so a file:// probe of a week page loads
  no relative script at all — `nav.js`, `presence.js`, `courseprogress.js`
  all 404 silently; probe over `python3 -m http.server` from the repo root,
  with `COURSE_LOGIN_AUTO=false` and `--force-prefers-reduced-motion` so the
  drawer's slide-in is not frozen mid-way by virtual time.
- **The two folders are independent.** A fix in one reaches the other only
  if you port it by hand.
