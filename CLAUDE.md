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
- **The Activity tab (21 Oct 2026) counts what students actually did on a
  page.** Jan Erik: "I need to see if students actually do this session,
  e.g. if they fill in the grid." A page writes each widget step once to
  `<sid>/mod/<m>/steps/<key> = {t:label, ts}` (gen110's séance 3 was the
  first: `STEP_T` labels, `pushStep()` on a new step, `syncSteps()` at
  boot for steps done before sign-in); `renderActivity()` offers the tab
  when any record exists and draws, per module, a tally per step (how
  many of the cohort) and a student × step matrix with the last time and
  the students who have nothing. No map in the dashboard — the label
  travels with the record, in English. Any course can write the shape.
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

### Per-course notes — one `CLAUDE.md` per course folder

Each course's history, decisions and traps now live next to its pages (split 23 Oct 2026, the root file had grown past 2,700 lines). Claude Code loads a folder's `CLAUDE.md` when working there; read it before editing that course.

- `HEG/statistics/CLAUDE.md` — HEG · Applied Statistics
- `SUMAS/mba401/CLAUDE.md` — SUMAS · MBA401
- `SUMAS/mba406/CLAUDE.md` — SUMAS · MBA406
- `SUMAS/wind/CLAUDE.md` — SUMAS · MA/MBA500 Capstone (wind)
- `SUMAS/omba500/CLAUDE.md` — SUMAS · OMBA500 Capstone
- `SUMAS/capstone-ba/CLAUDE.md` — SUMAS · Capstone Bachelors
- `GBS/CLAUDE.md` — GBS · school-wide
- `GBS/business-intelligence/CLAUDE.md` — GBS · Business Intelligence
- `GBS/financial-modelling/CLAUDE.md` — GBS · Finance Modelling
- `GBS/creator-economy/CLAUDE.md` — GBS · Creator Economy
- `GBS/enterprise-security/CLAUDE.md` — GBS · Enterprise Security
- `UMEF/gen110/CLAUDE.md` — UMEF · GEN 110
- `HEG/quantitative-methods/CLAUDE.md` — HEG · Quantitative Methods I
- `Kalaidos/flc/CLAUDE.md` — Kalaidos · Financial Leadership & Controlling
- `UMEF/ideas-e1410/CLAUDE.md` — UMEF · E1410
- Courses without a file (OMBA401, OMBAFR455, UMEF407, MFB 545, the open hubs) are documented in the memory notes and in comments at the top of their pages.

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
  ⚠ Since 22 Oct 2026 it also **makes the top-left school logo a link to
  the school's landing page** (`/GBS/`, `/SUMAS/`, `/UMEF/`, `/Kalaidos/` — the first
  path segment; HEG has no landing page and is left alone). It looks for
  `.topbar picture/img.brand/img.logo`, then `nav.nav` (the open hubs),
  `header`, and finally any `img[src*=logo]` in the top 220 px (the SUMAS
  hubs with the logo in the hero); a logo already inside a link is
  skipped. Lives in track.js because it is the one script every course
  page loads — no page was edited.
- **Kalaidos pages wear Kalaidos' own look (25 Oct 2026).** Jan Erik: "use
  that style for the classes for kalaidos", pointing at kalaidos-fh.ch.
  `/Kalaidos/kalaidos.css` holds it (Barlow + Lora, teal bands #3393A1 /
  #C1D8DB, square cards with a dark left strip, dark footer under a teal
  wedge), scoped by body class: `kal-land` (`/Kalaidos/index.html`, the school
  landing page, registry-driven like the other three), `kal-hub` (a course
  hub), `kal-bloc` (flc.css session pages). The fonts are SELF-HOSTED in
  `/Kalaidos/fonts/` (SIL OFL, licences beside them) — the no-external-fonts
  rule below still holds. `Kalaidos/digital banking` (evergreen, its own
  bespoke design) has NOT been restyled.
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

⚠ **ONE DOOR: `/admin/`, ONE PASSWORD (23 Oct 2026).** Jan Erik: "only one
central login (for me)", "let me login with a password only as admin".
- **Password only.** Every sign-in box (AdminGate, `FBAuth.form`) is a
  single password field; the account address is fixed in `fb-auth.js`
  (`EMAIL`) and never shown. The password IS the Firebase account's
  password, checked by Firebase. **The old gate password and its
  `PASS_HASH` are gone** — never put a hash of the account password in
  this repo: it is public, and the hash could be cracked offline into
  every cohort's data. `jem_admin_pw` is cleared on load. The password is
  changed on `/admin/` (Account → Change password, `FBAuth.changePassword`
  → `accounts:update`); that signs every OTHER device out. It is never
  written in any file.
- **`/admin/index.html` is the console**: this week's sessions (from
  `courses.json → schedule.dates`, else weekly from `first`/`day`), and per
  school, per course: students (`_roster` shallow), messages waiting (the
  inbox rule), presence window open (`_presence_now`), handed in
  (`_submissions` shallow), and **rules published** — an anonymous GET of
  `<ns>/_rules_probe` answers 200 when the namespace has a deployed block,
  401 when not. Every row links into admin2 / presence / chat / insights /
  board for that course. It reads, it does not replace those pages.
