# SUMAS · OMBA500 Capstone — notes for Claude

Split out of the root `CLAUDE.md` on 23 Oct 2026 (one file per course, loaded when working in this folder). The site-wide rules — shared runtime, data model, rules, secrets, conventions — stay in the root `CLAUDE.md`; read that first.

## SUMAS · OMBA500 Capstone "AI for Good" — Online Masters — `SUMAS/omba500/`

Built 8 Oct 2026 as an **independent copy of `SUMAS/wind`**, "as is", for the
second Moodle course of the same capstone: *2026 - Online - Capstone: AI for
Good - Online Masters* (id 1307). `SUMAS/wind` is the **Green Term** edition
(id 1456); the two Moodle courses carry identical text and differ only in
what is hidden. Everything the `SUMAS/wind` section says about the engine
applies. What differs:

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
  "scenario" + a `CAP.classify('kind')` sort, the three pitfalls with the
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
