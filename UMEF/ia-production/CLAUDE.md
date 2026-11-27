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

## ⚠ INDIVIDUAL projects, no teams (20 Nov 2026)

Jan Erik, during day 1: "no group project. individual projects". The 40 % project is done
ALONE and graded individually; this overrides every "team" line in this file (Teams: three
teams of 3–4; deviation 3). The teams board left the hub (`teams.js` is no longer loaded),
day 1's field is `w1_projet` (was `w1_equipe`), `courses.json → project` lists day 1's ten
real fields. ⚠ Open: the 8 Jan presentation length (the hub says "indiquée avant la journée
5" — 11 individual talks of 15 + 10 min do not fit one afternoon) and the 15-page report
limit (kept). Day 5's red-teaming and day 6's risk audit are done on ANOTHER STUDENT's
system. Same day: "Ce cours en bref" panel (`#enbref`) added to the hub, the "Le déroulement
d’une journée" block removed, a "▶ Diapositives" button in the top bar of the day page and
the hub. Slides: `journee1-slides.html` (85 slides, no solutions, public, linked) and
`journee1-slides-enseignant.html` (101 slides with solutions, public but UNLINKED — the day
page's button switches to it on an unlocked instructor device); both generated, source deck
in `_private/journee1-slides.html`. Teacher solution PDFs for 1.1, 1.2, 1.4, 1.5 in `_private/`.

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

## The step-by-step solution, in French (27 Nov 2026)

Jan Erik: "give me the solution as a python script. a pdf — and give me small texts (in the
solution) so that I can explain — step by step — until the hugging face upload".
`_private/j1_solution.py` was rewritten as that script: eleven `# ===== ÉTAPE n` blocks, `#>`
lines = the text to say (what we do, why, the traps), `#=` lines = the expected output, `#$` =
shell; steps 1–9 are the page's code windows (random forest, 100 trees, `SEUIL_FINAL = 0.4` →
15 of 57 frauds, 77 honest; the logistic variant is named), steps 10–11 are the six files and
the Hugging Face Space, with the local uvicorn check. The same file IS a valid `modele.py`: run
end to end with pandas 3.0.2 / scikit-learn 1.8.0 (a venv; the system python3 has no sklearn),
all asserts pass, and the real service (`files/service/app.py`) was started with it and answered
`GET /` and `POST /predire` (0.544, bloquer) on 27 Nov 2026. `_build/solution_pdf.py` parses the
script and writes `_private/j1-solution-pas-a-pas.html` + `.pdf` (10 pages, Chrome headless — ⚠ a code line wider
than the page makes Chrome shrink the WHOLE document, so `pre` has `overflow-wrap:anywhere`);
the script is the single source — edit it, re-run the generator. Both outputs stay in `_private/`.

## Tool: `regression-logistique.html` (20 Nov 2026)

Jan Erik, during day 1: "a tool for understanding logistic regression using easy examples and
widgets". One scrolling page, no engine, no progress tracking, own inline JS and SVG (styles
`rl-*` in the page). Five steps: (1) 20 students, hours revised → passed or failed; the S curve
with sliders for weight w and bias b, a least-squares straight line to show why it fails;
(2) the calculation for one person (score, probability, odds, e^w); (3) the log-loss and a button
that animates to the fitted values (Newton in the page: w 1.42, b −5.71, loss 0.319, 17 of 20);
(4) a payment operation with six weights INVENTED for the example and labelled so (contribution
bars; the unit changes the weight, hence StandardScaler); (5) the threshold on 40 fixed operations
(8 frauds): blocked, missed, honest blocked, recall, precision. Five control questions (answers
50 · 2 · 59.9 · 7 · 0.80, absolute tolerances). Linked from journée 1's top bar and its
"train a model" step, and from the hub's top bar. Tested headless at 1280 and 390 px.

## Journée 2 built (27 Nov 2026, the morning of the class) — artefact, registre, service v2, prices

Jan Erik, 27 Nov 2026 09h: "give me an answer pdf to all the typical answers for this journée 1. then
create journée 2". Both done the same morning.

- **`_private/j1-reponses-types.pdf`** (+ `.html`, generator `_build/j1_reponses_pdf.py`, French): every
  question of day 1 — code steps 1–9 in brief, each ✍ field with a model answer, the four malformed
  inputs (RF and LR answers), experiment 3, the six calculations, the quiz. ⚠ The random forest's
  probabilities differ in the third decimal between machines (0.533 here, 0.544 in an earlier run; the
  0.70 row of the step-8 table gives 4 or 5); `j1_solution.py`'s `#=` lines now say 0.533.
