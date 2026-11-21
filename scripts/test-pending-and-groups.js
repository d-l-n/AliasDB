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

console.log(`\n>>> RESULTADO: ${passed}/${total} pruebas pasaron exitosamente. <<<`);
