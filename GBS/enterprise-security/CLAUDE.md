# GBS · Enterprise Security — notes for Claude

Split out of the root `CLAUDE.md` on 23 Oct 2026 (one file per course, loaded when working in this folder). The site-wide rules — shared runtime, data model, rules, secrets, conventions — stay in the root `CLAUDE.md`; read that first.

## GBS · Enterprise Security, Cyber Warfare & Asset Protection — `GBS/enterprise-security/`

Built 9 Oct 2026 from the module specification "ESCWA" (5 graduate credits;
the PDF carries the **International Institute in Geneva** letterhead, Jan Erik
filed it under GBS).
⚠ **Branded IIG, not GBS (9 Oct 2026, Jan Erik: "change the icon and style to
iig.ch")**: theme `/shared/themes/iig.css` (IIG's own palette from iig.ch's
stylesheet — navy `#0a2540`, gold `#c9a961`, warm surface `#faf9f7` — plus
its type: Cormorant Garamond headings, Montserrat labels, Avenir body, each
with a system fallback because the repo ships no web fonts), the white
`iig-logo.avif` with an `iig-logo.png` fallback in a `<picture>`, on a navy
bar. Gold is a fill: readable gold text is `--accent-deep #86692c`, and gold
buttons carry **navy** text (white on IIG gold is 2.25:1). `courses.json`
has an `iig` theme and the `config.js` mirror an `iig` entry. The folder,
`school:"GBS"` (shared sign-in with the GBS courses) and the listing on
`/GBS/` stay as they are — Jan Erik confirmed 9 Oct 2026 that it remains on
the GBS landing page. Fridays **17:00–19:00** (corrected 16 Oct 2026; it was written as 17:15–19:15), first **16 Oct 2026**, **14
sessions**. On the creator-economy run-sheet pattern (`esc.css` = `creator.css`
+ additions at the END; `wall.js` = creator's with the namespace changed,
global `EscWall`; `courseprogress.js` a port).

- ⚠ **Session 7 is the MIDTERM (27 Nov), Session 14 the FINAL.** Neither has a
  page or a chapter; module ids are session numbers `w1`…`w6`, `w8`…`w13`, and
  `w7`/`w14` must never be reused. **Dates after the winter break are
  provisional** (15/22/29 Jan, final 5 Feb 2027); change `date` in the hub's
  `TERM`, the only place the plan is written.
- The syllabus's 17 slots are fitted into 14: topics 2+4 share Session 2,
  12+13 share Session 11, revision is folded into Session 13. Readings on the
  hub are proposals; Mazarr (Session 2) is "Summary and Chapter 1" — check the
  pages before students are told.
- **Assessment is the syllabus's: 10% weekly reflections · 45% midterm · 45%
  final.** The reflection (quote 1–5 lines + max 300 words, before class, 3
  picked at random, unsubmitted = 0) is collected **on the session page, not
  Google Classroom** as the PDF says: `work/refl<N>_quote|_ref|_text|_ai|_submitted`,
  `N` = the session it is DUE for (Session 1's page collects `refl2_*`). It is
  not a step, so it never enters the bar. The random pick is done from the
  dashboard by hand — there is no picker yet.
- Session pages count `.step` blocks pressed (SECTIONS), like creator — the
  `.q`/`.cl-row`/`[data-work]` trap does not apply, but `total` in
  `courseprogress.js` must equal `SECTIONS.length` (w1 = 7).
- Session 1's two walls: `_wall/w1p` (the sealed prediction, `T:<k>|K:<k>`)
  and `_wall/w1` (the threshold game, an 8-letter string over `CESGWA-`).
  No answer key on purpose. The Step 2 reveal stays hidden until the student
  has sealed Step 1 (or presses "arrived late").
- **Running case: Arvane Commodities SA**, fictional Geneva trader with a
  Constanța terminal, twelve chartered vessels and a Singapore office; the
  incidents around it (Viasat/Enercon, NotPetya, Balticconnector, ICRC,
  CrowdStrike…) are real and kept to the public record.
- ⚠ **The `escwa` rules block (a copy of `creator`'s) must be DEPLOYED** before
  the link goes to students, or registration and the walls fail (both say so).
- **`roles.html` — "Who answers" (20 Oct 2026), a reference page, not a
  session.** Written from the job profile of the practitioner who was first
  meant to teach this course (the top incident seat at a large technology
  company); the person is **never named and nothing is quoted** — each duty
  is rewritten as what the role does, with an "at Arvane" line under it.
  Five blocks: the **incident director** role card (eight duties: decides
  the approach · designs and runs dry-runs · leads the investigation and
  keeps the CISO informed · expertise to projects · oversees the security
  services incl. **automated validation** at the scale of tens of thousands
  of launches · product-issue mitigation · sets the team up to the third
  line · FIRST); the **three lines of defence** with Arvane examples and a
  six-case "which line failed?" self-check (local only, answers 1,0,2,1,2,0,
  mixed on purpose); **FIRST** (CVSS, TLP, first.org); where Sessions 5, 9,
  10 and 12 use it; and the **Session 9 scorecard** (three 0–2 questions =
  duties 1–3), published in advance. No `.step`, no ticks, nothing counted.
  The hub's plan entries for S5/S9/S10/S12 and its References block link
  it, and **Session 2's tripwire step gained a fourth part, `w2_owner`
  "who decides"** (the seat, not a person) — on the board too; the hand-in
  still requires only the first three.
- **Session 2 (`week2.html`, 23 Oct 2026) — seven steps, `total:7`.** Opens
  Session 1's sealed `w1_nx` pick from localStorage and boards `w1_next`; a
  six-case classify against Mazarr's four marks (answers 1,0,3,2,0,0, mixed
  on purpose, first attempt wins, a reason per pick); the **salami game**
  (eight fictional slices against the Constanța terminal arriving one at a
  time, absorb/act, the first "act" is the line → `_wall/w2` as `L:<n>`, 9 =
  never acted); the **GNSS mechanism in detail** with a live link-budget
  widget (FSPL = 20 log d + 20 log f − 147.55 at 1575.42 MHz; a 1 W jammer
  at 10 km arrives at −86 dBm, ≈ 23,000× the −130 dBm signal — recomputed in
  Python), jamming vs spoofing, C4ADS 2019 (9,883 instances / 1,311
  vessels), Finnair–Tartu April 2024, five defender checks; the **asymmetry
  table** (six instruments × attacker/Arvane cost, five orders of magnitude →
  `_wall/w2a` as `A:dddddd|D:dddddd`, medians per instrument); **Arvane's
  tripwires** (`w2_absorb`, `w2_act`, `w2_tell` — the first page of the
  crisis protocol Session 9 plays); the close seals `w2_nx` on Rid and
  collects **Reflection 2 as `refl3_*`** (Rid 2012, DOI verified on
  Crossref). The team is prefilled from `work_w1_team`; **no roles** since
  23 Oct 2026 (Jan Erik: "some groups are 4 — they will work together"),
  so `w2_team` is `Team X · mates` and an old saved role is skipped. Written in the factual register
  (no instructor first person); Session 1 and the hub still carry the older
  voice. The `_wall/$mod` wildcard covers both new nodes — no rules change.
