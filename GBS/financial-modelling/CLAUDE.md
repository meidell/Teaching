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
  **Slides, 29 Oct 2026: `session2-slides.html`** — one hour, 26 slides,
  the capstone decks' engine in GBS navy/gold (← → · N notes · P print),
  speaker notes on every slide, linked from week3's banner. Sale process ·
  equity bridge (PV FY26–28 26.04 + PV TV 133.32 = 159.36) · three plans ·
  tornado (margin −0.98/+0.86, capex +0.40/−0.40, NWC −0.10/0, growth
  −0.03/+0.01) · +1 point each (margin +24.4 m, capex −32.2 m, NWC −2.0 m,
  growth +0.2 m) · why growth costs cash (per €1 of new revenue −0.058 in
  its year, +0.042 after; at 9 % FCF −0.24/−0.10/+0.06 vs base) · [the
  value-driver formula slide was DROPPED, 29 Oct: "too advanced"] · an
  abbreviations slide (EV, EBITDA … PE in full words) · WACC/g · history vs plan both directions
  · margin jump (+€2.75 m FY2026) · inside/outside view (Kahneman &
  Lovallo 1993; Flyvbjerg) · football field · walk-away (BATNA, anchoring)
  · margin-for-a-price table · model risk (JPMorgan 2013 task force,
  Herndon/Ash/Pollin 2013, TransAlta 2003). Figures recomputed in Python.
  ⚠ **openpyxl writes post-2010 functions without their `_xlfn.` prefix** —
  ISFORMULA read #NAME? until written as `_xlfn.ISFORMULA`. Any generated
  workbook using IFS, XLOOKUP, ISFORMULA etc. needs the prefix.
  ⚠ **A data table's input cell must be on the table's own sheet.** Session
  1's page originally put the WACC × g table on the Cover with inputs on
  Inputs, which Excel refuses; fixed 26 Oct 2026 (it lives on Inputs).
- **Session 3 — *The three statements, linked* (`week4.html`, built 2 Nov
  2026), `total:7`, a self-run MANDATE on Session 2's pattern.** The data
  room is open; Boreal's due-diligence advisers (fictional **Halden & Co.**)
  write that the FY2024/FY2025 balance sheets do not balance and the cash
  flow statement does not end on the balance-sheet cash; the CFO hands
  the team the draft pack. **Meridia's historical statements are defined
  here for the first time** and agree with the canonical history: interest
  3.4 · 3.3 · 3.2, tax = 24 % of PBT rounded to 0.1 (2.4 · 3.1 · 3.6), net
  income 7.8 · 9.7 · 11.6, dividends 3.0 · 3.4 · 6.4, debt repaid 2.0 a
  year (debt 75.0 → 73.0 · 71.0 · 69.0), cash 11.8 → 11.0 · 10.5 · 9.0,
  receivables 24.6 · 26.4 · 28.1 · 29.6, inventory 2.1 · 2.2 · 2.3 · 2.4,
  payables 12.7 · 13.4 · 13.8 · 14.3, fixed assets 120.0 → 122.4 · 125.8 ·
  129.4, share capital 40.0, retained earnings 30.8 → 35.6 · 41.9 · 47.1
  (FY2022 = the opening column). **The draft's three planted errors (four
  cells):** CF FY2024 working capital +1.4 (sign) · CF FY2025 dividends
  paid 0.0 (missing) · BS FY2024 RE 45.0 from profit BEFORE tax · BS
  FY2025 RE 50.2 (carried forward). Steps: letter + pack (`w4_team`) ·
  link map (A B B C A D E E) + four €1.0 m events (ΔNI/Δcash 0/−1 ·
  −0.76/+0.24 · 0/+1 · 0/−1) + bike-shop drawer · six checks × FY2024/25
  (−3.1/−3.1 · 2.8/9.2 · 2.8/6.4 · 3.1/0 · 2.8/0 · 0/0; balance checks
  say THAT, movement checks say WHERE) · fix (causes S M W F, corrections
  checked live until every check is 0.0) · price (€2.48 unchanged; draft
  cash → ND 50.8 → €2.71; no dividend → €2.64; €0.16 a share = leakage) ·
  reply (4 parts) → Netlify `meridia-tieout-team-…` (a NEW project) →
  hand in (`w4_memo`, `w4_site`) · **`jeopardy.html?set=s3`** (sets now
  carry their own back link). Optional workbook
  `files/meridia-cold-historicals-draft.xlsx` (values only, the draft,
  generator `_private/gen-meridia-historicals.py`). Every figure
  recomputed in Python and in the page's own model under Node, 2 Nov
  2026; probed headlessly 7/7, no errors, no overflow at 500 px. Run sheet
  `_private/week4-runsheet.md`. Session 4 starts from the corrected pack.
