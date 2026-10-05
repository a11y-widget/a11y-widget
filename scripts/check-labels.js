// Fails if any language in the LABELS table is missing a key another language has.
// Run: node scripts/check-labels.js
const fs = require('fs');
const src = fs.readFileSync(__dirname + '/../a11y-widget.js', 'utf8');
const start = src.indexOf('var L = {');
const end = src.indexOf('\n  };', start);
if (start < 0 || end < 0) { console.error('LABELS table not found'); process.exit(1); }
const block = src.slice(start, end);
const langs = {};
const heads = [...block.matchAll(/\n    (\w+): \{/g)];
heads.forEach((h, i) => {
  const body = block.slice(h.index + h[0].length, i + 1 < heads.length ? heads[i + 1].index : block.length);
  langs[h[1]] = new Set([...body.matchAll(/(?:^|[\s,{])(\w+):\s*['"]/g)].map((m) => m[1]));
});
const names = Object.keys(langs);
if (names.length < 2) { console.error('expected several languages, found: ' + names.join(', ')); process.exit(1); }
const base = langs[names[0]];
let bad = 0;
for (const n of names) {
  for (const k of base) if (!langs[n].has(k)) { console.log(`missing in ${n}: ${k}`); bad++; }
  for (const k of langs[n]) if (!base.has(k)) { console.log(`extra in ${n}: ${k}`); bad++; }
}
console.log(`languages: ${names.join(', ')}; keys per language: ${base.size}; problems: ${bad}`);
process.exit(bad ? 1 : 0);
