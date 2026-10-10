# 소시민 — working notes

A single-file life simulation (`소시민.html`, about 13k lines: HTML, CSS and one `<script>`). One Korean life is lived
month by month on a pixel-art road. Specs live outside this repo (main spec, visual spec, sub-prompt, prep patch);
`soshimin-arts-patch.md` (Stage 6.6, the arts and sports paths) is the one checked in here.

The file name is NFD-encoded on disk. Use `ls *.html` or `tests/load.cjs` (`findHtml`) rather than typing it.

## Layout of the script

Modules are `const NAME = (() => { … })()` blocks, marked `// ===== MODULE: NAME =====`, in this order:
DATA · RNG · STATE · SIM (CAL) · NETWORK · EVENTS · YEARLY6 · DECISIONS · ADMISSIONS · JOBS · FAMILY · MONEY · HEALTH ·
DOWN · PREP · ARTS · MEMORY · REPORT · SAVE · RENDER · SOUND · UI · HARNESS.

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
- `DATA.SAVE_VERSION` is 10. Bump it (and add a migration in SAVE if possible) when the shape of the state changes.

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

## Tests and tools

```
node --test tests/*.test.cjs        # node checks (about 1 minute)
node tests/browser.check.cjs [dir]  # loads three arts lives in Chromium (SwiftShader WebGL), checks the 「활동」 tab and the 3D road
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

Calibration (4,000 lives, seed 1, measured with scratch scripts that use the same tick as the harness):
entry 8.2% (5–10), 첫 발 30.8% (30–60), 도약 4.0% (1–5), half of income in the field at 40: 53.7% (35–55),
KBO applications drafted 8.3% (8.7 ± 2), office jobs 18% and all through decision 7 (under 25%), artists' art income
(survey definition: no sport, design studios or broadcast PDs, top 1% removed) 1,153만 (1,055만 ± 20%). Forced-field
runs: webtoon artists' years with income averaged 4,972만 with a median of 3,227만 (4,268 / 3,400); creators averaged
8,034만, bottom half 2,093만, top 1% 14억 (7,100 / 2,463 / 12.9억). With `runMany(2000)` only about 160 lives take a
path, so the income rows for one field show as 참고. The artists-overall row moves with a few orchestra seats and
stars (seeds 0–1999 give about 1,408만, seeds 2000–3999 about 900만), so it prints a standard error clustered by
life and passes within ±20% or within two standard errors.

`runMany(2000)` before this stage could not finish (the `startPending` crash below). With that one guard, it failed
five rows: 고교 유형, 독립 가구 순자산 (NaN), 부채, 임금 중위값, 계열별 취업률. Now only 계열별 졸업 첫해 취업률 is
outside its band (예체능 80%, 자연 75%; it was 87% and 77%).

Also fixed: a child in care (보호 아동) had no parents to average, so `eduAvg` was 0/0 and the NaN reached the
aptitudes, skill, pay and 독립 가구 평균 순자산. A pending pro contract whose team was cleared crashed `startPending`. A 재수생 who signed a pro contract still sat
the 수능 and enrolled; signing now ends the retake. A student holding a team or field job was labelled 「프리랜서」.

Not done:
- 연습생 자퇴 (leaving high school for a debut) needs ADMISSIONS support for a dropout and a 검정고시 route.
- KBL, V-리그 and K리그 use the generic first-contract odds (`K.proP`), not their own drafts.