- **`week4-slides.html` — the instructor's deck for Session 3 (5 Nov 2026,
  the day of the session).** Jan Erik: "create slides for week 4". The GBS
  deck engine (as `session2-slides.html`), 15 slides, ~21 min of slides
  opening each step, written to WRITING.md. **Answers only on the slide after
  their step**: the four events (0/−1 · −0.76/+0.24 · 0/+1 · 0/−1), the
  twelve checks (−3.1/−3.1 · 2.8/9.2 · 2.8/6.4 · 3.1/0 · 2.8/0 · 0/0), the
  four corrections (+1.4 → −1.4 · 0.0 → −6.4 · 45.0 → 41.9 · 50.2 → 47.1)
  and the prices (2.48 · 2.71 · 2.64 · dividend 0.16 a share = leakage).
  A gold "▶ Slides" button in week4.html's top bar.

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
- **The team board (5 Nov 2026, before Session 3).** Jan Erik: "show the
  teams and let them change as with the Business Intelligence class".
  `wall.js` and `teams.js` are copies of BI's (namespace `finmod`, globals
  `FmWall` / `FmTeams`, six teams A–F, keys `finmod_team`): join, move,
  rename, "+ Add a member", × to remove, polled every 8 s. Mounted on the
  hub (`#teams`, under the presence button) and in week4.html Step 1 above
  the team line; joining fills `f_team` with "Team X · name — members"
  unless a member has typed their own line. No shared team fields yet
  (one laptop per team). Writes go to `finmod/_wall/...`: the deployed
  rules have no `_wall` block for finmod, so today the `$sid` wildcard
  carries them (read true, any non-deleting write); a proper `_wall`
  block, identical to bi's, was added to `firebase-database-rules.json`
  and takes effect when the file is next published.

- **Week 4 without Netlify (5 Nov 2026, during class).** Jan Erik: "replace netlify with an upload possibility or something else". Step 6 now hands the reply in on the page only: "Hand in the reply" saves it to `w4_memo` (read in admin2). The address field `f_site` and the folder/drop steps 6b–6c are gone; "Show the reply full screen" opens it in a new tab for the quiz. Deck slides 14–15, the Jeopardy "Your reply" question and the hub blurb follow. Session 2 still used Netlify.
- **Session 4 — *Forecast, plug, circularity* (`week5.html`, `w5`, built 11 Nov
  2026 for Thu 12 Nov), `total:7`, a self-run MANDATE on Session 3's pattern,
  handed in on the page (no Netlify).** Boreal's bank (fictional **Banca del
  Litorale**) asks for a five-year forecast that balances, the use of a €15 m
  revolving facility, two covenants (net debt ÷ EBITDA ≤ 3.0, EBITDA ÷
  interest ≥ 4.0) and the affordable dividend. The model starts from Session
  3's corrected FY2025 balance sheet (170.4). **Drivers, defined here first:**
  220.0 k pallet positions × €820 = 180.4; base +3.5 % / +3.1 % (= 6.7 %),
  margin 16.1 %, receivables 60 days of revenue, inventory 6 and payables 34
  days of operating costs, D&A = opening fixed assets ÷ 12 years, capex 8 %,
  tax 24 %, repayment 2.0 a year, rate 4.6 % (FY2023–25 interest ÷ average
  debt), payout 50 %, minimum cash 8.0. Lender case +1.0 % / +2.0 %, 14.5 %,
  capex 7.5 %, receivables 70 days. Results (Python `fm5.py` = the page's JS
  under node): base revenue 192.5 … 249.6, EBITDA 31.0 … **40.2** (the Step 1
  guess), FY2026 AR 31.6, D&A 10.8, capex/D&A 1.43; opening-balance interest
  FY2026 avail 7.30, draw 0.70, facility 6.71 by FY2030; average-balance
  rounds 3.128 → 3.1437 → 3.1438 (three rounds), facility 6.68; lender FY2026
  draw 5.00 (ΔNWC 5.75 + dividend 4.91), ND/EBITDA peak 2.37, cover low 8.31,
  facility 8.33 by FY2030; **at 0 % payout the lender case's FY2026 cash
  available is exactly 8.00, so every FY2026 dividend in the lender case is
  borrowed**; base max payout without a draw 41.8 %. Steps: request + guess
  (`w5_team`, `w5_pred`) · drivers + operating table + 5 checks (`w5_drivers`)
  · plug (cash only vs minimum cash + facility, base/lender) + 4 checks
  (`w5_plug`) · circularity (rounds table, two methods, Excel iterative
  calculation + circuit breaker) + 4 checks (`w5_circ`) · bank (covenants,
  payout input) + 5 checks (`w5_lender`, `w5_div`) · reply (4 parts) →
  `w5_memo`, full screen / download / copy · **`jeopardy.html?set=s4`**.
  "In Excel" drawers give the formulas; no workbook file this week and the
  numbers were NOT recalculated in Excel (Python and node only). Probed
  headlessly 11 Nov 2026: 7/7, no errors, 500 px fits (long `<code>` in the
  drawers had overflowed: they wrap now).
