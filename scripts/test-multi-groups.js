const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('--- Corriendo Suite de Pruebas: Soporte Multi-Grupo (AliasDB) ---');

const codeJs = fs.readFileSync(path.join(__dirname, '..', 'Code.js'), 'utf8');
const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const adminHtml = fs.readFileSync(path.join(__dirname, '..', 'admin.html'), 'utf8');

// 1. Code.js Backend Multi-Group verification
console.log('1. Verificando lógica multi-grupo en Code.js...');
assert(codeJs.includes('function getDistinctGroups('), 'Code.js debe tener getDistinctGroups');
assert(codeJs.includes('split(\',\')'), 'Code.js debe procesar grupos separados por coma');
assert(codeJs.includes('groups: groupsArray'), 'Code.js debe retornar array groups');
assert(codeJs.includes('groupsArray.some('), 'Code.js debe filtrar grupos con some() en getFriendsDataInternal');

// 2. index.html Public UI Multi-Group verification
console.log('2. Verificando UI pública multi-grupo en index.html...');
assert(indexHtml.includes('friend.groups'), 'index.html debe contemplar friend.groups');
assert(indexHtml.includes('.friend-group-badge'), 'index.html debe renderizar badges de grupo');
assert(indexHtml.includes('friendGroups.some('), 'index.html debe chequear membresía de grupo con some()');

// 3. admin.html Admin Panel Multi-Group verification
console.log('3. Verificando panel de administración multi-grupo en admin.html...');
assert(adminHtml.includes('id="person-groups-chips-container"'), 'admin.html debe tener contenedor de chips de grupos');
assert(adminHtml.includes('id="btn-add-group-chip"'), 'admin.html debe tener botón para añadir chips de grupo');
assert(adminHtml.includes('.group-select-chip'), 'admin.html debe tener estilos de chip de grupo');
assert(adminHtml.includes('renderPersonGroupChips'), 'admin.html debe tener función renderPersonGroupChips');
assert(adminHtml.includes('addGroupChipFromInput'), 'admin.html debe tener función addGroupChipFromInput');
assert(adminHtml.includes('groups: selectedGroups'), 'admin.html debe enviar array selectedGroups al guardar');

console.log('PASS: Todas las pruebas de soporte multi-grupo pasaron exitosamente.');
