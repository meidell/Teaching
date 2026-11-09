# SUMAS · OMBA500 Capstone — notes for Claude

Split out of the root `CLAUDE.md` on 23 Oct 2026 (one file per course, loaded when working in this folder). The site-wide rules — shared runtime, data model, rules, secrets, conventions — stay in the root `CLAUDE.md`; read that first.

## SUMAS · OMBA500 Capstone "AI for Good" — Online Masters — `SUMAS/omba500/`

Built 8 Oct 2026 as an **independent copy of `SUMAS/wind`**, "as is", for the
second Moodle course of the same capstone: *2026 - Online - Capstone: AI for
Good - Online Masters* (id 1307). `SUMAS/wind` is the **Green Term** edition
(id 1456); the two Moodle courses carry identical text and differ only in
what is hidden. Everything the `SUMAS/wind` section says about the engine
applies. What differs:

- ⚠ **Self-check replay bug, fixed 28 Oct 2026 (all three `capstone.js` copies:
  omba500, wind, capstone-ba).** Since 8 Oct, a page reloaded in a browser where
  the student had already answered threw in `quizEngine` (`sc` used before it
  existed): the quiz stopped after question 1, and from `CAP.recall` the rest of
  the inline script died, so the end-of-week self-check never rendered. A fresh
  browser worked — hence Marilou (Chrome broken, Safari fine) and Aron (the
  reverse). Tested in Playwright Chromium + WebKit, every week, fresh and after
  use. Same day: the quiz now also restores picks from
  `<ns>/<sid>/mod/<mod>/quiz` and the steps from `<K>_done_<mod>`, so answers
  given on one device show on another.
- **Own id / ns / keyPrefix `omba500`**, code `OMBA500` (so the SUMAS
  landing page files it under *Online MBA*), term "Online Masters 2026".
  Registry entry in `courses.json` (same 27 modules, hrefs moved), mirror in
  `/shared/config.js`, a copy of the `wind` rules block in
  `firebase-database-rules.json` — ⚠ **must be deployed before the link goes
  to students** — and `Disallow: /SUMAS/omba500/` in `robots.txt`.
- **Its own forums, progress and messages** (`omba500/_forum/…`,
  `omba500_auth`); nothing is shared with `wind` except the sign-in, which
  the SUMAS school-wide sign-in carries across on the same device.
- **The showcase and its PDF were NOT copied**: the hub, Week 2 and Week 4
  link `/SUMAS/wind/SUMAS-Wind-2040-Showcase.html`. The old
  `wind_energy_2040_course.html` redirect stub was not copied either.
- **`schedule.js` is the wind one unchanged** (`START = 2026-10-05`), which
  matches Moodle 1307's "Week 1 – 5-12 October 2026". Change it there if this
  cohort runs on other dates.
- ⚠ **The two folders are independent.** A fix in `wind` reaches `omba500`
  only if ported by hand, and vice versa.
- ⚠ **omba500's forums NEVER CLOSE** (12 Oct 2026, Jan Erik: "leave the
  forums open all time", after a student travelling in Week 1 found Forum 1
  shut). `closed()`/`reClosed()` in `forum.html` return false; deadlines are
  still shown, the forum list and the week-page chips read "… · still open",
  and a late post still carries the "after the deadline" tag (and ⏰ in
  `followup.html`), so lateness stays visible for marking. `SUMAS/capstone-ba` got the same never-close
  rule on 14 Oct 2026, and **`SUMAS/wind` on 20 Oct 2026** (Horst had found
  Forum 1 shut there on 8 Oct while its week page said "still open"); its
  `capstone.js` is again a namespace-substituted copy of omba500's.
- **Week 1 carries the Moodle course's own materials (8 Oct 2026, both
  `omba500` and `wind`)**: the two reference PDFs from Jan Erik's archive
  (`1.2 Strategic-Forecasting.pdf`, `2.2 From Stakeholders to Systems.pdf`)
  are in `w1slides/` as downloads, and twelve of their pages, as JPEGs in
  the same folder, sit inside the five concept-highlight blocks
  (`.slidebox`, CSS at the end of `capstone.css`, no `data-step`, so the
  week total is unchanged at 10). ⚠ **Every link on Moodle's Week 1 is on
  the page**, next to the site's own, because Jan Erik asked that none be
  left out. The Moodle Meadows PDF (research.fit.edu) answered 404 on
  8 Oct 2026 and is kept anyway; donellameadows.org sits beside it.
- **Week 2 follows the same pattern (12 Oct 2026, both folders)**: reading
  2.1 is `w2slides/week2-gas-wind-industrial-energy.pdf` with its slides 2–9
  as `gw-N.jpg` slideboxes in s1/s2/s4; 2.2 is the Week 1 briefing, linked
  from `w1slides/`. Slides 3–5 and 9 sit in a section **without
  `data-step`** ("Gas, wind and the industrial energy fight"), so the week
  total stays 12. Three `.soup` notes flag the deck's own errors, each checked
  in Python: 400 TWh of industrial energy is ~2,700 TWh by Eurostat (gas 31%,
  ≈ 870 TWh); "~70%" LCOE fall is 54–60%; the €65 ETS price does not cover
  green steel's €180 premium; "10× EU capacity" is 24–30× offshore. The
  energy-units video is a YouTube search link — the Moodle export had no link targets.
