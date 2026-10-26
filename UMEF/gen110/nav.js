/* =====================================================================
   GEN 110 · the course menu — a port of SUMAS/mba401/nav.js (19 Oct
   2026) for a bilingual course: every label goes through T(fr,en) from
   lang.js, which every page loads first, and every link points at the
   edition of the page the reader is on (…-en.html on an English page).

   A séance page is ONE page whose sections are <section class="screen">
   blocks switched by the page's own show(id); so a section link is
       · same page   → show(id), hash set to #<id>
       · other page  → seanceN.html#<id>, which this script turns into
                       show(id) on arrival
   NAV is the one copy of the tree — it mirrors the hub's SEANCES and
   each séance's SECTIONS (in _build/*.tpl.html); a shipped séance or a
   renamed section is changed here too. Done ticks come from each
   séance's gen110_<mod>_progress_v1 blob (its page writes it) and, for
   the project page, from gen110_projet_done. The stylesheet nav.css is
   injected here, so one <script src="nav.js" defer> is the whole opt-in.
   ===================================================================== */
(function () {
  'use strict';
  var T = window.T || function (fr) { return fr; };
  var EN = (window.GEN110_LANG || document.documentElement.lang || 'fr') === 'en';
  function pg(base) { return EN ? base.replace(/\.html$/, '-en.html') : base; }

  var NAV = [
    { n: 1, mod: 'w1', href: 'seance1.html', t: T('L’IA, on commence par s’en servir', 'AI: we start by using it'),
      secs: [['s1', '1.1', T('Les mêmes tâches à plusieurs IA', 'The same tasks to several AIs')], ['s2', '1.2', T('Votre premier bon prompt', 'Your first good prompt')],
             ['s3', '1.3', T('Faire se tromper l’IA', 'Making the AI wrong')], ['s4', '1.4', T('Trois mots, une différence', 'Three words, one difference')],
             ['s5', '1.5', T('Le quiz de départ', 'The opening quiz')], ['s6', '1.6', T('Ma première IA', 'My first AI')],
             ['s7', '1.7', T('Ce que vous avez demandé', 'What you asked for')], ['s8', '1.8', T('Votre projet', 'Your project')]] },
    { n: 2, mod: 'w2', href: 'seance2.html', t: T('Bien demander I — le texte', 'Asking well I — text'),
      secs: [['s0', '2.0', T('Votre projet — la première heure', 'Your project — the first hour')], ['s1', '2.1', T('Votre projet, en cinq parties', 'Your project, in five parts')], ['s2', '2.2', T('Trois assistants, un prompt', 'Three assistants, one prompt')],
             ['s3', '2.3', T('Itérer', 'Iterate')], ['s4', '2.4', T('Comment la machine écrit', 'How the machine writes')],
             ['s5', '2.5', T('Le quiz de la séance 2', 'The Session 2 quiz')], ['s6', '2.6', T('Votre bibliothèque de prompts', 'Your prompt library')],
             ['s7', '2.7', T('Le duel des prompts', 'The prompt duel')], ['s8', '2.8', T('La remise 2', 'Hand-in 2')]] },
    { n: 3, mod: 'w3', href: 'seance3.html', t: T('Bien demander II — son, image, vidéo', 'Asking well II — sound, image, video'),
      secs: [['s0', '3.0', T('Votre matériel', 'Your material')], ['s1', '3.1', T('La voix off', 'The voice-over')], ['s2', '3.2', T('Transcrire, résumer, traduire', 'Transcribe, summarise, translate')],
             ['s3', '3.3', T('Des visuels pour une campagne', 'Visuals for a campaign')], ['s4', '3.4', T('Un clip de vingt secondes', 'A twenty-second clip')],
             ['s5', '3.5', T('Vrai ou faux ?', 'Real or fake?')], ['s6', '3.6', T('Le quiz de la séance 3', 'The Session 3 quiz')], ['s7', '3.7', T('Votre kit média', 'Your media kit')]] },
    { n: 4, mod: 'w4', href: 'seance4.html', t: T('Des agents qui travaillent ensemble', 'Agents working together'),
      secs: [['s0', '4.0', T('Votre fichier', 'Your file')], ['s1', '4.1', T('La fiche d’un agent', 'An agent’s card')], ['s2', '4.2', T('L’équipe au travail', 'The team at work')],
             ['s3', '4.3', T('Équipe contre agent seul', 'Team against single agent')], ['s4', '4.4', T('Votre équipe, votre projet', 'Your team, your project')],
             ['s5', '4.5', T('Le quiz de la séance 4', 'The Session 4 quiz')], ['s6', '4.6', T('Ce que vous gardez', 'What you keep')]] },
    { n: 5, mod: 'w5', t: T('Le CV automatisé', 'The automated CV'), locked: true },
    { n: 6, mod: 'w6', t: T('Le prompt engineering pour le travail', 'Prompt engineering for work'), locked: true },
    { n: 7, mod: 'w7', t: T('Automatiser — un agent qui travaille seul', 'Automating — an agent that works alone'), locked: true },
    { n: 8, mod: 'w8', t: T('Programmer — un site, une appli, un jeu', 'Programming — a site, an app, a game'), locked: true },
    { n: 9, mod: 'w9', t: T('Contrats et données', 'Contracts and data'), locked: true },
    { n: 10, mod: 'w10', t: T('Présentations et préparation de l’examen', 'Presentations and exam preparation'), locked: true }
  ];
  var PROJECT = { mod: 'projet', href: 'projet.html', t: T('Le projet · 40 %', 'The project · 40%'),
    secs: [['choix', T('Étape 1', 'Step 1'), T('Six projets au choix', 'Six projects to choose from')],
           ['equipe', T('Étape 2', 'Step 2'), T('Seul·e, ou avec qui', 'Alone, or with whom')],
           ['r1', T('Étape 3', 'Step 3'), T('Remise 1 · cinq champs', 'Hand-in 1 · five fields')],
           ['plan', T('Étape 4', 'Step 4'), T('Le plan, séance par séance', 'The plan, session by session')],
           ['remises', T('Remises 2–5', 'Hand-ins 2–5'), T('Les PDF à déposer', 'The PDFs to hand in')],
           ['final', T('Janvier', 'January'), T('Dossier, prototype, présentation', 'Dossier, prototype, presentation')]] };

  var here = (location.pathname.split('/').pop() || 'index.html').toLowerCase().replace(/-en\.html$/, '.html');
  var CUR = null, CURP = false;
  NAV.forEach(function (s) { if (s.href === here) CUR = s; });
  if (!CUR && typeof window.MOD === 'string') NAV.forEach(function (s) { if (s.mod === window.MOD) CUR = s; });
  if (here === PROJECT.href || window.MOD === 'projet') { CURP = true; }
  var OPEN = {}; if (CUR) OPEN[CUR.mod] = true; if (CURP) OPEN.projet = true;

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function doneOf(s) {
    if (CUR === s && window.progress && window.progress.done) return window.progress.done;
    try { var j = JSON.parse(localStorage.getItem('gen110_' + s.mod + '_progress_v1') || 'null'); return (j && j.done) || {}; } catch (e) { return {}; }
  }
  function projDone() {
    var d = {}; try { d = JSON.parse(localStorage.getItem('gen110_projet_done') || '{}') || {}; } catch (e) {}
    var f = ['p_qui', 'p_probleme', 'p_change', 'p_donnees', 'p_outils'].filter(function (k) { return d[k]; }).length;
    var h = ['r2', 'r3', 'r4', 'r5', 'dossier'].filter(function (k) { return d['handin_' + k]; }).length;
    /* steps 1, 2 and 4 live in gen110_pj (the page's own store) and the pl_w* work fields — ticked here, never counted */
    var pj = {}; try { pj = JSON.parse(localStorage.getItem('gen110_pj') || '{}') || {}; } catch (e) {}
    var plan = false; for (var w = 2; w <= 10; w++) { try { if ((localStorage.getItem('gen110_work_pl_w' + w) || '').trim().length >= 10) plan = true; } catch (e) {} }
    return { choix: !!pj.proj, equipe: !!(pj.alone || (pj.team && pj.team.length)), r1: f === 5, plan: plan, remises: h >= 4, final: !!d.handin_dossier, n: f + h };
  }
  function activeId() { var a = document.querySelector('.screen.active'); return a ? a.id : ''; }
  function canShow() { return typeof window.show === 'function' && !!CUR; }

  var btn, scrim, panel, body;
  function build() {
    if (!document.body) return;
    if (!document.querySelector('link[href$="nav.css"]')) {
      var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'nav.css'; document.head.appendChild(l);
    }
    btn = document.createElement('button');
    btn.className = 'nav-btn'; btn.type = 'button'; btn.setAttribute('aria-label', T('Menu du cours', 'Course menu'));
    btn.innerHTML = '<span class="nav-ico">☰</span><span class="nav-lbl">Menu</span>';
    document.body.appendChild(btn);
    /* bottom-left, level with the 💬 launcher bottom-right: copy its lift */
    function level() {
      var jc = document.getElementById('jc-btn');
      var b = jc ? jc.style.bottom : (document.getElementById('cl-pill') ? '62px' : '14px');
      if (b && btn.style.bottom !== b) btn.style.bottom = b;
    }
    level(); setInterval(level, 1000);

    scrim = document.createElement('div'); scrim.className = 'nav-scrim';
    panel = document.createElement('nav'); panel.className = 'nav-panel'; panel.setAttribute('aria-label', T('Menu du cours', 'Course menu'));
    panel.innerHTML = '<div class="nav-hd"><div><div class="nav-eyebrow">GEN 110 · Swiss UMEF</div><div class="nav-title">' + T('Le cours', 'The course') + '</div></div>' +
      '<button class="nav-x" type="button" aria-label="' + T('Fermer', 'Close') + '">✕</button></div><div class="nav-body"></div>' +
      '<div class="nav-ft"><a href="' + pg('index.html') + '">↖ ' + T('Accueil du cours', 'Course home') + '</a><span class="nav-hint">' + T('Échap ferme · ✓ = fait sur cet appareil', 'Esc closes · ✓ = done on this device') + '</span></div>';
    document.body.appendChild(scrim); document.body.appendChild(panel);
    body = panel.querySelector('.nav-body');
    btn.addEventListener('click', toggle);
    scrim.addEventListener('click', close);
    panel.querySelector('.nav-x').addEventListener('click', close);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && panel.classList.contains('open')) close(); });
    body.addEventListener('click', onClick);
  }

  function render() {
    var act = activeId(), h = '';
    h += '<div class="nav-wk"><div class="nav-wkhd"><span class="nav-wkn">' + T('Séances', 'Sessions') + '</span><span class="nav-wkt">' + T('dix demi-journées', 'ten half-days') + '</span></div>';
    NAV.forEach(function (s) {
      var isCur = s === CUR, open = !!OPEN[s.mod] && !s.locked;
      var label = s.n + ' · ' + s.t;
      if (s.locked) { h += '<div class="nav-part locked"><span class="nav-chev"></span><span class="nav-pt">' + esc(label) + '</span><span class="nav-soon">' + T('en préparation', 'in preparation') + '</span></div>'; return; }
      var done = doneOf(s), n = 0; s.secs.forEach(function (x) { if (done[x[0]]) n++; });
      h += '<div class="nav-part' + (isCur ? ' cur' : '') + (open ? ' open' : '') + '" data-mod="' + s.mod + '">' +
        '<button class="nav-chev" type="button" data-toggle="' + s.mod + '" aria-label="' + T('Voir les sections', 'Show sections') + '">▸</button>' +
        '<a class="nav-pt" href="' + pg(s.href) + '">' + esc(label) + '</a><span class="nav-cnt">' + n + '/' + s.secs.length + '</span></div>';
      if (open) {
        h += '<div class="nav-secs">';
        s.secs.forEach(function (x) {
          var on = isCur && act === x[0];
          h += '<a class="nav-sec' + (done[x[0]] ? ' done' : '') + (on ? ' on' : '') + '" href="' + pg(s.href) + '#' + x[0] + '" data-sec="' + x[0] + '" data-mod="' + s.mod + '">' +
            '<span class="nav-num">' + esc(x[1]) + '</span><span class="nav-nm">' + esc(x[2]) + '</span><span class="nav-tick">' + (done[x[0]] ? '✓' : '') + '</span></a>';
        });
        h += '</div>';
      }
    });
    h += '</div>';
    /* the project */
    var pd = projDone(), popen = !!OPEN.projet;
    h += '<div class="nav-wk"><div class="nav-wkhd"><span class="nav-wkn">' + T('Projet', 'Project') + '</span><span class="nav-wkt">' + T('défini et remis sur ce site', 'defined and handed in on this site') + '</span></div>';
    h += '<div class="nav-part' + (CURP ? ' cur' : '') + (popen ? ' open' : '') + '" data-mod="projet">' +
      '<button class="nav-chev" type="button" data-toggle="projet" aria-label="' + T('Voir', 'Show') + '">▸</button>' +
      '<a class="nav-pt" href="' + pg(PROJECT.href) + '">' + esc(PROJECT.t) + '</a><span class="nav-cnt">' + pd.n + '/10</span></div>';
    if (popen) {
      h += '<div class="nav-secs">';
      PROJECT.secs.forEach(function (x) {
        var dn = !!pd[x[0]];
        h += '<a class="nav-sec' + (dn ? ' done' : '') + '" href="' + pg(PROJECT.href) + '#' + x[0] + '"><span class="nav-num">' + esc(x[1]) + '</span><span class="nav-nm">' + esc(x[2]) + '</span><span class="nav-tick">' + (dn ? '✓' : '') + '</span></a>';
      });
      h += '</div>';
    }
    h += '</div>';
    body.innerHTML = h;
    var cur = body.querySelector('.nav-sec.on') || body.querySelector('.nav-part.cur');
    if (cur && cur.scrollIntoView) { try { cur.scrollIntoView({ block: 'center' }); } catch (e) {} }
  }

  function onClick(e) {
    var t = e.target.closest('[data-toggle]');
    if (t) { var m = t.getAttribute('data-toggle'); OPEN[m] = !OPEN[m]; render(); return; }
    var s = e.target.closest('a.nav-sec');
    if (s && CUR && s.getAttribute('data-mod') === CUR.mod && canShow()) {
      e.preventDefault(); window.show(s.getAttribute('data-sec')); close();
    }
  }
  function open() { render(); panel.classList.add('open'); scrim.classList.add('open'); document.body.classList.add('nav-open'); var x = panel.querySelector('.nav-x'); if (x) x.focus(); }
  function close() { panel.classList.remove('open'); scrim.classList.remove('open'); document.body.classList.remove('nav-open'); if (btn) btn.focus(); }
  function toggle() { if (panel.classList.contains('open')) close(); else open(); }

  function hashId() { var m = (location.hash || '').match(/^#(s\d+|home)$/); return m ? m[1] : ''; }
  function wrapShow() {
    if (typeof window.show !== 'function' || window.show.__nav) return;
    var orig = window.show;
    var w = function (id) { orig.apply(this, arguments); try { history.replaceState(null, '', id === 'home' ? location.pathname + location.search : '#' + id); } catch (e) {} };
    w.__nav = true; window.show = w;
  }
  function boot() {
    build();
    if (canShow()) {
      wrapShow();
      var id = hashId();
      if (id && id !== 'home' && document.getElementById(id)) window.show(id);
      window.addEventListener('hashchange', function () { var i = hashId(); if (i && document.getElementById(i) && activeId() !== i) window.show(i); });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
