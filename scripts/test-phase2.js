const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

function assert(condition, message) {
  if (!condition) {
    console.error('FAIL:', message);
    process.exit(1);
  }
  console.log('PASS:', message);
}

assert(html.includes('group-header-badge'), 'Badge neo-brutalista de grupo en header');
assert(html.includes('brandTapCount >= 10'), 'Acceso a admin mediante atajo secreto de 10 toques');
assert(html.includes('group-filter-container'), 'Contenedor de chips de grupos');
assert(html.includes('showGroupBranding'), 'Función showGroupBranding');
assert(html.includes('renderGroupFilterChips'), 'Función renderGroupFilterChips');
assert(html.includes("urlParams.get('grupo')"), 'Lectura de parametro grupo');
assert(html.includes("urlParams.get('token')"), 'Lectura de parametro token');
assert(html.includes("fetchUrl += '&grupo=' + encodeURIComponent(grupoParam)"), 'Inyeccion de grupo en fetchUrl');
assert(html.includes("fetchUrl += '&token=' + encodeURIComponent(tokenParam)"), 'Inyeccion de token en fetchUrl');
assert(html.includes("friend.group || friend.grupo || 'General'"), 'Preservacion de friend.group en normalizeFriendData');
console.log('Todos los requisitos de Fase 2 verificados correctamente.');
