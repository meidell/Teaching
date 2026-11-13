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

- **Teams on the wall + the written Jeopardy (30 Oct 2026, built for Session 3).**
  `teams.js` (`EscTeams`) is BI's `teams.js` with the namespace changed and five
  teams A–E: `_wall/teams/<row> = {n:name, src:'J:<T>'}` (newest row per name wins),
  `_wall/tn_<T>` for names — the `_wall/$mod` wildcard covers it, **no rules
  change**. Mounted on the hub (`#teamsBox`, section "Teams · for the term") and on
  Session 3 step 5 (the old letter + mates text field is gone; `f_teamsel`/`f_mates`
  are hidden and filled by the board, `w3_team` still saved). Anyone may add or
  remove anyone; any member renames. Jan Erik: "let the teams select a name (like
  for the business intelligence course) · let users be able to delete and add team
  members". **`jeopardy.html`** (two boards of 30 on Sessions 1–3 + Mazarr + Rid,
  `?set=r1|r2`, 45-min clock) is the GAME MASTER's screen; **`jeopardy-team.html`**
  is the teams' page: the open square is broadcast as `_wall/jeo_cur/master`
  (`Q:<set>|<key>|<pts>|<cat>|<question>`, written with a plain PUT because
  `EscWall.post` refuses instructor devices), a team types its answer →
  `_wall/jeo_<set>_<key>` as `T:<T>|<answer>` (newest per team, a device re-sends
  over its own row), "Answer" on the master lists every team's text with ✓ (+pts) /
  ✗ (0), scores go out on `_wall/jeo_score/master` (`S:name=pts;…`) and show on the
  team page; Close sends `Q:`. Manual +/− stays behind a button. Tested headlessly
  (fake DB, 20 checks). Tamperable like every wall; the scores that count are the
  master's browser.

- **Session 4 = "The arsenal" (`week4.html`, inserted 1 Nov 2026, `total:6`).**
  Jan Erik: "put in another week instead of week 4 (and make week 4 week 5)
  where we explain the main weapons and how this actually is done — by
  creating interactive gadgets". The plan shifted: **S5 = cables and
  satellites** (13 Nov, reading Bueger, Liebetrau & Franken 2022, European
  Parliament PE 702.557), **S6 = supply chain + risk frameworks merged**
  (20 Nov, topics 6+7, ENISA; NIST CSF for reference); the midterm stays S7
  on 27 Nov. Changed together: the hub's `TERM` (+ its header comment and the
  hero figure's S4/S5 labels), `courseprogress.js`, `courses.json` modules,
  `roles.html` (duty 5 is now Session 6, 20 Nov), and Session 3's "Session 4
  is about the physical layer" → Session 5. Session 3's sealed `w3_nx`
  prediction (cables as targets) and its Reflection 3 (Bueger & Liebetrau
  2021, `refl4_*`, due 6 Nov) were NOT moved: the reflection is drawn in S4
  step 1, the prediction opens in S5.
  Gadgets, all local simulations (nothing sent anywhere): URL dissector
  (registered domain read from the right; look-alike, punycode, brand-in-name
  verdicts), a phishing mail with five tells (`w4_tells`, step needs ≥ 3), a
  password guessing-time table (four illustrative speeds + "reused = 0 s"),
  a SQL-injection login backed by a real mini WHERE interpreter (`sqRun`:
  strings, `--`, AND/OR/NOT, parameterised toggle), a 16-byte buffer overflow
  into `is_admin` and the return address, the patch gap (MS17-010 → WannaCry
  59 d / NotPetya 105 d, Struts → Equifax 67 d), a lateral-movement simulation
  (9 machines, 5 defences; **the smallest set that contains it is patch +
  unique local admin + admin workstations — keep it so no single switch is
  enough**), a beacon in a seeded firewall log (answer GVA-PC-0231), real
  AES-256-GCM ransomware/wiper demo (WebCrypto), amplification calculator
  (CISA TA14-017A factors). Close: team attack path → `_wall/w4` as
  `P:<4 of a|b|c>|B:<1-4>`; Reflection 4 = `refl5_*` on the EP study.

