// Node checks for the talent + effort system (TALENT). Run: node --test tests/
const test = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('./load.cjs');

const G = load();
const { STATE, SIM, RNG, HARNESS, DATA, TALENT, ADMISSIONS, JOBS } = G;
G.ctx.console = { log() {}, warn() {}, error: console.error };

function live(seed, until) {
  const s = STATE.create(seed);
  for (let g = 0; s.person.alive && g < 1700; g++) {
    SIM.tickMonth(s);
    for (let n = 0; s.pending.length && n < 30; n++) { const it = s.pending.shift(); if (it.kind !== 'death') HARNESS.AUTO[it.kind](s, it); }
    if (until && until(s)) break;
  }
  return s;
}
const seedOf = i => RNG.hash32('talent:' + i);

test('five talents, 0–50, on a bell curve: most at 20–30, 45 and above rare', () => {
  const all = [];
  for (let i = 0; i < 2000; i++) { const s = STATE.create(seedOf(i)); for (const k of TALENT.KEYS) { const t = s.person.talents[k]; assert.ok(Number.isInteger(t) && t >= 0 && t <= 50, `${k}=${t}`); all.push(t); } }
  const mid = all.filter(t => t >= 20 && t <= 30).length / all.length, high = all.filter(t => t >= 45).length / all.length;
  assert.ok(mid > 0.45, `20–30: ${mid}`);
  assert.ok(high > 0 && high < 0.015, `45+: ${high}`);
  // the legacy aptitudes read twice the talent
  const s = STATE.create(seedOf(1));
  assert.equal(s.person.traits.academic, s.person.talents.study * 2);
  assert.equal(s.person.traits.social, s.person.talents.rel * 2);
});

test('talents are hidden at birth and revealed step by step from about five', () => {
  const s = live(seedOf(3), s => STATE.age(s) >= 4);
  for (const k of TALENT.KEYS) assert.equal(s.talent.rev[k], 0, k);
  assert.equal(TALENT.known(s, 'study').word, '아직 모른다');
  let wide = null;
  for (let g = 0; g < 12 * 14 && s.person.alive; g++) {
    SIM.tickMonth(s);
    for (let n = 0; s.pending.length && n < 30; n++) { const it = s.pending.shift(); if (it.kind !== 'death') HARNESS.AUTO[it.kind](s, it); }
    const kn = TALENT.known(s, 'study');
    if (kn.step === 2 && !wide) wide = kn;
    if (kn.step) assert.ok(kn.lo <= s.person.talents.study && s.person.talents.study <= kn.hi, 'the range holds the number');
  }
  assert.ok(wide && wide.hi - wide.lo === 16, 'a wide range first');
  for (const k of TALENT.KEYS) assert.equal(s.talent.rev[k], 4, `${k} exact by 18`);
  assert.ok(s.log.some(e => /재능/.test(e.text || '')), 'reveals reach the log');
});

test('effort grows with focus, faster with means, fades when neglected', () => {
  const a = STATE.create(seedOf(5)), b = STATE.create(seedOf(5));
  a.family.quintile = 1; a.person.env.privateEd = 20; a.person.place = Object.assign({}, a.person.place, { type: '농어촌' });
  b.family.quintile = 5; b.person.env.privateEd = 90; b.person.place = Object.assign({}, b.person.place, { type: '대도시' });
  assert.ok(TALENT.paceOf(b, 'study') > TALENT.paceOf(a, 'study') * 1.3);
  const s = live(seedOf(6), s => STATE.age(s) >= 10);
  const e0 = s.talent.eff.art, e1 = s.talent.eff.study;
  s.focus.alloc = { study: 5 };
  for (let g = 0; g < 24; g++) { s.focusNext = { study: 5 }; SIM.tickMonth(s); s.pending.length = 0; }
  assert.ok(s.talent.eff.study > e1 + 10, `study effort ${e1} → ${s.talent.eff.study}`);
  assert.ok(s.talent.eff.art < e0 || e0 === 0, 'art fades without points');
  assert.ok(s.talent.eff.study <= 50);
});

test('gates are fixed: at or above the cutoff and the floor passes, below fails, no draw', () => {
  const s = live(seedOf(7), s => STATE.age(s) >= 17);
  const g = TALENT.gate('study', 40, 90, 'test');
  s.person.talents.study = 44; s.talent.eff.study = 46;
  assert.equal(TALENT.score(s, 'study'), 90);
  assert.ok(TALENT.meets(s, g));
  s.talent.eff.study = 45.4;   // rounds to 45: one short
  assert.ok(!TALENT.meets(s, g));
  s.person.talents.study = 39; s.talent.eff.study = 50;   // the score is there, the talent is not
  assert.ok(!TALENT.meets(s, g));
  // the user's anchors
  const snu = ADMISSIONS.programs().find(p => p.uni === '서울대' && p.mk === 'biz'), md = ADMISSIONS.programs().find(p => p.mk === 'md');
  assert.equal(JSON.stringify(TALENT.progGates(snu).map(x => [x.k, x.floor, x.cut])), JSON.stringify([['study', 44, 92]]));
  assert.equal(JSON.stringify(TALENT.progGates(md).map(x => [x.k, x.floor, x.cut])), JSON.stringify([['study', 48, 99]]));
  assert.equal(`${TALENT.EXAM['9n'].floor}/${TALENT.EXAM['9n'].cut}`, '25/70');
  assert.equal(`${TALENT.ARTS.pro.k}/${TALENT.ARTS.pro.floor}/${TALENT.ARTS.pro.cut}`, 'sport/42/90');
  s.person.talents.study = 44; s.talent.eff.study = 48;
  const pr = ADMISSIONS.profile(s);
  for (let i = 0; i < 20; i++) assert.equal(ADMISSIONS.chance(pr, snu), 1);
  s.talent.eff.study = 47;
  assert.equal(ADMISSIONS.chance(ADMISSIONS.profile(s), snu), 0);
  // exams read the same gate
  s.person.talents.study = 25; s.talent.eff.study = 45;
  assert.equal(JOBS.examChance(s, '9n'), 1);
  s.person.talents.study = 24;
  assert.equal(JOBS.examChance(s, '9n'), 0);
});