- **Week 5 pressure-test section (27 Oct 2026, omba500 only — not yet
  ported to `wind` or `capstone-ba`)**: "Three questions to put to your own
  2×2", between s3 and s4, written from the on-campus MA500 deck
  `Week5_Pressure_Testing_Scenarios.pptx` (archive, `2026 Capstone
  Sustainability, Forecasting and AI/`). The deck names last term's students
  on every slide, so it is **rewritten as page text, never shown as slide
  images**, and student names are removed. Contents: Schoemaker's four kinds of
  "scenario" + a `CAP.classify('kind')` sort, three post-draft pitfalls (credited to the course, not Schoemaker — unverified there) with the
  official-future check (250+ GW vs the member states' 2040 goal 259–261 GW,
  Dec 2024 update, verified), the four policy→cost channels, the hidden
  supply-chain axis, options A/B/C, the four-worlds consistency table, and
  one new field `w5_axisopt` (in `courses.json → project.sections`; w5 total
  13 → 14 via `count.py`). The deck's "35% of 2040 capacity on non-Chinese
  vessels (Kuehne)" could not be verified: the Kühne Climate Center study
  (Jan 2026) is about 2030 (rest of world ~175 GW with €2.5–4 bn/yr of
  newbuilds, ~140 GW without; China ~225 GW), and that is what the page
  quotes. The section has no `data-step`. The rest of the archive's Week 5
  kit (Loom decks, Courtney postures, BLUF/SCQA, CFO branching scenario,
  Section 5 strategic implications) is team-based strategy work and was
  deliberately not used here.
