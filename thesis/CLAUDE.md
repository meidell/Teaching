# CLAUDE.md — HEG-Genève IBM Bachelor Thesis Process Tracker

> Handoff for Claude Code. Read this fully before editing. It captures every decision
> already made so we don't re-litigate or lose context.

## What this project is

A single-page web app that guides HEG-Genève (Haute École de Gestion, Geneva)
**International Business Management (IBM)** Bachelor students — and their mentors and
the department — through the full Bachelor Thesis year (2026–2027).

The thesis is being written in an era where students use AI, so the page's whole
premise is: **the graded value is the process and the live defense, not the prose.**
Every part of the UI reinforces what a student must genuinely own vs. what AI may
legitimately assist with.

## Layout (updated 2026-06)

This now lives **inside the Teaching git repo** and is two pieces:

- **Frontend** — `Sites/Teaching/thesis/` : `index.html` (the tracker, HTML + CSS +
  vanilla JS, no build step), plus `coach-client.js` and `sync.js`, the HEG logo
  `logo_heg-ge.svg`, and this file. The page works fully offline (localStorage) and is
  served as a static module like the other Teaching courses.
- **Backend** — `Sites/Teaching/thesis-worker/` : a small **Flask + psycopg2 + Anthropic
  (Python SDK)** service for Render (matches the other `Sites/*Worker` folders). It saves
  progress to the shared Render `teaching_db` (tables namespaced `tracker_*`) and proxies
  Claude as a **coach only** (see decision #3). The API key lives there, never in the page.
  See `thesis-worker/README.md`.

**Wiring:** set `window.WORKER_BASE` in `index.html` to the deployed worker URL to turn on
cross-device sync + the coach; leave it `""` for local-only. `sync.js` adds a resume-code
chip, pulls on load, and autosaves changes — additively on top of the existing localStorage.

> **Known debt:** `index.html` is still the *old lab-notebook theme*. Decision #7 below
> documents the official HEG navy/red Clarika brand, but the HTML was never actually
> restyled to it. Restyle is still pending. The coach UI (per-step buttons) and the
> field-based workbook + printable synthesis are also not built yet.

## Non-negotiable design decisions (do NOT change without asking)

1. **Source of truth is the HEG project documents**, not generic thesis advice. All
   steps, milestones, gates, word counts, and grading criteria are lifted from the
   real kick-off slides, the proposal template (with explanations), the pre-grading
   form, and the survey-approval process. See "Source facts" below — treat these as
   authoritative. Do not invent or "improve" requirements.

2. **Structure = 9-step research process mapped onto 4 milestones**, in 3 phases:
   - Phase 1 — Proposal & vetting (MS1–MS2, summer→October)
   - Phase 2 — Fieldwork & analysis (MS3, Nov→April)
   - Phase 3 — Recommendations, writing & defense (MS4, May→June)

3. **AI-honesty framing is woven into every step** (not a separate section). Each
   student step has an "AI can / can't" panel. Data collection (Step 5) and the oral
   defense (Step 9) instead get a stronger "the honesty line" panel — there is no
   legitimate AI role in those two, so never soften that.

4. **"Verify before moving on" gates** are the navy checkpoint callouts (red ✓). Each is
   phrased as a test the student must pass *aloud* — this doubles as defense rehearsal.
   Keep that spoken-test framing.

5. **Three audiences via a role filter**: Everything / Student / Mentor / Admin.
   Mentor view also shows Admin-tagged steps and vice-versa (mentor+admin overlap).

6. **Progress persists with `localStorage`** (key: `heg_ibm_thesis_v1`), per-device — and,
   when `WORKER_BASE` is set, **also syncs to the worker DB** via a resume code (`sync.js`,
   localStorage key `heg_ibm_thesis_v1_code`). The DB tables are `tracker_*` in `teaching_db`.
   - localStorage is the always-on cache; worker sync is additive and fails silently offline.
   - On load with a code, cloud state wins (overwrites local). Never rename a checkbox `id` —
     it breaks both the localStorage state and the `tracker_entries` rows keyed to it.
   - localStorage does NOT work inside Claude.ai's artifact preview (that sandbox blocks
     browser storage). Test in a real browser / Live Server, never judge from a preview pane.

