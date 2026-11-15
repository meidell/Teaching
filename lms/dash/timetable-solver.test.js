/* node lms/dash/timetable-solver.test.js — plain asserts, no framework.
   Small hand-made cases, then the demo school's Spring 2027 classes (data.js). */
const assert = require('assert');
const path = require('path');
const TS = require('./timetable-solver.js');

let passed = 0;
const test = (name, fn) => { try { fn(); passed++; console.log('ok   ' + name); } catch (e) { console.log('FAIL ' + name + '\n     ' + e.message); process.exitCode = 1; } };

const wk = ['Mon-am', 'Mon-pm', 'Tue-am', 'Tue-pm'].map(id => ({ id, mode: 'weekly', day: id.slice(0, 3), label: id }));
const yes = ids => Object.fromEntries(ids.map(s => [s, 'y']));
const base = extra => Object.assign({
  slots: wk, rooms: [{ id: 'R1', cap: 40 }, { id: 'R2', cap: 40 }],
  teachers: [{ id: 't1', name: 'Dr One', avail: yes(wk.map(s => s.id)) }, { id: 't2', name: 'Dr Two', avail: yes(wk.map(s => s.id)) }],
  classes: [], weights: {}, seed: 7 }, extra);
const cls = (id, o) => Object.assign({ id, name: id, mode: 'weekly', size: 20, students: [], retakers: [], teacher: 't1', candidates: [], pinned: {} }, o);
const valid = (inp, res) => assert.deepStrictEqual(TS.check(inp, res.assignments), []);

