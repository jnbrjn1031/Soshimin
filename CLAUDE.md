# 소시민 — working notes

A single-file life simulation (`소시민.html`, about 14k lines: HTML, CSS and one `<script>`). One Korean life is lived
month by month on a pixel-art road. Specs live outside this repo (main spec, visual spec, sub-prompt, prep patch);
`soshimin-arts-patch.md` (Stage 6.6, the arts and sports paths) is the one checked in here. The talent + effort system
(below) overrides the main spec's §4.10 and §5 and replaces the prep patch's 준비도 entirely.

The file name is NFD-encoded on disk. Use `ls *.html` or `tests/load.cjs` (`findHtml`) rather than typing it.

## Layout of the script

Modules are `const NAME = (() => { … })()` blocks, marked `// ===== MODULE: NAME =====`, in this order:
DATA · RNG · STATE · SIM (CAL) · NETWORK · EVENTS · YEARLY6 · DECISIONS · ADMISSIONS · JOBS · FAMILY · MONEY · HEALTH ·
DOWN · TALENT · ARTS · MEMORY · REPORT · SAVE · RENDER · SOUND · UI · HARNESS.

- Monthly work hangs off `SIM.on('month', fn, order)`; the order number decides who runs first (ARTS runs at 38.4).
- Every random draw goes through a named stream (`RNG.stream(s, 'arts')`). Adding draws to an existing stream changes
  every life after it, so new systems get their own stream. ARTS uses `arts` for outcomes and `artsChoice` for
  automatic choices.
- Decisions are `DECISIONS.DEF[key] = { title, text, options, auto, apply, note }` and are opened with
  `DECISIONS.offer(s, key, ctx)`. The harness resolves them through `auto`.
- Yearly events: `E(id, cat, [ageFrom, ageTo], weight, opts, text)` in EVENTS. A category only competes when one of
  its templates is eligible, so a category for one kind of life (like `arts`) leaves every other life's draws as before.
- Any number that is not a cited statistic is labelled 「게임 설정」 in the UI. Statistics shown to the player live in
  `DATA.STATS` (text and source).
- Real organisations appear only in neutral or happy moments. Every bad turn with an organisation uses a fictional
  one marked `· 가상`. Real people are never named.
- `DATA.SAVE_VERSION` is 11. Bump it (and add a migration in SAVE if possible) when the shape of the state changes. Saves
  from 8–10 go through `TALENT.migrate` (talents from the old traits, effort estimated by age, `s.prep` dropped).

## Talent + effort (TALENT)

- Five talents in `s.person.talents` (`study` 공부, `sport` 운동, `art` 예술, `expr` 표현, `rel` 관계), each 0–50, rolled once
  at birth from the `talent` stream: normal, mean 25, sd 8 (`DATA.TALENT_ROLL`; about half land at 20–30, 45+ is about
  0.7%, 44 marks the top 1%). The old trait names stay as twice the talent (`academic` = `logical` = 2 × study,
  `verbal` = 2 × expr, …) so events and automatic choices keep reading them.
- Reveals: `s.talent.rev[k]` goes 0 (hidden) → 1 (a word) → 2 (±8 range) → 3 (±3) → 4 (exact), on a per-life schedule
  around ages 5, 7.5, 10 and 12.5 (`plan`). Each step is a yearly event (`YEARLY6.force`, milestone key `talent`) with a
  teacher's remark, a race or a drawing. The age-11 「관심 분야」 decision brings the chosen talent's next step forward.
- Effort: `s.talent.eff[k]`, 0–50, from age 6. Each month `TALENT.feeds` maps focus points to talents (공부·학업·시험
  → study, 운동·건강 → sport, 취미·작업 → art or expr by arts field, 놀이·연애·가족 → rel, 비교과 → expr + rel …).
  Growth is `G · points · pace · (1 − (E/50)³)` with G = 0.15; a talent with under 0.3 points loses 1.2% a month.
  `pace` (0.6–1.6) is family income, 사교육 (`env.privateEd`, the 13-year-old tutoring choice) and region (a 학원 nearby);
  it never adds to the score. Effort freezes at the first job (`TALENT.freeze`, called from `JOBS.hire`); after that
  `TALENT.score` reads the frozen effort and the stats panel shows no next gate.
