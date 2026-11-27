/* =====================================================================
   /shared/codelab.js — in-browser SQL and Python exercises (15 Nov 2026)

   Any element
     <div class="codelab" id="ex1" data-lang="sql|python"
          data-setup="…" data-check='…' data-hint="…" data-ok="…">initial code</div>
   becomes an editor, a Run button and an output box.

   ⚠ THE ONE CDN EXCEPTION OF THE SITE (approved by Jan Erik, 15 Nov 2026).
   The two engines are too large to inline, so they load from jsDelivr,
   with EXACT pinned versions, and only on the first Run:
     SQL    @duckdb/duckdb-wasm 1.32.0   (worker started from a Blob URL)
     Python Pyodide 314.0.7 (Python 3.14; numpy, pandas, matplotlib are
            loaded only when the code imports them)
   Change a version here and nowhere else, and re-run every lab's model
   answers headlessly after the change.

   data-setup
     SQL:    SQL text, or the id of a <script type="text/sql"> element. Any
             quoted file name ending in .csv / .parquet / .json inside it is
             fetched (relative to the page) and registered under that exact
             name, so read_csv_auto('data/x.csv') works on any static host.
             A setup runs once per page (CREATE OR REPLACE TABLE is wise).
     Python: Python text, or the id of a <script type="text/python">,
             run in the block's own namespace before the student's code.
   data-ns (Python, 19 Nov 2026)
     Blocks with the same data-ns share ONE namespace, like the cells of a
     notebook: a variable made in one block exists in the next. The setup
     runs once. Running a block first runs, silently, every earlier block
     of that name that has not run during this visit (so a reload loses
     nothing); data-step names a block in the message shown when an
     earlier block fails. CodeLab.get(ns, name) reads a variable.
     numpy, pandas, matplotlib, scikit-learn (import sklearn), scipy and
     joblib are loaded when the code imports them.
   data-check (JSON, optional)
     SQL:    {"rows":[[…],…], "ordered":false, "tol":0.01}
             column names are ignored; numbers match within tol; text matches
             without regard to case or surrounding spaces.
     Python: {"vars":{"npv":[159.36,0.01],"name":"text"}}  and/or
             {"py":"<code>"}: Python run in the block's namespace after the
             student's code; its last expression is the verdict: True =
             solved, a string = the message shown. "py" may also be the id
             of a <script type="text/python"> holding that code.
     Both:   {"fn":"globalName"} → window[globalName](result, block) returns
             true | false | "hint" | {ok, msg}. result = {cols, rows} (SQL)
             or {stdout, ns} (Python, ns = the PyProxy namespace).
   data-hint  shown when the check fails (after the specific message).
   data-ok    shown after "Correct:" when it passes.

   The student's code is saved per page and block in localStorage
   (codelab:<path>:<id>), with a "Reset the code" link. A solved block is
   remembered (codelab_ok:<path>:<id>) and fires `codelab:solved` on
   document with {id, ok}. CodeLab.solved() lists the solved ids.
   Course pages are light; dark styles apply under html[data-theme=dark].
   ===================================================================== */
