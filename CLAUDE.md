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
/assets/              site-wide images that belong to no course — today just the
                      root catalogue's og-image.png. A course's own images live in
                      the course folder; nothing loose at the web root
/shared/              the shared runtime (see §3)
/track.js             site-wide pageview logger (loaded by ~190 pages)
/<course>/            one folder per course; see §4
/<School>/<course>/   most courses sit under a school folder — HEG, SUMAS, UMEF, ESM, GBS,
                      Kalaidos.
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
<script>window.COURSE_STATUS_ID="<the-archived-course-id>";</script>
<script src="/shared/status.js" defer></script>
```

[shared/status.js](shared/status.js) then puts a banner at the top pointing to the
replacement, in the course's own language. On the root catalogue it badges archived
cards, and on localhost it warns in the console if a `listed` course has no card —
the closest thing to a build-time check this repo has.

## 3. The shared runtime — `/shared/`

Always loaded by **absolute** path (`/shared/x.js`), never relative, so it resolves the
same from `/SUMAS/omba401/week3.html` and `/ideas-e1410/session1.html`.

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
| `inbox.html` | **every course on one screen** (19 Oct 2026): one `_chat` read per namespace, the threads holding a student message you have not seen, newest first, each row a link into `chat.html` at that thread; the rest fold into one quiet line per course. ⚠ A thread waits until **answered**, not until read (20 Oct 2026): only your own later reply, or the page's own per-device "Mark as handled", clears it — chat.html's read mark and receipt do not, because a message read on the phone and not replied to is exactly what the page is for. chat.html opens with a "← Inbox" button. Never counts `p-`/`sg-` threads. Same gate, same account; a namespace with undeployed rules is listed under *Could not read*, not hidden. Linked from all four instructor pages and the school landing pages |
| `site.html` | **the one page about the SITE, not a course** (8 Oct 2026): the on/off switch for the **email alert** on student messages, and **visitor statistics** — pageviews and devices per course, per day, top pages, countries, referrers — read from `analytics/`. Same gate and sign-in as the others; linked from all three |
| `board.html` | **the room's answers on the TV, anonymous** (9 Oct 2026). `?course=<id>&p=Title|field_a+field_b;Title|field_c`: one panel per `;`, `+` merges fields into one tally. Starts behind a curtain (the count climbs, **Reveal** shows the answers); short answers tally, long ones become cards; re-reads every 10 s; keys 1–9, space, ←/→. Reads each student's own `work/` with the signed-in account (`shallow` sid list, then `<sid>/work.json`, never the whole namespace), opens only where the gate is unlocked, and **never renders a name, sid or time**; cards are ordered by a hash of the sid. No `p` = a picker of every field the class has written in. `boardlink.js` puts a "📺 On the screen" button on any element with `data-board="<p>"`, on the instructor's device only (`jem_instructor`). Wired on both GBS Session 1 pages |

### The three instructor views, and what each is for

| | Question it answers |
|---|---|
| `admin2.html` | *What do I do before the next session?* Ranked actions, cohort shape, one roster table with a per-student drawer, the presence register, and what has been handed in — five tabs |
| `insights.html` | *Where is the course failing them?* Section-level stall points and workbook fill rates, across any course |
| `chat.html` | *What are they asking me?* Threads with one student, a group or the cohort. All three link to each other in the header |
| `inbox.html` | *Is anybody, anywhere, waiting for me?* All courses, new messages only, one click into the thread |

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
- **The Comparisons tab (20 Oct 2026) tallies a scoring grid across the class.**
  A page that lets a student score several things on one grid — gen110
  séance 2's *Le même prompt sur trois assistants — qui gagne, et pourquoi*,
  and its duel — writes the grid whole to `<sid>/mod/<m>/grid/<id>` =
  `{t, cols, crit, cells, tot, n, win, tie, why, ts}` (`StatsEx.grid()` in
  gen110's `exercises.js`, debounced; `why` names the carnet field holding
  the student's reason, `w2_gagnant`). `renderGrids()` offers the tab when
  any such record exists and, per grid: who wins (outright winners among
  complete grids, ties apart), a criterion × assistant table of mean
  scores with the class's weakest criterion marked, a computed reading
  ("X wins most often and leads most on Y"), every student's totals, winner
  and reason in their words. Assistant names are typed by students and are
  **normalised** (`normAsst`: "chat gpt" = "GPT" = ChatGPT) before counting;
  a one-column grid gets a histogram instead of a tally. Nothing is a key —
  the scores are the students' judgements. Any course can use it by
  writing the same shape; a partial column is left out of the means.
- **`courses.json` themes expose `accent` / `accentBright` / `glow` / `surface`** — not `deep` / `bar` / `main` / `pale`. The old `admin.html` looked for the second set, so only two of eight keys ever matched and *every course rendered navy*. `applyTheme()` maps the keys the file actually has. If you add a theme variable, add it to `courses.json` **and** to the mapping.
| `theme.js` | light / dark, one switch per device. **Loaded in `<head>`, not deferred** — it sets `data-theme` before first paint, or the page flashes white. Opt-in, one `<script>` per page; only `HEG/statistics` uses it today |
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

### Dark mode — `/shared/theme.js` and the rules that make it safe

`HEG/statistics` runs light or dark from one switch in the top bar (`jem_theme`,
site-wide, default = the operating system's setting). `theme.js` resolves *auto*
itself and writes `data-theme="light|dark"` on `<html>`; the CSS therefore needs
**one** palette block rather than a `[data-theme]` block plus a matching media
query that would drift from it. With JavaScript off every page is light, which is
what it was before.

Four rules, each of which was learned by breaking something:

- **A dark value is a NEW token; a light value is never edited.** Every use
  passes its own light colour as the `var()` fallback — `var(--wash,#E5E9EF)` —
  and the token exists only in the dark block. Daylight then cannot change, by
  construction. The first pass did the opposite (tokenise the literal, define
  the token in both themes) and quietly moved the tools' page background from
  `#F6F7F7` to white — 55% of the pixels on `practice.html`.
- ⚠ **A colour that carries white text is a SURFACE, not a text colour.**
  `--navy` is what an `h2` is set in, so on a dark page it becomes pale blue —
  and every navy *panel* (`.lect-btn`, the plan's table headers, `.ex-inst`,
  the speaker-note strip, which used `--ink` the same way) turned into white
  text on pale blue. `--navy-surface` / `--navy-surface-deep` / `--ink-surface`
  stay dark in both themes and are what those rules use. Their light values are
  exactly what they replaced.
- **Pale washes invert, they do not darken.** `--accent-pale` is `#FFF0EF` by
  day and `#3A1B18` by night. Darkened instead, every accent block turns muddy
  grey and the page stops having an accent.
- **HEG red is not readable as text on dark.** `#CC0000` measures about 3.4:1
  on `#161B21`. `--accent` lightens to `#FF5A4E` (~6.4:1) for text and rules;
  `--accent-fill` keeps the brand red for large fills.

Three things deliberately do **not** follow the reader's theme:

- **The projected deck.** `#lect.dkbg .lect-stage` is written in literal brand
  navy: what the room sees must not depend on whose laptop is plugged in.
- **Print.** `@media print` restores the whole light palette, and `theme.js`
  also flips the attribute around `beforeprint`/`afterprint` so that **charts**
  repaint — CSS cannot reach a colour already drawn into an SVG.
- **Every other course.** They never load `theme.js`, so `data-theme` is never
  set and every `var(--x, <literal>)` falls back to the literal.

**Charts are the part CSS cannot do.** An SVG or canvas attribute does not
follow a variable, so `week1`/`week2` build their `C` palette from `--viz-*`
tokens and, on the `course-theme` event, **remap the colours already in the
DOM** rather than calling `draw()` again — most of those widgets resample or
refit inside `draw()`, and switching theme must not deal the reader a new hand
of data. `sampling-sim` redraws instead, because its two draws are idempotent.

**Testing it means looking at it.** `--force-dark-mode` makes headless Chrome
report `prefers-color-scheme: dark`, so the whole course can be screenshotted
in both themes; and a light-mode screenshot diffed against `git archive HEAD`
is what proves daylight did not move. That diff is the test that matters — the
toggle button, and a 3px taller bar on the tool pages, are the only differences
that should survive it.

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
- **Weeks 1–6 are complete; 7–16 are scaffolds** generated by
  `_build/scaffold.py` from a `SPEC` — real pages with objectives, planned
  sections, Saylor links and a slide outline, banner-marked "in preparation",
  `live:false` in `courseprogress.js` so they count nothing, locked on the hub.
  Re-run the script after editing the plan; **delete a week's SPEC entry once
  its page is hand-written** or the generator overwrites it.
- **Week 3's exercises are the TEXTBOOK'S OWN, word for word** — Jan Erik's
  call (27 Sep 2026): "instead of inventing them, pick a mix from the online
  book". Part 2 is ten end-of-section exercises from Saylor §3.2–§4.3, the
  homework thirteen more (all odd-numbered, so the book prints an answer for
  each); every one carries a "Saylor §x.y · Exercise n" line. Stems are never
  reworded — only the answer boxes are ours, and parts that ask for an
  explanation are answered in the solution. Exercise numbers in the online
  book restart per section (Basic 1…, Applications continue). Weeks 4 and 5 (Saylor ch. 5–6, 28 Sep 2026) follow it too — z rounded to
  two decimals then the table, the book's own method, is how every normal
  answer is computed. Follow the same pattern for later weeks unless told otherwise. Every answer was still
  recomputed in Python: the book's keys are right for these, but §4.3 #3(c)
  prints "0.1812" for 0.18¹², and §4.2 #19's probabilities sum to 0.99, so
  its σ only comes out as the book's 1.2046 from Σ(x − µ)²P(x).
- **Week 6 (Saylor ch. 7, 2 Oct 2026) keeps the THEORY close to the book too**: the
  formula boxes and Examples 1–11 are quoted in `.book` blocks, the book's own
  interpretation sentence is the one the clinic marks correct, and the t table
  (Figure 12.3, df 1–50 × eight columns, plus its ∞ [z] row) is embedded as `T`/`Z`
  so every widget reads the same critical value a student reads off the page —
  3.090 for 99.8%, 2.807 for 99.5%, never a computed quantile. Interactive
  widgets are the course's own (the capture simulation, the interval builder,
  the t-table explorer, the which-formula tree); the textbook content is not.