- Gates: `{ k, floor, cut, name }`. `TALENT.meets(s, g)` is talent ≥ floor and talent + round(effort) ≥ cut. Nothing is
  drawn at a gate. Where they are read:
  - high schools `TALENT.HS` (영재학교 42/88, 과학고 38/80, 자사고 31/70, 외고 표현 31/68, 예고 예술 27/58, 체고 운동 27/58 …)
    in `ADMISSIONS.hsChance`;
  - universities `TALENT.progGates(p)`: one gate per four-year university from its Appendix B centre (`p.uc`) through
    `ANCH` (top % → floor, cut; 서울대 44/92), 전문대 majors by their own band, 의예 48/99 · 치의예 45/94 · 약학 40/87,
    실기 majors on their field's talent at the university's own standing (no side door into a better university) plus
    a lighter 수능 gate, 사관·경찰대 add 운동 24/58. `ADMISSIONS.chance` is 0 or 1 for every 전형, so `judge` has no
    예비 draw and no 수능최저;
  - exams `TALENT.EXAM` (9급 25/70, 7급 32/80, 5급 42/91, 경찰·소방 on 운동, 임용, CPA …) in `JOBS.examChance`;
    licences `TALENT.LIC` (국가시험), `TALENT.SCHOOL` (로스쿨 38/86, 석사, 박사);
  - the first job: `TALENT.jobGate(id, s)` from `JOB_X.tier` (cut 40 + 50·tier, floor 6 + 32·tier), plus 5 for a major
    outside the job's fields and a per-field offset (`FIELD_OFF`, calibrated to Appendix C's first-year rates).
    `stageOdds` returns all ones or a 0 at 서류. Later moves use the old odds;
  - arts `TALENT.ARTS`: 프로 구단 (KBO draft and other first contracts) 운동 42/90, 실업팀 36/82 (also a footballer's
    fallback below the pros), 기획사 표현 28/62 and 40/86 (a real agency), 오케스트라 예술 42/90, 신춘문예 표현 40/88,
    방송사 PD 36/84. Team, trainee, arts-school and lesson training counts as extra focus points while at school
    (`TRAIN`), so athletes and trainees can reach these gates.
- The national standing (`ADMISSIONS.zn`, 내신, the 수능) is the 공부 score carried to its 고3 equivalent through the
  cohort's school year (`TALENT.COHORT`, measured) and read through `ANCH`, so a form's 상위 % and its gates agree; the
  수능 has no day-of luck. `ANCH`'s cut column and `COHORT` were measured with `runMany`-style scratch runs; re-measure
  them if effort rates or focus leanings change.
- Choices retuned for fixed gates (all 게임 설정): automatic study points rise with 공부 talent and in a general high
  school, with a floor of one (two in 일반고) except on an arts path; a place is ranked by its university's gate plus a
  per-life liking for the subject (`likes`); a track with fewer than three open places looks outside it; graduates hold
  out for more pay (`hopeUniv` 330, `hopeCollege` 260); the age-12 path choice rises steeply above talent 40; idol and
  acting are chosen and practised on 표현 first; arts `fadeBase` 0.075, `leave` 0.38 and `resolve` from 54 re-centre
  the path population.
- UI: the tabs are 재능 · 상태 · 돈 · 가족 · 직업 · 이력 · 기록 (기억 and 도감 tabs were removed; 도감 stays as the top-bar
  button, and memories still feed the ending). 「재능」 (the first tab, open by default) shows each talent as revealed (a hatched range until exact), effort stacked on it, and the next relevant
  cutoff as a tick (`TALENT.nextGate`: high schools, then universities, arts gates on a path, then exams and jobs). Forms
  show each gate's numbers once the talent has shown itself (`TALENT.label`) and tag rows 「합격선 이상」 or 「미달」.

## The road (RENDER)

`RENDER.Scene` is a factory. By default it returns `Scene3D`: the same road, spawning, forks, landmarks and cast as the
2D `Scene` (which it extends), drawn as flat-shaded low-poly blocks with WebGL at twice the design resolution
(`K3`) and scaled up without smoothing. The sky and the far backdrop are still the 2D pixel layer
(`drawBackground(v, true)`); particles, signpost labels and speech dots are drawn on top in design pixels.
World units are metres (x right, y up, z = `o.s − travel`); the road bends in the vertex shader (`uBend`), and
`proj()` applies the same bend for DOM labels. Roadside models live in `model3(type, v, season)` (local x runs
outward from the roadside and is mirrored for the left side) and are cached per type, variant and season. People are
built each frame by `person3` from the same `specFor` spec as the 2D sprites. Buildings whose footprints (`fp`)
overlap an earlier one are skipped. Without WebGL, or with 설정 → 길 그리기 → 2D 픽셀 (`SET.view`), the 2D `Scene` is used.
The portraits, the family panel and the ending photographs still use the 2D figure sprites.

The birth stage (UI `playStage`) is a theatre drawn by `RENDER.stage3()` (`Stage3`, same shader with `uDim` and
`uSpot` for a dark house and columns of light): the page lays the family out in `.bs-ph` placeholders and the camera is
solved each frame so the lowest row stands on the floor at their bottom edge (rows above stand on risers further back).
The curtain parts first, then the spotlights find 나, the parents, the siblings and the pet. In 2D the curtain is two CSS panels.

