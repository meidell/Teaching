# ESM · Trading (`trading`)

Built 23 Nov 2026 from the **discussion grid** Jan Erik sent Vivian (ESM) —
`~/Desktop/Grille_Discussion_Parcours_Trading_JEM.xlsx`, three sheets:
*Objectifs* (CLO 1–5), *Grille de discussion* (16 séances with his *Avis* and
*Proposition de modification*), *Ateliers pratiques* (6 days) — and his
covering email. The site-wide rules (shared runtime, data model, rules,
secrets, WRITING.md) stay in the root `CLAUDE.md`; read that first.

## The course, as proposed

| | |
|---|---|
| School | ESM, École de Management et de Communication, Genève (`school:"ESM"`, folder `ESM/trading`) |
| Format | 16 séances de 3 h in three blocs + 6 ateliers pratiques of one day on a simulator |
| Langue | français, partout |
| id / ns / keyPrefix | `trading` · `trading` · `trading_` · joinCode `TRAD` · theme `esm` |
| Évaluation (proposed) | the **journal de trading** and the **respect of the plan de trading**, plus a test de connaissances at séance 16 and the soutenance at atelier 6; the gain realised on the simulator does NOT count ("noter le gain récompense la prise de risque") |
| Dates | séance dates **unknown**; ateliers Thu 15/22/29 Apr 2027 and Fri 14/21/28 May 2027 (the school planning said « mardi » — raised with Vivian). No `schedule`, `period` or `menu` in courses.json until the dates exist |
| Level | `Bachelor` in the registry is a GUESS — confirm |

⚠ **The programme is a proposal, not an agreed plan** (email to Vivian, 23
Nov 2026): risk moved from séance 13 to 2; the Swissquote platform séance
from 8 to 3; « Crypto » and « Analyse financière » merged into one séance
(8) to free a third strategies séance (13); the order of several séances
changed. If Vivian changes the order, the hub's `SEANCES`, `presence.js`
`SESSIONS`, `courseprogress.js` `CHAPTERS`, courses.json `modules`, the
plan table and `renderPlan` text in `bloc.js` (`PLAN`) and the table in
séance 1's section 1.1 all change together — the same titles are typed in
all six places.

| # | Bloc | Thème | Qui | Page |
|---|---|---|---|---|
| 1 | Fondamentaux | Formation des prix, contrepartie et coûts | JEM | **built** |
| 2 | Risque | Gestion du risque et money management | JEM | **built** |
| 3 | Fondamentaux | Plateforme, ordres, levier et marge · compte simulé · journal starts | Swissquote | locked |
| 4 | Fondamentaux | Fondamentaux et indicateurs macroéconomiques | JEM | locked |
| 5–6 | Fondamentaux | Classes d’actifs et instruments I / II | Duchossoy | locked, « attente du contenu de l'intervenant » |
| 7 | Fondamentaux | Matières premières | Levan | locked |
| 8 | Fondamentaux | Le marché des cryptomonnaies | Boya-Musitelli | locked |
| 9–10 | Analyse technique | AT I décrire le prix · AT II des indicateurs aux règles testables (backtest method) | JEM | locked |
| 11–13 | Analyse technique | Stratégies I tendance/breakout/retour à la moyenne · II scalping/intraday · III spreads/pair trading | JEM | locked |
| 14 | Risque | Finance comportementale et discipline | Levan | locked |
| 15 | Risque | Backtesting et évaluation d'une stratégie (students present their rule's test) | JEM | locked |
| 16 | Risque | Atelier intégratif : plan de trading · test de connaissances | JEM | locked |

Intervenant names are NOT on the student pages (cards say « Intervenant·e »);
they are in the grid and here only.

## Files

- `index.html` — the hub: Kalaidos/fl3's hub (the HEG look) in ESM colours;
  `SEANCES` (16, `live` flips as pages ship) and `ATELIERS` (6, with dates)
  render the two grids; the fil rouge, the journal/evaluation panels, the
  CLOs, the two tools. QR `qr-trading.svg` (segno, navy, `?app=1`).
