# Kalaidos · Financial Leadership III (`fl3`)

Built 26 Oct 2026 as the ten-séance edition of [Kalaidos/flc](../flc/CLAUDE.md)
(read that file first: same engine, same Alpibois case, same Kalaidos look, same
probe). The school documents for this module — PEA, plan de cours, EEA + grille,
and the 2027 exam — live OUTSIDE the repo in
`~/Documents/Jan Erik/Kalaidos/Financial Leadership November 2026/`; the handover
note there, `CONTEXT_FLIII.md`, holds the coordination's deadlines and the
decisions already taken (grade the answer column; recompute, never hand-edit;
the EEA/exam coverage split).

## The module

| | |
|---|---|
| Module | « Financial Leadership III » (Comptabilité financière III) |
| Programmes | Bachelor en Business Administration (BBA) and Bachelor en Banque et Finance (BBF), 6 ECTS |
| Langue | français, partout |
| Coordination | Laïla Fournier, HES Kalaidos, filiale de Lausanne |
| LMS / exam | OpenOLAT (Zoom login there; the EEA is handed in there) · exam on **Inspera** |
| id / ns / keyPrefix | `fl3` · folder `Kalaidos/fl3` · joinCode `FLTR` · theme `kalaidos` |
| Assessment | **EEA** (exercice d'étude autonome, 100 pts, **20 %** of the grade, groups of 2–4, open book, 3–4 h, published at séance 1, due **Mon 14 Dec 2026 23:59 sous réserve de confirmation** — the official rule says 7 Dec, which is before the last session; raised with Laïla) · **written exam Mon 25 Jan 2027**, Inspera, 120 min, 120 pts, open book + calculatrice |
| Présence | aucune obligation (PEA) |

### Calendar (set by Jan Erik on 7 Nov 2026 — replaces the plan de cours draft)

| # | Date | Time | Format | Theme | Module id |
|---|---|---|---|---|---|
| 1 | Tue 10.11.2026 | 17:30–21:00 | Zoom | Introduction · Création | `w1` |
| 2 | Tue 17.11.2026 | 17:30–21:00 | Zoom | Transformation | `w2` |
| 3 | Thu 19.11.2026 | 17:30–21:00 | Zoom | Fusion | `w3` |
| 4 | Sat 21.11.2026 | 09:30–13:00 | hybride | Scission et transfert de patrimoine | `w4` |
| 5 | Sat 21.11.2026 | 14:00–17:30 | hybride | Assainissement | `w5` |
| 6 | Tue 24.11.2026 | 17:30–21:00 | Zoom | Liquidation | `w6` |
| 7 | Tue 01.12.2026 | 17:30–21:00 | Zoom | Évaluation d'entreprise | `w7` |
| 8 | Tue 08.12.2026 | 17:30–21:00 | Zoom | Comptes consolidés : fondements · BC 1 → BC 2 | `w8` |
| 9 | Thu 10.12.2026 | 17:30–21:00 | Zoom | Consolidation subséquente et éliminations | `w9` |
| 10 | Tue 15.12.2026 | 17:30–21:00 | Zoom | Mise en équivalence · préparation à l'examen | `w10` |

The plan de cours sent to the school (Sept 2026) had S2 Thu 12.11, S3 Tue
17.11, S7 Thu 26.11, S8 Thu 10.12 and S9–S10 on Sat 12.12 (hybride); Jan Erik
replaced those on 7 Nov 2026. One hybrid Saturday only (21 Nov); S9 and S10
are Zoom evenings now (their block times and "Rue de Bourg" lines were
changed). The Saturday is ONE entry on the school landing page ("Séances
4–5 · 09:30–17:30"): `/Kalaidos/index.html` merges same-course same-day
sessions; the hub keeps one card per page.
⚠ **EEA deadline conflict (open, 7 Nov 2026):** the remise stays Mon 14 Dec
2026 23:59 (the coordination's "Monday of the last course week" rule), but
séance 10 — which takes EEA questions — is now Tue 15 Dec, the day AFTER.
The pages say "remis la veille"; Jan Erik to settle with Laïla Fournier
(move the remise, or move the EEA questions to séance 9).
Évaluation (séance 7) still comes before consolidation: it is independent,
and EEA §§ 1–6 are feasible before séances 8–9. There is NO two-week break
any more — every "pause de deux semaines / 26 novembre" line was rewritten.
A date change touches courses.json `schedule`, the hub's `SEANCES`, each
page's eyebrow, the "Avant la séance N" lines, séance 1's plan table,
`seance1-slides.html` (slides 4 and 21) and presence.js `SESSIONS` — together.

### EEA milestones the pages must mention (plan de cours, "Jalon EEA")

S1 publication of the EEA · S2 § 1 réalisable · S3 § 2 · S5 §§ 3–4 · S6 § 5 ·
S7 § 6 · S8 § 7.1 · S9 §§ 7.2–7.3 · S10 remise lundi 14 décembre 2026 23:59.
The EEA is on OpenOLAT, not on this site. **Never put EEA or exam content,
cases or figures on a page**: the EEA's companies are Sandra Berset, Alpina/
Bornand, Alderis, A-SA/B-SA, Schaffter Pives, M/T — do not reuse their names
or numbers; the course case is Alpibois.

## Teaching design — one theme per séance, 3 h 30, two parties

Each séance page = `seanceN.html` on the flc engine (`bloc.js`, `fl3.css`,
no skin: the school's `kalaidos.css` was dropped on 7 Nov 2026 — see below).
`DAY.blocks` = two parties (`17h30–19h00` / `19h15–21h00`; Saturdays
`09h30–11h05` / `11h20–13h00` and `14h00–15h30` / `15h45–17h30`). Every section
is 🎤 exposé (written in full), 🛠 atelier (students work, in pairs in Zoom
breakout rooms) or ✅ quiz (eight questions, launched in class). A 3 h 30
session on ONE theme goes deeper than the FL&C bloc did: reuse the FL&C
sections (copy the HTML + JS of the matching `flc/blocN.html` sections, keep
the same widget ids where convenient, keep the same verified figures) and ADD
the depth the plan de cours lists — every new figure recomputed in
`_private/check_sN.py` (not tracked) before it goes on the page.

| Séance | Reuse from flc | Add (new, verified) |
|---|---|---|
| 1 | b1 §1.1 (vie juridique, 8 étapes, SA/Sàrl), §1.2 (fonder Alpibois SA: 5 écritures, bilan, rapport) | the module/EEA/exam intro section; fondation d'une société de personnes (SNC: apports, comptes capital/privé); émission au-dessus du pair (agio → réserve légale issue du capital, 671 CO); quiz |
| 2 | b1 §1.3 (Charpente Muller Sàrl → SA) | **bilan de transformation d'une entreprise individuelle en SA** (the exam-typical exercise: valeurs économiques, réserves latentes dissoutes, goodwill reconnu, prélèvement privé — new fictional firm, every line a numeric check); neutralité fiscale (art. 19 LIFD personnes physiques / 61 LIFD, délai de blocage 5 ans); LFus 53 ss procedure; quiz |
| 3 | b2 §2.3 (LFus, compte Fusion), §2.4 (fusion entries) — **valuation is séance 7**, so the exchange ratio here comes from GIVEN valeurs intrinsèques (substance + réserves latentes), not praticiens | rapport d'échange from intrinsic values; **ajustement de la valeur de l'action** (actions gratuites / dividende / augmentation sous le pair: émission price, DPS formula) with new numbers; fusion par combinaison; soulte ≤ 10 % (7 al. 2 LFus); bilan de fusion; quiz |
| 4 | b2 §2.5 (classify restructurations), the LFus table | scission par division vs séparation, symétrique/asymétrique (a bilan de scission exercise on Alpibois Design SA: two business units, allocation of assets/debts/capital), contenu du contrat de scission (art. 37 LFus), only sociétés de capitaux/coopératives (30 LFus); transfert de patrimoine (69–77 LFus: inventaire, contrepartie to the company, 71 al. 2 excédent d'actifs); Jeopardy `?set=sam` at the end of the morning or afternoon of 21 Nov |
| 5 | b1 §1.4 (725/725a/725b/725c), §1.5 (negotiation + compte Assainissement) | augmentation de capital avec agio and conversion de dettes en capital (émission 120 %: nominal + agio), postposition, **bilan après assainissement** (the EEA-style "bilan AVANT / mesures / bilan APRÈS" shape, new numbers), quiz |
| 6 | b1 §1.6 (liquider Alpibois Export Sàrl, 745) | full liquidation of an SA with **compte de résultat de la période de liquidation and bilan de clôture** (new numbers; reprise d'actifs par un créancier, dissolution des provisions, frais), répartition and impôt anticipé, SA vs Sàrl formalities; quiz |
| 7 | b2 §2.1 (five methods), §2.2 (deux experts: Alpibois/Jorat praticiens, DCF, EVA, sensitivity) | interpretation of goodwill and of the 2:1 weighting (why rendement twice), multiples, a fourchette exercise; quiz |
| 8 | b3 §3.1 (groupe, 963/963a/963b), §3.2 (périmètre), §3.3 (capital consolidation), §3.4 (Charpente Muller 80 %: goodwill, minorities, ROE) | **BC 1 → BC 2 apurement** (new numbers: stock undervalued by a fraction, immeuble at current value with 40-year depreciation, an unbooked intangible, réserves issues du capital vs du bénéfice split at acquisition — the EEA 7.1 shape, different company and numbers); badwill; quiz |
| 9 | b4 §4.1 (éliminations), §4.2 (the interactive worksheet, `buildWorksheet`) | goodwill subséquent under RPC (activation vs compensation), bénéfice intermédiaire with a <100 % subsidiary split PMC/PMB on the recipient's shareholding, élimination des dividendes internes; quiz |
| 10 | b3 §3.5 (mise en équivalence), b4 §4.5 (exam prep → 25 Jan 2027, Inspera, EEA questions) | equity method with réserves latentes and a loss year (value can fall), goodwill in the equity value amortised; révision Jeopardy `?set=rev`; final quiz; EEA remise reminder |

Conventions that carry over unchanged: factual teaching register (no "I");
Swiss numbers (`fmt()`); current CO numbering (725a/725b/725c, one FOSC
publication, no "reprise de biens"); a profit-affecting consolidation entry is
booked ONCE (the worksheet takes the balance-sheet profit from the income
statement — say so in §8/§9 as b3 §3.3 does); every `data-work` field id is
`wN_<slug>` and must be listed in courses.json `project.sections`; `secCheck`
marks a section only when its counted widgets are done.

## Engine notes

Identical to flc (see its CLAUDE.md § Engine): `bloc.js` (buildClassify,
buildNum, buildSteps, buildPick, buildQuiz, buildJournal, buildWorksheet,
timers, `window.FLC_ITEMS` for the probe), `fl3.css`, `presence.js`
(SESSIONS w1…w10), `courseprogress.js` (CHAPTERS w1…w10 — `total` = that
page's SECTIONS.length, set when the page ships), `jeopardy.html` (`?set=sam`,
`?set=rev` — rewrite the sets for this course's ten séances), `admin.html`.
Hub `index.html` renders the ten séances from its `SEANCES` array.
**T-accounts under a journal (17 Nov 2026)** — Jan Erik: "show the actual
accounts and their amounts/transactions". `buildJournal(box, ACCOUNTS, ITEMS,
TA)` takes an optional fourth argument `{open:{acc:n}, side:{acc:'A'}, lead,
bilan, bilanTitle}` (side defaults to passif): one T-account per dropdown
account (all of them, so no hint) with the opening balance, each entry once
RIGHT with its letter, the entry being composed in dashed grey (not
counted), the closing balance on the smaller side; `bilan:true` adds the
balance sheet after the right entries. This bloc.js is fl3's own copy (flc
does not have it). Sides: A actif, P passif, C charge, R produit, X compte
de passage. Used in séance 2 (`trJournal` — its dropdown now holds every
account of the Charpente Muller balance sheet so the bilan balances — and
`btJournal`), séance 3 `fuJournal`, séance 4 `scJournal` (with bilan) and
`tpJournal`, séance 5 `asJournal` and `vaJournal`, séance 6 `coJournal`.
`bilan` is left OFF where a later numeric question asks for the balance
sheet (bfNum, asNum, vaNum, coRes, liqNum). Séance 6 `liqJournal` booked
only the gains and losses; on 17 Nov 2026 it got the missing entries (the
three cash receipts, the vehicle loss: ids lj6–lj9, letters a–i, the old
ids kept so saved progress stays) and then its T-accounts. Verified 17 Nov 2026 by solving every
entry headlessly: each closing balance equals the page's own answers.
Probe: `node probe.js fl3/seance1 [shots]` from the scratchpad probe folder,
with `python3 -m http.server 8765` running from the repo root.

⚠ The rules block `fl3` in `firebase-database-rules.json` must be DEPLOYED
before the link goes to the students (10 Nov 2026).

## Built 26 Oct 2026 — what shipped and how

All ten pages exist and pass the probe (every atelier section ✓; quizzes
locked until launched; reading sections 2.3, 3.1, 3.3, 8.5, 10.3 mark on
« Suite »). Totals in courseprogress.js: w1 6 · w2 5 · w3 6 · w4 7 · w5 6 ·
w6 6 · w7 6 · w8 7 · w9 6 · w10 7. Carnet fields (`wN_*`) are all listed in
courses.json `project.sections`. Jeopardy sets `sam` (séances 1–4, linked
from 4.7) and `rev` (ten séances, linked from séance 10).

Pages were written by three parallel forks from the plan above; two left a
rebuild script: `_private/build_s456.py` (S4–S6 splice the reused flc
sections by marker comments — rerun it if those flc sections change) and the
scratchpad's `build_s7_10.py` (not kept). New cases, all figures asserted in
`_private/check_sN.py`: S1 SNC Favre & Dumont, Vitrerie du Léman SA (agio);
S2 Carrosserie Berney (entreprise individuelle → SA, capital propre 629'000);
S3 Alpibois absorbs Jorat from GIVEN valeurs intrinsèques (5:4, agio
1'250'000 — flc's bloc 2 books the same merger at book values, agio 850'000;
the page says why), Clos des Roches / Cave de Bonvillars (ajustement, E = 24),
Bois Romand SA (combinaison); S4 scission of Alpibois Design SA into Design
Mobilier SA / Design Bureaux SA, vehicle-fleet transfert; S5 Menuiserie
Vallotton SA (AVANT 3'050 → APRÈS 2'660); S6 Ébénisterie Corboz SA (résultat
de liquidation 33'000, 768 par action); S7 Jorat multiples; S8 Vuilleumier
Escaliers SA BC 1 → BC 2 (BC 2 total 694), badwill −35; S9 flc's 2028
worksheet + upstream intermediate profit 80/20; S10 Transports Bovay SA 30 %.

⚠ **Art. 725c (checked 26 Oct 2026):** the revaluation amount is "inscrit
séparément dans la réserve légale issue du bénéfice" — it is INSIDE the RLB,
so it COUNTS in the 725a threshold (½ × CA + RLC + RLB). flc bloc1 and
fl3 seance5 were corrected; never write "n'entre pas dans le calcul".

Law citations the forks wrote from memory and nobody fetched (verify before
10 Nov if in doubt): LFus 31 al. 2, 37, 41, 43 al. 3, 45–47, 54, 58–66, 69–77;
CO 533, 568, 634a, 653p, 826 al. 2; LIFD 19 al. 2. S10 prints the grade as
EEA 20 % + exam 80 % — the 20 % is not yet confirmed by the coordination.

Not yet done: a `sam` Jeopardy link from the hub (only from 4.7); PDFs of the
séances (mfb545 has a `_build/pdf.py` to copy if wanted); the `fl3` rules
block is NOT deployed.

## 7 Nov 2026 — the look, the dates, and séance 1 completed

- **The HEG look, in teal** — in two steps the same day. First Jan Erik
  asked for the SUMAS structure with the Kalaidos skin kept and the school's
  links/address/name removed; then, seeing it: "I really do not like this
  style. keep the colours, but use the rest from the HEG style." So:
  **no page loads `/Kalaidos/kalaidos.css` any more** (Barlow, square cards,
  dark strips, teal bands — kept on disk, unused). The séance pages simply
  lost the `<link>` and `class="kal-bloc"`: `fl3.css` IS `HEG/statistics/
  stats.css` recoloured (its one Georgia-headings override, inherited from
  UMEF, was removed too — HEG headings are sans 800). The hub is the HEG hub
  verbatim (its `.nav` with who/👁/tag/"← Tous les cours", `.phase` labels,
  `.plead`, the rounded `.card` grid with `mnum`/`mk`/`date`/`ch`/`dec`/
  `badge`, a dashed `.card.exam`). `/Kalaidos/index.html` is `/HEG/index.html`'s
  CSS and card markup (Georgia h1 on the landing, as HEG's) with
  `kalaidos-full.css`; sessions are `.card.sess` with the date as a hot
  chip, the same-day merge kept. The deck uses the Helvetica stack. Still
  true: no kalaidos-fh.ch / CampusNet links, no Rue de Bourg, no school
  name in `<title>` or eyebrow (séance and bloc titles end "· Jan Erik
  Meidell"); the small logo in the bar is the one identity mark — one line
  to remove if wanted.
- **Checked against the approved exam (variantes A/B, 25 Jan 2027, 120 min,
  120 pts: 50 cas particuliers · 50 consolidés · 20 évaluation)** — the hub's
  exam panel and séance 1's table now print the three section weights; the
  Inspera question types listed match the paper. ⚠ The EEA weighting 20 %
  (and so "examen 80 %") is still the 2025 figure, not in the plan de cours
  or PEA — unconfirmed by the coordination.
- **Séance 1 now has** (Jan Erik's checklist: 2 videos, 1 reading, home
  exercises, 3–4 last-hour exercises, slides, widgets): two YouTube videos
  on the home screen with runtimes read from YouTube's own metadata —
  STARTUPSTV, *Créer une SA (société anonyme) en Suisse: Guide de Startups.ch*
  (`pNL7LIeTPos`, 9:17, Nov 2025) and Ingenious Finance, *Comment Créer Sa
  Société en Suisse (SA/Sàrl) ? Guide Complet* (`FKJhtsfDYS4`, 26:19, Apr
  2024) — entrepreneur's-eye views, framed as such; the reading (CF3 chap.
  2) plus "faire les exercices du chapitre" and a three-item warm-up
  `homeNum` (h1–h3, NOT counted); the last hour **1.6 = four exercises**
  (A Vitrerie du Léman SA agio · B Ferblanterie Gilliéron SA libération
  partielle 50 %/100 % · C Ébénisterie Grandjean SA apport en nature with a
  170'000 hypothèque reprise, apport net 250'000 · D Jardins Chuard Sàrl
  parts at 125 %), ids `bj/bn`, `cj/cn`, `dj/dn`, all asserted in
  `_private/check_s1.py`; the SNC Favre & Dumont atelier is 1.5 on its own;
  the quiz is 1.7 (a new Q6 on the hypothèque). Sections 6 → **7**
  (`courseprogress.js` w1 total 7). Deck `seance1-slides.html` (22 slides,
  Kalaidos palette, the green-ai engine; `S` = notes, `#n`), linked 🖥️ in
  the topbar; the hub's séances note points to it. The "Avant la séance 2"
  line now says "faire les exercices du chapitre 4" too.

## 10 Nov 2026 — the EEA integrated into the séances

Jan Erik: "L'EXERCICE D'ÉTUDE AUTONOME (EEA) — make that integrated on the
site, as a part of the sessions (suggest exercises and project after every
session)". He first also asked for a 15-minute break every 60 minutes, then
withdrew it the same message thread: **the timetable is unchanged** (two
parties, one 15-minute pause). Séances 1–9 each end on a new section
**N.x · Après la séance — Projet EEA** (mode `eea`, `min:0`, block 2, so no
class time moves): why this section of the EEA is doable now; the EEA
calendar (`renderEeaCal`, the current séance highlighted, remise
14.12 23h59 *sous réserve*); "le projet de la semaine" — three steps, three
counted ticks (`buildTicks`, ids `ea1–ea3`) and a group notebook `wN_eea`
(in courses.json `project.sections`); "exercices suggérés" — the textbook
chapter, the page's own ateliers to redo, an exam pointer; and the "Avant la
séance N+1" lines that used to sit in the small "Jalon EEA" cards, which are
gone (séance 7's still spoke of the "interruption de deux semaines" and
séance 9's of a séance 10 "à 14h00" — both outdated, both removed). The
previous last section's "Menu" button now reads "Suite : le projet EEA →".
Séance 10 has no new section (the EEA is handed in the day before; its 10.5
"Vos questions sur l'EEA" stays). Engine: `MODES.eea` (🎓, purple chip),
`EEA_PLAN`, `renderEeaCal`, `buildTicks` at the end of `bloc.js`; styles at
the end of `fl3.css`. courseprogress totals +1 for w1–w9. The rule holds:
**the pages name each EEA section's topic and points, never its cases,
companies or figures.** Probed headlessly: every séance's EEA section is
reached from the previous section, completes on three ticks + the notebook,
moves the bar, no errors.


## 10 Nov 2026 — the slides as a PDF download

Jan Erik: "add the function to download the slides". Each deck
`seanceN-slides.html` is printed to **`files/seanceN-slides.pdf`** by
`python3 _build/slides_pdf.py` (headless Chrome, the deck's own `@media print`:
one slide per 1280×720 page, no speaker notes, no counters). **Re-run it after
every deck edit**, or the PDF is stale. A new deck needs: the same `@page` /
`@media print` block and `.dl` button (copy from seance1-slides.html, change
the file names), and a `⬇ PDF` link beside `🖥️ Diapositives` in that séance's
topbar. Links today: the deck (top-right "⬇ Télécharger en PDF"), seance1's
topbar, the hub's "Avant chaque séance" note. Fixed the same day: `ol.steps li`
was `display:flex`, which split a sentence with a `<b>` into columns (slide 10);
`.define` was held at 28ch by `.slide p`.

## Whole-class ateliers, harder and longer séances (17 Nov 2026)

Jan Erik: "we do not need this [pairs / breakout rooms]. there are too few students. I will ask the questions and they will answer", then "raise the difficulty 20 % for the whole course … add 30 % more material for each session". Every atelier label reads « Avec la classe » (no « À deux », no « sous-groupe ») in séances 2–10, and pair-role instructions were rewritten for the whole class; séance 1 (already taught) kept its wording. Séances 2–10 each got a harder second case or variant per atelier and three harder quiz questions (8 → 11). New ids only (old ids, answers and figures untouched, so saved progress holds); each new id is in `secCheck`. Every new amount and entry was checked in headless Chrome against the page. Notable additions: s2 Menuiserie Rochat (dividend + 35 % impôt anticipé, partial 652d conversion, agio), Berney share price and the neutral variant; s3 a participation already held (bénéfice de fusion, art. 61 al. 5 LIFD), Clos des Roches' merger after the adjustments; s4 Design Bureaux entries, rebalancing the asymmetric split, Léman Fleet's side (goodwill); s5 two variants of the Alpibois Design package, Vallotton's 725b test at both values; s6 capital-contribution reserves, Corboz closing entries to zero; s7 Jorat's WACC and the DCF at 10 %, the negotiated price read as multiples; s8 BC 2 reading and 2028 effect, Charpente Muller 2028; s9 an intragroup machine sale (upstream); s10 a sale to the associate, Bovay 2029, exam d'essai 15 → 21 points.
`jeopardy.html?set=s12` = sessions 1–2, individual players (+ / − a player); the hub menu lists both sets. bloc.js: an expense account (`side:'C'`) with an opening balance now opens on the debit side.

## Séance 2 deck and "↺ Recommencer cette section" (17 Nov 2026)

Jan Erik: "create a pdf for session 2 as for session 1. add a button to reset the values/filled in fields on a section — so that they can do it again".
- `seance2-slides.html` (25 slides, séance 1's engine) → `files/seance2-slides.pdf` via `_build/slides_pdf.py`; 🖥️ / ⬇ PDF in seance2's topbar. The workshop slides give the data, the questions and the entry patterns WITHOUT amounts: the PDF goes to students, the answers are on the page (and in the private key `_private/seance2-corrige.pdf`).
- ⚠ Fixed in both decks: the download button's `.dl` rule also hit the calendar's highlighted row `li.dl` (fixed on screen, hidden in print), so séance 1's PDF had lost its "dernière heure" row. The button rules are now `a.dl`.
- bloc.js: every builder registers what it stores (`regReset(box, steps, picks, cls)`); `mountResets()` puts "↺ Recommencer cette section" above `.nav-foot` in every section holding a widget or a `[data-work]` field. `resetSection(id)` clears, on this device, the steps and `progress.picks` of the widgets INSIDE that section, its `done` mark and its text fields, then reloads on the same section (`sessionStorage fl3_reopen_<mod>`). The database keeps what was already sent. Probed headlessly on seance2: 2.2 emptied, 2.4 kept, reopened on 2.2.

## Samedi 21 Nov 2026 — `samedi.html`, two exposés and four cases (built 20 Nov 2026)

Séance 3 (fusion, Thu 19 Nov) was CANCELLED; no replacement date yet (the hub note and
samedi.html say it will be announced). Jan Erik for the Saturday: "I can only explain max
2 x 1.5 hours. the rest needs to be cases where they solve this individually and or in chat
rooms and then come back and show their results … at least 4 full hours of 3-4 cases that
includes what we do on Saturday and what we've done so far — maybe not using the same example".
- `samedi.html`, module **`ws`** (courses.json modules + project section `sam`, fields
  `ws_cas1…4`; `courseprogress.js` chapter `opt:true`, so it does not lower anyone's course %;
  menu tool; a note on the hub; a card on seance4/seance5 home). No presence slot: presence
  stays on seance4 (w4) and seance5 (w5). The exposés are 4.1 + 4.4 and 5.1 + 5.3.
- ONE new fictional firm, **Cafés Cuendet** (Hélène Cuendet 75 %, Marc Tissot 25 %), every
  figure asserted in `_private/check_samedi.py`. Cas 1 (S1+S2, CHF): entreprise individuelle
  → SA, capital propre de transformation 375'000, 3'000 actions, investor in at the valeur
  intrinsèque 125 (at par Hélène loses 18'750), opening bilan 662'000. Cas 2 (S4, KCHF):
  scission par SÉPARATION booked in BOTH companies (actif net 300, agio 200, bilan après
  1'540), asymmetric at REAL values (Tissot 375, soulte max 30, 75 of cash reattributed),
  transfert de patrimoine for 380 (gain 80). Cas 3 (S5, KCHF): Boutiques Cuendet SA, fonds
  propres 140 < seuil 180, −60 after value corrections (surendettement), 725c would give 40
  against a seuil of 230; twelve entries, bilan après 1'245, fonds propres 385. Cas 4:
  twelve points of a file to check (9 wrong, 3 right) + seven corrected amounts, S1/S2/S4/S5.
- Each case ends on a `.montre` card "Retour en classe · ce que vous montrez" (what to
  share, what to say, one text field, `data-board` for the anonymous screen). No minute
  timings on the page. No fusion in any case.
- Tested headless 20 Nov 2026 (1280 and 390 px): every amount and entry solved, the four
  drawn balance sheets balance, the passage accounts end at zero, four sections complete,
  no page error, no sideways scroll.

### ⚠ The four cases moved INTO séances 4 and 5 (20 Nov 2026, evening)

Jan Erik, on seeing the separate page: "integrate the cases into the planning of séance 4 and 5 —
not on separate pages". `samedi.html` is now a redirect (to seance4.html; `#s3`/`#s4` → seance5.html);
module `ws` left courses.json and courseprogress.js. The section ORDER of both pages changed, the
section IDS did not (saved marks hold):
- **Séance 4** — Partie 1: 4.1 scission (s1), 4.2 transfert (s4), both exposés · Partie 2: 4.3 cas 1
  (s9, field `w4_cas1`), 4.4 cas 2 (s10, `w4_cas2`) · « Après la séance · ou en classe s’il reste du
  temps »: 4.5 (s2), 4.6 (s3), 4.7 (s5), 4.8 quiz (s6), 4.9 Jeopardy (s7), 4.10 EEA (s8). Total 10.
- **Séance 5** — Partie 1: 5.1 (s1), 5.2 agio/conversion/postposition (s3) · Partie 2: 5.3 cas 3
  (s8, `w5_cas3`), 5.4 cas 4 (s9, `w5_cas4`), 5.5 fin du samedi (s6) · après: 5.6 (s2), 5.7 (s4),
  5.8 quiz (s5), 5.9 EEA (s7). Total 9.
- bloc.js: a block may carry `label` (replaces « Partie n » in the menu). No minutes on these two
  pages' chips (`min:0`). Every nav-foot was rewritten to follow the new order (the old Back/Next
  targets were wrong in several sections). Widget ids of the cases are unchanged (ca/cj/ci, cb/ja/jb/
  cy/ct, cd/jc/cp, ck, `dosRows`), so `_private/check_samedi.py` and the corrigé PDF still apply.
- Tested headless (1280 and 390 px): all four cases solved inside the séance pages, sections mark,
  Next chain = menu order, no page error, no sideways scroll.

### Decks for séances 4 and 5 (20 Nov 2026) — GENERATED, light, with a "where on the site" band

Jan Erik: "slides for both session 4 and 5 for the part where I teach … make it very clear on the
slides where they are in the sessions, so that they can look at the site instead of the slides …
very easy to read for me". `_build/slides_s45.py` writes `seance4-slides.html` (25 slides) and
`seance5-slides.html` (21); then `python3 _build/slides_pdf.py seance4 seance5`. **Edit the
generator, never the two HTML files.** Unlike the dark decks of séances 1–2: white background,
very large type that scales with the screen's width AND height (`fit()`), and on every content
slide a dark band naming the section and the CARD of the séance page with the same text, plus a
strip of the séance's steps (4.1 · 4.2 · Cas 1 · Cas 2) with the current one highlighted. Only the
taught sections (4.1, 4.2, 5.1, 5.2) are covered; the cases get one "open section 4.3 / do this"
slide each and a "retour en classe" slide — no case data, no answers. The three worked examples
(agio de scission 500/300/200, transfer gain 450/520/70, 725a threshold 250 vs 180) are INVENTED
for the slides and labelled so; they are not the cases' figures. `S` shows the "à dire" notes.
Linked 🖥️ / ⬇ PDF in both topbars. Measured headless at 1280×720, 1440×900, 1024×768: no slide
overflows.

### 21 Nov 2026 (morning of the Saturday) — 4.6 and 4.7 back in class, widgets, tables

- Jan Erik, after teaching 4.1 and 4.2: "add in again 4.6 and 4.7 (with the exercises) into this
  morning's exercise and slides". Séance 4's Partie 2 is now 4.6 Alpibois Design SA (s3) → 4.7 parc de
  véhicules (s5), both "avec la classe", THEN 4.3 cas 1 (s9) → 4.4 cas 2 (s10). After: 4.5, 4.8–4.10.
  The deck (`_build/slides_s45.py`) has six slides for them (data, inventory, tasks, asymmetric variant,
  the transfer, Léman Fleet's side) — data and questions only, no answers. "It does not matter if I
  cannot keep the time plan" (Jan Erik): the plan is an order, not a clock.
- `viz45.js` (loaded deferred by seance4/5): one or more VISUAL widgets per taught card, drawn into
  `<div class="vz" data-vz="NAME">`. 4.1 restruct (six operations before/after), scission (division/
  séparation × symétrique/asymétrique), procedure (six steps; the creditors' step moves for a fusion),
  agio4 (sliders); 4.2 transfert (sliders, art. 71 al. 2 check, the passage account); 5.1 diag (seuil
  250), reeval (725c raises the threshold too), assain (tick measures until the Assainissement account
  balances); 5.2 emission, conversion, postpo. Invented KCHF examples, labelled. They count NOTHING
  (no .q/.cl-row/[data-work]/need()) — checked: totalSteps unchanged (126 / 120).
- Text tables: `table.fx.txt` (left-aligned) and `.law` (the article column never wraps) — Jan Erik:
  the LFus column of the 4.1 table was too narrow.
- ⚠ **Séance 4 renumbered top to bottom (21 Nov 2026)** — Jan Erik: "make the numbering right … numbers
  from top to bottom". Plan order = number order: 4.1 scission (s1) · 4.2 transfert (s4) · 4.3 Alpibois
  Design (s3) · 4.4 parc de véhicules (s5) · 4.5 cas 1 (s9) · 4.6 cas 2 (s10) · 4.7 classement (s2) ·
  4.8 quiz (s6) · 4.9 Jeopardy (s7) · 4.10 EEA (s8). IDs unchanged. The lines above that name 4.x
  numbers from 20 Nov use the OLD numbering.
- ⚠ **Séance 5 done the same way (21 Nov 2026)** — Jan Erik: "re-introduce exercises to each block just
  as in section 4. they really liked session 4". The two ateliers moved from "Après la séance" into
  Partie 2, before the cases: 5.1 diagnostic (s1) · 5.2 mesures (s3) · 5.3 Alpibois Design, avec la
  classe (s2) · 5.4 Menuiserie Vallotton, avec la classe (s4) · 5.5 cas 3 (s8) · 5.6 cas 4 (s9) · 5.7
  fin du samedi (s6) · 5.8 quiz (s5) · 5.9 EEA (s7). IDs unchanged, totalSteps still 120. The deck got
  nine atelier slides (data, the four steps of each atelier, answers in the speaker notes); 31 slides.
  The step labels of séance 5 lost their "· N min" (WRITING.md rule 7). The deck's 820 px one-column
  rule is now `screen` only: the PDF printer's narrow window had stacked every two-column slide.
  Part headers (`.part-head`) wrap at ≤640 px (the long "Après la séance" label scrolled sideways).
- Teacher key for both séances and the four cases: `_private/build_s45_corrige.py <k45.json>` →
  `_private/seances4-5-corrige.pdf` (25 pages; k45.json = the pages' own answers, dumped headlessly).
- ⚠ **The solutions of cases 1 and 2 are PUBLIC on seance4.html (21 Nov 2026)** — Jan Erik: "put the
  solution of case 1 and 2 on the site - so that they can see and learn". A folded card
  `<details class="card corr" id="corrige1|2">` at the end of sections 4.5 and 4.6 (before the
  sec-status), between `<!-- corrige:casN -->` markers, generated by `_private/corrige_cas12.py` from
  `_private/samedi-corrige.html` (re-run after editing the key; it replaces the block). Student wording:
  "Les erreurs les plus fréquentes…", "Pour vérifier que vous avez compris…", "Une bonne réponse." The
  data cards are stripped (they are on the page above). On ≤640 px the tables become stacked cards
  with the column name before each value. Counts nothing (totalSteps 126). Cases 3 and 4 stay private.

## 23 Nov 2026 — séance 6: a third case, and a fixed footer

Jan Erik: "add one extra case at the end (a bit more difficult and if time
allows)". **Section 6.5 · Scierie Duboux SA** (id `s8`, placed between 6.4
and the quiz, which became 6.6; fin 6.7, EEA 6.8; `total` 8 in
courseprogress.js): a liquidation that ends ABOVE the nominal — immeuble sold
720'000 with the hypothèque 300'000 taken over by the buyer, a participation,
a provisioned lawsuit settled by transaction (19'000, 6'000 dissolved), a
contested claim of 14'000 CONSIGNED (art. 744 CO, booked as a loss), then
the closing with the withholding tax booked: `dxJournal` (11 entries, with
T-accounts), `dxNum` (6: transaction 6'000, losses 42'000, result 155'000,
bank 537'000, excédent 192'000 = 537 − 300 nominal − 45 RLC confirmed by
the AFC, net 1'566 per share), `dkJournal` (10 closing entries: Actionnaires
537'000, Impôt anticipé dû 67'200, net 469'800; every account ends at 0 —
verified headlessly). Figures in `_private/check_s6b.py`. The case counts in
the bar like any section (bloc.js counts every registered step), so a class
that skips it stays under 100 % for séance 6 — accepted. Also fixed: 6.2's
footer went to s5/s7 (a leftover of the Saturday splice); it now goes to
6.1 and 6.3.

## 24 Nov 2026 — the EEA leaves the séances; the énoncé is on the hub

Jan Erik: "remove the EEA exercise from the courses and attach instead the
EEA pdf on the landing page with the instructions to sign up and hand this in
on Open Olat". The nine **« Après la séance — Projet EEA »** sections of
10 Nov 2026 are GONE (ticks `ea1–ea3`, notebook `wN_eea`, `renderEeaCal`):
their *Exercices suggérés* and *Pour la suite* cards moved to the end of the
preceding section (before its `.sec-status`), whose "Suite : le projet EEA →"
button is "Menu de la séance" again. Engine: `MODES.eea`, `EEA_PLAN`,
`renderEeaCal` and `buildTicks` removed from `bloc.js`, the `.eeacal`/`m-eea`
rules from `fl3.css`; courseprogress totals −1 for w1–w9; the `wN_eea` fields
(w1–w9) left courses.json's `project.sections` (`w10_eea`, the questions
field of 10.5, stays). Séance 4's and 5's "Après la séance" lines and
`seance5-slides.html` / `seance1-slides.html` no longer name a section 4.10
or 5.9 (both PDFs re-printed). The hub's `#eea` panel now holds
**`files/EEA_FLIII_2027.pdf`** (the énoncé, 14 pages, a `.dlbtn`) and four
numbered steps: download and read it, form the group and **sign up on
OpenOLAT** (grille there, hand-in there), write in the answer column with
every name on the cover, every member uploads before Mon 14 Dec 2026 23:59.
⚠ The énoncé is therefore PUBLIC on the web root — the rule "never put EEA
content on a page" now means the SOLUTIONS and the grille, which stay
outside the repo. The hub cards' "EEA § n réalisable" lines and séance 10's
10.5 "Vos questions sur l'EEA" are unchanged. Probed headlessly: ten pages,
SECTIONS.length = the new totals, no dead `data-next`, no `m-eea`, no
errors, no sideways scroll at 1280 and 390 px; the hub serves the PDF.

## 24 Nov 2026 — séance 6: the deck and the transcript

Jan Erik, the afternoon before the séance: "faites-moi un transcript et
faites aussi des diapositives".
- **`_build/deck.py`** now holds the light deck engine (CSS, keyboard/click/
  swipe JS, `fit()`, `esc()`, `Deck`) that `slides_s45.py` used to carry;
  `slides_s45.py` imports it and regenerates séances 4–5 byte-identically.
  `Deck(n, strip, gen='slides_s45.py')` — `gen` names the generator in the
  HTML comment. ⚠ Edit the generators, never the generated decks: this
  morning's EEA edit made on `seance5-slides.html` was lost at the next
  regeneration and had to be re-done in `slides_s45.py`.
- **`_build/slides_s6.py` → `seance6-slides.html`** (32 slides) →
  `files/seance6-slides.pdf`. 6.1 in full (six steps; dissolution; the
  one FOSC publication and the two art. 745 delays; the realisation
  table; one account vs two; the excédent and the 35 %; the Sàrl; the
  classify); each atelier = data, the operations, the ENTRY PATTERNS
  without amounts, an « À vous » slide; the amounts live in the speaker
  notes (S). Measured headless at 1280×720, 1440×900 and 1024×768: no
  slide overflows (slides 7, 9 and 25 were shortened for the tall ratios).
- **`seance6-transcript.html`** — the words to say for each of the 32
  slides, in spoken French, with the answers of every atelier in yellow
  boxes (the entries and amounts of 6.2, 6.3, 6.4, 6.5, the quiz key) and
  cues (timing, the pause, "if Duboux is skipped go from slide 25 to 31").
  About 6 400 words. `noindex`. Linked from seance6's topbar as
  **📄 Transcript, visible only on a device holding `jem_fb_session` (or
  `jem_instructor`)** — ⚠ `jem_instructor` alone is NOT enough on a bloc
  page: `admin-gate.js` clears it when no session is held, so the probe
  must set `jem_fb_session`. The three topbar links (🖥️ Diapositives, ⬇
  PDF, 📄 Transcript) hide under 700 px like séance 5's.

- **Teacher key for séance 6 (24 Nov 2026)**: `_private/build_s6_corrige.py` (reads
  `_private/k6.json` = the page's own widgets dumped headlessly by wrapping
  `buildNum`/`buildJournal`/`buildClassify`/`buildQuiz` in bloc.js, plus the data cards and the
  written questions) → `_private/seance6-corrige.html` → headless Chrome →
  `_private/seance6-corrige.pdf` (14 pages; a copy went to Jan Erik's Desktop as
  `FL3-seance6-corrige.pdf`). The T-accounts and the "soldes après" tables are COMPUTED by the
  builder from the opening balances and the entries (`EXTRA_OPEN` adds the opening accounts a
  journal does not list — Corboz's perte reportée, Duboux's two reserves — so the tables balance:
  108, 348'000, 711'000). A model answer for `w6_repartition` (no excess → no withholding tax;
  a private capital loss is not deductible, a business one is). Re-run both steps after editing
  the page's figures.

- **La révision · the Kahoot-style game (24 Nov 2026)** — Jan Erik, after séance 6: "a new game
  where they click individually on 4 buttons (a,b,c,d) on timed questions (10 sec) to do revision
  on 1,2,4,5,6 from easy to difficult … a leader à la kahoot", "on the landing page, to be played for
  approx 20 mins". `revision.js` = the bank (30 questions, three tiers of ten: lvl 1–2 at 20 s,
  lvl 3 at 30 s because they compute (10 / 20 until Jan Erik asked for ten more seconds the same night); `REV_TIME`, `REV_POINTS` = 500 + 500 × time left ÷ time,
  0 if wrong). `revision-tv.html` (instructor's screen, needs the account like board.html): *Nouvelle
  partie* writes `fl3/_release/revision/state` = {g, q, phase lobby|q|rev|end, started, ts};
  *Lancer* → phase q, the screen counts down, polls every player's `<sid>/kahoot/<g>.json` each
  second (sids from a shallow read), at zero waits 1.2 s for slow phones, reads once more and
  writes phase rev: the A–D split with the right one framed, the explanation, the top ten (↑ in
  green when a player climbed); *Suivante*; after question 30, phase end and the podium. Space or
  → = the next action. `revision.html` (players, course sign-in required, `fl3_auth`): polls the
  state every second; on a question, four buttons and a bar that empties from the moment THAT phone
  saw the question (so a phone's lag does not cost it time); one click PUTs {a, t, n, ts} at
  `<sid>/kahoot/<g>/<q>` (own node); after the reveal: right/wrong, the points, the running total
  (kept in `fl3_rev_<g>`). Names are shown on the screen (a leaderboard). Hub card `#revision`
  with the player link and, on an instructor device (`jem_fb_session`), the screen link. Tested
  headlessly with a stubbed database (screen 1280, phones 390 and 1024): lobby, question, two
  answers counted live, reveal, points 981 / 0, the 10 s timeout with no answer, no errors, no
  sideways scroll. ⚠ Needs the `fl3/_release` rules (already deployed for the quizzes).

## ⚠ Séances 7, 8, 9 and 3 REBUILT — more theory, harder cases, solved alone (24 Nov 2026)

Jan Erik, after séance 6: "the course is too easy and has too little theory for the
students — they stopped me in tonight's lecture and wanted to do the exercises
themselves instead", then "rebuild seance 7,8,9 and 3. more weight on theory and
difficulty." The grammar of the four pages, to keep for any further rebuild:

- **Theory sections written in full** (`mode:'ex'`, one or two per séance), numbered
  paragraphs with the formulas, the articles, the edge cases and a `.trap` box of exam
  pitfalls; each ends with CONTROLS that count (a classify and/or a `buildNum` of
  theory-only calculations, ids `t1…`/`j1…`). No "reading" sections marked by a click.
- **Cases solved alone** (`mode:'do'`, a `.seul` banner): every datum up front, nothing
  pre-computed; journal `op` texts state the EVENT, never the account nor the computed
  amount (the engine's dropdowns make the student choose debit and credit); hints only
  after a wrong answer. A second, harder case per séance, at the level of the Inspera
  exam (Examen FLIII 2027 was read to calibrate: CAPM/WACC, apurement with latent
  reserves, goodwill RPC 30 and ROE, éliminations with minorities). Case ids of the
  kept cases are UNCHANGED, so a figure verified before still is.
- **No section timings** (`min` dropped, WRITING.md rule 7); the block hours stay.
- Progress keys bumped to `_v2` (fl3_w3/w7/w8/w9_progress_v2); every `wN_*` field is in
  `courses.json → project` (séance 3: w3_ajust, w3_forme, w3_flou · 7: w7_valeur,
  w7_ormonts, w7_rapport, w7_flou · 8: w8_apur, w8_rpc, w8_flou · 9: w9_bi, w9_flou);
  `courseprogress.js` totals 8 / 7 / 7 / 6; hub `SEANCES[].do` rewritten.
- **Séance 7** (`_private/check_s7b.py`): 7.1 theory I (VS with impôts latents, bénéfice
  durable corrigé, taux build-up, praticiens = circulaire 28 CSI, FCF, CAPM, WACC, VT,
  entity/equity) · 7.2 cas 1 Alpibois/Jorat, the CAPM now derives Jorat's 12 % (1,5 + 1,4 ×
  7,5) and Alpibois' 10 %; 18 numbers incl. the exchange ratio · 7.3 cas 2 **Fromagerie des
  Ormonts SA** (1'000 actions, impôt 20 %): RL 910'000, IL 182'000, VS 2'398'000, bénéfice
  durable 300'000 (274/324/302), taux 10 %, VR 3'000'000, praticiens 2'799'333, goodwill
  401'333; ke 12 % (1,5 + 1,5 × 7), WACC 10 % (75/25, kd 5 %), FCF 318/354/380, VT 4'264'444,
  VE 4'071'093, equity 3'351'093 → 3'351/action (WACC 11 % → 2'938); VE/EBITDA 6 × 560'000 −
  720'000 → 2'640/action, PER 10 → 3'000; offer 3'200 → goodwill payé 802'000, multiple
  implicite 7,0, PER 10,67; EVA 95'000 · 7.4 theory II (EVA/MVA, multiples table, prime de
  contrôle/décote, the report's structure, what it never does) · 7.5 cas 3 the expert's
  ten statements (five errors) + the five-line report · 7.6 quiz (CAPM, VS, WACC, VT, FCF,
  EVA, salary correction, circulaire 28) · 7.7. Denominator 94.
- **Séance 8** (`_private/check_s8b.py`): 8.1 theory I (963/963a incl. sous-groupe and
  the 10 % demand, 963b, périmètre table, four steps) · 8.2 cas 1 the thresholds over
  2024–2027 (obligation from 2026; 2027 exceeds one; exemption again from 2028 if 2028 stays
  under — "lecture usuelle, par analogie avec l'art. 727") + the nine-company périmètre ·
  8.3 theory II (apurement rule, four cases, impôts différés, acquisition method, goodwill
  RPC 30 options / IFRS impairment / badwill, ROE) · 8.4 cas 2 Vuilleumier (figures of
  check_s8.py, journal events restated) · 8.5 cas 3 **Ferblanterie Chevalley SA, 75 % for
  1'050**: RL 340 (terrain 100, bâtiment 200/20 y, machines 40/4 y), impôts différés 68,
  FP BC 2 1'172, goodwill 171 (34,2 a year), PMC 293, bénéfice BC 2 2027 104 (120 − 20 + 4),
  PMB 26, PMC fin 2027 319, twelve entries incl. Impôts différés and its 4 reversal; ROE 14,0
  vs 15,86 %; badwill variant −29; dividend 40 → 30 eliminated · 8.6 quiz · 8.7. Charpente
  Muller's 80 % case LEFT séance 8 (Chevalley replaces it); séance 9 restates Muller's
  acquisition facts itself. Denominator 84.
- **Séance 9** (`_private/check_s9b.py`): 9.1 theory (four families with "does the result
  change", bénéfice intermédiaire pas à pas, downstream/upstream rule, the machine, dividends,
  consolidation subséquente, the worksheet order and its three controls) with three controls ·
  9.2 cas 1 Muller livre à sa mère (stock + machine, 80/20) · 9.3 cas 2 the 2028 worksheet
  (unchanged `buildWorksheet` rows) + seven readings incl. the dividend · 9.4 cas 3 **Chevalley
  2028**: upstream stock 30 % (15 → 24; 11,25/3,75 and 6,75/2,25), DOWNSTREAM machine 120 vs
  80 over 4 y (−40 + 10 = −30, all to the group), loan 150 at 4 % from 1 July (intérêts courus
  3), dividend 40 (30 eliminated), goodwill 34,2; effet total −100,95; PMC fin 2028 331,5
  (319 − 10 + 26,25 − 3,75); ten entries · 9.5 quiz · 9.6. Denominator 78.
- **Séance 3** (`_private/check_s3b.py`): 3.1 theory I (forms, succession universelle,
  soulte/dédommagement, fusion simplifiée 23–24, art. 6, procedure with PME waivers, art. 25
  after the fusion, rapport d'échange/agio/compte Fusion, participation déjà détenue, neutralité
  61 LIFD) · 3.2 cas 1 Jorat in three versions (A, B soulte, C participation; ids unchanged) ·
  3.3 theory II (three levers + regroupement, E and DPS formulas, the control, the « 1 pour 5 »
  trap) with four controls · 3.4 cas 2 Clos des Roches (unchanged ids) · 3.5 cas 3 **Alpibois
  absorbe Charpenterie Gillièron SA**: 500 actions de 1'000, FP 250'000 (pertes reportées
  300'000), seuil 275'000 → découvert 25'000 (art. 6: Alpibois' 800'000 free reserves), RL
  250'000 → VI 500'000 = 1'000/action = 1 : 1; Alpibois holds 100 shares at 130'000 → 400
  new shares, nominal 200'000, agio 200'000, PERTE de fusion 30'000, frais 15'000 en charge;
  bilan 8'005'000 (actifs 7'000'000 − 130'000 + 1'150'000 − 15'000 = dettes 4'350'000 +
  capital 2'700'000 + RLC 200'000 + réserves 755'000); soulte max 40'000 · 3.6 cas 4 Bois
  Romand (unchanged) · 3.7 quiz (art. 6 and a perte de fusion added) · 3.8. Its date is still
  "à confirmer" (the 19 Nov séance was cancelled). Denominator 109.
- All four probed headlessly (scratchpad `fl3-probe.mjs`: wraps the builders to read their
  answers, solves every numeric, classify and journal item through the UI, fills the fields):
  every item accepts its answer, every section except the quiz (and 9.3's worksheet, not
  driven by the probe) completes, no errors, no sideways scroll at 390 px.

## 24 Nov 2026 — exam coverage check, two gaps closed

Jan Erik: "do my course actually cover the difficulty level of the exams?" Every question of the 2027 exam (variantes A/B) was mapped to its séance: all covered, séances 3, 7, 8, 9 above exam level. Two gaps closed the same night: séance 1 §1.2 got a paragraph on the founders' liability for an overvalued apport en nature (art. 753 CO, the réviseur art. 755 CO); séance 7's theory control got a fifth item `t5` (the exam's one-flow constant-growth DCF: FCF of next year ÷ (WACC − g), minus net financial debt — 900'000, 1,5 %, 7,5 %, 4'000'000 → 11'000'000) and a fourth exam trap on the same point. Denominator of séance 7: 95. Never copy the exam's cases or figures.
