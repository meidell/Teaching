# GBS · school-wide — notes for Claude

Split out of the root `CLAUDE.md` on 23 Oct 2026 (one file per course, loaded when working in this folder). The site-wide rules — shared runtime, data model, rules, secrets, conventions — stay in the root `CLAUDE.md`; read that first.

## GBS · the school page and its seven hubs — what changed on 17 Oct 2026

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

## GBS · attendance on every cohort hub (22 Oct 2026)

Jan Erik: "a presence button on every one of the GBS courses, on the landing
page". `creator`, `bi`, `finmod` and `escwa` each carry a `presence.js` — a
renamed port of `UMEF/mfb545/presence.js` (namespace, session list, English
copy) — mounted with `StatsPresence.hub()` in a `#presSlot` under
`#nextCard` on the hub, and **nowhere else**: the button turns red for
whichever window `<ns>/_presence_now` points at. Each course has
`"presence"` in `features` and `presenceSessions` (11, 11, 11, 14), which is
what makes the dashboard's Presence tab appear. The `_presence` rules were
already in all four deployed blocks. Copy: the GBS rule (at most two
absences) on creator/bi/finmod; escwa states no rule (its syllabus has
none) and its live button carries navy text on IIG gold. The dashboard's
picker offers w1…wN: **never open w1 on bi/finmod** (their ids start at
w2) **nor w9 on creator** (Specialization Module). The open hubs
(blockchain, foresight, fintech) have no namespace and no sign-in, so they
cannot carry a register.