- `seance1.html`, `seance2.html` — on `bloc.js` (fl3's engine renamed: the
  only edits are the course name, `eea` mode relabelled « Après la séance »,
  and `PLAN` + `renderPlan(box, n)` replacing fl3's EEA calendar). Sections
  carry NO `min` and the pages have no `#dayTl` and no `.timer` — WRITING.md
  rule 7, no minute timings on student pages.
- `outils.html` — five calculators, nothing recorded (position size,
  breakeven p* = (1 + c)/(1 + R) and the scalping version in ticks,
  expectancy, drawdown recovery, a 500-trader streak simulator).
- `journal.html` — the trading journal. Rows in localStorage
  `trading_journal_v1`; mirrored on every change into two hidden
  `[data-work]` fields (`journal_trades` JSON, `journal_bilan` a one-line
  summary) that progress.js saves under `<sid>/work/`, so admin2's workbook
  reader shows them; `journal_lecon` is the visible field. Loads from the
  work field when its own store is empty (another device, after the login
  merge). KPIs: closed trades, win rate, expectancy, mean gain/loss, profit
  factor, max drawdown of the cumulative result, plan respected %, mean R
  (= result ÷ |entrée − stop| × taille), cumulative; equity curve; CSV.
- `trading.css` = fl3.css recoloured (orange `#DF5727`, accent-deep
  `#B5431A` for text on the wash, navy `#11317F`, cream `#F3F2EE`) + the
  course's widgets at the end (`.ob` order book, `.obout`, `.sr` pick rows,
  `.jt` journal, `.kpis`). `/shared/themes/esm-full.css` = kalaidos-full.css
  mapped the same way (dark values chosen for contrast on `#151D23`). The
  `esm` theme is also in courses.json `themes` and config.js `THEMES`.
- `presence.js` (SESSIONS w1…w16 + a1…a6, information only), `courseprogress.js`
  (CHAPTERS: w1 and w2 live, total 6 and 7; the rest total 0), `exercises.js`,
  `answers.js`, `lang.js`, `admin.html` — fl3's, renamed.
- `_private/check_s12.py` (not tracked) recomputes every figure of séances 1
  and 2 and the tools.

## Séance 1 and 2 — what is on them

S1 (w1, 6 sections, 41 counted steps): 1.1 the course (plan table, the
evaluation, V/F) · 1.2 the order book (six-step walk; a 5 × 5 book at 100,
mid 100.075, an order walks the levels: 600 at market → 100.11, 21 CHF
above mid; liquid/illiquid classify) · 1.3 the round trip (200 titres at
CHF 50, spread 0.10, 9/order → CHF 38 = 0.38 %; expectancy E = p·G − (1 −
p)·P − C, 55 %/150/100/38 → − 0.5; p* = (P + C)/(G + P) = 55.2 %; order
types classify) · 1.4 **the biased-coin game** (the grid's « jeu de pari en
classe » — 60 % heads, 50 flips, stake f of the capital; one series drawn,
1 000 players simulated; g(f) = p ln(1 + f) + (1 − p) ln(1 − f), Kelly f* =
2p − 1 = 20 %, g < 0 from 40 %; field `w1_pari`, `data-board`) · 1.5 quiz
(answers 1 2 0 1 3 2 1 0) · 1.6 after (`w1_contrepartie`, `w1_attente`).

S2 (w2, 7 sections, 38 steps): 2.1 drawdown and recovery (perte ÷ (1 −
perte)) · 2.2 position size (taille = risque ÷ distance; 20 000 × 1 % ÷
2.00 = 100; levier changes the margin, not the size; actions/contrats
rounded down/devises) · 2.3 R and p* = (1 + c)/(1 + R), six strategies
to judge · 2.4 streaks (q^k; 1 − (1 − f)^k; 500-trader simulator, ruin =
under half) · 2.5 **the student's risk rules** (`buildPick` × 5: risque
par trade, perte max jour, semaine, positions, levier — recorded, not
marked; three sizes to compute; `w2_regles` with `data-board`, `w2_serie`)
· 2.6 quiz (1 2 1 0 2 1 3 0) · 2.7 after.

Tested headless 23 Nov 2026 (Playwright, 1280 and 390 px): no page errors,
no sideways scroll on the five pages, every numeric check accepts its
answer (8/8, 14/14), all sections but the locked quizzes mark, the journal
computes (3 trades → 33 %, E − 100, PF 0.57, plan 67 %, R + 2 / − 1 / − 2.5)
and survives a reload, the tools render their six readouts.

## Not built (deliberately, until Vivian confirms the programme)

Séances 3–16 and the six atelier pages: locked cards on the hub, module ids
reserved. Jan Erik's own séances to build next in this grammar: 4 (macro
calendar, expected vs observed), 9–13, 15, 16. The intervenants' séances
(3, 5–8, 14) get a page only once their content arrives. A `menu` block,
`schedule` and `period` once the dates exist. No slides/PDF yet (fl3 has a
`seanceN-slides.html` pattern to copy if wanted).

⚠ The `trading` rules block in `firebase-database-rules.json` must be
DEPLOYED before the link goes to students (Jan Erik publishes it).