- **No instructor link on any student page.** The "instructor / enseignant"
  footer links and the root catalogue's "Admin" were removed; the course
  `admin.html` stubs stay (bookmarks). `track.js` instead draws **⚙ Admin**
  on any page of a device holding `jem_fb_session` — inside the 👁/🎓 bar
  where `login.js` draws one, alone at the bottom centre elsewhere. The
  school pages' instructor strip is one "⚙ Admin" link.
- The four classroom games that had a read-out PIN (the two macro
  Jeopardy pages, foresight- and negotiation-millionaire) open without it.

⚠ **One instructor login, two hats (23 Oct 2026).** Jan Erik: "a single
and thus a separate login as instructor for all courses … let me be admin
only … let that user have access to all courses as 'student'". The gate
now also accepts the **instructor ACCOUNT's password**
(`presence@janerikmeidell.com`, the account the database trusts and the
Insights app's instructor door uses): typed at any gate it signs the
account in through `fb-auth.js`, and a device holding that session
(`jem_fb_session`) counts as unlocked everywhere — one login for the
dashboards, chat, presence, releases, on every course, site and app. The
old gate password still works as before. On COURSE pages a small bar at
the bottom (drawn by `login.js`, instructor devices only, not in the app)
switches **👁 Instructor / 🎓 Student (hidden)** (`localStorage.jem_view`).
In student view `AdminGate.isUnlocked()` answers false outside `/shared/`,
so every page is exactly the students' page, and `login.js` signs the
device in, in every course, as the hidden student **`_jem`**
(name "Jan Erik Meidell", password `jem-instructor` — public like this
file; it guards a test record, nothing else). `_jem` is invisible by its
leading underscore: admin2, insights, chat.html and board.html skip "_"
keys (chat.html's roster loop too); `anyMarks()` in admin2 and the nine
`presence.js` copies ignores "_" marks, so the hidden student never makes
a session "held"; `chat.js` gives it no panel and lists no "_" classmate;
the three GBS `wall.js` (and so the BI team board) never post it. In
instructor view `login.js` and `progress.js` ignore a saved `_jem`
identity. In the app (code in `Teaching App`, needs a new build), a
signed-in instructor opens every course page as `_jem` via `?jemauth=`,
and the bridge does not register it for push or lock a school to it.
Not hidden yet: gen110's partner picker and capstone-ba's `_teams` — don't
join a team in student view there.
The same bar carries **↺ Reset** (23 Oct 2026, Jan Erik: "a reset button as
admin for whatever I clicked on a course"): it removes every
`localStorage` key under the course prefix except `<key>_auth`, `<key>_lang`
and the reflection draws (`*_refl_draw*`), DELETEs the hidden student's
`mod/`, `work/` and `team/` with the instructor token (else a reload would
merge them back), and reloads. Walls are untouched. Students are never
affected: the bar exists only on an instructor device.

One password, one implementation, remembered per device. `AdminGate.mount({…})` hides a
page until the account is signed in; the session (`jem_fb_session`) is what the next visit,
and every other instructor page, opens on. `AdminGate.lock()` (and Sign out on `/admin/`)
forgets it.

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

- **A student chooses their own password** at registration — any length,
  any characters, spaces included (23 Oct 2026: "no restriction about length
  or complexity"; it was 2–10 without spaces) — instead of being issued a
  random six-digit code. The roster still stores it as `pass`; a code issued
  before 18 Oct 2026 is just a short password and keeps working. `login.js`'s
  "I have a code" tab is now "I have a password". The Insights app has its
  own form in `Teaching App`; it carries no limit (checked 23 Oct 2026).
- **`joinCode` in courses.json** — four upper-case letters, unique across the
  file — is what a student types into the Insights app to find the course.
  Change it there and nowhere else; the app reads the registry live.
- **The hand-off.** `?jemauth=<URL-encoded JSON {sid,name,pass}>` on any
  course page signs that page in silently (verified against `_roster` the
  way a sibling identity is: same password → signed in and merged; unknown
  → registered; different → the prompt opens on the password tab) and is
  stripped from the address bar first. The app appends it when it opens a
  course it already knows the student of, and when it opens the browser
  (the ⧉ button). Until 23 Oct 2026 there was deliberately no link from
  the web into the app; Jan Erik then asked for the classroom QR to open
  the app. **The QR now carries `?app=1`** (MFB 545 first:
  `UMEF/mfb545/qr-mfb545.svg`, made with segno, scale 10, border 2,
  colour #0f4c60). `/.well-known/apple-app-site-association` claims for
  the app (team CJ53WJ54R4, `ch.lexigo.courses`) ONLY URLs with `app=1`
  and never `/shared/*`, so an iPhone with Insights installed opens the
  QR in the app and every other link stays in the browser. There is
  deliberately **no `assetlinks.json`**: build 7's Android filter claims
  every path on the domain, so publishing it would send the whole site
  into the app on Android; instead `track.js` shows Android browsers a
  bar with an `intent://…;scheme=jemcourses;package=ch.lexigo.courses`
  link (falls back to the page) and strips `app=1` from the address bar
  everywhere. The account is the same on both sides: the app shows the
  same page and the student signs in with the same name and password. `CourseLogin.handoffUrl(url)`
  and `CourseLogin.inApp()` stay public for pages that need them.
