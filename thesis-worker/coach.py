"""The Claude coach — and the contract that keeps it a coach, not a ghostwriter.

The model may only ask questions, surface gaps, and confirm genuine strengths.
It must never write any of the student's deliverable. Data collection (Step 5)
gets no coach at all; the defense (Step 9) gets a mock-jury-question generator.
"""

import json
import logging
import os

import anthropic

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

COACH_MODEL = os.environ.get("COACH_MODEL", "claude-opus-4-8").strip() or "claude-opus-4-8"

_client = None


def ai_enabled() -> bool:
    return bool(os.environ.get("ANTHROPIC_API_KEY", "").strip())


def _get_client():
    global _client
    if _client is None:
        _client = anthropic.Anthropic()  # reads ANTHROPIC_API_KEY from the environment
    return _client


# ── The non-negotiable coach contract ───────────────────────────────────────
COACH_CONTRACT = """You are a thesis-process COACH for a Haute École de Gestion (HEG-Genève) \
International Business Management bachelor student. Your only job is to help the student think for themselves.

ABSOLUTE RULES — never break these, whatever the student asks:
- You NEVER write, draft, rewrite, paraphrase, or "improve" any of the student's deliverable text: not the \
topic, problem statement, research question, objectives, literature review, methods, analysis, \
recommendations, abstract, conclusion, or citations. Not even one sentence, and not a "quick example" they \
could copy.
- You never produce citations or invent sources, data, authors, or statistics.
- You judge the student's OWN words. If a field is empty or thin, you ask what belongs there — you do not fill it.
- If the student asks you to write any deliverable for them, refuse in one short sentence and replace it with \
the questions that would help THEM write it.

You only ask questions, name gaps, and confirm genuine strengths — always specific to what the student \
actually wrote. Keep every item to one or two sentences. Respond ONLY with the required JSON."""

COACH_SCHEMA = {
    "type": "object",
    "additionalProperties": False,
    "properties": {
        "strengths": {"type": "array", "items": {"type": "string"}},
        "gaps": {"type": "array", "items": {"type": "string"}},
        "questions": {"type": "array", "items": {"type": "string"}},
    },
    "required": ["strengths", "gaps", "questions"],
}

DEFENSE_SCHEMA = {
    "type": "object",
    "additionalProperties": False,
    "properties": {
        "mockQuestions": {
            "type": "array",
            "items": {
                "type": "object",
                "additionalProperties": False,
                "properties": {
                    "question": {"type": "string"},
                    "probes": {"type": "string"},
                },
                "required": ["question", "probes"],
            },
        }
    },
    "required": ["mockQuestions"],
}

HONESTY_LINE = (
    "Data collection has no legitimate AI role. Fabricated or “synthetic” respondents are an ethics "
    "breach and collapse under examination — you collect the real data yourself. The coach stays out of this step."
)

# ── Thesis step map (from the HEG source facts) ──────────────────────────────
# (title, focus). focus=None marks a step with no coach (Step 5).
THESIS_STEPS = {
    "1": ("Choice of research topic",
          "An applied, international, measurable problem tied to the student's Minor. The blunt kick-off rule: "
          "you only get to study it if you can measure it."),
    "2": ("Research problem & literature review",
          "A problem statement (the gap, who it matters to, why) plus a CRITICAL literature review where sources "
          "argue with each other rather than being listed. ISO 690."),
    "3": ("Problem presentation — question, objectives, design",
          "Alignment is everything: problem → question → objectives → method must line up. Methods "
          "must fit the objectives and the data must be representative of them."),
    "4": ("Research design & measurements",
          "Turning the method into concrete instruments: operationalising concepts, informed consent, piloting. "
          "Surveys need mentor approval before distribution."),
    "5": ("Data collection & sample", None),  # no coach — honesty line
    "6": ("Analysis",
          "Interpretation → critical analysis → context → clearly flagged important results. "
          "Description is not analysis."),
    "7": ("Recommendations & actions",
          "Recommendations that answer the research question, fit the SPECIFIC partner, are implementable and "
          "prioritised, and show independent thinking."),
    "8": ("Writing & formal submission",
          "Structure, English, exhibits, ISO 690 citations, abstract. Formal aspects can SUBTRACT points. AI may "
          "copy-edit, but every claim must be the student's own."),
    "9": ("Oral defense", "A 60-minute in-person defense: rehearse defending every choice aloud."),
}


