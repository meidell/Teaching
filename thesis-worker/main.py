"""Thesis Worker — Flask API.

Two jobs only: save student progress (resume-code keyed) and proxy Claude as a
coach. The Anthropic key lives here, never in the browser. Multi-app: the thesis
tracker and the static Teaching site both call it over CORS.

Local:  python main.py        Render:  gunicorn main:app --bind 0.0.0.0:$PORT
"""

from dotenv import load_dotenv

load_dotenv()  # local dev: read .env; on Render the vars come from the dashboard

import logging
import os
import time
from collections import defaultdict

from flask import Flask, jsonify, request
from flask_cors import CORS

import coach
import database as db

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

app = Flask(__name__)

_origins = [o.strip() for o in os.environ.get("ALLOWED_ORIGINS", "").split(",") if o.strip()]
CORS(app, resources={r"/api/*": {"origins": _origins or "*"}})  # "*" only when unset (dev)

db.init_schema()  # idempotent; no-op without DATABASE_URL

# ── tiny in-memory rate limiter for the AI proxy (per IP) ────────────────────
_RATE = defaultdict(list)
_RATE_MAX = 20      # requests
_RATE_WINDOW = 60.0  # seconds


def _rate_ok(ip: str) -> bool:
    now = time.time()
    hits = [t for t in _RATE[ip] if now - t < _RATE_WINDOW]
    hits.append(now)
    _RATE[ip] = hits
    return len(hits) <= _RATE_MAX


@app.get("/api/health")
def health():
    return jsonify(ok=True, db=db.enabled(), ai=coach.ai_enabled(), model=coach.COACH_MODEL)


@app.post("/api/student")
def create_student():
    if not db.enabled():
        return jsonify(error="no_database"), 503
    body = request.get_json(silent=True) or {}
    code = db.create_student(body.get("app", "thesis"))
    return jsonify(code=code)


@app.get("/api/progress")
def get_progress():
    if not db.enabled():
        return jsonify(error="no_database"), 503
    code = request.args.get("code", "").strip()
    if not code:
        return jsonify(error="missing_code"), 400
    student = db.get_student_by_code(code)
    if not student:
        return jsonify(error="unknown_code"), 404
    return jsonify(code=student["code"], app=student["app"], entries=db.load_entries(student["id"]))


@app.put("/api/progress")
def put_progress():
    if not db.enabled():
        return jsonify(error="no_database"), 503
    body = request.get_json(silent=True) or {}
    code = (body.get("code") or "").strip()
    entries = body.get("entries") or {}
    if not code:
        return jsonify(error="missing_code"), 400
    student = db.get_student_by_code(code)
    if not student:
        return jsonify(error="unknown_code"), 404
    return jsonify(ok=True, saved=db.save_entries(student["id"], entries))


@app.post("/api/coach")
def coach_endpoint():
    ip = request.headers.get("x-forwarded-for", request.remote_addr or "?").split(",")[0].strip()
    if not _rate_ok(ip):
        return jsonify(error="rate_limited"), 429

    body = request.get_json(silent=True) or {}
    app_name = body.get("app", "thesis")
    step = str(body.get("step", ""))
    fields = body.get("fields") or {}
    question = body.get("question") or ""
    code = (body.get("code") or "").strip() or None

    plan = coach.build(app_name, step=step, fields=fields, question=question)
    if plan is None:
        return jsonify(error="unknown_app"), 400
    if not plan["allowed"]:
        return jsonify(allowed=False, honesty=plan.get("honesty", False), message=plan["message"])

    if not coach.ai_enabled():
        return jsonify(error="coach_unavailable",
                       message="AI coaching is not configured on the server yet."), 503

    student = db.get_student_by_code(code) if (code and db.enabled()) else None
    try:
        result = coach.run(plan)
    except Exception:
        logging.exception("coach call failed")
        return jsonify(error="coach_failed"), 502

    if result.get("refused"):
        return jsonify(allowed=True, refused=True, message="The coach declined this request.")

    sid = student["id"] if student else None
    db.log_coach(sid, app_name, step, "student", {"fields": fields, "question": question})
    db.log_coach(sid, app_name, step, "coach", result["data"])

    return jsonify(allowed=True, mode=plan["mode"], **result["data"])


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "10000"))
    app.run(host="0.0.0.0", port=port, debug=True)