- **`journee2.html`** (sections s1…s7, module `w2`, `courseprogress.js` total 7, live): built on day 1's
  model, Pyodide in the page. Blocks `e1…e6` share ns `j2`; **`e2`/`e3` are PREFILLED with the student's
  own day-1 code read from this device's localStorage** (`codelab:/UMEF/ia-production/journee1.html:e5`
  = preparer with the X_train lines stripped, `:e6` = the model, `SEUIL_FINAL` from `:e8`), else the
  reference solution — the page says which. e4 = the artefact (a dict: modele, seuil, variables in order,
  version, date, library versions → `modele-1.0.0.joblib`), size, SHA-256, reload, max |Δp| must be 0;
  e5 = a second version (reference: the logistic Pipeline at 0.9) + `registre.json` + `promouvoir()`, the
  check RECOMPUTES every count and every hash from the files (exactly one `production`); e6 =
  `predire_v2()` loading the production entry, columns compared to `ART["variables"]`, version in the
  reply — the check swaps `preparer` for one that renames a column and demands `{"erreur"}`; **e7 runs the
  ASSEMBLED modele.py (e2 + e6) in the EMPTY namespace `j2srv`** (`CodeLab.run('e7', text)`), as the
  server will — a predire_v2 that leans on `modele`/`X_test`/`SEUIL_FINAL` passes e6 and fails here with
  a message naming the cause; only then the zip button opens. `service_v2.zip` = `files/service-v2/*`
  (app.py v2: GET / returns `version_service:"2"`, `version_modele`, `empreinte`, `duree_demarrage_s`,
  `entrainement_au_demarrage:false`; requirements pin numpy 2.4.6 + joblib 1.5.3 beside sklearn/pandas —
  ⚠ Pyodide 314.0.7's versions, change together) + registre.json + every `.joblib` the registry names
  (read from Pyodide's FS with the NEW `CodeLab.readFile`) + modele.py. No CSV: the page tells students
  to delete it from the Space. Step 8 records the v1 server (`w2_avant`, readonly); step 9 = **the
  downtime watch**: GET / every 2 s during the Space rebuild, dots green/red/blue, stops after three
  v2 answers, prints the seconds without answer (`w2_apres`, `w2_interruption`). 2.3 names artefact,
  semver, hash, registry/promotion (MLflow Model Registry named, not installed), reproducibility,
  downtime (blue-green, rolling; canary → day 3). 2.4 = **seven numeric checks with the PUBLISHED prices,
  consulted 27 Nov 2026**: HF Spaces CPU Upgrade $0.03/h (huggingface.co/docs/hub/spaces-gpus), Cloud
  Run request-based $0.000024/vCPU-s, $0.0000025/GiB-s, $0.40/M requests (cloud.google.com/run/pricing),
  1 $ = 0.91 € stated; A 21.60 $, B 25.92 + 21.60 + 1.35 = 48.87 $, B/A 2.26, break-even 23.9 M
  calls/month, C 0.51 $; a live calculator; the **note de chiffrage** (`w2_chiffrage`, a syllabus
  deliverable). 2.5 = the project: CSV upload into Pyodide's FS (`CodeLab.writeFile`, new), `p1`
  (ns `proj`) artefact + registre, `p2` (ns `projsrv`, empty) = the server file, `service_projet.zip`,
  a second Space (`w2_projet_url`), the deployment canvas (`w2_canevas`). 2.6 = the three failure cases
  (Thaïlande/Beede 2020, Zillow 2021, Amazon 2018) as recorded picks (`buildPick`, k1–k3; two defensible
  answers each). Quiz 8 questions, positions 2 0 3 1 2 0 3 1. Fields: w2_versions, w2_url, w2_avant,
  w2_apres, w2_interruption, w2_outil, w2_chiffrage, w2_projet_url, w2_canevas (courses.json project §2).
- **`/shared/codelab.js` gained `CodeLab.readFile(name)` / `writeFile(name, bytes)`** (Pyodide FS) — the
  only shared change.
- **Slides**: `_build/j2_slides.py` is the single source → `_private/journee2-slides.html` (48, with
  solutions), `journee2-slides-enseignant.html` (same, public, unlinked; the page's button switches to
  it on an instructor device), `journee2-slides.html` (42, no `k-sol`). Hub: a second "▶ Diapositives ·
  journée 2" button.
- **Solution**: `_private/j2_solution.py` (12 `ÉTAPE` blocks, `#>`/`#=`/`#$`; steps 1–6 run end to end
  in a venv with the page's versions; steps 2 + 6 ARE the server's modele.py — step 6 redefines the two
  test operations for that reason) → `_build/solution_pdf.py 2` → `_private/j2-solution-pas-a-pas.pdf`
  (the generator now takes the day number). Reference: RF 4.4 MB (3.9 MB from Pyodide), loads in
  ~10 ms vs 0.7–1.3 s of training; LR 2.3 KB; 1.1.0 (LR, 0.9) promoted in the reference: 14/77 vs 15/77–78.
- **Tested 27 Nov 2026 headless** (Playwright, `scratchpad/test_j2.py`): prefill without day-1 code,
  e1–e7 right and wrong (wrong hash, two productions, no columns check, a predire_v2 using a morning
  global → refused by e7 only), the zip download, the files read back from Pyodide, c1–c7, the
  calculator, p1/p2, the picks, the prefill WITH a student's day-1 code (X_train/print lines stripped,
  SEUIL_FINAL carried over), 390 px (no section overflows; the 426 px scrollWidth on every mia506 page
  comes from theme.js's button in the top bar and was 512 px on journée 1 already — not touched).
  **The zip the BROWSER made** (Pyodide, Python 3.14 pickles) was unzipped and started with uvicorn
  under Python 3.12 + the pinned versions: GET / (0.71 s start, no training, version 1.1.0) and
  POST /predire (0.991, bloquer, version 1.1.0) answered; the 3.9 MB forest artefact loads too.
  ⚠ A chk6 bug found by the test (the swapped `preparer` called itself → RecursionError on every
  student) was fixed before commit. **NOT tested: the Space rebuild on Hugging Face and its downtime** —
  the watch widget is written against the documented behaviour (503/no answer while Building).
- ⚠ Hugging Face's docs page (27 Nov 2026) says "CPU Basic has no hourly cost, but creating a new Space
  that runs on compute (Gradio or Docker) requires a paid plan" — if a student cannot create the second
  Space for the project, that is why; day 1's Spaces already exist and are untouched by it.
- Not done: an English instructor's guide like `journee1-guide.html` (the French step-by-step PDF and
  the teacher deck carry the same content); day 3 still to build (data contract of the PROJECT, tests
  against corrupted data, GitHub Actions deploying the Space).

## ⚠ Hugging Face Docker Spaces became PAID → GitHub + Render (27 Nov 2026, during the class)

Jan Erik, in class: "docker is paying…", "maybe render?", "do it so that we deposit our files via github,
so we need a repository on github first and then install this on render. and then we need to set the
settings on render and so on… to be able to continue day 1". Since November 2026 Hugging Face's docs say
"Gradio and Docker Spaces run on compute and require a paid plan to create" (forum: new free accounts
have a CPU-basic quota of 0; Spaces created before keep running). **The server path of BOTH days is now
GitHub + Render**: a PUBLIC repo (`github.com/new`, then "uploading an existing file" with the zip's
files, "Commit changes"), then `dashboard.render.com` → New + → Web Service → Public Git Repository
(the repo URL) → Name · Language Python 3 · Branch main · Region Frankfurt · Build Command
`pip install -r requirements.txt` · Start Command `uvicorn app:app --host 0.0.0.0 --port $PORT` ·
Instance Type Free → Deploy. Free: no card, 512 MB, spins down after 15 min idle, ~1 min to wake,
zero-downtime redeploys, redeploys on every commit (render.com/docs/free, checked 27 Nov 2026).
- **journee1.html** section 1.4: the "before you start" tick is GitHub + Render accounts; step 11 is A (the
  repo) + B (the service, settings listed); the URL placeholders are `…onrender.com`; `cleanUrl` still
  accepts an hf.space address (a student with a surviving Space keeps using it; the page says so). The
  zip is unchanged (Dockerfile/README stay, "Render ignores them"). Day-1 slides: the six Étape 11
  slides replaced by seven (A 1–2, B 1–3, the failure table), the two Expérience slides patched;
  `_private/journee1-slides.html` is still the hand-written source (102 slides), public decks
  re-rendered from it by stripping `k-sol` and renumbering (86 / 102). `j1_solution.py` step 11 and
  `j1_reponses_pdf.py` step 11 rewritten; both PDFs regenerated. `_private/journee1-guide.html` (English,
  20 Nov) NOT updated — it still describes Spaces.
- **journee2.html** 2.2: step 8 = the day-1 server's state if it still exists (`#srvUrlOld`, or the
  button "Je n'ai plus de serveur de la journée 1" which fills `w2_avant`); step 9 = A the repo, B the
  service, C **start the watch before clicking Deploy** (measures seconds to the first answer), D promote
  the other version by editing `registre.json` on GitHub (Render redeploys; the watch shows whether the
  relay had a gap — Render is blue-green, Hugging Face rebuilds in place), E the cold start after lunch.
  The watch is generic: labels 'ko' / 'v1' / 'v2:<model version>', starts from whatever answers first,
  stops after three consecutive answers of another label, 30-min cap. A Space-update box remains for
  students whose Space survived. 2.3's downtime row and 2.4's note name Render; the project's second
  server is a second repo + Render service. Slides (`j2_slides.py`, 51/45) and `j2_solution.py` steps
  8–9 rewritten; PDF regenerated.
- Day-2 headless test re-run after the rewrite: all steps pass; the only "error" was a 429 from a
  CDN/Firebase resource after seven runs in a row (rate limit, not the page). ⚠ **Not tested: Render
  itself** (account creation, the settings form's exact labels, the deploy time with the training
  modele.py on a 0.1-CPU free instance — expect 30–90 s of training at every start on day 1's file).
- Day 3 consequence: GitHub Actions on these repos (tests on every commit) → Render auto-deploys; the
  "canary" idea needs a second service or a flag in registre.json.
