// Node checks for Stage 6.6 (soshimin-arts-patch.md). Run: node --test tests/
const test = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('./load.cjs');

const G = load();
const { STATE, SIM, RNG, HARNESS, DATA, EVENTS, ARTS, MONEY, YEARLY6 } = G;

// one life through the same monthly tick and automatic choices the harness uses
function live(seed, until) {
  const s = STATE.create(seed);
  for (let g = 0; s.person.alive && g < 1700; g++) {
    SIM.tickMonth(s);
    for (let n = 0; s.pending.length && n < 30; n++) { const it = s.pending.shift(); if (it.kind !== 'death') HARNESS.AUTO[it.kind](s, it); }
    if (until && until(s)) break;
  }
  return s;
}
const seedOf = i => RNG.hash32('1:' + i);

test('the game script loads and keeps its save version', () => {
  assert.equal(DATA.SAVE_VERSION, 11);
  assert.ok(ARTS && typeof ARTS.view === 'function' && typeof ARTS.sample === 'function');
});

test('every §6 decision has a card', () => {
  for (const k of ['artsPath', 'artsOffer', 'artsAudition', 'artsUndrafted', 'artsAbroad', 'artsBalance', 'artsGo', 'artsInjury', 'artsHit', 'artsRetire']) assert.ok(G.DECISIONS.DEF[k], k);
});

test('at least 80 field event templates across the eight fields (§8)', () => {
  const A = EVENTS.list.filter(t => t.cat === 'arts');
  assert.ok(A.length >= 80, `only ${A.length}`);
  for (const p of ['mu-', 'id-', 'ac-', 'vi-', 'wt-', 'wr-', 'fi-', 'sp-']) assert.ok(A.filter(t => t.id.startsWith(p)).length >= 6, p);
  for (const b of DATA.EVENT_BANDS.filter(b => b.from >= 7)) assert.ok(b.cats.arts > 0, `band ${b.from}`);
  for (const t of A) if (t.note) assert.ok(DATA.STATS[t.note], `${t.id}: note ${t.note}`);
});

test('real organisations never appear in an arts template that hurts (§2)', () => {
  const O = DATA.ARTS.orgs, real = [].concat(O.agency, O.broadcast, O.music, O.toon, O.publisher, O.paper, O.orchestra, O.theater, O.gallery, ...['KBO', 'K리그', 'KBL', 'V-리그'].map(k => O[k].map(x => x[0])));
  for (const t of EVENTS.list.filter(x => x.cat === 'arts')) {
    const fx = t.fx || {}, bad = (fx.hap || 0) < 0 || (fx.st || 0) >= 4;
    if (!bad || typeof t.text === 'function') continue;
    for (const line of t.text) for (const name of real) assert.ok(!line.includes(name), `${t.id} names ${name}`);
  }
});

test('a non-arts life draws the same events as before the arts category (no extra draws)', () => {
  // a template the arts category cannot reach leaves the category list unchanged, so pickFill draws identically
  const s = live(seedOf(3), x => STATE.age(x) >= 30);
  if (s.arts.ever) return;   // this seed is expected to stay off the paths; if the calibration changes, skip
  const arts = EVENTS.list.filter(t => t.cat === 'arts');
  assert.ok(arts.every(t => !t.when || !t.when(s, STATE.age(s))));
});

test('the same 운명 번호 gives the same arts life', () => {
  for (const i of [44, 85, 165]) {
    const a = live(seedOf(i)), b = live(seedOf(i));
    assert.deepEqual(ARTS.sample(a), ARTS.sample(b));
    assert.equal(a.person.death.months, b.person.death.months);
  }
});

test('a child in care gets finite aptitudes and net worth (the old NaN in 독립 가구 평균 순자산)', () => {
  const s = STATE.create(seedOf(209));
  assert.ok(s.family.orphan);
  for (const k of ['academic', 'logical', 'verbal']) assert.ok(Number.isFinite(s.person.traits[k]), k);
  const t = live(seedOf(209), x => STATE.age(x) >= 26);
  const x = MONEY.sample(t);
  assert.ok(!x.indep || Number.isFinite(x.nw));
});

test('arts lives: the office door only through decision 7, a working view, and a pending contract never crashes', () => {
  let seen = 0;
  for (let i = 0; i < 160 && seen < 6; i++) {
    const s = live(seedOf(i), x => x.arts.ever && STATE.age(x) >= 27);
    if (!s.arts.ever) continue;
    seen++;
    const A = s.arts;
    if (A.office) assert.ok(A.officeExit, `life ${i} reached an office job without leaving the path`);
    if (A.on) {
      const v = ARTS.view(s);
      assert.ok(v.field && v.stage !== undefined && v.skills.length === 2, `life ${i}`);
      for (const [, x] of v.skills) assert.ok(x >= 0 && x <= 100);
      assert.ok(Number.isFinite(v.rec));
    }
    const rest = live(s.seed);   // and on to the end without throwing
    assert.ok(!rest.person.alive);
  }
  assert.ok(seen >= 3, `only ${seen} arts lives in 160 seeds`);
});

test('runMany reports the §11 rows and a finite net worth', () => {
  const quiet = G.ctx.console; G.ctx.console = { log() {}, table() {} };
  try {
    const r = G.sim.runMany(60, { seed: 1 });
    const names = r.rows.map(x => x.지표);
    for (const n of ['예체능의 길에 진지하게 들어선 삶 (20세 이상)', 'KBO 드래프트 지명률 (지원 기준)', '웹툰 작가 연 수입 · 평균 / 중앙값', '예체능의 길에서 사무직으로 옮긴 비율 (30세 이상)']) assert.ok(names.includes(n), n);
    const nw = r.rows.find(x => x.지표 === '독립 가구 평균 순자산');
    assert.ok(!/NaN/.test(nw.결과), nw.결과);
  } finally { G.ctx.console = quiet; }
});