- ⚠ **The DECKS of Weeks 5 and 6 carry the chapter VERBATIM** (7 Oct 2026,
  Jan Erik: "I want the full text from the examples and from the cards
  (theory, etc.) in that book to be reflected in the slides … do not let
  things out"; the first Week 6 deck paraphrased and he called it
  incomprehensible). So `week5.html`'s Part 1 is Saylor chapter 6 passage
  by passage (56 slides in all) and `week6.html`'s is chapter 7 (65):
  the chapter introduction, every section's Learning Objectives, every
  theory paragraph, every formula box, every margin definition, every Key
  Takeaways list, the book's own tables (the rowers' sixteen samples, the
  0/1 population at n = 1, 5, 10, 20) and **every Example as a question
  slide followed by its solution slide** in the book's words — each in a
  cited `.book` block (`bk()`), formula boxes in `.fbox` (`fx()`),
  definitions in `.gl`, tables in `table.bk`; such a slide is `cls:'text'`.
  The deck CSS for these lives at the END of `stats.css`. The pizzeria
  slides (poll, sampling machine, √n, two dials, hook closes, the
  magazine, the clinic) sit between the book's passages and are ours;
  the `site:'sX'` anchors hang on each section's opening book slide, so
  `wireSlides()` still computes the chips. One deliberate edit: §7.2's
  sentence defining t<sub>c</sub> misprints "standard normal distribution";
  the slide reads "Student's t-distribution" with a dotted `.corr` mark and
  the speaker note says so. Every number on these slides was recomputed in
  Python (forty checks, the book's z-to-two-decimals method); the probe
  (strip network scripts, open the deck, count slides, screenshot, print to
  PDF — one page per slide) is the test to rerun. Follow the same pattern
  for later weeks' decks unless told otherwise.
- Week 3 also moved the slide ↔ section mapping to the qm1 way: each slide
  carries `site:'sX'` and `wireSlides()` computes the chips. Weeks 1–2 still
  use the literal `map={3:'s1',…}`.
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
  ⚠ **Releasing needs an ACCOUNT, not the gate** — the same lesson presence
  learned, and qm1 after it. `_release` is instructor-token-only, so the week
  page loads `/shared/fb-auth.js` and mints an ID token per write. Until Sept
  2026 it was a bare `fetch` with a swallowing `.catch()` **and the local flag
  flipped on the click rather than on the response**: the button said
  "✓ Revealed", the instructor's own solution opened, the PUT came back 401,
  and no student ever saw it — invisible from the front of the room, because
  the only device that looked correct was the one doing the revealing. The
  reveal buttons now report the *write*, and say what to do when it fails.
  Never restore a silent catch, and never flip the flag before the response.
  The course also carries `"releases"` in `features` now, so the dashboard's
  Solutions tab is the fallback on a device that has never signed in; it
  writes `_release/<mod>/_all`, which `isReleased()` honours alongside the
  per-exercise ids. ⚠ **One PUT per exercise, never a PATCH at the module
  node** — the rules grant `.write` at `_release/$mod/$ex` and nowhere above
  it, so that exact path is the write the rule was written for; a multi-key
  PATCH one level up depends on per-child evaluation, which is not a thing to
  discover in front of a class.
- ⚠ **ONE class, TWO subgroups — Monday (`g1`) and Wednesday (`g2`).** Declared
  in `courses.json → groups` *and* in `/shared/config.js` (the inline mirror,
  because `login.js` must not wait on a fetch) *and* in `presence.js`'s own
  `GROUPS` constant (it loads before `config.js` on the hub). Three copies; add
  a group and you change all three. **The first entry is the default and must
  stay first**: a student who registered before the split has no `grp` and is
  read as Monday, and the default group's presence sessions keep the *bare*
  module id (`w3`), so every mark already taken stays valid, in the Monday
  register, with no migration. The other group is suffixed — `w3-g2`.
  - A student picks their group **at registration only** (`login.js`, in the
    “First time” tab, nothing preselected — a default there would quietly put
    half the Wednesday room in the Monday register). It is written to
    `<ns>/<sid>/grp` **and** `_roster/<sid>.grp`, but the *node* is
    authoritative, because `_roster/$sid` is create-once in the rules and can
    never be corrected. Moving a student is a button in the dashboard's student
    drawer; `mergeDown()` re-reads `grp` on every load, so the move reaches
    their device by itself. Marks already taken do not move with them: a mark
    belongs to a session, not to a person.
  - `_presence_now` is now **per group** — `{g1:{…}, g2:{…}}` — because both
    rooms can have a window open on the same day. It is PATCHed, so opening one
    room does not wipe the other's pointer, and the same PATCH nulls the
    pre-split flat keys (which a student page still reads as the default
    group's pointer, so nothing broke mid-term).
  - **The dashboard renders one register per room**, over that room's students
    and that room's sessions. Not cosmetic: a single table would divide every
    rate by both rooms' sessions and hand the whole cohort about half the mark
    they earned. The Open/Close control asks for the **group first**, then the
    week — opening the wrong room is the mistake you cannot fix from the floor,
    so the control also says out loud when a window is still open elsewhere.
  - **No rules change was needed**, and none should be made: `_presence/$session`
    is a wildcard that already covers `w3-g2`, and `_presence_now`'s `.write`
    cascades to its group children.
- **Presence is 20% of the grade, pro rata, and `presence.js` records it.** The
  instructor opens a window for the session; every student's button goes grey →
  red; each student presses it once; the instructor closes it. Data lives at
  `statistics/_presence/<mod>` — `open`, `label`, `openedAt`/`closedAt` and a
  `marks/<sid>` map — `<mod>` is the session id, so `w3` is Monday and `w3-g2`
  Wednesday. **Marks live under `_presence`, not under `<sid>`**, so that
  a mark cannot exist without a session behind it and one read gives the whole
  register. `/shared/admin2.html` grows a column per session automatically —
  opt-in via `"presence"` in the course's `features`; any cell is clickable to
  correct the register by hand, because somebody always arrives late.
- ⚠ **A session counts as HELD when somebody was marked at it — not when a
  window was once opened.** Opening and closing is two clicks and gets done by
  accident; a two-second stray window on `w2-g2` (16 Sep 2026) made week 2
  “held” for the whole Wednesday group, so every student's term bar went red
  and their week page told them they had missed a session that never happened.
  `isHeld()` in `presence.js` and `anyMarks()` in `admin2.html` are the one
  rule: marks, and not currently open. A window open *right now* still counts —
  that is the one you are watching fill up — and a student is never “absent”
  from it. An opened-and-closed window with no marks is an **empty window**:
  the dashboard names it under the register rather than hiding it, because if
  it *was* a real session then presence is broken for that room, which is the
  most important thing on the page. Never go back to `openedAt || closedAt`.
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
  password is never stored by us. ⚠ **The session is ours, not the SDK's (20 Oct
  2026).** `fb-auth.js` signs in with one REST call and keeps the **refresh
  token** in `localStorage.jem_fb_session` — the instructor "cookie" — minting
  ID tokens from Firebase's token endpoint on demand; `window.__fbUser` is set
  synchronously at load, so a page's first read already carries the token. Until
  then the SDK held the session in IndexedDB and `restore()` imported it from the
  CDN with a 5 s timeout, and a slow link or a cleared store meant the password
  again on every refresh (Jan Erik: "allow an instructor cookie on a device").
  A device signed in the old way is migrated once (the SDK's `refreshToken`
  copied across, its copy signed out). The session ends only on Sign out or a
  change of the account password. The ID token is re-minted when stale,
  because a session is three hours and a token lasts one.
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
- ⚠ **A section marked before `progress.js` has loaded never reaches the
  database.** `markSection()` guards its write with `if(window.StatsTrack)`
  and returns early on `progress.done[id]`, so a section completed while the
  inline script is still parsing — before the *deferred* `/shared/progress.js`
  defines `StatsTrack` — is written to localStorage, skipped in the DB, and
  never retried. Week 1's 1.4 and 1.5 widgets call `markSection` from their own
  auto-run (`draw(24)`, `run()`), so **s4 and s5 were done on every student's
  device and missing from every student's record**: the week page said 9/9, the
  hub said 7/9, and a student reported it in Sept 2026. `syncDoneSections()`,
  called right after `StatsTrack.init()`, now pushes every locally-done section;
  `complete()` has its own store and its own early return, so it is idempotent
  and repairs an affected student the next time they open the page — no manual
  database edit. Only `statistics/week1.html` auto-marked anything (week 2 and
  both qm1 weeks mark nothing without interaction), but the trap is the load
  order, not the widget: **never assume `StatsTrack` exists at parse time.**
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
- **The course runs light or dark** — the ☾/☀ switch in the top bar, `/shared/theme.js`,
  default = the reader's system setting. See *Dark mode* in §3 before touching a
  colour anywhere in this course: the short version is that a light value is
  never edited, a dark value is a new token with the light one as its `var()`
  fallback, and anything drawn into an SVG has to be repainted in JavaScript.
- **The seven tools** (`practice`, `exam-cards`, `sampling-sim`, `distributions`,
  `sampling-machine`, `real-or-random`, `catch-the-mean`) keep their own inline
  CSS, written for the old navy/gold dark theme; the restyle **redefined their
  `:root` variables** to a light HEG palette (`--navy-deep` is now white, `--gold`
  is red) rather than rewriting each rule. If you edit one, use the variables,
  not literal navy/gold hexes.
- Workbook fields are listed in `courses.json → project.sections` so the
  dashboard's assignment reader shows the pizzeria file; there is no
  `compile.html` yet (the E1410 one is the template).

### SUMAS · MBA401 Quantitative Methods — `SUMAS/mba401/`

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

### SUMAS · MBA406 Managerial Finance — `SUMAS/mba406/`

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

### SUMAS · MA/MBA500 Capstone "AI for Good" — `SUMAS/wind/`

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

### SUMAS · OMBA500 Capstone "AI for Good" — Online Masters — `SUMAS/omba500/`

Built 8 Oct 2026 as an **independent copy of `SUMAS/wind`**, "as is", for the
second Moodle course of the same capstone: *2026 - Online - Capstone: AI for
Good - Online Masters* (id 1307). `SUMAS/wind` is the **Green Term** edition
(id 1456); the two Moodle courses carry identical text and differ only in
what is hidden. Everything the `SUMAS/wind` section says about the engine
applies. What differs:

- **Own id / ns / keyPrefix `omba500`**, code `OMBA500` (so the SUMAS
  landing page files it under *Online MBA*), term "Online Masters 2026".
  Registry entry in `courses.json` (same 27 modules, hrefs moved), mirror in
  `/shared/config.js`, a copy of the `wind` rules block in
  `firebase-database-rules.json` — ⚠ **must be deployed before the link goes
  to students** — and `Disallow: /SUMAS/omba500/` in `robots.txt`.
- **Its own forums, progress and messages** (`omba500/_forum/…`,
  `omba500_auth`); nothing is shared with `wind` except the sign-in, which
  the SUMAS school-wide sign-in carries across on the same device.
- **The showcase and its PDF were NOT copied**: the hub, Week 2 and Week 4
  link `/SUMAS/wind/SUMAS-Wind-2040-Showcase.html`. The old
  `wind_energy_2040_course.html` redirect stub was not copied either.
- **`schedule.js` is the wind one unchanged** (`START = 2026-10-05`), which
  matches Moodle 1307's "Week 1 – 5-12 October 2026". Change it there if this
  cohort runs on other dates.
- ⚠ **The two folders are independent.** A fix in `wind` reaches `omba500`
  only if ported by hand, and vice versa.
- ⚠ **omba500's forums NEVER CLOSE** (12 Oct 2026, Jan Erik: "leave the
  forums open all time", after a student travelling in Week 1 found Forum 1
  shut). `closed()`/`reClosed()` in `forum.html` return false; deadlines are
  still shown, the forum list and the week-page chips read "… · still open",
  and a late post still carries the "after the deadline" tag (and ⏰ in
  `followup.html`), so lateness stays visible for marking. `SUMAS/capstone-ba` got the same never-close
  rule on 14 Oct 2026, and **`SUMAS/wind` on 20 Oct 2026** (Horst had found
  Forum 1 shut there on 8 Oct while its week page said "still open"); its
  `capstone.js` is again a namespace-substituted copy of omba500's.
