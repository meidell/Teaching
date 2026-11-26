/* /shared/meet.js — the online class inside the course page (15 Nov 2026).
   Jan Erik: "build jitsi with team rooms and integrated in the page". A course opts in with `meeting` in
   courses.json:
     "meeting": { "provider": "jitsi", "room": "<unguessable prefix>", "teams": ["A","B",…],
                  "teamsGlobal": "EscTeams", "teamsHome": "index.html#teamsBox" }
   The code makes every address itself: the class room = https://meet.jit.si/<room>-class, a team room =
   <room>-team-<letter>. The student's name comes from the course sign-in (<key>_auth) and the team from
   <key>_team (written by the course's teams board), so nobody types a link or a name.
   - A strip at the top of every page of the course: coloured "the class is on now" during a session
     (15 min before the start to the end, Geneva time, from schedule.dates + time), otherwise the next date;
     buttons "Join the class room" and "Join your team room" (or "Pick a team" when the student has none).
     On an instructor device (jem_fb_session, not in student view) a menu lists every team room.
   - A click opens the call in a PANEL inside the page (docked right on a computer, full screen on a
     phone), with "Open in a new tab" always beside it: meet.jit.si cuts calls embedded in another site
     after about 5 minutes; the new tab has no limit. The first person in a room (the instructor) is asked
     by meet.jit.si to sign in with Google or GitHub; students are not.
   - `"provider": "link"` (or no provider) with `url` keeps the plain link of the first version.
   Loaded by /track.js on any page with <body data-course>. No page was edited. */
