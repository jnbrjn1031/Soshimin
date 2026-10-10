// Loads the game's single <script> into a Node vm context (no DOM), exposing globalThis.__sim and the modules.
const fs = require('fs'), path = require('path'), vm = require('vm');
function findHtml() {
  const dir = path.join(__dirname, '..');
  const f = fs.readdirSync(dir).find(n => n.normalize('NFC') === '소시민.html');
  if (!f) throw new Error('소시민.html not found');
  return path.join(dir, f);
}
function load() {
  const html = fs.readFileSync(findHtml(), 'utf8');
  const a = html.indexOf('<script>'), b = html.lastIndexOf('</script>');
  const code = html.slice(a + 8, b);
  const ctx = { console, performance, setTimeout, clearTimeout, Math, Date, JSON };
  ctx.globalThis = ctx;
  vm.createContext(ctx);
  const names = ['DATA', 'RNG', 'STATE', 'SIM', 'NETWORK', 'EVENTS', 'YEARLY6', 'DECISIONS', 'ADMISSIONS', 'JOBS', 'FAMILY', 'MONEY', 'HEALTH', 'DOWN', 'PREP', 'ARTS', 'MEMORY', 'REPORT', 'HARNESS'];
  vm.runInContext(code + `\n;globalThis.__mod = { ${names.map(n => `${n}: typeof ${n} !== 'undefined' ? ${n} : null`).join(', ')} };`, ctx, { filename: 'soshimin.js' });
  return Object.assign({ sim: ctx.__sim, ctx }, ctx.__mod);
}
module.exports = { load, findHtml };
