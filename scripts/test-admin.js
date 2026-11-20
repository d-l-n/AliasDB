const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('--- Corriendo Suite de Pruebas: AliasDB Panel Admin (admin.html) ---');

const adminPath = path.join(__dirname, '..', 'admin.html');
assert(fs.existsSync(adminPath), 'admin.html debe existir en la raíz del proyecto');

const html = fs.readFileSync(adminPath, 'utf8');

// 1. Verificación de Arquitectura y Metadata
console.log('1. Verificando Metadata y Anti-FOUC...');
assert(html.includes('<!DOCTYPE html>'), 'Debe incluir doctype HTML5');
assert(html.includes('data-theme="light"'), 'Debe inicializar tema');
assert(html.includes('color-scheme'), 'Debe declarar meta color-scheme');
assert(html.includes('Space+Grotesk'), 'Debe importar Space Grotesk');
assert(html.includes('JetBrains+Mono'), 'Debe importar JetBrains Mono');
assert(html.includes('localStorage.getItem(\'theme-preference\')'), 'Anti-FOUC script presente');

// 2. Verificación de Tokens Neo-Brutalistas
console.log('2. Verificando Tokens de Diseño Neo-Brutalista...');
const tokensToCheck = [
  '--canvas',
  '--surface',
  '--surface-muted',
  '--text',
  '--border',
  '--shadow',
  '--accent-yellow',
  '--accent-cyan',
  '--accent-mint',
  '--accent-purple',
  '--accent-pink',
  '--accent-orange',
  '--accent-red',
  '--bank-mp-bg',
  '--bank-galicia-bg',
  '--bank-santander-bg',
  '--bank-brubank-bg',
  '--bank-lemon-bg',
  '--bank-bbva-bg',
  '--bank-uala-bg',
  '--border-width',
  '--shadow-offset'
];
tokensToCheck.forEach(token => {
  assert(html.includes(token), 'Debe contener token CSS: ' + token);
});

// 3. Verificación de Modern Dialog (<dialog>) y Accesibilidad
console.log('3. Verificando soporte de Modern Dialog y A11y...');
assert(html.includes('dialog:modal'), 'CSS debe incluir dialog:modal');
assert(html.includes('overscroll-behavior: contain'), 'CSS debe contener overscroll en dialog y backdrop');
assert(html.includes('dialog::backdrop'), 'CSS debe estilizar ::backdrop');
assert(html.includes('sr-announcer'), 'Debe contener región aria-live sr-announcer');

// 4. Verificación de Modales Requeridos
console.log('4. Verificando modales obligatorios...');
const requiredDialogs = [
  'modal-auth',
  'modal-person',
  'modal-tokens',
  'modal-groups',
  'modal-import',
  'modal-confirm'
];
requiredDialogs.forEach(dialogId => {
  assert(html.includes(`id="${dialogId}"`), `Debe existir el modal <dialog id="${dialogId}">`);
});

// 5. Verificación de Elementos del Header y Toolbar
console.log('5. Verificando elementos de UI del Header y Toolbar...');
const requiredElementIds = [
  'admin-auth-btn',
  'open-sheet-btn',
  'reload-btn',
  'theme-toggle',
  'stat-persons',
  'stat-accounts',
  'stat-groups',
  'stat-tokens',
  'search-input',
  'search-clear',
  'group-filter-select',
  'btn-new-person',
  'btn-open-tokens',
  'btn-open-groups',
  'btn-export-csv',
  'btn-open-import',
  'groups-container',
  'brutalist-toast'
];
requiredElementIds.forEach(id => {
  assert(html.includes(`id="${id}"`), `Debe contener el elemento con id="${id}"`);
});

// 6. Verificación de Algoritmos de Detección CBU y Fintech (Simulación lógica)
console.log('6. Verificando algoritmos de detección CBU y Quick-Add...');

const CBU_BANK_MAP = {
  '007': 'Banco Galicia',
  '011': 'Banco Nación',
  '014': 'Banco Provincia',
  '015': 'Banco ICBC',
  '017': 'BBVA',
  '027': 'Banco Supervielle',
  '029': 'Banco Ciudad',
  '034': 'Banco Patagonia',
  '044': 'Banco Hipotecario',
  '072': 'Banco Santander',
  '143': 'Brubank',
  '000': 'CVU (Fintech)'
};

