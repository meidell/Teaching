# GBS · Business Intelligence — notes for Claude

Split out of the root `CLAUDE.md` on 23 Oct 2026 (one file per course, loaded when working in this folder). The site-wide rules — shared runtime, data model, rules, secrets, conventions — stay in the root `CLAUDE.md`; read that first.

## GBS · Business Intelligence — `GBS/business-intelligence/`

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
- ⚠ **Teams and TEAM ANSWERS — `teams.js` (22 Oct 2026).** Five teams A–E
  (the ids every page uses). Students join, move or leave on a team board
  (hub `#teams`, Session 1 Step 3, Session 2 Step 3); any member renames
  the team. A **team field** is shared: one member writes, every member's
  page fills in that field (so progress.js saves it to each member's own
  node) and ticks the step. Shared: S1 the decision + maker + cadence +
  "what they would decide differently" + sealed state (s3), the one number,
  the red-team target, grid and verdict (s5); S2 the tree (s3), the red
  team (s5), the contract cell by cell (s6). Individual on purpose: the
  predictions, the churn guess, the dashboard reading, the definition
  machine. **No rules change**: it all lives on the wall —
  `_wall/teams` (J:<team>), `_wall/tn_<T>` (names),
  `_wall/tt_<T>_<key>` (answers, ≤ 500 chars, newest row wins); one GET of
  `_wall` every 8 s. Tamperable by design, like every wall. A new session
  page with a team artifact calls `BiTeams.field(id,key)` /
  `BiTeams.state(key,apply)` and `BiTeams.share()` on its hand-in button.
