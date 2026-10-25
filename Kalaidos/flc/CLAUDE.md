# Kalaidos · Financial Leadership & Controlling (`flc`)

Built 25 Oct 2026 from the coordination's email (Laïla Fournier, Kalaidos
Lausanne), the PEA « Financial Leadership & Controlling – version courte après
une ES » (2026 WIP), the Kalaidos exam template (Prüfungsvorlage 2025, 06.2025)
and the 18.03.2024 exam (série A, 180 pts) with its redline.
Source files: `~/Documents/Jan Erik/Kalaidos/Financial Leadership & Controlling 2027/`.
The sister module FL III (Nov 2026) has its own briefing in
`~/Documents/Jan Erik/Kalaidos/Financial Leadership November 2026/CONTEXT_FLIII.md`;
its document conventions (Python-checked figures, Swiss number format, current CO
articles) apply here too.

## The module

| | |
|---|---|
| Module | FBPA1201 Financial Leadership & Controlling |
| Programme | BBA version courte (après une ES), semestre de passerelle, 6 ECTS |
| Langue | français, partout |
| Étudiants | **two** (registered Oct 2026). Every atelier is written for a PAIR: two roles, a duel, a negotiation. Never put their names or e-mails in a tracked file. |
| Coordination | Laïla Fournier, coordinatrice académique, HES Kalaidos, Rue de Bourg 20, 1003 Lausanne |
| LMS / exam | OpenOlat (Zoom login there) · exam on **Inspera** |
| id / ns / keyPrefix | `flc` · folder `Kalaidos/flc` · joinCode `FLCO` · theme `kalaidos` (new, 25 Oct 2026) |

### Calendar (proposed by the school — to be confirmed by 1 Nov 2026)

| Bloc | Date | Heure | Format | Module id |
|---|---|---|---|---|
| 1 | Sam 16.01.2027 | 09:30–13:00 | présentiel, Lausanne | `w1` |
| 2 | Sam 16.01.2027 | 14:00–17:30 | présentiel, Lausanne | `w2` |
| 3 | Mar 26.01.2027 | 17:30–21:00 | en ligne (Zoom) | `w3` |
| 4 | Jeu 28.01.2027 | 17:30–21:00 | en ligne (Zoom) | `w4` |
| Examen | **Lun 15.03.2027** | 120 min | Inspera, open book | — |

The dates are a proposal: the school allows changing them with the students.
If they move, change `schedule` in courses.json, the hub's `BLOCS` array, the
eyebrow of each bloc page and `SESSIONS` in presence.js together.

### Deadlines owed to the school

| Due | Item | Where |
|---|---|---|
| 1 Nov 2026 | PEA corrected to **4 blocs** instead of 6 | `~/Documents/Jan Erik/Kalaidos/Financial Leadership & Controlling 2027/PEA_FLC_2027.docx` (+ .pdf) — built 25 Oct 2026, NOT yet sent |
| 15 Dec 2026 | Exam, 120 min / 120 pts, **variante A + variante B** | same folder: `Examen_FLC_2027_Variantes_A_B_Solutions.docx` (the one to send), per-variant solution and student files, `Examen_FLC_2027_Synthese.md`, generator in `Examen_FLC_2027_Generateur/` (`python3 examen.py && node build.js`) — built 25 Oct 2026, NOT yet sent |

Open questions for Laïla Fournier (from the PEA revision): contact hours —
4 × 3 h 30 = 14 h against the module description's 48 h (the PEA now says
14 / 134 / 32 = 180 h); the chapter number of the coûts de processus reading
(the WIP's "chap. 2, 3 et 73" looked like a typo, and named a different
Prochinig book than §4.1.4).

The exam uses its own fictional companies (Lumen Optique SA, Calixte Design
SA…), never Alpibois, so nothing on this public site gives the paper away.
Never put exam content, question ideas or solutions in a tracked file.

Neither document is ever copied into this repo (it is the public web root);
`_private/` here holds only working notes.

## Teaching design — four blocs, four themes