test('two classes of one cohort are forced apart', () => {
  const inp = base({ slots: wk.slice(0, 2), classes: [cls('a', { students: ['s1', 's2'] }), cls('b', { students: ['s1', 's2'], teacher: 't2' })] });
  const r = TS.solve(inp); valid(inp, r);
  assert.strictEqual(r.unplaced.length, 0); assert.notStrictEqual(r.assignments.a.slot, r.assignments.b.slot); assert.strictEqual(r.clashes.length, 0);
});
test("a teacher's 'n' is respected", () => {
  const t = { id: 't1', avail: { 'Mon-am': 'n', 'Mon-pm': 'n', 'Tue-am': 'n', 'Tue-pm': 'y' } };
  const inp = base({ teachers: [t], classes: [cls('a')] }); const r = TS.solve(inp); valid(inp, r);
  assert.strictEqual(r.assignments.a.slot, 'Tue-pm');
});
test("'if needed' is used only when it must be", () => {
  const t = { id: 't1', avail: { 'Mon-am': 'm', 'Mon-pm': 'm', 'Tue-am': 'y', 'Tue-pm': 'm' } };
  const inp = base({ teachers: [t], classes: [cls('a')] }); const r = TS.solve(inp);
  assert.strictEqual(r.assignments.a.slot, 'Tue-am'); assert.strictEqual(r.score.counts.ifNeeded, 0);
});
test('room capacity and lab are respected', () => {
  const inp = base({ rooms: [{ id: 'Small', cap: 20 }, { id: 'Big', cap: 60 }, { id: 'Lab', cap: 25, lab: true }],
    classes: [cls('big', { size: 50 }), cls('lab', { size: 24, lab: true, teacher: 't2' })] });
  const r = TS.solve(inp); valid(inp, r);
  assert.strictEqual(r.assignments.big.room, 'Big'); assert.strictEqual(r.assignments.lab.room, 'Lab');
});
test('the smallest room that fits is preferred', () => {
  const inp = base({ rooms: [{ id: 'Aula', cap: 150 }, { id: 'B', cap: 25 }], classes: [cls('a', { size: 22 })] });
  assert.strictEqual(TS.solve(inp).assignments.a.room, 'B');
});
test('pins are respected', () => {
  const inp = base({ classes: [cls('a', { pinned: { slot: 'Tue-pm', room: 'R2' } }), cls('b', { teacher: null, candidates: ['t1', 't2'], pinned: { teacher: 't2' } })] });
  const r = TS.solve(inp); valid(inp, r);
  assert.deepStrictEqual([r.assignments.a.slot, r.assignments.a.room], ['Tue-pm', 'R2']); assert.strictEqual(r.assignments.b.teacher, 't2');
});
test('the solver chooses a teacher among the candidates, first choice when free', () => {
  const inp = base({ classes: [cls('a', { teacher: null, candidates: ['t2', 't1'] })] });
  assert.strictEqual(TS.solve(inp).assignments.a.teacher, 't2');
});
test('a teacher is never booked twice, and maxPerDay holds', () => {
  const t = { id: 't1', name: 'Dr One', avail: yes(wk.map(s => s.id)), maxPerDay: 1 };
  const inp = base({ teachers: [t], classes: [cls('a'), cls('b'), cls('c')] });
  const r = TS.solve(inp); valid(inp, r);
  assert.strictEqual(r.unplaced.length, 1); const days = Object.values(r.assignments).map(a => a.slot.slice(0, 3)); assert.strictEqual(new Set(days).size, 2);
  assert.ok(r.unplaced[0].reasons.join(' ').includes('Dr One'), r.unplaced[0].reasons.join(' '));
});
test('an unplaceable class is reported with a reason in words', () => {
  const inp = base({ classes: [cls('huge', { size: 56, name: 'Strategy' })] }); const r = TS.solve(inp);
  assert.strictEqual(r.unplaced.length, 1); assert.match(r.unplaced[0].reasons[0], /No room holds 56 students/);
  const inp2 = base({ teachers: [{ id: 't1', name: 'Dr X', avail: { 'Mon-am': 'n', 'Mon-pm': 'n', 'Tue-am': 'n', 'Tue-pm': 'n' } }], classes: [cls('a')] });
  assert.match(TS.solve(inp2).unplaced[0].reasons[0], /Dr X marked every remaining weekday time as unavailable/);
  const inp3 = base({ rooms: [{ id: 'R1', cap: 40 }], slots: wk.slice(0, 1), classes: [cls('a', { name: 'A' }), cls('b', { name: 'B', teacher: 't2' })] });
  const r3 = TS.solve(inp3); assert.strictEqual(r3.unplaced.length, 1); assert.match(r3.unplaced[0].reasons.join(' '), /rooms that hold 20 students are already taken/);
});
test('avoidSlots (an objection) is respected', () => {
  const inp = base({ classes: [cls('a', { avoidSlots: ['Mon-am', 'Mon-pm', 'Tue-am'] })] }); const r = TS.solve(inp); valid(inp, r);
  assert.strictEqual(r.assignments.a.slot, 'Tue-pm');
});
test('block-mode classes go off campus when no room fits', () => {
  const inp = base({ slots: [{ id: 'wk1', mode: 'block', label: 'Week 1' }], rooms: [{ id: 'R1', cap: 10 }], classes: [cls('res', { mode: 'block', size: 30 })] });
  const r = TS.solve(inp); valid(inp, r); assert.strictEqual(r.assignments.res.room, TS.OFF);
});
test('the same seed gives the same timetable', () => {
  const studs = n => Array.from({ length: n }, (_, i) => 's' + i);
  const mk = () => base({ classes: [cls('a', { students: studs(10) }), cls('b', { students: studs(10), teacher: 't2' }), cls('c', { students: ['s1', 'x'], retakers: ['s1'] }), cls('d', { teacher: 't2' })] });
  const a = TS.solve(mk()), b = TS.solve(mk());
  assert.deepStrictEqual(a.assignments, b.assignments); assert.deepStrictEqual(a.score, b.score);
});
test('a retaker clash is avoided when possible', () => {
  const inp = base({ slots: wk.slice(0, 2), classes: [cls('a', { students: ['r', 'p'] }), cls('b', { students: ['r', 'q'], retakers: ['r'], teacher: 't2' })] });
  const r = TS.solve(inp); assert.strictEqual(r.clashes.length, 0); assert.notStrictEqual(r.assignments.a.slot, r.assignments.b.slot);
});
test('a retaker clash that cannot be avoided is minimised and reported', () => {
  /* one slot only, two classes share a retaker: a soft clash is allowed, and reported */
  const inp = base({ slots: wk.slice(0, 1), classes: [cls('a', { students: ['r', 'p'] }), cls('b', { students: ['r', 'q'], retakers: ['r'], teacher: 't2' })] });
  const r = TS.solve(inp); valid(inp, r); assert.strictEqual(r.unplaced.length, 0);
  assert.deepStrictEqual(r.clashes, [{ student: 'r', classes: ['a', 'b'], slot: 'Mon-am' }]);
  /* two slots, three classes all sharing a retaker: at least one clash, and exactly one */
  const inp2 = base({ slots: wk.slice(0, 2), rooms: [{ id: 'R1', cap: 40 }, { id: 'R2', cap: 40 }, { id: 'R3', cap: 40 }],
    teachers: ['t1', 't2', 't3'].map(id => ({ id, avail: yes(['Mon-am', 'Mon-pm']) })),
    classes: [cls('a', { students: ['r'] }), cls('b', { students: ['r'], retakers: ['r'], teacher: 't2' }), cls('c', { students: ['r'], retakers: ['r'], teacher: 't3' })] });
  assert.strictEqual(TS.solve(inp2).clashes.length, 1);
});
test('check() finds hard violations', () => {
  const inp = base({ classes: [cls('a', { students: ['s'] }), cls('b', { students: ['s'], teacher: 't2' })] });
  const v = TS.check(inp, { a: { slot: 'Mon-am', room: 'R1', teacher: 't1' }, b: { slot: 'Mon-am', room: 'R1', teacher: 't2' } });
  assert.ok(v.some(x => /booked twice/.test(x)) && v.some(x => /share regular students/.test(x)), v.join(' | '));
});

