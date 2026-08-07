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
| `course.css` | the ~190 layout selectors every week page shares |
| `themes/*.css` | per-course colour variables only |

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

Cohort courses also carry: `glossary.html` or `notation.html` (a reference page that
**grows every week** — updating it is part of shipping a week), and a logo image.

## 5. Data model

One Firebase Realtime DB, one top-level key per course namespace:

```
<ns>/
  _announce/            { on, text, ts }        instructor → students
  <sid>/
    name, sid, pw       identity (pw = personal code, for cross-device login)
    createdAt, updatedAt
    mod/<moduleId>/
      title, total, secs, score, firstSeen, updatedAt
      done/<sectionId>: true
analytics/<YYYY-MM-DD>/<id>   pageviews from track.js (coarse geo only, never raw IP)
```

`sid` is the slugified name (`jan-erik-meidell`). Progress is **always** written to
`localStorage` first, named or not — so when a student finally identifies themselves,
everything already done on that device is backfilled to the DB. Do not break that.

## 6. Conventions that matter

- **Absolute paths for shared assets** (`/shared/…`, `/track.js`), relative for
  course-local ones. The `digital banking` folder has a space in it — always URL-encode
  it as `digital%20banking` in hrefs.
- **Theme via CSS variables.** A page's `<style>` should contain layout that is genuinely
  unique to it. Shared layout belongs in `/shared/course.css`; colours belong in
  `/shared/themes/<theme>.css`. Do not paste a 240-line `:root` block into a new page.
- **Every page gets `/track.js`.** It is best-effort and fails silently.
- **Self-contained pages.** No CDN scripts, no external fonts, no build step. If a page
  needs a library, inline it.
- **French courses are French throughout** — UI strings, error messages, the identity
  modal. Check `lang` in courses.json.
- **Videos:** real runtimes only. Never invent a duration.

## 7. Secrets

`.gitignore` already excludes these; keep it that way.

- `**/_private/` — answer keys and question banks. This is the one that would actually
  hurt: the repo is the web root, so a committed bank is a downloadable bank.
- `*.source.html`, `norvege-2026/build.js` — plaintext sources behind encrypted gates.
- `.env` anywhere.

**Client-side gates are soft gates.** The instructor PIN is stored as a SHA-256 hash in
`/shared/admin-gate.js`, and the course access token in `ideas-e1410/gate.js` is visible
in source. They keep material off the open web; they are not authentication. Anything
that must genuinely stay private (grades, banks) must not be in the repo at all.

## 8. Working on this repo

- **Never retrofit wholesale.** 232 pages of working HTML is an asset. Adopt the shared
  layer in new pages; backport an old page only when you are already editing it.
- **Test by opening the file**, or `python3 -m http.server` from the repo root when a
  page needs absolute `/shared/…` paths to resolve.
- Commit messages in this repo are terse by convention.