- **Week 1 carries the Moodle course's own materials (8 Oct 2026, both
  `omba500` and `wind`)**: the two reference PDFs from Jan Erik's archive
  (`1.2 Strategic-Forecasting.pdf`, `2.2 From Stakeholders to Systems.pdf`)
  are in `w1slides/` as downloads, and twelve of their pages, as JPEGs in
  the same folder, sit inside the five concept-highlight blocks
  (`.slidebox`, CSS at the end of `capstone.css`, no `data-step`, so the
  week total is unchanged at 10). ⚠ **Every link on Moodle's Week 1 is on
  the page**, next to the site's own, because Jan Erik asked that none be
  left out. The Moodle Meadows PDF (research.fit.edu) answered 404 on
  8 Oct 2026 and is kept anyway; donellameadows.org sits beside it.
- **Week 2 follows the same pattern (12 Oct 2026, both folders)**: reading
  2.1 is `w2slides/week2-gas-wind-industrial-energy.pdf` with its slides 2–9
  as `gw-N.jpg` slideboxes in s1/s2/s4; 2.2 is the Week 1 briefing, linked
  from `w1slides/`. Slides 3–5 and 9 sit in a section **without
  `data-step`** ("Gas, wind and the industrial energy fight"), so the week
  total stays 12. Three `.soup` notes flag the deck's own errors, each checked
  in Python: 400 TWh of industrial energy is ~2,700 TWh by Eurostat (gas 31%,
  ≈ 870 TWh); "~70%" LCOE fall is 54–60%; the €65 ETS price does not cover
  green steel's €180 premium; "10× EU capacity" is 24–30× offshore. The
  energy-units video is a YouTube search link — the Moodle export had no link targets.