/* 16 Nov 2026 — overlapping slots: a block week shares real time with the weekly slots of that week */
const wkB = [...wk, { id: 'blk', mode: 'block', label: 'Week of 8 March', overlaps: wk.map(s => s.id) }];
test('a block week blocks its teacher for the weekly slots of that week', () => {
  const inp = base({ slots: wkB, teachers: [{ id: 't1', name: 'Dr One', avail: yes(wkB.map(s => s.id)) }],
    classes: [cls('res', { mode: 'block', pinned: { slot: 'blk' } }), cls('wk')] });
  const r = TS.solve(inp); valid(inp, r);
  assert.strictEqual(r.assignments.res.slot, 'blk'); assert.strictEqual(r.unplaced.length, 1); assert.strictEqual(r.unplaced[0].classId, 'wk');
  assert.match(r.unplaced[0].reasons[0], /Dr One teaches both res and wk, and every possible time of one overlaps/);
  assert.ok(r.stats.nodes < 50, 'the impossible pair is settled before the search: ' + r.stats.nodes + ' nodes');
  /* a class whose teacher the solver chooses gets the time-by-time reason */
  const inp2 = base({ slots: wkB, teachers: [{ id: 't1', name: 'Dr One', avail: yes(wkB.map(s => s.id)) }],
    classes: [cls('res', { name: 'Residency', mode: 'block', pinned: { slot: 'blk' } }), cls('wk', { teacher: null, candidates: ['t1'] })] });
  const r2 = TS.solve(inp2); valid(inp2, r2); assert.strictEqual(r2.unplaced[0].classId, 'wk');
  assert.match(r2.unplaced[0].reasons.join(' '), /Mon-am: Dr One teaches Residency in Week of 8 March, which takes in this time/);
});
test('a block week blocks its room for the weekly slots of that week', () => {
  const inp = base({ slots: wkB, rooms: [{ id: 'R1', cap: 40 }], classes: [cls('res', { mode: 'block', pinned: { slot: 'blk', room: 'R1' } }), cls('wk', { teacher: 't2' })] });
  const r = TS.solve(inp); valid(inp, r);
  assert.strictEqual(r.unplaced.length, 1); assert.match(r.unplaced[0].reasons.join(' '), /rooms that hold 20 students are already taken/);
  /* with a second room the weekly class is placed, in the other room */
  const inp2 = base({ slots: wkB, classes: [cls('res', { mode: 'block', pinned: { slot: 'blk', room: 'R1' } }), cls('wk', { teacher: 't2' })] });
  const r2 = TS.solve(inp2); valid(inp2, r2); assert.strictEqual(r2.assignments.wk.room, 'R2');
});
test('a regular student is never in two overlapping slots; check() names overlaps', () => {
  const sl = [{ id: 'a9', mode: 'w3', day: 'Mon', overlaps: ['b10'] }, { id: 'b10', mode: 'w2', day: 'Mon' }, { id: 'c14', mode: 'w2', day: 'Mon' }];
  const inp = base({ slots: sl, teachers: [{ id: 't1', avail: yes(['a9', 'b10', 'c14']) }, { id: 't2', avail: yes(['a9', 'b10', 'c14']) }],
    classes: [cls('long', { mode: 'w3', students: ['s'], pinned: { slot: 'a9' } }), cls('short', { mode: 'w2', students: ['s'], teacher: 't2' })] });
  const r = TS.solve(inp); valid(inp, r); assert.strictEqual(r.assignments.short.slot, 'c14');
  const v = TS.check(inp, { long: { slot: 'a9', room: 'R1', teacher: 't1' }, short: { slot: 'b10', room: 'R1', teacher: 't1' } });
  assert.ok(v.some(x => /R1 is booked at a9 and at b10, which overlap/.test(x)) && v.some(x => /teaches at a9 and at b10/.test(x)) && v.some(x => /which overlap\.$/.test(x)), v.join(' | '));
});
test('modeLabel names the kind of time in the reasons', () => {
  const inp = base({ slots: [{ id: 'x', mode: 'w2', modeLabel: '2-hour weekly' }], teachers: [{ id: 't1', name: 'Dr X', avail: { x: 'n' } }], classes: [cls('a', { mode: 'w2' })] });
  assert.match(TS.solve(inp).unplaced[0].reasons[0], /every remaining 2-hour weekly time/);
});