- **Bueger & Liebetrau (2021) as a protected PDF (1 Nov 2026).** The article
  is Taylor & Francis, paywalled — NOT open access (the hub and Session 3
  said so wrongly until 1 Nov; now "journal"). It is served only encrypted,
  `readings/bueger-liebetrau-2021.pdf.enc`, through `/shared/vault.js` (see
  root CLAUDE.md §3): a `🔒 PDF` link beside the DOI on the hub's S4 card
  (`rdv`/`rdf` in `TERM`), Session 3's Reflection 3 box and Session 4 step 1.
  Never commit the plain PDF. **Replaced 5 Nov 2026** (Jan Erik: "add this
  article to download here … replace the old link"): the three `🔒 PDF`
  links now point at the authors' own copy on ResearchGate
  (`…/links/656d7129ce88b8703131aefb/Protecting-hidden-infrastructure-….pdf`),
  with the DOI kept beside it as the version of record. The `.enc` file and
  the `vault.js` script tags stay (nothing else uses them yet; the vault is
  still the mechanism for the next paywalled file). ResearchGate answers 403
  to curl; it serves the PDF to a browser.

- **`lab.html` + `lab/` — live terminal demos (6 Nov 2026).** Jan Erik: a
  screen-shared Mac demo "to show how hackers connect, exploit, try out
  passwords". Four **pure-stdlib, localhost-only** Python scripts (macOS ships
  Python 3, no pip, no network) that run the Session 4 weapons for real, each
  paired with its defence: `demo1_passwords.py` (in-process guessing sim vs a
  toy account; `--defended` adds PBKDF2 + lockout-at-5 — attacker and victim
  are the SAME process, deliberately not a network brute-forcer), `demo2_hashing.py`
  (SHA-256 vs PBKDF2-200k guesses/sec on the room's laptop; small slow-hash
  sample scaled to a rate so it finishes in ~10 s), `demo3_connection.py`
  (two terminals, `listen`/`connect`, a text relay on `127.0.0.1:65432` —
  port 9000 was already taken on the Mac; **deliberately NOT wired to a shell**,
  and the code/README say so as the lesson), `demo4_sqli.py` (`' OR '1'='1' --`
  against an in-memory sqlite table, glued-in query vs parameterised). All four
  tested here. `lab.html` is the IIG-skeleton instructor run sheet (safety rule
  callout "every target is this laptop", command/output/lesson/defence +
  download per demo); a reference page, NOT a counted session (no
  courseprogress/`total`). Linked from the hub's "Course reference" list and
  Session 4's footer. Safe to be public: every script is non-weaponizable by
  design.

