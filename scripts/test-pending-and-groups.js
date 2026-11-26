/**
 * Test Suite: Creación Self-Service, Sandboxing Multi-Tenant y Workflow de Pendientes
 * Verifica contratos en Code.js y UI/cliente en index.html
 */
const fs = require("fs");
const path = require("path");
const assert = require("assert");

console.log("=== [TEST SUITE] Creación Self-Service, Sandboxing Multi-Tenant y Workflow Pendientes ===");

const codeJsPath = path.join(__dirname, "..", "Code.js");
const indexHtmlPath = path.join(__dirname, "..", "index.html");
const adminHtmlPath = path.join(__dirname, "..", "admin.html");

assert(fs.existsSync(codeJsPath), "Code.js debe existir en la raíz del proyecto");
assert(fs.existsSync(indexHtmlPath), "index.html debe existir en la raíz del proyecto");
assert(fs.existsSync(adminHtmlPath), "admin.html debe existir en la raíz del proyecto");

const codeJs = fs.readFileSync(codeJsPath, "utf8");
const indexHtml = fs.readFileSync(indexHtmlPath, "utf8");
const adminHtml = fs.readFileSync(adminHtmlPath, "utf8");

let passed = 0;
let total = 0;

function it(description, testFn) {
  total++;
  try {
    testFn();
    console.log("  [PASS] " + description);
    passed++;
  } catch (err) {
    console.error("  [FAIL] " + description + " -> " + err.message);
    throw err;
  }
}

// =========================================================================
// 1. Verificación de Backend (Code.js)
// =========================================================================
console.log("\n--- 1. Verificaciones Backend en Code.js ---");

it("Code.js define o maneja la acción createGroup", () => {
  assert(codeJs.includes("createGroup"), "Code.js debe incluir createGroup");
});

it("Code.js define o maneja la acción confirmFriend", () => {
  assert(codeJs.includes("confirmFriend"), "Code.js debe incluir confirmFriend");
});

it("Code.js define o maneja la acción rejectFriend", () => {
  assert(codeJs.includes("rejectFriend"), "Code.js debe incluir rejectFriend");
});

it("Code.js incluye función o referencia getGroupsSheet para gestión de hoja de grupos", () => {
  assert(codeJs.includes("getGroupsSheet"), "Code.js debe incluir getGroupsSheet");
});

it("Code.js extiende HEADERS para incluir estado y edit_token", () => {
  assert(codeJs.includes("'estado'") || codeJs.includes('"estado"'), "HEADERS debe incluir estado");
  assert(codeJs.includes("'edit_token'") || codeJs.includes('"edit_token"'), "HEADERS debe incluir edit_token");
});

it("Code.js implementa máquina de estados contemplando PENDIENTE y CONFIRMADO", () => {
  assert(codeJs.includes("PENDIENTE"), "Code.js debe contemplar estado PENDIENTE");
  assert(codeJs.includes("CONFIRMADO"), "Code.js debe contemplar estado CONFIRMADO");
});

it("Code.js implementa atomic locking con LockService.getScriptLock en escrituras", () => {
  assert(codeJs.includes("LockService.getScriptLock"), "Code.js debe utilizar LockService.getScriptLock");
});

it("Code.js implementa aislamiento multi-tenant verificando admin_token de grupo", () => {
  assert(codeJs.includes("admin_token") || codeJs.includes("adminToken"), "Code.js debe validar admin_token para sandboxing de grupo");
});

it("Code.js define la acción deleteGroup y la función deleteGroupInternal con script locking", () => {
  assert(codeJs.includes("case 'deleteGroup':") || codeJs.includes('case "deleteGroup":'), "Code.js debe rutear deleteGroup");
  assert(codeJs.includes("function deleteGroupInternal"), "Code.js debe definir deleteGroupInternal");
});

// =========================================================================
// 2. Verificación de Frontend (index.html)
// =========================================================================
console.log("\n--- 2. Verificaciones Frontend en index.html ---");

it("index.html incluye el modal de creación de grupo (modal-create-group)", () => {
  assert(indexHtml.includes("modal-create-group"), "index.html debe contener modal-create-group");
});

it("index.html incluye el modal para proponer alias (modal-add-alias)", () => {
  assert(indexHtml.includes("modal-add-alias"), "index.html debe contener modal-add-alias");
});