The PEA's four objectives map one-to-one onto the four blocs; the two Saturday
blocs (a 7-hour day) are mostly student work. Every section is either
🎤 exposé (short, fully written on the page so it can be read alone),
🛠 atelier (the students work) or ✅ quiz (launched in class, `_release/<mod>/quiz`).
Target on Saturday: about 25% exposé, 75% atelier/debrief.

**Running case: le groupe Alpibois (fictional), wood and furniture, canton de
Vaud.** One company family threads through all four blocs, so each bloc
reuses figures the students already know:

| Bloc | Theme (PEA objective) | Textbook | Alpibois episode |
|---|---|---|---|
| 1 · Sam matin | Cas particuliers I — **création, transformation, assainissement, liquidation** (the life of a company) | CF3 ch. 2, 4, 6, 7 | founding Alpibois SA (cash + apport en nature + libération partielle) · Charpente Muller Sàrl becomes an SA · Alpibois Design SA in difficulty (725a/725b, measures) · Alpibois Export Sàrl wound up |
| 2 · Sam après-midi | **Évaluation d'entreprise** → **fusion, scission, transfert de patrimoine** | BRW112 ch. 1–4 · CF3 ch. 5, 8 | each student values one company (Alpibois SA / Menuiserie du Jorat SA), they negotiate the exchange ratio as the two boards, then book the absorption |
| 3 · Mar soir (Zoom) | **Comptes consolidés I** — groupe, obligation (963/963a CO), Swiss GAAP RPC 30, périmètre, consolidation du capital, goodwill, minoritaires, mise en équivalence | Comptes consolidés ch. 10, 11, 14 | Alpibois Holding SA + Charpente Muller SA (80 %) + Scierie du Gros-de-Vaud SA (30 %, equity) |
| 4 · Jeu soir (Zoom) | **Comptes consolidés II** (éliminations intragroupe, feuille de consolidation) + **méthode des coûts de processus** (ABC) + préparation à l'examen | Comptes consolidés ch. 12 · Winiger/Prochinig CAE | intragroup sales, stocks, loan, dividend · two Alpibois products costed traditionally and by ABC · Inspera-style practice |

Why this order (it differs from the PEA's 6-bloc order, which put
évaluation first): the Saturday morning tells one story — a company is born,
changes form, falls ill, dies — and the afternoon needs valuation *before*
fusion, because the exchange ratio comes from the two valuations. Consolidation
gets both online evenings because it carries the most exam weight (85 of 180
points in the 2024 paper).

### Weight in the 2024 exam (180 pts) → target for the 2027 exam (120 pts)

| Theme | 2024 | 2027 target |
|---|---|---|
| Cas particuliers | 53 | 36 |
| Comptes consolidés | 85 | 50 |
| Évaluation d'entreprise | 31 | 24 |
| Coûts de processus | 11 | 10 |

## Facts stated on the pages (checked 25 Oct 2026 — keep current law)

- SA capital ≥ CHF 100'000 (621 CO); at least 20 % of each share and CHF 50'000 in total paid in (632 CO); apport en nature → rapport de fondation (635) + attestation de vérification by a réviseur agréé (635a); frais de fondation are a charge, never activated.
- Sàrl capital ≥ CHF 20'000 (773 CO), parts fully paid in (777c).
- Agio → réserve légale issue du capital (671 CO).
- Transformation, fusion, scission, transfert: LFus (53 ss, 3 ss, 29 ss, 69 ss). Soulte ≤ 10 % of the real value of the shares granted (7 al. 2 LFus). Transfert de patrimoine only with an excess of assets in the inventory (71 al. 2 LFus).
- Perte de capital **725a**, surendettement **725b**, réévaluation of immeubles and participations **725c** (2023 numbering — the old 670/725 numbering in prior papers is out of date).
- Liquidation: **one** appel aux créanciers in the FOSC (742 al. 2, since 2023 — the 2024 paper still quotes "troisième fois"); répartition after 1 year (745 al. 2) or 3 months with an expert-réviseur agréé's attestation (745 al. 3); radiation needs the tax authorities' consent.
- Consolidation: 963 CO (control), 963a (exemption: 2 of 20 mio bilan / 40 mio CA / 250 EPT over two consecutive years); Swiss GAAP RPC 30: goodwill activated and amortised (typically 5, at most 20 years) **or** offset against equity at acquisition with the theoretical effect in the annex.
- "Reprise de biens" disappeared from the CO in 2023: do not reintroduce it (the 2024 solution to 1.2 e) still uses it).

