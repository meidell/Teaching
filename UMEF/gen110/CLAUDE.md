# UMEF · GEN 110 — notes for Claude

Split out of the root `CLAUDE.md` on 23 Oct 2026 (one file per course, loaded when working in this folder). The site-wide rules — shared runtime, data model, rules, secrets, conventions — stay in the root `CLAUDE.md`; read that first.

## SWISS UMEF · GEN 110 Intelligence artificielle — `UMEF/gen110/`

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
  kept for a course that wants it. Do not put a lecture deck back into this
  course — **except séance 4** (3 Nov 2026), where Jan Erik asked for one
  explicitly: "give me a good hour's slideshow (integrated at the top) so
  that I can walk them through the theory and the use of the exercises".
  Add a deck to another séance only when he asks for that séance.
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
- ⚠ **26 Oct 2026 — the class's PRIORITIES replace the old programme from
  séance 4 on.** Jan Erik: "we have to change the course into a much more
  practical teaching approach — where the students learn through real
  exercises in class"; the class wrote its priorities on the board, in
  order: (1) business agents working together in business · (2) création
  de CV automatisée · (3) prompt engineering · (4) automation/agents ·
  (5) programmation · (6) gestion de contrat etc. · (7) analyse des données
  (the board also said "jeux interactifs" — folded into séance 8). "These
  replace the old course from here on." The ten séances (hub `SEANCES`,
  `courseprogress.js` `CHAPTERS`, `nav.js` `NAV`, `presence.js` `SESSIONS`,
  `projet.tpl.html` `WEEKS` — keep all five in step): 1–3 unchanged
  (*L'IA, on commence par s'en servir* · *Bien demander I — texte* · *Bien
  demander II — son, image, vidéo*) · 4 *Des agents qui travaillent
  ensemble* · 5 *Le CV automatisé* · 6 *Le prompt engineering pour le
  travail* · 7 *Automatiser — un agent qui travaille seul* · 8 *Programmer —
  un site, une appli, un jeu* · 9 *Contrats et données* · 10 *Présentations
  et examen*. Data protection lost its séance: it is a 🔐 step at the start
  of every exercise ("before pasting, look") and stays an exam topic.
  Hub cards for 4+ say *Exercices réels* and carry an `out` line (🎒 what
  you keep). The hub's `WISHES` is now the ranked list (7 items, rank
  badge); **séance 1's §1.7 keeps the 6 Oct wish-list on purpose** — it is
  the record of that day, and its 8-click completion rule depends on it.
  The per-project task lists in `projet.tpl.html` `PROJECTS[].plan[4..10]`
  were written for the old séances and were NOT rewritten (only `WEEKS`
  titles/gives were); revisit them when building séances 5–9. Hand-in
  rhythm unchanged (R2 S4 · R3 S5 · R4 S7 · R5 S9).
