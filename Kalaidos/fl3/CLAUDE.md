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

