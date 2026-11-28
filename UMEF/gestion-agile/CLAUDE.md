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
  games of journée 1 (an eight-minute round, a three-minute round, a ten-minute
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
  denominator 64): 1.1 **the short-cycle game** — ⚠ since 28 Nov 2026 (the
  morning of day 1; Jan Erik: "suggest rather a game where they make a webpage
  (1 page using ai) and add it to netlify. that is 'a real' development") it is
  **« Le site d'une page »**: the team builds a one-page site for the fictional
  *Boulangerie du Lac* with an AI assistant, deploys it on Netlify (drag the
  `site` folder, free account), and the client (the instructor) checks TWELVE
  requirements on the live URL, each with its acceptance test printed in the
  order table (exact title, the three client sentences, a 7-row hours table,
  three CHF prices with two decimals, a drawn star, a mailto « Commander »
  button, the footer address, a map link, phone width, a brown #8B4513 band,
  a photo with its caption, an e-mail-typed form). Four roles (rédacteur,
  intégrateur, testeur, scribe). Round A = 2 min roles + 8 min production
  without feedback, one delivery, all twelve checked; rounds B–E = 3 min,
  deploy, the client checks only what the scribe claims, 1 min to adapt. The
  table (`#rounds`, `mpm503_w1_rounds`; columns « exigences livrées /
  acceptées ») computes accepted per minute (A ÷ 8, B–E ÷ 3) and the refused
  share, a bar chart, hidden `w1_rounds`, step `rounds` when five rounds are
  filled, `w1_site` (the Netlify URL, new field), carnet `w1_cycle`
  (`data-board`); s1 needs rounds + w1_site + w1_cycle. The mid-game changes
  (euros at 1 CHF = 1,05 €, golden star, the e-mail with an s), the minuted
  run sheet and what to say are in `_private/j1-jeu-site-enseignant.md`
  (never committed). The plane version (three requirements, 6 + 2 min) is in
  git history before 28 Nov 2026; the two classify sentences, journée 3's
  opening line and one Jeopardy answer that named planes were reworded · 1.2
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

- **`journee3.html` · *Les méthodes prédictives et leur gouvernance*** (w3, 6
  sections, denominator 63; built 24 Nov 2026): 3.1 the sprint-1 review as a
  STEERING COMMITTEE (`w3_revue` `data-board`, `w3_prevision`, `w3_retro1`),
  `buildNum` v1–v3 on a fixed case (34 pts, velocity 11: 4 sprints; 23 left: 3;
  minus 8: 2), `buildPick` d1 (did the daily happen) · 3.2 charte, registre des
  parties prenantes (pouvoir × intérêt), WBS (règle des 100 %), jalons and the
  CRITICAL PATH on an SVG network A3→{B4,C6}→D2 (`cpNum` c1–c4: 11, 2, 13, 13),
  classify `docRows` 8 · 3.3 the team frames ITS project predictively: `w3_charte`,
  `w3_parties`, `w3_wbs` with a linter (`wbs` = ≥ 2 level-2 lines, ≥ 8 level-3
  lots each with « (n h) »), `w3_jalons`, `w3_compare` (`data-board`) · 3.4 PRINCE2
  7th ed. (7 principes/pratiques/processus, gestion par exception, séquences),
  PMBOK 7 (12 principes, 8 domaines), HERMES 2022 (phases, jalons de décision,
  scénarios, modules, three approaches); classify `refRows` = the TWENTY
  SITUATIONS · 3.5 quiz (positions `2 1 0 3 1 2 0 1`) · 3.6 sprint-2 planning under
  an IMPOSED CONTRACTUAL MILESTONE: `w3_jalon`, `w3_objectif2` (`data-board`),
  `w3_selection2`, `buildPick` p1–p5, `w3_tension` (`data-board`), `w3_retro`;
  "avant la journée 4" = Cooper & Sommer 2016, Conforto & Amaral 2016 (DOIs).
- **`journee4.html` · *Concevoir et piloter un modèle hybride*** (w4, 7 sections,
  denominator 55): 4.1 sprint-2 review (`w4_revue2` `data-board`, `w4_retro2`) ·
  4.2 the definition (Agile–Stage-Gate), the SIX DECISIONS of the canvas (phases,
  jalons et portes, instances et rythme, rôles, contrat et budget, reporting);
  classify `phRows` 8 (P/I/M) and `instRows` 6 (comité/PO/équipe) · 4.3 THE CANVAS
  (`#cv`: seven phases, renamable, mode P/I/M/–, a reason; state `mpm503_w4_cv`;
  « Copier le canevas dans le carnet » → hidden `w4_canevas`, step `cv` at ≥ 5
  modes), `w4_portes`, `w4_instances`, `w4_justif` (`data-board`, linter `just` ≥ 120
  words) · 4.4 five contract forms (table), money for nothing / change for free
  (Sutherland), budget par incréments, the fixed-price supplier via interface
  milestones; `ctNum` k1–k4 (24'000 € a sprint, 192'000, early exit after 5 at
  20 % = 134'400, 150'000 envelope = 6 sprints); the ROLE PLAY client vs
  prestataire: `w4_contrat` (`data-board`), `w4_negociation` · 4.5 burndown /
  burnup / CFD / velocity; the BURN SIMULATOR (`#bScope`, `#bDone`, `#bAdd` →
  SVG burnup + burndown, step `burn`); AgileEVM (Sulaiman, Barton, Blackburn
  2006): `evNum` e1–e6 (1'200 €/pt, PV 96'000, EV 76'800, SPI 0,8, CPI 0,77 —
  TWO decimals: the engine's `num()` reads « 0,768 » as 768, a comma followed by
  three digits is a thousands separator — EAC 250'000 tol 1 %); the dashboard
  `w4_tableau` (`data-board`) presented in three minutes, `buildPick` f1–f3 ·
  4.6 quiz (`1 2 0 3 1 0 2 1`) · 4.7 the CRISIS (scope + 25 % cut + a leaver,
  the one `.timer` 45 min = the exercise's rule): `crNum` x1–x3 (8,4; 6; 4
  sprints → 34 of 50 points), `w4_arbitrage`, `w4_prevision`, `w4_communication`
  (`data-board`, the five-line note), sprint 3 `w4_sprint3` (`data-board`),
  `w4_retro`; "avant la journée 5" = SAFe, LeSS, Spotify (2012).
- **`journee5.html` · *Mise à l’échelle, organisation et conduite du changement***
  (w5, 6 sections, denominator 69): 5.1 sprint-3 review (`w5_revue3`
  `data-board`, `w5_retro3`), the THREE-SPRINT TABLE (`#spTable` 9 inputs → KPIs:
  mean velocity, sd ÷ mean, acceptance, h/point, min–max; hidden `w5_sprints`,
  step `sprints`; state `mpm503_w5_sp`), `spNum` sp1–sp4 on a fixed case (12;
  85,7 %; 2,39 h; 2 sprints), `w5_enseignements` (`data-board`) · 5.2 SAFe, LeSS,
  Scrum@Scale, Nexus, Spotify (table: idée, ajoute, coûte), « descale first »,
  when not to scale; classify `scRows` 10 and `whRows` 6 · 5.3 THE PI BOARD
  (`#piTable`: two teams A Paiement / B Comptabilité, ten features with points
  and dependencies, five iterations, capacity 20, B4 due by it. 4; « Vérifier le
  plan » lists every conflict in words, rows turn red; zero conflicts → hidden
  `w5_pi`, step `pi`; state `mpm503_w5_pi`; a valid plan: A1:1 B1:1 A2:2 B2:2
  A3:3 A5:3 B3:3 A4:4 B4:4 B5:5), `w5_objectifs_pi` (`data-board`), `w5_roam` ·
  5.4 the CFO (budget par incrément, capitalisation IAS 38 / art. 959a CO,
  retour par version, SPI/CPI/EAC), the compliance officer (trace, séparation des
  rôles, backlog = registre des changements, nLPD and art. 958f CO as stories),
  the PMO in hybrid mode (kanban de portefeuille, three measures); `cfoNum` f1–f3
  (7'200 €, 7'200 €/an, 12 months payback); classify `obRows` 8 (objection ↔
  argument); the ROLE PLAY: `w5_cfo` (`data-board`), `w5_conformite`, `w5_pmo` ·
  5.5 quiz (`1 3 0 2 1 0 2 1`) · 5.6 the AI demonstration: four prompts
  (compte rendu, risques, récits, synthèse des rétrospectives), classify
  `iaRows` 8 (juste / inventé / lissé / vague), `w5_ia_verif` (`data-board`); the
  dossier plan (7 parts, due Fri 22 Jan 2027 23h59 on the UMEF platform),
  `buildPick` d1–d7 (fait / brouillon / rien), `w5_repartition`, `w5_retro`.
- **`journee6.html` · *Présentations, bilan et révision*** (w6, 6 sections,
  denominator 29): 6.1 the presentation (what the committee grades; the one
  `.timer` 20 min = the presentation's rule), `w6_plan_presentation`,
  `w6_questions` (`data-board`), `buildPick` au1–au4 · 6.2 PRÉVU CONTRE LIVRÉ
  (`#ecTable` 8 inputs → deltas in points, hours, budget, milestones, h/point;
  hidden `w6_ecart`, step `ecart`; state `mpm503_w6_ec`), `w6_ecart_expl`
  (`data-board`), classify `rcRows` 8 (which day taught it), `w6_retro_cours`
  (`data-board`) · 6.3 THE TRAINER: twenty PSM I / PMI-ACP-style questions in
  the page's own widget (not `buildQuiz`: no release needed), immediate
  commented correction, score line, « Refaire les questions manquées » (clears
  only the wrong ones), state `mpm503_w6_tr`, step `trainer` when all twenty are
  answered (right or wrong) · 6.4 the exam's form (6 Feb 2027 13h30, 2 h: définitions,
  calculs, cas à argumenter) and FIVE EXAMPLE QUESTIONS with model answers in
  `<details class="ex">` (invented for the page, labelled so — never the exam's
  questions), `w6_examen_prep` · 6.5 the JEOPARDY (`jeopardy.html?set=syn`,
  gen110's engine copied: six columns = journées 1–5 + « Votre projet », scores
  in this browser `mpm503_jeo_syn`), `w6_bilan` (`data-board`) · 6.6 the hand-in
  list `buildPick` rm1–rm6, `w6_remise`, `w6_questions_examen`.
- Registry: `courses.json` modules w1–w6, project sections 1–6 (every
  `data-work` field with its `data-worklabel`); `courseprogress.js` totals
  8 / 9 / 6 / 7 / 6 / 6, all live; hub `DAYS` all live.

Tested headlessly 24 Nov 2026 (scratchpad `agile-test2.mjs`, Firebase and
track.js aborted, 1280 and 390 px): J3 5/5 non-quiz sections (55/63), J4 6/6
(47/55), J5 5/5 (61/69), J6 6/6 (29/29) — every numeric control accepts its
answer, the WBS and justification linters count, the canvas copies, the burn
chart draws, the PI board refuses a bad plan and accepts the valid one, the
trainer scores and redoes, replay after reload; hub seven cards, Jeopardy 30
cells; no page errors, no sideways scroll.

## Not built

Slides and PDFs for the six days; a corrigé of the fixed-case controls. The
`mpm503` rules block must be DEPLOYED before the link goes to students (Jan
Erik publishes it); until then sign-in, presence, quiz release and messages
are refused. The Jira menu names in J1 §1.6 and the free-tier limits are
still unverified.
