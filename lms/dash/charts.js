/* =====================================================================
   Charts for the school dashboards — inline SVG, no library, no CDN.
   Follows the data-viz method: thin marks (bars ≤ 18 px, 4 px rounded
   data-end square at the baseline, 2 px lines, ≥ 8 px end dots with a
   2 px surface ring), hairline solid gridlines, ONE y-axis, a legend for
   ≥ 2 series plus selective direct labels, text in ink tokens (never the
   series colour), a hover layer on every chart (crosshair on lines, per-
   mark tooltip on bars and cells). Colours are CSS variables, so light and
   dark mode both work and a mode switch only needs a redraw.

   Every chart: Charts.<kind>(element, options). It draws at the element's
   width and redraws itself when the window is resized.
   ===================================================================== */
window.Charts = (function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const fmt0 = v => v == null ? '—' : Math.round(v).toLocaleString('de-CH').replace(/’/g, "'");
  /* one redraw per chart element: drawing into the same element again replaces its entry, and an
     element that has left the page is dropped — so a page that re-renders does not pile up redraws */
  let all = [];
  let rT; window.addEventListener('resize', () => { clearTimeout(rT); rT = setTimeout(redrawAll, 120); });
  function reg(el, draw) { all = all.filter(x => x.el !== el && x.el.isConnected); const f = () => { if (el.isConnected) draw(); }; all.push({ el, f }); draw(); return { redraw: f }; }
  function redrawAll() { all = all.filter(x => x.el.isConnected); all.forEach(x => x.f()); }

  /* ---- the one tooltip ---- */
  let tipEl;
  function tip() { if (!tipEl) { tipEl = document.createElement('div'); tipEl.className = 'tip'; document.body.appendChild(tipEl); } return tipEl; }
  /* rows: [{name, value, color, line:true}] — values lead, names follow */
  function showTip(ev, title, rows) {
    const t = tip(); t.innerHTML = '';
    if (title) { const h = document.createElement('div'); h.className = 'tt'; h.textContent = title; t.appendChild(h); }
    rows.forEach(r => { const row = document.createElement('div'); row.className = 'tr';
      const n = document.createElement('span'); if (r.color) { const k = document.createElement('i'); k.className = 'key' + (r.line ? ' ln' : ''); k.style.background = r.color; n.appendChild(k); }
      n.appendChild(document.createTextNode(r.name)); const v = document.createElement('b'); v.textContent = r.value; row.appendChild(n); row.appendChild(v); t.appendChild(row); });
    t.style.display = 'block'; moveTip(ev);
  }
  function moveTip(ev) { const t = tip(); const w = t.offsetWidth, h = t.offsetHeight; let x = ev.clientX + 14, y = ev.clientY + 14;
    if (x + w > innerWidth - 8) x = ev.clientX - w - 14; if (y + h > innerHeight - 8) y = ev.clientY - h - 14; t.style.left = x + 'px'; t.style.top = y + 'px'; }
  function hideTip() { if (tipEl) tipEl.style.display = 'none'; }

  /* ---- scales ---- */
  function nice(max, min) {
    min = min || 0; if (max === min) max = min + 1;
    const span = max - min, step0 = Math.pow(10, Math.floor(Math.log10(span / 4))), err = (span / 4) / step0;
    const step = step0 * (err >= 7.5 ? 10 : err >= 3.5 ? 5 : err >= 1.5 ? 2 : 1);
    const lo = Math.floor(min / step) * step, hi = Math.ceil(max / step) * step, ticks = [];
    for (let v = lo; v <= hi + step / 2; v += step) ticks.push(Math.round(v * 1e6) / 1e6);
    return { lo, hi, ticks };
  }
  const compact = v => Math.abs(v) >= 1e6 ? (Math.round(v / 1e5) / 10) + 'M' : Math.abs(v) >= 1e4 ? Math.round(v / 1e3) + 'K' : fmt0(v);
  function legend(el, series, lineKeys) {
    if (series.length < 2) return;
    const d = document.createElement('div'); d.className = 'legend';
    series.forEach(s => { const i = document.createElement('span'); const k = document.createElement('i'); k.className = 'key' + (lineKeys ? ' ln' : ''); k.style.background = s.color; i.appendChild(k); i.appendChild(document.createTextNode(s.name)); d.appendChild(i); });
    el.appendChild(d);
  }
  function svg(el, w, h) { const s = document.createElementNS(NS, 'svg'); s.setAttribute('viewBox', `0 0 ${w} ${h}`); s.setAttribute('height', h); el.appendChild(s); return s; }
  const roundTop = (x, y, w, h, r) => { r = Math.min(r, w / 2, h); return h <= 0 ? '' : `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`; };
  const roundRight = (x, y, w, h, r) => { r = Math.min(r, h / 2, w); return w <= 0 ? '' : `M${x},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h - r}Q${x + w},${y + h} ${x + w - r},${y + h}H${x}Z`; };

  /* ================================================================
     LINE — labels on x, one or more series; `cmp:true` draws a series as
     the recessive comparison (last year / plan). Optional `target` line.
     ================================================================ */
  function line(el, o) {
    const fmt = o.fmt || fmt0, H = o.height || 220;
    return reg(el, () => {
      el.innerHTML = ''; el.classList.add('chart');
      legend(el, o.series.map(s => ({ name: s.name, color: s.cmp ? 'var(--cmp)' : s.color })), true);
      const W = Math.max(260, el.clientWidth), m = { l: 44, r: o.endLabels === false ? 12 : 64, t: 10, b: 24 };
      const vals = o.series.flatMap(s => s.values).filter(v => v != null).concat(o.target ? [o.target.value] : []);
      const sc = nice(Math.max(...vals), o.yMin != null ? o.yMin : Math.min(0, ...vals));
      const n = o.labels.length, X = i => m.l + (n === 1 ? 0 : i * (W - m.l - m.r) / (n - 1)), Y = v => m.t + (H - m.t - m.b) * (1 - (v - sc.lo) / (sc.hi - sc.lo));
      const s = svg(el, W, H); let g = '';
      sc.ticks.forEach(t => { g += `<line x1="${m.l}" x2="${W - m.r}" y1="${Y(t)}" y2="${Y(t)}" stroke="var(--grid)"/><text x="${m.l - 8}" y="${Y(t) + 4}" text-anchor="end">${esc((o.yFmt || compact)(t))}</text>`; });
      const every = Math.ceil(n / Math.max(2, Math.floor((W - m.l - m.r) / 54)));
      o.labels.forEach((l, i) => { if (i % every === 0 || i === n - 1) g += `<text x="${X(i)}" y="${H - 6}" text-anchor="middle">${esc(l)}</text>`; });
      if (o.target) g += `<line x1="${m.l}" x2="${W - m.r}" y1="${Y(o.target.value)}" y2="${Y(o.target.value)}" stroke="var(--ink2)" stroke-width="1"/><text x="${W - m.r + 6}" y="${Y(o.target.value) + 4}" class="lbl">${esc(o.target.label)}</text>`;
      const ends = [];
      o.series.slice().sort((a, b) => (b.cmp ? 1 : 0) - (a.cmp ? 1 : 0)).forEach(se => {
        const col = se.cmp ? 'var(--cmp)' : se.color; let d = '', started = false, last = null;
        se.values.forEach((v, i) => { if (v == null) { started = false; return; } d += (started ? 'L' : 'M') + X(i) + ',' + Y(v); started = true; last = i; });
        if (se.area && !se.cmp) { const idx = se.values.map((v, i) => v == null ? null : i).filter(i => i != null); if (idx.length) g += `<path d="${d}L${X(idx[idx.length - 1])},${Y(sc.lo)}L${X(idx[0])},${Y(sc.lo)}Z" fill="${col}" opacity=".10"/>`; }
        g += `<path d="${d}" fill="none" stroke="${col}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;
        if (last != null && !se.cmp) { g += `<circle cx="${X(last)}" cy="${Y(se.values[last])}" r="4" fill="${col}" stroke="var(--card)" stroke-width="2"/>`; ends.push({ y: Y(se.values[last]), x: X(last), t: (o.endLabels === 'name' ? se.name + ' ' : '') + fmt(se.values[last]) }); }
      });
      /* end labels: only where they do not collide */
      if (o.endLabels !== false) { ends.sort((a, b) => a.y - b.y); let prev = -99; ends.forEach(e => { if (e.y - prev >= 13) { g += `<text x="${e.x + 8}" y="${e.y + 4}" class="val">${esc(e.t)}</text>`; prev = e.y; } }); }
      g += `<line class="xh" x1="0" x2="0" y1="${m.t}" y2="${H - m.b}" stroke="var(--axis)" visibility="hidden"/><rect class="hit" x="${m.l}" y="0" width="${W - m.l - m.r}" height="${H}"/>`;
      s.innerHTML = g;
      const xh = s.querySelector('.xh'), hit = s.querySelector('.hit');
      const at = ev => { const r = s.getBoundingClientRect(), px = (ev.clientX - r.left) * W / r.width; return Math.max(0, Math.min(n - 1, Math.round((px - m.l) / ((W - m.l - m.r) / Math.max(1, n - 1))))); };
      hit.addEventListener('pointermove', ev => { const i = at(ev); xh.setAttribute('x1', X(i)); xh.setAttribute('x2', X(i)); xh.setAttribute('visibility', 'visible');
        showTip(ev, o.labels[i], o.series.filter(se => se.values[i] != null).map(se => ({ name: se.name, value: fmt(se.values[i]), color: se.cmp ? 'var(--cmp)' : se.color, line: true }))); });
      hit.addEventListener('pointerleave', () => { xh.setAttribute('visibility', 'hidden'); hideTip(); });
    });
  }

  /* ================================================================
     BARS — horizontal, one bar per item, value at the tip. An item may
     carry `cmp` (a thin tick: last year, target) and its own `color`.
     ================================================================ */
  function bars(el, o) {
    const fmt = o.fmt || fmt0;
    return reg(el, () => {
      el.innerHTML = ''; el.classList.add('chart');
      if (o.legend) legend(el, o.legend, false);
      const items = o.items, W = Math.max(260, el.clientWidth), lw = o.labelWidth || Math.min(190, Math.max(80, W * 0.32)), vw = 64, rowH = o.rowH || 26, H = items.length * rowH + 4;
      const max = o.max || Math.max(...items.map(i => Math.max(i.value || 0, i.cmp || 0)), 1);
      const Xw = v => Math.max(0, (W - lw - vw) * (v / max)), s = svg(el, W, H); let g = '';
      items.forEach((it, k) => {
        const y = k * rowH + 4, bh = Math.min(16, rowH - 8), col = it.color || o.color || 'var(--s1)';
        g += `<text x="${lw - 10}" y="${y + bh / 2 + 4}" text-anchor="end" class="lbl">${esc(it.label)}</text>`;
        g += `<line x1="${lw}" x2="${lw}" y1="${y - 2}" y2="${y + bh + 2}" stroke="var(--axis)"/>`;
        g += `<path class="bar" data-k="${k}" d="${roundRight(lw, y, Xw(it.value || 0), bh, 4)}" fill="${col}"/>`;
        if (it.cmp != null) g += `<line x1="${lw + Xw(it.cmp)}" x2="${lw + Xw(it.cmp)}" y1="${y - 3}" y2="${y + bh + 3}" stroke="var(--ink)" stroke-width="2"/>`;
        g += `<text x="${lw + Math.max(Xw(it.value || 0), it.cmp != null ? Xw(it.cmp) : 0) + 8}" y="${y + bh / 2 + 4}" class="val">${esc(it.text != null ? it.text : fmt(it.value))}</text>`;
        g += `<rect class="hit" data-k="${k}" x="0" y="${y - 4}" width="${W}" height="${rowH}"/>`;
      });
      s.innerHTML = g;
      s.querySelectorAll('.hit').forEach(h => { const it = items[+h.dataset.k];
        h.addEventListener('pointermove', ev => { s.querySelectorAll('.bar').forEach(b => b.classList.toggle('hl', b.dataset.k === h.dataset.k));
          const rows = [{ name: o.valueName || 'Value', value: it.text != null ? it.text : fmt(it.value), color: it.color || o.color || 'var(--s1)' }];
          if (it.cmp != null) rows.push({ name: o.cmpName || 'Comparison', value: fmt(it.cmp), color: 'var(--ink)', line: true });
          (it.extra || []).forEach(x => rows.push({ name: x[0], value: x[1] }));
          showTip(ev, it.label, rows); });
        h.addEventListener('pointerleave', () => { s.querySelectorAll('.bar').forEach(b => b.classList.remove('hl')); hideTip(); }); });
    });
  }

  /* ================================================================
     COLUMNS — vertical, stacked or grouped series over categories.
     ================================================================ */
  function columns(el, o) {
    const fmt = o.fmt || fmt0, H = o.height || 220;
    return reg(el, () => {
      el.innerHTML = ''; el.classList.add('chart');
      legend(el, o.series, false);
      const W = Math.max(260, el.clientWidth), m = { l: 44, r: 8, t: 18, b: 24 }, n = o.labels.length;
      const totals = o.labels.map((_, i) => o.stacked ? o.series.reduce((a, s) => a + (s.values[i] || 0), 0) : Math.max(...o.series.map(s => s.values[i] || 0)));
      const sc = nice(Math.max(...totals, o.target ? Math.max(...[].concat(o.target.values || [o.target.value])) : 0), 0);
      const band = (W - m.l - m.r) / n, Y = v => m.t + (H - m.t - m.b) * (1 - v / sc.hi), s = svg(el, W, H); let g = '';
      sc.ticks.forEach(t => { g += `<line x1="${m.l}" x2="${W - m.r}" y1="${Y(t)}" y2="${Y(t)}" stroke="var(--grid)"/><text x="${m.l - 8}" y="${Y(t) + 4}" text-anchor="end">${esc((o.yFmt || compact)(t))}</text>`; });
      o.labels.forEach((l, i) => {
        const cx = m.l + band * i + band / 2;
        g += `<text x="${cx}" y="${H - 6}" text-anchor="middle">${esc(l)}</text>`;
        if (o.stacked) {
          const bw = Math.min(28, band * 0.55); let acc = 0;
          o.series.forEach((se, k) => { const v = se.values[i] || 0; if (!v) return; const y1 = Y(acc + v), y0 = Y(acc); const top = k === o.series.length - 1 || o.series.slice(k + 1).every(x => !(x.values[i]));
            const h = y0 - y1 - (acc ? 2 : 0); g += top ? `<path class="bar" data-i="${i}" d="${roundTop(cx - bw / 2, y1, bw, h, 4)}" fill="${se.color}"/>` : `<rect class="bar" data-i="${i}" x="${cx - bw / 2}" y="${y1}" width="${bw}" height="${Math.max(0, h)}" fill="${se.color}"/>`; acc += v; });
          if (o.totals !== false) { const tv = o.target && o.target.values && o.target.values[i] != null ? Math.max(acc, o.target.values[i]) : acc; g += `<text x="${cx}" y="${Y(tv) - 7}" text-anchor="middle" class="val">${esc(fmt(acc))}</text>`; }
        } else {
          const k = o.series.length, bw = Math.min(18, (band * 0.7) / k);
          o.series.forEach((se, j) => { const v = se.values[i]; if (v == null) return; const x = cx - (k * bw + (k - 1) * 2) / 2 + j * (bw + 2);
            g += `<path class="bar" data-i="${i}" d="${roundTop(x, Y(v), bw, Y(0) - Y(v), 4)}" fill="${se.cmp ? 'var(--cmp)' : se.color}"/>`; });
        }
        if (o.target && o.target.values && o.target.values[i] != null) { const ty = Y(o.target.values[i]); g += `<line x1="${cx - band * 0.38}" x2="${cx + band * 0.38}" y1="${ty}" y2="${ty}" stroke="var(--ink)" stroke-width="2"/>`; }
        g += `<rect class="hit" data-i="${i}" x="${m.l + band * i}" y="0" width="${band}" height="${H}"/>`;
      });
      s.innerHTML = g;
      s.querySelectorAll('.hit').forEach(h => { const i = +h.dataset.i;
        h.addEventListener('pointermove', ev => { s.querySelectorAll('.bar').forEach(b => b.classList.toggle('hl', b.dataset.i === h.dataset.i));
          const rows = o.series.filter(se => se.values[i] != null).map(se => ({ name: se.name, value: fmt(se.values[i]), color: se.cmp ? 'var(--cmp)' : se.color }));
          if (o.stacked && o.series.length > 1) rows.push({ name: 'Total', value: fmt(totals[i]) });
          if (o.target && o.target.values && o.target.values[i] != null) rows.push({ name: o.target.name || 'Target', value: fmt(o.target.values[i]), color: 'var(--ink)', line: true });
          showTip(ev, o.labels[i], rows); });
        h.addEventListener('pointerleave', () => { s.querySelectorAll('.bar').forEach(b => b.classList.remove('hl')); hideTip(); }); });
    });
  }

  /* ================================================================
     FUNNEL — ordered stages as an ordinal ramp, conversion between them,
     and a tick for the same stage at the same week last cycle.
     ================================================================ */
  function funnel(el, o) {
    const RAMP = ['var(--seq2)', 'var(--seq3)', 'var(--s1)', 'var(--seq4)', 'var(--seq5)'];
    return bars(el, { items: o.stages.map((st, i) => ({ label: st.name, value: st.value, cmp: st.cmp, color: RAMP[Math.min(RAMP.length - 1, i)],
      text: fmt0(st.value) + (i && o.stages[i - 1].value ? `  ·  ${Math.round(100 * st.value / o.stages[i - 1].value)} %` : ''),
      extra: i && o.stages[i - 1].value ? [['Conversion from the stage before', Math.round(100 * st.value / o.stages[i - 1].value) + ' %']] : [] })),
      valueName: o.valueName || 'This cycle', cmpName: o.cmpName || 'Last cycle, same week', rowH: 30, labelWidth: o.labelWidth });
  }

  /* ================================================================
     SPARK — a 12-point trend, de-emphasis grey with the last point in the accent
     ================================================================ */
  function spark(el, values, o) {
    o = o || {};
    return reg(el, () => {
      el.innerHTML = ''; el.classList.add('chart');
      const W = Math.max(60, el.clientWidth), H = o.height || 28, v = values.filter(x => x != null), lo = Math.min(...v), hi = Math.max(...v), span = hi - lo || 1;
      const X = i => 2 + i * (W - 8) / Math.max(1, values.length - 1), Y = x => 3 + (H - 6) * (1 - (x - lo) / span);
      let d = ''; values.forEach((x, i) => { if (x != null) d += (d ? 'L' : 'M') + X(i) + ',' + Y(x); });
      const li = values.map((x, i) => x == null ? null : i).filter(i => i != null).pop();
      const s = svg(el, W, H); s.innerHTML = `<path d="${d}" fill="none" stroke="var(--cmp)" stroke-width="2" stroke-linejoin="round"/><circle cx="${X(li)}" cy="${Y(values[li])}" r="3.5" fill="${o.color || 'var(--s1)'}" stroke="var(--card)" stroke-width="2"/>`;
    });
  }

  /* ================================================================
     SEGMENTED BAR — one whole split into parts (tall, 28 px), legend below
     ================================================================ */
  function segbar(el, parts, o) {
    o = o || {}; const fmt = o.fmt || fmt0;
    return reg(el, () => {
      el.innerHTML = ''; el.classList.add('chart');
      const tot = parts.reduce((a, p) => a + p.value, 0) || 1, W = Math.max(200, el.clientWidth), H = 28, s = svg(el, W, H); let x = 0, g = '';
      parts.forEach((p, k) => { const w = (W - 2 * (parts.length - 1)) * p.value / tot; if (w <= 0) return;
        g += `<rect class="bar" data-k="${k}" x="${x}" y="0" width="${w}" height="${H}" rx="4" fill="${p.color}"/>`;
        const lab = Math.round(100 * p.value / tot) + ' %'; if (w > 44) g += `<text x="${x + 8}" y="${H / 2 + 4}" style="fill:${p.ink || '#fff'};font-weight:650">${lab}</text>`;
        g += `<rect class="hit" data-k="${k}" x="${x}" y="0" width="${w}" height="${H}"/>`; x += w + 2; });
      s.innerHTML = g;
      s.querySelectorAll('.hit').forEach(h => { const p = parts[+h.dataset.k]; h.addEventListener('pointermove', ev => showTip(ev, p.name, [{ name: 'Amount', value: fmt(p.value), color: p.color }, { name: 'Share', value: Math.round(100 * p.value / tot) + ' %' }])); h.addEventListener('pointerleave', hideTip); });
      const l = document.createElement('div'); l.className = 'legend'; l.style.margin = '8px 0 0';
      parts.forEach(p => { const i = document.createElement('span'); const k = document.createElement('i'); k.className = 'key'; k.style.background = p.color; i.appendChild(k); i.appendChild(document.createTextNode(p.name)); l.appendChild(i); });
      el.appendChild(l);
    });
  }

  /* ================================================================
     HEAT — rows × columns of a sequential value (attendance by week …)
     ================================================================ */
  function heat(el, o) {
    const fmt = o.fmt || fmt0;
    return reg(el, () => {
      el.innerHTML = ''; el.classList.add('chart');
      const W = Math.max(260, el.clientWidth), lw = o.labelWidth || 150, cw = (W - lw) / o.cols.length, rh = 22, H = o.rows.length * rh + 20;
      const v = o.values.flat().filter(x => x != null), lo = o.min != null ? o.min : Math.min(...v), hi = o.max != null ? o.max : Math.max(...v);
      const STEPS = ['var(--seq1)', 'var(--seq2)', 'var(--seq3)', 'var(--seq4)', 'var(--seq5)'];
      const col = x => STEPS[Math.max(0, Math.min(4, Math.floor(((o.invert ? hi - x : x - lo) / ((hi - lo) || 1)) * 4.999)))];
      const s = svg(el, W, H); let g = '';
      o.cols.forEach((c, j) => { if (o.cols.length <= 16 || j % 2 === 0) g += `<text x="${lw + j * cw + cw / 2}" y="12" text-anchor="middle">${esc(c)}</text>`; });
      o.rows.forEach((r, i) => { const y = 18 + i * rh; g += `<text x="${lw - 8}" y="${y + rh / 2 + 3}" text-anchor="end" class="lbl">${esc(r)}</text>`;
        o.cols.forEach((c, j) => { const x = o.values[i][j]; if (x == null) return; g += `<rect class="bar" data-i="${i}" data-j="${j}" x="${lw + j * cw + 1}" y="${y + 1}" width="${cw - 2}" height="${rh - 2}" rx="3" fill="${col(x)}"/>`; }); });
      s.innerHTML = g;
      s.querySelectorAll('rect.bar').forEach(b => { const i = +b.dataset.i, j = +b.dataset.j; b.addEventListener('pointermove', ev => showTip(ev, o.rows[i] + ' · ' + o.cols[j], [{ name: o.valueName || 'Value', value: fmt(o.values[i][j]), color: col(o.values[i][j]) }])); b.addEventListener('pointerleave', hideTip); });
      if (o.scale !== false) { const l = document.createElement('div'); l.className = 'legend'; l.style.margin = '6px 0 0';
        l.innerHTML = `<span>${esc(fmt(o.invert ? hi : lo))}</span>` + STEPS.map(c => `<i class="key" style="background:${c};margin:0"></i>`).join('') + `<span>${esc(fmt(o.invert ? lo : hi))}</span>${o.scaleNote ? `<span>${esc(o.scaleNote)}</span>` : ''}`; el.appendChild(l); }
    });
  }

  /* ================================================================
     BULLET — one value against a target on a track (meter with a target tick)
     ================================================================ */
  function bullet(el, o) {
    return reg(el, () => {
      el.innerHTML = ''; el.classList.add('chart');
      const W = Math.max(120, el.clientWidth), H = 14, max = o.max || Math.max(o.value, o.target || 0) * 1.15 || 1, s = svg(el, W, H + 4);
      const w = Math.min(W, W * o.value / max), tx = o.target != null ? W * o.target / max : null;
      s.innerHTML = `<rect x="0" y="3" width="${W}" height="${H - 4}" rx="4" fill="var(--grid)"/><rect x="0" y="3" width="${w}" height="${H - 4}" rx="4" fill="${o.color || 'var(--s1)'}"/>` + (tx != null ? `<line x1="${tx}" x2="${tx}" y1="0" y2="${H + 2}" stroke="var(--ink)" stroke-width="2"/>` : '') + `<rect class="hit" x="0" y="0" width="${W}" height="${H + 4}"/>`;
      s.querySelector('.hit').addEventListener('pointermove', ev => showTip(ev, o.label || '', [{ name: o.valueName || 'Now', value: (o.fmt || fmt0)(o.value), color: o.color || 'var(--s1)' }].concat(o.target != null ? [{ name: o.targetName || 'Target', value: (o.fmt || fmt0)(o.target), color: 'var(--ink)', line: true }] : [])));
      s.querySelector('.hit').addEventListener('pointerleave', hideTip);
    });
  }

  return { line, bars, columns, funnel, spark, segbar, heat, bullet, redrawAll, showTip, hideTip, moveTip, fmt0, compact, esc };
})();
