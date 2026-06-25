# thesis-worker — shared API for the HEG thesis tracker (and the Teaching site)

A small Flask + Postgres service for Render. It does two things, and nothing else:

1. **Saves student progress** (keyed by a resume code) so the tracker works across devices.
2. **Proxies Claude as a COACH** — it asks questions and critiques, and is hard-wired in
   [`coach.py`](coach.py) never to write the student's deliverables. The API key lives only
   here, never in the browser.

It is **multi-app**: the thesis tracker uses it fully; the static **Teaching** site can call
`/api/coach` with `app:"teaching"` too (Firebase stays Teaching's own data layer). Tables in
the shared `teaching_db` are namespaced `tracker_*`.

## Run locally
```bash
cp .env.example .env      # fill ANTHROPIC_API_KEY; DATABASE_URL is optional locally
pip install -r requirements.txt
python main.py            # http://localhost:10000/api/health
```
Without `DATABASE_URL` the server still runs — coaching works; the progress endpoints return 503.

## Deploy on Render
This folder is a subdirectory of the Teaching repo, so create the Render service pointing at
the GitHub repo with the **Root Directory set to `thesis-worker`**:

- **Root Directory:** `thesis-worker`
- **Build:** `pip install -r requirements.txt`
- **Start:** `gunicorn main:app --bind 0.0.0.0:$PORT`
- **Region:** Frankfurt (same as the database)

Environment variables (Dashboard → Environment):

| Key | Value |
|---|---|
| `ANTHROPIC_API_KEY` | your Claude key (kept out of git) |
| `DATABASE_URL` | the existing `teaching_db` connection string |
| `ALLOWED_ORIGINS` | comma-separated front-end origins, e.g. `https://www.hesge.ch,http://localhost:5500` |
| `COACH_MODEL` | `claude-opus-4-8` (default; `claude-haiku-4-5` / `claude-sonnet-4-6` are cheaper) |

`render.yaml` captures the same settings if you prefer a Blueprint deploy.

> **Never commit `.env`** — it holds the DB URL and the API key. It is git-ignored here and in
> the Teaching repo root.

## Endpoints
| Method | Path | Purpose |
|---|---|---|
| GET  | `/api/health` | `{ok, db, ai, model}` |
| POST | `/api/student` | `{app}` → `{code}` (a resume code) |
| GET  | `/api/progress?code=` | load saved fields |
| PUT  | `/api/progress` | `{code, entries}` autosave |
| POST | `/api/coach` | `{app, step, fields, question?, code?}` → coaching |

`/api/coach` returns `{allowed:true, strengths, gaps, questions}` for most steps,
`{allowed:true, mode:"mockDefense", mockQuestions}` for Step 9, and
`{allowed:false, honesty:true, message}` for Step 5 (data collection — no AI by design).

## Calling it from a static page
Copy [`coach-client.js`](coach-client.js) into the site:
```html
<script>window.WORKER_BASE = "https://thesis-worker.onrender.com";</script>
<script src="coach-client.js"></script>
<script>
  const r = await ThesisWorker.coach("thesis", "1",
    { "f1-topic": "…", "f1-measure": "…" });
  // r.strengths / r.gaps / r.questions
</script>
```
Add the page's origin to `ALLOWED_ORIGINS` so CORS lets it through.

## The coach guardrail
`coach.py` holds one contract: the model may only question, surface gaps, and confirm
strengths — never write the topic, problem statement, RQ, lit review, methods,
recommendations, abstract, or citations. Step 5 (data) is off-limits entirely; Step 9
generates mock jury questions instead of prose. Every exchange is logged to
`tracker_coach_log` as part of the student's process-evidence trail.