### SUMAS · Capstone "AI for Good" — Bachelors — `SUMAS/capstone-ba/`

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
  `courses.json`. Teams form on `week1.html#team` (the picker refuses a
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
- **Still on Moodle, deliberately**: the Zoom link and Week 2's two reading
  PDFs — real artefacts that live there. Everything else on the site.
- ⚠ **The two folders are independent.** A fix in `wind` reaches
  `capstone-ba` only if ported by hand, and vice versa.

### GBS · the school page and its seven hubs — what changed on 17 Oct 2026

Jan Erik asked for the GBS landing page and the GBS courses to be taken
"up a notch". Four things were done, in this order, and each has a rule:

- **The three open hubs (`blockchain`, `foresight`, `fintech`) are on the GBS
  chrome.** They used to carry a pre-theme dark navy/gold palette of their
  own; now they load `/shared/themes/gbs.css` plus **`/GBS/open-hub.css`**
  (one stylesheet for the three, the only school-level CSS in the repo),
  the dark bar with the white logotype, their own FR/EN switch (`siteLang`),
  a "Start here" panel above the sections, and a back link to **`/GBS/`**,
  never to the root catalogue. The card markup and every link are the ones
  they always had — only the chrome changed. `.card.inst` (a host
  scoreboard, an instructor dashboard) is drawn only where `AdminGate` is
  unlocked; the games stay visible, labelled "played in class".
- **`/GBS/index.html` opens with the next session, computed.** Each live
  GBS course now carries **`schedule.dates`** in `courses.json` — one ISO
  date per session, in order, exams included — and the page picks the first
  one not yet over (a session is "next" on its own day until the slot's end
  time). ⚠ **`schedule.dates` MIRRORS the hub's `TERM` array**; change a date
  in one and change it in the other. It is a list, not "weekly from `first`",
  because creator skips the school's week 09 and all four skip the winter
  break. Cards print **`outcome`** (one "you leave with…" line, `{en}` or
  `{fr,en}`) instead of the syllabus-length `desc`, and an open course's
  **`start`** `{href,label}` is a second, real link on the card (the card is
  a `div` with a stretched main link, not an `<a>` inside an `<a>`). The
  week strip shows every weekday with a live course, not only days with two.
- **The four live hubs lost their first-visit modal.** The five points are
  an in-page `.works` strip under the hero (the 👁 button scrolls to it);
  `COURSE_LOGIN_AUTO` is no longer touched, so `login.js` prompts as it does
  everywhere else. A **`#nextCard`** is rendered from the hub's own `TERM`
  (never a literal date) with the slot, the session title, what to bring
  and a link once the page exists. **The progress bar (`.mama`) is shown only
  once something has been logged** — `paint()` in each hub's
  `courseprogress.js` checks `data[*].done>0` — because an empty bar on a
  first visit says "you have done nothing" to a student who has not been
  asked to yet.
- **Each live hub has an opening figure, inline SVG in the hero.** The stack
  (finmod), five sources → warehouse → decision (bi), the seven-stage
  pipeline from the published page to the cited answer (creator), Arvane
  inside the ring of shared infrastructure (escwa). Colours are classes
  bound to the theme's variables (`.fig .nv`, `.gd`, `.pale`…), the layers
  rise in with a CSS animation that `prefers-reduced-motion` disables, and
  on a phone the figure **scrolls sideways** (`min-width:720px`) rather than
  shrinking to 5px type. Nothing on a figure is a number the course does
  not already state; session references on it must match `TERM`.
- **Probe trick:** headless Chrome refuses a window under 500px, and the
  sign-in prompt fires at 1.5 s — so a hero screenshot is
  `--force-prefers-reduced-motion --virtual-time-budget=900` (every layer
  drawn, no prompt yet).

### GBS · Business Intelligence — `GBS/business-intelligence/`

MIM core course, `id`/`ns`/`keyPrefix` `bi`, Thursdays 16:30–18:30 from
22 Oct 2026, eleven sessions, Geneva campus (the PDF says Barcelona; Jan
Erik overrode it). Hub built 18 Sep 2026 on the creator-economy archetype;
**Sessions 1 and 2 built 18 Oct 2026** on the run-sheet pattern (`bi.css` =
`creator.css` + additions at the END; `wall.js` = creator's with the
namespace changed, global `BiWall`; `courseprogress.js` a port).

- ⚠ **Module ids are the school's WEEK numbers, starting at `w2`** — the
  first Thursday falls in calendar week 02 — so Session 1 is `week2.html`
  (`w2`) and Session 2 is `week3.html` (`w3`). The card prints both numbers.
  Never rename `w2` to `w1`: it orphans saved progress.
- **The running case is ÒRBITA**, a fictional Barcelona e-bike/scooter
  subscription operator with five irreconcilable sources (billing,
  telematics, support desk, marketing spend, the finance spreadsheet).
  **The numbers are generated and consistent across pages**: a random
  1,000 accounts on 1 Oct = 840 paying · 95 paused · 40 trial · 25 unpaid;
  41 cancellations (22 paying, 12 paused, 3 trial, 4 unpaid), 5 reversed
  within 30 days. Finance's churn 22/840 = **2.62 %**; billing's 41/1000 =
  **4.10 %**; harshest definition 161/1000 = 16.10 %; most lenient 17/840 =
  2.02 % (recomputed in Python, 18 Oct 2026). Finance counts 40,100 paying
  subscribers in September; billing has 47,700 on its books. Change one of
  these and the dead dashboard (S1), the source excerpts (S1), the
  definition machine (S2) and the example contract (S2) must all move.
- **Session 1, seven steps**: the dead dashboard (an inline-SVG mock with
  twelve tiles and two churn figures) and a sealed reading → `_wall/w2p`;
  the five source excerpts with **one clickable cell per table that proves
  the trap**; teams (Analyst · Skeptic · Scribe) and the **sealed decision**
  with a rule-based **non-decision detector** (role, verb, cadence, no
  "improve/insight/visibility") → `_wall/w2d` as `T:<A–E>|sentence`, posted
  by the Scribe only; the lifecycle + OLTP/OLAP + semantic layer input and a
  six-story "where did it fail?" classify; red team on another team's
  sentence (four questions, 0–2, `buildGrid`); the decision brief (artifact
  1) with a sealed churn guess → `_wall/w2k` as `K:<pct>`; the close seals
  `w2_nx` (billing 4.1 / finance 2.6 / both / neither).
- **Session 2, seven steps**: opens `w2k` and `w2_nx`; the **definition
  machine** (five switches A–E over the counts above, computed live, with
  finance's and billing's presets) → `_wall/w3d` as `D:<5 bits>`; the metric
  tree with a five-check lint; the KPI contract (eight fields), a
  leading/lagging/vanity classify and a **Goodhart toy** (bonus weight →
  closed/reopened/CSAT; labelled illustrative); red team on the definitions;
  the contract table (3 KPIs × 8 fields → `w3_contract`, artifact 2); the
  close seals `w3_nx` (hardest source to load).
- Progress on a session page = the seven `.step` buttons (`total:7`); the
  `.q`/`.cl-row`/`[data-work]` trap does not apply. Classify groups mark
  their step through `secId` when every row is right.
- ⚠ **The `bi` rules block gained a `_wall` node (copy of creator's) on
  18 Oct 2026 and must be DEPLOYED** before the first session, or every
  wall post returns 401 (the pages say so). No `presence`, no `project`
  block, no `workbook` feature — same as creator/escwa.
- The hub's `TERM` carries `href` for `w2` and `w3`; `courseprogress.js`
  has them `live:true`; `courses.json → modules` lists both.

### GBS · The Creator Economy & SEO 2.0 — `GBS/creator-economy/`

Bachelor specialisation, Thursdays 14:15–16:00 from 15 Oct 2026; the run-sheet
archetype (`creator.css`, `wall.js`, `courseprogress.js`), one `.step` per timed
block, progress = steps pressed. Two instructions from Jan Erik shape every page:

- **Tone (9 Oct 2026): factual and instructional, never the instructor talking
  to the room.** No "I", no asides, no chatty alerts; imperatives to the student
  are fine. Session 1 and the hub were rewritten to this; the other GBS hubs
  were not.
- ⚠ **Mechanisms, in detail (9 Oct 2026): "be more specific to the mechanisms
  and give more details to how the various procedures and algorithms for these
  technologies are used."** `week1.html` Step 4 is the model: the search
  engine's crawl → index → rank (robots.txt and the per-operator crawler
  tokens, render queue, inverted index with a worked excerpt, BM25 with its
  formula, PageRank with its formula, passage ranking, quality raters and
  E-E-A-T) and the answer engine's RAG pipeline (query fan-out, hybrid
  lexical + dense retrieval with cosine similarity and ANN, cross-encoder
  reranking, grounded generation in the context window, citation
  attribution), each stage with "eliminated here". Step 4 C is a **working
  BM25 toy** (`TOYDOCS`, k₁ = 1.2, b = 0.75, four editable passages, the
  lexical stage only, and it says so); its scores were checked against an
  independent Python BM25. Step 4 D separates what is **established**
  (Chen et al. 2025 on earned-media bias; Aggarwal et al. 2024, the GEO
  paper, up to ~40 % visibility) from **hypotheses tied to a stage**, which
  Session 2 tests. Every operator claim is from the operator's own docs
  (Google How Search Works, the AI Mode query fan-out post, OpenAI's bots
  page, Perplexity's bots page), linked at the foot of the page. Later
  sessions should be built to this depth.
- Session 1's cells are **dealt in arrival order** through `_wall/w1cells`
  (see the comment in the page); the name hash is only the offline fallback.
- `data-board` on the steps feeds `/shared/board.html` (the TV board).

### GBS · Enterprise Security, Cyber Warfare & Asset Protection — `GBS/enterprise-security/`

Built 9 Oct 2026 from the module specification "ESCWA" (5 graduate credits;
the PDF carries the **International Institute in Geneva** letterhead, Jan Erik
filed it under GBS).
⚠ **Branded IIG, not GBS (9 Oct 2026, Jan Erik: "change the icon and style to
iig.ch")**: theme `/shared/themes/iig.css` (IIG's own palette from iig.ch's
stylesheet — navy `#0a2540`, gold `#c9a961`, warm surface `#faf9f7` — plus
its type: Cormorant Garamond headings, Montserrat labels, Avenir body, each
with a system fallback because the repo ships no web fonts), the white
`iig-logo.avif` with an `iig-logo.png` fallback in a `<picture>`, on a navy
bar. Gold is a fill: readable gold text is `--accent-deep #86692c`, and gold
buttons carry **navy** text (white on IIG gold is 2.25:1). `courses.json`
has an `iig` theme and the `config.js` mirror an `iig` entry. The folder,
`school:"GBS"` (shared sign-in with the GBS courses) and the listing on
`/GBS/` stay as they are — Jan Erik confirmed 9 Oct 2026 that it remains on
the GBS landing page. Fridays **17:00–19:00** (corrected 16 Oct 2026; it was written as 17:15–19:15), first **16 Oct 2026**, **14
sessions**. On the creator-economy run-sheet pattern (`esc.css` = `creator.css`
+ additions at the END; `wall.js` = creator's with the namespace changed,
global `EscWall`; `courseprogress.js` a port).

- ⚠ **Session 7 is the MIDTERM (27 Nov), Session 14 the FINAL.** Neither has a
  page or a chapter; module ids are session numbers `w1`…`w6`, `w8`…`w13`, and
  `w7`/`w14` must never be reused. **Dates after the winter break are
  provisional** (15/22/29 Jan, final 5 Feb 2027); change `date` in the hub's
  `TERM`, the only place the plan is written.
- The syllabus's 17 slots are fitted into 14: topics 2+4 share Session 2,
  12+13 share Session 11, revision is folded into Session 13. Readings on the
  hub are proposals; Mazarr (Session 2) is "Summary and Chapter 1" — check the
  pages before students are told.
- **Assessment is the syllabus's: 10% weekly reflections · 45% midterm · 45%
  final.** The reflection (quote 1–5 lines + max 300 words, before class, 3
  picked at random, unsubmitted = 0) is collected **on the session page, not
  Google Classroom** as the PDF says: `work/refl<N>_quote|_ref|_text|_ai|_submitted`,
  `N` = the session it is DUE for (Session 1's page collects `refl2_*`). It is
  not a step, so it never enters the bar. The random pick is done from the
  dashboard by hand — there is no picker yet.
- Session pages count `.step` blocks pressed (SECTIONS), like creator — the
  `.q`/`.cl-row`/`[data-work]` trap does not apply, but `total` in
  `courseprogress.js` must equal `SECTIONS.length` (w1 = 7).
- Session 1's two walls: `_wall/w1p` (the sealed prediction, `T:<k>|K:<k>`)
  and `_wall/w1` (the threshold game, an 8-letter string over `CESGWA-`).
  No answer key on purpose. The Step 2 reveal stays hidden until the student
  has sealed Step 1 (or presses "arrived late").
- **Running case: Arvane Commodities SA**, fictional Geneva trader with a
  Constanța terminal, twelve chartered vessels and a Singapore office; the
  incidents around it (Viasat/Enercon, NotPetya, Balticconnector, ICRC,
  CrowdStrike…) are real and kept to the public record.
- ⚠ **The `escwa` rules block (a copy of `creator`'s) must be DEPLOYED** before
  the link goes to students, or registration and the walls fail (both say so).
- **`roles.html` — "Who answers" (20 Oct 2026), a reference page, not a
  session.** Written from the job profile of the practitioner who was first
  meant to teach this course (the top incident seat at a large technology
  company); the person is **never named and nothing is quoted** — each duty
  is rewritten as what the role does, with an "at Arvane" line under it.
  Five blocks: the **incident director** role card (eight duties: decides
  the approach · designs and runs dry-runs · leads the investigation and
  keeps the CISO informed · expertise to projects · oversees the security
  services incl. **automated validation** at the scale of tens of thousands
  of launches · product-issue mitigation · sets the team up to the third
  line · FIRST); the **three lines of defence** with Arvane examples and a
  six-case "which line failed?" self-check (local only, answers 1,0,2,1,2,0,
  mixed on purpose); **FIRST** (CVSS, TLP, first.org); where Sessions 5, 9,
  10 and 12 use it; and the **Session 9 scorecard** (three 0–2 questions =
  duties 1–3), published in advance. No `.step`, no ticks, nothing counted.
  The hub's plan entries for S5/S9/S10/S12 and its References block link
  it, and **Session 2's tripwire step gained a fourth part, `w2_owner`
  "who decides"** (the seat, not a person) — on the board too; the hand-in
  still requires only the first three.
- **Session 2 (`week2.html`, 23 Oct 2026) — seven steps, `total:7`.** Opens
  Session 1's sealed `w1_nx` pick from localStorage and boards `w1_next`; a
  six-case classify against Mazarr's four marks (answers 1,0,3,2,0,0, mixed
  on purpose, first attempt wins, a reason per pick); the **salami game**
  (eight fictional slices against the Constanța terminal arriving one at a
  time, absorb/act, the first "act" is the line → `_wall/w2` as `L:<n>`, 9 =
  never acted); the **GNSS mechanism in detail** with a live link-budget
  widget (FSPL = 20 log d + 20 log f − 147.55 at 1575.42 MHz; a 1 W jammer
  at 10 km arrives at −86 dBm, ≈ 23,000× the −130 dBm signal — recomputed in
  Python), jamming vs spoofing, C4ADS 2019 (9,883 instances / 1,311
  vessels), Finnair–Tartu April 2024, five defender checks; the **asymmetry
  table** (six instruments × attacker/Arvane cost, five orders of magnitude →
  `_wall/w2a` as `A:dddddd|D:dddddd`, medians per instrument); **Arvane's
  tripwires** (`w2_absorb`, `w2_act`, `w2_tell` — the first page of the
  crisis protocol Session 9 plays); the close seals `w2_nx` on Rid and
  collects **Reflection 2 as `refl3_*`** (Rid 2012, DOI verified on
  Crossref). Team and the ROTATED role are prefilled from `work_w1_team`
  (Analyst → Adversary → Scribe → Analyst). Written in the factual register
  (no instructor first person); Session 1 and the hub still carry the older
  voice. The `_wall/$mod` wildcard covers both new nodes — no rules change.

### SWISS UMEF · GEN 110 Intelligence artificielle — `UMEF/gen110/`

A Bachelor core course for every programme at Swiss UMEF, **in French and in
English**, no maths, no code. Ten half-days of 3 h 15 (Tuesdays 13h30–16h45) on
6 Oct, 20 Oct, **Wed 21 Oct 09h15–12h00** (séance 3; no session on 27 Oct), 3 Nov, 10 Nov, 24 Nov, 8 Dec, 15 Dec 2026, 5 Jan, 12 Jan
2027; **final written exam Wed 3 Feb 2027, 09h45**. Built 4 Oct 2026 on the
MBA406 engine, then **REBUILT on 6 Oct 2026 — the first teaching day — around
what the class said it wanted**, in their words: prompt engineering (text,
sound, video) · practical use in business · Excel/Word with AI (finance) · AI
tools for marketing, finance, HR · programming sites and apps without being a
programmer · data protection · employability, AI skills, training · the stakes
and the future. Jan Erik's instruction that day: *"a lot of doing in class
instead of slides — remove the slides and replace by 'let's do together'
things; the project is 1 or 2 and of their choice instead of through the site;
give nevertheless suggestions of things to hand in every two weeks — week 1:
define their project and who participates."* Everything below follows from it.

- ⚠ **NO SLIDES. There is no deck, no `▶ Diapos` button, no `#lect`, no
  `deck1.js`.** Every section of a séance page is something the room does
  **at the same time**, each on their own laptop, the instructor in front —
  the section badge says *Ensemble / Together*. The deck CSS in `ia.css` is
  kept for a course that wants it; nothing here uses it. Do not put a lecture
  deck back into this course.
- ⚠ **Every page is GENERATED, from one bilingual template.**
  `_build/<name>.tpl.html` carries every piece of copy as
  `⟦texte français⫽English text⟧` (unicode brackets that never occur in HTML
  or JS); `python3 _build/build.py` writes `<name>.html` (French) and
  `<name>-en.html` (English), swapping only `<html lang>` — the sibling links
  (`seance1.html ↔ seance1-en.html`, `index.html ↔ index-en.html`) are
  written as markers like any other copy. Markers may not nest; the generator
  refuses a stray bracket. **Edit the template, never the generated pages** —
  the next build overwrites them. One source, two editions, no drift: that is
  why the engine, the ids, the step keys and the `data-work` ids are identical
  in both languages and a student may switch mid-course.
- **The language switch** is `lang.js`, loaded first on every page: it reads
  `<html lang>` into `GEN110_LANG`, exposes `T(fr,en)` for the runtime files
  (`courseprogress.js`, `presence.js`, `exercises.js` wrap every visible string
  in it) and sets `window.COURSE_LANG`, which `/shared/config.js` honours over
  `courses.json`'s `lang` — so `login.js`, `progress.js` and `chat.js` speak
  English on the EN pages. A `[data-lang-switch]` link records the choice in
  `gen110_lang`; **only the hub redirects** to the remembered language, so a
  pasted deep link always opens as pasted.
- **Module ids are `w1`…`w10` although the pages are `seance1.html`…** The
  dashboard's presence picker builds `'w'+i` from `presenceSessions`, so an
  `s1` id would never appear in it. Labels say "Séance N"; ids say `wN`.
- **The ten séances** (hub `SEANCES`, `courseprogress.js` `CHAPTERS` — keep
  the two in step): 1 *L'IA, on commence par s'en servir* · 2 *Bien demander I —
  texte* · 3 *Bien demander II — son, image, vidéo* · 4 *Excel et Word avec
  l'IA* · 5 *L'IA au travail — marketing, finance, RH* · 6 *Programmer sans
  être programmeur* · 7 *Protection des données* · 8 *Agents et assistants* ·
  9 *Employable — compétences IA, et l'avenir* · 10 *Présentations et examen*.
  Each hub card lists what is **done together** that day (`do[]`) and, every
  other séance, the suggested hand-in (`hand`). The class's eight requests are
  the `WISHES` array — on the hub (a grid) **and** in séance 1 §1.7 (clickable,
  counted); change both.
- ⚠ **The project IS on the site — `projet.html` / `projet-en.html`** (19 Oct
  2026, Jan Erik: "le projet doit se faire sur mon site"; until then it was
  "handed in on the Swiss UMEF platform"). One or two students, topic of
  their own choice ("something AI should do for you"); syllabus
  deliverables kept: dossier ≤ 8 pages due Fri 15 Jan 2027 23h59, prototype
  shown in class, 8-min presentation on 12 Jan. Generated from
  `_build/projet.tpl.html` like every page. **Remise 1 is FIVE `data-work`
  FIELDS** on that page (`p_qui`, `p_probleme`, `p_change`, `p_donnees`,
  `p_outils` — who, the problem without the word "AI", what it changes,
  what you have, which tools; ≥ 10 characters each), saved by
  `/shared/progress.js` like a carnet field and listed first in
  `courses.json → project.sections`, so the dashboard's assignment reader
  shows them. **Remises 2–5 and the dossier are ONE PDF EACH**, handed in
  on the same page with the `capstone-ba` uploader ported: chunks to
  `gen110/_files/<sid>/<fid>/<n>`, a record in `gen110/_submissions/<sid>`
  with `k` = `r2|r3|r4|r5|dossier` (`courses.json → handins` fixes the
  dashboard's column order), and one summary line in `<sid>/work/handin_<id>`
  so the student drawer shows it and a new device knows it is already in.
  Deadlines are in the page's `HANDINS` (séance day 13h30 for r2–r5, the
  dossier 15 Jan 23:59, Geneva offsets written out); `?p=r3` preselects a
  hand-in. Module `projet`, `opt:true` in `courseprogress.js` (listed, never
  counted), total 10 = 5 fields + 5 files, own done-store
  `gen110_projet_done`. ⚠ **The `gen110` rules block gained `_files` and
  `_submissions` (copies of capstone-ba's) and must be DEPLOYED** before
  the first PDF, or every chunk PUT returns 401 — the page says so, never
  swallows it. The hub's 🎯 line, its project panel (now with an "Ouvrir la
  page Projet" button), séance 1 §1.8 and séance 2's checklist and 2.8 all
  say "sur ce site"; the one remaining "plateforme Swiss UMEF" on the hub
  is about where schedule changes are announced, and is correct.
- ⚠ **The project page has FOUR STEPS (20 Oct 2026)** — Jan Erik: the
  students (first-year BBA, from Senegal) could not see what kind of
  project to do. Step 1 **six ready-made projects** (`PROJECTS[]` in the
  template, + "your own idea"): a boutique's WhatsApp answerer (GPT/Gem),
  the tontine notebook (Sheets + Gemini), my internship letters (Gem with
  the CV), a braiding salon's booking page (Lovable/Bolt), the tailor's
  fabric sorter (Teachable Machine), the shop's voice of the week
  (ElevenLabs + Canva). Each card: problem · build · measure · need ·
  risk; "Je prends ce projet" stores `gen110_pj.proj`, mirrors it as
  `work/p_projet`, and swaps the remise-1 placeholders for that project's
  examples. Step 2 **the team**: a partner picker fed by `_chat/_people`
  (the names-only directory chat.js keeps — this page joins it too);
  `PAIR_MAX = 1`. Picking writes `<partner>/team/<me> = {n,p,pn,ts}`
  (allowed by the `$sid` rule) so the partner's page shows "X chose you"
  with accept / decline; accepting copies the project. Mirrored as
  `work/p_equipe`; field 1 (`p_qui`) is prefilled once if empty. Step 3
  remise 1, unchanged. Step 4 **the plan**: one block per séance 2–10
  (`WEEKS[]`: the séance's date and what it gives, the chosen project's
  two or three tasks for that week with ticks → `work/pl_ticks`, one
  `data-work` textarea `pl_w2`…`pl_w10` saved by progress.js, and the
  hand-in due before the next séance with its `?p=` link). The week in
  progress is framed by date; future blocks open on click. ⚠ In
  `courses.json → project.sections` the nine plan fields are **one
  section each** (`plan2`…`plan10`), because the dashboard's "keeping
  up" counts every field of a section as soon as anyone fills one — one
  nine-field section would punish the whole class in week 2. `nav.js`
  lists the four steps under the project and ticks them from
  `gen110_pj` / `gen110_work_pl_w*`; the module total stays 10 (the
  steps are never counted). Hub project panel and "Un bon projet" note
  name the six.
- **The course menu — `nav.js` + `nav.css` (19 Oct 2026), the mba401 drawer
  ported bilingual.** Every label goes through `T()`, every link through
  `pg()` (which turns `seance1.html` into `seance1-en.html` on an English
  page); the tree is séances 1–10 (1–3 with their sections, 4–10 "en
  préparation") plus the project page with its three anchors. Loaded by
  the hub, both séances and the project page — the `<script>` tag is in
  the TEMPLATES, so the build carries it. `NAV` mirrors `SEANCES`/`CHAPTERS`
  and each séance's `SECTIONS`; a new séance is added there too.
- **Séance 1's sections**: 1.1 the same six tasks to two assistants with a
  verdict each · 1.2 the **prompt builder** (`#pb`, five inputs → assembled
  prompt → copy → verdict; fields in `gen110_w1_pb`) · 1.3 the error hunt
  (`w1_faux`) + the *trust / check / don't ask* classify · 1.4 the three
  circles + *rules or examples* · 1.5 the synchronised quiz (8 questions,
  positions `1 0 3 1 2 3 3 0`) · 1.6 Teachable Machine + three sabotages ·
  1.7 the wishes · 1.8 the project checklist. **Sections complete through
  `secCheck()`** (classify groups are built with `secId=null`): s2 = prompt
  verdict; s3 = classify + `w1_faux`; s4 = circles + classify; s6 = walk +
  3 tests + 2 fields; s7 = all 8 wishes; s8 = 3 ticks. The denominator is
  `EXTRA_STEPS (16) + EXERCISES (0) + .cl-row (12) + .q (8) + [data-work] (4)
  = 40` — same trap as everywhere: any element added to the live page with
  class `q` or `cl-row` or a `data-work` attribute lowers every student's bar.
- **The séance quiz is the syllabus's "quiz synchronisé" and it COUNTS** in
  the 10 % participation mark. Gated by `_release/w1/quiz`: `StatsEx.watch(MOD)`
  polls it, `paintQuizLock()` locks `#quizBox` until it appears, the instructor
  launches it from §1.5 on a gate-unlocked device. Same account rule as every
  release: the gate shows the button, the signed-in account lets the PUT
  through. `watch()` must run **before** the first `paintQuizLock()`.
- **Grading is the syllabus's: 10 % participation · 40 % project · 50 % final
  exam.** Attendance rule (§8): under 80 % presence the 10 % is lost, under
  50 % no exam, two latenesses = one absence; `presence.js`'s copy says exactly
  that in both languages.
- **No textbook is quoted** (Mitchell is "to go further", not required); the
  tools are the free tiers of ChatGPT / Claude / Gemini / Le Chat / Copilot,
  ElevenLabs, Canva, Ideogram, CapCut, Excel/Word or Sheets/Docs, Lovable /
  Bolt, Make / Zapier, Teachable Machine. Verify a tool still has a free tier
  before a séance names it.
- **Theme `/shared/themes/umef-full.css`**, `ia.css` = MBA406's `fin.css`
  minus the finance block plus this course's widgets (`.demo`, `.venn`,
  `.sab`, `.qlock`, `.dates`, `.voix`, and since the rebuild `.pb`, `.wish`,
  `.chk`). Runtime files are renamed ports of MBA406's with `T()` copy.
  Séances 1–3 exist; 4–10 are `live:false` and locked `div`s on the hub.
- **Séance 2 — *Bien demander I, le texte* (`seance2.tpl.html`, 18 Oct
  2026, for Tuesday 20 Oct)** follows séance 1's engine section for
  section. ⚠ **Restructured the morning of 20 Oct 2026** (Jan Erik: the
  students had not prepared the project — do it in the first hour): a
  new **section 2.0 *Votre projet — la première heure*** (`s0`, 60 min)
  opens the séance — the Project page in another tab, 13h30 choose among
  the six, 13h50 the team, 14h00 remise 1 — with three boxes that **tick
  themselves** from the project page's state (`gen110_pj.proj`,
  `gen110_pj.alone|team`, five `gen110_work_p_*` ≥ 10 chars; repainted on
  the `storage` event and every 2 s while shown; steps `prep0..2`,
  section `s0`) and the student's problem sentence echoed for 2.1.
  Block 1 is now 2.0 + 2.1; block 2 is 2.2–2.8, with 2.4 and 2.7
  "si le temps le permet, sinon à la maison" in the block head. Remise 1
  is therefore *filled in during séance 2*, no longer due before it —
  the hub's S1 `hand`, its dates list, the project panel, séance 1 §1.8
  and the project page's kicker/`r1Status` (R1_DUE = 16h45) all say so.
  Denominator with 2.0: `EXTRA_STEPS (19) + .cl-row (12) + .q (8) +
  [data-work] (9) = 48`; `total:9` (SECTIONS.length, courseprogress w2,
  nav.js). Then: 2.1 the five-part builder on the student's OWN project (remise
  1) with a **rule-based vagueness detector** (`lintPrompt()`: five parts
  filled · context ≥ 12 words · a digit in the format · an explicit
  example/prohibition · no vague word from `VAGUE`, one list per language)
  that syncs the assembled prompt into `w2_prompt` · 2.2 the **scoring
  grid** (`buildGrid`, five `CRIT` × three assistants, cells cycle 0→1→2,
  totals and 🏆; state in `gen110_w2_cmp`) · 2.3 the four iteration moves
  walked (`buildSteps`, each with a copyable sentence in `.calc`) + the
  "quelle relance ?" classify · 2.4 **ten minutes of mechanism**: a token
  splitter (an imitation, labelled), the next-token bars with a REAL
  temperature softmax over five fixed logits and a ten-draw sampler, the
  context-window gauge (16 turns fit, the brief falls out first), and a
  phenomenon→mechanism classify · 2.5 the synchronised quiz, gated by
  `_release/w2/quiz` exactly like séance 1 · 2.6 the **prompt library**
  (`w2_p1…w2_p5` + "tested" ticks `lib0…lib4`; five written and two
  tested complete it — the seed of remise 2) · 2.7 the duel (the grid
  again, one column, `gen110_w2_duel`) · 2.8 remise 2 + what to bring to
  séance 3. (Denominator before 2.0: `EXTRA_STEPS (16) + .cl-row (12) + .q (8) + [data-work] (9) = 45`, `total:8`.) CSS at the END of `ia.css`
  (`.lint`, `.cmpg`, `.tokens`, `.nxt`, `.ctxg`, `.lib`). Carnet fields
  for the dashboard are the nine `w2_*` in `courses.json → project`.
  Probed headlessly in both editions (quiz refuses clicks while locked;
  T = 0.2 gives the favourite 99.9 %). **Both grids reach the database**
  (20 Oct 2026): `buildGrid()` syncs `mod/w2/grid/cmp` and `grid/duel`
  through `StatsEx.grid()` on every cell click (debounced 900 ms) and once
  at load if cells exist, so the dashboard's **Comparisons** tab can say
  who won across the class and why — see §3. No denominator change.
- **Séance 3 — *Bien demander II, son, image, vidéo* (`seance3.tpl.html`,
  20 Oct 2026, for **Wednesday 21 Oct, 09h15–12h00** — 2 h 45, the
  timetable is 09h15 → 12h00 with the break at 10h40; no session on 27 Oct,
  **remise 2 moved to séance 4, Tue 3 Nov 13h30** — hub card 4 carries it, the
  project page's `HANDINS.r2` and `WEEKS[3].hand` too, and séances 1–3 all
  print 3 Nov).** ⚠ **Built on two instructions from Jan
  Erik after séance 2 — "the students did not clearly understand what to do
  or how", and "more interactivity, not just fields to fill in" — and the
  pattern for séances 4–10.** (1) **Every section opens on a `.card.todo`**
  ("À faire maintenant · 13h40–14h15 · 35 min": numbered steps naming the
  exact tool, menu, button, what to paste and what one then sees) **and
  closes on a `.donewhen[data-sec]` checklist painted from `REQ`** — one
  table of `step:` / `cls:` / `wb:` requirements per section that
  `secCheck()` also reads, so the checklist and the completion rule cannot
  drift. The home carries a `.howto` strip (the prof does the step on the
  big screen, the red box says what to click, the done-when box ticks
  itself; lost → raise a hand or 💬), a legend of the three block kinds
  (`.label.do` · `.label.try` · `.label.case`) and a `.plan` timetable
  computed from `SECTIONS[].at/min` — the times on the todo labels are typed
  by hand and must match it. (2) **The widgets act**: 3.0 a browser
  recorder (`MediaRecorder`, play back + download, never uploaded) and the
  Wax & Co sample text (written for the eye on purpose, so the linter has
  something to flag); 3.1 the browser's own voice (`speechSynthesis`,
  rate/pitch) as the point of comparison, an **ear linter** (`lintEar`:
  60–160 words · no digits · sentences ≤ 20 words · no 4-letter caps or
  URL · addresses someone) and the grid with `CRIT_VOX` (Navigateur vs
  ElevenLabs); 3.2 a **live spectrogram** (Web Audio `AnalyserNode`, step
  after 3 s) and a **word-error-rate counter** (four kinds of wrong word,
  writes `w3_transcript`); 3.3 an **image-prompt builder** (`lintImg`, six
  parts) with an aspect-ratio preview, an **SVG defect hunt** (five
  hotspots: garbled sign, six fingers, shadow toward the sun, O for zero,
  bag logo ≠ sign; misses counted), a **denoising canvas** (pixel mix from
  noise to the picture over 50 eased steps) and the grid with `CRIT_IMG`
  (Gemini · Ideogram · Canva); 3.4 a **20-second storyboard** (shots ×
  source / text ≤ 6 words / voice line / duration, the timeline must sum
  to 20, writes `w3_story`); 3.5 the four provenance questions walked, a
  Lens button, an 8-clue classify. `buildGrid()` here takes the criteria
  as a parameter (séance 2's reads a global); both grids reach the
  Comparisons tab. Tools named, free tiers checked 20 Oct 2026: ElevenLabs
  (~10k credits/month, non-commercial), Gemini (audio upload ≤ 10 min;
  image generation), Ideogram (≈ 10 slow credits/week, **images public**),
  Canva Magic Media, CapCut (1080p + auto-captions free). Denominator
  `EXTRA_STEPS (19) + .cl-row (26) + .q (8) + [data-work] (8) = 61`;
  `total:8`. Quiz on `_release/w3/quiz`, positions `1 3 0 2 3 1 0 2`. Eight
  `w3_*` carnet fields in `courses.json → project`. `presence.js`'s
  `SESSIONS` names were refreshed to the rebuilt titles the same day (they
  still said "Classer, se tromper, être biaisé" from the 4 Oct build).
  Probed headlessly in both editions: every widget to its step, 8/8
  sections, the quiz refusing clicks while locked.
- **Adding a séance** = write `_build/seanceN.tpl.html` (copy séance 1's,
  keep the engine, change the sections), add it to `PAGES` in `build.py`,
  run the build, flip the chapter `live:true` in `courseprogress.js`, add the
  module and its carnet fields to `courses.json`, and set `live:true` on the
  hub's `SEANCES` entry (in the template). Run the headless probe on both
  editions before pushing. Séances 1–3 exist; 4–10 are `live:false`.
- **Own namespace `gen110`, prefix `gen110_`**; the rules block in
  `firebase-database-rules.json` must be deployed before the link goes to
  students. Unlisted; in `robots.txt`; the mirror entry in `/shared/config.js`
  has `lang:"fr"`, which the EN pages override through `COURSE_LANG`.

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
  costs fifteen small requests instead of one. The statistics copy had the bare
  `ReferenceError` until the Monday/Wednesday split went in; it now has the same
  fallback, scanning **its own group's** session ids.
- **Weeks 1–5 are complete; fall weeks 6–16 are scaffolds** generated by
  `_build/scaffold.py` from a `SPEC` — real pages with the syllabus's own
  objectives, planned sections, the week's reading and a slide outline,
  banner-marked "in preparation", `live:false` in `courseprogress.js` so they
  count nothing, locked on the hub. Re-run the script after editing the plan;
  **delete a week's SPEC entry once its page is hand-written** or the
  generator overwrites it. Spring weeks have no pages at all yet, and their
  hub cards deliberately carry no `href`.
- ⚠ **The deck mirrors the printed deck ONE FOR ONE — every slide of it, in
  order, and nothing added.** The instructor stands in front of the room with
  the printed deck in their head; a site deck twice its length is a different
  lecture. Week 2's PDF (`quantitativemethods_I_I_W2.pdf`) is 38 slides and
  `week2.html`'s deck is 38 plus the PDF's own five overlay builds, kept as a
  question slide followed by its answer slide. **Extra teaching goes in the
  speaker notes** of the printed slide it belongs to, marked `OFF-DECK`, and
  in the week page's own sections and Part 2 exercises — never in a new slide.
  The PDF's dividers are the deck's dividers, so a course with six page
  sections and three printed dividers hangs its `site:'sX'` anchors on the
  printed slide each section opens on.
  This rule was learned by breaking it: the first build treated the PDF as
  "the floor, not the ceiling" and week 2 came out at 72 slides against 38.
  Week 3 (30 Sep 2026) follows the rule from the start: the printed
  `quantitativemethods_I_I_W3-2.pdf` is 41 slides and `week3.html`'s deck is
  those 41 plus twelve of the PDF's own question-then-answer builds (the
  worked examples where the room is asked first), then Part 2. Its printed
  quiz has **six** questions (5 and 6 with six options, A–F) — verbatim as
  Q1–6, site's six after — and its homework is the printed sheet's twenty
  problems, 3.1–3.20, review problems included.
  Week 4 (7 Oct 2026): the printed `quantitativemethods_I_W4_annotated.pdf`
  is 29 slides and `week4.html`'s deck is those 29 plus fifteen of the PDF's
  own question-then-answer builds, then Part 2 (55 in all). ⚠ **The
  instructor's own annotations on the printed deck** — the yellow boxes
  (why (ln x)′ = 1 ⁄ x, the board summary, what a log is, the three laws,
  the plan before each solution, why each line) — are kept on the slides
  they annotate as `.ann` panels and echoed in the notes; they are part of
  the deck as taught, not site additions. Its printed quiz has **seven**
  questions (Q7 has five numeric options and no "None"), verbatim as Q1–7,
  the site's five after; its homework is the printed sheet's sixteen
  problems, 4.1–4.16, with the fourteen parts of 4.3 as fourteen fields.
  **Where the sheet says "differentiate", the field asks for the derivative
  EVALUATED at a stated point** — a form cannot mark a function; 4.8 (a
  proof) is a four-option choice. The running numbers are Week 2's roastery
  (C = 10 000 + 200q + 5q², C′(60) = 800 against the subtraction's 805,
  MR = MC at 60) and Week 3's café (R′ = 9 − 0.02q, zero at the vertex 450,
  MR = MC at 400 = the profit peak); Week 1's "61st tonne" table has no
  formula, so Week 4 refers to it and derives from the roastery.
  Week 5 (12 Oct 2026): the printed `quantitativemethods_I_I_W5.pdf` is 31
  slides (not annotated) and `week5.html`'s deck is those 31 plus seventeen
  of the PDF's own question-then-answer builds, then Part 2 (59 in all).
  Slide 13's two builds (chain rule, then the power rule) carry no question
  and are ONE slide; **slide 16 (the product of powers) has no printed
  solution**, so it stays a single question slide with the working in its
  notes and on the page. ⚠ **Slide 14 misprints its answer** as
  21x²(x² − 1)⁶ for (x³ − 1)⁶: the answer slide corrects it under a dotted
  `.corr` mark and says so; the printed quiz's Q5 writes f′(x) for f′(t) in
  two options and is kept verbatim. Printed quiz: **six** questions, the
  site's six after; homework: the twenty-two problems 5.1–5.22, letter
  constants fixed to stated values in the fields (5.1 h a = 3, 5.12 b
  a = 2, b = 1). New running numbers: the deck's ads chain (N = 100√x,
  R(n) = 70n + n² ⁄ 20, 850 per ad at 100 ads), average cost A′ = (MC − A) ⁄ q
  with its minimum at 44.72 (CHF 647.21), the café's R′ = p + q·p′ = 7 − 2,
  and the cold-brew launch D(t) = 500t·exp(−t ⁄ 4) (peak week 4,
  steepest fall week 8) for higher-order derivatives.
  It was cut back on 21 Sep 2026. **`week1.html` still predates this** — 76
  slides against a 42-slide PDF — so trim it the same way before it is taught,
  or knowingly leave it.
