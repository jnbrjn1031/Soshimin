// Writes SEEDS.md, the 운명 번호표: lives n 운명 번호 with every choice left to 「흐름에 맡긴다」 and lists notable ones.
//   node tests/seeds.cjs [n = 2000] [out = SEEDS.md]     (about 0.7 s a life, spread over the CPU cores)
// The seeds are hash32('운명표:' + i), so the same n gives the same table until the rules change.
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const path = require('path'), os = require('os'), fs = require('fs');

function liveRange(from, to) {
  const { load } = require('./load.cjs');
  const G = load(); G.ctx.console = { log() {}, warn() {}, error: console.error };
  const { STATE, SIM, RNG, HARNESS, REPORT, DATA } = G;
  const rows = [];
  for (let i = from; i < to; i++) {
    const seed = RNG.hash32('운명표:' + i), s = STATE.create(seed), p = s.person, f = s.family;
    const born = { place: `${p.birthplace.sido} ${p.birthplace.sgg}`, q: f.quintile, single: !!f.single, orphan: !!f.orphan, multi: !!f.multicultural,
      sibs: s.people.filter(x => x.role === 'sibling').length, pet: s.people.some(x => x.role === 'pet'), tal: Object.assign({}, p.talents) };
    for (let g = 0; s.person.alive && g < 1700; g++) {
      SIM.tickMonth(s);
      for (let n = 0; s.pending.length && n < 30; n++) { const it = s.pending.shift(); if (it.kind !== 'death') HARNESS.AUTO[it.kind](s, it); }
    }
    const o = REPORT.obituary(s), e = s.edu, A = s.arts;
    rows.push({ seed: RNG.fmtSeed(seed), name: o.name, sex: p.sex, born, hs: e.hs ? DATA.HS_TYPES[e.hs.type].name : null, uni: e.uni ? `${e.uni.name} ${e.uni.dept}` : null,
      job: o.job, age: o.age, cause: o.cause, peak: Math.max(0, ...s.money.hist.map(h => h.nw)), kids: s.love.births.length, married: !!s.love.first,
      arts: A && A.ever ? { field: DATA.ARTS.fields[A.field].name, first: !!A.firstEver, leap: !!A.leapEver, log: A.log.map(x => x.t) } : null,
      prison: !!(s.down && s.down.ever.prison), homeless: !!(s.down && s.down.ever.homeless) });
  }
  return rows;
}

const won = v => v >= 10000 ? (Math.round(v / 1000) / 10).toLocaleString('ko-KR') + '억' : Math.round(v).toLocaleString('ko-KR') + '만';
const home = r => {
  const b = r.born, x = [b.place, b.orphan ? '보호 아동' : `${b.q}분위`];
  if (b.single) x.push('한부모'); if (b.multi) x.push('다문화'); if (b.sibs) x.push(`형제 ${b.sibs}`); if (b.pet) x.push('반려동물');
  return x.join(' · ');
};
// the arts path in a few stations: where it began, then the contract, debut or 등단 and the hit
const artsLine = a => {
  const start = a.log[0].replace(/^.+ · /, '').replace(/에 들어섬$/, '');
  const marks = a.log.slice(1).filter(t => /입단|연습생|데뷔|등단|^첫 |히트작|정상의 시간/.test(t)).slice(0, 3);
  return [start, ...marks].join(' → ');
};
const course = r => {
  const x = [];
  if (r.hs && r.hs !== '일반고') x.push(r.hs);
  if (r.uni) x.push(r.uni);
  if (r.arts && r.arts.first) x.push(artsLine(r.arts));
  if (r.job !== '—' && r.job !== '학생') x.push(r.job);
  if (r.prison) x.push('교정시설을 거침');
  if (r.homeless) x.push('집을 잃었다 다시 얻음');
  return x.join(' → ') || (r.age < 7 ? '—' : r.age < 13 ? '초등학생' : r.age < 16 ? '중학생' : '—');
};
const end = r => r.age < 20 ? `${r.age}세 · ${r.cause}` : `${r.age}세 · ${r.cause}${r.married ? '' : ' · 미혼'}${r.kids ? ` · 자녀 ${r.kids}` : ''} · 최고 순자산 ${won(r.peak)}`;

