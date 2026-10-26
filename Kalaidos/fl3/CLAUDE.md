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

### Calendar (plan de cours FL III 2027)

| # | Date | Time | Format | Theme | Module id |
|---|---|---|---|---|---|
| 1 | Tue 10.11.2026 | 17:30–21:00 | Zoom | Introduction · Création | `w1` |
| 2 | Thu 12.11.2026 | 17:30–21:00 | Zoom | Transformation | `w2` |
| 3 | Tue 17.11.2026 | 17:30–21:00 | Zoom | Fusion | `w3` |
| 4 | Sat 21.11.2026 | 09:30–13:00 | hybride | Scission et transfert de patrimoine | `w4` |
| 5 | Sat 21.11.2026 | 14:00–17:30 | hybride | Assainissement | `w5` |
| 6 | Tue 24.11.2026 | 17:30–21:00 | Zoom | Liquidation | `w6` |
| 7 | Thu 26.11.2026 | 17:30–21:00 | Zoom | Évaluation d'entreprise | `w7` |
| 8 | Thu 10.12.2026 | 17:30–21:00 | Zoom | Comptes consolidés : fondements · BC 1 → BC 2 | `w8` |
| 9 | Sat 12.12.2026 | 09:30–13:00 | hybride | Consolidation subséquente et éliminations | `w9` |
| 10 | Sat 12.12.2026 | 14:00–17:30 | hybride | Mise en équivalence · préparation à l'examen | `w10` |

Évaluation (séance 7) comes before consolidation on purpose: it is independent,
and it lets the group finish EEA §§ 1–6 before the two-week break after 26 Nov.
A date change touches courses.json `schedule`, the hub's `SEANCES`, each
page's eyebrow and presence.js `SESSIONS` — together.

### EEA milestones the pages must mention (plan de cours, "Jalon EEA")

S1 publication of the EEA · S2 § 1 réalisable · S3 § 2 · S5 §§ 3–4 · S6 § 5 ·
S7 § 6 · S8 § 7.1 · S9 §§ 7.2–7.3 · S10 remise lundi 14 décembre 2026 23:59.
The EEA is on OpenOLAT, not on this site. **Never put EEA or exam content,
cases or figures on a page**: the EEA's companies are Sandra Berset, Alpina/
Bornand, Alderis, A-SA/B-SA, Schaffter Pives, M/T — do not reuse their names
or numbers; the course case is Alpibois.

## Teaching design — one theme per séance, 3 h 30, two parties

Each séance page = `seanceN.html` on the flc engine (`bloc.js`, `fl3.css`,
`body class="kal-bloc"`, `/Kalaidos/kalaidos.css` loaded after `fl3.css`).
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
