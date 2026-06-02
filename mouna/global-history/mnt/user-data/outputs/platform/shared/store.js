/* ============================================================
   GHP — Shared Assessment Store
   ------------------------------------------------------------
   This is the ONE place data persistence lives. The rest of the
   platform never touches storage directly — it calls Store.*.

   PROOF-OF-CONCEPT implementation:
     - in-memory results during a session
     - encode/decode a compact "result code" so a student can
       hand their result to a teacher with no accounts / no server
     - optional localStorage cache (works when files are opened
       directly in a browser; harmless if blocked)

   PRODUCTION path (documented for the grant):
     Replace the body of save/load/list with calls to a backend
     (e.g. Supabase/Postgres). The function signatures below are
     the stable seam — nothing else in the platform changes.
   ============================================================ */
(function (global) {
  const LS_KEY = 'ghp_results_v1';

  // ---- competency taxonomy (shared vocabulary, both languages) ----
  const COMPETENCIES = {
    cause:        { de: 'Ursache & Wirkung',        en: 'Cause & effect' },
    continuity:   { de: 'Kontinuität & Wandel',     en: 'Continuity & change' },
    interdep:     { de: 'Globale Verflechtung',     en: 'Global interdependence' },
    judgement:    { de: 'Historisches Urteilen',    en: 'Historical judgement' },
    perspective:  { de: 'Perspektivenübernahme',    en: 'Perspective-taking' },
    present:      { de: 'Gegenwartsbezug',          en: 'Present-day relevance' },
  };

  function competencyName(key, lang) {
    return (COMPETENCIES[key] && COMPETENCIES[key][lang]) || key;
  }

  // ---- in-memory session results ----
  // shape: { module, name, answers:[{cp, q, comp, correct}] }
  let _session = { module: null, name: null, answers: [] };

  function startSession(module, name) {
    _session = { module, name: name || null, answers: [] };
  }
  function record(cp, q, comp, correct) {
    _session.answers.push({ cp, q, comp, correct: !!correct });
  }
  function getSession() { return _session; }

  // ---- competency rollup for the current session ----
  function rollup(session) {
    const s = session || _session;
    const out = {};
    s.answers.forEach(a => {
      if (!out[a.comp]) out[a.comp] = { correct: 0, total: 0 };
      out[a.comp].total++;
      if (a.correct) out[a.comp].correct++;
    });
    return out;
  }

  // ---- compact result CODE (no backend needed) ----
  // Format: GHP1|module|name|comp:correct/total;comp:correct/total
  function encode(session) {
    const s = session || _session;
    const roll = rollup(s);
    const parts = Object.keys(roll).map(k => `${k}:${roll[k].correct}/${roll[k].total}`).join(';');
    const raw = ['GHP1', s.module || '', (s.name || '').replace(/[|]/g, ' '), parts].join('|');
    try { return btoa(unescape(encodeURIComponent(raw))); } catch (e) { return raw; }
  }
  function decode(code) {
    let raw = code.trim();
    try { raw = decodeURIComponent(escape(atob(raw))); } catch (e) { /* maybe already plain */ }
    const bits = raw.split('|');
    if (bits[0] !== 'GHP1') return null;
    const module = bits[1] || '';
    const name = bits[2] || '';
    const roll = {};
    (bits[3] || '').split(';').filter(Boolean).forEach(seg => {
      const [comp, frac] = seg.split(':');
      const [c, t] = (frac || '0/0').split('/').map(Number);
      roll[comp] = { correct: c || 0, total: t || 0 };
    });
    return { module, name, roll };
  }

  // ---- optional local cache (best-effort; safe if blocked) ----
  function cacheLocal() {
    try { localStorage.setItem(LS_KEY + '_last', encode(_session)); } catch (e) {}
  }

  // ---- teacher-side: aggregate many decoded codes ----
  function aggregate(decodedList) {
    const agg = {};   // comp -> {correct,total}
    let students = 0;
    decodedList.forEach(d => {
      if (!d) return;
      students++;
      Object.keys(d.roll).forEach(comp => {
        if (!agg[comp]) agg[comp] = { correct: 0, total: 0 };
        agg[comp].correct += d.roll[comp].correct;
        agg[comp].total += d.roll[comp].total;
      });
    });
    return { students, agg };
  }

  global.Store = {
    COMPETENCIES, competencyName,
    startSession, record, getSession, rollup,
    encode, decode, cacheLocal, aggregate,
  };
})(window);