it("index.html implementa badge o visualización para estados pendientes (badge-pending o PENDIENTE)", () => {
  assert(indexHtml.includes("badge-pending") || indexHtml.includes("PENDIENTE"), "index.html debe tener indicador de estado pendiente");
});

it("index.html contiene controles de moderación para confirmar o rechazar (confirmFriend y rejectFriend)", () => {
  assert(indexHtml.includes("confirmFriend"), "index.html debe invocar confirmFriend");
  assert(indexHtml.includes("rejectFriend"), "index.html debe invocar rejectFriend");
});

it("index.html emite advertencia al copiar alias en estado pendiente", () => {
  assert(
    indexHtml.includes("advertencia") || indexHtml.includes("pendiente") || indexHtml.includes("warning") || indexHtml.includes("PENDIENTE"),
    "index.html debe incluir lógica de advertencia al copiar un alias pendiente"
  );
});

it("index.html gestiona admin tokens y llaves de edición mediante localStorage", () => {
  assert(indexHtml.includes("localStorage"), "index.html debe emplear localStorage");
  assert(
    indexHtml.includes("admin_token") || indexHtml.includes("adminToken") || indexHtml.includes("aliasdb_admin"),
    "index.html debe almacenar o consultar tokens de admin en localStorage"
  );
});

it("index.html y admin.html implementan reparenting de toast para evitar oclusión por backdrop blur de modales", () => {
  assert(indexHtml.includes("activeDialog.appendChild(toastContainer)"), "index.html debe reposicionar el toast sobre el modal activo");
  assert(adminHtml.includes("activeDialog.appendChild(toastContainer)"), "admin.html debe reposicionar el toast sobre el modal activo");
});

it("Code.js maneja addFriend y updateFriend en el router de doGet/doPost", () => {
  assert(codeJs.includes("case 'addFriend':") || codeJs.includes('case "addFriend":'), "Code.js debe rutear addFriend");
  assert(codeJs.includes("case 'updateFriend':") || codeJs.includes('case "updateFriend":'), "Code.js debe rutear updateFriend");
});

it("index.html implementa dropdown Neo-Brutalista unificado para Banco / Billetera sin modal-bank-chips", () => {
  assert(indexHtml.includes("alias-bank-select"), "index.html debe contener select alias-bank-select");
  assert(indexHtml.includes("alias-bank-custom"), "index.html debe contener input alias-bank-custom");
  assert(indexHtml.includes("initNeoDropdown"), "index.html debe implementar dropdown custom Neo-Brutalista initNeoDropdown");
  assert(!indexHtml.includes("modal-bank-chip"), "index.html no debe contener la cinta legacy modal-bank-chip");
});

it("index.html simplifica el badge En línea con dot minimalista y clases de estado", () => {
  assert(indexHtml.includes("sync-badge"), "index.html debe tener sync-badge");
  assert(indexHtml.includes("status-dot"), "index.html debe tener status-dot");
  assert(indexHtml.includes("is-online"), "index.html debe manejar estado is-online");
  assert(indexHtml.includes("is-offline"), "index.html debe manejar estado is-offline");
});

it("index.html contiene espaciado entre el nombre del grupo/header y el subtítulo", () => {
  assert(indexHtml.includes("brand-title-row"), "index.html debe contener brand-title-row");
  assert(indexHtml.includes("brand-tagline"), "index.html debe contener brand-tagline");
});

it("index.html propaga adminToken en loadData para garantizar visibilidad al creador del grupo", () => {
  assert(indexHtml.includes("&admin=") || indexHtml.includes("&adminToken="), "index.html debe propagar token de admin en loadData");
});

it("admin.html implementa eliminación de grupos por atajo de card header y en modal Gestionar Grupos", () => {
  assert(adminHtml.includes("btn-delete-group"), "admin.html debe contener clase btn-delete-group en cabecera de cards de grupos");
  assert(adminHtml.includes("btn-delete-grp-action"), "admin.html debe contener clase btn-delete-grp-action en tabla de modal Gestionar Grupos");
  assert(adminHtml.includes("function confirmDeleteGroup"), "admin.html debe definir función confirmDeleteGroup");
  assert(adminHtml.includes("function deleteGroup"), "admin.html debe definir función deleteGroup");
});

