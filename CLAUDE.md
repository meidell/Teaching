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
```

## 2. courses.json — the registry

Adding a course means adding an entry to [courses.json](courses.json). It drives the
root catalogue cards, the `/shared/admin.html` course picker, and the shared runtime's
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
| `admin.html` | the original dashboard for every course: `/shared/admin.html?course=omba401` |
| `admin2.html` | the **redesigned** dashboard — same data and namespace, reorganised as Today → The cohort → The roster. Runs alongside `admin.html` until one is chosen; the two link to each other |
| `insights.html` | the other instructor view: **where the cohort gets stuck** — section-level stall points, module drop-off, workbook fill rates. Same gate, same read path. Per-question quiz stats stay in the dashboards; don't duplicate them |
| `chat.html` | the instructor's end of `chat.js`: read what came in and answer it — one student, a group, or the whole cohort |

### The four instructor views, and what each is for

| | Question it answers |
|---|---|
| `admin2.html` | *What do I do before the next session?* Ranked actions, cohort shape, then one roster table with a per-student drawer |
| `admin.html` | *What is every student's state on every module and on the assignment?* One wide table carrying both; kept while the redesign is on trial |
| `insights.html` | *Where is the course failing them?* Section-level stall points and workbook fill rates, across any course |
| `chat.html` | *What are they asking me?* Threads with one student, a group or the cohort. All four link to each other in the header |

Five things worth knowing before editing any of them:

- **`admin.html` has one student table, not two.** The sessions and the final
  assignment used to be separate tables in separate panels, which meant scrolling
  between them to answer "is this student behind on both?". They are now two labelled
  column blocks (`th.grp.g1` / `th.grp.g2`) in a single table, with `#` and `Name`
  `position:sticky` — at eighteen module columns plus eight section columns the name
  has to survive the horizontal scroll. `colCount()` is the single source of the column
  total; the detail row's `colspan` reads it, so don't hand-count it again.
- **The checkpoint quiz is a two-level accordion**, panel ▸ session ▸ questions. Flat, it
  printed eighty rows. Closed, each session shows its score and its weakest question,
  which is the line you actually act on. Open/closed state lives in `QOPEN` / `QPANEL`
  outside the render, so a refresh does not slam it shut.
- **The assignment reader is per-student, not per-question.** It used to show one field
  across the whole cohort; you mark a person, not a field, so it now takes a student and
  prints their whole assignment with the gaps spelled out. `assignmentHTML(s, showGaps)`
  is shared with the row drawer — one renderer, two entry points.
- **Flags in `admin2.html` are relative, not absolute.** "Behind" means well under *this cohort's* median at *this point* in the course. The original used fixed thresholds (under 60%, under 50%), which mid-term flagged 13 of 18 students — a flag on two thirds of the cohort is not a flag. Don't reintroduce a constant here.
- **`courses.json` themes expose `accent` / `accentBright` / `glow` / `surface`** — not `deep` / `bar` / `main` / `pale`. `applyTheme()` in `admin.html` looked for the second set, so only two of eight keys ever matched and *every course rendered navy*. Both dashboards now map the keys the file actually has. If you add a theme variable, add it to `courses.json` **and** to the mapping.
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
  admin.html          thin redirect → /shared/admin.html?course=<id>
  _private/           NEVER COMMITTED — answer keys, question banks, run sheets
```

The dashboard's columns come from the course's `modules` array in courses.json — that
array *is* the dashboard. Adding a week means adding a module entry there, not editing
an admin page.

Cohort courses also carry: `glossary.html` or `notation.html` (a reference page that
**grows every week** — updating it is part of shipping a week), and a logo image.

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
--only database`). **As of Aug 2026 it has never been deployed** — the live rules are
still the original `{".read": true, ".write": true}` per namespace. Everything below
describes what this file *would* enforce, not what the database does today.

What the current version enforces, and why it changed:

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
  it as `digital%20banking` in hrefs.
- **Theme via CSS variables.** A page's `<style>` should contain layout that is genuinely
  unique to it. Shared layout belongs in `/shared/lesson.css` or `/shared/homework.css`;
  colours belong in `/shared/themes/<theme>.css`. A new week page links a theme plus its
  archetype stylesheet and adds only what is its own — never paste a `:root` palette or
  the standard chrome into it again.
- **Every page gets `/track.js`.** It is best-effort and fails silently.
- **Self-contained pages.** No CDN scripts, no external fonts, no build step. If a page
  needs a library, inline it. The one exception is the Firebase SDK, which
  `/shared/admin.html` `import()`s lazily *only* if a namespace refuses an anonymous
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

Pages behind it: `/shared/admin.html` (all course dashboards), `beyond-defi-dashboard`,
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
