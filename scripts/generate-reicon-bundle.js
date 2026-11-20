const fs = require('fs');
const path = require('path');
const vm = require('vm');

const cleanIcons = JSON.parse(fs.readFileSync(path.join(__dirname, 'reicon-clean.json'), 'utf8'));

const jsSnippet = `/* ==========================================================================
   REICON SVG SYSTEM (https://reicon.dev/icons)
   ========================================================================== */
var REICONS = ${JSON.stringify(cleanIcons, null, 2)};

function getReiconSvg(name, extraClass, size) {
  var s = size || 18;
  var cls = extraClass ? 'reicon reicon-' + name.toLowerCase() + ' ' + extraClass : 'reicon reicon-' + name.toLowerCase();
  var inner = REICONS[name] || '';
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" width="' + s + '" height="' + s + '" class="' + cls + '" aria-hidden="true">' + inner + '</svg>';
}
`;

new vm.Script(jsSnippet);
console.log('REICONS bundle is completely valid JS! Length:', jsSnippet.length);
fs.writeFileSync(path.join(__dirname, 'reicon-bundle.js'), jsSnippet, 'utf8');