def _fields_block(fields: dict) -> str:
    if not fields:
        return "(the student has not written anything here yet)"
    parts = []
    for key, value in fields.items():
        text = (str(value).strip() if value is not None else "") or "(empty)"
        parts.append(f"### {key}\n{text}")
    return "\n\n".join(parts)


def build(app_name, step="", fields=None, question=""):
    """Return a plan dict, or None for an unknown app."""
    fields = fields or {}
    if app_name == "thesis":
        return _build_thesis(str(step), fields, question)
    if app_name == "teaching":
        return _build_teaching(str(step), fields, question)
    return None


def _build_thesis(step, fields, question):
    cfg = THESIS_STEPS.get(step)
    if not cfg:
        return {"allowed": False, "message": "Unknown step."}
    title, focus = cfg

    if step == "5" or focus is None:
        return {"allowed": False, "honesty": True, "message": HONESTY_LINE}

    block = _fields_block(fields)

    if step == "9":
        system = (
            COACH_CONTRACT
            + "\n\nMODE: Mock-defense examiner. From the student's OWN material, generate the kind of probing "
            "questions an HEG jury would ask at the in-person defense. Do not answer them and do not write any of "
            "the student's content — only ask. Give each question a short 'probes' note naming what it tests."
        )
        user = (
            f"Step 9 — Oral defense. {focus}\n\nThe student's material so far:\n\n{block}\n\n"
            "Generate 6–10 tough but fair jury questions."
        )
        return {"allowed": True, "mode": "mockDefense", "system": system, "user": user, "schema": DEFENSE_SCHEMA}

    system = COACH_CONTRACT
    user = (
        f"Step {step} — {title}.\nWhat this step is really about: {focus}\n\n"
        f"The student's current work on this step:\n\n{block}\n"
    )
    if question:
        user += f'\nThe student also asks: "{question}"\n'
    user += (
        "\nCoach them: confirm any genuine strengths, name the gaps, and ask the questions that push their OWN "
        "thinking forward. Never write any of it for them."
    )
    return {"allowed": True, "mode": "coach", "system": system, "user": user, "schema": COACH_SCHEMA}


def _build_teaching(step, fields, question):
    """Placeholder for the Teaching site — same contract, generic per-module coach.
    Specialise per course module (blockchain, fintech, statistics, ...) as needed."""
    block = _fields_block(fields)
    label = step or "general"
    system = (
        COACH_CONTRACT
        + f'\n\nCONTEXT: You are coaching a student inside a teaching/course module ("{label}"). The same rule '
        "holds — never write the student's answer; only question, surface gaps, and confirm strengths."
    )
    user = f"Course module: {label}.\n\nStudent input:\n\n{block}\n"
    if question:
        user += f'\nStudent asks: "{question}"\n'
    user += "\nCoach them without writing their answer."
    return {"allowed": True, "mode": "coach", "system": system, "user": user, "schema": COACH_SCHEMA}


def run(plan):
    """Call Claude with the plan. Returns {'data': {...}} or {'refused': True}."""
    client = _get_client()
    resp = client.messages.create(
        model=COACH_MODEL,
        max_tokens=1500,
        system=plan["system"],
        output_config={"effort": "low", "format": {"type": "json_schema", "schema": plan["schema"]}},
        messages=[{"role": "user", "content": plan["user"]}],
    )
    if getattr(resp, "stop_reason", None) == "refusal":
        return {"refused": True}
    text = next((b.text for b in resp.content if getattr(b, "type", None) == "text"), "{}")
    return {"data": json.loads(text)}
