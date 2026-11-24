# UMEF · MPM 503 — Gestion de projet agile et méthodes hybrides

`UMEF/gestion-agile/`, id = ns = storage prefix **`mpm503`** (renamed 24 Nov 2026
from the calendar placeholder `agile`; nothing had been stored under it). MSc en
Sciences de gestion, spécialisation Gestion de projet, 2e année, programme
MSc-2-spec.GP-FR-26-27. **The syllabus says four students** (the 1 Nov contract
said eight); the course is built for ONE team of four. French only. The
site-wide rules (shared runtime, data model, rules, secrets, WRITING.md) stay in
the root `CLAUDE.md`; read that first.

## Session parameters (for /new-session)

- **Engine**: UMEF/ia-production's (itself mfb545's), copied and renamed
  (`journee.js`, `agile.css` = mlops.css, `courseprogress.js`, `presence.js`,
  `exercises.js`, `answers.js`, `lang.js`, `admin.html`; no `teams.js` — one
  team). Pages `journeeN.html`, module ids `w1…w6`, progress keys
  `mpm503_wN_progress_v1`. **Every 90-min block opens on a simulation, a game
  or a demonstration, then the team applies it to its REAL project** (the
  syllabus, §1 and §7). Section modes: `do` (🎲 simulation / 🛠 atelier),
  `co` (🔁 mise en commun — written out in full, "if it does not take place,
  read it"), `quiz`. ⚠ **No `min` on sections, no `#dayTl`, no section
  timings** (WRITING.md rule 7); the only `.timer`s are the rules of the two
  games of journée 1 (a six-minute round, a two-minute round, a ten-minute
  sprint). The block hours (09h00–10h30 …) are the syllabus's timetable and
  stay on the section list.
- **Dates**: Sat 28 Nov, 5 Dec, 12 Dec, 19 Dec 2026, 9 Jan, 16 Jan 2027,
  09h00–12h15 + 13h30–16h45; final exam **Sat 6 Feb 2027 13h30**, 2 h,
  written. Keep `courses.json → schedule.dates` and the hub's `DAYS` in step.
- **The three real sprints** (fixed by the course, printed on the hub, J1 §1.8
  and J2 §2.9): 5 → 12 Dec (planned J2 bloc 4, reviewed J3 bloc 1) · 12 → 19
  Dec (planned J3 with an imposed contractual milestone, reviewed J4) · 19 Dec
  → 9 Jan (planned J4 after the crisis, reviewed J5).
- **Grading** (syllabus §9): 10 % participation (presence, the ceremonies held
  between the days, the synchronised quizzes — **the quiz COUNTS**, released
  with `_release/<mod>/quiz`) · 40 % the team project, replacing the mid-term
  (dossier ≤ 15 pages, the Jira space and Miro board, the 16 Jan presentation
  20 + 20 min with one part per student, a 3-page individual journal; due Fri
  22 Jan 2027 23h59 on the UMEF platform — not on this site) · 50 % exam.
  Attendance rule: under 80 % the 10 % is lost, under 50 % no exam, two
  latenesses = one absence.
- **Tools**: Jira free (stated as "up to ten users") and Miro free (stated as
  "three editable boards"), GitHub Projects, a public AI assistant. ⚠ Those
  free-tier limits were written from memory on 24 Nov 2026 and NOT
  re-verified; check before J1. The Jira walk in J1 §1.6 names menus
  generically (Projets → Créer un projet → Scrum, géré par l'équipe) — if
  Atlassian has renamed them, fix the eight `buildSteps` strings.
- **Writing**: WRITING.md. Every case figure carries its source and year and a
  labelled indicative rate (1 £ = 1,15 €, 1 $ = 0,90 €).

## What is built (24 Nov 2026)

- **`index.html`** — the hub (ia-production's, recoloured by nothing: same umef
  theme). `DAYS` (six, `live` flips as pages ship) + the exam card; the three
  sprints in `.sprints`; the project panel (a, b, c, d) with the 22 Jan
  deadline; the grading; prerequisites (read the Scrum Guide, two accounts,
  bring a real project); the syllabus's reading list with DOIs for Cooper &
  Sommer and Conforto & Amaral. QR `qr-mpm503.svg` (segno, #0f4c60, `?app=1`).
- **`journee1.html` · *Pourquoi agile ? Scrum en pratique*** (w1, 8 sections,
  denominator 63): 1.1 **the short-cycle game** — paper planes, three
  requirements (flies 3 m, a star on both wings, folded nose), round A = 2 min
  plan + 6 min production without feedback, rounds B–E = 2 min then immediate
  acceptance; the table (`#rounds`, `mpm503_w1_rounds`) computes accepted per
  minute and the refused share, a bar chart, hidden `w1_rounds`, step
  `rounds` when five rounds are filled, carnet `w1_cycle` (`data-board`) · 1.2
  the four values (classify `valRows`, 8), the three principles, four
  documented failures — Denver baggage (opened Feb 1995, 16 months late, ≈ $560 m,
  de Neufville 1994), FBI Virtual Case File ($170 m, DOJ OIG 2005), NHS NPfIT
  (≈ £9.8 bn, PAC 2013), Universal Credit (£34 m written off, NAO Sept 2013,
  "agile without governance") — classify `failRows` (6) · 1.3 the positioning
  quiz (Scrum Guide + Manifesto, positions `1 2 0 3 1 0 2 3`, `markSection('s3')`)
  · 1.4 **the Scrum simulation**: a paper city, 12 items with points (total 55)
  ordered by the client, three sprints: "Ce sprint" selects, the client ✓/✗ at
  the review, *Clore la revue* needs every engaged item decided (refused items
  go back), velocity per sprint, KPIs, a burndown (SVG, dashed = all 55 in
  three sprints), steps `sp1–sp3`, hidden `w1_sim`, `w1_retro1–3`; state
  `mpm503_w1_sim` · 1.5 roles / events / artefacts from the Guide 2020 (team ≤ 10,
  sprint ≤ 1 month, planning ≤ 8 h, daily 15 min, review ≤ 4 h, retro ≤ 3 h;
  classify `roleRows` 6 and `evRows` 6) · 1.6 Jira in eight `buildSteps`
  (`jira`) + Miro, the definition of done linter (`dod` = 5 lines ≥ 12 chars,
  `w1_dod`), `w1_outils` · 1.7 the AI backlog: a copyable prompt, the Dupraz
  bakery backlog (8 lines, classify `iaRows`: bon · trop gros · tâche
  technique · sans critère · sans raison · inventé), `w1_ia` · 1.8 the project
  launch: `w1_pitch` (`data-board`), `w1_choix`, `w1_vision` (Moore's template,
  `data-board`), `w1_charte`, `buildPick` role (`role`), the sprint calendar,
  `w1_calendrier`.
- **`journee2.html` · *Backlog, estimation et flux*** (w2, 9 sections,
  denominator 56): 2.1 the user story, acceptance criteria, INVEST (classify
  `investRows`, 8, seven levels) · 2.2 stories linter (`recits` = 8 lines with
  "en tant qu / je veux / afin d"), `w2_criteres`, story mapping (Patton),
  `w2_carte`, the stakeholders' review `w2_revue` · 2.3 points, planning poker,
  velocity, forecast; `buildNum` v1–v4 (120 pts, velocities 20/25/15: 6, 8, 5,
  7 with 140 pts) · 2.4 **planning poker**: titles pasted one per line
  (`#pokerStories`), cards 1…100 and ?, "retenu" input, hidden `w2_poker`, step
  `poker` at ≥ 4 stories with both · 2.5 **the Monte-Carlo forecast**
  (`mulberry32(503)`, 10 000 runs, P50/P85/P95, histogram), step `mc`;
  `buildNum` m1–m3 (6, 8, 4); `w2_prevision` · 2.6 quiz (positions
  `2 0 3 1 0 2 1 3`) · 2.7 **the Kanban flow game** — 30 days, 3 arrivals a day,
  Analyse → Réalisation → Test (a three-sided die, the structural bottleneck) →
  Mise en service, same dice in A (no limit) and B (limit 3 per post:
  finished work waits upstream, the door holds the surplus); ⚠ **the FIRST
  model (20 items, each post's die used both to pull and to push) showed no
  effect (5.3 vs 5.2 days) and was replaced** — the current one, checked in
  Node: A 53 delivered, lead 9.5 d (11.9 over the last ten days), WIP 23, 28
  queued before Test; B 52 delivered, 5.5 d, WIP 8.6, 29 at the door — same
  throughput, half the wait inside; two CFDs on one scale (90), sequential
  teal ramp + a legend; steps `kbA`/`kbB`; Little's law `buildNum` l1–l2 (4, 6);
  `w2_kanban` (`data-board`) · 2.8 Kanban's six practices, Scrum / Kanban /
  Scrumban (classify `methRows`, 8), `w2_choixmethode` · 2.9 **sprint 1
  planning, the real ceremony**: `w2_objectif` (`data-board`), `w2_selection`,
  `w2_taches`, `w2_daily`, `buildPick` checklist p1–p5, `w2_retro`, what to do
  before J3 (hold the sprint, read HERMES 2022 pp. 2–12, bring the hours spent).
- `courseprogress.js` CHAPTERS w1 total 8, w2 total 9 live; w3–w6 live:false
  (totals 9/9/9/6 placeholders). `presence.js` SESSIONS = the six day titles.
- `courses.json`: id/ns `mpm503`, joinCode `AGIL`, features (progress, announce,
  admin, login, workbook, chat, presence, releases), modules w1–w2, `project`
  sections "1" (14 fields) and "2" (13 fields). `shared/config.js` entry.
  `firebase-database-rules.json`: the mia506 block cloned as `mpm503`.
  `robots.txt` already disallowed `/UMEF/gestion-agile/`.

Tested headlessly 24 Nov 2026 (Playwright, Firebase and track.js aborted,
1280 and 390 px): hub, J1 (every widget to its step, 7/7 non-quiz sections,
55/63 with the quiz locked, replay after reload) and J2 (8/8 non-quiz
sections, 48/56), no page errors, no sideways scroll (the rounds and Kanban
tables scroll inside `.tblwrap`).

## Not built

Journées 3–6 (locked cards on the hub; the syllabus's blocks are in `DAYS`).
J3 needs: the sprint-1 review as a steering committee, the predictive framing
(charter, stakeholders, WBS, milestone plan with critical path), the PRINCE2 /
PMBOK 7 / HERMES "twenty situations" classify, sprint-2 planning with an
imposed milestone. J4 needs the hybrid canvas, the agile-contract role play,
the AgileEVM simulator, the crisis simulation. J5 the PI-planning simulation,
the CFO/compliance role play, the AI-for-PMs demonstration. J6 the
presentations, the PSM I / PMI-ACP trainer and a Jeopardy (copy gen110's
`jeopardy.html`). No slides/PDF yet.

⚠ The `mpm503` rules block must be DEPLOYED before the link goes to students
(Jan Erik publishes it); until then sign-in, presence, quiz release and
messages are refused.
