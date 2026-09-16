# Teaching Web — how this repo works

Interactive course material for Jan Erik Meidell, served at **https://janerikmeidell.com**.

> **This repo IS the live web root.** Every committed file is publicly downloadable.
> Nothing secret goes in a tracked file — not answer keys, not passwords, not raw
> student data. See [Secrets](#secrets) before adding anything.

---

## 1. Architecture in one paragraph

Static HTML, no build step, no framework, no dependencies. You edit a file and push;
GitHub serves it. Each course is a folder of hand-written, self-contained pages — the
pages *are* the product, and they are deliberately bespoke. What is *not* bespoke —
identity, progress, announcements, the admin dashboard, page chrome — lives once in
`/shared/` and is loaded by absolute path. State lives in a single Firebase Realtime
Database (`teaching-70f1c`), namespaced per course.

```
/                     root catalogue page, built from courses.json
/courses.json         ← single source of truth for every course
/shared/              the shared runtime (see §3)
/track.js             site-wide pageview logger (loaded by ~190 pages)
/<course>/            one folder per course; see §4
/<School>/<course>/   some courses sit under a school folder — HEG, Kalaidos, UMEF.
                      `dir` in courses.json carries the full path either way
```

## 2. courses.json — the registry

Adding a course means adding an entry to [courses.json](courses.json). It drives the
root catalogue cards, the `/shared/admin2.html` course picker, and the shared runtime's
theming. Key fields:

| Field | Meaning |
|---|---|
| `id` | stable slug; also the `data-course` value on pages |
| `ns` | Firebase namespace (`null` = course stores no student data) |
| `dir` | folder on disk (may differ from `id`, e.g. `e1410` → `ideas-e1410`) |
| `keyPrefix` | localStorage prefix; defaults to `id`. Only set where history differs (`statistics` → `stats_`) — **changing one orphans every student's saved progress** |
| `status` | `live` (running cohort) · `evergreen` (open, no cohort) · `archived` |
| `listed` | show on the public root catalogue? Cohort courses are `false` |
| `theme` | key into the `themes` block |
| `features` | which shared modules the course opts into |

**Cohort courses are unlisted by design.** OMBA401, OMBAFR455, E1410 and UMEF407 are
reached by direct link or QR from the LMS, not from the public catalogue.

### Course lifecycle

`status` is `live` (a cohort is running), `evergreen` (open, no cohort) or `archived`.

When a course ends and a new edition replaces it, **don't delete the old folder** —
students have the links bookmarked and the LMS points at them. Set `status:"archived"`,
add `supersededBy:"<new-id>"`, set `listed:false`, and add to its pages:

```html
<script>window.COURSE_STATUS_ID="sustainable-finance";</script>
<script src="/shared/status.js" defer></script>
```

[shared/status.js](shared/status.js) then puts a banner at the top pointing to the
replacement, in the course's own language. On the root catalogue it badges archived
cards, and on localhost it warns in the console if a `listed` course has no card —
the closest thing to a build-time check this repo has.

## 3. The shared runtime — `/shared/`

Always loaded by **absolute** path (`/shared/x.js`), never relative, so it resolves the
same from `/omba401/week3.html` and `/ideas-e1410/session1.html`.

| File | Does |
|---|---|
| `config.js` | reads `courses.json`, exposes `Course.get(id)`; every other module depends on it |
| `progress.js` | student identity, active-time, per-section completion, scores → DB |
| `login.js` | name + personal code, so a student resumes on any device |
| `announce.js` | cohort announcement banner (instructor posts it from admin) |
| `chat.js` | the student's message panel — instructor, group and cohort threads |
| `admin-gate.js` | the shared instructor gate (hashed PIN, remembered per device) |
| `admin2.html` | **the** dashboard for every course: `/shared/admin2.html?course=omba401`. Today → The cohort → The roster, plus Presence and Handed in, as tabs. The original `admin.html` was deleted in Sept 2026 once this one was chosen; its presence register and submissions panel were ported across first |
| `insights.html` | the other instructor view: **where the cohort gets stuck** — section-level stall points, module drop-off, workbook fill rates. Same gate, same read path. Per-question quiz stats stay in the dashboards; don't duplicate them |
| `chat.html` | the instructor's end of `chat.js`: read what came in and answer it — one student, a group, or the whole cohort |

### The three instructor views, and what each is for

| | Question it answers |
|---|---|
| `admin2.html` | *What do I do before the next session?* Ranked actions, cohort shape, one roster table with a per-student drawer, the presence register, and what has been handed in — five tabs |
| `insights.html` | *Where is the course failing them?* Section-level stall points and workbook fill rates, across any course |
| `chat.html` | *What are they asking me?* Threads with one student, a group or the cohort. All three link to each other in the header |

Five things worth knowing before editing any of them:

- **A tab is offered only when its panel has content.** `renderTabs()` reads each
  panel's own display state rather than duplicating the "does this course have
  presence / submissions" logic, so a course with no quizzes never grows a
  Checkpoint tab and one with no register never grows a Presence tab. The active
  tab is remembered per browser, and `#presence` in the URL opens that tab — which
  is what the classroom console's "Register →" link relies on.
- **The checkpoint quiz is a two-level accordion**, panel ▸ session ▸ questions. Flat, it
  printed eighty rows. Closed, each session shows its score and its weakest question,
  which is the line you actually act on. Open/closed state lives in `QOPEN` / `QPANEL`
  outside the render, so a refresh does not slam it shut.
- **The assignment reader is per-student, not per-question.** It used to show one field
  across the whole cohort; you mark a person, not a field, so it now takes a student and
  prints their whole assignment with the gaps spelled out. `assignmentHTML(s, showGaps)`
  is shared with the row drawer — one renderer, two entry points.
- ⚠ **`admin2.html` must never substitute one cohort for another.** Asking for
  `?course=X` where X is not in the registry now **stops and says so**; it used
  to fall through to `list[0]`, so the page showed *another course's students*
  under a URL naming this one, with no warning. That is not hypothetical: a
  browser holding a cached `/courses.json` from before a course was added hits
  it every time, and with two courses called something like "Quantitative
  Methods" the substitution is not even obviously wrong on screen. A
  *remembered* id (no URL param) may still fall back — nothing was asked for.
  `CourseConfig.load()` now fetches `courses.json` with `cache:"no-cache"` for
  the same reason: a stale registry makes a new course simply not exist.
- **Flags in `admin2.html` are relative, not absolute.** "Behind" means well under *this cohort's* median at *this point* in the course. The original used fixed thresholds (under 60%, under 50%), which mid-term flagged 13 of 18 students — a flag on two thirds of the cohort is not a flag. Don't reintroduce a constant here.
- **`courses.json` themes expose `accent` / `accentBright` / `glow` / `surface`** — not `deep` / `bar` / `main` / `pale`. The old `admin.html` looked for the second set, so only two of eight keys ever matched and *every course rendered navy*. `applyTheme()` maps the keys the file actually has. If you add a theme variable, add it to `courses.json` **and** to the mapping.
| `lesson.css` | the 128 layout rules every `weekN.html` shares |
| `homework.css` | the 70 rules every `weekN-homework.html` shares |
| `themes/*.css` | colour variables only — `sumas`, `ideas`, `umef`, `navy` |

**`lesson.css` and `homework.css` must never be merged.** The two archetypes give the
same selectors different values (`body` line-height 1.65 vs 1.6, `h1` 44px vs 38px,
`.wrap` padding 20px vs 18px). Combining them makes one silently overwrite the other —
this was caught by a computed-style diff, not by eye.

Themes expose two naming layers: neutral names (`--accent`, `--surface`, `--ink`) are
the API for new work; legacy names (`--green`, `--sand`) alias onto them because the
existing pages and the shared stylesheets still reference those. Don't write new rules
against the legacy names.

### Wiring a page into it

The page declares what it is; the shared scripts read that. No per-course JS copies.

```html
<body data-course="omba401" data-module="w3">
  ...
  <script src="/shared/config.js"></script>
  <script src="/shared/progress.js" defer></script>
  <script src="/shared/announce.js" defer></script>
  <script src="/track.js" defer></script>
```

Then once the DOM is ready:

```js
StatsTrack.init({ module: 'w3', title: 'Week 3 · Probability', total: 6 });
StatsTrack.complete('s3');     // mark a section done
StatsTrack.setScore(6, 8);     // quiz / homework pages
```

## 4. Anatomy of a course folder

```
<course>/
  index.html          course home — the map of the course
  week1.html …        one lesson page per week/session
  week1-homework.html paired homework, where the course has one
  admin.html          thin redirect → /shared/admin2.html?course=<id>
  _private/           NEVER COMMITTED — answer keys, question banks, run sheets
```

The dashboard's columns come from the course's `modules` array in courses.json — that
array *is* the dashboard. Adding a week means adding a module entry there, not editing
an admin page.

Cohort courses also carry: `glossary.html` or `notation.html` (a reference page that
**grows every week** — updating it is part of shipping a week), and a logo image.

### HEG · Applied Statistics — `HEG/statistics/`

The Bachelor IBM course, rebuilt in Sept 2026 on the HEG syllabus (16 weeks,
Saylor's *Introductory Statistics*, 60 % exam · 20 % project · 20 % presence — the
syllabus prints 70/15/15 and Jan Erik overrode it) and
on the E1410 pattern: a hub with a course-progress bar, one `weekN.html` per
syllabus week — **nine sections**: six lesson screens, the in-class exercise set,
a 10-question checkpoint and a workbook — with a lecture deck (▶ Lecture,
print → PDF), plus `weekN-homework.html` on the shared homework engine. One running case throughout: pricing a pizzeria in
Geneva. Public and listed; shared login only, **no class password** by decision.

- **Theme** is `/shared/themes/heg.css` — blue `#002C46` for headings and dark
  slides, red `#CC0000` accents, taken from heg.hesge.ch's own stylesheet. Font
  is Helvetica/Arial (HEG's Clarika is licensed). `stats.css` is the week-page
  stylesheet, ported from `ideas-e1410/session.css` with the **same class names**
  so the lesson engine ports unchanged; HEG overrides sit at its end.
- **Weeks 1–2 are complete; 3–16 are scaffolds** generated by
  `_build/scaffold.py` from a `SPEC` — real pages with objectives, planned
  sections, Saylor links and a slide outline, banner-marked "in preparation",
  `live:false` in `courseprogress.js` so they count nothing, locked on the hub.
  Re-run the script after editing the plan; **delete a week's SPEC entry once
  its page is hand-written** or the generator overwrites it.
- **Module ids are `w1`, `w1-hw`, `w2`, `w2-hw`…** — they replaced `m0`/`ch1` in
  the rebuild. The old filenames (`m0-foundations.html`, `ch1-descriptive.html`,
  the two homeworks) are redirect stubs; keep them. `keyPrefix` stays `stats`.
- **A session is 3 hours in two parts, and the deck and the page mirror each
  other.** Part 1 (~1 h) is six lesson sections; each `SECTIONS[]` entry carries
  `slide:` and the matching slide carries `site:'sN'`, rendered as a chip on
  both. Part 2 (~2 h) is the in-class exercise set. Change one side of that
  mapping and you must change the other — nothing checks it for you.
- **`exercises.js` is the Part 2 engine, and ONE `EXERCISES` array per week is
  the source of truth** for the page form, the deck slide and the speaker-note
  solution, so the three cannot drift. `StatsEx.mount()` builds the forms,
  `StatsEx.slides()` the slides, `StatsEx.wireSlide()` the reveal button.
  Answers go to `mod/<m>/ex/<id>` — *not* `work/`, which is the graded project.
- **Solutions are released by the instructor, per exercise.** The instructor's
  device is the one where `AdminGate.isUnlocked()` is true (the same password as
  the dashboards); there, every solution is in the speaker notes from the start,
  and the slide's reveal button writes `statistics/_release/<mod>/<exId>`.
  Student pages poll it every 8 s and unlock; releases are permanent. On a
  student device the solution is never rendered into the deck — but **the `sol:`
  text is still in the page source**, like every homework solution in this repo.
  The release stops a student racing ahead in class; it is not secrecy. Never
  put anything confidential in a `sol:`.
- **Presence is 20% of the grade, pro rata, and `presence.js` records it.** The
  instructor opens a window for the session; every student's button goes grey →
  red; each student presses it once; the instructor closes it. Data lives at
  `statistics/_presence/<mod>` — `open`, `label`, `openedAt`/`closedAt` and a
  `marks/<sid>` map. **Marks live under `_presence`, not under `<sid>`**, so that
  a mark cannot exist without a session behind it and one read gives the whole
  register. `/shared/admin2.html` grows a column per session automatically —
  opt-in via `"presence"` in the course's `features`; any cell is clickable to
  correct the register by hand, because somebody always arrives late.
- **Opening and closing lives in the dashboard, never on a student page.**
  `admin2.html` → Presence tab has the session picker and the Open/Close button,
  and writes both nodes with the dashboard's own signed-in token. The course page
  and the week pages carry *only* the student's own button and their own record —
  `presence.js` has no sign-in code, no Firebase import and no `isInstructor()`
  branch at all. It briefly had an instructor console on the course page; that was
  wrong, because that page is what thirty students are looking at.
- **The register is the only thing on the dashboard that polls.** Everything
  else is a snapshot you refresh when you want one; while a window is open you
  are watching a room fill up, so `presRefresh()` re-reads `_presence` alone —
  a few KB, not the whole namespace — every 5 s while open, 15 s while you are
  on the tab, and never otherwise. It re-renders only the presence card, so an
  open drawer or a half-typed announcement is never disturbed.
- **The picker needs every teaching week, not just the published ones.**
  `courses.json` lists only modules that exist, so presence reads
  `presenceSessions` (15 for statistics) and offers `w1`…`wN`, labelled from
  `modules` where a match exists and "Week N" otherwise.
- ⚠️ **Opening a window needs a signed-in account, not the gate.** The deployed
  rules make `_presence/$session` instructor-write-only, so the plain `fetch` the
  week page used until Sept 2026 came back **401** — the button appeared to work
  for six seconds and then silently reverted, and no student button ever turned
  red. The gate decides what is *shown*; the account is what the database
  *trusts*. Do not "simplify" this back to an anonymous write, and do not relax
  the rule instead — an anonymous open would let any student open a window and
  mark themselves present for a session that never happened.
- **It is a dedicated email+password account, `presence@janerikmeidell.com`, not
  a Google popup.** Two reasons. A popup is blocked whenever the click that
  opened it has been spent waiting for the SDK to load (`auth/popup-blocked`) —
  a lousy thing to discover in front of thirty people. Safari blocks the popup
  outright and its redirect fallback is unreliable there too, so since Sept 2026
  **the three instructor pages sign in with this same account** through
  `shared/fb-auth.js`, and the rules accept it everywhere the Google address is
  accepted. ⚠ It was originally scoped — write `_presence_now`, `_presence/$session`
  and a mark, nothing else — and commit `447c44e` widened it to full instructor
  read/write on every namespace. **So it is no longer a classroom-only key**: the
  password typed on a laptop in front of thirty students now opens every cohort's
  data. If that is not wanted, the fix is a second account for the dashboards, not
  a UI change. `CTRL_EMAIL` in `presence.js` and the `.write` rules must agree. The
  password is never stored by us: Firebase keeps its own session in IndexedDB and
  `restore()` picks it up silently, so it is typed once per laptop, not once per
  class. The ID token is re-minted on every write, because a session is three
  hours and a token lasts one.
- **The signed-out console contains a password field and the hub polls every 7 s** —
  so `paintInst()` skips the re-render unless its signature (signed-in, open,
  selected week, tally, message) actually changed. Remove that guard and the
  field empties itself while you type.
- **`statistics/_presence_now` = `{mod, label, open, ts}` is how students find
  the open session.** They cannot list `_presence` (that would hand out the
  cohort's sids in one request), so they have no other way to discover *which*
  week is accepting marks. The pointer carries no sids, so it is world-readable;
  it is written alongside the session node on every open and close. Until that
  rules block is deployed the hub **falls back to scanning all fifteen session
  nodes every 20 s** — which works, just fifteen times the traffic — so presence
  is never broken by an undeployed rule, only slower.
- **The grade is 60 exam / 20 project / 20 presence**, not the syllabus's
  70/15/15. If you change it, it is stated in four places: the hub's intro modal,
  its assessment block, `teaching-plan.html` §1 and Week 1's slide 2.
- **The student sign-in prompt is suppressed when the gate is unlocked**
  (`COURSE_LOGIN_AUTO=false`), or it lands on top of a slide mid-lecture.
- **Every `ans:` was verified in Python before shipping.** The answer key goes on
  a projector in front of thirty people. Do the same for any new set.
- **The progress denominator is `EXTRA_STEPS.length + .cl-row + .q + [data-work]`.**
  Same trap as E1410's `exercises.js`: any element added to a live week page with
  class `q` or `cl-row` or a `data-work` attribute silently lowers every
  student's displayed progress. The course-map cards use `.mq` for exactly this
  reason. Tools (practice, exam cards, simulators) are `opt:true` in
  `courseprogress.js` and never enter the percentage.
- **`exam-cards.html` is the real papers, not invented practice.** 28 cards, one
  per question actually set in 2020, 2022, 2023, 2024 and 2026; each carries its
  `year` and `cat` (Normal distribution · Confidence interval · Hypothesis test ·
  Two samples · Paired · Regression · Chi-square · Sampling distribution). Every
  `ans:` was recomputed in Python from the question — **six of the original answer
  keys are wrong** (2023 Ex3 z, 2023 Ex4 CI limits swapped, 2022 Ex1 p⁶, 2022 Ex3
  p-value on the wrong tail, 2022 Ex5 χ², 2020 Ex4 sample size). Each correction is
  flagged in the card's solution rather than silently applied. Never copy a number
  off an old key; recompute it.
- **A regression card without its printout is unanswerable.** The six regression
  questions are answered *from* an Excel output with values blanked, so each card
  carries an `excel:` table reproducing the real one, blanks highlighted and
  labelled exactly as the paper labelled them — (a)…(e), or A…E in 2020. The
  answer fields must match those blanks one for one.
- **The seven tools** (`practice`, `exam-cards`, `sampling-sim`, `distributions`,
  `sampling-machine`, `real-or-random`, `catch-the-mean`) keep their own inline
  CSS, written for the old navy/gold dark theme; the restyle **redefined their
  `:root` variables** to a light HEG palette (`--navy-deep` is now white, `--gold`
  is red) rather than rewriting each rule. If you edit one, use the variables,
  not literal navy/gold hexes.
- Workbook fields are listed in `courses.json → project.sections` so the
  dashboard's assignment reader shows the pizzeria file; there is no
  `compile.html` yet (the E1410 one is the template).

### HEG · Quantitative Methods I — `HEG/quantitative-methods/`

The year-long Bachelor IBM module (2026/27 syllabus: Caboussat, Kirner, Meidell,
Vialfont), built Sept 2026 on the **HEG/statistics pattern** and sharing its
engine almost verbatim — a hub with a course-progress bar, one `weekN.html` per
syllabus week with a lecture deck (▶ Lecture, print → PDF), a Part 2 exercise
set on `exercises.js`, an ungraded review quiz, and `weekN-homework.html` on the
shared homework engine. One running company throughout: **XY Coffee Co.**, where
the student is the junior analyst and Jane is Head of Insights. Public and
listed; shared login, no class password.

- **`id`/`ns`/`keyPrefix` are all `qm1`**, and `quant.css` is a port of
  `stats.css` with the **same class names**, so the lesson engine moves
  across unchanged. This course's own additions (`.eqn`, `.biz`, `.jane`,
  `.four`, `.swap`, `.trap`, `.ntab`, `.m`) sit at the END of the file, so a
  diff against `stats.css` shows exactly what was added.
- **Its runtime files are renamed ports, not copies of a shared module.**
  `answers.js` → `QMAns`, `exercises.js` → `QMEx`, `presence.js` →
  `QMPresence`. They are byte-comparable with the statistics originals apart
  from the namespace, the `qm1_auth` key and the copy — so a fix in one
  should be considered for the other, and neither is `/shared/`.
- **The year is ONE bar: fall weeks are `w1`…`w16`, spring weeks `s1`…`s16`.**
  That split is load-bearing, not cosmetic: `presence.js` picks its sessions
  with `/^w(\d+)$/`, so naming the spring weeks `s*` keeps them out of the
  register's dropdown, which covers the fall sessions only. All 32 are listed
  in `courseprogress.js` from day one, hatched; shipping a page flips
  `live:true` and never changes the denominator, because `pctOf()` averages
  over the live chapters only.
- ⚠ **Nothing in this course is graded except three written exams** — 20% fall
  midterm (MCQ, 60 min) · 40% fall exam · 40% spring exam, both finals 120 min,
  closed book. Homework and the weekly review quiz carry **no marks**, and the
  student-facing copy says so everywhere. There is **no hand-in**: no
  `workbook` feature, no `project` block in `courses.json`, no workshop
  section on a week page. If one is added later it must be added in both
  places at once, the way the statistics course documents.
- ⚠ **Attendance is recorded but NOT graded.** The syllabus is explicit
  ("absences are not directly penalized; attendance is monitored for
  pedagogical purposes"), so `presence.js`'s copy was rewritten: it is a
  teaching register, not a grade component. Do not paste the statistics
  course's "20% of your grade, pro rata" wording back in — it would tell
  thirty students their mark is at risk when it is not.
- **`presence.js` here implements the `scan()` fallback that the statistics
  copy references but never defines.** When `_presence_now` cannot be read —
  the undeployed-rules case — `pull()` falls through to `scan()`, which asks
  each published session node in turn and takes the first that reports itself
  open. Throttled to once every 20 s however often `pull()` runs, because it
  costs fifteen small requests instead of one. **The statistics copy still has
  the bare `ReferenceError`**; fix it there before the next cohort needs it.
- **Week 1 is complete; fall weeks 2–16 are scaffolds** generated by
  `_build/scaffold.py` from a `SPEC` — real pages with the syllabus's own
  objectives, planned sections, the week's reading and a slide outline,
  banner-marked "in preparation", `live:false` in `courseprogress.js` so they
  count nothing, locked on the hub. Re-run the script after editing the plan;
  **delete a week's SPEC entry once its page is hand-written** or the
  generator overwrites it. Spring weeks have no pages at all yet, and their
  hub cards deliberately carry no `href`.
- **The deck must contain every slide of the printed deck, and more.** The
  instructor's own PDF (`quantitativemethods_I_I_W1.pdf`, 42 slides) is the
  floor, not the ceiling: Week 1's deck is 76 slides, every printed one
  present and in order, with extra worked numbers so each technique is seen at
  least twice, plus the business reasoning the printed version leaves to the
  room. PDF overlay builds are flattened into one slide with the working
  shown; the speaker notes say where to stop and ask the room first.
- ⚠ **A new namespace needs a block in `firebase-database-rules.json`, and a
  DEPLOY.** The rules enumerate namespaces (`omba401`, `statistics`, …) and the
  root is `.read:false, .write:false`, so a namespace with no block is **shut
  to everyone**: no progress, no sign-in, no presence, no chat, no release.
  `qm1`'s block is a copy of `statistics`'s with the one self-reference
  changed (`root.child('qm1/_presence/'…)`). Verify with an anonymous probe —
  `<ns>/<sid>` must read **200** and `<ns>` itself **401**.
- ⚠ **Releasing needs an ACCOUNT, not the gate** — the same lesson presence
  learned. `_release` is instructor-token-only, and the week page has no
  signed-in account, so its PUT returns 401. It used to be swallowed by a bare
  `.catch()`: the button said "✓ Revealed", the instructor's own copy opened,
  and **no student ever saw it**. `pushRelease()` now reports the failure and
  points at the dashboard's Solutions tab, which is signed in and does work.
  Never restore a silent catch here.
- **`QMEx.setPreview()` — view as student.** The gate is per *device*, not per
  account, so once it is unlocked every page shows the instructor view whoever
  is signed in, and there was no way to check what the class sees. The
  exercise strip carries a **View as student** toggle (sessionStorage, so a
  fresh tab is the instructor again) and says loudly when it is on.
- **Answers must not run down the diagonal.** `domRows` shipped with its six
  options in answer order — a perfect 0,1,2,3,4,5 — and `cycRows` nearly so,
  which trains pattern-reading instead of thinking. Same trap the E1410 exam
  trainer documents (its correct answer sat in slot B 69 times out of 81).
  After editing any classify group or quiz, check the answer positions are
  mixed, not ascending, and never repeat three times running. The printed
  quiz's seven are exempt — they are verbatim and must not be reordered.
- **Reading the notation is taught explicitly, in §1.2, before any algebra.**
  This cohort is first-year Bachelor and most of them cannot *say* a formula
  out loud — and a formula you cannot say is one you cannot think with. So the
  week carries a notation layer that is not in the printed deck:
  a **symbol decoder** (`SYMBOLS`, ~33 entries in five groups, each carrying
  *what it does*, **why it was invented** — the problem it solves — and *what
  goes wrong if you misread it*), an **anatomy walker** (`ANATOMY`, which
  steps through a formula explaining the job each part performs), and a
  `.sayit` block under every displayed `.formula` on the page.
  ⚠ This was first built around **pronunciation** ("eff of ex") and that was
  wrong: the students do not need to say the symbols, they need to know what
  they *mean*. Explain the job and the reason, never the sound. When you add a formula, add its reading —
  `grep -c 'class="sayit"'` should stay equal to the number of `.formula`
  blocks. The deck mirrors this with six slides and the same `.sayit`/`.symrow`
  devices.
- **The discriminant is derived, not asserted.** Completing the square, with
  numbers first and then the identical moves with letters, so `b² − 4ac` is
  seen to *appear* rather than handed down; then why the sign decides the case
  (it is the one fact that a real number squared is never negative); then
  `gap = √Δ ⁄ |a|`, which turns three rules into one story. Three slides and
  three cards. Any formula in this course that a student would otherwise
  memorise deserves the same treatment — that is the standing instruction.
- **Slide ↔ section mapping is COMPUTED, and must stay that way.** Each
  section's opening slide carries `site:'sX'` in its own literal;
  `wireSlides()` walks the finished deck, sets `SECTIONS[].slide` /
  `.slides` from where the anchors actually landed, and paints the
  `<span class="ref">` chips in the section headings. ⚠ It used to be a
  hand-kept table (`map={6:'s1',9:'s2',…}`) and inserting one slide silently
  desynchronised the deck, the week menu and the headings — which it duly did,
  once, in the first build, and again when §1.2 was added. **Do not reintroduce
  a literal slide number anywhere**; insert slides freely and every number
  moves with them.
- **The progress denominator is `EXTRA_STEPS.length + EXERCISES.length +
  .cl-row + .q`.** Same trap as everywhere else in this repo: any element added
  to a live week page with class `q` or `cl-row` silently lowers every
  enrolled student's displayed progress. There is no `[data-work]` term,
  because there is no workbook.
- **A section is completed by `SECDEPS`, not by the widget that finishes last.**
  The table at the top of the widgets block maps each section to the steps and
  classify groups it requires, and `secCheck()` runs after every `markStep`.
  Classify groups are therefore built with `secId = null` — letting a classify
  group complete a section on its own would make the section easier to finish
  than the plan says.
- **Every number was verified in Python before shipping** — the deck, the seven
  exercises, the twelve quiz answers and all ten homework problems. The answer
  key goes on a projector in front of a first-year cohort. Do the same for any
  new week.
- **Quiz questions 1–7 are the printed review quiz, verbatim** — same stems,
  same five options in the same order, "None of the above" included, because
  students sit with the printed sheet next to the page. Do not renumber or
  re-order them. Questions 8–12 are the site's addition.
- **Homework is the printed sheet, problem for problem** (1.1 … 1.10), and the
  problem numbers on screen match the numbers on the desk. Printed parts
  become extra *fields*, never extra *problems* — which is why 1.5 is split
  into `1.5a`/`1.5b` and the chapter total is 11, not 10.
- **Worked solutions are locked until the instructor throws a switch.** The
  homework page ships its solutions in the source (repo convention) but the
  **Show solution** button refuses until `qm1/_release/w1-hw/_all` exists.
  That key is written from the **Solutions tab** of `/shared/admin2.html`,
  which appears only for a course whose `features` include `"releases"` — so
  no other course's dashboard changes. Student pages poll it every 8 s via
  `QMEx.watch(mod)` and unlock in place, so the room opens together with no
  reload. **Hints and Check are never locked**: those are the parts that
  teach. Per-exercise release (the deck's reveal button) still works — `_all`
  simply means "every id in this module".
  ⚠ **Say what it is.** A classroom gate, not secrecy: the `sol:` text is in
  the page source like every homework solution in this repo. It stops a
  student reading the answers instead of doing the work; it does not stop a
  determined one pressing ⌥⌘U. Nothing confidential in a solution, ever.
- The hub lists **both semesters** in one grid with a `.semhead` divider, which
  is the only layout this hub has that `HEG/statistics/index.html` does not.

### Getting back up: the top-bar link

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

### E1410's tool pages

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

### The final-quiz trainer — `exam-trainer.html`

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

### Primers — and the `opt:true` rule

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

### Remembering what students chose — `answers.js`

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

### Exercises inside the sessions — `exercises.js`

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

## 5. Data model

One Firebase Realtime DB, one top-level key per course namespace:

```
<ns>/
  _announce/            { on, text, ts }          instructor → students
  _roster/<sid>/        { name, pass, ts }        pass = the 6-digit course code
  _quizmeta/<moduleId>/ { title, ts, qs[] }       question text, for cohort stats
  _chat/<tid>/
    meta/               { kind, title, ro, members, ts }   instructor-written
    msgs/<pushId>/      { by:'i'|'s', sid, name, txt, ts }
  <sid>/
    name, sid, createdAt, updatedAt
    mod/<moduleId>/
      title, total, secs, score, firstSeen, updatedAt
      done/<sectionId>: true
      quiz/q<i>:        { p: pickedIndex, c: 1|0, ts }
    work/<fieldId>/     { v, label, mod, ts }     workbook answers
    chats/<tid>/        { t, k, ro, ts }          the student's index of group threads
analytics/<YYYY-MM-DD>/<id>   pageviews from track.js (coarse geo only, never raw IP)
```

### Cross-device login

[shared/login.js](shared/login.js) gives each student a name plus a six-digit code, so
progress follows them from laptop to phone instead of being trapped in one browser's
localStorage. Signing in **pulls remote progress and merges it into localStorage**
(union of completed sections, max of time spent, remote fills empty scores and workbook
fields), then hands identity to `StatsTrack`, which pushes the merged result back. Neither
device's work is lost and it does not matter which one is ahead.

The storage shape is deliberately identical to the one E1410's `join.html` already
used — `<key>_auth = {sid, name, pass}` and `_roster/<sid> = {name, pass, ts}` — so that
course's existing roster kept working with no migration.

Turn it on for a course by setting `login:true` in [shared/config.js](shared/config.js)
and loading `login.js` **before** `progress.js`. When it is on, `login.js` owns the
identity pill and `progress.js` deliberately does not draw its own.

`sid` is the slugified name (`jan-erik-meidell`). Progress is **always** written to
`localStorage` first, named or not — so when a student finally identifies themselves,
everything already done on that device is backfilled to the DB. Do not break that.

### Messages — [shared/chat.js](shared/chat.js) + [shared/chat.html](shared/chat.html)

A course page gets a message panel by adding one script tag after `config.js`:

```html
<script src="/shared/config.js" defer></script>
<script src="/shared/chat.js"   defer></script>
```

That is the whole opt-in — namespace, colours and language come from `config.js`, so
the same file serves every course. E1410's `index.html` is the first page wired up.
The instructor's end is `/shared/chat.html?course=<id>`, linked from all three
dashboards, and `admin2.html`'s student drawer deep-links straight to that student's
thread (`chat.html?course=e1410&t=dm-<sid>`).

Five kinds of thread, and the id prefix says which:

| `tid` | Who is in it | Who can create it |
|---|---|---|
| `dm-<sid>` | the instructor and that one student | either, implicitly |
| `all` | the whole cohort | instructor |
| `g-<slug>` | a group the instructor assembled | instructor |
| `p-<a>--<b>` | two students — the two sids **sorted**, so either side derives the same id | either student |
| `sg-<id>` | a group the students made themselves | any student |

**Starting a conversation is one screen, and it is always reachable.** The
`＋ New` button in the panel header opens the class as a checkbox list, with the
instructor as a row above it: tick one classmate and the button reads *Message
Bo Tran*, tick several and it asks for a group name. An earlier version put this
two taps down **and hid the entrance entirely when the directory was empty** —
which is precisely when a student is first hunting for it. The list, the search
box and the section heading now render whether or not anyone is in them; an
empty class explains itself rather than disappearing.

**The class directory fills itself.** Students cannot list `_roster` — it holds
the six-digit sign-in codes — so messaging a classmate needs a separate list.
`_chat/_people` is `{<sid>:{n:name}}`, names and nothing else, and **each student
writes their own entry** the first time they open the panel. The rules let a
client write one entry with one string field, so the worst it can carry is a
name. The `Class list · N` button in `chat.html` is a convenience that seeds the
whole roster at once, so a classmate who has not opened their messages yet is
still reachable — it is not an on/off switch, and there is no way to switch peer
messaging off short of editing `chat.js`.

Peer and student-group threads write into the *other* student's node
(`<ns>/<their sid>/chats/<tid>`), because neither side can list `_chat` to find
a thread they were added to. The `$sid` rule already allows that write; it is the
same door progress writes go through.

**The instructor does not see student-to-student threads.** `p-` and `sg-`
threads are filtered out of `chat.html`'s inbox, and the student panel's standing
line names *who is in the thread* ("your instructor is not in this thread")
rather than making a promise about privacy.

Be exact about what that is: **a decision not to look, not a technical
guarantee.** The instructor's token reads the whole namespace and no UI choice
changes that. The `🙈 Student threads` toggle in the header exists precisely
because pretending otherwise would be worse — if a student reports something,
there has to be a way in, and it should be a deliberate click rather than a
detour through the Firebase console. Do not "tidy up" by removing the toggle,
and do not add copy claiming student threads are private.

**A student never lists `_chat`** — the rules do not allow it, so nobody can download
the cohort's conversations in one request. `dm-<their own sid>` and `all` are implicit,
and the *groups* they were added to are discovered from `<ns>/<sid>/chats/<tid>`, an
index the instructor writes into the student's own node. That is why creating a group
writes in two places, and why removing one sets `off:true` rather than deleting (the
`$sid` rule refuses a write that removes data).

`meta.ro` makes a thread announcements-only: students read it, the composer is hidden
and `send()` refuses. It is a *client-side* flag — see below for what is actually
enforced.

Both ends poll REST (no Firebase SDK on student pages, per §6): the open thread every
6s, the rest every 30s for the unread badge, paused while the tab is hidden.

### Presence and receipts

Two extra nodes, both deliberately cheap and both **1:1 only** — a single tick on
a group thread would be a lie about who has read what.

| Node | Written by | Means |
|---|---|---|
| `_chat/_presence/<sid>` | whoever has the panel open, every 20s | `{t, at}` — last heartbeat and which thread they are looking at |
| `_chat/<tid>/rcpt/<sid>` | the reader | `{d, r}` — newest ts fetched, newest ts actually displayed |

The heartbeat runs **only while the panel is open** and goes stale after 45s,
because the dot means "they are here now". A green ring means they are in *this*
thread; a plain dot means online elsewhere; otherwise "last seen 5m ago".
Ticks are ✓ sent · ✓✓ delivered · ✓✓ blue read, drawn from the *other* party's
receipt. The instructor's sid in both nodes is `i`, and `chat.html` writes them
too — without that, a DM with the instructor would never move past one tick.

**`chat.html` has no password box.** It opens only on a device where a dashboard
has already been unlocked (`AdminGate.isUnlocked()`); otherwise it renders a dead
end pointing at the dashboard. A student handed the link therefore has nothing to
type into. That is a UI lock on a localStorage flag, not authentication — what
actually keeps them out is the database: reading `_chat` whole needs the Google
token, and `by:'i'` is refused without it. Do not "helpfully" re-add
`AdminGate.mount()` here.

The chat is on **every** E1410 student page, not just the home page — 32 of them.
A page joins by carrying `data-course` on `<body>` plus `config.js` and `chat.js`
before `/track.js`; nothing else. The launcher stays bottom-right and steps up to
`bottom:62px` when `login.js` has drawn its pill there.

### Rules — [firebase-database-rules.json](firebase-database-rules.json)

⚠️ **This file is a copy. Editing it changes nothing until you deploy it** — paste it
into Firebase Console → Realtime Database → Rules → Publish (or `firebase deploy
--only database`). Everything below describes what this file *would* enforce, not
what the database does today.

✅ **Deployed 8 Sep 2026.** The live rules now match this file. Verified by
anonymous REST probe on all five course namespaces:

| Path | Anonymous | Why |
|---|---|---|
| `<ns>` (the whole cohort) | **401** | enumeration is the thing to stop |
| `<ns>/<sid>` | 200 | a device must fetch its own progress with no login |
| `<ns>/_announce`, `_quizmeta/$mod`, `_roster/$sid`, `_chat/$tid` | 200 | the student runtime reads these |
| `statistics/_release/$mod`, `statistics/_presence/$session` | 200 | solution release · the presence window |
| `statistics/_presence_now` | 200 | which window is open — carries no sids, and it is the only way a student can discover the session to mark |
| `statistics/_presence` (the node itself) | **401** | deliberate — it would hand out the cohort's sid list in one request, and a sid is what makes `<ns>/<sid>` guessable. `StatsPresence.mine()` therefore reads **one session at a time**; do not "optimise" it into a single read. |
| writing `_presence/$session` (open/close), `_release/…` | **401** | instructor token only |
| writing `_presence/$session/marks/$sid` | 401 unless that session is **open** | a student marks themselves once, only inside the window, and can never remove a mark |
| writing `<ns>/<sid>`, `analytics/$day/$hit` | 200 | progress and pageviews still record with no login |
| **deleting** anything under `<ns>/<sid>` | **401** | a write must leave data behind, so nobody can wipe a student |

**Consequence worth knowing:** every dashboard now requires the 🔑 Google
sign-in, because the root read it starts with is refused. That was always the
design (the dashboard falls through to a sign-in), but before the deploy the
anonymous read happened to succeed, so the button was never needed.

What the current version enforces, and why it changed:What the current version enforces, and why it changed:

| | Before | Now |
|---|---|---|
| Listing the cohort | anyone could `GET /omba401.json` and download every student | instructor sign-in only |
| Writing | anyone could `PUT` anything, including `null` over the whole course | a write must leave the node existing, so no one can wipe a student or a course |
| Announcements | anyone could post a banner to every student page | public read, instructor-only write |
| Roster codes | n/a | create-once — a code cannot be overwritten, so nobody can hijack another student's login |
| Analytics | anyone could overwrite past hits | create-only, instructor read |
| Messages | n/a | `_chat` is not listable; a thread's `meta` is instructor-only; a message is create-once, capped at 2000 chars, and `by:'i'` is refused without the instructor's token |

**Residual risk, stated plainly:** `<ns>/<sid>` is still world-readable, because an
unauthenticated student device has to be able to fetch its own progress for cross-device
sync, and the database cannot tell one anonymous caller from another. `sid` is a
slugified name, so someone who guesses a classmate's name can read that classmate's node
(including workbook answers). They cannot enumerate the cohort, and they cannot write to
it. Closing this properly needs real student authentication — that is a separate project,
not a rules tweak.

The chat sits inside that same boundary and adds one guarantee and two gaps. The
guarantee is real: **nobody can post as the instructor**, because `by:'i'` only
validates against a signed-in `janerik.meidell@gmail.com` token, and nobody can edit or
delete someone else's message — only the instructor can, which is what makes moderation
possible. The gaps are that a student who guesses a classmate's `sid` can read
`_chat/dm-<sid>` the same way they could already read that classmate's workbook, and
that a student could post to a group thread they were never added to, or under another
name. Announcements-only (`ro`) is a UI flag for the same reason. So: chat is a
convenience for coursework, not a confidential channel. The student-facing copy is
worded to match — a DM is "between you and your instructor, not the rest of the class",
never "private" — and grades, codes and anything else that must stay secret do not go
through it.

Because reads are now instructor-only, **the dashboard needs Google sign-in** (the 🔑
button). The password gate is the UI lock; the sign-in is what the database actually
trusts. The two are not the same thing and one cannot replace the other.

## 6. Conventions that matter

- **Absolute paths for shared assets** (`/shared/…`, `/track.js`), relative for
  course-local ones. The `digital banking` folder has a space in it — always URL-encode
  it as `Kalaidos/digital%20banking` in hrefs.
- **A course folder may be nested one level under a school** (`HEG/statistics`,
  `Kalaidos/digital banking`, `UMEF/negotiation`). `dir` is the path from the web
  root, so `encodeURI(COURSE.dir)` still builds the right link — it leaves `/`
  alone. A page inside a nested course reaches the root catalogue with
  `../../index.html`, not `../index.html`.
- **Theme via CSS variables.** A page's `<style>` should contain layout that is genuinely
  unique to it. Shared layout belongs in `/shared/lesson.css` or `/shared/homework.css`;
  colours belong in `/shared/themes/<theme>.css`. A new week page links a theme plus its
  archetype stylesheet and adds only what is its own — never paste a `:root` palette or
  the standard chrome into it again.
- **Every page gets `/track.js`.** It is best-effort and fails silently.
- **Self-contained pages.** No CDN scripts, no external fonts, no build step. If a page
  needs a library, inline it. The one exception is the Firebase SDK, which
  `/shared/admin2.html` `import()`s lazily *only* if a namespace refuses an anonymous
  read and the instructor has to sign in with Google.
- **French courses are French throughout** — UI strings, error messages, the identity
  modal. Check `lang` in courses.json.
- **Videos:** real runtimes only. Never invent a duration.

## 7. Secrets

`.gitignore` already excludes these; keep it that way.

- `**/_private/` — answer keys and question banks. This is the one that would actually
  hurt: the repo is the web root, so a committed bank is a downloadable bank.
- `*.source.html`, `norvege-2026/build.js` — plaintext sources behind encrypted gates.
- `.env` anywhere.

**Client-side gates are soft gates.** The instructor password is stored as a SHA-256
hash in [shared/admin-gate.js](shared/admin-gate.js), and the course access token in
`ideas-e1410/gate.js` is visible in source. They keep material off the open web; they are
not authentication. Anything that must genuinely stay private (grades, banks) must not be
in the repo at all.

### The instructor gate

One password, one implementation, remembered per device. `AdminGate.mount({…})` hides a
page until it is given, then stores it in `localStorage.jem_admin_pw` — so the next visit
in that browser opens straight through, and unlocking any one instructor page unlocks
them all. `AdminGate.lock()` forgets it. Changing `PASS_HASH` invalidates every
remembered device automatically, because the stored value stops hashing to a match.

Pages behind it: `/shared/admin2.html` (all course dashboards), `beyond-defi-dashboard`,
`samedi-dashboard`, `samedi-tutorat`, `gauntlet-host`.

**Instructor gates and student PINs are deliberately different passwords.** Several
student-facing pages — the Jeopardy games, the millionaire games, the wind course — have
their own PIN that gets read out in class. Those must *never* be set to the instructor
password: a PIN you tell thirty students is not a password that can also protect the
dashboards. If you rotate the instructor password, only `PASS_HASH` changes.

**Never let a gate double as a real credential.** Two dashboards used to replay their
gate password into `signInWithEmailAndPassword()` and keep it in `localStorage` in
plaintext. They now use a Google popup instead: the gate hides the UI, Google proves who
you are, and no account password is ever typed into a page or stored.

## 8. Working on this repo

- **Never retrofit wholesale.** 232 pages of working HTML is an asset. Adopt the shared
  layer in new pages; backport an old page only when you are already editing it.
- **Test by opening the file**, or `python3 -m http.server` from the repo root when a
  page needs absolute `/shared/…` paths to resolve.
- Commit messages in this repo are terse by convention.