function table(R) {
  const used = new Set();
  const pick = (f, n, sort) => { let L = R.filter(r => !used.has(r.seed) && f(r)); if (sort) L.sort(sort); L = L.slice(0, n); L.forEach(r => used.add(r.seed)); return L; };
  const sec = (title, note, L) => !L.length ? '' : `## ${title}\n\n${note ? note + '\n\n' : ''}| 운명 번호 | 이름 | 태어난 곳 · 가정 | 재능 (공·운·예·표·관) | 흐름에 맡기면 | 마지막 |\n|---|---|---|---|---|---|\n` +
    L.map(r => { const t = r.born.tal; return `| \`${r.seed}\` | ${r.name} (${r.sex === 'M' ? '남' : '여'}) | ${home(r)} | ${t.study}·${t.sport}·${t.art}·${t.expr}·${t.rel} | ${course(r)} | ${end(r)} |`; }).join('\n') + '\n\n';
  const arts = re => r => r.arts && r.arts.first && re.test(r.arts.field);
  let md = `# 운명 번호표

게임 첫 화면의 **「운명 번호로 태어나기」**에 아래 8자리 번호를 넣으면 그 삶으로 태어납니다.

- **태어난 곳 · 가정 · 재능**은 번호가 정합니다. 같은 번호는 언제나 같은 가정, 같은 재능으로 태어납니다.
- **흐름에 맡기면**은 모든 선택을 「흐름에 맡긴다」로 두고 끝까지 살았을 때의 모습입니다. 직접 고르거나 「활동」을 시작하면 그때부터 길이 달라집니다.
- 재능은 공부 · 운동 · 예술 · 표현 · 관계 순서이며 0–50입니다 (평균 25). 게임 안에서는 다섯 살 무렵부터 조금씩 드러납니다.
- 분위는 가구소득 5분위입니다 (1분위가 가장 적고 5분위가 가장 많음). 순자산은 만 원 단위입니다.
- 운명 번호 ${R.length.toLocaleString('ko-KR')}개를 살려 보고 골랐습니다 (저장 형식 12). 규칙이 바뀌면 「흐름에 맡기면」은 달라질 수 있습니다. 다시 만들기: \`node tests/seeds.cjs\`

`;
  md += sec('의사가 되는 운명', '의예과 합격선은 공부 48 · 99. 재능 50에 노력이 거의 끝까지 차야 넘습니다.', pick(r => /의예과/.test(r.uni || '') && !/치의/.test(r.uni), 4));
  md += sec('서울대', '서울대 합격선은 공부 44 · 92.', pick(r => /^서울대/.test(r.uni || ''), 6, (a, b) => b.born.tal.study - a.born.tal.study));
  md += sec('영재학교 · 과학고', '', pick(r => /영재|과학/.test(r.hs || ''), 5));
  md += sec('프로 선수', '프로 구단 입단선은 운동 42 · 90, 실업팀은 36 · 82.', pick(arts(/스포츠/), 6, (a, b) => b.peak - a.peak));
  md += sec('무대 위의 삶 (아이돌 · 배우 · 음악)', '', pick(arts(/아이돌|연기|음악/), 6, (a, b) => b.peak - a.peak));
  md += sec('그리고 쓰는 삶 (미술 · 웹툰 · 문학 · 영상)', '', pick(arts(/미술|웹툰|문학|영상/), 7, (a, b) => (b.arts.leap - a.arts.leap) || b.peak - a.peak));
  md += sec('큰 부자', '최고 순자산 순서.', pick(r => r.peak > 300000, 6, (a, b) => b.peak - a.peak));
  md += sec('공무원 · 소방관 · 경찰관', '', [...pick(r => /7급 공무원/.test(r.job), 2), ...pick(r => /9급 공무원/.test(r.job), 2), ...pick(r => /소방관|경찰관/.test(r.job), 2)]);
  md += sec('재능이 고른 삶', '다섯 재능이 모두 33 이상.', pick(r => Math.min(...Object.values(r.born.tal)) >= 33, 4));
  md += sec('100세를 넘기는 삶', '', pick(r => r.age >= 100, 5, (a, b) => b.age - a.age));
  md += sec('일찍 떠나는 삶', '마흔이 되기 전에 끝나는 삶. 갓난아기 때의 일은 번호로 정해지고, 그 뒤의 사고와 병은 고르는 길에 따라 비껴가기도 합니다.',
    [...pick(r => r.age < 1, 2), ...pick(r => r.age >= 1 && r.age < 13, 3), ...pick(r => r.age >= 13 && r.age < 20, 3), ...pick(r => r.age >= 20 && r.age < 30, 3), ...pick(r => r.age >= 30 && r.age < 40, 2)].sort((a, b) => a.age - b.age));
  md += sec('다문화 · 한부모 · 보호 아동', '', [...pick(r => r.born.multi && /^(서울대|연세대|고려대|성균관대|한양대)/.test(r.uni || ''), 2), ...pick(r => r.born.single && r.peak > 100000, 2), ...pick(r => r.born.orphan, 1)]);
  md += sec('굴곡이 큰 삶', '노숙이나 교정시설을 거친 삶. 다시 일어서는 길도 있습니다.', [...pick(r => r.homeless, 3), ...pick(r => r.prison, 2)]);
  md += sec('평범한 소시민', '3분위 가정, 다섯 재능이 모두 20–30. 가장 흔한 한 생.', pick(r => r.born.q === 3 && !r.born.single && !r.born.multi && Object.values(r.born.tal).every(v => v >= 20 && v <= 30) && r.age >= 75, 6));
  return md.trimEnd() + '\n';
}

if (isMainThread) {
  const n = +(process.argv[2] || 2000), out = path.resolve(process.argv[3] || path.join(__dirname, '..', 'SEEDS.md'));
  const k = Math.max(1, Math.min(os.cpus().length, 8)), step = Math.ceil(n / k);
  Promise.all(Array.from({ length: k }, (_, j) => new Promise((ok, bad) => {
    const w = new Worker(__filename, { workerData: [j * step, Math.min(n, (j + 1) * step)] });
    w.on('message', ok); w.on('error', bad);
  }))).then(parts => {
    fs.writeFileSync(out, table(parts.flat()));
    console.log(`wrote ${path.relative(process.cwd(), out)} from ${n} lives`);
  });
} else parentPort.postMessage(liveRange(...workerData));
