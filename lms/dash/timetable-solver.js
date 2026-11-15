/* =====================================================================
   TIMETABLE SOLVER (16 Nov 2026) — pure, dependency-free, deterministic.
   Used by lms/dash/planner.html (window.TimetableSolver) and meant to be
   ported to the platform API as is (module.exports in Node).

   solve(input) → { assignments, unplaced, clashes, score, explain, stats }
   check(input, assignments) → [ hard violations in words ]   (empty = valid)

   INPUT (plain JSON)
     slots:    [{ id, mode, day?, label?, overlaps?:[slotIds], modeLabel? }]   mode: weekly | weekend | block …
                day groups slots for maxPerDay and spread (default: the id)
                overlaps = other slots that take place (partly) at the same real time, read both
                ways: a block week overlaps every weekly slot of that week, a 3-hour slot from
                09:00 overlaps the 2-hour slot from 10:00. A room, a teacher and a regular student
                are then never in two overlapping slots at once (16 Nov 2026, the port to the API; before, a block
                week was only its own slot and did not block its week's weekly slots).
                modeLabel = the words for the kind of time in the reasons ("2-hour weekly")
     rooms:    [{ id, cap, lab?, blocked?:[slotId] }]
     teachers: [{ id, name?, avail:{slotId:'y'|'m'|'n'}, maxPerDay?, maxClasses?, maxHours? }]
                a slot missing from avail counts as 'm' (if needed)
     classes:  [{ id, name?, mode, size, lab?, hours?, students:[ids], retakers:[ids],
                  teacher (id or null), candidates:[ids], pinned:{slot?,room?,teacher?},
                  avoidSlots?:[ids], prefer?:{slot?,room?,teacher?} }]
                prefer = the previous proposal: a soft wish to stay there (weight keep), so
                solving again changes only what is worth changing
                teacher null → the solver chooses among candidates (in order of preference)
     weights:  { ifNeeded, retakerClash, teacherSameDay (= cost per extra teaching day,
                 i.e. compactness; alias teacherDays), spread, roomFit, teacherChoice, keep }
     seed, iterations?, nodeBudget?

   HARD: one slot of the class's own mode; no two classes sharing a student who is a
   regular (non-retaker) member of both at the same slot; the teacher is 'y' or 'm' there
   and teaches one class at a time (overlapping slots count as the same time), at most
   maxPerDay a day, maxClasses and maxHours in
   total; the room holds the class, is a lab when needed, is not booked twice or blocked
   (a block-mode class may go 'Off campus'); pins and avoidSlots are obeyed.
   SOFT (weighted): 'if needed' hours, retaker double bookings (per student and slot),
   the same cohort twice on one day, teaching days per teacher, empty seats (and a lab
   used by a class that needs none, or off campus), teacher further down the candidates.
   METHOD: backtracking (most constrained class first, cheapest option first, forward
   checking, node budget, best partial kept), then simulated annealing with a seeded
   mulberry32 on the soft score (move, swap, eject-and-repair), never breaking a hard rule.
   ===================================================================== */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.TimetableSolver = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const OFF = 'Off campus';
  const BIG = 1e6;
  const DEF_W = { ifNeeded: 3, retakerClash: 4, teacherDays: 1, spread: 1.5, roomFit: 0.4, teacherChoice: 0.6, keep: 2 };

  function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const now = () => (typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now());
  const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
  const listWords = a => a.length <= 1 ? (a[0] || '') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1];

  /* ---------- prepare the problem ---------- */
  function prepare(input) {
    const W = Object.assign({}, DEF_W, input.weights || {});
    if (input.weights && input.weights.teacherSameDay != null && input.weights.teacherDays == null) W.teacherDays = input.weights.teacherSameDay;
    const slots = (input.slots || []).map(s => ({ id: s.id, mode: s.mode, day: s.day && s.day !== 'week' ? s.day : s.id, label: s.label || s.id }));
    const SL = {}; slots.forEach(s => SL[s.id] = s);
    /* overlapping slots, both ways; OVL[id] = the other slots that share real time with it */
    const OV = {}; slots.forEach(s => OV[s.id] = new Set());
    (input.slots || []).forEach(s => (s.overlaps || []).forEach(o => { if (o !== s.id && OV[s.id] && OV[o]) { OV[s.id].add(o); OV[o].add(s.id); } }));
    const OVL = {}; slots.forEach(s => OVL[s.id] = Array.from(OV[s.id]));
    const same = (a, b) => a === b || (!!OV[a] && OV[a].has(b));
    const modeLabel = {}; (input.slots || []).forEach(s => { if (s.modeLabel && !modeLabel[s.mode]) modeLabel[s.mode] = s.modeLabel; });
    const rooms = (input.rooms || []).map(r => ({ id: r.id, cap: +r.cap || 0, lab: !!r.lab, blocked: new Set(r.blocked || []) }));
    const RM = {}; rooms.forEach(r => RM[r.id] = r);
    const TE = {}; (input.teachers || []).forEach(t => TE[t.id] = { id: t.id, name: t.name || t.id, avail: t.avail || {}, maxPerDay: t.maxPerDay || Infinity, maxClasses: t.maxClasses || Infinity, maxHours: t.maxHours || Infinity });
    const tName = id => (TE[id] || { name: id }).name;
    const av = (t, s) => { const T = TE[t]; if (!T) return 'n'; const v = T.avail[s]; return v === 'y' || v === 'n' ? v : 'm'; };
    const classes = (input.classes || []).map((c, i) => ({
      i, id: c.id, name: c.name || c.id, mode: c.mode, size: +c.size || 0, lab: !!c.lab, hours: +c.hours || 0,
      students: Array.from(new Set(c.students || [])), retakers: new Set(c.retakers || []),
      teacher: c.teacher || null, candidates: Array.from(new Set((c.candidates || []).filter(Boolean))), pinned: c.pinned || {}, avoid: new Set(c.avoidSlots || []), prefer: c.prefer || null,
    }));
    const n = classes.length;
    /* pairs: hard = a regular member of both; soft = only retakers in common */
    const memb = {}; classes.forEach(c => c.students.forEach(s => (memb[s] = memb[s] || []).push(c.i)));
    const pairHard = {}, pairSoft = {}; const key = (a, b) => a < b ? a * n + b : b * n + a;
    Object.keys(memb).forEach(s => { const L = memb[s]; for (let x = 0; x < L.length; x++) for (let y = x + 1; y < L.length; y++) { const a = classes[L[x]], b = classes[L[y]], k = key(a.i, b.i);
      if (!a.retakers.has(s) && !b.retakers.has(s)) pairHard[k] = (pairHard[k] || 0) + 1; else pairSoft[k] = (pairSoft[k] || 0) + 1; } });
    const hardN = classes.map(() => []), softList = [], hardList = [];
    Object.keys(pairHard).forEach(k => { k = +k; const a = Math.floor(k / n), b = k % n; hardN[a].push(b); hardN[b].push(a); hardList.push([a, b, pairHard[k]]); });
    Object.keys(pairSoft).forEach(k => { k = +k; if (pairHard[k]) return; softList.push([Math.floor(k / n), k % n, pairSoft[k]]); });
    hardN.forEach(l => l.sort((a, b) => a - b));
    /* hours and classes of a fixed teacher are reserved whether or not the class is placed yet,
       so the solver never hands a fixed teacher's hours to a class it staffs itself */
    const resH = {}, resC = {};
    classes.forEach(c => { c.fixedT = c.pinned.teacher || c.teacher || null; if (c.fixedT) { resH[c.fixedT] = (resH[c.fixedT] || 0) + c.hours; resC[c.fixedT] = (resC[c.fixedT] || 0) + 1; } });
    const roomH = t => (TE[t] ? TE[t].maxHours : 0) - (resH[t] || 0), roomC = t => (TE[t] ? TE[t].maxClasses : 0) - (resC[t] || 0);
    /* static domain of each class: options {s, r, t, base, m} grouped by slot */
    classes.forEach(c => {
      const p = c.pinned;
      c.slotsC = slots.filter(s => s.mode === c.mode && !c.avoid.has(s.id) && (!p.slot || p.slot === s.id));
      c.teachersC = p.teacher ? [p.teacher] : c.teacher ? [c.teacher] : c.candidates.filter(t => TE[t]);
      const fit = r => r.cap >= c.size && (!c.lab || r.lab);
      c.roomsC = p.room ? (p.room === OFF ? (c.mode === 'block' ? [{ id: OFF, cap: Infinity, off: true, blocked: new Set() }] : []) : (RM[p.room] && fit(RM[p.room]) ? [RM[p.room]] : []))
        : rooms.filter(fit).sort((a, b) => a.cap - b.cap || (a.id < b.id ? -1 : 1)).concat(c.mode === 'block' ? [{ id: OFF, cap: Infinity, off: true, blocked: new Set() }] : []);
      c.opts = []; c.bySlot = [];
      c.slotsC.forEach(s => { const g = [];
        c.teachersC.forEach((t, ti) => { const a = av(t, s.id); if (a === 'n') return;
          if (!c.fixedT && (roomH(t) < c.hours || roomC(t) < 1)) return;
          c.roomsC.forEach(r => { if (r.blocked.has(s.id)) return;
            const fitCost = r.off ? 4 : Math.max(0, r.cap - c.size) / 10 + (r.lab && !c.lab ? 2 : 0);
            const o = { s: s.id, day: s.day, r: r.id, off: !!r.off, t, m: a === 'm', ti, fit: fitCost,
              keep: c.prefer ? (c.prefer.slot && c.prefer.slot !== s.id ? 1 : 0) + (c.prefer.room && c.prefer.room !== r.id ? 0.3 : 0) + (c.prefer.teacher && c.prefer.teacher !== t ? 0.5 : 0) : 0,
              base: (a === 'm' ? W.ifNeeded : 0) + W.roomFit * fitCost + W.teacherChoice * (c.teacher || p.teacher ? 0 : ti) };
            o.base += W.keep * o.keep;
            o.k = c.opts.length; c.opts.push(o); g.push(o); }); });
        g.sort((a, b) => a.base - b.base || a.k - b.k); if (g.length) c.bySlot.push(g); });
      c.optIndex = {}; c.opts.forEach(o => c.optIndex[o.s + '\u0001' + o.r + '\u0001' + o.t] = o);
    });
    return { W, slots, SL, OVL, same, modeLabel, rooms, RM, TE, tName, av, classes, n, hardN, hardList, softList, memb, roomH, roomC };
  }

  /* ---------- the mutable state ---------- */
  function makeState(P) {
    const A = new Array(P.n).fill(null); // option per class
    const tAt = {}, rAt = {}, tDay = {}, tCnt = {}, tHrs = {};
    const add = (m, k, d) => { m[k] = (m[k] || 0) + d; };
    /* tCnt / tHrs count only the classes whose teacher the solver chose (fixed ones are reserved) */
    function assign(i, o) { const c = P.classes[i]; A[i] = o; tAt[o.t + '|' + o.s] = i; if (!o.off) rAt[o.r + '|' + o.s] = i; add(tDay, o.t + '|' + o.day, 1); if (!c.fixedT) { add(tCnt, o.t, 1); add(tHrs, o.t, c.hours); } }
    function unassign(i) { const o = A[i], c = P.classes[i]; if (!o) return; delete tAt[o.t + '|' + o.s]; if (!o.off) delete rAt[o.r + '|' + o.s]; add(tDay, o.t + '|' + o.day, -1); if (!c.fixedT) { add(tCnt, o.t, -1); add(tHrs, o.t, -c.hours); } A[i] = null; }
    /* can class i take option o, given everybody else (i itself ignored)? */
    function slotFree(i, s) { const h = P.hardN[i]; for (let x = 0; x < h.length; x++) { const b = A[h[x]]; if (b && P.same(b.s, s)) return false; } return true; }
    function ok(i, o, skipSlot) {
      if (!skipSlot && !slotFree(i, o.s)) return false;
      const ta = tAt[o.t + '|' + o.s]; if (ta !== undefined && ta !== i) return false;
      if (!o.off) { const ra = rAt[o.r + '|' + o.s]; if (ra !== undefined && ra !== i) return false; }
      const ovl = P.OVL[o.s] || [];
      for (let x = 0; x < ovl.length; x++) { const t2 = tAt[o.t + '|' + ovl[x]]; if (t2 !== undefined && t2 !== i) return false;
        if (!o.off) { const r2 = rAt[o.r + '|' + ovl[x]]; if (r2 !== undefined && r2 !== i) return false; } }
      const T = P.TE[o.t], cur = A[i], c = P.classes[i], same = cur && cur.t === o.t;
      if ((tDay[o.t + '|' + o.day] || 0) - (same && cur.day === o.day ? 1 : 0) + 1 > T.maxPerDay) return false;
      if (!c.fixedT) { if ((tCnt[o.t] || 0) - (same ? 1 : 0) + 1 > P.roomC(o.t)) return false;
        if ((tHrs[o.t] || 0) - (same ? c.hours : 0) + c.hours > P.roomH(o.t)) return false; }
      return true;
    }
    function feasible(i, limit) { const c = P.classes[i], out = [];
      for (const g of c.bySlot) { if (!slotFree(i, g[0].s)) continue; for (const o of g) if (ok(i, o, true)) { out.push(o); if (limit && out.length >= limit) return out; } }
      return out; }
    function feasibleSlotCount(i) { const c = P.classes[i]; let n = 0;
      for (const g of c.bySlot) { if (!slotFree(i, g[0].s)) continue; for (const o of g) if (ok(i, o, true)) { n++; break; } } return n; }
    function cost() {
      const W = P.W; let base = 0, unpl = 0;
      const parts = { ifNeeded: 0, roomFit: 0, teacherChoice: 0, keep: 0, retakerClash: 0, spread: 0, teacherDays: 0 };
      for (let i = 0; i < P.n; i++) { const o = A[i]; if (!o) { unpl++; continue; } if (o.m) parts.ifNeeded += W.ifNeeded; parts.roomFit += W.roomFit * o.fit; parts.keep += W.keep * o.keep; parts.teacherChoice += o.base - (o.m ? W.ifNeeded : 0) - W.roomFit * o.fit - W.keep * o.keep; }
      for (const [a, b, w] of P.softList) { const x = A[a], y = A[b]; if (x && y && P.same(x.s, y.s)) parts.retakerClash += W.retakerClash * w; }
      for (const [a, b] of P.hardList) { const x = A[a], y = A[b]; if (x && y && x.day === y.day && x.s !== y.s) parts.spread += W.spread; }
      const days = {}; for (let i = 0; i < P.n; i++) { const o = A[i]; if (o) (days[o.t] = days[o.t] || new Set()).add(o.day); }
      Object.keys(days).forEach(t => parts.teacherDays += W.teacherDays * (days[t].size - 1));
      base = parts.ifNeeded + parts.roomFit + parts.teacherChoice + parts.keep + parts.retakerClash + parts.spread + parts.teacherDays;
      return { total: base + BIG * unpl, soft: base, unplaced: unpl, parts };
    }
    /* incremental cost of giving class i option o, against what is assigned */
    function incCost(i, o) { const W = P.W; let v = o.base;
      for (const [a, b, w] of P.softList) if (a === i || b === i) { const y = A[a === i ? b : a]; if (y && P.same(y.s, o.s)) v += W.retakerClash * w; }
      for (const j of P.hardN[i]) { const y = A[j]; if (y && y.day === o.day) v += W.spread; }
      if (!(tDay[o.t + '|' + o.day] > 0) && A.some(y => y && y.t === o.t)) v += W.teacherDays;
      return v; }
    return { A, assign, unassign, ok, feasible, feasibleSlotCount, cost, incCost, snapshot: () => A.slice(), restore(snap) { for (let i = 0; i < P.n; i++) unassign(i); snap.forEach((o, i) => { if (o) assign(i, o); }); } };
  }

  /* ---------- words: why a class cannot be placed ---------- */
  function reasonsFor(P, X, i) {
    const c = P.classes[i], R = [], T = P.tName, pin = c.pinned;
    if (P.exclusive && P.exclusive[i]) { const e = P.exclusive[i], k = P.classes[e.keep];
      return [`${T(e.t)} teaches both ${k.name} and ${c.name}, and every possible time of one overlaps every possible time of the other (a block week takes in the weekly times of that week). Only one of the two can be placed, and ${k.name} was kept${k.pinned.slot ? ' because it is pinned' : ''}.`,
        'Give one of the two classes another teacher.']; }
    const modeWord = { weekly: 'weekday', weekend: 'weekend', block: 'block-week' }[c.mode] || P.modeLabel[c.mode] || c.mode;
    const all = P.slots.filter(s => s.mode === c.mode);
    if (!all.length) return [`There is no ${modeWord} time in the term to put it in.`];
    if (pin.slot && !all.some(s => s.id === pin.slot)) R.push('It is pinned to a time that does not belong to its kind of class.');
    if (!c.slotsC.length) { if (pin.slot && c.avoid.has(pin.slot)) R.push('It is pinned to a time the teacher has refused.'); else if (!pin.slot) R.push(`Every ${modeWord} time was ruled out by an objection.`); return R; }
    if (!c.teachersC.length) return ['No teacher is assigned and no candidate teacher is listed for this subject.'];
    if (!c.roomsC.length) { const labs = P.rooms.filter(r => r.lab);
      if (pin.room) R.push(`It is pinned to ${pin.room}, which does not hold ${c.size} students${c.lab ? ' with computers' : ''}.`);
      else if (c.lab) R.push(labs.length ? `No computer lab holds ${c.size} students: the largest lab has ${Math.max(...labs.map(r => r.cap))} seats. Split the class or add computers to a larger room.` : 'The class needs a computer lab and the school has none.');
      else R.push(`No room holds ${c.size} students: the largest has ${Math.max(0, ...P.rooms.map(r => r.cap))} seats. Split the class.`);
      return R; }
    const hrsOut = c.fixedT ? [] : c.teachersC.filter(t => P.TE[t] && (P.roomH(t) < c.hours || P.roomC(t) < 1));
    if (hrsOut.length === c.teachersC.length) { const left = t => Math.max(0, P.roomH(t)), lw = c.teachersC.map(t => `${T(t)} has ${left(t) === Infinity ? 'no limit' : left(t) + ' h'}`);
      return [c.teachersC.length === 1 ? `${T(c.teachersC[0])} has ${left(c.teachersC[0])} contract hours left this term, and the class needs ${c.hours}.` : `None of the ${c.teachersC.length} teachers listed for this subject has ${c.hours} contract hours left this term, which the class needs.`,
        ...(c.teachersC.length > 1 ? [`Hours left: ${listWords(lw)}.`] : []), 'Ask the director to approve extra hours for one of them, or recruit an adjunct for this class.']; }
    const teachersOk = c.teachersC.filter(t => P.TE[t] && !hrsOut.includes(t));
    const allN = teachersOk.filter(t => c.slotsC.every(s => P.av(t, s.id) === 'n'));
    if (allN.length === teachersOk.length) { R.push(teachersOk.length === 1 ? `${T(teachersOk[0])} marked every remaining ${modeWord} time as unavailable${c.avoid.size ? ', or refused it' : ''}.` : `None of the ${teachersOk.length} possible teachers is available at any remaining ${modeWord} time.`); return R; }
    /* dynamic: slot by slot, against the other classes */
    const per = [];
    c.slotsC.forEach(s => {
      const why = [];
      const clashWith = P.hardN[i].filter(j => X.A[j] && P.same(X.A[j].s, s.id));
      if (clashWith.length) { const shared = clashWith.reduce((a, j) => a + P.classes[j].students.filter(id => c.students.includes(id) && !c.retakers.has(id) && !P.classes[j].retakers.has(id)).length, 0);
        why.push(`${plural(shared, 'student')} already ${shared === 1 ? 'has' : 'have'} ${listWords(clashWith.map(j => P.classes[j].name))} then`); }
      const tw = teachersOk.map(t => { const a = P.av(t, s.id); if (a === 'n') return `${T(t)} is unavailable`;
        const busy = Object.keys(X.A).find(j => X.A[j] && X.A[j].t === t && P.same(X.A[j].s, s.id) && +j !== i);
        if (busy !== undefined) return X.A[busy].s === s.id ? `${T(t)} teaches ${P.classes[busy].name} then` : `${T(t)} teaches ${P.classes[busy].name} in ${P.SL[X.A[busy].s].label}, which takes in this time`;
        const sameDay = X.A.filter((o, j) => o && j !== i && o.t === t && o.day === s.day).length;
        if (sameDay + 1 > P.TE[t].maxPerDay) return `${T(t)} already teaches ${plural(sameDay, 'class')} that day`;
        if (!c.fixedT) { const mine = X.A.map((o, j) => o && j !== i && o.t === t && !P.classes[j].fixedT ? j : -1).filter(j => j >= 0);
          if (mine.length + 1 > P.roomC(t)) return `${T(t)} already has the most classes allowed`;
          if (mine.reduce((a, j) => a + P.classes[j].hours, 0) + c.hours > P.roomH(t)) return `${T(t)} has no contract hours left for it`; }
        return null; });
      const freeT = teachersOk.filter((t, x) => !tw[x]);
      if (!freeT.length) why.push(teachersOk.length === 1 ? tw[0] : `none of the ${teachersOk.length} possible teachers is free`);
      const freeR = c.roomsC.filter(r => r.off || (!r.blocked.has(s.id) && X.A.every((o, j) => !o || j === i || !P.same(o.s, s.id) || o.r !== r.id)));
      if (!freeR.length) why.push(`no free room holds ${c.size} students${c.lab ? ' with computers' : ''}`);
      if (!why.length) why.push('the free teacher and the free rooms do not combine at this time');
      per.push(`${s.label}: ${why.join('; ')}.`);
    });
    const noRoomEverywhere = per.length && per.every(x => /no free room/.test(x));
    if (noRoomEverywhere) R.push(`At every possible time, the rooms that hold ${c.size} students${c.lab ? ' with computers' : ''} are already taken.`);
    else R.push(`None of the ${plural(c.slotsC.length, modeWord + ' time')} works. Here is what blocks each one:`);
    return R.concat(per);
  }

  /* ---------- solve ---------- */
  function solve(input) {
    const t0 = now();
    const P = prepare(input), X = makeState(P), rnd = mulberry32((input.seed >>> 0) || 1);
    const nodeBudget = input.nodeBudget || 20000;
    /* two classes with the same fixed teacher whose every time overlaps every time of the
       other can never both be placed (a block week against a weekly class): keep one up front,
       the pinned one or else the first, instead of letting the search spend its whole budget */
    P.exclusive = {};
    const fixedBy = {}; P.classes.forEach(c => { if (c.fixedT && c.opts.length) (fixedBy[c.fixedT] = fixedBy[c.fixedT] || []).push(c.i); });
    Object.keys(fixedBy).forEach(t => { const L = fixedBy[t];
      for (let x = 0; x < L.length; x++) for (let y = x + 1; y < L.length; y++) { const a = P.classes[L[x]], b = P.classes[L[y]];
        if (P.exclusive[a.i] || P.exclusive[b.i]) continue;
        const sa = Array.from(new Set(a.opts.map(o => o.s))), sb = Array.from(new Set(b.opts.map(o => o.s)));
        if (!sa.every(u => sb.every(v => u !== v && P.same(u, v)))) continue;
        const drop = b.pinned.slot && !a.pinned.slot ? a : b; P.exclusive[drop.i] = { keep: drop === a ? b.i : a.i, t }; } });
    const live = P.classes.filter(c => c.opts.length && !P.exclusive[c.i]).map(c => c.i);
    /* 1. backtracking with forward checking */
    let nodes = 0, best = { n: -1, snap: null };
    const un = new Set(live);
    function dfs() {
      nodes++;
      const placed = live.length - un.size;
      if (placed > best.n) best = { n: placed, snap: X.snapshot() };
      if (!un.size) return true;
      if (nodes > nodeBudget) return 'budget';
      /* pinned classes first (they must never lose their place to an unpinned one), then the
         class with the fewest times left, then the one sharing students with most classes */
      let pick = -1, pc = Infinity, pdeg = -1, ppin = false;
      for (const i of un) { const k = X.feasibleSlotCount(i); if (k === 0) return false;
        const deg = P.hardN[i].length, pin = !!P.classes[i].pinned.slot;
        if ((pin && !ppin) || (pin === ppin && (k < pc || (k === pc && (deg > pdeg || (deg === pdeg && i < pick)))))) { pick = i; pc = k; pdeg = deg; ppin = pin; } }
      const opts = X.feasible(pick).map(o => ({ o, v: X.incCost(pick, o) })).sort((a, b) => a.v - b.v || a.o.k - b.o.k);
      un.delete(pick);
      for (const { o } of opts) { X.assign(pick, o); const r = dfs(); if (r === true || r === 'budget') return r; X.unassign(pick); }
      un.add(pick); return false;
    }
    const dres = live.length ? dfs() : true;
    if (dres !== true) X.restore(best.snap || []);
    /* any class still out: try to put it somewhere (cheapest) */
    const tryPlace = i => { const f = X.feasible(i); if (!f.length) return false; f.sort((a, b) => X.incCost(i, a) - X.incCost(i, b) || a.k - b.k); X.assign(i, f[0]); return true; };
    live.forEach(i => { if (!X.A[i]) tryPlace(i); });
    /* 2. simulated annealing on the soft score; hard rules are checked on every move */
    const movable = live.filter(i => P.classes[i].opts.length > 1);
    let cur = X.cost(), bestC = cur, bestSnap = X.snapshot();
    const iters = input.iterations != null ? input.iterations : Math.min(60000, 1500 * Math.max(1, live.length));
    const T0 = 6, T1 = 0.02;
    let it = 0;
    for (; it < iters && movable.length; it++) {
      const temp = T0 * Math.pow(T1 / T0, it / iters), r = rnd();
      const unpl = live.filter(i => !X.A[i]);
      if (unpl.length && r < 0.15) { /* eject and repair: place an unplaced class by moving one blocker */
        const u = unpl[Math.floor(rnd() * unpl.length)], c = P.classes[u], o = c.opts[Math.floor(rnd() * c.opts.length)];
        const blockers = new Set(P.hardN[u].filter(j => X.A[j] && P.same(X.A[j].s, o.s)));
        X.A.forEach((y, j) => { if (y && P.same(y.s, o.s) && (y.t === o.t || (!o.off && y.r === o.r))) blockers.add(j); });
        if (blockers.size !== 1) continue;
        const v = [...blockers][0]; if (P.classes[v].opts.length < 2 || P.classes[v].pinned.slot) continue;
        const old = X.A[v]; X.unassign(v);
        if (!X.ok(u, o)) { X.assign(v, old); continue; }
        X.assign(u, o);
        if (!tryPlace(v)) { X.unassign(u); X.assign(v, old); continue; }
        cur = X.cost(); if (cur.total < bestC.total) { bestC = cur; bestSnap = X.snapshot(); } continue;
      }
      if (r < 0.75) { /* move one class */
        const i = movable[Math.floor(rnd() * movable.length)], c = P.classes[i], o = c.opts[Math.floor(rnd() * c.opts.length)], old = X.A[i];
        if (old === o || !X.ok(i, o)) continue;
        if (old) X.unassign(i); X.assign(i, o);
        const nc = X.cost(), d = nc.total - cur.total;
        if (d <= 0 || rnd() < Math.exp(-d / temp)) { cur = nc; if (cur.total < bestC.total) { bestC = cur; bestSnap = X.snapshot(); } }
        else { X.unassign(i); if (old) X.assign(i, old); }
      } else { /* swap the times of two classes of the same kind, keeping rooms and teachers */
        const i = movable[Math.floor(rnd() * movable.length)], j = movable[Math.floor(rnd() * movable.length)];
        const a = X.A[i], b = X.A[j]; if (i === j || !a || !b || a.s === b.s || P.classes[i].mode !== P.classes[j].mode) continue;
        const na = P.classes[i].optIndex[b.s + '\u0001' + a.r + '\u0001' + a.t], nb = P.classes[j].optIndex[a.s + '\u0001' + b.r + '\u0001' + b.t];
        if (!na || !nb) continue;
        X.unassign(i); X.unassign(j);
        if (!X.ok(i, na)) { X.assign(i, a); X.assign(j, b); continue; }
        X.assign(i, na); if (!X.ok(j, nb)) { X.unassign(i); X.assign(i, a); X.assign(j, b); continue; }
        X.assign(j, nb);
        const nc = X.cost(), d = nc.total - cur.total;
        if (d <= 0 || rnd() < Math.exp(-d / temp)) { cur = nc; if (cur.total < bestC.total) { bestC = cur; bestSnap = X.snapshot(); } }
        else { X.unassign(i); X.unassign(j); X.assign(i, a); X.assign(j, b); }
      }
    }
    X.restore(bestSnap);
    const fin = X.cost();
    /* 3. the result in words */
    const assignments = {}, unplaced = [], explain = {};
    P.classes.forEach(c => { const o = X.A[c.i]; if (o) assignments[c.id] = { slot: o.s, room: o.r, teacher: o.t }; });
    P.classes.forEach(c => { if (!X.A[c.i]) unplaced.push({ classId: c.id, reasons: reasonsFor(P, X, c.i) }); });
    /* clashes that remain: a student in two classes at one slot (only retakers can be here) */
    const at = {}; P.classes.forEach(c => { const o = X.A[c.i]; if (o) c.students.forEach(s => (at[s + '|' + o.s] = at[s + '|' + o.s] || []).push(c.id)); });
    const clashes = Object.keys(at).filter(k => at[k].length > 1).sort().map(k => { const p = k.lastIndexOf('|'); return { student: k.slice(0, p), classes: at[k], slot: k.slice(p + 1) }; });
    /* and in two different slots that overlap (only when the input says slots overlap) */
    const byStu = {}; P.classes.forEach(c => { const o = X.A[c.i]; if (o && P.OVL[o.s].length) c.students.forEach(s => (byStu[s] = byStu[s] || []).push([c.id, o.s])); });
    Object.keys(byStu).sort().forEach(s => { const L = byStu[s]; for (let x = 0; x < L.length; x++) for (let y = x + 1; y < L.length; y++)
      if (L[x][1] !== L[y][1] && P.same(L[x][1], L[y][1])) clashes.push({ student: s, classes: [L[x][0], L[y][0]], slot: L[x][1], overlaps: L[y][1] }); });
    P.classes.forEach(c => { const o = X.A[c.i]; if (!o) return; const E = [], pin = c.pinned;
      if (pin.slot) E.push('You pinned it to this time.');
      const sharing = P.softList.filter(([a, b]) => (a === c.i || b === c.i)).filter(([a, b]) => { const y = X.A[a === c.i ? b : a]; return y && P.same(y.s, o.s); });
      const rk = sharing.reduce((a, x) => a + x[2], 0);
      E.push(rk ? `${plural(rk, 'retaking student')} also ${rk === 1 ? 'has' : 'have'} another class at this time; no regular student does.` : 'No student of this class has another class at this time.');
      E.push(o.m ? `${P.tName(o.t)} marked this time as “if needed”, not as available.` : `${P.tName(o.t)} marked this time as available.`);
      if (!c.teacher && !pin.teacher) E.push(o.ti === 0 ? `${P.tName(o.t)} is the first choice for the subject.` : `${P.tName(o.t)} was chosen because the teachers listed before are busy, unavailable or out of hours then.`);
      E.push(o.off ? 'It takes place off campus.' : `Room ${o.r} has ${P.RM[o.r].cap} seats for ${c.size} students${c.lab ? ' and has computers' : ''}.`);
      if (!pin.slot) { const saved = X.A[c.i]; X.unassign(c.i); const alt = new Set(X.feasible(c.i).map(x => x.s)); X.assign(c.i, saved); alt.delete(o.s);
        E.push(alt.size ? `${plural(alt.size, 'other time')} would also work without breaking a rule; this one costs least in the score.` : 'This is the only time that works with every other class where it is.'); }
      explain[c.id] = E; });
    const counts = { placed: Object.keys(assignments).length, classes: P.n, ifNeeded: X.A.filter(o => o && o.m).length, retakerDoubleBookings: clashes.length,
      studentsWithClash: new Set(clashes.map(x => x.student)).size, roomsUsed: new Set(X.A.filter(o => o && !o.off).map(o => o.r)).size,
      teacherDays: (() => { const d = {}; X.A.forEach(o => { if (o) (d[o.t] = d[o.t] || new Set()).add(o.day); }); return Object.values(d).reduce((a, s) => a + s.size, 0); })() };
    const round = v => Math.round(v * 100) / 100;
    const parts = {}; Object.keys(fin.parts).forEach(k => parts[k] = round(fin.parts[k]));
    return { assignments, unplaced, clashes, score: { total: round(fin.soft), parts, counts },
      explain, stats: { ms: Math.round((now() - t0) * 10) / 10, iterations: it, nodes, backtrack: dres === true ? 'every placeable class placed' : dres === 'budget' ? 'node budget reached, best partial kept' : 'no complete timetable exists, best partial kept' } };
  }

  /* ---------- check: every hard rule, in words ---------- */
  function check(input, assignments) {
    const P = prepare(input), V = [], A = assignments || {};
    const byId = {}; P.classes.forEach(c => byId[c.id] = c);
    const used = {};
    P.classes.forEach(c => { const a = A[c.id]; if (!a) return; const s = P.SL[a.slot], t = a.teacher, pin = c.pinned;
      if (!s || s.mode !== c.mode) V.push(`${c.name}: the time ${a.slot} is not a ${c.mode} time.`);
      if (c.avoid.has(a.slot)) V.push(`${c.name}: placed at a time to avoid.`);
      if (pin.slot && pin.slot !== a.slot) V.push(`${c.name}: the slot pin is not respected.`);
      if (pin.room && pin.room !== a.room) V.push(`${c.name}: the room pin is not respected.`);
      const wantT = pin.teacher || c.teacher; if (wantT && wantT !== t) V.push(`${c.name}: the teacher is not the assigned one.`);
      if (!wantT && !c.candidates.includes(t)) V.push(`${c.name}: the teacher is not a candidate.`);
      if (P.av(t, a.slot) === 'n') V.push(`${c.name}: ${P.tName(t)} is unavailable at ${a.slot}.`);
      if (a.room === OFF) { if (c.mode !== 'block') V.push(`${c.name}: only block weeks can be off campus.`); }
      else { const r = P.RM[a.room]; if (!r) V.push(`${c.name}: unknown room ${a.room}.`); else { if (r.cap < c.size) V.push(`${c.name}: ${r.id} is too small.`); if (c.lab && !r.lab) V.push(`${c.name}: needs a lab.`); if (r.blocked.has(a.slot)) V.push(`${c.name}: ${r.id} is blocked then.`); }
        const k = 'r|' + a.room + '|' + a.slot; if (used[k]) V.push(`${a.room} is booked twice at ${a.slot}.`); used[k] = 1; }
      const k2 = 't|' + t + '|' + a.slot; if (used[k2]) V.push(`${P.tName(t)} teaches twice at ${a.slot}.`); used[k2] = 1; });
    /* the same room or teacher in two different slots that overlap */
    const placed = P.classes.filter(c => A[c.id] && P.SL[A[c.id].slot]);
    for (let x = 0; x < placed.length; x++) for (let y = x + 1; y < placed.length; y++) { const a = A[placed[x].id], b = A[placed[y].id];
      if (a.slot === b.slot || !P.same(a.slot, b.slot)) continue;
      if (a.room === b.room && a.room !== OFF) V.push(`${a.room} is booked at ${a.slot} and at ${b.slot}, which overlap.`);
      if (a.teacher === b.teacher) V.push(`${P.tName(a.teacher)} teaches at ${a.slot} and at ${b.slot}, which overlap.`); }
    P.hardList.forEach(([x, y]) => { const a = A[P.classes[x].id], b = A[P.classes[y].id]; if (a && b && P.same(a.slot, b.slot)) V.push(`${P.classes[x].name} and ${P.classes[y].name} share regular students at ${a.slot}${a.slot !== b.slot ? ' and ' + b.slot + ', which overlap' : ''}.`); });
    const day = {}, cnt = {}, hrs = {};
    P.classes.forEach(c => { const a = A[c.id]; if (!a) return; const d = (P.SL[a.slot] || {}).day; day[a.teacher + '|' + d] = (day[a.teacher + '|' + d] || 0) + 1; cnt[a.teacher] = (cnt[a.teacher] || 0) + 1; hrs[a.teacher] = (hrs[a.teacher] || 0) + c.hours; });
    Object.keys(day).forEach(k => { const t = k.split('|')[0]; if (P.TE[t] && day[k] > P.TE[t].maxPerDay) V.push(`${P.tName(t)} teaches more than ${P.TE[t].maxPerDay} a day.`); });
    Object.keys(cnt).forEach(t => { if (P.TE[t] && cnt[t] > P.TE[t].maxClasses) V.push(`${P.tName(t)} has too many classes.`); if (P.TE[t] && hrs[t] > P.TE[t].maxHours) V.push(`${P.tName(t)} is over the contract hours.`); });
    return V;
  }

  return { solve, check, OFF, version: '2026-11-16b' };
});
