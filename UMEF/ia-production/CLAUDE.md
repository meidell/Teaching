# UMEF · MIA 506 — Déploiement et pilotage des systèmes d’IA en production

`UMEF/ia-production/`, id = ns = storage prefix **`mia506`** (renamed 16 Nov 2026
from the calendar placeholder `ia-prod`; nothing had been stored under it).
MSc IA, programme MSc-AI-FR-26-27, **11 students**, Geneva campus. French only.

## Session parameters (for /new-session)

- **Engine**: UMEF/mfb545's, copied and renamed (journee.js, mlops.css = fintech.css,
  courseprogress.js, presence.js, exercises.js, answers.js, teams.js, lang.js).
  Pages `journeeN.html`, module ids `w1…w6`. Every 90-min block = 🎤 exposé
  (15–25 min, written out in full) + 🛠 atelier + 🔁 mise en commun — Jan Erik's
  mfb545 rule, applied here instead of the syllabus's "morning lecture / afternoon lab".
  No day timeline (`.daytl`) on the pages (mfb545 rule).
- **Dates**: Fri 20 Nov, 27 Nov, 4 Dec, 11 Dec, 18 Dec 2026, Fri 8 Jan 2027,
  09h00–12h15 + 13h30–16h45; blocks 09h00–10h30, 10h45–12h15, 13h30–15h00, 15h15–16h45.
  Final exam **Sat 6 Feb 2027 09h45**, 2 h, written. Keep `courses.json → schedule.dates`
  and the hub's `DAYS` in step.
- **Grading** 10 % participation (presence, ateliers, atelier deliverables: canevas,
  note de chiffrage, rapport d’incident, maquette du tableau de bord) · 40 % project ·
  50 % exam. The daily quiz is **self-assessment, not graded** (the syllabus names
  "quiz d’auto-évaluation"); it is still launched in class (`_release/<mod>/quiz`).
- **Teams**: three teams of 3–4 (`teams.js` IDS t1–t3, 4 seats). Syllabus said 3 × 3.
- **Running lab case, days 1–4**: **Jàppo Pay**, a FICTIONAL Senegalese mobile-money
  operator, fraud detection. `files/jappo_transactions.csv` (24 000 rows, 1–30 Oct 2026,
  317 frauds = 1.32 %) from `_build/dataset.py` (seed 506, deterministic). J1 trains it,
  J2 serves it (HF Spaces + Gradio), J3 writes its data contract/tests and injects
  corrupted data, J4 detects drift on it (Evidently). The team project is separate.
- **Notebooks**: `_build/notebook.py` writes `files/j1_modele.ipynb`; `--run <python>`
  executes it on the local CSV and prints the ➜ values. Opened in Colab from GitHub
  (`colab.research.google.com/github/meidell/Teaching/blob/main/UMEF/ia-production/files/…`)
  — works only once pushed; the CSV is read from the live site.
- **Writing**: WRITING.md, plus the mfb545 tone. Every number with unit, euro, source.

## Numbers checked on journée 1 (scikit-learn 1.9.1, 16 Nov 2026)

Temporal split train < 25 Oct (19 156 ops, 260 frauds) / test 25–30 Oct (4 844, 57).
Pipeline(StandardScaler + OneHotEncoder, LogisticRegression balanced): at 0.5 recall
0.79 (45/57), precision 0.05, 938 honest blocked; AUC 0.888; at 0.9: 99 blocked,
19 frauds, 80 honest; suspicious op 0.991, ordinary 0.050; joblib 3.8 KB, ONNX
1.6 KB, same probability. Capacity exercise: 50/s at peak, 50/s per core, 2 machines,
72 €/month vs batch 33.3 min → 1.50 €/month (price 0.05 €/h is FICTIONAL, labelled).
⚠ `num()` reads "0,991" as 991: ask three-decimal values in %.

## Deviations from the syllabus (told to Jan Erik 16 Nov 2026 — confirm)

1. Report + code due **Fri 15 Jan 2027 23h59**, not Tue 5 Jan: the 5 Jan date fell
   before Day 6 (governance/compliance, risk audit) and the presentation. Shown on the hub.
2. Each block mixes exposé and atelier (see above).
3. Three teams of 3–4 (11 students).
4. One running lab case J1–J4 (Jàppo Pay), made explicit.
5. A first AI-Act risk class goes into the J1 canevas (case 6); Day 6 does the detail.
6. Hand-in place not yet decided (UMEF platform per syllabus, or this site as in
   mfb545) — the hub says "indiqué avant la journée 5".

## ⚠ Day 1 rebuilt as a DOING day (19 Nov 2026) — the model for journées 2–6

Jan Erik, the evening before day 1: "I can not give this course in its current form. The
course must be learning by doing", "build the Python editing windows into the site. This
MUST be a DO class. We DO and USE THE TOOLS and then they learn." **No exposé opens a
block any more** (this replaces the "🎤 exposé + 🛠 atelier" rule above for this course):
students do the thing with the real tool, and a short mise en commun names what they met.
The first version (four exposés, Colab notebook, canevas) is `_private/journee1-v1-exposes.html`
and git history; `files/j1_modele.ipynb` is no longer linked.