/* ---------- the demo school ---------- */
global.window = {}; require(path.join(__dirname, 'data.js'));
const S = window.SCHOOL, P = S.planning;
function demoInput(seed) {
  const fixedLoad = {};
  const slots = [...P.slots.weekly.map(s => ({ id: s.id, mode: 'weekly', day: s.day, label: s.id })), ...P.slots.weekend.map(s => ({ id: s.id, mode: 'weekend', day: s.day, label: s.id })), ...P.slots.block.map(s => ({ id: s.id, mode: 'block', label: s.label, overlaps: P.slots.weekly.map(w => w.id) }))];
  const classes = P.classes.map(k => { const s = P.seed[k.id], keep = s.prof && (s.profStatus === 'accepted' || s.profStatus === 'invited');
    if (keep) fixedLoad[s.prof] = (fixedLoad[s.prof] || 0) + k.hours;
    return { id: k.id, name: k.title + (k.group ? ' ' + k.group : ''), mode: k.mode, size: k.size, lab: k.lab, hours: k.hours, students: k.students, retakers: k.retakeIds,
      teacher: keep ? s.prof : null, candidates: k.cand.filter(f => !(s.profStatus === 'declined' && f === s.prof)), pinned: {} }; });
  const teachers = S.faculty.map(f => ({ id: f.id, name: f.name, avail: P.avail[f.id], maxPerDay: 2, maxHours: Math.max(f.contractHours, fixedLoad[f.id] || 0) }));
  return { slots, rooms: P.rooms.map(r => ({ id: r.id, cap: r.cap, lab: !!r.lab })), teachers, classes, weights: {}, seed };
}
let demo;
test('demo data: zero hard violations, no regular student clash, under one second', () => {
  const inp = demoInput(1); const t = Date.now(); demo = TS.solve(inp); const ms = Date.now() - t;
  assert.deepStrictEqual(TS.check(inp, demo.assignments), []);
  const P2 = P.classes.length;
  console.log(`     ${Object.keys(demo.assignments).length} of ${P2} placed · ${demo.unplaced.length} unplaced · ${demo.clashes.length} retaker double bookings (${demo.score.counts.studentsWithClash} students) · ${demo.score.counts.ifNeeded} in an 'if needed' hour · ${demo.score.counts.roomsUsed} rooms · score ${demo.score.total} · ${ms} ms · ${demo.stats.iterations} iterations · ${demo.stats.nodes} nodes (${demo.stats.backtrack})`);
  demo.unplaced.forEach(u => console.log('     unplaced ' + u.classId + ': ' + u.reasons.join(' / ')));
  assert.ok(ms < 1000, ms + ' ms');
  /* a remaining clash may only involve a retaker */
  demo.clashes.forEach(c => assert.ok(c.classes.some(id => P.classes.find(k => k.id === id).retakeIds.includes(c.student)), 'regular student clash ' + JSON.stringify(c)));
  /* what cannot be placed is said in words: in the demo, teachers out of contract hours */
  assert.ok(demo.unplaced.length <= 3, 'too many unplaced');
  /* (16 Nov 2026: with block weeks overlapping their week's weekly slots, a teacher who has a
     residency and a weekly class cannot keep both, and the page says so) */
  demo.unplaced.forEach(u => assert.ok(u.reasons.length && /contract hours|every possible time of one overlaps/.test(u.reasons[0]), u.reasons.join(' ')));
  assert.strictEqual(demo.score.counts.studentsWithClash, 0);
});
test('demo data: same seed, same answer; another seed, still valid', () => {
  assert.deepStrictEqual(TS.solve(demoInput(1)).assignments, demo.assignments);
  const inp = demoInput(99), r = TS.solve(inp); assert.deepStrictEqual(TS.check(inp, r.assignments), []);
});
test('demo data: an objection moves only that class when the rest is pinned', () => {
  const inp = demoInput(1), first = demo.assignments, victim = inp.classes.find(c => c.mode === 'weekly' && c.teacher).id;
  inp.classes.forEach(c => { if (!first[c.id]) return; if (c.id !== victim) c.pinned = Object.assign({}, first[c.id]); else c.avoidSlots = [first[c.id].slot]; });
  const r = TS.solve(inp); assert.deepStrictEqual(TS.check(inp, r.assignments), []);
  const moved = Object.keys(r.assignments).filter(id => !first[id] || r.assignments[id].slot !== first[id].slot);
  assert.deepStrictEqual(moved, [victim]);
});
test('prefer keeps a class where it was unless moving is worth it', () => {
  const inp = base({ classes: [cls('a', { prefer: { slot: 'Tue-pm', room: 'R2' } })] }); const r = TS.solve(inp);
  assert.deepStrictEqual([r.assignments.a.slot, r.assignments.a.room], ['Tue-pm', 'R2']);
  const inp2 = base({ teachers: [{ id: 't1', avail: { 'Mon-am': 'y', 'Mon-pm': 'y', 'Tue-am': 'y', 'Tue-pm': 'm' } }], weights: { keep: 1 }, classes: [cls('a', { prefer: { slot: 'Tue-pm' } })] });
  assert.notStrictEqual(TS.solve(inp2).assignments.a.slot, 'Tue-pm');
});
console.log(`\n${passed} passed${process.exitCode ? ', some FAILED' : ''}`);
