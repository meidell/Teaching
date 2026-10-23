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
