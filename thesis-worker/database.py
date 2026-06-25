"""Postgres access for the Thesis Worker.

Lives in the shared Render `teaching_db`, so every table is namespaced with a
`tracker_` prefix to avoid colliding with anything else in that database.
Connection style mirrors the other Workers in /Sites (psycopg2 + DATABASE_URL).
"""

import json
import logging
import os
import secrets
from urllib.parse import urlparse

import psycopg2
import psycopg2.extras

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

DATABASE_URL = os.environ.get("DATABASE_URL", "").strip()


def enabled() -> bool:
    """True when a database is configured. The API still runs without one."""
    return bool(DATABASE_URL)


def get_connection():
    if not DATABASE_URL:
        return None
    parts = urlparse(DATABASE_URL)
    local = parts.hostname in ("localhost", "127.0.0.1")
    return psycopg2.connect(
        dbname=parts.path[1:],
        user=parts.username,
        password=parts.password,
        host=parts.hostname,
        port=parts.port or 5432,
        sslmode="prefer" if local else "require",  # Render external connections need SSL
    )


SCHEMA = """
CREATE TABLE IF NOT EXISTS tracker_students (
    id          SERIAL PRIMARY KEY,
    code        TEXT UNIQUE NOT NULL,
    app         TEXT NOT NULL DEFAULT 'thesis',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS tracker_entries (
    student_id  INTEGER NOT NULL REFERENCES tracker_students(id) ON DELETE CASCADE,
    field_key   TEXT NOT NULL,
    value       TEXT NOT NULL,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (student_id, field_key)
);
CREATE TABLE IF NOT EXISTS tracker_coach_log (
    id          SERIAL PRIMARY KEY,
    student_id  INTEGER REFERENCES tracker_students(id) ON DELETE SET NULL,
    app         TEXT NOT NULL,
    step        TEXT,
    role        TEXT NOT NULL,
    content     TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
"""


def init_schema():
    """Create the tracker_* tables if missing. No-op (with a warning) when no DB."""
    if not enabled():
        logging.warning("DATABASE_URL not set — running without persistence.")
        return
    try:
        conn = get_connection()
        with conn, conn.cursor() as cur:
            cur.execute(SCHEMA)
        conn.close()
        logging.info("Database schema ready (tracker_* tables).")
    except Exception:
        logging.exception("Schema init failed — continuing without persistence.")


def _new_code() -> str:
    alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"  # no ambiguous characters
    block = lambda n: "".join(secrets.choice(alphabet) for _ in range(n))
    return f"HEG-{block(4)}-{block(4)}"


def create_student(app_name: str = "thesis") -> str:
    conn = get_connection()
    try:
        conn.autocommit = True
        with conn.cursor() as cur:
            for _ in range(5):
                code = _new_code()
                try:
                    cur.execute(
                        "INSERT INTO tracker_students (code, app) VALUES (%s, %s) RETURNING code;",
                        (code, app_name),
                    )
                    return cur.fetchone()[0]
                except psycopg2.errors.UniqueViolation:
                    conn.rollback()
        raise RuntimeError("could not allocate a unique student code")
    finally:
        conn.close()


def get_student_by_code(code):
    conn = get_connection()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute("SELECT id, code, app FROM tracker_students WHERE code = %s;", (code,))
            return cur.fetchone()
    finally:
        conn.close()


def load_entries(student_id) -> dict:
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT field_key, value FROM tracker_entries WHERE student_id = %s;", (student_id,))
            return {key: value for key, value in cur.fetchall()}
    finally:
        conn.close()


def save_entries(student_id, entries: dict) -> int:
    if not entries:
        return 0
    conn = get_connection()
    try:
        with conn, conn.cursor() as cur:
            for key, value in entries.items():
                cur.execute(
                    """INSERT INTO tracker_entries (student_id, field_key, value, updated_at)
                       VALUES (%s, %s, %s, now())
                       ON CONFLICT (student_id, field_key)
                       DO UPDATE SET value = EXCLUDED.value, updated_at = now();""",
                    (student_id, str(key), str(value)),
                )
        return len(entries)
    finally:
        conn.close()


def log_coach(student_id, app_name, step, role, content):
    """Best-effort write of one coaching exchange (the process-evidence trail)."""
    if not enabled():
        return
    try:
        conn = get_connection()
        with conn, conn.cursor() as cur:
            cur.execute(
                "INSERT INTO tracker_coach_log (student_id, app, step, role, content) "
                "VALUES (%s, %s, %s, %s, %s);",
                (
                    student_id,
                    app_name,
                    step,
                    role,
                    content if isinstance(content, str) else json.dumps(content, ensure_ascii=False),
                ),
            )
        conn.close()
    except Exception:
        logging.exception("coach_log insert failed (ignored).")