Clothes (`wardrobe`) belong to an era, not a week: the age band plus, for the walker, `me.era` (school stage, high-school
type, university, career status, job and employer). An adult walker keeps the style of the age at which the era began
(`eraAge`). Weather only adds layers (coat, scarf, sleeves, kids' summer shorts, umbrella), picked once per era.

## Tests and tools

```
node --test tests/*.test.cjs        # node checks (about 1 minute; talent.test.cjs covers the roll, reveals, effort and gates)
node tests/browser.check.cjs [dir]  # loads three arts lives and a 고2 in Chromium (SwiftShader WebGL): 「활동」, the 3D road, 「상태」's talent bars
node tests/build-artifact.cjs       # parses the script and writes dist/soshimin-play.html (dist/ is not committed)
```

`tests/load.cjs` runs the game script in a Node `vm` context and returns the modules (`G.ARTS`, `G.sim.runMany`, …).
Calibration: `globalThis.__sim.runMany(n, { seed: 1 })` lives `n` lives and prints the §16 table. In Node, set
`G.ctx.console` to silence it. A life takes about 0.2 s, so `runMany(2000)` takes about 8 minutes.

## Stage 6.6: arts and sports paths (soshimin-arts-patch.md)

Done:
- DATA.ARTS (8 fields, subdivisions, real and fictional organisations, title words), jobs 81–87, the §9 notes.
- ARTS: entry (decision at 12, arts high schools, the 예체능 track, majors, graduation), practice and 실력, 인지도,
  the stage machine (aspire → first → active → leap → fade → second), drafts and contracts, debuts, 등단, 연재,
  orchestras, injuries, the second act, and the livelihood split (art, in-field work, part-time).
- All ten §6 decisions. `artsGo` (「계속할까, 그만둘까」) is the only way from a path into an ordinary job.
- Hooks in JOBS, ADMISSIONS, MONEY (`inc.art`, `inc.adj`) and STATE.status.
- §8: 98 field event templates across the eight fields and every stage: 94 in the `arts` category (weighted in
  `DATA.EVENT_BANDS`) and 4 later-life ones in `people` and `health` so they do not crowd the years after a path. MEMORY keeps arts moments more often (kind `arts`), the road back reserves two stops for them,
  REPORT adds the path's stations, a §9 row and an epitaph, and a 예체능 childhood dream counts as achieved.
- §10 UI: the work tab becomes 「활동」 for a person on a path (stage, 실력 bars, 인지도 with the audience number,
  contract, the next audition or game, works, the income split). The money panel shows art and in-field segments and
  the split line. Road: `stage`, `gallery`, `studio`, `stadium` and `crowd` sprites, a field-specific roadside mix,
  a crowd that grows with a breakthrough and thins with a fade, and props on the walker (instrument case, sketchbook,
  book, sports bag and bat, camera).
- §11: `HARNESS.artsRows`. Rows with too few lives for a verdict show as 참고.

Calibration of the arts rows before the talent system (4,000 lives, seed 1): entry 8.2%, 첫 발 30.8%, 도약 4.0%,
40세 53.7%, KBO 8.3%, artists' art income 1,153만. Forced-field runs: webtoon artists 4,972만 mean / 3,227만 median
(4,268 / 3,400); creators 8,034만, bottom half 2,093만, top 1% 14억 (7,100 / 2,463 / 12.9억).

After talent + effort, `runMany(2000)` (seed 1): 고교 유형 73.6 / 15.7 / 5.1 / 4.2 / 1.4%, 일반고 진학 79.1%, 직업계고
50.3%, 첫 일자리까지 10.6개월, talents 50.9% at 20–30 and 0.75% at 45+, 서울대 0.36%, 의대 0% (talent 48 + effort
50 = 98 < 99, so only talent 49–50 with near-full effort can enter: a few lives in 10,000), 9급 8.3%; arts entry 8.2%,
첫 발 42.9%, 도약 4.3%, 40세 49.4%, office 11.2%; KBO 17.4% of 23 applications (참고; 3,000-life scratch runs give
8–10%). Outside their bands: 계열별 졸업 첫해 취업률 (예체능 83%, as before this system: those graduates mostly go
freelance, not through gated jobs), 독립 가구 평균 부채 7,094만 (floor 7,150만), and artists' art income 623만 with a
standard error of 201만 (pass line 653만; the original code measured about 1,239만 on a comparable 800-life run).

Also fixed: a child in care (보호 아동) had no parents to average, so `eduAvg` was 0/0 and the NaN reached the
aptitudes, skill, pay and 독립 가구 평균 순자산. A pending pro contract whose team was cleared crashed `startPending`. A 재수생 who signed a pro contract still sat
the 수능 and enrolled; signing now ends the retake. A student holding a team or field job was labelled 「프리랜서」.

Not done:
- 연습생 자퇴 (leaving high school for a debut) needs ADMISSIONS support for a dropout and a 검정고시 route.
- KBL, V-리그 and K리그 use the generic first-contract odds (`K.proP`), not their own drafts.
