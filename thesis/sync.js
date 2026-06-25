/* sync.js — optional cross-device progress sync for the thesis tracker.
 *
 * Activates ONLY when window.WORKER_BASE is set (to the Render worker URL).
 * When unset, this file does nothing and the page stays local-only (localStorage),
 * exactly as it behaved before the backend existed.
 *
 * What it does when active:
 *   - manages a resume code (created via the worker, stored in localStorage)
 *   - on load: pulls saved progress from the worker and applies it (cloud wins)
 *   - on any checkbox / [data-field] change: debounced autosave to the worker
 *   - shows a small status chip in the sticky progress rail
 *
 * It is additive: the page's own localStorage logic keeps running underneath.
 */
(function () {
  "use strict";

  var BASE = (window.WORKER_BASE || "").replace(/\/+$/, "");
  if (!BASE) return; // no backend configured — stay fully local-only

  var CODE_KEY = "heg_ibm_thesis_v1_code";
  var SAVE_DELAY = 800;

  var code = null;
  try { code = localStorage.getItem(CODE_KEY) || null; } catch (e) {}
  var suppress = false; // true while applying remote state, so we don't echo it back
  var timer = null;
  var chip = null;

  function api(p) { return BASE + "/api" + p; }
  function boxes() { return Array.prototype.slice.call(document.querySelectorAll(".cbx")); }
  function fields() { return Array.prototype.slice.call(document.querySelectorAll("[data-field]")); }

  function gather() {
    var o = {};
    boxes().forEach(function (b) { if (b.id) o[b.id] = b.checked ? "1" : "0"; });
    fields().forEach(function (el) {
      var k = el.getAttribute("data-field");
      if (k) o[k] = el.value;
    });
    return o;
  }

  function applyEntries(entries) {
    if (!entries) return;
    suppress = true;
    try {
      boxes().forEach(function (b) {
        if (b.id && Object.prototype.hasOwnProperty.call(entries, b.id)) {
          var want = entries[b.id] === "1";
          if (b.checked !== want) {
            b.checked = want;
            b.dispatchEvent(new Event("change", { bubbles: true })); // let the page update counts + localStorage
          }
        }
      });
      fields().forEach(function (el) {
        var k = el.getAttribute("data-field");
        if (k && Object.prototype.hasOwnProperty.call(entries, k)) {
          el.value = entries[k];
          el.dispatchEvent(new Event("input", { bubbles: true }));
          el.dispatchEvent(new Event("change", { bubbles: true }));
        }
      });
    } finally {
      suppress = false;
    }
  }

  function setStatus(text) {
    var s = chip && chip.querySelector(".sync-st");
    if (s) s.textContent = text;
  }

  function saveCode() { try { localStorage.setItem(CODE_KEY, code); } catch (e) {} }
  function clearCode() { code = null; try { localStorage.removeItem(CODE_KEY); } catch (e) {} }

  async function pull() {
    if (!code) return;
    setStatus("loading…");
    try {
      var r = await fetch(api("/progress?code=" + encodeURIComponent(code)));
      if (r.status === 404) { alert("That resume code wasn't found."); clearCode(); render(); return; }
      var d = await r.json();
      applyEntries(d.entries || {});
      setStatus("synced");
    } catch (e) {
      setStatus("offline");
    }
  }

  async function push() {
    if (!code) return;
    setStatus("saving…");
    try {
      await fetch(api("/progress"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code, entries: gather() }),
      });
      setStatus("saved");
    } catch (e) {
      setStatus("offline");
    }
  }

  function schedulePush() {
    if (suppress || !code) return;
    clearTimeout(timer);
    timer = setTimeout(push, SAVE_DELAY);
  }

  async function enable() {
    setStatus("connecting…");
    try {
      var r = await fetch(api("/student"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ app: "thesis" }),
      });
      var d = await r.json();
      if (!d.code) throw new Error("no code returned");
      code = d.code;
      saveCode();
      render();
      await push(); // seed the cloud with whatever is already on this device
    } catch (e) {
      setStatus("could not connect");
    }
  }

  async function enterCode() {
    var c = (prompt("Enter your resume code (e.g. HEG-XXXX-XXXX):") || "").trim().toUpperCase();
    if (!c) return;
    code = c;
    saveCode();
    render();
    await pull();
  }

  // ---- status chip in the progress rail ----
  function render() {
    var wrap = document.querySelector(".progress-rail .wrap");
    if (!wrap) return;
    if (!chip) {
      chip = document.createElement("div");
      chip.style.cssText =
        "display:flex;align-items:center;gap:8px;font-family:var(--mono,ui-monospace,monospace);" +
        "font-size:11px;letter-spacing:.04em;white-space:nowrap;";
      wrap.appendChild(chip);
    }
    if (!code) {
      chip.innerHTML =
        '<button type="button" data-act="enable" style="font:inherit;cursor:pointer;background:none;' +
        'border:1px solid currentColor;border-radius:3px;padding:5px 10px;opacity:.85;">☁ Enable cloud sync</button>' +
        '<a href="#" data-act="enter" style="color:inherit;opacity:.6;">have a code?</a>';
    } else {
      chip.innerHTML =
        '☁ <code data-act="copy" title="click to copy" style="cursor:pointer;font:inherit;">' + code + "</code>" +
        ' <span class="sync-st" style="opacity:.6;">…</span>' +
        ' <a href="#" data-act="enter" style="color:inherit;opacity:.5;">change</a>';
    }
    chip.querySelectorAll("[data-act]").forEach(function (el) {
      el.addEventListener("click", function (ev) {
        ev.preventDefault();
        var a = el.getAttribute("data-act");
        if (a === "enable") enable();
        else if (a === "enter") enterCode();
        else if (a === "copy") { try { navigator.clipboard.writeText(code); setStatus("copied"); } catch (e) {} }
      });
    });
  }

  // ---- listeners ----
  document.addEventListener("change", function (e) {
    var t = e.target;
    if (t && t.classList && (t.classList.contains("cbx") || (t.hasAttribute && t.hasAttribute("data-field")))) {
      schedulePush();
    }
  });
  document.addEventListener("input", function (e) {
    var t = e.target;
    if (t && t.hasAttribute && t.hasAttribute("data-field")) schedulePush();
  });

  function init() {
    render();
    if (code) pull();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
