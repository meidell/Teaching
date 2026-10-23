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
