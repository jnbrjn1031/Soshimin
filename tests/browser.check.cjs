// Browser check for Stage 6.6: an arts life loaded from the save slot shows the 「활동」 tab, the money panel's
// art segments and the roadside without page errors. Run: node tests/browser.check.cjs [out-dir]
// Uses the pre-installed Chromium (PLAYWRIGHT_BROWSERS_PATH) and a global or local playwright.
const path = require('path'), fs = require('fs');
const { load, findHtml } = require('./load.cjs');
let playwright;
try { playwright = require('playwright'); } catch (e) { playwright = require(path.join(require('child_process').execSync('npm root -g').toString().trim(), 'playwright')); }

const G = load();
const { STATE, SIM, RNG, HARNESS, DATA } = G;
function arts(field) {
  for (let i = 0; i < 3000; i++) {
    const s = STATE.create(RNG.hash32('1:' + i));
    for (let g = 0; s.person.alive && g < 1700; g++) {
      SIM.tickMonth(s);
      for (let n = 0; s.pending.length && n < 30; n++) { const it = s.pending.shift(); if (it.kind !== 'death') HARNESS.AUTO[it.kind](s, it); }
      const A = s.arts;
      if (STATE.age(s) > 40 || (STATE.age(s) >= 15 && !A.ever)) break;
      if (A.on && A.field === field && ['first', 'active', 'leap'].includes(A.stage) && s.career.status === 'art' && !s.pending.length && s.clock.m === 6) return s;
    }
  }
  return null;
}

(async () => {
  const out = process.argv[2] || path.join(__dirname, '..', 'dist');
  fs.mkdirSync(out, { recursive: true });
  // SwiftShader gives headless Chromium a WebGL context, so the 3D road is the one checked
  const browser = await playwright.chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const errors = [];
  let ok = true;
  for (const field of ['music', 'sport', 'visual']) {
    const s = arts(field);
    if (!s) { console.log(`${field}: no life found`); ok = false; continue; }
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    page.on('pageerror', e => errors.push(`${field}: ${e.message}`));
    page.on('console', m => { if (m.type() === 'error') errors.push(`${field}: ${m.text()}`); });
    const save = JSON.stringify({ v: DATA.SAVE_VERSION, savedAt: Date.now(), reason: 'test', state: s });
    await page.addInitScript(([k, v]) => { try { localStorage.setItem(k, v); } catch (e) { /* storage blocked */ } }, ['soshimin.life', save]);
    await page.goto('file://' + findHtml());
    await page.click('#btn-continue');
    await page.waitForTimeout(1500);
    await page.evaluate(() => document.querySelector('.tabs [data-tab="work"]').click());
    await page.waitForTimeout(300);
    const tab = await page.textContent('.tabs [data-tab="work"]'), panel = await page.textContent('#panel-work');
    const good = tab.trim() === '활동' && panel.includes('실력') && panel.includes('인지도');
    console.log(`${field}: tab 「${tab.trim()}」 · ${good ? 'ok' : 'MISSING'} · ${panel.slice(0, 90).replace(/\s+/g, ' ')}`);
    ok = ok && good;
    // the road is drawn in 3D (the canvas holds two render pixels per design pixel) and is not blank
    const road = await page.evaluate(() => {
      const cv = document.querySelector('#stage-canvas'), c = document.createElement('canvas');
      c.width = cv.width; c.height = cv.height; const g = c.getContext('2d'); g.drawImage(cv, 0, 0);
      const d = g.getImageData(0, Math.floor(cv.height * 0.6), cv.width, 1).data, seen = new Set();
      for (let i = 0; i < d.length; i += 16) seen.add(d[i] >> 3 | (d[i + 1] >> 3) << 5 | (d[i + 2] >> 3) << 10);
      return { w: cv.width, colours: seen.size };
    });
    const r3 = road.w === 512 && road.colours >= 4;
    console.log(`${field}: road ${road.w}px wide, ${road.colours} colours on one row · ${r3 ? '3D ok' : 'NOT 3D'}`);
    ok = ok && r3;
    await page.evaluate(() => document.querySelector('.tabs [data-tab="money"]').click());
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(out, `arts-${field}.png`) });
    await page.close();
  }
  await browser.close();
  if (errors.length) { console.log(errors.join('\n')); ok = false; }
  console.log(ok ? 'browser check: ok' : 'browser check: FAILED');
  process.exit(ok ? 0 : 1);
})();