- ⚠ **Session 2 (`week3.html`) turned into a SELF-RUN MANDATE, 29 Oct 2026**
  (the day of the session; Jan Erik: "a mandate the students can work on on
  their own (groups) and then give me a deliverable — like creator-economy
  week3"). The banner is the CFO's mandate and names the deliverable: a
  five-part **KPI memo** (team definition · tree · contract · red-team
  finding · recommendation). Every step has numbered instructions; no "on
  the screen" / "when told" / "the room decides"; clocks are durations.
  New team fields: `f_tdef` → `w3_tdef` (data-work `w3_team_def`), `f_rec`
  → `w3_rec`; state `w3_handin`. Step 5 gained **Load their tree** (reads
  `_wall/tt_<T>_w3_tp…ti`, newest row). Step 7 is now the hand-in: the memo
  is built live, the verdicts ON this team are found by reading every other
  team's `w3_def_txt` for "[Team <me> ·", and **Hand in** writes the plain
  memo to `w3_memo` (every member's node) and marks s7 for the whole team;
  download = a printable HTML. Sealing the Session 3 prediction no longer
  marks s7. Probed end to end (7/7, no errors, no overflow at 390 px).
  Same day, second pass: **the memo goes online on the team's own Netlify
  site** (Step 7 = 7a finish · 7b download as index.html in a folder
  `orbita-memo` · 7c Netlify Drop + rename `orbita-kpi-team-<x>-…` · 7d hand
  in). Team field `f_site` → `w3_site`; Hand in refuses without a
  `*.netlify.app` address and posts `_wall/w3s` (n = team label, src = URL),
  listed as "The class's memos". The downloaded page carries
  `robots: noindex` and a "fictional company" footer. No Google/Bing
  registration (that is creator's experiment, not BI's). Individual work
  stays on the page. Times: Step 4 15 min, Step 7 25 min.
  Third pass, same day: **no peer rating** (Jan Erik: "I do not want the
  teams to rate each other"). The red-team step is hidden as `#rtOld`
  (display:none — its script still binds to its elements; its markDone
  now targets `rtOld`, so it can never tick a counted step). The memo has
  FOUR parts (definition · tree · contract · recommendation). Visible
  steps: 1–4, 5 = contract (`s6`), 6 = publish + hand in (`s7`), 7 = the
  **team quiz** (`s5`, placed last; button "We played the quiz"). The quiz
  is **`jeopardy.html?set=s2`** — the room screen, MFB 545's engine, 6
  categories × 5 (the last, "Your memo", asks the team on turn about its
  own memo: the instructor's check that the work was done), 5 teams A–E,
  scores in this browser only (`bi_jeo_s2`). Not linked from any student
  page; its answers are in its source, like every Jeopardy in the repo.
- **Anyone can add or remove anyone on the team board (29 Oct 2026, during
  Session 2;** Jan Erik: "let all students the possibility to add or remove
  team members. easier"). `teams.js`: a × beside every member (→ `J:` for
  that name) and an "+ Add a member…" list on every team (moves the person
  out of their old team). A change for someone else is a NEW POST row in
  `_wall/teams` with their name — never the device's own row — and the
  newest row per name wins, so the moved student's device adopts it on its
  next read. Names come from the board and from `_chat/_people` (`_`-keys
  skipped). Needs a signed-in student (or the instructor session). No rules
  change. On the hub, Session 1 and Session 2 alike (one file).
- **Six teams, A–F, from 29 Oct 2026** (Jan Erik: "create an extra group").
  `teams.js` IDS + the `J:` regex, `TEAMS` and the `[Team X ·` regexes in
  week2/week3, Session 1's decision wall `T:<A–F>`, and the quiz board
  (adds Team F to a saved score sheet). The A–E *switches* of the
  definition machine are not teams and stay five.
- **Session 3 (`week4.html`, `w4`, Thu 5 Nov 2026) built 2 Nov 2026 — a
  self-run mandate like Session 2.** The CFO asks for the warehouse design
  on one page. Seven counted steps (`total:7`): s1 OLTP/OLAP sort (6) +
  warehouse/lake/lakehouse sort (6) + one line `w4_oltp`, opens `w3_nx`;
  s2 the **grain machine** — a sealed prediction (`w4_grain_pred`, wall
  `w4g` as `G:<n>`), then six candidate tables × six questions; done at
  6/6 with 4 tables (ride · account-month · ticket · city-channel-week =
  611,580 rows a month; account-day is the 1.43 m-row alternative; the
  city-day summary answers nothing). Sizes are stated on the page: 47,700
  accounts, ~560,000 rides (≈14 per paying subscriber), ~3,800 tickets,
  6 cities × 3 channels. s3 reading (star, date dim, conformed dims,
  surrogate keys, SCD type 2 = Anna Kowalski, three fact-table types) +
  fact/dimension/key sort (8 S1 columns); s4 the team's **star** (team
  keys `w4_p/g/d/m` 1 and 2, star 2 optional; five-check lint; inline SVG
  with literal colours so it survives the download), last week's contract
  read from `w3_k_<c>_<r>`; s5 the **source-to-target map** (8 rows × 7
  cells, team keys `w4_mp_<r>_<c>`, ≥6 complete rows; personal-data check
  on the column name only — "ip" once matched "subscription"); s6 part 3
  "the definition the design changed" (answers S2's claim), download
  `schema.html` into the S2 `orbita-memo` folder, redeploy via Netlify
  Deploys, hand-in requires `…netlify.app/schema(.html)`, wall `w4s`;
  prediction `w4_nx` (share of rows failing checks — opens in S4);
  s7 quiz = `jeopardy.html?set=s3`. Kimball & Ross (2013) and Armbrust et
  al. (CIDR 2021) are the two citations. Probed 2 Nov 2026: 7/7, no
  errors, no overflow at 500 px. Session 4 loads the extracts into these
  stars and should open `w4_nx`.
- **`week4-slides.html` — the instructor's deck for Session 3 (5 Nov 2026,
  the day of the session).** Jan Erik: "give me slides for session 4 for
  this as well" (meaning week4.html). The GBS deck engine, 18 slides,
  ~22 min of slides opening each step and ~90 min of team work, written to
  WRITING.md (verbs, every term defined: OLTP/OLAP, warehouse/lake/
  lakehouse, grain, business process, fact, dimension, star schema, date
  dimension, conformed dimension, surrogate key, type 2, the three fact
  tables, source-to-target map, GDPR sensitivity). Numbers from `GT`, `GQ`,
  `EX2`, `MEX`. A gold "▶ Slides" button in week4.html's top bar.
  ⚠ **REDONE the same afternoon, 25 slides** (Jan Erik, quoting the hand-in
  slide: "for every column, which system and which column it comes from, -
  huh? the slides are not specific enough"). Every slide now shows ÒRBITA's
  own names and rows: the five systems with their Session 1 columns (slide
  5, the one to point at when "which system, which column" comes up), the
  three parts of the note each with a churn example, the same data as three
  tables of sample rows (Session 1's rides 88120–88122 and accounts
  10482/10483/10491), ride 88120 as one fact_ride row (22:40 UTC = 00:40 on
  5 Oct in Barcelona, so date_key 20261005) pointing at dim_city row 1,
  Anna Kowalski's two type 2 rows, the seven map cells each with what to
  write and an example, a map line read as one sentence, the six Session 1
  problems with their system, column and rule, four columns classed by GDPR
  sensitivity. About 34 min of slides and 63 of work. Sample values not on
  the page (city-per-day totals, subscriber_key 5521, Anna's valid dates)
  are marked illustrative in the notes. week4.html's intro (part 2) and
  Step 5's "Why this step exists" now name the systems and columns too.
  Per-team findings about last week's contracts: `_private/` only.
- **week4.html REWRITTEN in plain sentences, 5 Nov 2026 (the day of the
  session).** Jan Erik: "The grain machine — if this is a row then call it
  that. redo the whole session … use verbs, call things for what they are,
  be specific"; "what do you actually want here?"; "make that table below
  the grain machine show — you should not have to click seal to open it".
  Every heading, instruction, label, button, sort explanation, check message
  and alert is now a sentence with a verb. Names: "the grain machine" →
  Step 2 "Decide what one row of each table stands for" (grain defined there
  once); "Seal it" → **Lock my guess**; "the mandate" → "What the client asks
  for"; "outcome KPI" → main KPI; "driver KPI" → secondary KPI (defined);
  "governance line" → the owner, sensitivity and check columns. Step 2 opens
  with "Your task" (switch tables on until all six questions have a ✓, with
  as few tables as possible) and **the six tables show from the start**:
  `gLab` is no longer `display:none`, `paintGrain()` runs at boot, and
  `openMachine()` only locks the guess. No id, `data-work` key or storage
  key changed. Title now "Design the data warehouse: what one row of each
  table stands for, and where every column comes from" (hub, with a What you
  learn / What you do blurb), "Designing the data warehouse" in
  courseprogress.js, presence.js and the quiz; the slides follow.
- **Session 3 switched to ONE GIVEN KPI for every team (5 Nov 2026, 16:15,
  just before class).** Jan Erik: "for today we do not ask for their kpi -
  rather create [a kpi] and ask them to create the tables and all from that
  kpi … make things explicitly clear". The KPI card (`#kpiTop` under the
  CFO's message, copied into Step 4's `#lastK` by `paintLastK()`, and slide
  3b of the deck): monthly churn by city and by plan; paying on the 1st =
  active + paused, trial and unpaid excluded; cancellations undone within 30
  days removed; owner head of growth; 2nd working day; target < 3.0 % by
  May 2027 (Oct 2026 2.62 %, finance); counter-metric = share paused;
  driver = rides in the first 14 days (Star 2, from telematics). Last week's
  contracts (`w3_k_*`) are no longer read. **Part 3 of the note changed**:
  not "the definition that changed" but "how our design gives each account
  a city" — billing has no city column, so each team writes the rule, the
  system and column it reads, and one unclear account (same field
  `w4_team_chg`, new label). Title now "… for ÒRBITA's monthly churn KPI: …"
  on the page, the deck and the hub `TERM`. Step 1's sentence asks why
  billing cannot calculate churn by city.
- **Session 4 (`week5.html`, `w5`, Thu 12 Nov 2026) built 11 Nov 2026 — a
  self-run mandate like Sessions 2–3: load the data (ETL).** Title (hub, page,
  courseprogress, presence): "Load ÒRBITA's data into the warehouse: find what
  breaks, choose a rule for each problem, and log every change". Seven counted
  steps (`total:7`). s1 reading (ETL, staging, idempotent, ELT; dbt's four
  generic tests not_null/unique/accepted_values/relationships + range; "what no
  check catches" = the UTC date) + E/T/L sort (6) + team field `w5_etl`; the
  team board (`teamsBox`) is in Step 1. s2 the five extracts as raw rows
  (`BILL` 34 rows / 24 accounts, `CUST` 25 emails with history, `RIDE` 22,
  `TICK` 9, `SPEND` 10 — Session 1's rows included verbatim) and **the raw
  load**: 18 of 65 rows fail (27.7 %), opens `w4_nx` (right answer "more than
  20 %"); `w5_raw`. s3 **the rule machine**: eleven problems (tz · failed
  unlock · city spelling · orphan ride 10999 → quarantine · email history ·
  empty resolved_h · duplicate spend rows · currencies at FIXED rates 1 CHF =
  1.07, 1 GBP = 1.15 EUR · paused = paying · reversed within 30 d removed ·
  city per account most/first), team state `w5_r_<k>`, a sticky panel (rows
  failing, churn, rides, rides on 4/5 Oct, spend, Anna's tickets, cities),
  each rule's line shows rows touched and the KPI under the other rule; churn
  by city table. Good rules → 0 of 62 fail, churn 4/21 = 19.0 %, 19 rides,
  0/3 on 4/5 Oct, 19,353 EUR, Anna 3, median 8 h; the tz rule changes no
  check (the silent error). Engine tested in node (scratch `etl_engine.js`).
  Six cities named for the first time: Barcelona, Madrid, Lisbon, Milan,
  Zürich, London. s4 **the bridge** 47,700 − 1,908 trial − 1,193 unpaid =
  44,600 (KPI's paying) − 4,532 paused = 40,068 vs finance 40,100 (gap 32,
  the 1,000-sample) + `w5_bridge`. s5 the transformation log (auto columns +
  team "why" per rule `w5_why_<k>`) → `w5_log`. s6 the load report built
  live, download `etl.html` into `orbita-memo`, hand-in requires
  `…netlify.app/etl(.html)`, wall `w5s`, prediction `w5_nx` (spread of city
  churn in Session 5, points). s7 quiz = `jeopardy.html?set=s4`. No minute
  timings on the page (WRITING.md rule 7); the 18:10 hand-in stays. Probed
  11 Nov 2026: 7/7, no errors, 500 px fits.

- **Hand-in tracker + bullet hand-in box + `systems.html` (12 Nov 2026, before Session 4).** Jan Erik:
  "make it more bullet points … make also a progress bar for that session and what they have filled
  in and what is left to do"; then "an interactive tool of the 5 existing databases … with their
  columns and some sample lines … available in the weeks where we require that information".
  (1) The "What your team hands in" box on week4.html and week5.html is now a numbered list
  (`.doit .doli` in bi.css), each item with its step. (2) **`tracker.js`** (`BiTracker.mount`) draws a
  sticky strip above `.sprog`: one segment per hand-in item (full = done, part-filled = started),
  "n of 8 done", ONE "Next: …" line with a link to the place, and a list that opens. The checks read
  the page's own functions and the team's shared fields (week4: team, steps 1–3, `starLint(1)` ≥ 4 +
  s4, `docData().mapOk` ≥ 6 + s5, `f_chg` ≥ 40 characters, `SITE_RE` on `f_site`, s6, s7; week5:
  team, steps 1–2, rules chosen of 11 with no failing row + s3, the bridge lines (`BR`,
  `bridgeVals()`; NOT `paintBridge()`, which re-renders inputs) + s4, reasons written of 11 + s5,
  `SITE_RE`, s6, s7). The config is a script before `/track.js` on each page; a new session page adds
  its own list. (3) **`systems.html`**: the five systems (billing with its status table and customer
  table, telematics, support desk, marketing, finance spreadsheet), each column with its meaning,
  kind of value, "about a person" and the column that links systems, the sample rows = week5's
  BILL/CUST/RIDE/TICK/SPEND verbatim and week2's finance rows (change one, change both), a search
  that highlights matching columns, a click copies "System · column". Linked from week4 Steps 4, 5
  and 6a, week5 Steps 2 and 3, and the hub under the team board. At 12 Nov 13:00 only teams C and D
  had handed in Session 3's schema.html; A, B, E, F had team answers but no hand-in.
- **`week5-slides.html` — the instructor's deck for Session 4 (12 Nov 2026, the day of the session).** Jan Erik:
  "start with [what] must be done in session 3 to finalize — and what they have not yet done — and give some
  slides to show what we do in session 4". 16 slides, the GBS deck engine (generated by a scratch script from
  week4-slides.html). Slides 3–6 finish Session 3: the eight tracker items, the class state as COUNTS (no team
  named on the public deck; read from the public `_wall` at 15:44: 3 of 7 handed in — B, C, D; A has parts 1–3,
  no Netlify, no hand-in; E has part 3, steps 4–5 not marked, a non-web text in the address box; F has parts 1–2,
  no part 3 — and already did Session 4's rules and log; G, three members, no name and no team answer), Steps
  6b–6c, Part 3 (the city rule). Slides 7–16 brief Session 4: the CFO's ask, ETL/staging/idempotent/ELT, the five
  checks, the UTC row that passes every check (reveal), the raw load (18 of 65 = 27.7 %, reveal), the eleven
  problems, the bridge as a flow with "?" (answers in the notes), the log with an example "why", hand-in, start.
  "▶ Slides" in week5.html's top bar. No overflow at 1280×720 or 1440×900.
- **Review Jeopardy, Sessions 1–4 (12 Nov 2026, replaces `?set=s4` as tonight's quiz).** Jan Erik: "replace those with a
  jeopardy for the first 4 sessions — and added to the landing page"; "just add the teams as participants".
  `jeopardy.html?set=rev`: six categories (S1 five systems · S2 two churn numbers · S2 KPIs · S3 the warehouse ·
  S4 loading the data · S4 rules and the bridge), no team-specific category, back link to the hub (`back`/`backT`
  on a set). **Every set's participants are now the real teams**: each team with a member on `_wall/teams`, named
  from `_wall/tn_X` (scores kept per team letter, `[name, score, id]`); offline the A–F placeholders stay. Linked
  on the hub under the systems button; week5 Step 7 and the deck point to it. The s2/s3/s4 sets stay in the file.
