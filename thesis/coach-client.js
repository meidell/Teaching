/* Tiny browser client for the Thesis Worker API.
   Drop into any static site (the thesis tracker, or a Teaching module) and set
   the worker URL first:

     <script>window.WORKER_BASE = "https://thesis-worker.onrender.com";</script>
     <script src="coach-client.js"></script>

   Then:
     const r = await ThesisWorker.coach("thesis", "1", { "f1-topic": "...", "f1-measure": "..." });
     // r.allowed, r.strengths, r.gaps, r.questions  (or r.honesty/r.message on no-coach steps)
*/
(function (global) {
  var BASE = (global.WORKER_BASE || "").replace(/\/+$/, "");
  function api(path) { return BASE + "/api" + path; }

  async function jsonFetch(path, opts) {
    var res = await fetch(api(path), opts);
    return res.json();
  }

  async function coach(app, step, fields, opts) {
    opts = opts || {};
    return jsonFetch("/coach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        app: app, step: step, fields: fields || {},
        question: opts.question || "", code: opts.code || null,
      }),
    });
  }

  async function newStudent(app) {
    return jsonFetch("/student", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ app: app || "thesis" }),
    });
  }

  async function loadProgress(code) {
    return jsonFetch("/progress?code=" + encodeURIComponent(code));
  }

  async function saveProgress(code, entries) {
    return jsonFetch("/progress", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: code, entries: entries || {} }),
    });
  }

  global.ThesisWorker = {
    coach: coach,
    newStudent: newStudent,
    loadProgress: loadProgress,
    saveProgress: saveProgress,
  };
})(window);
