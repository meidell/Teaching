# SUMAS · CrS Green AI — notes for Claude

Read the root `CLAUDE.md` first; this file holds only what is particular to this course.

## SUMAS · Career-related Studies Year 2 · Green Artificial Intelligence — `SUMAS/green-ai/`

Built 26 Oct 2026 from Giorgia De Palma's brief (SUMAS Academic and Student Affairs,
Oct 2026), the pathway slides "SUMAS_CrS_GREEN AI_May2026" by the previous instructor, the
CRS Assessment Tree (Applied Project, Year 2) and "CP_GREEN AI – info assignments".
High-school students (CrS = the IB Career-related Programme pathway at SUMAS), about 15,
in schools in India, Dubai, Bangkok and Switzerland; everything is online and recorded.

- **The project:** "Pick a problem in your city. Use AI to crack it. Show how." Four steps
  — PICK, INVESTIGATE, PROPOSE, PITCH. Three phase essays of 1,500 words build the final
  report of 4,500 words; a 3–5 minute presentation with 10 slides from 15 Feb 2027.
- **Grading (Assessment Tree):** Applied Project 35% of Year 2 = Project Report 25% +
  Presentation 10%. SUMAS calls each essay deadline a "graded assignment" of the work in
  progress; Giorgia: the final report is the main assessment. Both statements are on the
  pages, as SUMAS wrote them.
- ⚠ **Dates.** SUMAS gave WEEKS, not days: S1 in 26 Oct – 6 Nov, S2–S3 in 9–20 Nov,
  essay deadlines in the weeks of 30 Nov, 4 Jan and 25 Jan. Jan Erik still has to propose
  three session dates to Giorgia. `handin.html → CAPSTONE_SCHEDULE` (inline, the only copy)
  uses the Friday 23:59 of each deadline week; the final report (12 Feb) and the slides
  (14 Feb) are placeholders marked "to be confirmed". The calendar table is written twice,
  in `index.html` and `session1.html` — change both.
- **Pages:** `index.html` (hub), `session1–3.html` (run sheets on the
  GBS/enterprise-security archetype: `green.css` = esc.css core + a light SUMAS top bar +
  additions; `session.js` = the engine — a `.step` is done when its `[data-done]` button is
  pressed, after the fields in `data-need`), `journal.html`, `handin.html` (the
  capstone-ba uploader ported; `handin.css` is a copy of capstone.css), `admin.html` stub.
  ⚠ `courseprogress.js` totals must equal the `.step` counts: S1 8, S2 8, S3 7.
- **The AI Process Journal** is ONE workbook field, `work/journal`, holding the entries as
  JSON; progress.js syncs it and login.js restores it on another device. It prints as the
  appendix, filtered by phase. Nothing else stores journal data.
- **Facts on the pages, checked 26 Oct 2026:** Li, Yang, Islam & Ren (2025) CACM 68(7)
  54–61, doi 10.1145/3724499 — GPT-3 training ≈ 700,000 L on site, 5.4 million L total,
  500 ml per ~10–50 responses (from the paper's own text, v5); Nearing et al. (2024)
  Nature 627, 559–563, doi 10.1038/s41586-024-07145-1 — reliable to 5 days in ungauged
  basins; Google Nov 2024 — 100 countries, ~700 million people; Hallegatte (2012) World
  Bank WP 6058, doi 10.1596/1813-9450-6058 — 23,000 lives a year; Google Aug 2025 — median
  Gemini text prompt 0.24 Wh, 0.26 ml, 0.03 gCO2e. Session 2's verification lab uses two
  of these as the real references and two INVENTED ones: one whose DOI resolves to an
  unrelated real paper (Jeon et al. 2023, Seoul — 10.1016/j.atmosenv.2023.119733) and one
  that 404s (10.1038/s41893-022-00874-q). Re-check both before reusing: a 404 DOI can be
  assigned later. The next-token probabilities in Session 2 are invented and say so.
- Own `ns`/`keyPrefix` `green-ai`, joinCode `GRAI`, unlisted, in robots.txt; the SUMAS
  landing page picks it up from courses.json. ⚠ **The `green-ai` rules block (a copy of
  capstone-ba's without `_teams`, `_forum`, `_wall`) must be DEPLOYED** before the link
  goes to students, or sign-in, the journal sync and hand-ins are refused.