- **Morning, in the page** (`/shared/codelab.js`, Pyodide, shared namespace `data-ns="j1"`,
  blocks `e1…e10`, checks = `<script type="text/python" id="chk2…chk9">`): load the CSV
  (the setup `j1setup` writes it into Pyodide's file system so `pd.read_csv("jappo_transactions.csv")`
  is real code), count frauds, explore, split by date, write `preparer()` (≥ 5 numeric
  variables; the check refuses the `fraude` column, non-finite values, and a function that
  fails or returns other columns on ONE raw operation — the `pd.get_dummies` trap), train any
  classifier, count blocked/missed/honest at 0.5, the class challenge (≤ 100 honest blocked;
  chk8 leaves `_score`, the page writes it to `w1_score`, shown with data-board), `predire()`
  + asserts. Pyodide 314.0.7 ships scikit-learn 1.8.0 / pandas 3.0.2; first run ≈ 32 MB.
- **Afternoon, a real server**: the page zips the student's own code as `modele.py` with
  `files/service/{app.py,Dockerfile,requirements.txt,README.md}` + the CSV (a stored zip built
  in JS) for a **Hugging Face Docker Space** (FastAPI on 7860, one request at a time on
  purpose, CORS open, a crash in `predire()` returned as 500 JSON). `requirements.txt` pins
  the Pyodide versions — change both together. The service RETRAINS at start-up; the page
  says it is a shortcut and day 2 replaces it with a versioned model file. Widgets: who-are-you,
  two test operations, four malformed operations, a load test (60 operations at 1/5/20/50 in
  parallel; text/plain POST so there is no preflight), whole class on one address. Then
  batch vs one-at-a-time (e10), the six capacity calculations (c1–c6, unchanged), incident
  report, teams, quiz (8 new questions, positions 1 3 0 2 2 0 3 1).
- Sections s1…s7, `courseprogress.js` total 7. Fields: w1_signes, w1_score, w1_pourquoi,
  w1_manque, w1_url, w1_ecart, w1_charge, w1_entrees, w1_incident, w1_equipe.
- Reference results (≤ 100 honest): logistic + the 9 variables of `_private/j1_solution.py`
  at 0.9 → 14 of 57 frauds, 77 honest; random forest (100 trees) at 0.4 → 15, 77.
- Tested 19 Nov 2026 headless (Playwright): every step right and wrong, reload (earlier steps
  re-run by themselves), the zip, the service started from that zip (same probability as the
  browser), all widgets against a local uvicorn, 390 px. **NOT tested: creating the Space on
  Hugging Face** (needs an account) — Jan Erik deploys his own once; guide in
  `_private/journee1-guide.html`.
- Consequences for later days: day 2 no longer "puts the model online" (done on day 1) — it
  starts from the students' Spaces (artefact + version, MLflow, real prices). The deployment
  canvas, the three failure cases and the law left day 1: place them in days 2 and 6.

## Senegal and West Africa toned down (19 Nov 2026)

Jan Erik: "just tone down senegal, ouest-africaine". Jàppo Pay is now "un opérateur de
paiement mobile fictif" with no country (hub, journée 1, notebook, courses.json); amounts
stay in FCFA (the CSV columns are `*_fcfa`). Section 1.6 is "Les outils, les contraintes du
terrain et la loi": the five constraints are general, West Africa is one example (cloud
regions); the laws are the AI Act, "the data-protection law of the country concerned"
(RGPD, Swiss LPD, loi 2008-12 as three examples) and conventions (108, Malabo). Keep this
level in journées 2–6: a general statement first, a West African fact only as an example.

## Facts verified 16 Nov 2026 (re-check before Day 6)

- AI Act: Reg. (EU) 2024/1689 in force 1 Aug 2024; prohibitions 2 Feb 2025; the
  **Digital Omnibus, Reg. (EU) 2026/1744** (OJ 24 Jul 2026, in force 27 Jul 2026)
  moved Annex III high-risk obligations to **2 Dec 2027** (Annex I products to
  2 Aug 2028); Art. 50 transparency not deferred. Annex III 5(b) creditworthiness is
  high-risk, fraud detection explicitly excluded; 5(d) emergency patient triage.
- Senegal: loi 2008-12 still in force (reform pending since 2019; the 2026 digital-
  security bill does not replace it). Malabo Convention in force 8 Jun 2023.
- No AWS/Azure/Google cloud region in West Africa found; African regions in South Africa.
- Cases: Beede et al. CHI 2020 (11 clinics, Pathum Thani + Chiang Mai, Nov 2018–Aug
  2019; no rejection % stated on the page — not verified); Zillow Offers wind-down
  2 Nov 2021, Q3 2021 inventory write-down $304 m, ~25 % staff (~2 000); Amazon CV
  tool, Reuters (Dastin) 10 Oct 2018. Gartner press release 29 Jul 2024 (≥ 30 % of GenAI
  projects abandoned after PoC by end 2025 — a forecast). The "87 %" (VentureBeat 2019)
  is flagged on the page as unsourced.

## To do before Day 1 goes to students

- **Publish the `mia506` rules block** (firebase-database-rules.json) — until then
  sign-in, presence, teams and messages are refused.
- Push, so the Colab link and the CSV URL resolve; open the notebook once in Colab.
- Day 5 needs an LLM for the RAG atelier: decide (free Gemini API key from Google AI
  Studio, or a small open model on Colab's GPU).
