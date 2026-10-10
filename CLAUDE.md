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

## Tests and tools

```
node --test tests/*.test.cjs        # node checks (about 1 minute)
node tests/browser.check.cjs [dir]  # loads three arts lives in Chromium, checks the 「활동」 tab, writes screenshots
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
- §8: 98 `arts` event templates across the eight fields and every stage. The `arts` category is weighted in
  `DATA.EVENT_BANDS`. MEMORY keeps arts moments more often (kind `arts`), the road back reserves two stops for them,
  REPORT adds the path's stations, a §9 row and an epitaph, and a 예체능 childhood dream counts as achieved.
- §10 UI: the work tab becomes 「활동」 for a person on a path (stage, 실력 bars, 인지도 with the audience number,
  contract, the next audition or game, works, the income split). The money panel shows art and in-field segments and
  the split line. Road: `stage`, `gallery`, `studio`, `stadium` and `crowd` sprites, a field-specific roadside mix,
  a crowd that grows with a breakthrough and thins with a fade, and props on the walker (instrument case, sketchbook,
  book, sports bag and bat, camera).
- §11: `HARNESS.artsRows`. Rows with too few lives for a verdict show as 참고.

Calibration (4,000 lives, seed 1, measured with scratch scripts that use the same tick as the harness):
entry 8.2% (5–10), 첫 발 32% (30–60), 도약 4.3–4.6% (1–5), half of income in the field at 40: 54% (35–55),
KBO applications drafted 10.2% (8.7 ± 2), office jobs 17% and all through decision 7 (under 25%). Forced-field runs:
webtoon artists' years with income averaged 4,972만 with a median of 3,227만 (4,268 / 3,400); creators averaged
8,034만, bottom half 2,093만, top 1% 14억 (7,100 / 2,463 / 12.9억). The artists-overall row (survey definition: no
sport, design studios or broadcast PDs, top 1% removed) was about 1,300–1,440만 against 1,055만 ± 20%. It depends on a
handful of orchestra seats and star actors, so it is noisy below a few thousand lives.

Also fixed: a child in care (보호 아동) had no parents to average, so `eduAvg` was 0/0 and the NaN reached the
aptitudes, skill, pay and 독립 가구 평균 순자산. A pending pro contract whose team was cleared crashed `startPending`.

Not done:
- 연습생 자퇴 (leaving high school for a debut) needs ADMISSIONS support for a dropout and a 검정고시 route.
- KBL, V-리그 and K리그 use the generic first-contract odds (`K.proP`), not their own drafts.