- **`demos.html` — the four demos run in the BROWSER (6 Nov 2026).** Jan Erik:
  "is there a way to present them as demos on the site for students?". A
  student-facing page: each of the four `lab/` scripts as an animated terminal
  (mac-dot titlebar, ▶ Run, output types out line by line), all client-side,
  nothing touches a network. Demo 1 mirrors the script with a Defences off/on
  segmented toggle (locks out at 5). Demo 2 **really measures** on the viewer's
  device via WebCrypto (SHA-256 batch vs PBKDF2-200k) — browser async overhead
  makes the ratio smaller than the Python's (~few-thousand× not 130k×), so the
  lesson text says "a huge factor", not a number. Demo 3 animates the two panes
  (listener/caller) and the "never wired to a shell" line. Demo 4 is interactive:
  a username box (default `' OR '1'='1' --`) feeds a compact in-page WHERE
  matcher (`whereMatch`/`atom`/`sidev`) — the injection logs in against the
  glued-in query, the parameterised version rejects it; a real account name
  would log in. Headless-tested (all four, toggle, injection + normal reject).
  IIG skeleton, reference page (no courseprogress). Linked from the hub, Session
  4's footer and `lab.html`; `demos.html` ↔ `lab.html` cross-link. **6 Nov 2026
  the hashing demo (section 2) gained a make-a-hash-and-crack-it widget** (Jan
  Erik: "add a small hash generator so that they can produce a hash and guess a
  very simple password"): `#d2pw` → *Make its hash* shows the real SHA-256
  (`sha256hex` via WebCrypto), *Crack the hash* loops the `CRACKLIST` of 20
  common passwords, hashing each and comparing to the target — a weak one is
  recovered (never reversed), a password not on the list honestly reports "did
  not crack". The point is the password↔hash connection, and that a slow hash
  helps only by making each of those guesses cost more.

- **`code-anatomy.html` — "What the code looks like" (6 Nov 2026).** Jan Erik,
  after the demos: students ask how the password-trying is coded and what
  malware looks like — "put up bogey code that still gives the idea". A
  reference page in two parts, all **illustrative skeleton, nothing runnable**
  (the one network line and every malware body are left as plain-English
  comments; a safe-use callout states the legal line). Part 1: the guessing is
  a `for pw in passwords: try_login(...)` loop — a human types nothing — with
  the single network line marked in red and NOT written, then "what the server
  sees" (a login-log burst of failures from one address) and the defences
  (lockout/MFA/slow hash/log-watching). Part 2: malware as four parts
  (delivery+trigger · persistence · payload · call-home), each a one-line
  commented skeleton + "in the wild" + the WannaCry/NotPetya case + "what
  catches it" (patching, EDR on new services, file-rate monitoring, egress
  control). Deliberately NO working brute-forcer and NO example malware — the
  earlier two refusals held; this is the teachable version (shape + detection).
  Call-home is tied back to demo 3 ("just a socket"). IIG skeleton, reference
  page. Linked from the hub, Session 4 footer and demos.html.

- **Session 5 = "Cables, satellites and the sky" (`week5.html`, built 11 Nov
  2026 for Fri 13 Nov, `total:6`).** Steps: s1 the S4 claim counterexample
  (`w5_counter`) + Reflection 4 draw · s2 the cable (TeleGeography 2026: 607
  systems, 1.5 m km; EP study p. 16 "approximately 99 %"; anatomy; a route
  delay calculator at 5 µs/km — route lengths 13,000 / 23,000 / 27,000 /
  14,500 km are ROUNDED for the exercise, `w5_route`) · s3 faults (ICPC/ITU
  2026: ~200 a year, >80 % fishing and anchors; EP study's older ~100 and
  40 % + 15 % shown beside it; repair "more than two weeks", three EU repair
  ships), an OTDR locator (204,218 km/s at n = 1.468; 1 ms → 102 km) and a
  repair-days calculator (`w5_repair`) · s4 four cases (Balticconnector /
  Newnew Polar Bear; Yi Peng 3; Eagle S — District Court dismissed 3 Oct 2025
  under UNCLOS art. 97, Court of Appeal revived 27 Aug 2026, **case open: check
  before telling students it is settled**; Red Sea 2024 and Sep 2025), an
  evidence sort (answers A I A I N I N A) and a cut-the-routes simulator
  (the overland route adds a jurisdiction note) (`w5_evidence`) · s5 orbit
  delay (4 × altitude ÷ c: GEO 477 ms, 65× LEO 550 km) and the Viasat chain,
  five clickable lines quoted from Viasat's 30 Mar 2022 report, Enercon,
  EEAS/UK 10 May 2022 (`w5_sat`) · s6 opens `w3_nx`, AP I arts. 52(2) (quoted),
  51(5)(b), 57, the team's weakest link + first measure → `_wall/w5` as
  `W:<k>|F:<k>`, claim for S6 (trusted vendor), prediction `w5_nx` (NotPetya
  / SolarWinds / MOVEit / CrowdStrike: most damage), **Reflection 5 =
  `refl6_*` on ENISA 2021**. Not verified and therefore NOT on the page: the
  Swedish SHK report itself (press only), HGC's 25 % (press), Enercon's
  5,800 turbines, a world count of repair ships, Spark/US attribution text.
  ⚠ The EP study's threats are in **chapter 5, not 3**: Session 4's
  reflection box and the hub card said chapter 3 and were corrected the
  same day. Probed headlessly: 6/6, no errors, 500 px fits.