(function () {
  if (window.__jemMeet) return; window.__jemMeet = 1;
  var b = document.body, id = b && b.getAttribute('data-course'); if (!id) return;
  var load = (window.CourseConfig && CourseConfig.load) ? CourseConfig.load() : fetch('/courses.json', { cache: 'no-cache' }).then(function (r) { return r.json(); });
  Promise.resolve(load).then(function (reg) {
    var list = reg && (reg.courses || reg); if (!list || !list.find) return;
    var c = list.find(function (x) { return x.id === id; }); if (!c || !c.meeting) return;
    var m = c.meeting, jaas = m.provider === 'jaas', jitsi = (m.provider === 'jitsi' || jaas) && m.room; if (!jitsi && !m.url) return;
    var fr = c.lang === 'fr', sch = c.schedule || {}, th = (reg.themes || {})[c.theme] || {}, KP = c.keyPrefix || c.id;
    var accent = th.accent || '#1d3a5f', hot = th.accentBright || accent, hotInk = th.accentBright ? '#111' : '#fff';
    function ls(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
    var instructor = !!ls('jem_fb_session') && ls('jem_view') !== 'student';
    /* ---- now, in Geneva ---- */
    var parts = {}; new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Zurich', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })
      .formatToParts(new Date()).forEach(function (p) { parts[p.type] = p.value; });
    var today = parts.year + '-' + parts.month + '-' + parts.day, nowMin = (+parts.hour % 24) * 60 + (+parts.minute);
    var tm = (sch.time || '').match(/(\d{1,2})[:h](\d{2})\D+(\d{1,2})[:h](\d{2})/), from = tm ? +tm[1] * 60 + +tm[2] : null, to = tm ? +tm[3] * 60 + +tm[4] : null;
    var dates = (sch.dates || []).filter(function (d, i, a) { return a.indexOf(d) === i; }).sort();
    var live = from != null && dates.indexOf(today) >= 0 && nowMin >= from - 15 && nowMin <= to;
    var next = dates.filter(function (d) { return d > today || (d === today && (to == null || nowMin <= to)); })[0];
    if (!next && !live) return;
    var dl = function (iso) { return new Date(iso + 'T12:00:00').toLocaleDateString(fr ? 'fr-CH' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long' }); };
    var when = sch.time || '';

    /* ---- who and which rooms ---- */
    function me() { if (instructor) return 'Jan Erik Meidell (instructor)'; try { var a = JSON.parse(ls(KP + '_auth') || 'null'); if (a && a.name && a.sid && a.sid.charAt(0) !== '_') return String(a.name); } catch (e) {} return instructor ? 'Jan Erik Meidell (instructor)' : ''; }
    function myTeam() { var t = ls(KP + '_team') || ''; return (m.teams || []).indexOf(t) >= 0 ? t : ''; }
    function teamLabel(t) { var g = m.teamsGlobal && window[m.teamsGlobal]; try { if (g && g.label) return g.label(t); } catch (e) {} return (fr ? 'Équipe ' : 'Team ') + t; }
    var ROOM = function (slug) { return m.room + '-' + slug; };
    var URL0 = function (slug) { return 'https://meet.jit.si/' + encodeURIComponent(ROOM(slug)); };
    var CFG = function (title) { return ['config.prejoinConfig.enabled=false', 'config.startWithAudioMuted=true', 'config.startWithVideoMuted=true',
      'config.subject=' + encodeURIComponent(JSON.stringify(title))].join('&'); };
    /* JaaS: a signed pass from the sender worker (Teaching App/sender, POST /jaas) — the student's course
       sign-in (<key>_auth: sid + password, checked against the roster) or the instructor's Firebase token */
    var DB = 'https://teaching-70f1c-default-rtdb.europe-west1.firebasedatabase.app';
    function senderUrl() { return m.tokenUrl ? Promise.resolve(m.tokenUrl) : fetch(DB + '/_site/push.json').then(function (r) { return r.ok ? r.json() : null; }).then(function (x) { if (!x || !x.url) throw new Error('no sender'); return x.url.replace(/\/+$/, '') + '/jaas'; }); }
    function fbToken() {
      if (window.FBAuth) return FBAuth.token();
      return new Promise(function (ok, no) { var s = document.createElement('script'); s.src = '/shared/fb-auth.js'; s.onload = function () { window.FBAuth ? FBAuth.token().then(ok, no) : no(new Error('no auth')); }; s.onerror = no; document.head.appendChild(s); });
    }
    function pass(slug) {
      var body = { ns: c.ns, room: ROOM(slug) }, h = { 'Content-Type': 'application/json' };
      var who = instructor ? fbToken().then(function (t) { h.Authorization = 'Bearer ' + t; })
        : Promise.resolve().then(function () { var a = JSON.parse(ls(KP + '_auth') || 'null'); if (!a || !a.sid || !a.pass) throw new Error(T.signin); body.sid = a.sid; body.pass = a.pass; });
      return who.then(senderUrl).then(function (u) { return fetch(u, { method: 'POST', headers: h, body: JSON.stringify(body) }); })
        .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.error || ('error ' + r.status)); return j; }); });
    }
    function embedUrl(slug, title) {
      var h = ['userInfo.displayName=' + encodeURIComponent(JSON.stringify(me() || (fr ? 'Étudiant' : 'Student'))),
        'config.prejoinConfig.enabled=false', 'config.startWithAudioMuted=true', 'config.startWithVideoMuted=true',
        'config.subject=' + encodeURIComponent(JSON.stringify(title)), 'interfaceConfig.SHOW_JITSI_WATERMARK=false'];
      return URL0(slug) + '#' + h.join('&');
    }
    var T = fr ? {
      live: 'Le cours a lieu maintenant, ' + when + ' (heure de Genève). Vous pouvez le suivre en ligne.',
      today: 'Le cours a lieu aujourd’hui, ' + when + ' (heure de Genève). Vous pouvez le suivre en ligne.',
      next: 'Vous pouvez suivre ce cours en ligne. Prochaine séance : ' + (next ? dl(next) : '') + (when ? ', ' + when : '') + ' (heure de Genève).',
      cls: 'Rejoindre en ligne', team: 'Salle de votre équipe', pick: 'Choisir votre équipe', all: 'Salles des équipes',
      recClose: 'Fermer', rec: 'Enregistrements des séances', recT: 'Enregistrements des séances passées', recNone: 'Aucune séance n’est encore enregistrée. Une séance apparaît ici quelques minutes après la fin, si l’enseignant l’a enregistrée.', recMin: 'min', recSum: 'Résumé', recPts: 'Points principaux', recQ: 'Questions posées', recNext: 'À préparer pour la prochaine séance', recNote: 'Le résumé est écrit par une IA à partir de la transcription : vérifiez un point important dans la vidéo.', recErr: 'La liste n’a pas pu être lue',
      cal: 'Ajouter à mon agenda', calA: 'Apple Calendrier ou Outlook (abonnement)', calG: 'Google Agenda', calF: 'Télécharger le fichier (.ics)', calN: 'Un abonnement se met à jour tout seul quand une date change.',
      tab: 'Ouvrir dans un nouvel onglet', close: 'Quitter l’appel', big: 'Plein écran', small: 'Réduire', clsT: 'Cours en ligne', teamT: 'salle de l’équipe',
      lim: 'Si l’appel s’arrête après environ 5 minutes, ouvrez-le dans un nouvel onglet : c’est une limite du serveur gratuit Jitsi, et l’appel continue sans limite dans l’onglet.',
      mod: 'La première personne dans une salle doit se connecter (Google ou GitHub) pour l’ouvrir. Les étudiants n’ont pas besoin de compte.',
      opening: 'Ouverture de la salle…', signin: 'connectez-vous d’abord au cours', modOn: 'Vous êtes modérateur de cette salle : vous pouvez couper les micros, ouvrir des sous-salles et enregistrer.',
      failed: 'La salle n’a pas pu s’ouvrir', fallback: 'Ouvrir la salle gratuite sur meet.jit.si à la place',
      keep: 'Pendant l’appel, les liens de la page s’ouvrent dans un nouvel onglet : l’appel continue ici.', leave: 'Quitter cette page met fin à l’appel.'
    } : {
      live: 'The class is on now, ' + when + ' (Geneva time). You can follow it online.',
      today: 'The class is today, ' + when + ' (Geneva time). You can follow it online.',
      next: 'You can follow this class online. The next session is on ' + (next ? dl(next) : '') + (when ? ', ' + when : '') + ' (Geneva time).',
      cls: 'Join online', team: 'Your team room', pick: 'Pick your team', all: 'Team rooms',
      recClose: 'Close', rec: 'Recordings of past classes', recT: 'Recordings of past classes', recNone: 'No class has been recorded yet. A class appears here a few minutes after it ends, if the instructor recorded it.', recMin: 'min', recSum: 'Summary', recPts: 'Main points', recQ: 'Questions students asked', recNext: 'To prepare for the next class', recNote: 'An AI wrote the summary from the transcript: check an important point in the video.', recErr: 'The list could not be read',
      cal: 'Add to my calendar', calA: 'Apple Calendar or Outlook (subscribe)', calG: 'Google Calendar', calF: 'Download the file (.ics)', calN: 'A subscription updates itself when a date moves.',
      tab: 'Open in a new tab', close: 'Leave the call', big: 'Full screen', small: 'Make smaller', clsT: 'Online class', teamT: 'team room',
      lim: 'If the call stops after about 5 minutes, open it in a new tab. This is a limit of the free Jitsi server, and the call continues without a limit in the new tab.',
      mod: 'The first person in a room has to sign in (Google or GitHub) to open it. Students do not need an account.',
      opening: 'Opening the room…', signin: 'sign in to the course first', modOn: 'You are the moderator of this room: you can mute everyone, open breakout rooms and record.',
      failed: 'The room could not be opened', fallback: 'Open the free room on meet.jit.si instead',
      keep: 'During the call, links on this page open in a new tab, so the call keeps running here.', leave: 'Leaving this page ends the call.'
    };

    /* ---- styles ---- */
    var css = document.createElement('style');
    /* 16 Nov 2026 (Jan Erik: "remove the text and add the buttons rather onto the blue bar"): no sentence;
       compact buttons placed inside the course's own top bar (.topbar on session pages, nav.nav .navright on
       course homes); a plain row at the top only where a page has neither. */
    css.textContent = '.jem-meet{display:flex;flex-wrap:nowrap;gap:7px;align-items:center;font:600 13px/1.2 system-ui,-apple-system,Segoe UI,sans-serif;min-width:0}' +
      '.jem-meet.row{justify-content:center;flex-wrap:wrap;padding:7px 16px;background:' + accent + ';position:relative;z-index:50}' +
      '.jem-meet button,.jem-meet a.b,.jem-meet summary{font:700 12.5px/1.2 system-ui,-apple-system,Segoe UI,sans-serif;display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:999px;background:transparent;color:#fff;border:1.5px solid rgba(255,255,255,.55);text-decoration:none;cursor:pointer;white-space:nowrap}' +
      '.jem-meet button:hover,.jem-meet a.b:hover,.jem-meet summary:hover{border-color:#fff;background:rgba(255,255,255,.08)}' +
      '.jem-meet .join{background:' + hot + ';color:' + hotInk + ';border-color:' + hot + '}.jem-meet .join:hover{background:' + hot + ';filter:brightness(1.08)}' +
      '.jem-meet .dot{width:8px;height:8px;border-radius:50%;background:#e02020;display:inline-block;animation:jemMeetP 1.6s infinite}' +
      '.jem-meet select{font:700 12.5px system-ui,sans-serif;padding:5px 8px;border-radius:999px;border:1.5px solid rgba(255,255,255,.55);background:transparent;color:#fff;max-width:150px}.jem-meet select option{color:#111}' +
      /* phones: the bar wraps and the buttons take a second line inside it */
      '.jem-host{flex-wrap:wrap!important;row-gap:6px}' +
      '@media(max-width:760px){.jem-host>.jem-meet{order:99;flex:1 1 100%;justify-content:center;padding:6px 0 2px}}' +
      '.jem-meet .sh{display:none}@media(max-width:760px){.jem-meet .lg{display:none}.jem-meet .sh{display:inline}.jem-meet button,.jem-meet a.b,.jem-meet summary{padding:5px 9px;font-size:12px}.jem-meet{gap:5px}}' +
      '@keyframes jemMeetP{50%{opacity:.3}}@media(prefers-reduced-motion:reduce){.jem-meet .dot{animation:none}}' +
      '.jem-mp{position:fixed;top:0;right:0;bottom:0;width:min(46vw,760px);min-width:360px;background:#111820;z-index:2147483000;display:flex;flex-direction:column;box-shadow:-8px 0 30px rgba(0,0,0,.35)}' +
      '.jem-mp.big{width:100vw;min-width:0}' +
      '.jem-mp .hd{display:flex;flex-wrap:wrap;gap:6px 8px;align-items:center;padding:8px 10px;background:#18212c;color:#e8ecf1;font:600 14px system-ui,sans-serif}' +
      '.jem-mp .hd b{flex:1;min-width:140px}' +
      '.jem-mp .hd{background:' + accent + ';padding:10px 12px;gap:8px}.jem-mp .hd b{font:700 14.5px/1.3 system-ui,-apple-system,Segoe UI,sans-serif;color:#fff}' +
      '.jem-mp .hd button,.jem-mp .hd a,.jem-mp .rl a.b{font:700 12.5px/1.2 system-ui,-apple-system,Segoe UI,sans-serif!important;display:inline-flex;align-items:center;padding:6px 12px!important;border-radius:999px!important;background:transparent!important;color:#fff!important;border:1.5px solid rgba(255,255,255,.55)!important;text-decoration:none!important;cursor:pointer;white-space:nowrap}' +
      '.jem-mp .hd button:hover,.jem-mp .hd a:hover{border-color:#fff!important;background:rgba(255,255,255,.1)!important}' +
      '.jem-mp .hd .main{background:' + hot + '!important;color:' + hotInk + '!important;border-color:' + hot + '!important}' +
      '.jem-mp iframe{flex:1;border:0;width:100%;background:#000}' +
      '.jem-mp .ft{padding:7px 12px;font:12.5px/1.45 system-ui,sans-serif;color:#b9c3cf;background:#18212c}' +
      '.jem-mp .rl{flex:1;overflow:auto;padding:12px 14px;background:#f4f6f9;color:#14213d;font:14px/1.5 system-ui,-apple-system,Segoe UI,sans-serif}' +
      '.jem-mp .rc{background:#fff;border:1px solid #dde2e8;border-radius:12px;padding:12px 14px;margin:0 0 12px}.jem-mp .rc h4{margin:0 0 6px;font-size:15px}.jem-mp .rc h5{margin:8px 0 2px;font-size:12px;letter-spacing:.04em;text-transform:uppercase;color:#556}' +
      '.jem-mp .rc video{width:100%;max-height:52vh;background:#000;border-radius:8px;margin:6px 0}.jem-mp .rc ul{margin:0 0 4px 18px;padding:0}.jem-mp .rc p{margin:0 0 4px}.jem-mp .rc small{color:#667}' +
      'body.jem-mp-on{margin-right:min(46vw,760px)}' +
      '@media(max-width:820px){.jem-mp{width:100vw;min-width:0}body.jem-mp-on{margin-right:0}}' +
      '.jem-meet details.cal{position:relative}.jem-meet details.cal summary{list-style:none}.jem-meet details.cal summary::-webkit-details-marker{display:none}' +
      '.jem-meet .calm{position:absolute;right:0;top:calc(100% + 8px);background:#fff;color:#14213d;border:1px solid #dde2e8;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.18);padding:8px;display:flex;flex-direction:column;gap:2px;min-width:260px;z-index:2147481000}' +
      '.jem-meet .calm a{display:block;background:none;color:' + accent + ';border:0;border-radius:8px;padding:7px 10px;font:600 13.5px/1.3 system-ui,sans-serif;text-decoration:none;white-space:normal}.jem-meet .calm a:hover{background:#f3f5f8}.jem-meet .calm small{color:#667;font-size:12px;padding:4px 10px}' +
      '@media(max-width:600px){.jem-meet .calm{position:fixed;left:12px;right:12px;top:64px;min-width:0}}' +
      '@media print{.jem-meet,.jem-mp{display:none}}';
    document.head.appendChild(css);

    /* ---- the panel with the call ---- */
    var panel = null;
    function shell(title) {
      if (!panel) { panel = document.createElement('div'); panel.className = 'jem-mp'; panel.setAttribute('role', 'dialog'); document.body.appendChild(panel); }
      panel.setAttribute('aria-label', title); document.body.classList.add('jem-mp-on'); panel.innerHTML = '';
      var hd = document.createElement('div'); hd.className = 'hd';
      var h = document.createElement('b'); h.textContent = title; hd.appendChild(h); panel.appendChild(hd); return hd;
    }
    function frame(hd, title, src, tabUrl, foot) {
      var a = document.createElement('a'); a.className = 'main'; a.href = tabUrl; a.target = '_blank'; a.rel = 'noopener'; a.textContent = T.tab;
      a.onclick = function () { setTimeout(close, 300); }; hd.appendChild(a);
      var bg = document.createElement('button'); bg.type = 'button'; bg.className = 'ghost'; bg.textContent = T.big;
      bg.onclick = function () { var on = panel.classList.toggle('big'); bg.textContent = on ? T.small : T.big; }; hd.appendChild(bg);
      var x = document.createElement('button'); x.type = 'button'; x.className = 'ghost'; x.textContent = T.close; x.onclick = close; hd.appendChild(x);
      var f = document.createElement('iframe'); f.src = src; f.title = title;
      f.allow = 'camera; microphone; display-capture; fullscreen; autoplay; clipboard-write'; f.setAttribute('allowfullscreen', '');
      panel.appendChild(f); inCall = true;
      var kp = document.createElement('div'); kp.className = 'ft'; kp.textContent = T.keep; panel.appendChild(kp);
      if (foot) { var ft = document.createElement('div'); ft.className = 'ft'; ft.textContent = foot; panel.appendChild(ft); }
    }
    function open(slug, title) {
      if (!jitsi) { window.open(m.url, '_blank', 'noopener'); return; }
      var hd = shell(title);
      if (!jaas) { frame(hd, title, embedUrl(slug, title), URL0(slug), T.lim + ' ' + T.mod); return; }
      var wait = document.createElement('div'); wait.className = 'ft'; wait.style.flex = '1'; wait.textContent = T.opening; panel.appendChild(wait);
      pass(slug).then(function (p) {
        if (!panel) return; wait.remove();
        var base = 'https://8x8.vc/' + encodeURIComponent(p.appId) + '/' + encodeURIComponent(ROOM(slug)) + '?jwt=' + encodeURIComponent(p.token);
        frame(hd, title, base + '#' + CFG(title), base, p.moderator ? T.modOn : '');
      }).catch(function (e) {
        if (!panel) return;
        wait.textContent = T.failed + ' (' + (e && e.message || e) + ')';
        var alt = document.createElement('a'); alt.href = URL0(slug); alt.target = '_blank'; alt.rel = 'noopener'; alt.textContent = T.fallback;
        alt.className = 'b'; alt.style.cssText = 'margin:0 12px 12px;align-self:flex-start;background:' + accent + '!important'; panel.appendChild(alt);
        var x = document.createElement('button'); x.type = 'button'; x.className = 'ghost'; x.textContent = T.close; x.onclick = close; hd.appendChild(x);
      });
    }
    function close() { inCall = false; if (panel) { panel.remove(); panel = null; } document.body.classList.remove('jem-mp-on'); }

    /* 26 Nov 2026 (Jan Erik: "the camera cuts every time you click on a link in the page"): the call
       lives in an iframe of THIS page, so leaving the page ends it. While a call is open, a click on a
       link that would leave the page opens that link in a new tab instead; a link to a place on the
       same page (#…) still scrolls. A reload or the browser's Back button asks before ending the call. */
    var inCall = false;
    document.addEventListener('click', function (e) {
      if (!inCall || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target && e.target.closest && e.target.closest('a[href]');
      if (!a || (panel && panel.contains(a)) || a.hasAttribute('download')) return;
      var t = (a.getAttribute('target') || '').toLowerCase(); if (t && t !== '_self') return;
      var href = a.getAttribute('href') || ''; if (/^(javascript:|mailto:|tel:|#)/i.test(href)) return;
      var u; try { u = new URL(a.href, location.href); } catch (x) { return; }
      if (u.origin === location.origin && u.pathname === location.pathname && u.search === location.search && u.hash) return;
      e.preventDefault(); window.open(u.href, '_blank', 'noopener');
    }, true);
    window.addEventListener('beforeunload', function (e) { if (inCall) { e.preventDefault(); e.returnValue = T.leave; return T.leave; } });

    /* ---- recordings of past classes (sender worker: POST /rec/list, roster password or instructor token;
       each item carries a 6-hour signed play URL served from the R2 bucket with Range for seeking) ---- */
    var RECS = null;
    function recList(base) {
      var body = { ns: c.ns }, h = { 'Content-Type': 'application/json' };
      var who = instructor ? fbToken().then(function (t) { h.Authorization = 'Bearer ' + t; })
        : Promise.resolve().then(function () { var a = JSON.parse(ls(KP + '_auth') || 'null'); if (!a || !a.sid || !a.pass) throw new Error(T.signin); body.sid = a.sid; body.pass = a.pass; });
      return who.then(function () { return fetch(base + '/rec/list', { method: 'POST', headers: h, body: JSON.stringify(body) }); })
        .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.error || ('error ' + r.status)); return j.recordings || []; }); });
    }
    function escH(x) { return String(x == null ? '' : x).replace(/[&<>"]/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]; }); }
    function li(a) { return (a || []).length ? '<ul>' + a.map(function (x) { return '<li>' + escH(x) + '</li>'; }).join('') + '</ul>' : ''; }
    function openRecs() {
      var hd = shell(T.recT);
      var x = document.createElement('button'); x.type = 'button'; x.className = 'ghost'; x.textContent = T.recClose; x.onclick = close; hd.appendChild(x);
      var box = document.createElement('div'); box.className = 'rl'; panel.appendChild(box);
      var list = RECS || [];
      box.innerHTML = list.length ? list.map(function (r) { var s = r.summary;
        return '<div class="rc"><h4>' + escH(r.date ? dl(r.date) : '') + ' · ' + escH(r.label) + (r.durationSec ? ' · ' + Math.round(r.durationSec / 60) + ' ' + T.recMin : '') + '</h4>' +
          '<video controls preload="metadata" src="' + escH(r.play) + '"></video>' +
          (s ? '<h5>' + T.recSum + '</h5><p>' + escH(s.summary) + '</p>' + (s.points && s.points.length ? '<h5>' + T.recPts + '</h5>' + li(s.points) : '') +
            (s.questions && s.questions.length ? '<h5>' + T.recQ + '</h5>' + li(s.questions) : '') + (s.next && s.next.length ? '<h5>' + T.recNext + '</h5>' + li(s.next) : '') + '<small>' + T.recNote + '</small>' : '') + '</div>'; }).join('')
        : '<p>' + escH(T.recNone) + '</p>';
    }

    /* ---- the strip ---- */
    var d = document.createElement('div'); d.className = 'jem-meet'; d.setAttribute('role', 'group'); d.setAttribute('aria-label', fr ? 'Cours en ligne' : 'Online class');
    function lab(el, long, short) { el.innerHTML = '<span class="lg">' + escH(long) + '</span><span class="sh">' + escH(short) + '</span>'; return el; }
    var S = fr ? { cls: 'En ligne', team: 'Équipe', cal: 'Agenda', rec: 'Enregistrements', live: 'en direct' } : { cls: 'Online', team: 'Team room', cal: 'Calendar', rec: 'Recordings', live: 'live' };
    function draw() {
      d.innerHTML = '';
      var bc = lab(document.createElement('button'), jitsi ? T.cls : 'Join the class on ' + (m.tool || 'the meeting'), S.cls); bc.type = 'button'; bc.className = 'join';
      bc.title = live ? T.live : next === today ? T.today : T.next;
      if (live) { var dot = document.createElement('i'); dot.className = 'dot'; dot.title = S.live; bc.insertBefore(dot, bc.firstChild); }
      bc.onclick = function () { open('class', c.code ? c.code + ' · ' + T.clsT : T.clsT); }; d.appendChild(bc);
      if (jitsi && (m.teams || []).length) {
        if (instructor) {
          var sel = document.createElement('select'); sel.setAttribute('aria-label', T.all);
          sel.innerHTML = '<option value="">' + T.all + '…</option>' + m.teams.map(function (t) { return '<option value="' + t + '">' + teamLabel(t).replace(/</g, '&lt;') + '</option>'; }).join('');
          sel.onchange = function () { var t = sel.value; if (t) open('team-' + t.toLowerCase(), teamLabel(t) + ' · ' + T.teamT); sel.value = ''; }; d.appendChild(sel);
        } else {
          var t = myTeam();
          if (t) { var bt = lab(document.createElement('button'), T.team + ' (' + teamLabel(t) + ')', S.team); bt.type = 'button'; bt.title = T.team + ' (' + teamLabel(t) + ')';
            bt.onclick = function () { open('team-' + t.toLowerCase(), teamLabel(t) + ' · ' + T.teamT); }; d.appendChild(bt); }
          else if (m.teamsHome) { var ap = lab(document.createElement('a'), T.pick, S.team); ap.className = 'b'; ap.href = '/' + c.dir + '/' + m.teamsHome; ap.title = T.pick; d.appendChild(ap); }
        }
      }
      if (jaas && RECS && (RECS.length || instructor)) {
        var br = lab(document.createElement('button'), T.rec + (RECS.length ? ' (' + RECS.length + ')' : ''), S.rec); br.type = 'button'; br.title = T.rec;
        br.onclick = openRecs; d.appendChild(br);
      }
      /* calendar sync: the sender worker serves the course's class dates as a live feed (GET /ical/<id>.ics);
         the menu closes after a choice, on a click outside it and on Escape */
      if (calBase && !(c.menu && c.menu.on)) {
        var feed = calBase + '/ical/' + c.id + '.ics', web = feed.replace(/^https?:/, 'webcal:');
        var dt = document.createElement('details'); dt.className = 'cal';
        dt.innerHTML = '<summary title="' + escH(T.cal) + '"><span class="lg">' + escH(T.cal) + '</span><span class="sh">' + escH(S.cal) + '</span></summary><div class="calm"><a href="' + web + '">' + T.calA + '</a><a target="_blank" rel="noopener" href="https://calendar.google.com/calendar/r?cid=' + encodeURIComponent(web) + '">' + T.calG + '</a><a href="' + feed + '" download>' + T.calF + '</a><small>' + T.calN + '</small></div>';
        dt.querySelectorAll('.calm a').forEach(function (a) { a.addEventListener('click', function () { setTimeout(function () { dt.open = false; }, 60); }); });
        d.appendChild(dt);
      }
    }
    document.addEventListener('click', function (e) { var o = d.querySelector('details.cal[open]'); if (o && !o.contains(e.target)) o.open = false; });
    document.addEventListener('keydown', function (e) { var o = d.querySelector('details.cal[open]'); if (e.key === 'Escape' && o) o.open = false; });
    /* where the buttons go: the course's own bar, else a row at the top */
    function place() {
      var tb = document.querySelector('.topbar'), nr = document.querySelector('nav.nav .navright'), nav = document.querySelector('nav.nav');
      if (tb) { var who = tb.querySelector('.who, .home'); if (who) tb.insertBefore(d, who); else tb.appendChild(d); tb.classList.add('jem-host'); }
      else if (nav) { if (nr) nav.insertBefore(d, nr); else nav.appendChild(d); nav.classList.add('jem-host'); }
      else { d.classList.add('row'); b.insertBefore(d, b.firstChild); }
    }
    var calBase = null;
    draw();
    place();
    (m.tokenUrl ? Promise.resolve(m.tokenUrl.replace(/\/jaas$/, '')) : fetch(DB + '/_site/push.json').then(function (r) { return r.ok ? r.json() : null; }).then(function (x) { return x && x.url ? x.url.replace(/\/+$/, '') : null; }))
      .then(function (u) {
        if (u && (sch.dates || []).length) { calBase = u; draw(); }
        if (u && jaas && (instructor || ls(KP + '_auth'))) recList(u).then(function (l) { RECS = l; draw(); }).catch(function () {});
      }).catch(function () {});
    /* the team (and its name) can change on the teams board: redraw when it does */
    var last = myTeam() + '|' + (myTeam() ? teamLabel(myTeam()) : '');
    setInterval(function () { var now = myTeam() + '|' + (myTeam() ? teamLabel(myTeam()) : ''); if (now !== last) { last = now; draw(); } }, 4000);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && panel && panel.classList.contains('big')) panel.classList.remove('big'); });
  }).catch(function () {});
})();