- **"Real exercise" format (séance 4 on)**: every section is one real
  exercise — a real file or case (the student's own, or Wax & Co's), a job
  task, a result the PAGE checks with numbers, something kept for the
  project. Same `.todo` / `.donewhen` / `REQ` engine as séance 3. Kicker
  says *Exercice réel / Real exercise*, badge *Exercice · N min*.
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
  Séances 1–4 exist; 5–10 are `live:false` and locked `div`s on the hub.
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
  parts) with an aspect-ratio preview, an **image checker** (the
  student's own 1–3 images, read with `FileReader` and never uploaded,
  inside the chosen format with the app's chrome as a grey veil, four
  dominant colours per image by canvas quantisation, and a verdict on
  whether the palettes make one campaign) plus a publish / fix in Canva /
  regenerate / never classify on the 2026 flaws — invented details, a
  place from nowhere, a face that changes between images, borrowed
  logos, the wrong format. ⚠ It **replaced a "find the five flaws"
  poster** (six fingers, garbled sign…) on 21 Oct 2026: Jan Erik,
  "gemini and canva no longer do these errors". Don't teach 2023's
  defects. A **denoising canvas** (pixel mix from
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
  `EXTRA_STEPS (19) + .cl-row (32) + .q (8) + [data-work] (8) = 67`;
  `total:8`. Quiz on `_release/w3/quiz`, positions `1 3 0 2 3 1 0 2`. Eight
  `w3_*` carnet fields in `courses.json → project`. `presence.js`'s
  `SESSIONS` names were refreshed to the rebuilt titles the same day (they
  still said "Classer, se tromper, être biaisé" from the 4 Oct build).
  Every `EXTRA_STEP` is also written to `<sid>/mod/w3/steps/<key>` for
  the dashboard's **Activity** tab (§3). Probed headlessly in both
  editions: every widget to its step, 8/8 sections, the quiz refusing
  clicks while locked.
- **Séance 4 — *Des agents qui travaillent ensemble* (`seance4.tpl.html`,
  26 Oct 2026, for Tue 3 Nov 13h30–16h45, break 15h00).** 4.0 the
  student's data file: paste from Excel/Sheets (tab-separated) or a .csv,
  `parseTable` + `profile` (types, empties, mixed number/text, two date
  formats, exact duplicate rows) and **🔐 personal columns** (`PRIV_HEAD`
  header regex, or ≥ 3 phone/e-mail values) ticked "remove"; ⬇ exports the
  CSV without them (`;`, BOM). Kept in `gen110_w4_data` (≤ 300 kB), never
  sent. "Use the shop's file" loads **Wax & Co** (`WAX_CSV`, 80 orders
  Jul–Oct 2026 + 1 duplicate, generated in Python, seed 1103) with SEVEN
  planted problems (a duplicate order · dates ISO and dd/mm/yyyy ·
  four spellings of "Robe wax" · prices typed "18 000 F" · two empty
  prices · an impossible quantity · "OM" for Orange Money — order numbers
  left out on purpose, the 3 Nov file reuses some of them for the hunt); invented first names and phone
  numbers so the 🔐 flag has something to catch. **`TRUTH` (Python, on the
  file corrected with "Aminata"): CA 1 918 000 FCFA · top Boubou bazin
  490 000 = 25.55 % · Oct 622 000 vs Jul 442 000 = +40.72 % · basket
  23 975 (80 orders) · Wave 37/80 = 46.25 %.** A naive total on the raw
  file is 2 899 000. 4.1 the **agent-card builder** (`buildAgents`: six
  boxes role/mission/input/format/rules/next, `lintAgent` five checks,
  assembled `cardText`, copy) — the three Wax cards are seeded with two
  flaws on purpose (analyst format "un résumé des ventes" 4/5, writer no
  rule 4/5); step `card` needs all three at 5/5. 4.2 the **relay board**
  (`w4_analyste` → `w4_redacteur` → `w4_controleur`, the student carries
  each answer between three chats) and the **truth check**: `numbersIn`
  pulls numbers from the writer's message (1 918 000 · 1,9 million ·
  1.918.000 · 25,5 %) and `TRUTH_ROWS` compares with tolerances; Aminata's
  reply (the corrections only she knows) unfolds below; classify "who
  should have stopped it" (A H K A R H). 4.3 single agent vs team grid
  (`CRIT_TEAM`, → Comparisons tab, why = `w4_equipe`), the **chain
  simulator** (prediction first, sliders locked until then; p^n and
  p^n + (1−p^n)·c, 100 dots), classify chain/manager/debate (H C D C D H).
  4.4 the builder again, empty (`gen110_w4_mine`, need 4/5) on the
  student's own file → `w4_projet` = remise 3's first result. Quiz on
  `_release/w4/quiz`, positions `2 0 3 1 1 3 0 2`. Denominator
  `EXTRA_STEPS (12) + .cl-row (12) + .q (8) + [data-work] (5) = 37`;
  `total:7`. Five `w4_*` carnet fields in `courses.json → project`
  (section "4"). Probed headlessly (CDP over Node 23's WebSocket, Firebase
  and track.js blocked so no test pageviews land in analytics) in both
  editions: every widget to its step, 6/6 non-quiz sections, 29/37 with the
  quiz still locked; the EN truth check reads "1,918,000" and "25.5%".
  Free tiers named (ChatGPT and Gemini file attachment) were NOT
  re-verified on 26 Oct 2026 — check before the séance. Séance 5 needs:
  the student's CV and a real job/internship offer as text.