- **EXAMPLE FIRST, THEORY SECOND — on the slide, not just in the session.**
  A first-year business cohort reads a slide top-left first, so that is where
  the concrete goes: on a two-column slide the LEFT column is the worked case
  with real numbers and the RIGHT is the same thing named and generalised,
  under a red `.colh` heading. Rewritten this way in week 2: §2.2's four
  operations (one day at XY Coffee, q = 60 → the four definitions), §2.3's
  intercepts (read the three crossings off the curve → the definitions),
  Properties (three things XY Coffee does → Id, associativity, ⚠ not
  commutative), the inverse of ax + b (a CHF 3/hour + CHF 12 call-out bill →
  the letters), and both rule lists in §2.6 (count the twos, log 1 000 → the
  eight and seven rules). ⚠ Most of the printed deck is ALREADY example-first
  — the cost lines before sums, the advertising chain before composition, the
  demand curve before inverses — so this is about the handful of slides that
  open with a definition, not a licence to restructure the deck. **It does not add
  slides** — with one deliberate exception, the VAT slide before week 2's
  inverse definition, because a definition that IS a test needs a case where
  the obvious answer is wrong (undoing +8.1% by taking 8.1% off lands on
  99.34, not 100) or it reads as ceremony. See also the standing instruction above: a formula a student
  would otherwise memorise gets derived, numbers first and then the identical
  moves with letters.
