# GBS · Creator Economy — notes for Claude

Split out of the root `CLAUDE.md` on 23 Oct 2026 (one file per course, loaded when working in this folder). The site-wide rules — shared runtime, data model, rules, secrets, conventions — stay in the root `CLAUDE.md`; read that first.

## GBS · The Creator Economy & SEO 2.0 — `GBS/creator-economy/`

Bachelor specialisation, Thursdays 14:15–16:00 from 15 Oct 2026; the run-sheet
archetype (`creator.css`, `wall.js`, `courseprogress.js`), one `.step` per timed
block, progress = steps pressed. Two instructions from Jan Erik shape every page:

- **Tone (9 Oct 2026): factual and instructional, never the instructor talking
  to the room.** No "I", no asides, no chatty alerts; imperatives to the student
  are fine. Session 1 and the hub were rewritten to this; the other GBS hubs
  were not.
- ⚠ **Mechanisms, in detail (9 Oct 2026): "be more specific to the mechanisms
  and give more details to how the various procedures and algorithms for these
  technologies are used."** `week1.html` Step 4 is the model: the search
  engine's crawl → index → rank (robots.txt and the per-operator crawler
  tokens, render queue, inverted index with a worked excerpt, BM25 with its
  formula, PageRank with its formula, passage ranking, quality raters and
  E-E-A-T) and the answer engine's RAG pipeline (query fan-out, hybrid
  lexical + dense retrieval with cosine similarity and ANN, cross-encoder
  reranking, grounded generation in the context window, citation
  attribution), each stage with "eliminated here". Step 4 C is a **working
  BM25 toy** (`TOYDOCS`, k₁ = 1.2, b = 0.75, four editable passages, the
  lexical stage only, and it says so); its scores were checked against an
  independent Python BM25. Step 4 D separates what is **established**
  (Chen et al. 2025 on earned-media bias; Aggarwal et al. 2024, the GEO
  paper, up to ~40 % visibility) from **hypotheses tied to a stage**, which
  Session 2 tests. Every operator claim is from the operator's own docs
  (Google How Search Works, the AI Mode query fan-out post, OpenAI's bots
  page, Perplexity's bots page), linked at the foot of the page. Later
  sessions should be built to this depth.
- **Attendance (22 Oct 2026)** — `presence.js` is a renamed port of
  `UMEF/mfb545/presence.js` (ns `creator`, English only, the GBS rule: at
  most two absences, so the student's summary is coloured by absences, not
  a % band). The button is on the HUB ONLY (`hub()`; Jan Erik, 22 Oct 2026:
  "add it on the landing page") — it turns red for whichever window
  `_presence_now` points at, so session pages do not carry it. `features` has `"presence"`, `presenceSessions` is 11, so
  the dashboard picker offers w1…w11: **never open w9** (Specialization
  Module); `wp` is not in the register. The `_presence` rules were already
  in the deployed `creator` block.
- Session 1's cells are **dealt in arrival order** through `_wall/w1cells`
  (see the comment in the page); the name hash is only the offline fallback.
- `data-board` on the steps feeds `/shared/board.html` (the TV board).
- ⚠ **Session 2 was REWRITTEN in plain language the same morning** (Jan
  Erik: "this language is to complicated. these are business students …
  give more interactions and examples they can click on"). Every check in
  Step 2 now has one fixed shape — *one question · why it matters · Do
  this (clicks) · Try it (a toy) · What the real page showed · Write down*
  — and six toys: a **robots.txt tester** on the two real files (rtings,
  tomsguide; `parseRobots`/`evalRobots`: a named robot obeys every block
  naming it, else the `*` blocks; longest path wins, Allow on ties), a
  **JavaScript on/off switch** showing the winner's page as a browser and
  as a simple robot see it, the **chunker** with three one-click samples
  (review site · brand page · forum thread), a **label finder** that
  highlights JSON-LD in a mock product page and in the real rtings header,
  a **PageRank toy** (five sites, tick links, d = 0.85, 40 rounds —
  Retailer → Review moves it 7 → 21, the news-site link barely moves it),
  and a **link builder** (Wayback · `-site:` mentions · Rich Results Test ·
  robots.txt for any URL). Business vocabulary throughout ("quoted", "the
  robots", "pieces", "labels", "votes"); the eight pipeline stage names
  stay only in the Step 1 bet. ⚠ Probe gotcha: the label finder's sample
  source contains `</body>`, so a probe must inject at the LAST `</body>`
  (`rfind`), or it cuts the string and reports a syntax error that the
  real page does not have. Run sheets on both session pages print step
  numbers, not clock times (same morning).
- **Session 2 — *Reverse-engineer a winner* (`week2.html`, built 22 Oct
  2026, the morning of the session), seven steps, `total:7`.** Step 1 reads
  the Session 1 wall back from `_wall/w1` (21 Oct: rtings.com 9 of 14
  rows, youtube 4, reddit 3) and the student's own `w1_next`; a revised
  bet on the stage (`w2_bet`). Step 2 is the instructor's 20 minutes: **six
  audit checks, one per pipeline stage, each with its browser procedure** —
  robots.txt block semantics and the AI tokens (OAI-SearchBot ≠ GPTBot,
  Google-Extended ≠ Search, noindex/nosnippet, llms.txt is a proposal) ·
  the HTML before JavaScript (View Source, Disable JavaScript, Network →
  Doc, Google's Web Rendering Service) · chunking and the **stand-alone
  test**, with a working chunker (`chunkText`/`testChunk`: slider length,
  cut at headings; subject / number-or-comparison / query-term) · JSON-LD
  and schema.org types · referring domains (Ahrefs/Moz, `-site:` mentions,
  Wikipedia) · freshness (dateModified, Wayback). Each check carries an
  **"Observed · 22 Oct 2026"** box with what a Googlebot-UA fetch actually
  returned: rtings allows all crawlers; tomsguide names 11 AI bots but none
  of OpenAI's/Perplexity's; soundguys blocks SEO bots; **reddit answered
  with a network-policy "Blocked" page**; the rtings best-budget page is
  304 KB with ~190 visible words before JS, its claim in the meta
  description, JSON-LD = WebSite + Organization only. Re-fetch before
  reusing — sites change. Step 3: one cited URL per team (A and B both
  rtings, to compare two records), six-line record posted to **`_wall/w2`**
  (`n` = "Team X · first name", `meta` = the six lines "·"-joined) and
  saved per student as `w2_url … w2_fresh`; roles rotate from `w1_team`
  (Operator → Skeptic → Scribe). Step 4 the audit wall + three reasons
  (`w2_r1..3`, stage first). Step 5 **the falsification round**: a control
  page with the same properties and no citation, posted to **`_wall/w2ctrl`**.
  Step 6 findings v1 (`w2_f_keep`, `w2_f_dead`, `w2_f_open`). Step 7 terms,
  the open claim's verdict (`w2_claim`), the Session 3 prediction
  (`w2_next`). The `_wall/$mod` wildcard covers both new nodes — no rules
  change. Factual register throughout. Probed headlessly: every step
  completes, no errors; the walls degrade to "unavailable (rules not
  published)" when the database refuses. Run sheet:
  `_private/week2-runsheet.md`.
- ⚠ **Session 2's walls never filled** (found 27 Oct 2026): the rules
  validate `_wall/$mod/$row/meta` at **≤ 120 characters**, week2 posted
  up to 900, so every audit and control row was refused (students were
  told "rules not published"). Their records are only in their own
  `w2_*` fields. week2.html now slices `meta` to 120. **Every wall post
  in this course must keep `meta` ≤ 120 and `n` ≤ 40.**
- **Session 3 — *The intervention goes live* (`week3.html`, built 27 Oct
  2026), seven steps, `total:7`.** Step 1 reads back the student's own
  `w2_f_keep` (or `w2_r1..3`) and splits the six checks into *can change
  by writing* / *cannot*; `w3_brought`. Step 2, four mechanisms, each in
  Session 2's check shape: **A found** (a signals × engines table: Google
  = sitemap · link · Search Console; Bing/Copilot adds IndexNow;
  ChatGPT and Perplexity are credited only with "link" — neither
  documents sitemap use; Google's "a few days to a few weeks" quote),
  **B asked** (query fan-out, six illustrative sub-questions; a click
  fills phrasing 1; labelled a hypothesis), **C picked** (the rewrite lab:
  one e-bike-battery paragraph, five toggles, Session 2's `testChunk`
  with the query passed in + a "names its source" test; GEO paper:
  statistics/quotations/citations up to ~40 %, keyword stuffing little),
  **D held still** (outcome × baseline × links → what can be concluded).
  Rule callout: every number sourced, no invented measurements, a
  disclosure line on every page. Step 3: three exact phrasings
  (`w3_q/q2/q3`) and a **3 × 3 baseline grid** (`w3_base`, `w3_base_top`)
  → `_wall/w3base`. Step 4: the **editor** — track A (owner's site) / B
  (the lab), title, ≤ 60-word short answer, four sections
  (`w3_h1..4`/`w3_t1..4`, generated by `secsInit()` BEFORE
  `StatsTrack.init`, which wires `[data-work]`), a pipe table, method,
  sources, byline; a live nine-check panel and an iframe preview of the
  exact published page; download. Step 5 fact-check swap (A→B→…→A,
  `w3_fc`). Step 6 publish: B sets `w3_url` + `w3_ready` (ISO time) and
  posts `_wall/w3`; A needs a live URL + `w3_perm`. Step 7 the seal:
  `w3_p10`, `w3_p11` (of 9), `w3_pfirst`, `w3_pwhy`, `w3_pwrong` →
  SHA-256 of `sealText()` → `w3_seal` + `_wall/w3seal`. Roles rotate twice
  from `w1_team`. Probed headlessly (CDP, stubbed writes): all seven
  steps complete, no errors, no overflow at 400 px.
- ⚠ **Session 3 REWRITTEN in plain words, 28 Oct 2026** (Jan Erik: "very
  unclear what you actually want the students to do here, e.g. what list? …
  be more specific and layman"). Title now *Write a page and put it online*
  (also in index.html TERM, courseprogress.js, presence.js, courses.json).
  Every step says what to look at, what to type, where, and who on the team
  does it; "the lab" → "the course's website", "baseline" → "the before
  record", "phrasing" → "question, way 1/2/3", "seal" → "lock your guess";
  the live checklist and role box too. No field ids, steps or toys changed.
  Same rule for later sessions: name the thing ("the reasons that held up in
  Session 2, Step 6"), never a bare "the list".
- ⚠ **Session 3 REBUILT 29 Oct 2026 (the day of the session) from Jan
  Erik's own text, "Get Your Page Quoted by AI"** — students follow it alone,
  the instructor walks around. Replaces everything above for week3.html (the
  28 Oct plain-words pass included). Teams of 2–3 (not A–E); Intro rules A–D
  + six steps = 7 `.step`s, `total:7` unchanged. Pages are hosted by the teams
  on **Netlify** (Netlify Drop, renamed project), registered in **Google
  Search Console** (URL prefix, HTML-file verification, Request indexing) and
  **Bing Webmaster Tools** (import from GSC, URL Submission); measuring is in
  each team's own **Google Sheet** (9 columns, Week 0 = 9 rows). Fields:
  `w3_team`, `w3_q/q2/q3`, `w3_sheet`, `w3_base_top`, `w3_facts`, `w3_url`,
  `w3_pubtime`, `w3_gsc`, `w3_bing`, `w3_who`, `w3_hyp`; the page address is
  posted to `_wall/w3` (n = team name ≤ 40, meta = Q1 ≤ 120). Step 3 builds
  Jan Erik's prompt verbatim with the team's fields filled in, plus a Copy
  button. Experiment: version A frozen 3 weekly checks, then version B (first
  paragraph only) if GSC says "URL is on Google". **The lab below (`live/`,
  publish_live.py) is no longer used by Session 3**; the hub's link to it was
  removed. "ChatGPT's web search draws on Bing" is Jan Erik's wording.
- ⚠ **The lab — `live/` — is the experiment.** `_build/publish_live.py`
  (asks for the instructor password, reads every sid's `work/`, keeps the
  newest track-B submission per team) writes `live/<slug>.html`,
  `live/index.html`, `live/sitemap.xml`; `--indexnow` pings with the key
  file `live/<32 hex>.txt`. It builds pages from **escaped fields, never
  HTML from the database** (a page on this origin can read the
  instructor's session in localStorage). `page_html()` mirrors
  `buildDoc()` in week3.html byte for byte (checked with node on a
  fixture) — change both. Re-running refuses to overwrite a changed page
  without `--force`: any edit after 29 Oct is a second intervention and
  is logged here with its date. robots.txt carries the lab's sitemap and
  must **never** disallow `/GBS/creator-economy/`; the hub links to
  `live/` (the one internal link every team shares). Links are held at
  zero on purpose. GitHub Pages keeps no log: crawler visits are not
  observable; the evidence is the nine answers per team in W10 (17 Dec)
  and W11 (14 Jan), plus referrers in `/shared/site.html`. Run sheet:
  `_private/week3-runsheet.md`.

- **Session 4 — *The creator draft* (`week4.html`, built 1 Nov 2026 for Thu 5
  Nov), seven steps, `total:7`.** Step 1 = the Session 3 experiment's Week 1
  check (`w4_gsc`, `w4_quoted`). Step 2, four mechanisms at Session 1 depth:
  **A distribution** (Mosseri 31 May 2023: per-surface ranking, Feed by
  follow graph, Reels/Explore by interest; TikTok Newsroom 18 Jun 2020:
  "neither follower count nor … previous high-performing videos are direct
  factors"; median vs mean of last 10; ER denominators — HypeAuditor 2025:
  Instagram 1.59 % in 2024, TikTok < 10k 10.3 %) with a ratio toy; **B the
  funnel** sales = views × action rate × share who can buy × shop CVR, a
  calculator with views-to-break-even; **C counting** (UTM per Google
  Analytics help 10917952, codes leak to coupon sites, affiliate cookies,
  last click, holdout → S6) with a tagged-link builder; **D the fee**
  (deliverable, usage rights, exclusivity; IMH survey: about half pay nano/
  micro < USD 500). ⚠ The benchmark literature contradicts itself by an
  order of magnitude (secondary sites, unstated denominators); only the
  figures above were traced to the publisher on 1 Nov 2026 — keep it that
  way. Step 3: the brief — **Sonnaz Audio SA (fictional)**, Sonnaz Q1,
  CHF 199, ships only in CH, margin CHF 90, shop CVR 3.0 %, budget
  CHF 6,000, ≤ 3 creators; a **pool of 16 FICTIONAL creators** (`POOL`;
  TERM had said "real live profiles" — real people's fees and audiences
  cannot be published or verified, so each team instead measures one real
  profile's median views, `w4_real`); shortlist `w4_short`; registration
  `_wall/w4teams`. Step 4: **snake draft replayed from the wall** —
  `_wall/w4pick1..3` (one node per round, because `CreatorWall.post` PUTs
  over the device's own row), order = hash of team names (registered
  before the first pick), a slot waits for its team or is skipped when the
  next team posts > 2 min after the previous pick; budget and taken
  enforced in `replay()`; picks saved to `w4_picks`; a manual fallback if
  the board fails. Step 5 locks `w4_cpa`/`w4_sales`/`w4_why` (`w4_locked`)
  → `_wall/w4cpa`. Step 6 opens only after the lock: the brand's fictional
  spring campaign (CPA 48 / 350 / 1,238), the verified public figures,
  the class's predictions, then **the simulation** — `HID` = hidden
  action rate and fit per creator, sales = views × tap × 2 × CH share ×
  3 % × fit, views log-normal (σ 0.35) seeded by a djb2 hash of the id —
  calibrated in Python (scratch `sim.py`) and identical in the browser:
  CPA from CHF 23 (zug.commute) and 38 (leman.sound) to 1,900 (techbro.ch);
  the hidden values are shown with a reason each. Step 7: `w4_change`,
  `w4_sign`, the pick list to copy. Probed headlessly: a five-team draft
  with stubbed walls resolves the snake, budget and taken rules, all seven
  steps complete, no errors, no overflow at 500 px. Run sheet:
  `_private/week4-runsheet.md`. Session 5 (negotiation) should reuse
  `w4_picks` — one of the team's own creators.

- **Hub titles and blurbs rewritten from Session 4 on (5 Nov 2026).** Jan
  Erik: "your titles for the sessions are so unclear, noone realizes what we
  will do. Give a title that indicates what we will learn … make them CLEAR
  AND SPECIFIC". Every `TERM` entry from `w4` to `wp` (and the two gap
  cards and both section heads) now has a title that states what is learned
  ("How to negotiate a creator contract: the fee, usage rights, exclusivity
  and disclosure") and a blurb in two parts, **What you learn** (each term
  defined in one sentence: CPA, usage rights, exclusivity, disclosure, reach,
  impressions, engagement rate, earned media value, bought followers, live
  shopping stream, playbook) and **What you do** (the exact activity), per
  WRITING.md. Sessions 1–3 were left as they were (already taught). Session
  4's own `<title>`, `<h1>` and description carry the new title. The
  `nextCard` prints `w.title`, so the long titles show there too. A future
  session page must take its title from the hub entry, and when it is built
  the blurb may need the mechanics the page actually has. **The word is
  "content creator", everywhere** (5 Nov 2026, Jan Erik: "what is a
  creator?" … "use rather content creator everywhere"): defined on the S4
  card and page (publishes under their own name on a platform, has
  followers there, earns from them, among other ways by being paid by a
  brand to show a product; the older word is influencer), and every prose
  "creator(s)" on the hub, S1, S3, S4, the two module-name strings and the
  presence labels now reads "content creator(s)". Untouched: the course
  name, `data-course="creator"`, the `creator_*` keys, `?course=creator`,
  `CreatorWall`, the namespace comments, paths. S4's title was then made
  explicit about the brand PAYING them ("huh? employing creators?"):
  "Paying content creators to sell a product: how a sponsored post turns
  into a sale, and which content creators to pay with a fixed budget".

- **`week4-slides.html` — the instructor's deck for Session 4 (5 Nov 2026,
  the morning of the session).** Jan Erik: "make slides for this session 4 ·
  include also a 'safety plan' (redo) for those who did not do the page or
  not completely · be specific · low grade bba business students · how much
  time for slides and how much for exercise?" The GBS deck engine
  (finmod's `session2-slides.html`: navy/gold, `data-clock` HUD, N notes, P
  print), 23 slides, **about 35 min of slides and 70 of page work in the
  105-min slot** (clock plan in slide 2's notes). Slides 5–7 are the safety
  plan, written from the sheets read at 12:57 that day; **the per-team
  findings are in `_private/week4-runsheet.md` only** (a first commit that
  named teams on the public deck was refused): no Week 0 → today is Week 1
  and say so in the Plan tab; empty columns → "not recorded", never filled
  from memory; wrong labels → correct them; unshared sheet → send the link in
  the message panel; "not on Google" → Request indexing and date it; a
  non-buying question → keep it, add Q4 from Week 1; no page → republish
  during Step 3, today = Week 0. The worked funnel numbers (20,000 views ×
  1 % × 80 % × 3 % = 4.8 sales, CHF 83; 140,000 × 1 % × 6 % × 3 % = 2.5,
  CHF 2,200; break-even views at 6 % ≈ 247,000; @genevadaily ≈ 1.1 sales
  for 2,400 vs @zug.commute ≈ 4.6 for 350) were recomputed from `POOL`;
  the hidden `HID` values are never on a slide before Step 6. Linked from
  week4.html's banner. The deck is the instructor's: it keeps its clock.
- **Draft fixes during the session (5 Nov 2026, 15:45).** Jan Erik: "they
  are actually selecting several at the same time". Simultaneous clicks
  were already safe (each device posts its own row; `replay()` keeps the
  team's earliest valid row; duplicate registrations dedupe by name). Two
  real risks were fixed: (1) a team that never picks and stands LAST in
  its round froze the draft, because only the next team in the SAME round
  could jump in; now, after the 2-minute wait, the first other team of
  the next round may pick (`pickRound()` returns the round to post into;
  `replay()` skips the slot when that team posted after the wait);
  (2) team names typed differently by teammates made two teams, so Step 3
  now lists the registered teams (`#teamsNow`, refreshed every 8 s while
  Step 3 is on screen) with "Join this team", which copies the exact name.
  Probed with a stubbed board (three teams, the absent one last).

### Session parameters (for /new-session)

- Language EN; no textbook — content is our own, every operator claim from
  the operator's documentation, linked at the foot of the page.
- Archetype: run sheet (`creator.css`, `.step` per timed block, one button
  per step; progress = steps pressed; `total` in courseprogress.js = step
  count). Not the concept-screen/checkpoint/homework structure: no quiz, no
  homework page — the walls (`_wall/<mod>`) and workbook fields are the
  output. Session 1 h 45, Thu 14:15–16:00.
- Running case: one buying question (CHF 200 noise-cancelling headphones)
  and, from S3, each team's published page. Examples off the case are
  labelled as such.
- Register: plain business language, factual, no "I"; every check in the
  fixed shape question · why · do this · try it (a toy) · what the real
  page showed · write down. Mechanisms in detail (Session 1 Step 4 depth).
- Teams A–E from `w1_team`; roles Operator → Skeptic → Scribe rotate
  each session.

- **Session 5 — *How to negotiate a content creator contract* (`week5.html`,
  built 11 Nov 2026 for Thu 12 Nov), six steps, `total:6`.** Step 1 = the
  experiment's Week 2 check (`w5_gsc`, `w5_quoted`; "someone else in my team
  does the check" allowed, since today is one laptop per PERSON). Step 2, six
  parts: **A** fee, deliverables, payment timing, performance bonus (toy: fixed
  fee vs lower fee + bonus, cost per sale in three outcomes, the break-even sales
  count); **B** usage rights (where · how long · countries · editing; partnership
  ads / Spark Ads); **C** exclusivity (toy: deals per year ÷ 12 × months × fee;
  headphones-only 3 m = CHF 400 vs all audio 12 m = CHF 4,000 with the defaults);
  **D** disclosure (the law, from the research pass of 11 Nov 2026 — sources at
  the foot); **E** the termination-for-conduct clause (Session 7 uses it);
  **F** trading vs meeting in the middle, walk-away/BATNA (toy). Step 3: role
  (brand · content creator · observer, `w5_role`), the content creator from
  `w4_picks` (listed first; else the whole pool, `w5_cc`), the private brief,
  `w5_first`, `w5_walk`, `w5_guess`. **The briefs:** `TERMS[k].o[i] = [label,
  brand %, creator %]`, every value = % × that creator's CARD fee, shown in CHF;
  the fee is free (brand gains card − fee). Checked in Python (scratch `neg.py`):
  best joint = **89 %** of the card fee (ads 3 m · headphones 3 m · 50/50 ·
  bonus · script + 1 round · lawful label · end and keep the fee); the brand
  winning every term = −50 % jointly. **The trap:** the brand's brief quotes a
  marketing director asking for a discreet label or none, and both briefs value
  options 2–3 of disclosure; the reveal calls them unlawful and subtracts
  `PEN` = 40 % from each side. The bonus is a compatible issue (both +10 %).
  Step 4: the term sheet (fee + seven selects, live value for one's own side,
  observer log `w5_log`, "No deal"), locked into `w5_terms` (JSON) +
  `w5_locked`; the BRAND's laptop posts `_wall/w5deals` (n = team · handle ≤ 40,
  src `F|B|C|J|D|X`, meta = short terms ≤ 120). Step 5 the reveal: both values,
  together vs the best, money left on the table, a per-term table with the
  best option and the loss, the guess vs the briefs, the class's deals sorted
  by joint value; `w5_cost`. Step 6 the generated term sheet + `w5_sign`.
  The briefs are in the page source (a classroom exercise, not a secret).
  No minute timings on the page (WRITING.md rule 7). Probed headlessly
  (brand, @zug.commute, unlawful label): all steps, no errors, 500 px fits.