- ⚠ **Séance 4 REWORKED the morning of the séance, 3 Nov 2026** — Jan Erik:
  (1) "increase ×3 the size of the dataset and let them only use the one you
  suggest", (2) "make it into a competition — find (give hints)
  particularities that might be discovered when using the agents rightly,
  wrongly", (3) "integrate the 'à faire maintenant' card into each actual
  card", (4) "a good hour's slideshow (integrated at the top)". What changed,
  and supersedes the 26 Oct description above where they differ:
  **One file for the whole class** — `WAX_CSV` is now **240 orders + 2
  duplicate rows** (`_private/wax240.py`, seed 20261103; NOT in `_build`
  because it holds the hunt's answers). 4.0 has no paste/upload any more:
  "Charger le fichier de la boutique" → portrait → 🔐 → download. 4.4's
  "your file" card is gone; 4.5 (the project) is cards only, the round on
  the student's own data is homework for remise 3. ⚠ **The true figures
  and the hunt's answers are in `_private/wax240.py` and
  `_private/HUNT-answers.md` only** — this file is public (it is served at
  /UMEF/gen110/CLAUDE.md), so never write them here. `TRUTH` is base-36 encoded in the page and the 4.2
  truth table shows ✓/✗ only until hunt find 12 is solved (it would give
  the answer away). **Sections are now eight**: 4.0 file · 4.1 cards · 4.2
  relay · **4.3 la chasse** · 4.4 team vs single + simulator + set-ups ·
  4.5 your team · 4.6 quiz · 4.7 keep (`total:8` in courseprogress, nav.js,
  `markSection('s6')` for the quiz). **The hunt (4.3)**: twelve finds
  (`HUNT[]`) — 9 🧹 in the file (an error, an odd row, the true CA) and 3 🤖
  on agent use (raw vs corrected, dates read in the wrong format, a question
  the file cannot answer → MANQUE). 10 pts each, find 12 20 → 130; hints −2/−3/−4,
  wrong −1, floor 2 (4). ⚠ **The error type is hidden (3 Nov 2026, Jan Erik:
  the list was "too easy" — the title named what to look for)**: H1–H7 and
  H9 carry a `q0` (the EFFECT of the error only: "one order adds more than a
  million") and the card draws 🔍 "À trouver" + `q0` until hint 1 is taken or
  the find is solved; then the real `ico`/`t`/`q`. Hint 1 = the type + the
  prompt to ask. H8/H10/H11 (agent) and H12 (the CA) were never typed.
  **`jeopardy.html?set=s4` (3 Nov 2026)** — the room screen for the end of
  séance 4, BI's engine in French with the deck's colours: 6 categories × 5
  (how the assistant answers · asking well · sound/image/video · agents ·
  what never to paste · **Votre projet**, which asks the team on turn
  about its own project, the prof judges), teams A–F, scores in this
  browser only (`gen110_jeo_s4`). Every answer is a séance page's own
  wording (mostly the quizzes'). Not linked from a student page; answers
  are in its source, like every Jeopardy in the repo.
  Answers checked as djb2 hashes of a normalised
  answer (`hh()`; numbers sorted, MC `id:index`, CA rounded to thousands);
  the why-texts and notes carry no answer numbers. A copyable **detective
  agent card**. Score → hidden `data-work="w4_chasse"` (a number; in
  `courses.json → project` section 4), `data-board` on the score card so
  board.html shows the class's scores without names; state in
  `gen110_w4_hunt`. The 4.2 "who should have stopped it?" items moved to
  OTHER businesses (pharmacy, stationery, restaurant…) so they do not give
  the hunt away; Aminata's 4.2 reply now names only dates and OM.
  **▶ À faire strips** (`.doit`) sit inside every card (20 of them); no
  `.card.todo` is left; the time line under each title (`.sec-time`) is
  computed from `SECTIONS[].at/end/min`. **The slideshow**: 31 slides in
  `SLIDES[]` with a chapter key (`open` = 15 slides of opening + theory,
  13h30–13h55, then 1–4 per section), MBA406's `#lect` engine, speaker
  notes (N), PDF, "→ L'exercice" closes on the chapter's section, a
  ▶ Diapos button per section and a chapter card on the home screen; the
  top-bar button is hidden under 600 px. Timetable: deck 13h30 · 4.0 13h55
  · 4.1 14h05 · 4.2 14h25 · break 15h00 · 4.3 15h15 · 4.4 15h55 · 4.5 16h15
  · quiz 16h30 · 4.7 16h40. Denominator `EXTRA_STEPS (14) + .cl-row (12) +
  .q (8) + [data-work] (6) = 40`. Probed headlessly in both editions (all
  widgets, all 12 finds, the score after one wrong / one hint / one wrong MC,
  values revealed after find 12, every slide fits 1280×720, 390 px).
- **Séance 5 — *Le CV automatisé* (`seance5.tpl.html`, 1 Nov 2026, for
  Tue 10 Nov 13h30–16h45, break 15h00)**, the class's priority n° 2, on
  séance 4's engine (blocks copied, `w4`→`w5`; séance 4's agent-card
  builder `AF`/`lintAgent`/`cardText`/`buildAgents` copied verbatim).
  5.0 the student's CV + a real offer in two boxes (kept in
  `gen110_w5_cv` / `gen110_w5_off`, **never sent**) and a **🔐 detector**
  (`PRIV`: e-mail and phone replaced inline; lines with an address, a
  birth date or age, a nationality, a marital status, an ID number or a
  photo dropped) that writes the **version for the AI**; *Use Awa's CV and
  offer* loads **Awa Ndiaye** (invented, 1st-year BBA, family fabric shop)
  and a **Wax & Co internship offer** (Canva, Google Sheets, WhatsApp,
  Instagram AND TikTok, the Monday report, a campaign) — the CV has no
  TikTok, no campaign, no report, so a writer without a rule adds them.
  5.1 an extraction instruction (copied with the offer appended), the
  AI's list pasted into `w5_exigences`, and the **coverage**: each
  requirement line's words (accent-free, `STOP` list, 6-letter stems)
  looked up in the CV, ≥ half = covered; per missing line *true, not
  written* / *I do not have it* (`gen110_w5_proof`); an ATS explainer
  (extract · file · search; the "75 % rejected by robots" figure named
  as unsourced). Awa: **44 % FR / 56 % EN** before — the languages differ
  because "commerce, marketing ou gestion" shares fewer words with her CV
  than "business, marketing or management". 5.2 two cards (writer seeded
  **without a rule**, 4/5; truth checker 5/5), relay `w5_cv_ia` →
  `w5_controle`, and **Find what was added** (`added()`: numbers, `TOOLS`
  in the CV's own casing, proper names mid-sentence, responsibility words
  checked word by word — ⚠ not "is any claim word in the original",
  which Bacca*lauréat* broke) + coverage after (probe: TikTok · 2 000 ·
  30 % · "Responsable de la communication…", 44 → 67 %). 5.3 the message
  (`w5_lettre`) with `lintLetter` — 80–180 words · company name (`#coName`,
  `gen110_w5_co`) · ≥ 2 requirements quoted · ≤ 1 stock phrase (`CLICHE`,
  one list per language) · a request at the end; step at 4/5. 5.4 the
  recruiter instruction built from the company + the requirement lines
  (copy = step `recruiter`), `w5_entretien` with a 3-check answer linter
  (≥ 40 words · "j'ai/I" · a digit — advisory, not required), classify
  automate / re-read / never (`A J V J J V`; the Amazon 2018 CV tool,
  Reuters). Quiz on `_release/w5/quiz`, positions `1 3 0 2 2 0 3 1`. 5.6
  final CV as PDF, `w5_projet`, bring **ten real examples** of a repeated
  task to séance 6. Denominator `EXTRA_STEPS (13) + .cl-row (6) + .q (8) +
  [data-work] (6) = 33`; `total:7`. Six `w5_*` fields in `courses.json →
  project` (section "5"), module `w5`; hub card 5 rewritten to what was
  built and `live:true`; `nav.js` lists the sections. Probed headlessly in
  both editions (fetch stubbed): no errors, all 13 steps, sections
  s0–s4 + s6 complete, 25/33 with the quiz locked, no personal datum left
  in the AI copy. The project page's `PROJECTS[].plan[5]` was not
  rewritten.
- **Adding a séance** = write `_build/seanceN.tpl.html` (copy séance 1's,
  keep the engine, change the sections), add it to `PAGES` in `build.py`,
  run the build, flip the chapter `live:true` in `courseprogress.js`, add the
  module and its carnet fields to `courses.json`, and set `live:true` on the
  hub's `SEANCES` entry (in the template). Run the headless probe on both
  editions before pushing. Séances 1–5 exist; 6–10 are `live:false`.
- **Own namespace `gen110`, prefix `gen110_`**; the rules block in
  `firebase-database-rules.json` must be deployed before the link goes to
  students. Unlisted; in `robots.txt`; the mirror entry in `/shared/config.js`
  has `lang:"fr"`, which the EN pages override through `COURSE_LANG`.

### Session parameters (for `/new-session`)

- **Language**: French and English from one template (`⟦fr⫽en⟧`), never two files.
- **Textbook**: none; copy is our own, free wording. No slides, ever.
- **Format**: 3 h 15 (Tue 13h30–16h45, break ~15h00), two blocks; 6–8
  sections = real exercises, each `.todo` → widgets → carnet → `.donewhen`;
  one synchronised quiz of 8 (`_release/wN/quiz`), one "what you keep" close.
  The skill's concept-screen order and homework page do NOT apply here.
- **Running case**: Wax & Co (boutique, Sacré-Cœur, Dakar; owner Aminata)
  when the student has no material of their own; their own project first.
- **Theme**: `/shared/themes/umef-full.css` + `ia.css` (new CSS at its end).
- **Grading**: 10 % participation · 40 % project · 50 % final exam.
- **Order of séances 5–9**: the class's ranked list above.