- **A figure on a slide is sized in `quant.css`, not inline on the `<svg>`.**
  `svgWrap()` emits `<svg class="fig">` and the rules live at the end of
  `quant.css`. The trap they fix: `.lect-body` carries a 60ch reading
  measure that caps the **whole** body including a `.cols` grid inside it,
  so `.cols{max-width:none}` was not enough and every chart rendered about
  a third of the slide wide, unreadable from row four and in the printed
  PDF — and squeezed every two-column TEXT slide into 30 characters a
  column. A slide with a `.cols` grid now drops the cap; one with a figure
  also widens to 1400px and gives the figure column 1.8fr. ⚠ Every figure in week 2 is full-width or in the
  SECOND column — a left-hand chart would come out narrower. `week1.html`
  still inlines its own sizing and is untouched.
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
  and **no student ever saw it**. Since Sept 2026 qm1 matches the statistics
  fix exactly: the week and homework pages load `/shared/fb-auth.js`,
  `pushRelease()` mints an ID token per write and issues **one PUT per exercise**
  at `_release/$mod/$ex` (the path the rule actually grants — never a PATCH at
  the module node), the local flag flips only on a 2xx, and a failure is
  reported rather than swallowed. Never restore a silent catch here.
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

⚠ **A refused write must not look like a registration.** `fetch` does not
reject on 401, so until Sept 2026 a namespace whose rules were never
published (mba401) let students "register": they were shown a code, their
device saved it, and nothing reached the database — so they never appeared
on the dashboard. `submit()` now checks every response and says so, and
`healRoster()` on boot writes a missing `_roster/<sid>` from the device's
saved identity (create-once, so it can only fill a gap). **A new course's
rules block must be published before its link goes to students.**