- **Team F (12 Nov 2026).** Jan Erik: "create a new team F — let them choose their name, the members
  are Telia, Jenna and Elfat. just add them." `teams.js` IDS A–F, the `[A-F]` team regexes in
  week2–5 and jeopardy.html (a saved score sheet gains Team F). Rows `J:F` posted to
  `_wall/teams` for Jenna Mehdi, Elfat Hamami and "Telia" — Telia had no account in escwa that day,
  so her row carries the first name only; when she signs in with her full name she presses "Join
  Team F" and the "Telia" row is removed with ×. Name left empty for the team to choose.

- ⚠ **Midterm moved to Fri 11 Dec 2026 (12 Nov 2026).** Jan Erik: "the exam is pushed to the 11th
  of December". Sessions renumbered by date: **S7 = Hybrid threats (27 Nov, `w7`)**, **S8 = the
  tabletop (4 Dec, `w8`)**, **S9 = the midterm (11 Dec, `w9`, no page)**, S10–S14 unchanged. So the
  rule above now reads: **`w9` and `w14` must never be reused**; `w7` is a teaching page. Changed:
  hub `TERM` (part two now "Sessions 7–8 and 10–14", the midterm card after the tabletop), the hub's
  exam/plan/arc texts, `courseprogress.js`, `presence.js` names, roles.html (the tabletop and its
  scorecard are Session 8, 4 Dec), week1's arc, week2's "Sessions 8 and 10" / "Session 8's crisis
  exercise", week4's "Session 7" (the story payload). The midterm still covers Sessions 1–6; the
  final covers 7–8 and 10–13. Dates in courses.json did not change (same Fridays).

- **`numbers.html` + `data.js` — "Cyber risk in numbers" (13 Nov 2026), from Jan Erik's build brief
  ("Build brief: Cyber statistics session").** Every figure is in `data.js` (`DATA`), copied from the
  brief unchanged; `null` = gap. Charts are **inline SVG drawn by the page's own script, not Chart.js**:
  the brief allowed a CDN only if the repo had no chart library, and the repo forbids CDN scripts.
  Kinds: `line` (breaks = dashed segment + numbered † footnote; `gapAfter` = an axis gap, A3),
  `bar`, `barline` (two axes), `inside` (W3: North Korea drawn inside the total, no subtraction),
  `hbar` (`log` for A4, `diverging` for A6), `hbarGroup` (W4). Guess-first: values, tick numbers and
  footnotes hidden until Reveal (hbar items alphabetical while hidden, so the order gives nothing
  away); "Show all" in the header. Three categories × blocks A–D (evolution · type cards + charts ·
  two most serious · most avoidable, marked), each block opening with a one-sentence business case
  and closing with one sentence of theory (written by Claude, no numbers). Sticky scoreboard of seven
  teams, names from the escwa team board (`_wall/tn_A..F`) unless typed, ±`DATA.game.points`;
  localStorage `escwa_numbers_v1`. Closing "Which number do you trust?" lists every chart note + the
  final wager (won when both reasons say what the number counts and who reported it). Light and dark
  (page-local tokens, Okabe-Ito accents). The brief's "game section" was not in the PDF; the rules on
  the page are Claude's. **Source links the brief named without an address are plain text** (HIPAA
  Journal, CodeAnt, Reuters/NBC, CPO Magazine, EuRepoC, Nextgov, Defense One, The Register, Claroty,
  SOCRadar, ITPro, Reinsurance News, Dark Reading, CBS News, freezer-case Wikipedia); linked: Emsisoft,
  Wikipedia MOVEit, SentinelOne AcidRain, CISA AA23-335A. The brief's `check` values (DBIR ransomware
  2022/2023, vuln 2024, Dragos 2023, Chainalysis NK 2022, IBM 2019–21, IC3 2019–23) match the
  published reports as Claude knows them. Not a counted session (no data-module). Tested headless at
  1280/390 px, light and dark: no errors, no sideways scroll. Linked from the hub's Course reference.
  **The words first (13 Nov 2026, same day).** Jan Erik: "cards before the game explaining the vocabulary
  … back up every word with real examples and explain to layman". `DATA.vocab` in data.js: six groups,
  54 cards (basic words · how attackers get in · what they do inside · who attacks · machines, money and
  losses · who counts and how to read the charts), each = plain definition + one real, dated, public case
  + "In the game" pointer. Rendered as section `#words` BEFORE the game (`#play`, scoreboard, rules).
  Cases chosen for being well documented (Colonial Pipeline, Equifax, WannaCry/NHS, Ukraine grid 2015,
  MGM, SolarWinds, Mirai, NotPetya/Maersk, Stuxnet, LockBit/Cronos, Estonia 2007, Samsung/ChatGPT,
  Arup deepfake, DORA testing, Bybit, the Google/Facebook invoice fraud).