test('effort is frozen at the first job and stops moving the gates', () => {
  const s = live(seedOf(9), s => !!s.career.firstJob);
  assert.ok(s.career.firstJob, 'a first job');
  assert.ok(s.talent.frozen, 'frozen');
  const before = TALENT.score(s, 'study');
  s.talent.eff.study = 0;
  assert.equal(TALENT.score(s, 'study'), before);
  assert.equal(TALENT.nextGate(s, 'study'), null);
});

test('an older save gains talents and effort', () => {
  const s = live(seedOf(11), s => STATE.age(s) >= 20);
  delete s.talent; delete s.person.talents; s.prep = { list: [] };
  TALENT.migrate(s);
  assert.ok(s.talent && s.person.talents && !s.prep);
  for (const k of TALENT.KEYS) { assert.equal(s.talent.rev[k], 4); assert.ok(Number.isFinite(TALENT.score(s, k))); }
  SIM.tickMonth(s);
});

test('활동: up to four at once, one turn a year, effort while running, a bonus and a record at the end', () => {
  const s = live(seedOf(13), s => STATE.age(s) >= 16 && s.edu.stage === 'high');
  assert.equal(TALENT.stageOf(s), 'high');
  const keys = TALENT.actAvail(s).map(d => d.key);
  for (const k of ['naesinH', 'suneung', 'nonsul', 'record']) assert.ok(keys.includes(k), k);
  for (const k of ['naesinH', 'suneung', 'nonsul', 'record']) assert.ok(TALENT.actStart(s, k), k);
  assert.ok(!TALENT.actStart(s, 'silgiH'), 'a fifth is refused');
  for (const d of TALENT.ACTS) assert.ok(d.turns >= 2 && d.turns <= 5, d.key);
  // running activities count as focus points on their talent
  assert.ok(TALENT.points(s).study >= 2 * TALENT.ACT_PTS);
  const e0 = s.talent.eff.expr;
  for (let g = 0; g < 24; g++) { SIM.tickMonth(s); s.pending.length = 0; }
  const done = s.acts.done.find(r => r.key === 'nonsul');
  assert.ok(done && done.ok && done.turns === 2, 'the two-turn 논술 finished after two years');
  assert.ok(s.talent.eff.expr > e0, 'expr effort grew');
  assert.ok(s.acts.list.some(a => a.key === 'suneung' && a.m === 24), 'the three-turn 수능 is two turns in');
  // leaving high school stops the high-school activities
  for (let g = 0; g < 18 && TALENT.stageOf(s) === 'high'; g++) { SIM.tickMonth(s); s.pending.length = 0; }
  SIM.tickMonth(s);   // the activity hook runs before ADMISSIONS changes the stage, so it notices a month later
  assert.ok(!s.acts.list.some(a => a.key === 'naesinH'), '내신 stops with high school');
});

test('automatic lives start no 활동 (the calibration stays where it was)', () => {
  const s = live(seedOf(14), s => STATE.age(s) >= 25);
  assert.equal(s.acts.list.length + s.acts.done.length, 0);
});

test('every university is real (no 가상 names)', () => {
  assert.equal(DATA.UNIVERSITIES.filter(u => u.fic).length, 0);
  assert.equal(ADMISSIONS.programs().filter(p => /가상/.test(p.uni)).length, 0);
});

test('진로 questions at 초4 and 중2 (and 고1 계열) start the activities the player picks', () => {
  const { DECISIONS } = G;
  const s = STATE.create(seedOf(21)), seen = {};
  for (let g = 0; s.person.alive && g < 17 * 12; g++) {
    SIM.tickMonth(s);
    for (let n = 0; s.pending.length && n < 30; n++) {
      const it = s.pending.shift();
      if (it.kind === 'decision' && ['dirElem', 'dirMid', 'track'].includes(it.def)) {
        const key = it.def === 'dirElem' ? 'sport' : it.def === 'dirMid' ? 'tokmok' : it.opts.find(o => o.key === 'scieng') ? 'scieng' : it.opts[0].key;
        DECISIONS.resolve(s, it, key, 'player'); seen[it.def] = s.acts.list.map(a => a.key); continue;
      }
      if (it.kind !== 'death') HARNESS.AUTO[it.kind](s, it);
    }
  }
  assert.ok(seen.dirElem && seen.dirElem.includes('sportClub'), 'elementary: sport club');
  assert.ok(seen.dirMid && seen.dirMid.includes('tokmok'), 'middle: 특목 대비');
  assert.ok(seen.track && seen.track.includes('suneung'), 'high: 수능 준비');
  // 흐름에 맡긴 답은 활동을 시작하지 않는다
  const t = STATE.create(seedOf(22));
  for (let g = 0; t.person.alive && g < 17 * 12; g++) { SIM.tickMonth(t); for (let n = 0; t.pending.length && n < 30; n++) { const it = t.pending.shift(); if (it.kind !== 'death') HARNESS.AUTO[it.kind](t, it); } }
  assert.equal(t.acts.list.length + t.acts.done.length, 0);
  assert.ok(t.decisions.some(d => /초등 진로/.test(d.label)) && t.decisions.some(d => /중등 진로/.test(d.label)));
});
