# GBS · Finance Modelling — notes for Claude

Split out of the root `CLAUDE.md` on 23 Oct 2026 (one file per course, loaded when working in this folder). The site-wide rules — shared runtime, data model, rules, secrets, conventions — stay in the root `CLAUDE.md`; read that first.

## GBS · Finance Modelling — `GBS/financial-modelling/`

MIM specialisation, `id`/`ns`/`keyPrefix` `finmod`, Thursdays 18:45–20:45 from
22 Oct 2026, eleven sessions, Geneva; **assessment 50% participation · 50%
final group presentation** (not the BI course's four quarters). Module ids are
the school's week numbers from `w2` (no `w1`). **The tool is Excel, desktop
app**, the one course in the repo that does not run in a browser. Running case
**Meridia Cold SL** (Barcelona cold-chain operator, 14 warehouses ES/FR/IT),
bidders Boreal Logistics (strategic) and Arco Partners (PE). Run-sheet
archetype: `finmod.css` = `bi.css` + additions at the END; `courseprogress.js`
`total` = steps counted.

- **Session 1 — *The model nobody can audit* (`week2.html`, built 22 Oct
  2026, the day of the session), `total:7`** (six step blocks; the build
  counts twice — file recorded, then all six self-audit items). Step 2 hands
  out **`files/meridia-cold-v7-FINAL-2.xlsx`**, a real workbook generated
  with openpyxl and **wrong in twelve planted places** (text number, growth
  hardcoded in two cells of three, three margins, tax in four homes, capex
  copying the prior year, capex added in FCF, a hidden plug row, an unused
  WACC input with 0.09 typed everywhere, ^2 for year 3, two net debts,
  shares in thousands, no check). The sheet shows EV 249.0 / €0.0048 a
  share; honest it is EV 159.4 / €2.48. The key is `_private/meridia-broken-key.md`
  and the reveal on the page (after the student seals their list) names
  all twelve with their class; a classify follows (answers S T H D R S H C).
  Step 3 is the mechanism block: Excel's dependency graph and calculation
  chain, smart recalc, volatile functions, $-references as offsets and F4,
  text numbers vs SUM, circular references; then the layout convention
  (Inputs/Calc/Outputs, time across, one formula per row + period flags,
  one input one home, units column, group not hide), the **blue / black /
  green / red** colour convention, the check row (ABS difference, 0.001
  tolerance, MAX → master → cover) and a Windows/Mac keyboard table. Step 4
  builds the blank model from the **canonical Meridia history** — revenue
  160.2 / 171.0 / 180.4 · EBITDA 23.2 / 26.2 / 29.0 · D&A 9.6 / 10.1 / 10.6 ·
  capex 12.0 / 13.5 / 14.2 · ΔNWC 1.2 / 1.4 / 1.1 · net debt 62.0 / 60.5 /
  60.0 · 40.0 m shares · tax 24% — **every later session builds on these
  numbers**; nine numbered build steps end in three checks and a master
  check on the cover. Teams of three, roles Builder / Auditor / Presenter.
  ⚠ **Rebuilt the evening of 22 Oct 2026** (Jan Erik: the prediction was
  "silly, they have not even seen the numbers"; "The cure … is just
  uninteresting information"; "from the build it makes sense — build on
  this to give me a 2 hour lecture"). Step 1 now shows the file's cover
  page and asks two judgements (honest EV band; one share from the file's
  own equity = €4.80 vs €0.0048). The cure is GONE; the session is one
  build in three parts, each opened by an 8-min 🎤 `.lect` block: **Build I**
  skeleton (s3, master check now in Checks!C12), **Build II** forecast (s4:
  drivers C18–C22 6.7% · 16.1% · 5% · 8% · 10%, flag formula per row, FCF
  9.28 / 9.62 / 10.22 / 10.85), **Build III** valuation (s4b: WACC 8.5%,
  g 2%, DF from the timeline, Gordon TV = 84% of EV, EV **159.36**, equity
  99.36, **€2.48**; WACC 9% → 147.9; Goal Seek €249 m → g 4.52%). Every
  answer is a `.nchk` with a tolerance, recomputed in Python. Later
  sessions (4 three statements, 5 forecast, 6 FCF) now revisit what
  Session 1 introduced — deepen, don't repeat.
  No wall tonight (the `finmod` rules block has no `_wall` node yet; add it
  with Session 2 if a shared tally is wanted). Probed headlessly: 7/7, no
  errors. Run sheet `_private/week2-runsheet.md`.
- **Session 2 — *Error-checking as architecture* (`week3.html`, built 26 Oct
  2026), `total:6`.** Builds on v01: **Build I** a two-way INDEX/MATCH
  snapshot on the Cover (Inputs C28 = snapshot year, labels LINKED from
  Calc), with an in-page mini sheet showing VLOOKUP's typed column index
  going wrong after an inserted column (30.99 vs 33.07). **Build II** the
  scenario switch: selector Inputs!C27, table C29:E34 (Base 6.7/16.1/5/8/10
  · Boreal plan 9.0/17.5/5/8.5/10 · Lender case 3.0/14.5/5/7.5/12), live
  column C18:C22 `=CHOOSE(Scenario,C30,D30,E30)`, names Scenario / WACC /
  TermGrowth / TaxRate, a data table on the selector at Inputs C37:E40.
  **EV 159.36 / 179.11 / 135.59, €2.48 / 2.98 / 1.89.** The finding the
  session turns on: growth is worth almost nothing (Boreal's 9% alone
  +0.5), the margin is worth +34.2 (lender's −39.1), capex −16.1.
  **Build III** the audit block: Checks rows 12:14 inserted, new error
  checks C11 ISTEXT · C12 selector valid · C13 live = selected · C14
  ISFORMULA, master **C15** `=IFERROR(IF(MAX(C5:C14)<0.001,0,1),1)`,
  warnings C18–C21, count C22; Cover `=IF(Checks!C15=0,"OK · "&Checks!C22&" warning(s)","ERROR")`.
  **Step 5** deals each student one of nine sabotage cards; the classify
  answers E E E N E W N W E. Every number and every card was recalculated
  **in Excel** (osascript on the installed app) from
  `_private/gen-meridia-v01-v02.py`; the end state is
  `_private/meridia-cold-v02-key.xlsx`; the student-facing start file is
  `files/meridia-cold-v01-reference.xlsx` (S1's end state, linked from the
  banner). Run sheet `_private/week3-runsheet.md`.
  ⚠ **REPLACED 29 Oct 2026, the day of the session, by a self-run group
  MANDATE** (Jan Erik: "work independently as small groups … DO NOT make
  this about excel training … something real they must solve"). The Excel
  build above lives in git history only; Session 3 onwards may still assume
  the v02 file (scenario switch, audit block) — decide whether to fold it
  into a later session. **New `week3.html` — *Can the board sign off the
  plan?*, `total:7`**: Meridia is for sale; before the data room opens the
  board must approve management's plan (= the old "Boreal plan" case:
  9 % / 17.5 % / capex 8.5 % / NWC 10 %); teams are the board's independent
  reviewer. Steps: board pack (team names `w3m_team`) · what drives value
  (in-page calculator = the v01 model line for line, presets base / plan /
  lender; four one-at-a-time Δ €/share checks: +0.01 · +0.86 · −0.40 ·
  0.00) · credibility vs history (margins 14.48 / 16.08, growth 5.50 %,
  capex 7.87 %, NWC 12.96 % of new revenue, extra FY2026 EBITDA €2.75 m) ·
  value range (2.98 / 2.48 / 1.89, TV 83.7 % of EV, WACC 9.5 % → €1.95) ·
  walk-away price (margin-for-a-price solver: €2.48 → 16.09 %, €2.98 →
  16.91 %) · memo (4 parts) → download as index.html in `meridia-memo` →
  Netlify Drop (`meridia-review-team-…`) → hand in (`w3m_memo`, `w3m_site`,
  refuses without a *.netlify.app address) · team quiz =
  **`jeopardy.html?set=s2`** (BI's engine, 6 × 5, last category "Your
  memo"; scores `finmod_jeo_s2`). One laptop per team: finmod has NO
  `_wall`, so nothing syncs between devices and there is no class list —
  the memo lands in the signed-in student's record. Every figure recomputed
  in Python 29 Oct 2026; probed end to end 7/7, no overflow at 390 px.
  ⚠ **openpyxl writes post-2010 functions without their `_xlfn.` prefix** —
  ISFORMULA read #NAME? until written as `_xlfn.ISFORMULA`. Any generated
  workbook using IFS, XLOOKUP, ISFORMULA etc. needs the prefix.
  ⚠ **A data table's input cell must be on the table's own sheet.** Session
  1's page originally put the WACC × g table on the Cover with inputs on
  Inputs, which Excel refuses; fixed 26 Oct 2026 (it lives on Inputs).
  ⚠ **Session 3 needs Meridia's historical balance sheet and cash flow
  statement**, which exist nowhere yet; they must agree with the canonical
  history above.

### Session parameters (for /new-session)

- **Language** English. **Archetype** a run sheet, not concept screens: one
  `.step` per block of the evening with a clock, `.lect` 🎤 blocks of ~8 min
  opening each build part, a numbered `.spec` of cell-by-cell build steps,
  `.nchk` numeric checks (every answer recomputed in Python AND in Excel),
  `data-work` capture fields, `data-board` on steps. `finmod.css` only;
  additions at its END. `total` in courseprogress.js = number of steps.
- **Textbook** none verbatim — Benninga *Financial Modeling*, Pignataro
  *Financial Modeling and Valuation*, the FAST Standard, Microsoft docs, as
  sources. Wording is free.
- **Running case** Meridia Cold, canonical history above; each session
  builds on the previous file (v01, v02, …). A second, non-Meridia example
  goes in a `details.kbd` drawer ("the same structure in another business").
- **Session** Thu 18:45–20:45, 120 min including a 5-min break. Teams of
  three (A–F), roles Builder / Auditor / Presenter rotating.
- **Grading** 50% participation (the student's own file and the page's
  fields) · 50% final group presentation. No homework page, no checkpoint
  quiz, no glossary page: the Close step's term list is the glossary.