- **`week5-slides.html` — a LECTURE deck for Session 4 (12 Nov 2026, the day of the session); the page became HOMEWORK.**
  Jan Erik: "slides to explain the theory (with examples to learn by examples) — I want them to do the exercises on
  the page as homework … if time allows also other topics we did until now". 32 slides, generated by a scratch
  script from week4-slides.html's engine. Parts 1–4 teach Steps 2–5 on a SECOND business, **Forno Lumen**
  (fictional bakery chain, Lausanne, € thousand): 4 × 500 = 2,000 → 5 × 520 = 2,600, margin 12 %, AR 30 days of
  revenue, inventory 5 / payables 20 days of costs (NWC 92.1 → 119.7, +27.6), FA 1,200 ÷ 10 = D&A 120, capex 500
  (ratio 4.2), loan 600 at 5 %, repay 100, tax 20 %, payout 30 %, cash 150, minimum 100. Opening interest: NI 129.6,
  CFO 222.0, cash available −266.9, draw 366.9, BS 1,925.0 both sides. Average interest: rounds 27.50 → 36.64 →
  36.77 → 36.77, draw 370.69, ND/EBITDA 2.47, cover 8.5, breach at EBITDA 256.9 (−18 %), every euro of the 37.3
  dividend borrowed (−233.4 without it). **Meridia appears only with FY2025 figures and the method**, so the page's
  checks stay the homework. Part 5 reviews S3 (four €1 m events, the WC sign, the RE roll-forward) and S1–S2 (EV
  159.36 = 26.04 + 133.32, TV 84 %, → €2.48, +1 point margin +24.4 vs growth +0.2). week5.html now says the reply
  is due before Session 5 (Thu 19 Nov, 18:45) and the quiz opens Session 5; "▶ Slides" in its top bar.
- **Python lab — `python-lab.html` (15 Nov 2026).** Jan Erik asked for in-browser Python and SQL labs;
  this is the Python one, on `/shared/codelab.js` (Pyodide 314.0.7 = Python 3.14.2 from jsDelivr, the
  approved CDN exception; pandas 3.0.2 and matplotlib 3.10.8 load only in Exercises 5–6). A practice
  page, not a session and not Excel: `<body data-course="finmod">`, no `data-module`, nothing counted,
  nothing graded; "n / 6 solved" bar. Linked from the hub (a ghost button under the team board, and a
  tool card "Python, in the browser (practice)"). **The model is Session 1's v01 line for line**
  (= `model()` in week3.html), no new figures: growth 6.74 % / 5.50 %, CAGR 6.12 % · revenue 192.49 /
  205.38 / 219.14, EBITDA 30.99 / 33.07 / 35.28 · FCF 9.62 / 10.22 / 10.85 · PV FCF 26.04 + PV TV
  133.32 = EV 159.36 → €2.48 (TV 84 %) · WACC × g table 7.5–9.5 × 1–3 (8.5/2 = 2.48, 9.0/2 = 2.20,
  9.5/2 = 1.95, 7.5/3 = 4.16) · plan 2.98 / base 2.48 / lender 1.89 as a bar chart. Exercises 5–6 use
  `value(wacc, g, growth, margin, capex, nwc)` from the `<script type="text/python" id="meridia">`
  block, shown to students in a drawer. Checks: `vars` with tolerances (1–4) and the Python scripts
  `chk5` (5 × 5 table, detects a transposed table) and `chk6` (prices, three bars, title, y-label).
  Figures recomputed in Python; probed headlessly 15 Nov 2026 with the real engine: 6/6 model answers
  Correct, starter code and wrong answers give the intended message, the chart renders, 390 px fits,
  no page errors.