## Engine

A port of `UMEF/mfb545` (itself gen110): `bloc.js` = mfb545's `journee.js`
(sections, blocks, buildClassify / buildNum / buildSteps / buildPick /
buildQuiz, timers, setWork), French only (`lang.js` is a T() shim, no EN pages),
`flc.css` = `fintech.css`, plus `presence.js`, `exercises.js`, `answers.js`,
`courseprogress.js` with `mfb545` → `flc`. Pages: `index.html` (hub),
`bloc1.html` … `bloc4.html`, module ids `w1`…`w4`.
Added to the engine (bloc.js): `buildJournal(box, ACCOUNTS, ITEMS)` — débit,
crédit, montant, each entry a counted step; `buildWorksheet(box, cfg)` — the
bloc 4 consolidation sheet, ONE counted step (`ws28`) done when every line of
« Consolidé » matches; its rows are GENERATED from `_private/check_figures.py`
(edit the script and regenerate, never the numbers). The worksheet books a
profit-affecting entry ONCE: the balance-sheet profit is taken from the
income statement (the textbook books it twice; bloc 3 §3.3 says so to the
students). `fmt()` writes Swiss numbers by hand (1'250'000 · 33,3) because
toLocaleString('fr-CH') differs between browsers. Simulators (assainissement
1.5, valuation sensitivity 2.2, merger ratio 2.4) are inline in the pages.
`window.FLC_ITEMS` exposes numeric/journal items to a headless probe.
Reading-only sections (2.3, 3.3, 4.3) complete via a `s3read` step when the
student clicks « Suite ».

Other pages: `index.html` (hub; QR `qr-flc.svg` → `?app=1`, segno scale 10,
colour #0B5862), `jeopardy.html?set=sam` (end of Saturday) / `?set=rev`
(bloc 4), `admin.html` (stub → admin2). Theme `/shared/themes/kalaidos-full.css`
(umef-full.css recoloured to the logo: #007A87 / #0096C7 / #0B5862),
registered as `kalaidos` in courses.json and shared/config.js. Logo
`kalaidos-logo.png` taken from the school's PEA docx. track.js does not link
the logo (no /Kalaidos/ landing page).

Continuity of the case: Charpente Muller ends bloc 1 with equity of 110 KCHF
(CA 100 after transformation, RLB 10); bloc 3 reaches 320 at acquisition
through a BC 1 → BC 2 step (land carried at 30, worth 240: +210). Bloc 4's
2028 figures continue bloc 3's (goodwill 144, 80 %, reserves 220 → 240).

Tested 25 Oct 2026 with a headless probe (puppeteer-core, Firebase blocked)
that solves every widget: all sections complete except the quizzes (locked
until launched) and reading sections; worksheet balances at 9'911,4; no
horizontal scroll at 390 px.
Every figure on a page is recomputed in Python before it ships
(`_private/check_figures.py`).

⚠ The rules block `flc` in `firebase-database-rules.json` must be DEPLOYED
before the link goes to the students.

## The Kalaidos look (25 Oct 2026)

Jan Erik asked for kalaidos-fh.ch's style on the Kalaidos classes. Every page
here now loads `/Kalaidos/kalaidos.css` AFTER its own stylesheet: the bloc
pages carry `class="kal-bloc"` on `<body>`, the hub `class="kal-hub"` (its
header, the teal « bloc par bloc » band of square cards and the dark footer
are Kalaidos markup; the blocs are drawn from `BLOCS` as `.kal-card`), and
the Jeopardy board only takes the Barlow font. The skin overrides colours
(headings #222, bands #3393A1, buttons #1A6678, coral #F44A47 accents),
corner radii and type; it changes no class the engine reads, so the probe
still completes every section. The sign-in modal is /shared/login.js and is
deliberately left as it is. The school landing page `/Kalaidos/index.html`
renders this course's four sessions from `schedule.dates/times/where` (added
for it) and its exam card from `schedule.exam`.