(function () {
  'use strict';
  if (window.CodeLab) return;

  var DUCK_VER = '1.32.0';
  var DUCK = 'https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@' + DUCK_VER + '/dist/';
  var DUCK_ESM = 'https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@' + DUCK_VER + '/+esm';
  var PYO_VER = '314.0.7';
  var PYO = 'https://cdn.jsdelivr.net/pyodide/v' + PYO_VER + '/full/';

  var FR = /^fr/i.test(document.documentElement.lang || '');
  var T = FR ? {
    run: 'Exécuter', running: 'Exécution…', reset: 'Réinitialiser le code',
    resetQ: 'Remettre le code de départ ? Votre code sera effacé.',
    keys: 'Ctrl+Entrée (⌘+Entrée sur Mac) exécute le code. Tab indente ; Échap puis Tab quitte l’éditeur.',
    loadSql: 'Chargement du moteur SQL (environ 6 Mo, une fois par visite)…',
    loadPy: 'Chargement du moteur Python (environ 6 Mo, une fois par visite)…',
    loadPk: 'Chargement de {p} (une fois par visite)…', loadData: 'Chargement des tables…',
    rows: '{n} ligne(s)', shown: ', {n} affichées', sec: '{s} s', noRows: 'La requête a réussi et ne renvoie aucune ligne.',
    ok: 'Correct :', notYet: 'Pas encore.', err: 'Erreur', prior: 'Exécution des étapes précédentes de cette page…', priorErr: 'L’étape précédente ({n}) contient une erreur. Corrigez-la et exécutez-la d’abord.',
    noOut: 'Le code a tourné et n’a rien affiché. Utilisez print(…) pour voir un résultat.',
    nrows: 'Votre résultat a {a} ligne(s) ; la réponse en a {e}.', ncols: 'Votre résultat a {a} colonne(s) ; la réponse en a {e}.',
    cell: 'La ligne {r}, colonne {c} vaut {a} ; attendu autre chose.', order: 'Les bonnes lignes sont là, mais pas dans l’ordre demandé.',
    rowMiss: 'Une ligne attendue manque, par exemple : {r}.',
    noVar: 'La variable {v} n’existe pas encore. Créez-la avec ce nom exact.', badVar: '{v} vaut {a} ; ce n’est pas encore la bonne valeur.',
    offline: 'Le moteur n’a pas pu se charger. Vérifiez la connexion internet et rechargez la page.',
    solved: 'résolu', figure: 'Figure'
  } : {
    run: 'Run', running: 'Running…', reset: 'Reset the code',
    resetQ: 'Put back the starting code? Your code will be deleted.',
    keys: 'Ctrl+Enter (⌘+Enter on a Mac) runs the code. Tab indents; press Esc, then Tab, to leave the editor.',
    loadSql: 'Loading the SQL engine (about 6 MB, once per visit)…',
    loadPy: 'Loading the Python engine (about 6 MB, once per visit)…',
    loadPk: 'Loading {p} (once per visit)…', loadData: 'Loading the tables…',
    rows: '{n} row(s)', shown: ', the first {n} shown', sec: '{s} s', noRows: 'The query ran and returned no rows.',
    ok: 'Correct:', notYet: 'Not yet.', err: 'Error', prior: 'Running the earlier steps of this page…', priorErr: 'The earlier step ({n}) has an error. Fix it and run it first.',
    noOut: 'The code ran and printed nothing. Use print(…) to see a result.',
    nrows: 'Your result has {a} row(s); the answer has {e}.', ncols: 'Your result has {a} column(s); the answer has {e}.',
    cell: 'Row {r}, column {c} is {a}, which is not the expected value.', order: 'The right rows are there, but not in the order the task asks for.',
    rowMiss: 'An expected row is missing, for example: {r}.',
    noVar: 'The variable {v} does not exist yet. Create it with exactly this name.', badVar: '{v} is {a}, which is not the right value yet.',
    offline: 'The engine could not load. Check the internet connection and reload the page.',
    solved: 'solved', figure: 'Figure'
  };
  function f(s, o) { return s.replace(/\{(\w+)\}/g, function (_, k) { return o[k]; }); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { } }

  /* ---------------- CSS ---------------- */
  var CSS = '' +
    '.codelab{--cl-bg:#fff;--cl-ed:#FBFCFD;--cl-gut:#F1F3F6;--cl-gutx:#8A94A3;--cl-ink:#1B2430;--cl-line:#D8DEE6;--cl-soft:#5A6573;' +
    '--cl-btn:#101F44;--cl-btnx:#fff;--cl-okbg:#EAF5EC;--cl-okx:#1B6B37;--cl-nobg:#FFF6E5;--cl-nox:#7A4B00;--cl-errbg:#FDECEC;--cl-errx:#9B1C1C;--cl-th:#F1F4F8;' +
    'display:block;border:1px solid var(--cl-line);border-radius:12px;background:var(--cl-bg);color:var(--cl-ink);margin:12px 0 16px;overflow:hidden;max-width:100%;}' +
    'html[data-theme=dark] .codelab{--cl-bg:#151B23;--cl-ed:#0F141A;--cl-gut:#1A212B;--cl-gutx:#6B7685;--cl-ink:#E4E9F0;--cl-line:#2C3644;--cl-soft:#A3AEBD;' +
    '--cl-btn:#E4E9F0;--cl-btnx:#0F141A;--cl-okbg:#12301E;--cl-okx:#8FE0AA;--cl-nobg:#33270F;--cl-nox:#F3C878;--cl-errbg:#3A1616;--cl-errx:#FF9C9C;--cl-th:#1E2733;}' +
    '.codelab .cl-head{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:7px 10px;border-bottom:1px solid var(--cl-line);font-size:12px;color:var(--cl-soft);}' +
    '.codelab .cl-lang{font-weight:800;letter-spacing:.6px;text-transform:uppercase;font-size:10.5px;border:1px solid var(--cl-line);border-radius:10px;padding:1px 8px;}' +
    '.codelab .cl-badge{font-weight:800;font-size:11px;color:var(--cl-okx);background:var(--cl-okbg);border-radius:10px;padding:1px 8px;display:none;}' +
    '.codelab.cl-solved .cl-badge{display:inline-block;}' +
    '.codelab .cl-sp{flex:1;}' +
    '.codelab .cl-reset{background:none;border:0;color:var(--cl-soft);text-decoration:underline;cursor:pointer;font:inherit;font-size:12px;padding:0;}' +
    '.codelab .cl-ed{display:flex;background:var(--cl-ed);position:relative;}' +
    '.codelab .cl-gut{flex:0 0 auto;min-width:2.2em;max-width:3.6em;box-sizing:content-box;white-space:pre;overflow:hidden;padding:10px 6px 10px 8px;text-align:right;background:var(--cl-gut);color:var(--cl-gutx);user-select:none;-webkit-user-select:none;}' +
    '.codelab .cl-gut,.codelab textarea{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:13.5px;line-height:1.5;}' +
    '.codelab textarea{flex:1 1 auto;min-width:0;border:0;outline:0;resize:none;background:transparent;color:var(--cl-ink);padding:10px 10px;white-space:pre;overflow-x:auto;overflow-y:hidden;tab-size:4;-moz-tab-size:4;margin:0;box-sizing:border-box;}' +
    '.codelab textarea:focus{box-shadow:inset 0 0 0 2px #4A78C2;}' +
    '.codelab .cl-bar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:8px 10px;border-top:1px solid var(--cl-line);}' +
    '.codelab .cl-run{background:var(--cl-btn);color:var(--cl-btnx);border:0;border-radius:9px;padding:8px 16px;font:inherit;font-size:14px;font-weight:800;cursor:pointer;}' +
    '.codelab .cl-run[disabled]{opacity:.6;cursor:wait;}' +
    '.codelab .cl-keys{font-size:11.5px;color:var(--cl-soft);flex:1 1 220px;}' +
    '.codelab .cl-out{border-top:1px solid var(--cl-line);padding:10px;font-size:13px;display:none;}' +
    '.codelab .cl-out.on{display:block;}' +
    '.codelab .cl-msg{color:var(--cl-soft);font-size:12.5px;margin:0 0 6px;}' +
    '.codelab .cl-tw{overflow:auto;max-height:340px;max-width:100%;border:1px solid var(--cl-line);border-radius:8px;}' +
    '.codelab table.cl-t{border-collapse:collapse;font-size:12.5px;font-variant-numeric:tabular-nums;min-width:100%;}' +
    '.codelab table.cl-t th{position:sticky;top:0;background:var(--cl-th);text-align:left;font-weight:800;padding:5px 9px;border-bottom:1px solid var(--cl-line);white-space:nowrap;}' +
    '.codelab table.cl-t td{padding:4px 9px;border-bottom:1px solid var(--cl-line);white-space:nowrap;}' +
    '.codelab table.cl-t td.n{text-align:right;} .codelab table.cl-t td.nul{color:var(--cl-gutx);font-style:italic;}' +
    '.codelab pre.cl-pre{margin:0;white-space:pre-wrap;word-break:break-word;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12.5px;line-height:1.45;max-height:340px;overflow:auto;}' +
    '.codelab pre.cl-err{color:var(--cl-errx);background:var(--cl-errbg);border-radius:8px;padding:8px 10px;}' +
    '.codelab .cl-html{overflow:auto;max-width:100%;margin-top:8px;font-size:12.5px;}' +
    '.codelab .cl-html table{border-collapse:collapse;font-variant-numeric:tabular-nums;} .codelab .cl-html th,.codelab .cl-html td{padding:3px 8px;border-bottom:1px solid var(--cl-line);text-align:right;white-space:nowrap;}' +
    '.codelab img.cl-fig{display:block;max-width:100%;height:auto;margin-top:8px;border-radius:8px;background:#fff;}' +
    '.codelab .cl-verdict{margin-top:8px;border-radius:8px;padding:8px 11px;font-size:13.5px;line-height:1.45;}' +
    '.codelab .cl-verdict.ok{background:var(--cl-okbg);color:var(--cl-okx);} .codelab .cl-verdict.no{background:var(--cl-nobg);color:var(--cl-nox);}' +
    '.codelab .cl-load{display:flex;align-items:center;gap:8px;color:var(--cl-soft);}' +
    '.codelab .cl-spin{width:14px;height:14px;border:2px solid var(--cl-line);border-top-color:var(--cl-ink);border-radius:50%;animation:clspin .8s linear infinite;flex:0 0 auto;}' +
    '@keyframes clspin{to{transform:rotate(360deg)}} @media (prefers-reduced-motion:reduce){.codelab .cl-spin{animation:none}}';
  function injectCSS() {
    if (document.getElementById('codelab-css')) return;
    var s = document.createElement('style'); s.id = 'codelab-css'; s.textContent = CSS; document.head.appendChild(s);
  }

  /* ---------------- engines ---------------- */
  var duckP = null, pyP = null, setupDone = {}, mplAgg = false;
  function sqlEngine(status) {
    if (duckP) return duckP;
    status(T.loadSql);
    duckP = import(DUCK_ESM).then(function (duckdb) {
      var bundles = {
        mvp: { mainModule: DUCK + 'duckdb-mvp.wasm', mainWorker: DUCK + 'duckdb-browser-mvp.worker.js' },
        eh: { mainModule: DUCK + 'duckdb-eh.wasm', mainWorker: DUCK + 'duckdb-browser-eh.worker.js' }
      };
      return duckdb.selectBundle(bundles).then(function (b) {
        var url = URL.createObjectURL(new Blob(['importScripts("' + b.mainWorker + '");'], { type: 'text/javascript' }));
        var worker = new Worker(url);
        var quiet = { log: function () { } };
        var db = new duckdb.AsyncDuckDB(quiet, worker);
        return db.instantiate(b.mainModule, b.pthreadWorker).then(function () {
          URL.revokeObjectURL(url);
          return db.open({ query: { castBigIntToDouble: true, castDecimalToDouble: true } });
        }).then(function () { return db.connect(); }).then(function (conn) { return { duckdb: duckdb, db: db, conn: conn }; });
      });
    });
    duckP.catch(function () { duckP = null; });
    return duckP;
  }
  function loadScript(src) {
    return new Promise(function (ok, no) {
      var s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = function () { no(new Error('load ' + src)); };
      document.head.appendChild(s);
    });
  }
  function pyEngine(status) {
    if (pyP) return pyP;
    status(T.loadPy);
    pyP = (window.loadPyodide ? Promise.resolve() : loadScript(PYO + 'pyodide.js')).then(function () {
      return window.loadPyodide({ indexURL: PYO });
    }).then(function (py) {
      py.runPython("import os, warnings\nos.environ['MPLBACKEND']='Agg'\nwarnings.filterwarnings('ignore', message='.*non-interactive.*')\nwarnings.filterwarnings('ignore', message='.*FigureCanvasAgg.*')");
      return py;
    });
    pyP.catch(function () { pyP = null; });
    return pyP;
  }
  function textOf(spec, type) {
    if (!spec) return '';
    if (/^[A-Za-z][\w-]*$/.test(spec)) { var el = document.getElementById(spec); if (el) return el.textContent; }
    return spec;
  }

  /* ---------------- SQL ---------------- */
  function fmtCell(v, type) {
    if (v == null) return { t: 'NULL', nul: 1 };
    var ts = String(type || '');
    if (/^Date/.test(ts)) { var d = new Date(typeof v === 'number' ? v : Number(v)); if (!isNaN(d)) return { t: d.toISOString().slice(0, 10), v: d.toISOString().slice(0, 10) }; }
    if (/^Timestamp/.test(ts)) { var d2 = new Date(typeof v === 'number' ? v : Number(v)); if (!isNaN(d2)) { var s = d2.toISOString().replace('T', ' ').replace(/\.000Z$|Z$/, ''); return { t: s, v: s }; } }
    if (typeof v === 'bigint') v = Number(v);
    if (typeof v === 'number') return { t: Number.isInteger(v) ? String(v) : String(Number(v.toFixed(6))), v: v, n: 1 };
    if (typeof v === 'boolean') return { t: String(v), v: v };
    if (v && typeof v === 'object') { try { var j = v.toJSON ? v.toJSON() : v; return { t: typeof j === 'string' ? j : JSON.stringify(j, function (k, x) { return typeof x === 'bigint' ? Number(x) : x; }), v: j }; } catch (e) { return { t: String(v), v: String(v) }; } }
    return { t: String(v), v: v };
  }
  function runSQL(block, code, ui) {
    var t0 = performance.now();
    return sqlEngine(ui.status).then(function (E) {
      var setup = textOf(block.getAttribute('data-setup'));
      var p = Promise.resolve();
      if (setup && !setupDone[setup]) {
        ui.status(T.loadData);
        var files = {}, re = /'([^'\s]+\.(?:csv|parquet|json))'/gi, m;
        while ((m = re.exec(setup))) files[m[1]] = 1;
        p = Promise.all(Object.keys(files).map(function (name) {
          return fetch(new URL(name, document.baseURI).href, { cache: 'no-cache' }).then(function (r) {
            if (!r.ok) throw new Error('Could not fetch ' + name + ' (' + r.status + ')');
            return r.arrayBuffer();
          }).then(function (buf) { return E.db.registerFileBuffer(name, new Uint8Array(buf)); });
        })).then(function () { return E.conn.query(setup); }).then(function () { setupDone[setup] = 1; });
      }
      return p.then(function () { t0 = performance.now(); return E.conn.query(code); });
    }).then(function (tbl) {
      var secs = (performance.now() - t0) / 1000;
      var fields = tbl.schema.fields, cols = fields.map(function (x) { return x.name; });
      var rows = [], disp = [], n = tbl.numRows, LIM = 500;
      var arr = tbl.toArray();
      for (var i = 0; i < arr.length; i++) {
        var r = arr[i], vr = [], dr = [];
        for (var j = 0; j < fields.length; j++) { var c = fmtCell(r[fields[j].name], fields[j].type); vr.push(c.nul ? null : c.v); if (i < LIM) dr.push(c); }
        rows.push(vr); if (i < LIM) disp.push(dr);
      }
      var h = '<div class="cl-msg">' + f(T.rows, { n: n.toLocaleString() }) + (n > LIM ? f(T.shown, { n: LIM }) : '') + ' · ' + f(T.sec, { s: secs.toFixed(secs < 1 ? 3 : 2) }) + '</div>';
      if (!cols.length || (!n && /^\s*(create|insert|update|delete|drop|alter|set|pragma)/i.test(code.replace(/^\s*--.*$/gm, '')))) h = '<div class="cl-msg">' + T.noRows + ' · ' + f(T.sec, { s: secs.toFixed(3) }) + '</div>';
      else {
        h += '<div class="cl-tw"><table class="cl-t"><thead><tr>' + cols.map(function (c) { return '<th>' + esc(c) + '</th>'; }).join('') + '</tr></thead><tbody>';
        disp.forEach(function (dr) { h += '<tr>' + dr.map(function (c) { return '<td class="' + (c.n ? 'n' : '') + (c.nul ? ' nul' : '') + '">' + esc(c.t) + '</td>'; }).join('') + '</tr>'; });
        h += '</tbody></table></div>';
        if (!n) h = '<div class="cl-msg">' + T.noRows + '</div>' + h;
      }
      ui.show(h);
      return { cols: cols, rows: rows };
    });
  }
  function same(a, e, tol) {
    if (e == null || a == null) return e == null && a == null;
    if (typeof e === 'number') { var x = typeof a === 'number' ? a : parseFloat(a); return isFinite(x) && Math.abs(x - e) <= tol; }
    if (typeof e === 'boolean') return a === e || String(a) === String(e) || (e ? a === 1 : a === 0);
    return String(a).trim().toLowerCase() === String(e).trim().toLowerCase();
  }
  function rowSame(a, e, tol) { if (a.length !== e.length) return false; for (var i = 0; i < e.length; i++) if (!same(a[i], e[i], tol)) return false; return true; }
  function checkRows(res, spec) {
    var exp = spec.rows, tol = spec.tol == null ? 1e-6 : spec.tol, got = res.rows;
    if (exp.length && got.length && got[0].length !== exp[0].length) return f(T.ncols, { a: got[0].length, e: exp[0].length });
    if (got.length !== exp.length) return f(T.nrows, { a: got.length, e: exp.length });
    if (spec.ordered) {
      for (var i = 0; i < exp.length; i++) if (!rowSame(got[i], exp[i], tol)) {
        // the right rows in the wrong order?
        if (checkRows(res, { rows: exp, tol: tol }) === true) return T.order;
        for (var j = 0; j < exp[i].length; j++) if (!same(got[i][j], exp[i][j], tol)) return f(T.cell, { r: i + 1, c: esc(res.cols[j]), a: esc(got[i][j]) });
      }
      return true;
    }
    var used = [];
    for (var k = 0; k < exp.length; k++) {
      var hit = -1;
      for (var m = 0; m < got.length; m++) if (!used[m] && rowSame(got[m], exp[k], tol)) { hit = m; break; }
      if (hit < 0) return f(T.rowMiss, { r: esc(exp[k].join(' · ')) });
      used[hit] = 1;
    }
    return true;
  }

  /* ---------------- Python ---------------- */
  var COLLECT = [
    'def __codelab_figs():',
    '    import sys',
    '    if "matplotlib.pyplot" not in sys.modules: return []',
    '    import io, base64, warnings',
    '    import matplotlib.pyplot as plt',
    '    out = []',
    '    for n in plt.get_fignums():',
    '        b = io.BytesIO()',
    '        with warnings.catch_warnings():',
    '            warnings.simplefilter("ignore")',
    '            plt.figure(n).savefig(b, format="png", dpi=110, bbox_inches="tight")',
    '        out.append(base64.b64encode(b.getvalue()).decode())',
    '    plt.close("all")',
    '    return out',
    '__codelab_figs()'].join('\n');
  function cleanTrace(msg) {
    var s = String(msg || '');
    var i = s.indexOf('File "<exec>"');
    if (i >= 0) s = 'Traceback (most recent call last):\n  ' + s.slice(i);
    return s.replace(/\n\s*$/, '');
  }
  var shared = {};
  function runPython(block, code, ui) {
    var out = [], err = [];
    return pyEngine(ui.status).then(function (py) {
      var setup = textOf(block.getAttribute('data-setup'));
      var spec = parseCheck(block);
      var all = setup + '\n' + code + '\n' + (spec && spec.py ? textOf(spec.py) : '');
      var mods = [];
      /* a shared namespace (data-ns): the earlier blocks of the same name run first, once per visit */
      var nsName = block.getAttribute('data-ns') || '';
      var sh = nsName ? (shared[nsName] || (shared[nsName] = { ns: null, ran: {}, setup: false })) : null;
      var prior = [];
      if (sh) {
        for (var bi = 0; bi < blocks.length && blocks[bi] !== block; bi++) {
          if (blocks[bi].getAttribute('data-ns') === nsName && !sh.ran[blocks[bi].id]) prior.push(blocks[bi]);
        }
        prior.forEach(function (b) { all += '\n' + b.__ta.value; });
        /* the setup of a shared namespace may sit on any of its blocks (usually the first) */
        if (!sh.setup) blocks.forEach(function (b) {
          if (b === block || b.getAttribute('data-ns') !== nsName) return;
          var st = textOf(b.getAttribute('data-setup'));
          if (st && setup.indexOf(st) < 0) setup = st + '\n' + setup;
        });
        all = setup + '\n' + all;
      }
      var PK = /^\s*(?:import|from)\s+(numpy|pandas|matplotlib|sklearn|scipy|joblib)/gm;
      all.replace(PK, function (_, m) { if (mods.indexOf(m) < 0) mods.push(m); });
      var pre = mods.length ? (ui.status(f(T.loadPk, { p: mods.join(', ') })), py.loadPackagesFromImports(all)) : Promise.resolve();
      return pre.then(function () {
        if (mods.indexOf('matplotlib') >= 0 && !mplAgg) { py.runPython("import matplotlib\nmatplotlib.use('Agg')"); mplAgg = true; }
        py.setStdout({ batched: function (s) { out.push(s); } });
        py.setStderr({ batched: function (s) { err.push(s); } });
        var ns;
        if (sh) { if (!sh.ns) { sh.ns = py.globals.get('dict')(); sh.ns.set('__name__', '__main__'); } ns = sh.ns; }
        else { ns = py.globals.get('dict')(); ns.set('__name__', '__main__'); }
        var t0 = performance.now(), ret, failed = null, priorFail = null;
        var p = Promise.resolve();
        if (setup && !(sh && sh.setup)) p = p.then(function () { return py.runPythonAsync(setup, { globals: ns }); }).then(function () { if (sh) sh.setup = true; });
        if (prior.length) {
          p = p.then(function () { ui.status(T.prior); });
          prior.forEach(function (b) {
            p = p.then(function () {
              if (priorFail) return;
              return py.runPythonAsync(b.__ta.value, { globals: ns }).then(function (r) { if (r && r.destroy) r.destroy(); sh.ran[b.id] = true; },
                function (e) { priorFail = { block: b, e: e }; });
            });
          });
          p = p.then(function () { out.length = 0; err.length = 0; });
        }
        p = p.then(function () {
          if (priorFail) { failed = new Error(f(T.priorErr, { n: priorFail.block.getAttribute('data-step') || priorFail.block.id }) + '\n' + cleanTrace(priorFail.e.message).split('\n').pop()); return; }
          t0 = performance.now(); ui.status(T.running);
          return py.runPythonAsync(code, { globals: ns }).then(function (r) { ret = r; if (sh) sh.ran[block.id] = true; }, function (e) { failed = e; });
        });
        return p.then(function () {
          var secs = (performance.now() - t0) / 1000, h = '', last = '';
          if (!failed && ret !== undefined && ret !== null) {
            try {
              if (ret && typeof ret === 'object' && ret.toJs) {
                ns.set('__codelab_last', ret);
                last = py.runPython('__codelab_last._repr_html_() if hasattr(__codelab_last, "_repr_html_") and not isinstance(__codelab_last, type) else "\\u0000" + repr(__codelab_last)', { globals: ns });
                if (ret.destroy) ret.destroy();
              } else last = '\u0000' + String(ret);
            } catch (e) { last = ''; }
          }
          var res = { stdout: out.join('\n'), ns: ns, error: failed };
          var figs = [];
          var verdict = null;
          if (!failed) { verdict = judge(block, res); }
          try { var pf = py.runPython(COLLECT, { globals: ns }); figs = pf.toJs ? pf.toJs() : pf; if (pf.destroy) pf.destroy(); } catch (e) { }
          var txt = out.join('\n');
          if (txt) h += '<pre class="cl-pre">' + esc(txt) + '</pre>';
          if (last) h += last.charAt(0) === '\u0000' ? '<pre class="cl-pre">' + esc(last.slice(1)) + '</pre>' : '<div class="cl-html">' + last + '</div>';
          (figs || []).forEach(function (b, i) { h += '<img class="cl-fig" alt="' + T.figure + ' ' + (i + 1) + '" src="data:image/png;base64,' + b + '">'; });
          if (err.length) h += '<pre class="cl-pre cl-err">' + esc(err.join('\n')) + '</pre>';
          if (failed) h += '<pre class="cl-pre cl-err">' + esc(cleanTrace(failed.message)) + '</pre>';
          if (!h) h = '<div class="cl-msg">' + T.noOut + '</div>';
          h = '<div class="cl-msg">' + f(T.sec, { s: secs.toFixed(secs < 1 ? 3 : 2) }) + '</div>' + h;
          ui.show(h);
          if (!sh) ns.destroy && ns.destroy();
          if (failed) return { failed: true };
          return { verdict: verdict };
        });
      });
    });
  }
  /* ---------------- checks ---------------- */
  function parseCheck(block) {
    var c = block.getAttribute('data-check');
    if (!c) return null;
    try { return JSON.parse(c); } catch (e) { return { fn: c }; }
  }
  var PYREF = null;
  function judge(block, res) {
    var spec = parseCheck(block);
    if (!spec) return null;
    var r = true;
    try {
      if (spec.fn) { var fn = window[spec.fn]; r = fn ? fn(res, block) : false; }
      if (r === true && spec.rows) r = checkRows(res, spec);
      if (r === true && spec.vars && res.ns) r = checkVars(res.ns, spec.vars);
      if (r === true && spec.py && res.ns) {
        var v = PYREF.runPython(textOf(spec.py), { globals: res.ns });
        if (v && v.toJs) { var vv = String(v); v.destroy && v.destroy(); v = vv; }
        r = v === true ? true : (typeof v === 'string' && v ? v : false);
      }
    } catch (e) { r = String(e && e.message ? cleanTrace(e.message).split('\n').pop() : e); }
    if (r && typeof r === 'object') return r;
    return r === true ? { ok: true } : { ok: false, msg: typeof r === 'string' ? r : '' };
  }
  function checkVars(ns, vars) {
    for (var k in vars) {
      if (!ns.has(k)) return f(T.noVar, { v: '<code>' + esc(k) + '</code>' });
      var e = vars[k], tol = 1e-6, want = e;
      // [value, tol] or [[v1, v2, …], tol]; a plain list is compared exactly
      if (Array.isArray(e) && e.length === 2 && (typeof e[0] === 'number' || Array.isArray(e[0])) && typeof e[1] === 'number') { want = e[0]; tol = e[1]; }
      var a = ns.get(k);
      var aj = a && a.toJs ? a.toJs({ create_proxies: false }) : a;
      if (a && a.destroy) a.destroy();
      var ok;
      if (typeof want === 'number') ok = typeof aj === 'number' && Math.abs(aj - want) <= tol;
      else if (Array.isArray(want)) ok = aj && aj.length === want.length && want.every(function (w, i) { return typeof w === 'number' ? Math.abs(Number(aj[i]) - w) <= tol : String(aj[i]) === String(w); });
      else ok = String(aj).trim().toLowerCase() === String(want).trim().toLowerCase();
      if (!ok) {
        var shown = typeof aj === 'number' ? String(Number(aj.toFixed(6))) : (Array.isArray(aj) || (aj && aj.length != null && typeof aj !== 'string') ? '[' + Array.prototype.map.call(aj, function (x) { return typeof x === 'number' ? Number(x.toFixed(4)) : x; }).join(', ') + ']' : String(aj));
        return f(T.badVar, { v: '<code>' + esc(k) + '</code>', a: esc(shown.length > 80 ? shown.slice(0, 80) + '…' : shown) });
      }
    }
    return true;
  }

  /* ---------------- the editor ---------------- */
  var PATH = location.pathname.replace(/index\.html$/, '');
  var blocks = [];
  function keyOf(b) { return 'codelab:' + PATH + ':' + b.id; }
  function okKey(b) { return 'codelab_ok:' + PATH + ':' + b.id; }

  function mount(block, idx) {
    if (block.__codelab) return;
    block.__codelab = true;
    if (!block.id) block.id = 'codelab-' + (idx + 1);
    var lang = (block.getAttribute('data-lang') || 'sql').toLowerCase() === 'python' ? 'python' : 'sql';
    var indent = lang === 'python' ? '    ' : '  ';
    var initial = block.textContent.replace(/^\n+/, '').replace(/\s+$/, '');
    var saved = lsGet(keyOf(block));
    block.textContent = '';
    block.innerHTML =
      '<div class="cl-head"><span class="cl-lang">' + (lang === 'sql' ? 'SQL' : 'Python') + '</span><span class="cl-badge">✓ ' + T.solved + '</span><span class="cl-sp"></span>' +
      '<button type="button" class="cl-reset">' + T.reset + '</button></div>' +
      '<div class="cl-ed"><div class="cl-gut" aria-hidden="true"></div><textarea spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" aria-label="' + (lang === 'sql' ? 'SQL' : 'Python') + ' code"></textarea></div>' +
      '<div class="cl-bar"><button type="button" class="cl-run">▶ ' + T.run + '</button><span class="cl-keys">' + T.keys + '</span></div>' +
      '<div class="cl-out" aria-live="polite"></div>';
    var ta = block.querySelector('textarea'), gut = block.querySelector('.cl-gut'), run = block.querySelector('.cl-run'),
      out = block.querySelector('.cl-out'), reset = block.querySelector('.cl-reset');
    ta.value = saved != null ? saved : initial;
    if (lsGet(okKey(block))) block.classList.add('cl-solved');
    function paint() {
      var n = ta.value.split('\n').length, s = '';
      for (var i = 1; i <= n; i++) s += i + '\n';
      gut.textContent = s;
      ta.style.height = 'auto';
      ta.style.height = (ta.scrollHeight + 2) + 'px';
    }
    var saveT = null;
    ta.addEventListener('input', function () {
      paint();
      clearTimeout(saveT);
      saveT = setTimeout(function () { lsSet(keyOf(block), ta.value === initial ? null : ta.value); }, 400);
    });
    function insert(text) {
      ta.focus();
      if (!document.execCommand || !document.execCommand('insertText', false, text)) {
        ta.setRangeText(text, ta.selectionStart, ta.selectionEnd, 'end');
        ta.dispatchEvent(new Event('input'));
      }
    }
    ta.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); go(); return; }
      if (e.key === 'Escape') { ta.blur(); return; }
      if (e.key === 'Tab' && !e.altKey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        var v = ta.value, s = ta.selectionStart, en = ta.selectionEnd;
        var ls = v.lastIndexOf('\n', s - 1) + 1;
        if (s === en && !e.shiftKey) { insert(indent); return; }
        // indent or dedent every selected line
        var le = v.indexOf('\n', en - (en > s && v[en - 1] === '\n' ? 1 : 0)); if (le < 0) le = v.length;
        var seg = v.slice(ls, le), lines = seg.split('\n');
        var ns = lines.map(function (l) {
          if (!e.shiftKey) return indent + l;
          var m = l.match(/^( +|\t)/); if (!m) return l;
          return l.slice(Math.min(m[0] === '\t' ? 1 : m[0].length, indent.length));
        }).join('\n');
        ta.setSelectionRange(ls, le);
        insert(ns);
        ta.setSelectionRange(ls, ls + ns.length);
        return;
      }
      if (e.key === 'Enter' && !e.shiftKey) {
        var v2 = ta.value, p = ta.selectionStart, l0 = v2.lastIndexOf('\n', p - 1) + 1, line = v2.slice(l0, p);
        var lead = (line.match(/^[ \t]*/) || [''])[0];
        if (lang === 'python' && /:\s*(#.*)?$/.test(line)) lead += indent;
        if (lead) { e.preventDefault(); insert('\n' + lead); }
      }
    });
    reset.addEventListener('click', function () {
      if (ta.value !== initial && !confirm(T.resetQ)) return;
      ta.value = initial; lsSet(keyOf(block), null); paint();
      out.classList.remove('on'); out.innerHTML = '';
    });
    var ui = {
      status: function (msg) { out.classList.add('on'); out.innerHTML = '<div class="cl-load"><span class="cl-spin"></span><span>' + esc(msg) + '</span></div>'; },
      show: function (h) { out.classList.add('on'); out.innerHTML = h; }
    };
    function verdict(v) {
      if (!v) return;
      var d = document.createElement('div');
      var hint = block.getAttribute('data-hint') || '';
      if (v.ok) {
        d.className = 'cl-verdict ok';
        d.innerHTML = '<b>' + T.ok + '</b> ' + (v.msg || block.getAttribute('data-ok') || '');
        block.classList.add('cl-solved'); lsSet(okKey(block), '1');
      } else {
        d.className = 'cl-verdict no';
        d.innerHTML = '<b>' + T.notYet + '</b> ' + (v.msg ? v.msg + ' ' : '') + hint;
      }
      out.appendChild(d);
      try { document.dispatchEvent(new CustomEvent('codelab:solved', { detail: { id: block.id, ok: !!v.ok } })); } catch (e) { }
    }
    var busy = false;
    function go() {
      if (busy) return;
      busy = true; run.disabled = true; run.textContent = T.running;
      var code = ta.value;
      var p = lang === 'sql'
        ? runSQL(block, code, ui).then(function (res) { verdict(judge(block, res)); })
        : runPython(block, code, ui).then(function (r) { if (r && r.verdict) verdict(r.verdict); });
      p = p.catch(function (e) {
        var m = String(e && e.message || e);
        if (/load|fetch|import|NetworkError|Failed to fetch/i.test(m) && !/Could not fetch/.test(m) && (lang === 'sql' ? !duckP : !pyP)) m = T.offline + '\n\n' + m;
        var seen = {}; m = m.split(/\n\s*\n/).filter(function (x) { var k = x.trim(); if (seen[k]) return false; seen[k] = 1; return true; }).join('\n\n');
        ui.show('<pre class="cl-pre cl-err">' + esc(T.err + ': ' + m.replace(/^Error:\s*/, '')) + '</pre>');
      }).then(function () { busy = false; run.disabled = false; run.textContent = '▶ ' + T.run; block.__lastRun = Date.now(); });
      return p;
    }
    run.addEventListener('click', go);
    block.__run = go;
    block.__ta = ta;
    paint();
    /* a block mounted inside a hidden screen measures 0 px: size it again when it comes into view */
    if (window.IntersectionObserver) new IntersectionObserver(function (en) { if (en[0] && en[0].isIntersecting) paint(); }).observe(block);
    blocks.push(block);
  }
  function mountAll(root) {
    injectCSS();
    var list = (root || document).querySelectorAll('.codelab');
    for (var i = 0; i < list.length; i++) mount(list[i], i);
  }

  // keep a reference for the Python checks
  var _pyEngine = pyEngine;
  pyEngine = function (s) { var p = _pyEngine(s); return p.then(function (py) { PYREF = py; return py; }); };

  window.CodeLab = {
    versions: { duckdb: DUCK_VER, pyodide: PYO_VER },
    mount: function (el) { injectCSS(); mount(el, blocks.length); },
    mountAll: mountAll,
    solved: function () { return blocks.filter(function (b) { return !!lsGet(okKey(b)); }).map(function (b) { return b.id; }); },
    blocks: function () { return blocks.slice(); },
    /* read one variable of a shared namespace (data-ns) as a JS value; undefined when absent */
    get: function (nsName, name) {
      var sh = shared[nsName]; if (!sh || !sh.ns || !sh.ns.has(name)) return undefined;
      var v = sh.ns.get(name), j = v && v.toJs ? v.toJs({ create_proxies: false, dict_converter: Object.fromEntries }) : v;
      if (v && v.destroy) v.destroy(); return j;
    },
    /* the current text of a block's editor */
    code: function (id) { var b = document.getElementById(id); return b && b.__ta ? b.__ta.value : ''; },
    /* for tests: put code in a block and run it; resolves when done */
    run: function (id, code) { var b = document.getElementById(id); if (code != null) { b.__ta.value = code; b.__ta.dispatchEvent(new Event('input')); } return b.__run(); },
    /* a direct query, for a page's own widgets */
    sql: function (q) { return sqlEngine(function () { }).then(function (E) { return E.conn.query(q); }); },
    /* Python's file system (27 Nov 2026, for mia506 journée 2): read a file the student's code wrote
       (a saved model, a registry) as a Uint8Array, or write bytes the page received (an uploaded CSV)
       so that open()/pd.read_csv() find it. Both resolve once the Python engine is loaded. */
    readFile: function (name) { return pyEngine(function () { }).then(function (py) { return py.FS.readFile(name); }); },
    writeFile: function (name, bytes) { return pyEngine(function () { }).then(function (py) { py.FS.writeFile(name, bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)); return name; }); }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { mountAll(); });
  else mountAll();
})();
