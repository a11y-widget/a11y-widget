// Extracts the embedded stylesheet from a11y-widget.js into a11y-widget.css,
// so strict-CSP sites can link the CSS instead of allowing an injected <style>.
const fs = require('fs');
const src = fs.readFileSync(__dirname + '/a11y-widget.js', 'utf8');
const m = src.match(/\/\*A11YW_CSS_START\*\/`([\s\S]*?)`\/\*A11YW_CSS_END\*\//);
if (!m) { console.error('CSS markers not found'); process.exit(1); }
fs.writeFileSync(__dirname + '/a11y-widget.css', m[1].replace(/^\n/, ''));
console.log('a11y-widget.css written (' + m[1].length + ' bytes)');
