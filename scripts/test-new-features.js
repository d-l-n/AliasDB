const fs = require('fs');
const path = require('path');
const assert = require('assert');
const vm = require('vm');

console.log('--- Corriendo Suite de Pruebas: Funcionalidades Core (Validación CBU, Recientes; Eliminación QR, Favoritos, Compartir) ---');

const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const adminHtml = fs.readFileSync(path.join(__dirname, '..', 'admin.html'), 'utf8');
const codeJs = fs.readFileSync(path.join(__dirname, '..', 'Code.js'), 'utf8');

// 1. Verificación de Backend (Code.js)
console.log('1. Verificando algoritmos y endpoints en Code.js...');
assert(codeJs.includes('function validateCBU(cbu)'), 'Code.js debe definir validateCBU');
assert(codeJs.includes('function getShareTextInternal('), 'Code.js debe definir getShareTextInternal');
assert(codeJs.includes("case 'validateCBU':"), 'Code.js debe exponer action validateCBU en doGet');
assert(codeJs.includes("case 'getShareText':"), 'Code.js debe exponer action getShareText en doGet');
assert(codeJs.includes('function hashKey('), 'Code.js debe securizar claves con hashKey');
assert(!codeJs.includes('DEFAULT_ADMIN_KEY = \'aliasdb_admin_2026\''), 'Code.js no debe contener la clave admin por defecto en texto plano');

// 2. Verificación de Eliminación Completa de QR Code en index.html y admin.html
console.log('2. Verificando eliminación completa de motor QR y diálogos asociados...');
['index.html', 'admin.html'].forEach(f => {
  const content = f === 'index.html' ? indexHtml : adminHtml;
  assert(!content.includes('id="modal-qr-code"'), `${f} no debe incluir <dialog id="modal-qr-code">`);
  assert(!content.includes('openQrModal'), `${f} no debe implementar función openQrModal`);
  assert(!content.includes('var qrcode='), `${f} no debe contener motor qrcode.min.js embebido`);
  assert(!content.includes('qr-btn'), `${f} no debe contener botones qr-btn`);
  assert(!content.includes('cbu-qr-mini-btn'), `${f} no debe contener botones cbu-qr-mini-btn`);
  assert(!content.includes('btn-qr-trigger'), `${f} no debe contener botones btn-qr-trigger`);
});

// 3. Verificación de Eliminación de Favoritos y Persistencia de Recientes en index.html
console.log('3. Verificando eliminación de Favoritos y retención de Recientes en index.html...');
assert(!indexHtml.includes('aliasdb-favorites'), 'index.html no debe incluir aliasdb-favorites en localStorage');
assert(!indexHtml.includes('function toggleFavorite('), 'index.html no debe declarar toggleFavorite');
assert(!indexHtml.includes('function isFavorite('), 'index.html no debe declarar isFavorite');
assert(!indexHtml.includes('btn-fav-star'), 'index.html no debe renderizar botón de estrella para favoritos');

assert(indexHtml.includes('id="recent-copies-container"'), 'index.html debe contener el contenedor de copias recientes');
assert(indexHtml.includes('aliasdb-recent-copies'), 'index.html debe almacenar copias recientes');
assert(indexHtml.includes('function addRecentCopy('), 'index.html debe declarar addRecentCopy');
assert(indexHtml.includes('function renderRecentCopies('), 'index.html debe declarar renderRecentCopies');

// 4. Verificación de Eliminación de Compartir
console.log('4. Verificando eliminación de funcionalidad Compartir...');
assert(!indexHtml.includes('function sharePersonData('), 'index.html no debe declarar sharePersonData');
assert(!adminHtml.includes('function sharePersonData('), 'admin.html no debe declarar sharePersonData');
assert(!indexHtml.includes('btn-share-card'), 'index.html no debe contener botón btn-share-card');
assert(!adminHtml.includes('btn-share-person'), 'admin.html no debe contener botón btn-share-person');

// 5. Verificación de Validación CBU en tiempo real
console.log('5. Verificando validación algorítmica BCRA en Frontend...');
function testFrontendCbu(cbu) {
  const ctx = {};
  vm.createContext(ctx);
  const match = indexHtml.match(/function validateCBU\([\s\S]*?return true;\s*\}/);
  assert(match, 'validateCBU debe estar en index.html');
  vm.runInContext(match[0], ctx);
  return ctx.validateCBU(cbu);
}
assert(testFrontendCbu('2850590940090418135201') === true, 'CBU válido debe ser validado como true');
assert(testFrontendCbu('0000003100012345678901') === false, 'CBU con dígito verificador erróneo debe retornar false');
assert(testFrontendCbu('12345') === false, 'CBU menor a 22 dígitos debe retornar false');

console.log('--- Todas las verificaciones de nuevas funcionalidades pasaron exitosamente (PASS) ---');