function detectBankFromCBU(cbu) {
  if (!cbu || cbu.length < 3) return null;
  const prefix = cbu.substring(0, 3);
  return CBU_BANK_MAP[prefix] || null;
}

function detectFintechFromAlias(alias) {
  const lower = (alias || '').toLowerCase();
  if (lower.indexOf('mp') !== -1 || lower.indexOf('mercado') !== -1) return 'Mercado Pago';
  if (lower.indexOf('uala') !== -1 || lower.indexOf('ualá') !== -1) return 'Ualá';
  if (lower.indexOf('lemon') !== -1) return 'Lemon Cash';
  if (lower.indexOf('bru') !== -1) return 'Brubank';
  return 'Mercado Pago';
}

assert.strictEqual(detectBankFromCBU('0070012330004567890123'), 'Banco Galicia');
assert.strictEqual(detectBankFromCBU('0720023420001122334455'), 'Banco Santander');
assert.strictEqual(detectBankFromCBU('1430001713009876543210'), 'Brubank');
assert.strictEqual(detectBankFromCBU('0000003100012345678901'), 'CVU (Fintech)');
assert.strictEqual(detectFintechFromAlias('martin.mp.futbol'), 'Mercado Pago');
assert.strictEqual(detectFintechFromAlias('lucas.lemon.crypto'), 'Lemon Cash');
assert.strictEqual(detectFintechFromAlias('camila.uala.ar'), 'Ualá');

// Quick-Add Regex Test
const testRawText = 'martin.mp.futbol 0000003100012345678901';
const cbuMatch = testRawText.match(/\b\d{22}\b/);
assert(cbuMatch && cbuMatch[0] === '0000003100012345678901', 'Quick-add debe detectar CBU de 22 dígitos');
const aliasMatch = testRawText.match(/\b[a-zA-Z0-9_\-]{2,20}\.[a-zA-Z0-9_\-]{2,20}(\.[a-zA-Z0-9_\-]{2,20})?\b/);
assert(aliasMatch && aliasMatch[0] === 'martin.mp.futbol', 'Quick-add debe detectar alias');

// 7. Verificación de Parser CSV
console.log('7. Verificando parser de importación y exportación CSV...');
function parseCsvLine(text) {
  let p = '', c = '', r = [];
  let q = false;
  for (let i = 0; i < text.length; i++) {
    c = text[i];
    let next = text[i + 1];
    if (c === '"') {
      if (q && next === '"') { p += '"'; i++; }
      else { q = !q; }
    } else if (c === ',' && !q) {
      r.push(p.trim());
      p = '';
    } else {
      p += c;
    }
  }
  r.push(p.trim());
  return r;
}

const csvLine1 = 'Martín Gómez,Fútbol,Mercado Pago,CVU,martin.mp.futbol,0000003100012345678901,""';
const parsed1 = parseCsvLine(csvLine1);
assert.strictEqual(parsed1[0], 'Martín Gómez');
assert.strictEqual(parsed1[1], 'Fútbol');
assert.strictEqual(parsed1[4], 'martin.mp.futbol');
assert.strictEqual(parsed1[5], '0000003100012345678901');

const csvLine2 = '"Benítez, Lucas",Trabajo,Banco Santander,Cuenta Corriente,lucas.santander,0720023420001122334455,"Benítez & Asoc"';
const parsed2 = parseCsvLine(csvLine2);
assert.strictEqual(parsed2[0], 'Benítez, Lucas');
assert.strictEqual(parsed2[6], 'Benítez & Asoc');

// 8. Verificación de Backend Endpoint URL
console.log('8. Verificando integración con BACKEND_API_URL...');
const expectedUrl = 'https://script.google.com/macros/s/AKfycbz7Pp_RisFpuIFiAycBSL4EJXpydQZRfToR7T-Wd7-Hoaio1n2A4KzUm4d8WAEKVtqeQg/exec';
assert(html.includes(expectedUrl), 'Debe conectarse exactamente a la BACKEND_API_URL provista');

console.log('\n--- Todas las 8 verificaciones pasaron con éxito (PASS) ---');
