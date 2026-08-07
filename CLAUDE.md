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
| `admin-gate.js` | the shared instructor gate (hashed PIN, remembered per device) |
| `admin.html` | one dashboard for every course: `/shared/admin.html?course=omba401` |
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

## 5. Data model

One Firebase Realtime DB, one top-level key per course namespace:

```
<ns>/
  _announce/            { on, text, ts }          instructor → students
  _roster/<sid>/        { name, pass, ts }        pass = the 6-digit course code
  _quizmeta/<moduleId>/ { title, ts, qs[] }       question text, for cohort stats
  <sid>/
    name, sid, createdAt, updatedAt
    mod/<moduleId>/
      title, total, secs, score, firstSeen, updatedAt
      done/<sectionId>: true
      quiz/q<i>:        { p: pickedIndex, c: 1|0, ts }
    work/<fieldId>/     { v, label, mod, ts }     workbook answers
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

### Rules — [firebase-database-rules.json](firebase-database-rules.json)

⚠️ **This file is a copy. Editing it changes nothing until you deploy it** — paste it
into Firebase Console → Realtime Database → Rules → Publish (or `firebase deploy
--only database`).

What the current version enforces, and why it changed:

| | Before | Now |
|---|---|---|
| Listing the cohort | anyone could `GET /omba401.json` and download every student | instructor sign-in only |
| Writing | anyone could `PUT` anything, including `null` over the whole course | a write must leave the node existing, so no one can wipe a student or a course |
| Announcements | anyone could post a banner to every student page | public read, instructor-only write |
| Roster codes | n/a | create-once — a code cannot be overwritten, so nobody can hijack another student's login |
| Analytics | anyone could overwrite past hits | create-only, instructor read |

**Residual risk, stated plainly:** `<ns>/<sid>` is still world-readable, because an
unauthenticated student device has to be able to fetch its own progress for cross-device
sync, and the database cannot tell one anonymous caller from another. `sid` is a
slugified name, so someone who guesses a classmate's name can read that classmate's node
(including workbook answers). They cannot enumerate the cohort, and they cannot write to
it. Closing this properly needs real student authentication — that is a separate project,
not a rules tweak.

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
