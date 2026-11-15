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
    var m = c.meeting, jitsi = m.provider === 'jitsi' && m.room; if (!jitsi && !m.url) return;
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
      cls: 'Rejoindre la salle du cours', team: 'Rejoindre la salle de votre équipe', pick: 'Choisir une équipe pour avoir sa salle', all: 'Salles des équipes',
      tab: 'Ouvrir dans un nouvel onglet', close: 'Quitter l’appel', big: 'Plein écran', small: 'Réduire', clsT: 'Salle du cours', teamT: 'salle de l’équipe',
      lim: 'Si l’appel s’arrête après environ 5 minutes, ouvrez-le dans un nouvel onglet : c’est une limite du serveur gratuit Jitsi, et l’appel continue sans limite dans l’onglet.',
      mod: 'La première personne dans une salle doit se connecter (Google ou GitHub) pour l’ouvrir. Les étudiants n’ont pas besoin de compte.'
    } : {
      live: 'The class is on now, ' + when + ' (Geneva time). You can follow it online.',
      today: 'The class is today, ' + when + ' (Geneva time). You can follow it online.',
      next: 'You can follow this class online. The next session is on ' + (next ? dl(next) : '') + (when ? ', ' + when : '') + ' (Geneva time).',
      cls: 'Join the class room', team: 'Join your team room', pick: 'Pick a team to get a team room', all: 'Team rooms',
      tab: 'Open in a new tab', close: 'Leave the call', big: 'Full screen', small: 'Make smaller', clsT: 'Class room', teamT: 'team room',
      lim: 'If the call stops after about 5 minutes, open it in a new tab. This is a limit of the free Jitsi server, and the call continues without a limit in the new tab.',
      mod: 'The first person in a room has to sign in (Google or GitHub) to open it. Students do not need an account.'
    };

    /* ---- styles ---- */
    var css = document.createElement('style');
    css.textContent = '.jem-meet{display:flex;flex-wrap:wrap;gap:8px 12px;align-items:center;justify-content:center;padding:8px 16px;font:500 14px/1.4 system-ui,-apple-system,Segoe UI,sans-serif;background:#f3f5f8;color:#1a1a1a;border-bottom:1px solid #dde2e8;position:relative;z-index:50}' +
      '.jem-meet.live{background:' + hot + ';color:' + hotInk + ';border-color:transparent;font-weight:650}' +
      '.jem-meet a,.jem-meet button,.jem-mp button,.jem-mp a{font:700 13.5px/1.2 system-ui,-apple-system,Segoe UI,sans-serif;display:inline-block;padding:7px 14px;border-radius:999px;background:' + accent + ';color:#fff;text-decoration:none;border:none;cursor:pointer;white-space:nowrap}' +
      '.jem-meet .alt{background:transparent;color:inherit;border:1.5px solid currentColor}' +
      '.jem-meet .n{opacity:.8;font-size:13px}' +
      '.jem-meet .dot{width:9px;height:9px;border-radius:50%;background:#e02020;display:inline-block;margin-right:6px;animation:jemMeetP 1.6s infinite}' +
      '.jem-meet select{font:600 13px system-ui,sans-serif;padding:6px 8px;border-radius:8px;border:1.5px solid currentColor;background:transparent;color:inherit}' +
      '@keyframes jemMeetP{50%{opacity:.3}}@media(prefers-reduced-motion:reduce){.jem-meet .dot{animation:none}}' +
      '.jem-mp{position:fixed;top:0;right:0;bottom:0;width:min(46vw,760px);min-width:360px;background:#111820;z-index:2147483000;display:flex;flex-direction:column;box-shadow:-8px 0 30px rgba(0,0,0,.35)}' +
      '.jem-mp.big{width:100vw;min-width:0}' +
      '.jem-mp .hd{display:flex;flex-wrap:wrap;gap:6px 8px;align-items:center;padding:8px 10px;background:#18212c;color:#e8ecf1;font:600 14px system-ui,sans-serif}' +
      '.jem-mp .hd b{flex:1;min-width:140px}' +
      '.jem-mp .hd button,.jem-mp .hd a{padding:6px 11px;font-size:12.5px}' +
      '.jem-mp .hd .ghost{background:transparent;border:1.5px solid #6b7a8c;color:#e8ecf1}' +
      '.jem-mp iframe{flex:1;border:0;width:100%;background:#000}' +
      '.jem-mp .ft{padding:7px 12px;font:12.5px/1.45 system-ui,sans-serif;color:#b9c3cf;background:#18212c}' +
      'body.jem-mp-on{margin-right:min(46vw,760px)}' +
      '@media(max-width:820px){.jem-mp{width:100vw;min-width:0}body.jem-mp-on{margin-right:0}}' +
      '@media print{.jem-meet,.jem-mp{display:none}}' +
      '[data-theme="dark"] .jem-meet:not(.live){background:#1b2129;color:#e8ecf1;border-color:#2c3440}';
    document.head.appendChild(css);

    /* ---- the panel with the call ---- */
    var panel = null;
    function open(slug, title) {
      if (!jitsi) { window.open(m.url, '_blank', 'noopener'); return; }
      if (!panel) {
        panel = document.createElement('div'); panel.className = 'jem-mp'; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', title);
        document.body.appendChild(panel);
      }
      document.body.classList.add('jem-mp-on');
      panel.innerHTML = '';
      var hd = document.createElement('div'); hd.className = 'hd';
      var h = document.createElement('b'); h.textContent = title; hd.appendChild(h);
      var a = document.createElement('a'); a.href = URL0(slug); a.target = '_blank'; a.rel = 'noopener'; a.textContent = T.tab;
      a.onclick = function () { setTimeout(close, 300); }; hd.appendChild(a);
      var bg = document.createElement('button'); bg.type = 'button'; bg.className = 'ghost'; bg.textContent = T.big;
      bg.onclick = function () { var on = panel.classList.toggle('big'); bg.textContent = on ? T.small : T.big; }; hd.appendChild(bg);
      var x = document.createElement('button'); x.type = 'button'; x.className = 'ghost'; x.textContent = T.close; x.onclick = close; hd.appendChild(x);
      panel.appendChild(hd);
      var f = document.createElement('iframe'); f.src = embedUrl(slug, title); f.title = title;
      f.allow = 'camera; microphone; display-capture; fullscreen; autoplay; clipboard-write'; f.setAttribute('allowfullscreen', '');
      panel.appendChild(f);
      var ft = document.createElement('div'); ft.className = 'ft'; ft.textContent = T.lim + ' ' + T.mod; panel.appendChild(ft);
    }
    function close() { if (panel) { panel.remove(); panel = null; } document.body.classList.remove('jem-mp-on'); }

    /* ---- the strip ---- */
    var d = document.createElement('div'); d.className = 'jem-meet' + (live ? ' live' : ''); d.setAttribute('role', 'region'); d.setAttribute('aria-label', fr ? 'Cours en ligne' : 'Online class');
    function draw() {
      d.innerHTML = '';
      var s = document.createElement('span'); if (live) { var dot = document.createElement('i'); dot.className = 'dot'; s.appendChild(dot); }
      s.appendChild(document.createTextNode(live ? T.live : next === today ? T.today : T.next)); d.appendChild(s);
      var bc = document.createElement('button'); bc.type = 'button'; bc.textContent = jitsi ? T.cls : 'Join the class on ' + (m.tool || 'the meeting');
      bc.onclick = function () { open('class', c.code ? c.code + ' · ' + T.clsT : T.clsT); }; d.appendChild(bc);
      if (jitsi && (m.teams || []).length) {
        if (instructor) {
          var sel = document.createElement('select'); sel.setAttribute('aria-label', T.all);
          sel.innerHTML = '<option value="">' + T.all + '…</option>' + m.teams.map(function (t) { return '<option value="' + t + '">' + teamLabel(t).replace(/</g, '&lt;') + '</option>'; }).join('');
          sel.onchange = function () { var t = sel.value; if (t) open('team-' + t.toLowerCase(), teamLabel(t) + ' · ' + T.teamT); sel.value = ''; }; d.appendChild(sel);
        } else {
          var t = myTeam();
          if (t) { var bt = document.createElement('button'); bt.type = 'button'; bt.className = 'alt'; bt.textContent = T.team + ' (' + teamLabel(t) + ')';
            bt.onclick = function () { open('team-' + t.toLowerCase(), teamLabel(t) + ' · ' + T.teamT); }; d.appendChild(bt); }
          else if (m.teamsHome) { var ap = document.createElement('a'); ap.className = 'alt'; ap.href = '/' + c.dir + '/' + m.teamsHome; ap.textContent = T.pick; d.appendChild(ap); }
        }
      }
      if (m.note) { var n = document.createElement('span'); n.className = 'n'; n.textContent = m.note; d.appendChild(n); }
    }
    draw();
    b.insertBefore(d, b.firstChild);
    /* the team (and its name) can change on the teams board: redraw when it does */
    var last = myTeam() + '|' + (myTeam() ? teamLabel(myTeam()) : '');
    setInterval(function () { var now = myTeam() + '|' + (myTeam() ? teamLabel(myTeam()) : ''); if (now !== last) { last = now; draw(); } }, 4000);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && panel && panel.classList.contains('big')) panel.classList.remove('big'); });
  }).catch(function () {});
})();