- **Week 6 signpost section (1 Nov 2026, omba500 only — not ported to
  `wind` or `capstone-ba`)**: "Turn each early signal into a signpost",
  between s2 and s3, no `data-step`. Indicator + checkpoint + value per world
  + band; baselines verified: EU-27 offshore ~21 GW end-2024 (Europe 37),
  Europe connected 2.6 GW in 2024 (3.8 expected) — WindEurope; member
  states' 2030 goal 86–89 GW (Dec 2024; 111 GW in Jan 2023) → ~11 GW a year
  needed. Worked 2030 values on Week 4's matrix are ILLUSTRATIVE (50 / 42 /
  36 / 30 GW, band ±3). A signpost-check widget (`spA…spD`, `spU`, `spO`,
  step `sp`), the Danish zero-bid North Sea tender (5 Dec 2024, cancelled
  Jan 2025) read on both axes, and a new field `w6_signposts` (w6 total
  11 → 12 via `count.py`; added to `courses.json → project.sections`).
  ⚠ **Same day, the AI-energy figures were corrected**: "0.3–10 Wh per
  GPT-4-class query" was attributed to Luccioni et al., who tested open
  models ≤ 11B parameters (text generation 0.047 Wh/query; images 2.9 Wh
  mean, 11.5 Wh for SDXL ≈ half a phone charge — Table 2 and §4.1, not
  Table 3). Large assistants now use the 2025 published figures (Google
  0.24 Wh median Gemini prompt; OpenAI 0.34 Wh; Epoch ~0.3 Wh GPT-4o). The
  calculator defaults are 0.3 Wh/turn and 2.9 Wh/image, quiz Q4 is 7.9 g,
  the Forum 12 brief and Week 7's quiz were reworded. **Week 7's water
  calculator still defaults to 3 Wh per turn** (it feeds the off-site water
  estimate built on Li et al.'s assumptions) — revisit when Week 7 is built.
- **Activity check, 1 Nov 2026** (anonymous reads of `_forum/<id>/posts`
  and `<ns>/<sid>`): omba500 has 6 posting students and 64 posts/replies
  since 18 Oct (latest 31 Oct, Forum 10). **`wind` has none**: one probe
  post, and its only student node is Horst Prescher (an omba500 student)
  carried across by the school-wide sign-in. Weekly enrichment is therefore
  done in omba500 only; `_roster` cannot be listed anonymously, so a wind
  student who registered and never posted would not show.

- **Site hand-in for the phase reports (7 Nov 2026).** Moodle's submission tab
  for course 1307 was never set up (Marilou Rouzioux reported it to Student
  Affairs), so the three phase reports are handed in **on the site**, not
  Moodle. `handin.html` is capstone-ba's uploader ported (NS/K `omba500`,
  Ørsted vs TotalEnergies briefs, individual — no teams/report/glossary):
  `?p=p1|p2p|p2|p3` from `schedule.js PHASES`, file base64-chunked to
  `_files/<sid>`, receipt to `_submissions/<sid>`, one-line summary to
  `<sid>/work/handin_<pid>` (admin2's Handed in tab reads it). ⚠ **No course
  sign-in** (Jan Erik: "should not need to sign with a name nor a code"): the
  student types **name + email** on the form, `sid` = slugified name (or the
  signed-in sid if one exists); email is stored on the record. A prominent
  `.upbanner` on `index.html` points at the next still-open phase (auto, from
  schedule.js), and the "submitted on Moodle" copy became "handed in here".
  ⚠ **The `_files`/`_submissions` rules blocks were added to omba500 in
  `firebase-database-rules.json` and DEPLOYED + probed live 7 Nov 2026**
  (anonymous writes 200, whole-ns read 401). Three `_rulestest` probe nodes
  remain under omba500 (undeletable anonymously; dashboards skip `_` ids —
  delete from the console Data tab if wanted). Phase 1 due **Sun 8 Nov 23:59
  CET**. **Still open:** the 30-minute session booking Marilou also raised — no
  scheduler built yet; and omba500's `fmtDay` still formats in the reader's
  timezone (the Geneva-time fix in capstone-ba was not ported).

- **Week 7 rebuilt (9 Nov 2026, omba500 only — not ported to `wind` or
  `capstone-ba`)**: the WRITING.md pass over the whole page (every term —
  cumulative capacity, LCOE, learning rate, CRF, capacity factor, boundary vs
  threshold, WUE/PUE/EWIF — defined where it is used; two "By hand" boxes
  before each formula; instructions say which rows, which chart, which
  words), plus a new section between s2 and s3, **"Where the curve bent,
  2021–2024, and the three mechanisms that bend it"** (no `data-step`): a
  verified table of the cost reversal (IRENA June 2025: global offshore LCOE
  $0.079/kWh in 2024, +4 % on 2023, Europe $0.065 → $0.080, installed cost
  $2,852/kW; UK CfD strike prices in 2012 £: AR4 £37.35 (Jul 2022), AR5
  ceiling £44 with no offshore bids (Sep 2023), AR6 £58.87 for 4.9 GW (Sep
  2024); Ørsted Ocean Wind 1+2 stopped 1 Nov 2023, DKK 28.4 bn impairments
  of which 19.9 bn on OW1, "supplier delays and rising long-dated US
  interest rates"; Siemens Gamesa 4.X/5.X blades and bearings, €1.6 bn
  charge, Siemens Energy FY2023 loss ≈ €4.5 bn), three mechanisms (cost of
  capital with the CRF formula — 4 % → 7 % on $2,852/kW, 25 y, 45 % CF, $90
  O&M = $69 → $85/MWh, +23 %; supply chain and quality; learning slowing —
  the fitter's own rows learn 18 %/doubling 2010–24 but 6.5 % 2020–24), a
  cost-of-capital LCOE widget (`lc`) and one new field **`w7_bend`** (w7
  total 10 → 11 via `count.py`; added to `courses.json → project.sections`).
  The planetary-boundaries section gained a **rare-earth calculator** (`re`)
  on USGS MCS 2025 (world 390,000 t REO 2024, China 270,000 = 69 %, Burma
  43,000 → 31,000, Nd oxide $134 → $56/kg 2022–24) and IEA 2021 (DD-PMSG
  ≈ 95 % of offshore by 2040, REE demand from wind >3× by 2040, ~90 % of
  processing in China; the DD-PMSG bar on p. 64 reads 150–300 kg/MW — the
  calculator defaults to 200 and says so): at 11 GW/yr ≈ 2,100 t/yr = 0.5 %
  of world output — the boundary binds through processing concentration and
  dysprosium, not tonnage. The "last year's cohort 31×" line is gone. ⚠ **The
  water calculator was rebuilt on Li et al.'s own formula** (on-site =
  energy × WUE 0.55, off-site = energy × PUE 1.17 × EWIF 3.14 L/kWh, Table 1
  US average; 2.2 + 14.7 ml per request, 29.6 requests per 500 ml; training
  700,000 L on-site / 5.4 million L total) with two Wh-per-turn presets:
  **4 Wh**, Li et al.'s GPT-3 assumption (§3.3.2, 0.004 kWh from OpenAI's
  0.4 kWh/100 pages) — the default, so the page reproduces their numbers —
  and **0.3 Wh**, the 2025 published figure Week 6 uses; the page says the
  two differ by 13× and asks the student to state which they used. The old
  "15 ml per turn + 2 L/kWh + 3 Wh" defaults mixed sources and are gone.
  Forum briefs f7a/b/c in `forum.html` re-written to match; quiz Q3 (LCOE +23 %)
  and Q5 (rare earths) are new. Every figure is asserted in
  `_private/check_w7.py` (gitignored). Not changed: the Wright fitter
  (`CAP.wright`), the nine-boundary tap widget's structure, the recall
  questions, the Week 8 preview.