- **Session 5 — *Free cash flow, honestly* (`week6.html`, `w6`, built 25 Nov 2026 for Thu 26 Nov), `total:7`,
  a self-run MANDATE on Session 4's pattern, HOMEWORK after a lecture deck (as Session 4), handed in on the
  page, due before Session 6 (Thu 3 Dec, 18:45).** ⚠ The hub's TERM still dates w6 to week 06 (Thu 19 Nov);
  it was taught 26 Nov. Boreal asks for Meridia's stand-alone value (no synergies). **FCFF** = EBIT × (1 − 24 %)
  + D&A − capex − ΔNWC, from week5.html's `model()` unchanged (base, average interest, payout 50 %):
  **9.19 · 10.09 · 10.69 · 11.34 · 12.04**; FY2026 EBIT 20.21, NOPAT 15.36, FCFF − NI −3.78; lender FY2026
  3.38. Reconciled two ways on the page (CFO − capex + interest × 0.76; lenders + dividend + Δcash), green
  every year; FCFF does not depend on payout or interest method. **WACC from REAL, dated market data**
  (the first in the course): Bund 10y 2.85 % on 31 Dec 2025 (BMF Monatsbericht Jan 2026); Damodaran 1 Jan
  2026 ERPs mature 4.23, Spain 5.78, France 5.01, Italy 6.69 (rating-based totals; downloaded ctryprem.xlsx);
  Damodaran Western Europe betas 5 Jan 2026, Transportation (56): βu corrected for cash 0.535 → 0.54, D/E
  77.1 % → 0.77; Europe EV/EBITDA 5 Jan 2026 Transportation 12.6, Trucking 9.1, Restaurant/Dining 11.5.
  **Case figures introduced here**: revenue split Spain 60 / France 25 / Italy 15 %; Boreal's size/unlisted
  premium 3.0 points on the cost of equity; Kd 4.6 % (Session 4). Results: ERP 5.72, βL 0.856, Ke 7.75 + 3.0
  = 10.75, D/V 43.5 %, Kd after tax 3.50, **WACC 7.59 %** (5.90 % without the premium). DCF at 7.59 / g 2 %
  (end-of-year discounting to 31 Dec 2025, net debt 60.0, 40.0 m shares): Σ PV 42.66, TV 219.69, EV
  **195.04**, **78.1 % in TV**, **€3.38**; exit 9.1× → TV 365.68, EV 296.31, €5.91 (85.6 %). Four tests:
  TV share · implied multiple 5.47× · implied g of the exit multiple 4.16 % · normalised FY2031 (capex =
  FA × (1/12 + g), ΔNWC = NWC × g) FCFF 17.39 vs 12.28 → EV 258.45, €4.96. Range rows: lender case €2.27,
  Session 1's 8.5 % €2.68, no premium €5.53. ⚠ **The value moved from Session 1–2's €2.48**: different
  forecast (5 years, balance-sheet D&A and NWC) and a sourced WACC; Session 6 (sensitivity, football field)
  should start from these figures. Steps: request + guess (`w6_team`, `w6_pred`, answer band 75–85 %) ·
  FCFF + 5 checks (`w6_fcf`) · WACC data pack + calculator + 5 checks (`w6_wacc`) · DCF two ways + 5 checks
  (`w6_tv`) · four tests + 5 checks, reply parts 3–4 (`w6_value`, `w6_rests`) · reply → `w6_memo` · quiz
  **`jeopardy.html?set=s5`** (added). No workbook (as Session 4); "In Excel" drawers. Python (scratch
  final.py) = the page's JS under node, 25 Nov 2026; NOT recalculated in Excel. Probed headlessly: 7/7, no
  page errors, 1280 and 420 px no sideways scroll, state survives reload.
- **`week6-slides.html` — the lecture deck for Session 5 (25 Nov 2026), 26 slides, week5-slides' engine.**
  Parts 1–4 teach Steps 2–5 on **Forno Lumen** continued (€ thousand): FY2026 FCFF −254.0 vs NI 129.6, three
  routes (222.0 − 500.0 + 24.0; lenders −242.9 + dividend 38.9 − cash 50.0); tax on EBIT 38.4 vs paid 32.4;
  WACC 7.69 % (restaurants βu 0.59, D/E 0.39 → βL 0.774; Bund 2.85; Switzerland ERP 4.23; premium 3.0; Kd 5 %
  × 0.8; 5.53 % without premium); FY2027–28 FCFF 133.8 / 138.7 (5 shops, +2 % per shop, capex 150); Σ PV
  −9.4; Gordon TV 2,486.0 → EV 1,981.2, **100.5 % in TV**; exit 11.5× → 3,733.0, EV 2,979.6, implied g
  3.83 %; implied multiple 7.66×; normalised FY2029 105.9 (capex 187.8 > 150) → EV 1,480.9 (the test goes
  DOWN for the bakery, UP for Meridia); EV − net debt 450.0 = 1,531.2. Part 5 = the Session 4 homework
  answers. Meridia only with FY2025 (FCF 9.28) and the method. "▶ Slides" in week6.html's top bar; hub card
  has `slides` and `bring`.