Turn it on for a course by setting `login:true` in [shared/config.js](shared/config.js)
and loading `login.js` **before** `progress.js`. When it is on, `login.js` owns the
identity pill and `progress.js` deliberately does not draw its own.

**Subgroups are an opt-in on this file.** A course whose `config.js` entry
carries `groups: [{id,label,…}]` is one cohort taught in two rooms: `login.js`
then makes a first-time student choose, and writes `grp` to their node and their
roster record. Every branch short-circuits on an empty list, so no other course
changes. The list is ordered and **the first entry is the default** — that is
what makes a cohort that registered before a split land in group 1 with no
migration. Read it with `CourseLogin.group()`. Only `HEG/statistics` uses it
today; see its section for what the split means for presence.

`sid` is the slugified name (`jan-erik-meidell`). Progress is **always** written to
`localStorage` first, named or not — so when a student finally identifies themselves,
everything already done on that device is backfilled to the DB. Do not break that.

**One school, one sign-in (8 Oct 2026).** A student who is signed in to one
course is signed in to every other course of the **same school folder**
(HEG, SUMAS, UMEF, GBS) with the same name and the same six-digit code, without
being asked again — Jan Erik: "if a student logged in to one course (same
folder, same name) then the login is automatic for other courses in that
folder". `config.js` now carries `school` on every course (the first segment
of `dir` in courses.json — keep the two in step) and exposes
`CourseConfig.siblings(id)`. On a page with no identity of its own,
`login.js`'s `adoptFromSibling()` looks at the siblings' saved
`<key>_auth` (newest `ts` first — `saveAuth` stamps one now) and carries the
sid, name and code across: if this course's roster has no such sid it
**registers them silently** with the same code (the same five writes as a
registration, every response checked); if it has the sid with the same code it
**signs them in silently** and merges; a toast says which course the identity
came from. Nothing is a cookie — `localStorage` is one origin for the whole
site, so reading another course's key is all it takes. Three deliberate
fall-backs to the ordinary prompt: a course with **subgroups** (the room is
the student's to choose, so the prompt opens with the name filled in); a
roster that already holds the sid with a **different code** (a namesake, or a
student who registered twice — the "I have a code" tab opens, name filled,
and says why); and a **refused** read or write (rules not deployed). Different
schools never share: an HEG identity does nothing on a SUMAS page. Probed
headlessly in eight scenarios with a stubbed database (new · same code ·
different code · subgroups · no sibling · rules refused · writes refused ·
other school).

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
before `/track.js`; nothing else.

**Since 8 Oct 2026 it is on every student page of every live course that has a
namespace** — Jan Erik: "messages are sent to me in any of all the courses".
That added 62 pages: all of OMBA401, OMBAFR455 and UMEF407 (which had never
carried it), and the tool and reference pages of HEG/statistics and
SUMAS/mba401 (`practice`, `exam-cards`, the simulators, `teaching-plan`,
`notation`/`glossary`), which got `data-course` on `<body>` and `config.js`
where they lacked them. Deliberately left out: `admin.html` and other redirect
stubs, the gated `followup.html` pages, `week1-slides.html`, and the public
showcase pages. Evergreen courses with `ns:null` store nothing and cannot
carry a chat. Messages arrive in `/shared/chat.html?course=<id>` (linked
from every dashboard).

**The email alert (8 Oct 2026).** There is no server, so the alert is a
**Google Apps Script web app** deployed under Jan Erik's own account — the
script and the five deployment steps are on `/shared/site.html`, and the
script is the only thing that knows the destination address. `chat.js`
reads **`_site/notify = {on, url, ts}`** (ROOT of the database, not under
a course; world-readable, instructor-write, its own rules block) once per
page, and after a student message has been **stored** it POSTs a copy —
course, thread, name, text, a link to the thread in `chat.html` — to that
URL with `mode:'no-cors'` and a text/plain body, which is what gets a
cross-origin POST into Apps Script without a preflight. Best-effort by
design: the message is already in the database; the email is an extra.
Only threads the instructor is in (`dm-`, `all`, `g-`) — never `p-` or
`sg-`. The script rate-limits itself to 40 mails an hour. The switch,
the URL field and a "send a test email" button are on `site.html`;
switching off is a database write, so it needs the signed-in account,
not just the gate. ⚠ **Two deployments are needed before any of this
works**: the `_site` rules block (`firebase-database-rules.json`) and the
Apps Script itself; until the rules are deployed `site.html` says so and
`chat.js` simply reads `null` and sends nothing. The launcher stays bottom-right and steps up to
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
  `SUMAS/omba401`, `Kalaidos/digital banking`, `UMEF/umef407`). `dir` is the
  path from the web root, so `encodeURI(COURSE.dir)` still builds the right link —
  it leaves `/` alone. A page inside a nested course reaches the root catalogue with
  `../../index.html`, not `../index.html`.
