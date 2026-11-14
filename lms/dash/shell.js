/* =====================================================================
   The frame every role dashboard shares: the top bar (school, the eight
   roles, light/dark), programme colours, stat tiles, status pills, and a
   few formatting helpers. A page calls Dash.shell('<role id>') first.
   ===================================================================== */
window.Dash = (function () {
  'use strict';
  const S = window.SCHOOL, esc = Charts.esc;
  const ROLES = [
    { id: 'director', href: 'director.html', name: 'Director', q: 'Is the school on track this year, and what needs my decision?' },
    { id: 'programme', href: 'programme.html', name: 'Programme manager', q: 'How is my programme doing, and which students and courses need help?' },
    { id: 'marketing', href: 'marketing.html', name: 'Sales & marketing', q: 'Will we fill the next intakes, and which channels deliver?' },
    { id: 'admissions', href: 'admissions.html', name: 'Admissions & student office', q: 'Which files, visas and requests are waiting, and for whom?' },
    { id: 'finance', href: 'finance.html', name: 'Finance', q: 'Is the cash coming in, who owes what, and which programme pays?' },
    { id: 'quality', href: 'quality.html', name: 'Quality & accreditation', q: 'Can we prove quality to the accreditors, and where is the evidence thin?' },
    { id: 'professor', href: 'professor.html', name: 'Professor', q: 'What do I teach this week, what must I grade, and who is slipping?' },
    { id: 'student', href: 'student.html', name: 'Student', q: 'Am I on track, what is due, and what do I owe?' },
  ];
  /* programme colours: categorical slots 1–4, fixed to the programme (never to rank) */
  const PC = { bba: 'var(--s1)', msc: 'var(--s2)', emba: 'var(--s3)', dba: 'var(--s4)' };

  /* ---- light / dark: OS by default, a switch that wins both ways ---- */
  function applyTheme() { let t = null; try { t = localStorage.getItem('dash_theme'); } catch (e) {} if (t) document.documentElement.setAttribute('data-theme', t); else document.documentElement.removeAttribute('data-theme'); }
  applyTheme();
  function toggleTheme() {
    const cur = document.documentElement.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const next = cur === 'dark' ? 'light' : 'dark'; try { localStorage.setItem('dash_theme', next); } catch (e) {}
    applyTheme(); Charts.redrawAll();
  }

  function shell(role) {
    if (!document.querySelector('link[rel=icon]')) { const l = document.createElement('link'); l.rel = 'icon'; l.href = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📊</text></svg>"; document.head.appendChild(l); }
    const top = document.createElement('div'); top.className = 'top';
    top.innerHTML = `<div class="top-in">
      <a class="brand" href="index.html"><span class="mk">${esc(S.school.short)}</span><span>${esc(S.school.name)}</span></a>
      <nav class="roles">${ROLES.map(r => `<a href="${r.href}" class="${r.id === role ? 'on' : ''}">${esc(r.name)}</a>`).join('')}</nav>
      <span class="fict" title="Every name and number on these pages is invented">Fictitious data · ${esc(S.school.term)}, week ${S.school.termWeek}</span>
      <button class="tbtn" id="themeBtn" type="button" aria-label="Switch light or dark">◐</button></div>`;
    document.body.insertBefore(top, document.body.firstChild);
    document.getElementById('themeBtn').onclick = toggleTheme;
    const r = ROLES.find(x => x.id === role); if (r) document.title = `${r.name} · ${S.school.name}`;
  }

  /* ---- formatting ---- */
  const chf = n => n == null ? '—' : 'CHF ' + Math.round(n).toLocaleString('de-CH').replace(/’/g, "'");
  const chfK = n => n == null ? '—' : Math.abs(n) >= 1e6 ? 'CHF ' + (Math.round(n / 1e4) / 100).toLocaleString('en') + 'M' : 'CHF ' + Math.round(n / 1000) + 'K';
  const num = n => n == null ? '—' : Math.round(n).toLocaleString('de-CH').replace(/’/g, "'");
  const pct = (n, d) => n == null ? '—' : (Math.round(n * Math.pow(10, d || 0)) / Math.pow(10, d || 0)) + ' %';
  const date = iso => new Date(iso + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const dateLong = iso => new Date(iso + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const daysUntil = iso => Math.round((new Date(iso + 'T12:00:00') - new Date(S.school.today + 'T12:00:00')) / 864e5);

  /* a signed change, coloured by whether up is good, with the period named */
  function delta(now, before, opts) {
    opts = opts || {}; if (before == null || now == null) return '';
    const d = now - before, good = opts.downIsGood ? d < 0 : d > 0, cls = Math.abs(d) < (opts.flat || 1e-9) ? 'flat' : good ? 'up' : 'down';
    const txt = opts.pct ? (d > 0 ? '+' : '') + (Math.round(1000 * d / before) / 10) + ' %' : (d > 0 ? '+' : d < 0 ? '−' : '±') + (opts.fmt || num)(Math.abs(d));
    return `<span class="${cls}">${d > 0 ? '▲' : d < 0 ? '▼' : '●'} ${esc(txt)}</span> ${esc(opts.vs || '')}`;
  }
  /* a stat tile: label · value · delta · optional sparkline id */
  function tile(o) {
    return `<div class="tile"><div class="lab">${esc(o.lab)}</div><div class="val">${esc(o.val)}${o.unit ? `<small>${esc(o.unit)}</small>` : ''}</div>${o.delta ? `<div class="delta">${o.delta}</div>` : ''}${o.spark ? `<div class="spk" id="${o.spark}"></div>` : ''}${o.note ? `<div class="delta">${esc(o.note)}</div>` : ''}</div>`;
  }
  /* status: colour + dot + word, never colour alone */
  const st = (kind, word) => `<span class="st ${kind}">${esc(word)}</span>`;
  const riskSt = r => r === 'high' ? st('crit', 'High risk') : r === 'medium' ? st('serious', 'At risk') : r === 'watch' ? st('warn', 'Watch') : st('good', 'On track');
  const progKey = pid => `<i class="key" style="background:${PC[pid]}"></i>${esc(S.P[pid].short)}`;

  return { S, ROLES, PC, shell, chf, chfK, num, pct, date, dateLong, daysUntil, delta, tile, st, riskSt, progKey, esc };
})();