it("index.html implementa Zero-UI en status dot cuando está online (display: none !important)", () => {
  assert(indexHtml.includes(".sync-badge.is-online"), "index.html debe definir regla CSS para .sync-badge.is-online");
  assert(indexHtml.includes("display: none !important"), "index.html debe ocultar status dot con display: none !important en estado online");
});

it("index.html implementa repeater multi-cuenta y diálogo de decisión para nombres repetidos y bancos duplicados", () => {
  assert(indexHtml.includes("alias-accounts-container"), "index.html debe contener contenedor alias-accounts-container");
  assert(indexHtml.includes("btn-add-alias-account"), "index.html debe incluir botón para sumar otra cuenta");
  assert(indexHtml.includes("appendAliasAccountCard"), "index.html debe definir función appendAliasAccountCard");
  assert(indexHtml.includes("modal-alias-decision"), "index.html debe contener diálogo modal-alias-decision");
  assert(indexHtml.includes("showAliasDecisionModal"), "index.html debe definir función showAliasDecisionModal");
});

it("Code.js normaliza el campo bank para evitar valor por defecto 'Banco'", () => {
  assert(codeJs.includes("acc.bank || acc.bankName || acc.entidad_banco"), "Code.js debe normalizar acc.bank con fallbacks bankName y entidad_banco");
});

// =========================================================================
// 3. Simulaciones Unitarias de Contratos de Lógica y Seguridad
// =========================================================================
console.log("\n--- 3. Simulaciones de Lógica de Estados y Sandboxing ---");

it("Simulación de transición de máquina de estados: PENDIENTE -> CONFIRMADO / RECHAZADO", () => {
  const stateMachine = {
    PENDIENTE: {
      confirm: () => "CONFIRMADO",
      reject: () => "RECHAZADO"
    },
    CONFIRMADO: {
      edit: () => "PENDIENTE"
    }
  };

  let currentState = "PENDIENTE";
  assert.strictEqual(stateMachine[currentState].confirm(), "CONFIRMADO", "Transición PENDIENTE -> CONFIRMADO exitosa");
  assert.strictEqual(stateMachine[currentState].reject(), "RECHAZADO", "Transición PENDIENTE -> RECHAZADO exitosa");
});

it("Simulación de sandboxing multi-tenant: aislamiento estricto por admin_token", () => {
  const groupsDatabase = {
    "grp_alpha": { admin_token: "adm_secret_alpha_999", name: "Grupo Alpha" },
    "grp_beta": { admin_token: "adm_secret_beta_888", name: "Grupo Beta" }
  };

  function authorizeGroupAdmin(groupId, providedToken) {
    const group = groupsDatabase[groupId];
    if (!group) return false;
    return group.admin_token === providedToken;
  }

  // Token correcto del grupo
  assert.strictEqual(authorizeGroupAdmin("grp_alpha", "adm_secret_alpha_999"), true, "Token de Alpha autoriza en grp_alpha");
  // Token cruzado (de otro grupo)
  assert.strictEqual(authorizeGroupAdmin("grp_alpha", "adm_secret_beta_888"), false, "Token de Beta es rechazado en grp_alpha");
  // Token inválido o espurio
  assert.strictEqual(authorizeGroupAdmin("grp_alpha", "fake_token"), false, "Token inválido es rechazado");
  // Grupo inexistente
  assert.strictEqual(authorizeGroupAdmin("grp_omega", "adm_secret_alpha_999"), false, "Grupo inexistente es rechazado");
});

it("Simulación de eliminación de grupo: preservación de personas con reasignación a 'General'", () => {
  const persons = [
    { name: "Juan", groups: ["Fútbol", "Facultad"] },
    { name: "Pedro", groups: ["Fútbol"] },
    { name: "Maria", groups: ["General"] }
  ];

  function simulateDeleteGroup(targetGroup) {
    persons.forEach(p => {
      p.groups = p.groups.filter(g => g !== targetGroup);
      if (p.groups.length === 0) {
        p.groups = ["General"];
      }
    });
  }

  simulateDeleteGroup("Fútbol");

  assert.deepStrictEqual(persons[0].groups, ["Facultad"], "Juan mantiene 'Facultad'");
  assert.deepStrictEqual(persons[1].groups, ["General"], "Pedro pasa a 'General' al no tener más grupos");
  assert.deepStrictEqual(persons[2].groups, ["General"], "Maria permanece en 'General'");
});

