/* ============================================================================
   course-engine.js  —  shared interactive layer for the Oxford-model study paths
   ----------------------------------------------------------------------------
   Dependency-free, offline-safe, zero build step. Enhances a page progressively:
   the existing quiz / progress / Firebase code keeps working with or without it.

   Add ONE line near the end of a path page:  <script src="course-engine.js"></script>
   …then, at the very end of the page's own inline script (after QUIZ is defined):

       CourseEngine.init({
         pageKey : 'matin',          // localStorage namespace (matin / aprem / …)
         quiz    : QUIZ,             // {key:[{q,o:[],a,e}]}  — optional, feeds flashcards
         glossary: GLOSSARY,        // {term:"definition"}    — optional, terms + flashcards
         scope   : '.mod-inner'     // where glossary terms get auto-linked (default)
       });

   Three features, all driven by data you already have on the page:
     1. Glossary  — auto-links key terms in the prose, hover/tap shows the definition.
     2. Flashcards — a spaced-repetition revision deck built from the quiz + glossary.
     3. Videos    — turns any <a class="reslink video" data-yt="ID"> into an inline,
                    click-to-load player (nothing loads until the student clicks).
   ============================================================================ */
(function (w, d) {
  "use strict";

  /* ---------- tiny helpers ---------- */
  function el(tag, cls, html) { var e = d.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function slug(s) { return (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48); }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function esc(s) { return (s || "").replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  var DAY = 864e5;

  /* ---------- one-time CSS injection (uses the page's own theme vars) ---------- */
  function injectCSS() {
    if (d.getElementById("ce-css")) return;
    var s = el("style"); s.id = "ce-css";
    s.textContent = [
      /* glossary term + tooltip */
      ".ce-term{border-bottom:1.5px dotted var(--amber,#F4A03F);cursor:help;color:inherit;font-weight:inherit;font-style:inherit}",
      ".ce-term:hover,.ce-term:focus{color:var(--amber-b,#FFC061);outline:none}",
      ".ce-pop{position:fixed;z-index:9000;max-width:280px;background:#0b1230;border:1px solid var(--amber,#F4A03F);border-radius:11px;padding:11px 13px;font-size:13px;line-height:1.5;color:#e8eefc;box-shadow:0 16px 40px -12px rgba(0,0,0,.8);opacity:0;transform:translateY(4px);transition:.14s;pointer-events:none}",
      ".ce-pop.on{opacity:1;transform:none}",
      ".ce-pop .t{display:block;font-weight:800;color:var(--amber-b,#FFC061);font-size:12px;letter-spacing:.4px;text-transform:uppercase;margin-bottom:3px}",
      /* inline video — facade card (real thumbnail + play, expands to player in place) */
      ".ce-video{grid-column:1/-1;max-width:560px;width:100%;position:relative;aspect-ratio:16/9;border-radius:15px;overflow:hidden;background:#0a0e22;border:1px solid rgba(239,106,106,.4);cursor:pointer;box-shadow:0 16px 40px -18px rgba(0,0,0,.8);transition:transform .22s,border-color .22s,box-shadow .22s}",
      ".ce-video:hover{transform:translateY(-3px);border-color:#ff6a6a;box-shadow:0 26px 60px -20px rgba(0,0,0,.85)}",
      ".ce-video img.thumb{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .45s;display:block}",
      ".ce-video:hover img.thumb{transform:scale(1.06)}",
      ".ce-video .veil{position:absolute;inset:0;background:linear-gradient(180deg,rgba(8,10,30,.08) 38%,rgba(8,10,30,.55) 72%,rgba(8,10,30,.9))}",
      ".ce-video .play{position:absolute;top:43%;left:50%;transform:translate(-50%,-50%);width:66px;height:46px;border-radius:13px;background:rgba(237,42,42,.92);display:grid;place-items:center;transition:.2s;box-shadow:0 8px 24px rgba(0,0,0,.55)}",
      ".ce-video:hover .play{background:#ff0000;transform:translate(-50%,-50%) scale(1.1)}",
      ".ce-video .play::after{content:'';border-left:19px solid #fff;border-top:12px solid transparent;border-bottom:12px solid transparent;margin-left:4px}",
      ".ce-video .vyt{position:absolute;top:11px;left:12px;font-size:10px;font-weight:800;letter-spacing:1px;color:#fff;background:rgba(237,42,42,.92);border-radius:5px;padding:3px 8px}",
      ".ce-video .vmeta{position:absolute;left:0;right:0;bottom:0;padding:13px 15px}",
      ".ce-video .vt{color:#fff;font-weight:700;font-size:15px;line-height:1.28;text-shadow:0 1px 8px rgba(0,0,0,.8)}",
      ".ce-video .vc{display:inline-block;margin-top:7px;font-size:11px;color:#ffe1e1;background:rgba(0,0,0,.5);border:1px solid rgba(255,255,255,.2);border-radius:99px;padding:3px 10px}.ce-video .vc b{color:#ff9a9a}",
      ".ce-video.playing{cursor:default;transform:none}.ce-video iframe{position:absolute;inset:0;width:100%;height:100%;border:0}",
      /* flashcard launcher + overlay */
      ".ce-fab{position:fixed;right:18px;bottom:18px;z-index:8000;display:flex;align-items:center;gap:9px;background:linear-gradient(135deg,var(--purple,#9a7cf0),#6d4fd0);color:#fff;border:0;border-radius:99px;padding:13px 19px;font:inherit;font-weight:800;font-size:14.5px;cursor:pointer;box-shadow:0 12px 30px -8px rgba(154,124,240,.7);transition:.18s}",
      ".ce-fab:hover{transform:translateY(-2px)}",
      ".ce-fab .n{background:rgba(255,255,255,.22);border-radius:99px;padding:1px 9px;font-size:13px;min-width:22px;text-align:center}",
      ".ce-modal{position:fixed;inset:0;z-index:8500;background:rgba(6,9,24,.74);backdrop-filter:blur(7px);display:none;align-items:center;justify-content:center;padding:18px}",
      ".ce-modal.on{display:flex}",
      ".ce-deck{width:100%;max-width:540px;background:linear-gradient(160deg,#1b2658,#10193f);border:1px solid var(--purple,#9a7cf0);border-radius:22px;padding:22px;box-shadow:0 30px 80px -20px #000}",
      ".ce-dh{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}",
      ".ce-dh .ttl{font-family:Georgia,serif;font-style:italic;font-size:20px;color:#fff}",
      ".ce-dh .x{background:none;border:0;color:#9fabd0;font-size:24px;cursor:pointer;line-height:1}",
      ".ce-meta{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;font-size:11.5px;color:#9fabd0}",
      ".ce-meta .tag{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:99px;padding:3px 10px}",
      ".ce-card{min-height:188px;background:rgba(8,12,32,.55);border:1px solid rgba(255,255,255,.12);border-radius:16px;padding:22px;display:flex;flex-direction:column;justify-content:center;cursor:pointer;transition:.15s}",
      ".ce-card:hover{border-color:var(--purple,#9a7cf0)}",
      ".ce-card .side{font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:var(--purple,#9a7cf0);font-weight:800;margin-bottom:9px}",
      ".ce-card .front{font-size:18px;color:#fff;font-weight:700;line-height:1.4}",
      ".ce-card .back{font-size:15px;color:#dde4f7;line-height:1.55}.ce-card .back b{color:var(--amber-b,#FFC061)}",
      ".ce-card .hint{margin-top:14px;font-size:12px;color:#7e8ab0}",
      ".ce-acts{display:flex;gap:10px;margin-top:14px}",
      ".ce-acts button{flex:1;border:0;border-radius:12px;padding:13px;font:inherit;font-weight:800;font-size:14.5px;cursor:pointer;transition:.15s}",
      ".ce-acts button:hover{transform:translateY(-2px)}",
      ".ce-flip{background:linear-gradient(135deg,var(--amber,#F4A03F),#d8852a);color:#231405}",
      ".ce-again{background:rgba(239,106,106,.18);color:#ffc9c9;border:1px solid rgba(239,106,106,.5)!important}",
      ".ce-got{background:rgba(78,214,160,.18);color:#aef3d4;border:1px solid rgba(78,214,160,.5)!important}",
      ".ce-done{text-align:center;padding:26px 8px;color:#dde4f7}.ce-done .big{font-size:46px}.ce-done h3{font-family:Georgia,serif;font-style:italic;color:#fff;font-size:22px;margin:8px 0}",
      ".ce-done .ghost{margin-top:14px;background:none;border:1px solid var(--line,rgba(244,160,63,.3));color:#cdd7f3;border-radius:99px;padding:9px 16px;font:inherit;font-size:13px;cursor:pointer}",
      ".ce-bar{height:6px;background:rgba(255,255,255,.08);border-radius:99px;margin-top:14px;overflow:hidden}.ce-bar i{display:block;height:100%;background:linear-gradient(90deg,var(--purple,#9a7cf0),var(--amber,#F4A03F));border-radius:99px;transition:width .3s}"
    ].join("\n");
    d.head.appendChild(s);
  }

  /* ======================================================================
     1) GLOSSARY  — auto-link the first occurrence of each term in the prose
     ====================================================================== */
  var GL = {}, pop = null;
  function buildPop() {
    if (pop) return; pop = el("div", "ce-pop"); d.body.appendChild(pop);
    var hideTimer = null;
    function show(t) {
      var def = GL[t.dataset.term]; if (!def) return;
      pop.innerHTML = '<span class="t">' + esc(t.textContent) + "</span>" + def;
      var r = t.getBoundingClientRect();
      pop.style.left = Math.min(Math.max(8, r.left), w.innerWidth - 296) + "px";
      pop.style.top = (r.bottom + 8) + "px"; pop.classList.add("on");
      // flip above if it would overflow the viewport bottom
      var pr = pop.getBoundingClientRect();
      if (pr.bottom > w.innerHeight - 6) pop.style.top = (r.top - pr.height - 8) + "px";
    }
    function hide() { pop.classList.remove("on"); }
    d.addEventListener("mouseover", function (e) { var t = e.target.closest(".ce-term"); if (t) { clearTimeout(hideTimer); show(t); } });
    d.addEventListener("mouseout", function (e) { if (e.target.closest(".ce-term")) hideTimer = setTimeout(hide, 120); });
    d.addEventListener("click", function (e) { var t = e.target.closest(".ce-term"); if (t) { e.preventDefault(); show(t); } else hide(); });
    d.addEventListener("focusin", function (e) { var t = e.target.closest(".ce-term"); if (t) show(t); });
    w.addEventListener("scroll", hide, { passive: true });
  }
  function linkTerms(scope, glossary) {
    GL = glossary || {};
    var terms = Object.keys(GL).sort(function (a, b) { return b.length - a.length; });
    if (!terms.length) return;
    var used = {};
    // word-boundary aware of accents; acronyms & multiword both supported
    var rxFor = function (t) { return new RegExp("(^|[^0-9A-Za-z\\u00C0-\\u017F])(" + t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")(?![0-9A-Za-z\\u00C0-\\u017F])", "i"); };
    d.querySelectorAll(scope).forEach(function (root) {
      var walker = d.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode: function (n) {
          if (!n.nodeValue || !n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
          if (n.parentElement.closest("a,button,.ce-term,.quiz,.widget,script,style,h3,h4,h5")) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      });
      var nodes = [], n; while ((n = walker.nextNode())) nodes.push(n);
      nodes.forEach(function (node) {
        for (var i = 0; i < terms.length; i++) {
          var t = terms[i]; if (used[t]) continue;
          var m = rxFor(t).exec(node.nodeValue); if (!m) continue;
          var start = m.index + m[1].length;
          var after = node.splitText(start);
          after.nodeValue = after.nodeValue.slice(t.length);
          var span = el("dfn", "ce-term", esc(m[2])); span.dataset.term = t; span.tabIndex = 0;
          node.parentNode.insertBefore(span, after);
          used[t] = 1; break; // one wrap per text node keeps the prose calm
        }
      });
    });
    buildPop();
  }

  /* ======================================================================
     2) FLASHCARDS  — spaced repetition (Leitner) from quiz + glossary
     ====================================================================== */
  var BOX_DELAY = [0, 0, 1, 3, 7, 16]; // box 1..5 → days until next due
  function FC(pageKey, quiz, glossary) {
    var KEY = "ce-fc-" + pageKey;
    var cards = [];
    if (quiz) Object.keys(quiz).forEach(function (k) {
      quiz[k].forEach(function (it, i) {
        cards.push({ id: "q-" + k + "-" + i, tag: "quiz", front: it.q, back: "<b>" + esc(it.o[it.a]) + "</b><br>" + it.e });
      });
    });
    if (glossary) Object.keys(glossary).forEach(function (t) {
      cards.push({ id: "g-" + slug(t), tag: "terme", front: t, back: glossary[t] });
    });
    if (!cards.length) return;

    function state() { try { return JSON.parse(lsGet(KEY)) || {}; } catch (e) { return {}; } }
    function save(s) { lsSet(KEY, JSON.stringify(s)); }
    function isDue(c, s) { var r = s[c.id]; return !r || (r.due || 0) <= Date.now(); }
    function dueCards() { var s = state(); return cards.filter(function (c) { return isDue(c, s); }); }
    function grade(id, good) {
      var s = state(), r = s[id] || { box: 1 };
      r.box = good ? Math.min(5, (r.box || 1) + 1) : 1;
      r.due = Date.now() + BOX_DELAY[r.box] * DAY; s[id] = r; save(s);
    }

    /* launcher */
    var fab = el("button", "ce-fab", '🎴 Révision <span class="n"></span>');
    var nEl = fab.querySelector(".n");
    d.body.appendChild(fab);
    function refreshFab() { var n = dueCards().length; nEl.textContent = n; fab.style.opacity = n ? 1 : .55; }

    /* deck modal */
    var modal = el("div", "ce-modal");
    modal.innerHTML =
      '<div class="ce-deck"><div class="ce-dh"><span class="ttl">Révision</span><button class="x" aria-label="Fermer">×</button></div>' +
      '<div class="ce-body"></div><div class="ce-bar"><i></i></div></div>';
    d.body.appendChild(modal);
    var body = modal.querySelector(".ce-body"), bar = modal.querySelector(".ce-bar i");
    var queue = [], idx = 0, flipped = false, reviewAll = false;

    function open(all) {
      reviewAll = !!all;
      queue = (all ? cards.slice() : dueCards());
      // light shuffle so order varies between sessions
      for (var i = queue.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var tmp = queue[i]; queue[i] = queue[j]; queue[j] = tmp; }
      idx = 0; flipped = false; modal.classList.add("on"); render();
    }
    function close() { modal.classList.remove("on"); refreshFab(); }
    function render() {
      bar.style.width = queue.length ? Math.round(idx / queue.length * 100) + "%" : "100%";
      if (idx >= queue.length) {
        body.innerHTML = '<div class="ce-done"><div class="big">🎉</div><h3>' +
          (queue.length ? "Tour terminé&nbsp;!" : "Rien à réviser pour l’instant") + "</h3>" +
          "<p>" + (queue.length ? "Les cartes ratées reviendront plus vite — reviens demain pour la suite." : "Reviens demain, ou révise tout le paquet maintenant.") + "</p>" +
          '<button class="ghost" data-act="all">Réviser tout le paquet (' + cards.length + ")</button></div>";
        return;
      }
      var c = queue[idx];
      body.innerHTML =
        '<div class="ce-meta"><span class="tag">' + esc(c.tag) + '</span><span class="tag">' + (idx + 1) + " / " + queue.length + "</span></div>" +
        '<div class="ce-card" data-act="flip"><span class="side">' + (flipped ? "Réponse" : "Question") + "</span>" +
        (flipped ? '<div class="back">' + c.back + "</div>" : '<div class="front">' + esc(c.front) + '</div><div class="hint">Touche / clic ou Espace pour retourner</div>') + "</div>" +
        (flipped
          ? '<div class="ce-acts"><button class="ce-again" data-act="again">↺ À revoir</button><button class="ce-got" data-act="got">✓ Acquis</button></div>'
          : '<div class="ce-acts"><button class="ce-flip" data-act="flip">Retourner la carte</button></div>');
    }
    function act(a) {
      if (a === "flip") { flipped = !flipped; render(); }
      else if (a === "again" || a === "got") { grade(queue[idx].id, a === "got"); idx++; flipped = false; render(); }
      else if (a === "all") { open(true); }
    }
    fab.addEventListener("click", function () { open(false); });
    modal.addEventListener("click", function (e) {
      if (e.target === modal || e.target.closest(".x")) return close();
      var t = e.target.closest("[data-act]"); if (t) act(t.dataset.act);
    });
    d.addEventListener("keydown", function (e) {
      if (!modal.classList.contains("on")) return;
      if (e.key === "Escape") close();
      else if (e.key === " " || e.key === "Enter") { e.preventDefault(); if (!flipped) act("flip"); }
      else if (flipped && (e.key === "1")) act("again");
      else if (flipped && (e.key === "2")) act("got");
    });
    refreshFab();
  }

  /* ======================================================================
     3) VIDEOS  — click-to-load inline players for <a.reslink.video[data-yt]>
     ====================================================================== */
  function videos() {
    d.querySelectorAll("a.reslink.video[data-yt]").forEach(function (a) {
      var id = a.dataset.yt;
      var rt = a.querySelector(".rt");
      var title = (a.dataset.title || (rt ? rt.textContent : "vidéo")).replace(/^▶\s*/, "").trim();
      var channel = a.dataset.channel || "";
      var start = a.dataset.start ? "&start=" + a.dataset.start : "";
      var card = el("div", "ce-video");
      card.innerHTML =
        '<img class="thumb" loading="lazy" alt="' + esc(title) + '" ' +
          'src="https://i.ytimg.com/vi/' + id + '/hqdefault.jpg" ' +
          "onerror=\"this.onerror=null;this.src='https://i.ytimg.com/vi/" + id + "/mqdefault.jpg'\">" +
        '<span class="veil"></span><span class="vyt">▶ VIDÉO</span><span class="play"></span>' +
        '<span class="vmeta"><span class="vt">' + esc(title) + "</span>" +
        (channel ? '<br><span class="vc">YouTube · <b>' + esc(channel) + "</b></span>" : "") + "</span>";
      a.parentNode.replaceChild(card, a);
      card.addEventListener("click", function () {
        if (card.classList.contains("playing")) return;
        card.classList.add("playing");
        card.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + id + "?autoplay=1&rel=0" + start +
          '" title="' + esc(title) + '" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
      });
    });
  }

  /* ---------- public API ---------- */
  w.CourseEngine = {
    init: function (cfg) {
      cfg = cfg || {};
      injectCSS();
      videos();
      if (cfg.glossary) linkTerms(cfg.scope || ".mod-inner", cfg.glossary);
      if (cfg.quiz || cfg.glossary) FC(cfg.pageKey || "default", cfg.quiz, cfg.glossary);
    }
  };
})(window, document);