7. **Visual identity = official HEG-Genève brand** (sampled from the live theme CSS at
   hesge.ch/heg). Clean corporate-academic look, not a marketing page and no longer the
   former warm "lab-notebook" theme. Stay faithful to the real brand — do not reintroduce
   the old palette/fonts.
   - Logo: `logo_heg-ge.svg` sits in a white signature bar at the top-left of the
     masthead. It is black + red, so it MUST stay on a light background — never recolor it
     or place it on navy.
   - Fonts: **Clarika** (HEG's actual geometric/grotesque typeface, commercial) with
     **Manrope** as the free Google-Fonts fallback. The `--sans` stack is
     `'Clarika','Manrope',…`. Loaded via `<link>` in `<head>` (NOT `@import` — an
     `@import` after `:root` is invalid and silently ignored).
   - Palette via CSS custom properties in `:root`:
     `--navy:#002c46` (primary structure, headings, step numbers, verify gates,
     progress fill), `--red:#ff3127` (signature accent — the 85×7 px bar under the H1,
     gate pills, AI-honesty rule, completed step numbers), `--navy-soft:#2b3e54` (steel —
     mentor/admin/scored), neutrals `--ink:#24272a`, white bg, `--panel`/`--panel-blue`
     soft fills, `--rule:#dadfe2` cool-grey dividers.
   - Signature HEG motif: big bold navy headings with a short **red underline bar**
     (`h1.title::after`, 85×7 px). Section labels and the grading band reuse navy + red.
   - Reduced-motion is respected; keyboard focus is visible (red outline). Keep both.

## Source facts (authoritative — from HEG documents)

**Milestones**
- MS1 = Kick-off + preliminary research
- MS2a = Research proposal submission; MS2 = pitch to review panel; MS2b = approve RP
- MS3 = Mid-way meeting
- MS4 = Submission & defense; MS4a = deferral session

**Credits / effort**: 12 ECTS ≈ 300–360 h ≈ one full workday/week for ~38 weeks.

**Grade weighting**: Research Proposal **15%** + Thesis & defense **85%**.
Final grade 1.0–6.0 by jury consensus. 6 = excellent … 4 = pass, < 4 = fail.
Formal aspects carry NEGATIVE coefficients (poor structure/citation subtracts points).

**Proposal template sections + word guides** (don't alter the numbers):
- Subject area / preliminary title (one sentence)
- Relevance to Minor (one paragraph)
- Statement of problem / rationale (~200 words)
- Literature review / state of the art (~300 words)
- Research question(s) / hypotheses (1–2 sentences)
- Research methods (~150–300 words)
- References — ≥10 journal/review articles, **HEG ISO 690** norm
- Appendix 1 — Management plan / Gantt chart (~150 words)

**9-step research process** (Ghauri, Grønhaug, Strange 2020): 1 topic · 2 research
problem · 2a problem presentation · 3 research design · 4 measurements · 5 data ·
6 sample/respondents · 7 analyses · 8 writing · 9 actions. (Process is iterative —
the page says so; keep that caveat.)

**Hard procedural gates** (students get tripped by these):
- Qualtrics surveys CANNOT be distributed until the **mentor approves** them.
- NDA precludes any future publication — use only if confidentiality is essential.
- Mentors are **assigned by the department**, not chosen (students express preferences
  via the online form only — never put a mentor name in the proposal).

**Oral defense**: 60 min, **in person on the Battelle campus** (online not permitted),
15-min presentation + 45-min examination, held 1–4 weeks after submission. Mentor
submits signed proceedings within **2 working days**. Pre-grading form must NOT be
shared with the mentee.

**Key references** already cited in copy: Wedell-Wedellsborg (HBR 2017, "Are You
Solving the Right Problems?"); McEnerney 2014 (writing = thinking); Saunders et al.
(literature-review loop); Ghauri et al. 2020.

## Known open items (flagged to the user, not yet resolved)

- **Timeline month positions are approximate.** The kick-off slide gave milestone
  *order* but not firm calendar dates. Real deadlines still need to be set in the
  `.timeline` section (`<div class="months">`). Ask the user for exact dates before
  hardcoding them.
- **Persistence is local-only.** If the user wants cross-device sync or Moodle/
  Cyberlearn integration, that's a backend change — discuss approach first
  (static hosting vs. a small API vs. an LMS plugin) before building.

## How to work in this repo

- No framework, no bundler. Edit `index.html` directly.
- To preview: open the file in a browser, or use VS Code's **Live Server** extension
  (right-click → "Open with Live Server"). Do not rely on any in-editor preview that
  sandboxes storage.
- Keep everything in the one file unless the user asks to split it. If you split CSS/JS
  out, preserve the `localStorage` key and all `data-aud` / id attributes exactly —
  saved student progress is keyed to those checkbox `id`s (`t1-1`, `t2-3`, `m1-2`, …).
  **Renaming a checkbox id silently wipes that task's saved state for every user.**
- When adding tasks/steps: give each checkbox a unique stable id following the existing
  scheme, add it inside a `.step` with the right `data-aud`, and the JS counts/progress
  update automatically (no JS edit needed).
- Maintain accessibility: visible focus, `prefers-reduced-motion`, real `<label>`s tied
  to inputs.

## Suggested first commit

```
git init
git add index.html logo_heg-ge.svg CLAUDE.md
git commit -m "Initial: HEG IBM bachelor thesis process tracker + handoff notes"
```

## If you (Claude Code) are unsure

Re-read "Non-negotiable design decisions" and "Source facts" first. If a requested
change conflicts with a HEG document fact, say so and ask before overriding it — the
academic requirements outrank aesthetic or convenience preferences.