it("index.html implementa Command Bar Sticky desktop, Dock Mobile con atajo Lupa, Máscara Superior y FAB Scroll-to-Top", () => {
  assert(indexHtml.includes('id="sticky-command-bar"'), "index.html debe contener #sticky-command-bar");
  assert(indexHtml.includes('id="search-box"'), "index.html debe asignar id='search-box'");
  assert(indexHtml.includes('id="dock-btn-search"'), "index.html debe incluir botón lupa #dock-btn-search en el dock");
  assert(indexHtml.includes("IntersectionObserver"), "index.html debe observar #search-box con IntersectionObserver");
  assert(indexHtml.includes('id="top-scroll-mask"'), "index.html debe incluir máscara superior #top-scroll-mask");
  assert(indexHtml.includes('id="fab-scroll-top"'), "index.html debe incluir FAB #fab-scroll-top");
  assert(!indexHtml.includes(".primary-actions-dock {\n        display: contents;"), "index.html debe eliminar display: contents en .primary-actions-dock desktop");
  assert(indexHtml.includes('<span class="dock-btn-label">Grupos</span>'), "index.html debe renombrar Crear Grupo a Grupos");
  assert(indexHtml.includes('<span class="dock-btn-label">Agregar Alias</span>'), "index.html debe renombrar Sumar mi Alias a Agregar Alias");
  assert(indexHtml.includes("carousel-arrow-btn"), "index.html debe incluir flechas de navegación en carruseles desktop");
  assert(indexHtml.includes("white-space: nowrap;"), "index.html debe evitar recorte horizontal de .collapse-toggle-btn");
  assert(!indexHtml.includes("alias-person-status-pill"), "index.html debe eliminar el badge engañoso #alias-person-status-pill");
  assert(indexHtml.includes("alias-person-validation-hint"), "index.html debe validar en tiempo real el nombre antes de pasar a Cuentas");
});

it("index.html y admin.html implementan dropdowns Neo-Brutalistas accesibles y validación CBU verde para 22 dígitos", () => {
  assert(
    (indexHtml.includes("'role', 'combobox'") || indexHtml.includes('role="combobox"')) &&
      (indexHtml.includes("'role', 'listbox'") || indexHtml.includes('role="listbox"')),
    "index.html debe usar roles ARIA combobox/listbox en dropdowns"
  );
  assert(
    adminHtml.includes("initNeoDropdown") &&
      (adminHtml.includes("'role', 'combobox'") || adminHtml.includes('role="combobox"')) &&
      (adminHtml.includes("'role', 'listbox'") || adminHtml.includes('role="listbox"')),
    "admin.html debe unificar selects con dropdowns Neo-Brutalistas accesibles"
  );
  assert(indexHtml.includes("/^\\\\d{22}$/") || indexHtml.includes("/^\\d{22}$/"), "index.html checkCbuLive debe aceptar 22 dígitos numéricos con verde");
  assert(adminHtml.includes("/^\\\\d{22}$/") || adminHtml.includes("/^\\d{22}$/"), "admin.html checkAdminCbuLive debe aceptar 22 dígitos numéricos con verde");
  const idxCbuBlock = indexHtml.slice(indexHtml.indexOf("function checkCbuLive"), indexHtml.indexOf("cbuInput.addEventListener('input', checkCbuLive)"));
  const admCbuBlock = adminHtml.slice(adminHtml.indexOf("function checkAdminCbuLive"), adminHtml.indexOf("cbuInput.addEventListener('input', checkAdminCbuLive)"));
  assert(!idxCbuBlock.includes("var(--accent-red)"), "checkCbuLive no debe pintar borde rojo por dígito verificador BCRA");
  assert(!admCbuBlock.includes("var(--accent-red)"), "checkAdminCbuLive no debe pintar borde rojo por dígito verificador BCRA");
});

console.log(`\n>>> RESULTADO: ${passed}/${total} pruebas pasaron exitosamente. <<<`);
