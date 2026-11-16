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
