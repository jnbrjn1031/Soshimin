// Builds the playable single file: checks that the game script parses, then copies 소시민.html to
// dist/soshimin-play.html (an ASCII name that survives zips and chat uploads). Run: node tests/build-artifact.cjs [out]
// An optional path writes there instead (the Pages workflow builds _site/index.html this way).
const fs = require('fs'), path = require('path'), vm = require('vm');
const { findHtml } = require('./load.cjs');
const src = findHtml(), html = fs.readFileSync(src, 'utf8');
const code = html.slice(html.indexOf('<script>') + 8, html.lastIndexOf('</script>'));
new vm.Script(code, { filename: 'soshimin.js' });   // throws on a syntax error
const out = process.argv[2] ? path.resolve(process.argv[2]) : path.join(__dirname, '..', 'dist', 'soshimin-play.html');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, html);
console.log(`built ${path.relative(process.cwd(), out)} · ${(html.length / 1024).toFixed(0)} KB · SAVE_VERSION ${/SAVE_VERSION: (\d+)/.exec(html)[1]}`);
