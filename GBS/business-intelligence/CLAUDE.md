# GBS · Business Intelligence — notes for Claude

Split out of the root `CLAUDE.md` on 23 Oct 2026 (one file per course, loaded when working in this folder). The site-wide rules — shared runtime, data model, rules, secrets, conventions — stay in the root `CLAUDE.md`; read that first.

## GBS · Business Intelligence — `GBS/business-intelligence/`

MIM core course, `id`/`ns`/`keyPrefix` `bi`, Thursdays 16:30–18:30 from
22 Oct 2026, eleven sessions, Geneva campus (the PDF says Barcelona; Jan
Erik overrode it). Hub built 18 Sep 2026 on the creator-economy archetype;
**Sessions 1 and 2 built 18 Oct 2026** on the run-sheet pattern (`bi.css` =
`creator.css` + additions at the END; `wall.js` = creator's with the
namespace changed, global `BiWall`; `courseprogress.js` a port).

- ⚠ **Module ids are the school's WEEK numbers, starting at `w2`** — the
  first Thursday falls in calendar week 02 — so Session 1 is `week2.html`
  (`w2`) and Session 2 is `week3.html` (`w3`). The card prints both numbers.
  Never rename `w2` to `w1`: it orphans saved progress.
- **The running case is ÒRBITA**, a fictional Barcelona e-bike/scooter
  subscription operator with five irreconcilable sources (billing,
  telematics, support desk, marketing spend, the finance spreadsheet).
  **The numbers are generated and consistent across pages**: a random
  1,000 accounts on 1 Oct = 840 paying · 95 paused · 40 trial · 25 unpaid;
  41 cancellations (22 paying, 12 paused, 3 trial, 4 unpaid), 5 reversed
  within 30 days. Finance's churn 22/840 = **2.62 %**; billing's 41/1000 =
  **4.10 %**; harshest definition 161/1000 = 16.10 %; most lenient 17/840 =
  2.02 % (recomputed in Python, 18 Oct 2026). Finance counts 40,100 paying
  subscribers in September; billing has 47,700 on its books. Change one of
  these and the dead dashboard (S1), the source excerpts (S1), the
  definition machine (S2) and the example contract (S2) must all move.
- **Session 1, seven steps**: the dead dashboard (an inline-SVG mock with
  twelve tiles and two churn figures) and a sealed reading → `_wall/w2p`;
  the five source excerpts with **one clickable cell per table that proves
  the trap**; teams (Analyst · Skeptic · Scribe) and the **sealed decision**
  with a rule-based **non-decision detector** (role, verb, cadence, no
  "improve/insight/visibility") → `_wall/w2d` as `T:<A–E>|sentence`, posted
  by the Scribe only; the lifecycle + OLTP/OLAP + semantic layer input and a
  six-story "where did it fail?" classify; red team on another team's
  sentence (four questions, 0–2, `buildGrid`); the decision brief (artifact
  1) with a sealed churn guess → `_wall/w2k` as `K:<pct>`; the close seals
  `w2_nx` (billing 4.1 / finance 2.6 / both / neither).
- **Session 2, seven steps**: opens `w2k` and `w2_nx`; the **definition
  machine** (five switches A–E over the counts above, computed live, with
  finance's and billing's presets) → `_wall/w3d` as `D:<5 bits>`; the metric
  tree with a five-check lint; the KPI contract (eight fields), a
  leading/lagging/vanity classify and a **Goodhart toy** (bonus weight →
  closed/reopened/CSAT; labelled illustrative); red team on the definitions;
  the contract table (3 KPIs × 8 fields → `w3_contract`, artifact 2); the
  close seals `w3_nx` (hardest source to load).
- Progress on a session page = the seven `.step` buttons (`total:7`); the
  `.q`/`.cl-row`/`[data-work]` trap does not apply. Classify groups mark
  their step through `secId` when every row is right.
- ⚠ **The `bi` rules block gained a `_wall` node (copy of creator's) on
  18 Oct 2026 and must be DEPLOYED** before the first session, or every
  wall post returns 401 (the pages say so). No `presence`, no `project`
  block, no `workbook` feature — same as creator/escwa.
- The hub's `TERM` carries `href` for `w2` and `w3`; `courseprogress.js`
  has them `live:true`; `courses.json → modules` lists both.
- ⚠ **Teams and TEAM ANSWERS — `teams.js` (22 Oct 2026).** Five teams A–E
  (the ids every page uses). Students join, move or leave on a team board
  (hub `#teams`, Session 1 Step 3, Session 2 Step 3); any member renames
  the team. A **team field** is shared: one member writes, every member's
  page fills in that field (so progress.js saves it to each member's own
  node) and ticks the step. Shared: S1 the decision + maker + cadence +
  "what they would decide differently" + sealed state (s3), the one number,
  the red-team target, grid and verdict (s5); S2 the tree (s3), the red
  team (s5), the contract cell by cell (s6). Individual on purpose: the
  predictions, the churn guess, the dashboard reading, the definition
  machine. **No rules change**: it all lives on the wall —
  `_wall/teams` (J:<team>), `_wall/tn_<T>` (names),
  `_wall/tt_<T>_<key>` (answers, ≤ 500 chars, newest row wins); one GET of
  `_wall` every 8 s. Tamperable by design, like every wall. A new session
  page with a team artifact calls `BiTeams.field(id,key)` /
  `BiTeams.state(key,apply)` and `BiTeams.share()` on its hand-in button.