- ⚠ **13 Nov 2026 became an EXTRA session; Sessions 5 and 6 share Fri 20 Nov.** Jan Erik: "do this as an
  extra session (today) and continue with session 5 next time"; asked how to fit four sessions before the
  11 Dec midterm, he chose "merge S5 and S6". Hub `TERM`: a new entry `{n:'+', extra:true, date:'2026-11-13',
  href:'numbers.html'}` (the card and the next-session box print "Extra session" and do not count it);
  S5's date is 20 Nov and S5/S6 each open with "Together with Session 6/5, on the same evening". S7–S8 and
  the midterm (11 Dec) unchanged. `courses.json` escwa `schedule.dates[4]` = 2026-11-20 (the extra session
  is not in the list). week5.html: date 20 Nov "together with Session 6"; the trusted-vendor claim is now
  due Fri 27 Nov and opens Session 7; the S6 prediction is "sealed before Session 6 starts". Reflection 4's
  "due before 17:00" line was left as it is, so it now reads as due on 20 Nov. **Session 6's page is still to
  build, and it runs the same evening as Session 5.**

- **Session 6 — "The update you trusted, and putting a number on it" (`week6.html`, built 13 Nov 2026
  for Fri 20 Nov, the SAME evening as Session 5, so `total:5`).** s1 opens Session 5's sealed `w5_nx`
  and a five-case table (what was trusted · attacker? · how far it reached): NotPetya (M.E.Doc update;
  Maersk USD 250–300 m; ~USD 10 bn per the White House adviser, Wired 2018), SolarWinds (Orion
  updates Mar–Jun 2020, ~18,000 installs, 9 agencies + ~100 firms; SVR, Apr 2021), MOVEit (2,773 /
  95.8 m, Emsisoft), XZ Utils (CVE-2024-3094, "Jia Tan", found 29 Mar 2024 by Andres Freund from a
  half-second login delay, no attribution), CrowdStrike (19 Jul 2024, no attacker, 8.5 m machines per
  Microsoft, Delta ~7,000 flights, Parametrix USD 5.4 bn for the largest US firms) → "most damage
  depends on the measure", `w6_measure`. s2 the three doors (code runs / logs in / holds data), a
  nine-supplier classify for fictional Arvane (answers L D C C C L L D D), Kaseya → Visma EssCom →
  Coop (~800 stores) as the fourth-party case, staged rollout + SBOM (roles.html duty 5), `w6_vendor`.
  s3 four fictional Arvane risks ranked by a 5×5 matrix and by expected annual loss (editable; default
  disagreement: D last by matrix, 2nd by expected loss; A first by matrix, 3rd by loss), Cox (2008),
  scenarios when there is no base rate, `w6_matrix`. s4 NIST CSF 2.0 (six functions, Govern added,
  GV.SC) and ISO/IEC 27001:2022 (93 controls, 5.19–5.23 suppliers), an eight-row CSF classify
  (GV DE ID RC PR PR RS GV). s5 team board, riskiest supplier + first control → `_wall/w6` as
  `S:<k>|C:<k>`, the midterm brief (11 Dec, S1–6, dictionary, 45 %), prediction `w6_nx` for S7 (which
  pressure is hardest: cyber/economic/legal/information), **Reflection 6 = `refl7_*` on EC (2016)
  JOIN(2016) 18, due 27 Nov**. Hub `href`, courseprogress `w6 live, total:5`, courses.json module w6.
  week5.html ends with a button "Session 6 follows this evening". Tested headless (1280/500 px):
  5/5, no errors.
  **Guesses, live reveals, the instructor bar (13 Nov 2026).** Jan Erik: "where do the students enter their
  guess? add student view and reset (also including the reveal) for me … on the bar down in the middle".
  `login.js` is loaded, so an instructor device gets the bottom-centre bar (👁 / 🎓 Student / ↺ Reset).
  Instructor view (`body.inst`): scoreboard buttons, Reveal, Show all, the wager table, and under every
  chart and incident card **the teams' guesses** (read from the whole `_wall` every 6 s). Student view
  (`body.stud`, also the instructor's 🎓): no Reveal/score/wager controls; a box under each question,
  "Send our guess" → `EscWall.post('numg_<key>', {n: team name, src:'T:<A–G>|<guess ≤200>'})` (needs
  the student's team, `escwa_team`; the team board is mounted under the rules). **The instructor's laptop is
  the master**: every save PUTs `_wall/numrev/master` (`R:<keys>[|ALL]`) and `_wall/numscore/master`
  (`S:name=pts;…`), and student screens follow every 4 s (newly revealed charts animate in). ↺ Reset clears
  `escwa_numbers_v1` (course prefix) and, through a sessionStorage flag set when the bar's Reset is clicked,
  publishes empty reveals and zero scores on the reload; a second instructor device with nothing saved adopts
  what the room sees. Tested headless with an in-memory database: guess → instructor list, reveal + score →
  student screen, reset → student hidden again, 🎓 view = student page.
  **Game-only reset (13 Nov 2026).** Jan Erik: "I do not want to reset the whole course — just the graphics
  that have been revealed in that session and the team points". `gameReset()` = the "↺ Reset reveals and
  points" button beside Show all and in the scoreboard header (it replaced "New game"): reveals, Show all,
  points and wagers to zero, team names kept, published to every student screen; nothing else in
  localStorage is touched. Instructor view only. The bar's ↺ Reset still resets the whole course.
  **Bold and sources on the word cards (13 Nov 2026).** Jan Erik: "make bold the most important words";
  "find references to the real cases, just hide the url behind source or link". In data.js `**x**` marks
  bold in a vocab card's `what`/`eg` and a type card's `def` (`rich()` in numbers.html escapes, then turns
  it into `<b>`; never use `**` in any other field, it would print). Each vocab item may carry `src` (a URL),
  shown as "Source ↗" after the real case, or "Link ↗" after the definition when there is no case (DBIR,
  IBM, IC3). 48 of 54 have one; every URL answered 200 on 13 Nov 2026 except SentinelOne (429, rate
  limit) — Wikipedia, CISA, NAO, DOJ, Europol, gov.uk, IC3, EUR-Lex, TechCrunch (Samsung), CNN (Arup),
  Wired (NotPetya). No source yet: Scanning (Taiwan's NSB figure: no URL found). The "Network" card's
  example was invented (a generic hospital) and was replaced by WannaCry in England (NAO: 81 of 236 trusts).
  **Cut to 32 cards (13 Nov 2026).** Jan Erik: "for the 6 sections — cut the cards by 40%. Keep the most
  important". Kept per group 3 · 9 · 5 · 5 · 6 · 4: the terms the charts and incident cards lean on most.
  Removed (22): Network, Server, Internet-facing, Credential abuse, VPN, Social engineering, Scanning,
  Default password, Moving through the network, Pre-positioning, Sabotage, Insider, Shadow AI, AI-enabled
  attack, Pentest, Router, Wiretap, DevSecOps, Cyber insurance, The others, Average · median, Log scale
  (several survive as type-card definitions). The CVE, Equifax-timeline and KEV wording was clarified the
  same day. The listening PDF on the Desktop still has the 54-card version.