- ⚠ **Eight courses moved under their school folder in Sept 2026** — `omba401`,
  `ombafr455` and `wind` into `SUMAS/`, `umef407` into `UMEF/`, `macro` into the
  new `ESM/`, and `blockchain`, `fintech` and `foresight` into the new `GBS/` —
  and the old root folders were deleted outright, with no redirect stub. So
  **every LMS link, QR code and student bookmark pointing at the old root paths
  now 404s** until the links are updated in the LMS by hand. `ns` and `keyPrefix`
  were **not** touched, so no student's saved progress moved.
- ⚠ **`ideas-e1410` moved to `UMEF/ideas-e1410` in Sept 2026.** `ns` and
  `keyPrefix` were **not** touched, so no student's progress moved. What the
  move did touch, and what any future course move must touch too:
  every page in the folder carries an **absolute** `<base href="/UMEF/ideas-e1410/">`
  (36 of them) — miss those and every relative link, script and image on every
  page breaks silently; `courses.json`'s `dir`, `home`, all 18 module `href`s
  and `project.compile`; and the printed URLs in `teaching-plan.html`, which are
  the ones students actually type. The `school` field stayed `IDEAS` after the
  move until 15 Oct 2026, when it became `SWISS UMEF` (Jan Erik: E1410 belongs
  to UMEF) — it now shows on `/UMEF/index.html` as a UMEF course; sign-in was
  already shared with the UMEF courses through `config.js`. As with the eight courses above there
  is no redirect stub, so `janerikmeidell.com/ideas-e1410` and the `qr-e1410.png`
  QR code now 404; the LMS links and that QR must be regenerated by hand.
- ⚠ **`sustainable-finance` was deleted in Sept 2026**, folder and registry entry
  both — so the archived-course machinery below now has **no live example** in
  this repo, and the 2025 edition's old links 404 rather than landing on the
  banner pointing at OMBAFR455.
- **Theme via CSS variables.** A page's `<style>` should contain layout that is genuinely
  unique to it. Shared layout belongs in `/shared/lesson.css` or `/shared/homework.css`;
  colours belong in `/shared/themes/<theme>.css`. A new week page links a theme plus its
  archetype stylesheet and adds only what is its own — never paste a `:root` palette or
  the standard chrome into it again.
- **Every page gets `/track.js`.** It is best-effort and fails silently.
- **Self-contained pages.** No CDN scripts, no external fonts, no build step. If a page
  needs a library, inline it. The one exception is the Firebase SDK, which
  `/shared/fb-auth.js` `import()`s *only* once per device, to migrate a session a
  pre-20 Oct 2026 sign-in left in IndexedDB; sign-in and token refresh are REST.
- **French courses are French throughout** — UI strings, error messages, the identity
  modal. Check `lang` in courses.json.
- **Videos:** real runtimes only. Never invent a duration.
- ⚠ **Don't mirror readings; link them.** E1410 used to serve four PDFs from
  `ideas-e1410/readings/`. Three were open-access *Journal of Innovation &
  Knowledge* articles — legal to mirror, but a mirror goes stale, so they are now
  `https://doi.org/…` links to the version of record. The fourth was **Kai-Fu
  Lee's *AI Superpowers*, a commercial book**, publicly downloadable from the web
  root with no licence to redistribute: an `accessGate` is client-side JavaScript
  and cannot protect a static PDF URL. It is gone, replaced by a WorldCat link.
  Verify a DOI against Crossref before putting it on a student page.
- **`robots.txt` names what should not be indexed** — the three instructor views
  and the cohort courses. It is a politeness request, not access control; the
  rules and the gates are what actually restrict anything.

## 7. Secrets

`.gitignore` already excludes these; keep it that way.

- `**/_private/` — answer keys and question banks. This is the one that would actually
  hurt: the repo is the web root, so a committed bank is a downloadable bank.
- `*.source.html` — plaintext sources behind encrypted gates.
- `norvege-2026/` — **moved out of this repo in Sept 2026** to a sibling folder
  (`Documents/Sites/norvege-2026`). It was 225 MB of personal video, 86% of the
  repository, and nothing to do with teaching. The folder is now ignored
  wholesale so a stray copy cannot be committed back. ⚠ Its live pages at
  `janerikmeidell.com/norvege-2026/` go dark on the next push, and the 225 MB is
  still in git history — a clone stays large until the history is rewritten.
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

**The instructor's own identity on course pages (9 Oct 2026).** Jan Erik: "let me just
have my own login and cookie so that I will not have to login to admin and every course
every time". An unlocked gate now also writes `jem_instructor` (localStorage + a 1-year
`jem_instructor=1` cookie, path `/`); `admin-gate.js` keeps it in step on every page that
loads it, and `lock()` or a changed `PASS_HASH` clears it. On a course page `login.js` and
`progress.js` read it: **no student prompt, no sibling auto-registration**, and the pill is
a faint "Jan Erik Meidell". It unlocks nothing; it only stops a page asking who you are. A
student identity saved on the same device still wins, so testing as a student still works.
The school landing pages (`/GBS/`, `/SUMAS/`) show the dashboard links as faint text under
the footer, and link **neither** to the root catalogue — Jan Erik does not want the
multi-school picture advertised.

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

## 8. The Courses app and push notifications (17 Oct 2026)

The site has a native companion: **"Courses"** (iOS + Android, Expo), built in
`~/Documents/Sites/Teaching App` — its own repo, never inside this one; read its
`BRIEF.md` and `README.md`. It is a thin shell: a course list from
`courses.json`, the course itself in a WebView of the **live site**, an inbox,
and real push notifications. The site stays the product; nothing here is
rewritten for the app, and a weekly course edit never touches it.

**What the app adds to the database — push tokens, nothing else:**

```
_site/push/                       {on, url, ts}   the switch and the sender URL (site.html)
_site/push/instructor/<key>       {t, p, ts, v}   Jan Erik's phones — written with the presence@ ID token
<ns>/<sid>/push/<key>             {t, p, ts, v}   a student's phone, under their own node ($sid rule, no change)
<ns>/_push/<sid>/<key>            the same, mirrored so the sender can list a cohort
```

`key` is the inner id of the `ExponentPushToken[…]`. The dashboards never read
`push/`. ⚠ `_site/push` and every course's `_push` are **new rules blocks** in
`firebase-database-rules.json` (added by `Teaching App/scripts/patch-rules.mjs`,
idempotent) — until Jan Erik **publishes** the file, the mirror write returns
401, the app's Settings says "rules not published", and `site.html` says so too.

**The sender** is a Cloudflare Worker, `teaching-push`
(`Teaching App/sender/worker.js`, deployed with `npx wrangler deploy` from that
folder, one secret: `EXPO_ACCESS_TOKEN`). No Firebase credential: it reads the
database anonymously and verifies the instructor's Firebase ID token itself.
Three hooks on this site talk to it, all best-effort and all gated on
`_site/push.on`, which is the one switch (`/shared/site.html` → "Push · the app"):

| Where | After | Calls |
|---|---|---|
| `chat.js` (every student page) | a student message is **stored** | `POST /notify {ns, tid, id}` — open; the worker reads the message back by id, requires `by:'s'` and a fresh `ts`, dedupes, rate-limits, then pushes Jan Erik's phones |
| `chat.html` | a reply is stored | `POST /send {kind:'reply', ns, tid, text}` — Bearer ID token; `dm-` → that student **without the text**, `all` → everyone, `g-` → the members |
| `admin2.html` | an announcement is posted | `POST /send {kind:'announce', ns}` — reads `_announce`, pushes every device under `<ns>/_push` |

`/shared/pushapp.js` is the helper the three instructor pages share
(`cfg`, `post`, `describe`, and `cleanup`, which deletes the dead-token paths
the worker reports — the worker itself cannot delete anything). Student pages
do not load it; `chat.js` has its own inline hook. Never for `p-`/`sg-`
threads, in either direction. `privacy.html` at the web root is what both
stores link to.

### Passwords, join codes and the hand-off (18 Oct 2026)

- **A student chooses their own password** at registration — 2–10 characters,
  no spaces, anything — instead of being issued a random six-digit code. The
  roster still stores it as `pass`; a code issued before this date is just a
  short password and keeps working. `login.js`'s "I have a code" tab is now
  "I have a password" and accepts up to 10 characters of anything.
- **`joinCode` in courses.json** — four upper-case letters, unique across the
  file — is what a student types into the Insights app to find the course.
  Change it there and nowhere else; the app reads the registry live.
- **The hand-off.** `?jemauth=<URL-encoded JSON {sid,name,pass}>` on any
  course page signs that page in silently (verified against `_roster` the
  way a sibling identity is: same password → signed in and merged; unknown
  → registered; different → the prompt opens on the password tab) and is
  stripped from the address bar first. The app appends it when it opens a
  course it already knows the student of, and when it opens the browser
  (the ⧉ button). There is deliberately **no link from the web into the
  app** (Jan Erik, 18 Oct 2026): the same name and password work on both
  sides, and a student uses whichever they have open. `CourseLogin.handoffUrl(url)`
  and `CourseLogin.inApp()` stay public for pages that need them.
