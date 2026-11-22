/**
 * ===================================================================
 * AliasDB | Backend Google Apps Script
 * Gestión centralizada de alias bancarios y CBU/CVU de contactos
 * ===================================================================
 */

const SHEET_NAME = 'Cuentas';
const GROUPS_SHEET_NAME = 'Grupos';
const SPREADSHEET_PROP_KEY = 'SPREADSHEET_ID';
const TOKEN_MAP_KEY = 'GROUP_TOKENS';
const ADMIN_KEY_PROP = 'ADMIN_KEY';

const HEADERS = [
  'id_persona',
  'nombre_persona',
  'grupo',
  'id_cuenta',
  'entidad_banco',
  'tipo_cuenta',
  'alias',
  'cbu_cvu',
  'titular_diferente',
  'estado',
  'edit_token',
  'id_grupo',
  'datos_previos'
];

const GROUPS_HEADERS = [
  'id_grupo',
  'nombre_grupo',
  'read_token',
  'admin_token',
  'estado',
  'created_at'
];

const DEFAULT_GROUPS_SEED = [
  {
    id: 'grp_futbol',
    name: 'Fútbol',
    readToken: 'view_futbol',
    adminToken: 'adm_futbol',
    estado: 'ACTIVO'
  },
  {
    id: 'grp_facultad',
    name: 'Facultad',
    readToken: 'view_facultad',
    adminToken: 'adm_facultad',
    estado: 'ACTIVO'
  },
  {
    id: 'grp_trabajo',
    name: 'Trabajo',
    readToken: 'view_trabajo',
    adminToken: 'adm_trabajo',
    estado: 'ACTIVO'
  },
  {
    id: 'grp_mediadocena',
    name: 'MediaDocena',
    readToken: 'mediad_pbgi',
    adminToken: 'adm_mediadocena',
    estado: 'ACTIVO'
  }
];

/**
 * Datos demo predefinidos para inicialización y reseteo
 */
const DEMO_FRIENDS = [
  {
    id: 'persona_martin_gomez',
    name: 'Martín Gómez',
    group: 'Fútbol',
    id_grupo: 'grp_futbol',
    accounts: [
      {
        id: 'acc_mg_mp',
        bank: 'Mercado Pago',
        type: 'CVU',
        alias: 'martin.mp.futbol',
        cbu: '0000003100012345678901',
        titular: ''
      },
      {
        id: 'acc_mg_galicia',
        bank: 'Banco Galicia',
        type: 'Caja de Ahorro en Pesos',
        alias: 'martin.galicia.ar',
        cbu: '0070012330004567890123',
        titular: ''
      }
    ]
  },
  {
    id: 'persona_sofia_rossi',
    name: 'Sofía Rossi',
    group: 'Facultad',
    id_grupo: 'grp_facultad',
    accounts: [
      {
        id: 'acc_sr_brubank',
        bank: 'Brubank',
        type: 'Caja de Ahorro en Pesos',
        alias: 'sofi.rossi.bru',
        cbu: '1430001713009876543210',
        titular: ''
      }
    ]
  },
  {
    id: 'persona_lucas_benitez',
    name: 'Lucas Benítez',
    group: 'Trabajo',
    id_grupo: 'grp_trabajo',
    accounts: [
      {
        id: 'acc_lb_lemon',
        bank: 'Lemon Cash',
        type: 'CVU',
        alias: 'lucas.lemon.crypto',
        cbu: '0000123400009876543210',
        titular: ''
      },
      {
        id: 'acc_lb_santander',
        bank: 'Banco Santander',
        type: 'Cuenta Corriente',
        alias: 'lucas.santander',
        cbu: '0720023420001122334455',
        titular: 'Benítez & Asociados SRL'
      }
    ]
  }
];


/**
 * ===================================================================
 * INTEGRACIÓN CON GOOGLE SHEETS UI (SIDEBAR STICKY & MENÚS)
 * ===================================================================
 */

/**
 * Se ejecuta automáticamente al abrir la hoja de cálculo de Google Sheets.
 * Despliega el panel de administración en formato popup (diálogo modal)
 * y registra el menú personalizado 'AliasDB'.
 * @param {Object} e Evento de apertura de la hoja de cálculo
 */
function onOpen(e) {
  try {
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      if (ss) {
        PropertiesService.getScriptProperties().setProperty(SPREADSHEET_PROP_KEY, ss.getId());
      }
    } catch (ssErr) {}

    const ui = SpreadsheetApp.getUi();
    ui.createMenu('AliasDB')
      .addItem('⚡ Abrir Panel de Administración (Popup)', 'showAdminPopup')
      .addItem('📌 Abrir en Barra Lateral (Sidebar)', 'showAdminSidebar')
      .addItem('🌐 Abrir Admin Panel Web (Nueva Pestaña)', 'openAdminWebTab')
      .addItem('📱 Abrir App Pública (Nueva Pestaña)', 'openPublicAppTab')
      .addSeparator()
      .addItem('🔑 Configurar Clave Admin', 'promptSetAdminKey')
      .addItem('🔄 Reinicializar Datos Demo', 'resetToDemoData')
      .addToUi();

    // Apertura automática del panel en formato popup (diálogo modal)
    showAdminPopup();
  } catch (err) {
    console.error('Error inicializando interfaz en onOpen:', err);
  }
}

/**
 * Despliega el panel de administración en formato popup (cuadro de diálogo modal) en Google Sheets.
 */
function showAdminPopup() {
  try {
    const template = HtmlService.createTemplateFromFile('admin');
    const htmlOutput = template.evaluate()
      .setTitle('AliasDB // Panel Admin')
      .setWidth(1050)
      .setHeight(650)
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'AliasDB // Panel de Administración');
  } catch (err) {
    console.error('Error desplegando popup de administración:', err);
  }
}

/**
 * Alias para showAdminPopup()
 */
function showAdminDialog() {
  showAdminPopup();
}

/**
 * Despliega la barra lateral (sidebar) fija en Google Sheets con el panel de administración.
 */
function showAdminSidebar() {
  try {
    const template = HtmlService.createTemplateFromFile('admin');
    const htmlOutput = template.evaluate()
      .setTitle('AliasDB // Panel Admin')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    SpreadsheetApp.getUi().showSidebar(htmlOutput);
  } catch (err) {
    console.error('Error desplegando sidebar de administración:', err);
  }
}

/**
 * Abre el panel de administración web en una nueva pestaña del navegador.
 */
function openAdminWebTab() {
  try {
    const html = HtmlService.createHtmlOutput(
      '<html><body style="font-family:sans-serif;padding:12px;text-align:center;">' +
      '<p style="font-weight:700;margin-bottom:12px;">Redirigiendo a AliasDB Admin...</p>' +
      '<script>window.open("https://d-l-n.github.io/AliasDB/admin.html", "_blank");setTimeout(function(){google.script.host.close();}, 1200);</script>' +
      '<a href="https://d-l-n.github.io/AliasDB/admin.html" target="_blank" style="display:inline-block;padding:8px 16px;background:#FFE600;color:#0D0D11;font-weight:800;border:2px solid #0D0D11;text-decoration:none;">Abrir manualmente</a>' +
      '</body></html>'
    ).setWidth(320).setHeight(130);
    SpreadsheetApp.getUi().showModalDialog(html, 'AliasDB // Panel Admin');
  } catch (err) {
    console.error('Error abriendo pestaña admin:', err);
  }
}

/**
 * Abre la aplicación pública de consulta en una nueva pestaña del navegador.
 */
function openPublicAppTab() {
  try {
    const html = HtmlService.createHtmlOutput(
      '<html><body style="font-family:sans-serif;padding:12px;text-align:center;">' +
      '<p style="font-weight:700;margin-bottom:12px;">Redirigiendo a AliasDB...</p>' +
      '<script>window.open("https://d-l-n.github.io/AliasDB/", "_blank");setTimeout(function(){google.script.host.close();}, 1200);</script>' +
      '<a href="https://d-l-n.github.io/AliasDB/" target="_blank" style="display:inline-block;padding:8px 16px;background:#2DF8C5;color:#0D0D11;font-weight:800;border:2px solid #0D0D11;text-decoration:none;">Abrir manualmente</a>' +
      '</body></html>'
    ).setWidth(320).setHeight(130);
    SpreadsheetApp.getUi().showModalDialog(html, 'AliasDB // App Pública');
  } catch (err) {
    console.error('Error abriendo pestaña pública:', err);
  }
}

/**
 * Diálogo interactivo en Google Sheets para configurar la clave de administrador.
 */
function promptSetAdminKey() {
  try {
    const ui = SpreadsheetApp.getUi();
    const response = ui.prompt(
      'Configurar Clave Admin',
      'Ingresá la nueva clave de administrador para AliasDB:',
      ui.ButtonSet.OK_CANCEL
    );
    if (response.getSelectedButton() === ui.Button.OK) {
      const key = response.getResponseText().trim();
      if (key) {
        setAdminKey(key);
        ui.alert('Éxito', 'Clave de administración configurada correctamente.', ui.ButtonSet.OK);
      } else {
        ui.alert('Atención', 'La clave no puede estar vacía.', ui.ButtonSet.OK);
      }
    }
  } catch (err) {
    console.error('Error configurando clave desde prompt:', err);
  }
}

// ===================================================================
// CONTROLADOR WEB (doGet / doPost) E INCLUDES
// ===================================================================

/**
 * Manejador de solicitudes HTTP GET para servir la SPA o actuar como Router REST.
 * @param {Object} e Evento de petición HTTP
 * @returns {HtmlOutput|TextOutput} Interfaz web configurada o payload JSON
 */
function doGet(e) {
  try {
    const isRest = e && e.parameter && (e.parameter.action || e.parameter.format === 'json');

    if (isRest) {
      const action = e.parameter.action || 'getFriends';

      switch (action) {
        // --- Endpoints Públicos y Multi-Tenant de Consulta ---
        case 'getFriends':
        case 'getPersons':
        case 'getPersonas': {
          const tokenParam = (e.parameter.token ? String(e.parameter.token).trim() : '');
          const adminParam = (e.parameter.admin || e.parameter.adminToken ? String(e.parameter.admin || e.parameter.adminToken).trim() : '');
          const adminKeyParam = (e.parameter.adminKey ? String(e.parameter.adminKey).trim() : '');
          const grupoParam = (e.parameter.grupo || e.parameter.group || e.parameter.id_grupo ? String(e.parameter.grupo || e.parameter.group || e.parameter.id_grupo).trim() : '');

          const isSuper = isValidAdminKey(adminKeyParam);
          let targetGroup = null;
          let isAdmin = isSuper;

          if (tokenParam) {
            targetGroup = findGroupByToken(tokenParam);
            if (targetGroup) {
              if (targetGroup.admin_token && targetGroup.admin_token.toLowerCase() === tokenParam.toLowerCase()) {
                isAdmin = true;
              }
            } else {
              const groupName = resolveGroupFromToken(tokenParam);
              if (groupName) {
                targetGroup = findGroupByName(groupName) || {
                  id_grupo: 'grp_' + tokenParam,
                  nombre_grupo: groupName,
                  read_token: tokenParam,
                  admin_token: ''
                };
              } else {
                return jsonResponse({ success: false, error: 'Token inválido o expirado.' });
              }
            }
          } else if (grupoParam) {
            targetGroup = findGroupById(grupoParam) || findGroupByName(grupoParam);
            if (!targetGroup) {
              targetGroup = {
                id_grupo: '',
                nombre_grupo: grupoParam,
                read_token: '',
                admin_token: ''
              };
            }
          }

          if (adminParam) {
            if (targetGroup && targetGroup.admin_token && targetGroup.admin_token.toLowerCase() === adminParam.toLowerCase()) {
              isAdmin = true;
            } else {
              const adminGroup = findGroupByAdminToken(adminParam);
              if (adminGroup) {
                if (!targetGroup || targetGroup.id_grupo === adminGroup.id_grupo || targetGroup.nombre_grupo === adminGroup.nombre_grupo) {
                  targetGroup = adminGroup;
                  isAdmin = true;
                }
              }
            }
          }

          const filterGroupName = targetGroup ? targetGroup.nombre_grupo : (grupoParam || null);
          const filterIdGrupo = targetGroup ? targetGroup.id_grupo : null;
          const friends = getFriendsDataInternal(filterGroupName, {
            isAdmin: isAdmin,
            id_grupo: filterIdGrupo
          });

          return jsonResponse({
            success: true,
            data: friends,
            grupo: filterGroupName,
            id_grupo: filterIdGrupo,
            isAdmin: Boolean(isAdmin),
            readToken: targetGroup ? targetGroup.read_token : null
          });
        }

        case 'getGroups': {
          return jsonResponse({ success: true, data: getDistinctGroups() });
        }

        case 'validateCBU': {
          const cbu = (e.parameter.cbu || (e.parameter.payload && JSON.parse(e.parameter.payload).cbu) || '').trim();
          return jsonResponse(validateCBU(cbu));
        }

        case 'getShareText': {
          const personId = (e.parameter.id || e.parameter.id_persona || e.parameter.friendId || '').trim();
          return jsonResponse(getShareTextInternal(personId));
        }

        // --- Creación Autoservicio de Grupos ---
        case 'createGroup': {
          let body = null;
          if (e.parameter.payload) {
            try {
              body = typeof e.parameter.payload === 'string' ? JSON.parse(e.parameter.payload) : e.parameter.payload;
            } catch (err) {
              return jsonResponse({ success: false, error: 'Payload JSON inválido: ' + err.message });
            }
          } else {
            body = e.parameter;
          }
          return jsonResponse(createGroupInternal(body));
        }

        // --- Guardado con Soporte Optimista / Pendiente / Admin ---
        case 'save':
        case 'savePerson':
        case 'saveFriend':
        case 'addFriend':
        case 'updateFriend': {
          let body = null;
          if (e.parameter.payload) {
            try {
              body = typeof e.parameter.payload === 'string' ? JSON.parse(e.parameter.payload) : e.parameter.payload;
            } catch (err) {
              return jsonResponse({ success: false, error: 'Payload JSON inválido: ' + err.message });
            }
          } else {
            body = e.parameter;
          }

          const passedToken = e.parameter.adminToken || e.parameter.admin || e.parameter.token || (body && (body.adminToken || body.admin || body.token));
          const saveResult = saveFriendWithAccounts(body, {
            adminKey: e.parameter.adminKey || (body && body.adminKey),
            adminToken: passedToken,
            editToken: e.parameter.editToken || e.parameter.edit_token || (body && (body.editToken || body.edit_token)),
            token: e.parameter.token || (body && body.token),
            isRestCall: true
          });
          return jsonResponse(saveResult);
        }

        // --- Confirmación y Rechazo de Cambios Pendientes ---
        case 'confirmFriend':
        case 'approveFriend': {
          return jsonResponse(confirmFriendInternal(e));
        }

        case 'rejectFriend':
        case 'discardFriend': {
          return jsonResponse(rejectFriendInternal(e));
        }

        case 'deleteFriend':
        case 'deletePerson':
        case 'deletePersona': {
          const targetId = (e.parameter.id || e.parameter.friendId || '').trim();
          const authError = requireAdminOrGroupAdmin(e, targetId);
          if (authError) return authError;
          return jsonResponse(deleteFriend(targetId));
        }

        case 'deleteAccount': {
          const authError = requireAdmin(e);
          if (authError) return authError;
          return jsonResponse(deleteAccount(e.parameter.id));
        }

        case 'getTokens': {
          const authError = requireAdmin(e);
          if (authError) return authError;
          return jsonResponse({ success: true, data: getAllGroupTokens() });
        }

        case 'generateToken':
        case 'saveToken': {
          const authError = requireAdmin(e);
          if (authError) return authError;
          const grupo = e.parameter.grupo;
          if (!grupo) {
            return jsonResponse({ success: false, error: 'Parámetro grupo requerido.' });
          }
          const customToken = e.parameter.token || null;
          const token = generateGroupToken(grupo, customToken);
          return jsonResponse({ success: true, token: token, grupo: grupo });
        }

        case 'revokeToken': {
          const authError = requireAdmin(e);
          if (authError) return authError;
          const token = e.parameter.token;
          if (!token) {
            return jsonResponse({ success: false, error: 'Parámetro token requerido.' });
          }
          revokeGroupToken(token);
          return jsonResponse({ success: true, token: token, revoked: true });
        }

        case 'renameGroup': {
          const authError = requireAdmin(e);
          if (authError) return authError;
          return jsonResponse(renameGroupInternal(e.parameter.oldName, e.parameter.newName));
        }

        case 'deleteGroup':
        case 'removeGroup': {
          const grupoParam = (e.parameter.grupo || e.parameter.group || e.parameter.nombre || e.parameter.id_grupo || '').trim();
          const authError = requireAdminOrGroupOwner(e, grupoParam);
          if (authError) return authError;
          return jsonResponse(deleteGroupInternal(grupoParam));
        }

        case 'getSpreadsheetInfo': {
          const authError = requireAdmin(e);
          if (authError) return authError;
          return jsonResponse(getSpreadsheetInfo());
        }

        case 'setSpreadsheetId':
        case 'setSpreadsheet': {
          const authError = requireAdmin(e);
          if (authError) return authError;
          const rawId = (e.parameter.id || e.parameter.spreadsheetId || e.parameter.url || '').trim();
          if (!rawId) {
            return jsonResponse({ success: false, error: 'ID o URL de hoja de cálculo requerido.' });
          }
          let targetId = rawId;
          const urlMatch = rawId.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
          if (urlMatch && urlMatch[1]) {
            targetId = urlMatch[1];
          }
          try {
            const ss = SpreadsheetApp.openById(targetId);
            PropertiesService.getScriptProperties().setProperty(SPREADSHEET_PROP_KEY, ss.getId());
            getAccountsSheet();
            invalidateGroupsCache();
        SpreadsheetApp.flush();
            return jsonResponse({
              success: true,
              data: {
                id: ss.getId(),
                name: ss.getName(),
                url: ss.getUrl()
              }
            });
          } catch (err) {
            return jsonResponse({ success: false, error: 'No se pudo vincular la hoja (' + targetId + '): ' + err.message });
          }
        }

        default:
          return jsonResponse({ success: false, error: 'Acción desconocida: ' + action });
      }
    }

    const isPageAdmin = Boolean(e && e.parameter && (e.parameter.page === 'admin' || e.parameter.view === 'admin'));
    const viewFile = isPageAdmin ? 'admin' : 'index';
    const viewTitle = isPageAdmin ? 'AliasDB // Panel de Administración' : 'AliasDB | Pagos Rápidos';
    const template = HtmlService.createTemplateFromFile(viewFile);
    return template.evaluate()
      .setTitle(viewTitle)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } catch (error) {
    if (e && e.parameter && (e.parameter.action || e.parameter.format === 'json')) {
      return jsonResponse({ success: false, error: error.message || String(error) });
    }
    console.error('Error renderizando index.html:', error);
    return HtmlService.createHtmlOutput(
      '<div style="font-family:sans-serif;padding:24px;text-align:center;">' +
      '<h2>AliasDB | Pagos Rápidos</h2>' +
      '<p>No se pudo cargar la vista principal: ' + error.message + '</p>' +
      '</div>'
    );
  }
}

/**
 * Manejador de solicitudes HTTP POST. Delega al router GET procesando JSON body si existe.
 * @param {Object} e Evento de petición HTTP
 * @returns {TextOutput} Salida HTTP JSON
 */
function doPost(e) {
  if (e && e.postData && e.postData.contents) {
    try {
      const parsed = JSON.parse(e.postData.contents);
      e.parameter = Object.assign({}, e.parameter || {}, parsed);
      if (parsed.payload && typeof parsed.payload === 'object') {
        e.parameter.payload = JSON.stringify(parsed.payload);
      }
    } catch (err) {
      // Contenido no JSON; continuar con parámetros estándar
    }
  }
  return doGet(e);
}

/**
 * Serializa un objeto a formato JSON con cabecera Content-Type correcta.
 * @param {Object} obj Datos a serializar
 * @returns {TextOutput} Objeto ContentService
 */
function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ===================================================================
// AUTENTICACIÓN Y SEGURIDAD ADMINISTRATIVA
// ===================================================================

/**
 * Normaliza una cadena de texto para comparaciones insensibles a mayúsculas, espacios y tildes.
 * @param {string} str Cadena a normalizar
 * @returns {string} Cadena normalizada sin tildes ni caracteres de control
 */
function normalizeText(str) {
  return String(str || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Computa el hash criptográfico SHA-256 en formato hexadecimal para proteger claves en reposo.
 * @param {string} key Clave en texto plano
 * @returns {string} Hash SHA-256 en minúsculas (64 caracteres)
 */
function hashKey(key) {
  if (!key) return '';
  const rawBytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(key).trim(), Utilities.Charset.UTF_8);
  let hex = '';
  for (let i = 0; i < rawBytes.length; i++) {
    const byteVal = (rawBytes[i] < 0) ? rawBytes[i] + 256 : rawBytes[i];
    const byteHex = byteVal.toString(16);
    hex += (byteHex.length === 1) ? '0' + byteHex : byteHex;
  }
  return hex.toLowerCase();
}

/**
 * Compara dos cadenas en tiempo constante para mitigar ataques de temporización (timing attacks).
 * @param {string} a Primera cadena
 * @param {string} b Segunda cadena
 * @returns {boolean} true si ambas cadenas son idénticas
 */
function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Valida la clave de administrador provista en la petición HTTP.
 * Requiere que ADMIN_KEY esté configurada en ScriptProperties; bloquea el acceso si no lo está.
 * @param {Object} e Evento de petición HTTP
 * @returns {TextOutput|null} null si la clave es válida; salida JSON con error si es inválida
 */
function requireAdmin(e) {
  const adminKey = (e && e.parameter && e.parameter.adminKey) ? String(e.parameter.adminKey).trim() : '';
  const scriptProps = PropertiesService.getScriptProperties();
  const storedKey = scriptProps.getProperty(ADMIN_KEY_PROP);

  if (!storedKey) {
    return jsonResponse({ success: false, error: 'ADMIN_KEY no configurada. Configure desde el menú AliasDB en Google Sheets.' });
  }

  if (!adminKey || !isValidAdminKey(adminKey)) {
    return jsonResponse({ success: false, error: 'No autorizado. adminKey inválida.' });
  }

  return null;
}

/**
 * Comprueba de forma booleana y criptográficamente segura si una clave provista coincide con ADMIN_KEY.
 * Soporta hashes SHA-256 nativos y migración transparente de claves heredadas en texto plano.
 * @param {string} key Clave a verificar
 * @returns {boolean} true si es válida
 */
function isValidAdminKey(key) {
  if (!key) return false;
  const scriptProps = PropertiesService.getScriptProperties();
  const storedKey = scriptProps.getProperty(ADMIN_KEY_PROP);
  if (!storedKey) return false;
  const cleanInput = String(key).trim();

  // Validación con hash SHA-256 (64 hex characters)
  if (/^[a-f0-9]{64}$/i.test(storedKey)) {
    return timingSafeEqual(hashKey(cleanInput), storedKey.toLowerCase());
  }

  // Migración transparente retrocompatible si la propiedad guardada era texto plano
  if (timingSafeEqual(cleanInput, storedKey)) {
    try {
      scriptProps.setProperty(ADMIN_KEY_PROP, hashKey(storedKey));
    } catch (migErr) {
      console.warn('No se pudo migrar ADMIN_KEY a SHA-256:', migErr);
    }
    return true;
  }
  return false;
}

/**
 * Valida si la petición proviene de un super-admin o del admin del grupo asociado a la persona.
 * @param {Object} e Evento de petición HTTP
 * @param {string} friendId Identificador de la persona
 * @returns {TextOutput|null} null si está autorizado, error JSON si no
 */
function requireAdminOrGroupAdmin(e, friendId) {
  if (isValidAdminKey(e && e.parameter && e.parameter.adminKey)) {
    return null;
  }
  const adminToken = e && e.parameter && (e.parameter.adminToken || e.parameter.admin || e.parameter.token);
  if (adminToken && friendId) {
    const cleanToken = String(adminToken).trim();
    const sheet = getAccountsSheet();
    const fullData = sheet.getDataRange().getValues();
    for (let i = 1; i < fullData.length; i++) {
      if (String(fullData[i][0]).trim() === friendId) {
        const idGrupo = String(fullData[i][11] || '').trim();
        const grp = idGrupo ? findGroupById(idGrupo) : findGroupByName(String(fullData[i][2] || '').trim());
        if (grp && grp.admin_token && grp.admin_token.toLowerCase() === cleanToken.toLowerCase()) {
          return null;
        }
      }
    }
  }
  return requireAdmin(e);
}

/**
 * Valida que el invocador sea superadministrador (adminKey) o administrador del grupo puntual.
 * @param {Object} e Evento de petición HTTP
 * @param {string} targetGroupNameOrId Nombre o id_grupo del grupo
 * @returns {TextOutput|null} null si está autorizado, error JSON si no
 */
function requireAdminOrGroupOwner(e, targetGroupNameOrId) {
  if (isValidAdminKey(e && e.parameter && e.parameter.adminKey)) {
    return null;
  }
  const adminToken = e && e.parameter && (e.parameter.adminToken || e.parameter.admin || e.parameter.token);
  if (adminToken && targetGroupNameOrId) {
    const cleanToken = String(adminToken).trim().toLowerCase();
    const grp = findGroupById(targetGroupNameOrId) || findGroupByName(targetGroupNameOrId);
    if (grp && grp.admin_token && grp.admin_token.toLowerCase() === cleanToken) {
      return null;
    }
  }
  return requireAdmin(e);
}

/**
 * Configura o actualiza la clave secreta de administración en ScriptProperties.
 * @param {string} key Nueva clave de administración
 * @returns {Object} Resultado de la operación
 */
function setAdminKey(key) {
  if (!key || typeof key !== 'string' || !key.trim()) {
    return { success: false, error: 'La clave de administración no puede estar vacía.' };
  }
  const cleanKey = key.trim();
  const hashed = hashKey(cleanKey);
  PropertiesService.getScriptProperties().setProperty(ADMIN_KEY_PROP, hashed);
  return { success: true, message: 'ADMIN_KEY actualizada y asegurada criptográficamente.' };
}

// ===================================================================
// SISTEMA DE GRUPOS Y TOKENS PRIVADOS
// ===================================================================

/**
 * Resuelve el nombre del grupo a partir de un token de acceso privado.
 * @param {string} token Token único del grupo
 * @returns {string|null} Nombre del grupo o null si el token no existe
 */
function resolveGroupFromToken(token) {
  if (!token) return null;
  const scriptProps = PropertiesService.getScriptProperties();
  const raw = scriptProps.getProperty(TOKEN_MAP_KEY);
  let map = {};
  if (raw) {
    try {
      map = JSON.parse(raw);
    } catch (e) {
      map = {};
    }
  }

  // Fallback garantizado para token de grupo MediaDocena
  if (!map['mediad_pbgi']) {
    map['mediad_pbgi'] = 'MediaDocena';
    try {
      scriptProps.setProperty(TOKEN_MAP_KEY, JSON.stringify(map));
    } catch (e) {}
  }

  const trimmed = String(token).trim();
  if (map[trimmed]) return map[trimmed];
  const lower = trimmed.toLowerCase();
  for (const k in map) {
    if (k.toLowerCase() === lower) return map[k];
  }

  // Buscar también en la hoja Grupos
  const group = findGroupByToken(trimmed);
  if (group) return group.nombre_grupo;

  return null;
}

/**
 * Genera y almacena un nuevo token de acceso para un grupo.
 * @param {string} groupName Nombre del grupo
 * @param {string} [customToken] Token específico opcional a registrar
 * @returns {string} Token generado (ej: 'futbol_a1b2')
 */
function generateGroupToken(groupName, customToken) {
  const cleanGroup = String(groupName || 'General').trim();
  let token = '';
  if (customToken && String(customToken).trim()) {
    token = String(customToken).trim().toLowerCase();
  } else {
    const prefix = normalizeText(cleanGroup)
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 6) || 'grp';
    token = prefix + '_' + Utilities.getUuid().slice(0, 4);
  }

  const scriptProps = PropertiesService.getScriptProperties();
  const raw = scriptProps.getProperty(TOKEN_MAP_KEY);
  let map = {};
  if (raw) {
    try {
      map = JSON.parse(raw);
    } catch (e) {
      map = {};
    }
  }
  map[token] = cleanGroup;
  scriptProps.setProperty(TOKEN_MAP_KEY, JSON.stringify(map));
  return token;
}

/**
 * Revoca y elimina un token de acceso de ScriptProperties.
 * @param {string} token Token a revocar
 * @returns {boolean} true si fue revocado, false si no existía
 */
function revokeGroupToken(token) {
  if (!token) return false;
  const trimmed = String(token).trim();
  const scriptProps = PropertiesService.getScriptProperties();
  const raw = scriptProps.getProperty(TOKEN_MAP_KEY);
  if (!raw) return false;
  try {
    const map = JSON.parse(raw);
    if (Object.prototype.hasOwnProperty.call(map, trimmed)) {
      delete map[trimmed];
      scriptProps.setProperty(TOKEN_MAP_KEY, JSON.stringify(map));
      return true;
    }
  } catch (e) {
    console.error('Error revocando token de grupo:', e);
  }
  return false;
}

/**
 * Retorna todos los tokens activos asociados a sus respectivos grupos.
 * @returns {Object} Mapa { [token]: groupName }
 */
function getAllGroupTokens() {
  const scriptProps = PropertiesService.getScriptProperties();
  const raw = scriptProps.getProperty(TOKEN_MAP_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error obteniendo tokens:', e);
    return {};
  }
}

/**
 * Obtiene la lista de nombres de grupos distintos registrados en la base de datos.
 * @returns {Array<string>} Lista ordenada de grupos
 */
function getDistinctGroups() {
  const sheet = getAccountsSheet();
  const fullData = sheet.getDataRange().getValues();
  const groups = new Set();
  if (fullData.length > 1) {
    for (let i = 1; i < fullData.length; i++) {
      const g = String(fullData[i][2] || '').trim();
      if (g) {
        const parts = g.split(',').map(s => s.trim()).filter(Boolean);
        parts.forEach(part => groups.add(part));
      }
    }
  }

  // Complementar con grupos registrados en hoja 'Grupos'
  try {
    const groupList = getAllGroupsList();
    groupList.forEach(function(gr) {
      if (gr.nombre_grupo && gr.estado === 'ACTIVO') {
        groups.add(gr.nombre_grupo);
      }
    });
  } catch (e) {}

  if (groups.size === 0) {
    return ['General'];
  }
  return Array.from(groups).sort(function(a, b) {
    return a.localeCompare(b, 'es', { sensitivity: 'base' });
  });
}

/**
 * Renombra un grupo en todas las filas de la hoja 'Cuentas' y actualiza sus tokens.
 * @param {string} oldName Nombre actual del grupo
 * @param {string} newName Nuevo nombre del grupo
 * @returns {Object} Resultado con la cantidad de filas actualizadas
 */
function renameGroupInternal(oldName, newName) {
  const lock = LockService.getScriptLock();
  try {
    const hasLock = lock.tryLock(15000);
    if (!hasLock) {
      return { success: false, error: 'Base de datos ocupada. Intente nuevamente en unos instantes.' };
    }

    const cleanOld = String(oldName || '').trim();
    const cleanNew = String(newName || '').trim();

    if (!cleanOld || !cleanNew) {
      return { success: false, error: 'Nombres de grupo origen y destino requeridos.' };
    }

    if (cleanOld === cleanNew) {
      return { success: true, updatedCount: 0, message: 'El nuevo nombre es idéntico al actual.' };
    }

    const sheet = getAccountsSheet();
    const fullData = sheet.getDataRange().getValues();
    if (fullData.length <= 1) {
      return { success: true, updatedCount: 0 };
    }

    const normOld = normalizeText(cleanOld);
    let updatedCount = 0;
    const rowsToUpdate = [];

    for (let i = 1; i < fullData.length; i++) {
      const row = fullData[i];
      while (row.length < HEADERS.length) {
        row.push('');
      }
      const currentGroup = String(row[2] || '').trim();
      const parts = currentGroup.split(',').map(s => s.trim()).filter(Boolean);
      let modified = false;
      const updatedParts = parts.map(function(grp) {
        const norm = normalizeText(grp);
        if (norm === normOld) {
          modified = true;
          return cleanNew;
        }
        return grp;
      });
      if (modified) {
        row[2] = Array.from(new Set(updatedParts)).join(', ');
        updatedCount++;
      }
      rowsToUpdate.push(row);
    }

    if (updatedCount > 0) {
      sheet.getRange(2, 1, rowsToUpdate.length, HEADERS.length).setValues(rowsToUpdate);
    }

    // Actualizar también en la hoja 'Grupos' si existe el registro
    try {
      const groupsSheet = getGroupsSheet();
      const gData = groupsSheet.getDataRange().getValues();
      for (let j = 1; j < gData.length; j++) {
        const gName = String(gData[j][1] || '').trim();
        const normG = normalizeText(gName);
        if (normG === normOld) {
          groupsSheet.getRange(j + 1, 2).setValue(cleanNew);
        }
      }
    } catch (gErr) {
      console.warn('Error actualizando hoja Grupos durante renameGroup:', gErr);
    }

    // Actualizar también los tokens en ScriptProperties que apunten a cleanOld
    const scriptProps = PropertiesService.getScriptProperties();
    const rawTokens = scriptProps.getProperty(TOKEN_MAP_KEY);
    if (rawTokens) {
      try {
        const tokenMap = JSON.parse(rawTokens);
        let tokensUpdated = false;
        Object.keys(tokenMap).forEach(function(token) {
          const tGroup = String(tokenMap[token] || '').trim();
          const normTGroup = normalizeText(tGroup);
          if (normTGroup === normOld) {
            tokenMap[token] = cleanNew;
            tokensUpdated = true;
          }
        });
        if (tokensUpdated) {
          scriptProps.setProperty(TOKEN_MAP_KEY, JSON.stringify(tokenMap));
        }
      } catch (err) {
        console.warn('Error actualizando tokens durante renombre de grupo:', err);
      }
    }

    invalidateGroupsCache();

    return {
      success: true,
      updatedCount: updatedCount,
      oldName: cleanOld,
      newName: cleanNew
    };
  } catch (error) {
    console.error('Error en renameGroupInternal:', error);
    return { success: false, error: error.message || String(error) };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Elimina un grupo del sistema:
 * 1. Remueve el registro en la hoja 'Grupos'.
 * 2. Limpia o reasigna el grupo en la hoja 'Cuentas' (si una persona queda sin grupos, pasa a 'General').
 * 3. Elimina los tokens asociados al grupo en ScriptProperties (GROUP_TOKENS).
 * @param {string} targetIdentifier Nombre o identificador del grupo a eliminar
 * @returns {Object} { success: true, deletedGroup: string, updatedPersons: number }
 */
function deleteGroupInternal(targetIdentifier) {
  const lock = LockService.getScriptLock();
  try {
    const hasLock = lock.tryLock(15000);
    if (!hasLock) {
      return { success: false, error: 'Base de datos ocupada. Intente nuevamente en unos instantes.' };
    }

    const cleanTarget = String(targetIdentifier || '').trim();
    if (!cleanTarget) {
      return { success: false, error: 'Nombre o identificador de grupo requerido.' };
    }

    if (cleanTarget.toLowerCase() === 'general') {
      return { success: false, error: 'El grupo predeterminado "General" no puede ser eliminado.' };
    }

    // 1. Identificar el grupo en la hoja 'Grupos'
    const targetGroup = findGroupById(cleanTarget) || findGroupByName(cleanTarget);
    const targetName = targetGroup ? targetGroup.nombre_grupo : cleanTarget;
    const targetId = targetGroup ? targetGroup.id_grupo : '';
    const normTarget = normalizeText(targetName);

    // 2. Eliminar o purgar de la hoja 'Grupos'
    try {
      const groupsSheet = getGroupsSheet();
      const gData = groupsSheet.getDataRange().getValues();
      if (gData.length > 1) {
        const remainingGroupRows = [gData[0]];
        for (let j = 1; j < gData.length; j++) {
          const row = gData[j];
          const gId = String(row[0] || '').trim();
          const gName = String(row[1] || '').trim();
          const normG = normalizeText(gName);
          if (normG === normTarget || (targetId && gId.toLowerCase() === targetId.toLowerCase())) {
            continue; // omitir fila del grupo eliminado
          }
          remainingGroupRows.push(row);
        }
        groupsSheet.clearContents();
        if (remainingGroupRows.length > 0) {
          groupsSheet.getRange(1, 1, remainingGroupRows.length, GROUPS_HEADERS.length).setValues(remainingGroupRows);
        }
      }
    } catch (gErr) {
      console.warn('Error purgando registro de hoja Grupos:', gErr);
    }

    // 3. Actualizar la hoja 'Cuentas'
    const sheet = getAccountsSheet();
    const fullData = sheet.getDataRange().getValues();
    let updatedPersonsCount = 0;

    if (fullData.length > 1) {
      const rowsToUpdate = [];
      for (let i = 1; i < fullData.length; i++) {
        const row = fullData[i];
        while (row.length < HEADERS.length) {
          row.push('');
        }
        const currentGroup = String(row[2] || '').trim();
        const parts = currentGroup.split(',').map(function(s) { return s.trim(); }).filter(Boolean);
        const filteredParts = parts.filter(function(grp) {
          const norm = normalizeText(grp);
          return norm !== normTarget;
        });

        let modified = (filteredParts.length !== parts.length);
        if (modified) {
          if (filteredParts.length === 0) {
            row[2] = 'General';
          } else {
            row[2] = Array.from(new Set(filteredParts)).join(', ');
          }
          if (targetId && String(row[11] || '').trim().toLowerCase() === targetId.toLowerCase()) {
            row[11] = '';
          }
          updatedPersonsCount++;
        }
        rowsToUpdate.push(row);
      }

      if (updatedPersonsCount > 0) {
        sheet.getRange(2, 1, rowsToUpdate.length, HEADERS.length).setValues(rowsToUpdate);
      }
    }

    // 4. Purgar tokens asociados en ScriptProperties (TOKEN_MAP_KEY)
    const scriptProps = PropertiesService.getScriptProperties();
    const rawTokens = scriptProps.getProperty(TOKEN_MAP_KEY);
    if (rawTokens) {
      try {
        const tokenMap = JSON.parse(rawTokens);
        let tokensUpdated = false;
        Object.keys(tokenMap).forEach(function(token) {
          const tGroup = String(tokenMap[token] || '').trim();
          const normTGroup = normalizeText(tGroup);
          if (normTGroup === normTarget || (targetGroup && (token === targetGroup.read_token || token === targetGroup.admin_token))) {
            delete tokenMap[token];
            tokensUpdated = true;
          }
        });
        if (tokensUpdated) {
          scriptProps.setProperty(TOKEN_MAP_KEY, JSON.stringify(tokenMap));
        }
      } catch (err) {
        console.warn('Error purgando tokens al eliminar grupo:', err);
      }
    }

    invalidateGroupsCache();
    SpreadsheetApp.flush();

    return {
      success: true,
      deletedGroup: targetName,
      updatedPersons: updatedPersonsCount,
      message: 'Grupo "' + targetName + '" eliminado correctamente.'
    };
  } catch (error) {
    console.error('Error en deleteGroupInternal:', error);
    return { success: false, error: error.message || String(error) };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Permite incluir archivos parciales (.html, .css, .js) dentro de vistas templadas.
 * Uso en HTML: <?!= include('FileName'); ?>
 * @param {string} filename Nombre del archivo sin extensión
 * @returns {string} Contenido HTML crudo
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// ===================================================================
// BASE DE DATOS Y GESTIÓN DE GOOGLE SHEETS
// ===================================================================

/**
 * Obtiene o crea la hoja de cálculo de Google Sheets.
 * Soporta hoja activa (container-bound) y modo Standalone con persistencia de SPREADSHEET_ID.
 * @returns {Spreadsheet} Instancia de la hoja de cálculo
 */
function getSpreadsheet() {
  // 1. Intentar obtener hoja activa vinculada
  try {
    const active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) return active;
  } catch (e) {
    // Modo standalone no posee hoja activa
  }

  // 2. Modo autónomo: buscar ID en propiedades de script
  const scriptProps = PropertiesService.getScriptProperties();
  const savedId = scriptProps.getProperty(SPREADSHEET_PROP_KEY);

  if (savedId) {
    try {
      const opened = SpreadsheetApp.openById(savedId);
      if (opened) return opened;
    } catch (e) {
      console.warn('ID de hoja guardado inválido o inaccesible (' + savedId + '). Creando nueva hoja...');
    }
  }

  // 3. Fallback: Crear nueva hoja y registrar ID en propiedades del script
  const newSpreadsheet = SpreadsheetApp.create('DB_Personas_Alias');
  scriptProps.setProperty(SPREADSHEET_PROP_KEY, newSpreadsheet.getId());
  console.log('Nueva base de datos creada. ID registrado:', newSpreadsheet.getId());
  return newSpreadsheet;
}

/**
 * Obtiene la hoja 'Cuentas'. La crea con cabeceras y seeding si está vacía.
 * Si ya existe con formato anterior, expande sus encabezados para soportar columnas extendidas.
 * @returns {Sheet} Instancia de la pestaña 'Cuentas'
 */
function getAccountsSheet() {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    const sheets = ss.getSheets();
    if (sheets.length === 1 && sheets[0].getLastRow() === 0 && sheets[0].getName() !== SHEET_NAME) {
      sheet = sheets[0];
      sheet.setName(SHEET_NAME);
    } else {
      sheet = ss.insertSheet(SHEET_NAME);
    }
  }

  // Inicialización de encabezados si la hoja está recién creada
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#F1F3F4');
    headerRange.setFontColor('#202124');
    sheet.setFrozenRows(1);
    seedDemoData(sheet);
  } else {
    // Si la hoja ya existía con cabeceras antiguas (menos columnas), expandir cabecera
    const currentCols = sheet.getLastColumn();
    if (currentCols < HEADERS.length) {
      sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    }
  }

  // Asegurar que la hoja 'Grupos' exista en la hoja de cálculo
  try {
    getGroupsSheet();
  } catch (err) {
    console.warn('Error inicializando hoja Grupos desde getAccountsSheet:', err);
  }

  return sheet;
}

/**
 * Obtiene la hoja 'Grupos'. La crea con cabeceras y seeding inicial si no existe.
 * @returns {Sheet} Instancia de la pestaña 'Grupos'
 */
function getGroupsSheet() {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(GROUPS_SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(GROUPS_SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(GROUPS_HEADERS);
    const headerRange = sheet.getRange(1, 1, 1, GROUPS_HEADERS.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#F1F3F4');
    headerRange.setFontColor('#202124');
    sheet.setFrozenRows(1);
    seedDefaultGroups(sheet);
  }

  return sheet;
}

/**
 * Carga los grupos iniciales predefinidos en la hoja 'Grupos' y sincroniza tokens.
 * @param {Sheet} [sheet] Pestaña de grupos opcional
 */
function seedDefaultGroups(sheet) {
  invalidateGroupsCache();
  const targetSheet = sheet || getGroupsSheet();
  const now = new Date().toISOString();
  const rows = DEFAULT_GROUPS_SEED.map(function(g) {
    return [
      g.id,
      g.name,
      g.readToken,
      g.adminToken,
      g.estado || 'ACTIVO',
      now
    ];
  });
  targetSheet.getRange(2, 1, rows.length, GROUPS_HEADERS.length).setValues(rows);
  syncGroupTokensToProperties();
}

/** Caché en memoria para evitar lecturas redundantes de la hoja 'Grupos' por request */
let _groupsCache = null;

/**
 * Invalida la caché en memoria de grupos para forzar lectura fresca en la siguiente consulta.
 */
function invalidateGroupsCache() {
  _groupsCache = null;
}

/**
 * Obtiene todos los grupos registrados en la hoja 'Grupos' con optimización de caché por petición.
 * @param {boolean} [forceRefresh=false] Indica si se debe ignorar la caché y reconsultar la hoja
 * @returns {Array<Object>} Lista de grupos
 */
function getAllGroupsList(forceRefresh) {
  if (_groupsCache !== null && !forceRefresh) {
    return _groupsCache;
  }
  try {
    const sheet = getGroupsSheet();
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      _groupsCache = [];
      return [];
    }
    const list = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const id = String(row[0] || '').trim();
      const name = String(row[1] || '').trim();
      if (!id && !name) continue;
      list.push({
        id_grupo: id,
        nombre_grupo: name,
        read_token: String(row[2] || '').trim(),
        admin_token: String(row[3] || '').trim(),
        estado: String(row[4] || 'ACTIVO').trim(),
        created_at: String(row[5] || '').trim()
      });
    }
    _groupsCache = list;
    return list;
  } catch (err) {
    console.error('Error en getAllGroupsList:', err);
    return [];
  }
}

/**
 * Busca un grupo por token (read_token o admin_token).
 * @param {string} token
 * @returns {Object|null}
 */
function findGroupByToken(token) {
  if (!token) return null;
  const clean = String(token).trim().toLowerCase();
  const groups = getAllGroupsList();
  for (let i = 0; i < groups.length; i++) {
    const g = groups[i];
    if (g.read_token && g.read_token.toLowerCase() === clean) return g;
    if (g.admin_token && g.admin_token.toLowerCase() === clean) return g;
  }
  return null;
}

/**
 * Busca un grupo exclusivamente por su admin_token.
 * @param {string} token
 * @returns {Object|null}
 */
function findGroupByAdminToken(token) {
  if (!token) return null;
  const clean = String(token).trim().toLowerCase();
  const groups = getAllGroupsList();
  for (let i = 0; i < groups.length; i++) {
    const g = groups[i];
    if (g.admin_token && g.admin_token.toLowerCase() === clean) return g;
  }
  return null;
}

/**
 * Busca un grupo por su id_grupo.
 * @param {string} id
 * @returns {Object|null}
 */
function findGroupById(id) {
  if (!id) return null;
  const clean = String(id).trim().toLowerCase();
  const groups = getAllGroupsList();
  for (let i = 0; i < groups.length; i++) {
    const g = groups[i];
    if (g.id_grupo && g.id_grupo.toLowerCase() === clean) return g;
  }
  return null;
}

/**
 * Busca un grupo por su nombre (insensible a acentos y mayúsculas).
 * @param {string} name
 * @returns {Object|null}
 */
function findGroupByName(name) {
  if (!name) return null;
  const clean = normalizeText(name);
  const groups = getAllGroupsList();
  for (let i = 0; i < groups.length; i++) {
    const g = groups[i];
    const norm = normalizeText(g.nombre_grupo);
    if (norm === clean) return g;
  }
  return null;
}

/**
 * Retorna el id_grupo correspondiente a un nombre de grupo.
 * @param {string} name
 * @returns {string}
 */
function getGroupIdByName(name) {
  const g = findGroupByName(name);
  return g ? g.id_grupo : '';
}

/**
 * Sincroniza todos los tokens de la hoja 'Grupos' hacia ScriptProperties (GROUP_TOKENS).
 */
function syncGroupTokensToProperties() {
  try {
    const scriptProps = PropertiesService.getScriptProperties();
    const raw = scriptProps.getProperty(TOKEN_MAP_KEY);
    let map = {};
    if (raw) {
      try { map = JSON.parse(raw); } catch (e) { map = {}; }
    }
    map['mediad_pbgi'] = map['mediad_pbgi'] || 'MediaDocena';
    const groups = getAllGroupsList();
    groups.forEach(function(g) {
      if (g.read_token) map[g.read_token] = g.nombre_grupo;
      if (g.admin_token) map[g.admin_token] = g.nombre_grupo;
    });
    scriptProps.setProperty(TOKEN_MAP_KEY, JSON.stringify(map));
  } catch (err) {
    console.warn('Error sincronizando tokens a ScriptProperties:', err);
  }
}

/**
 * Crea un nuevo grupo de forma autoservicio generando identificadores y tokens UUID.
 * @param {Object|string} params Objeto con propiedad 'nombre' o nombre directo
 * @returns {Object} Respuesta { success: true, data: { id, name, readToken, adminToken } }
 */
function createGroupInternal(params) {
  const lock = LockService.getScriptLock();
  try {
    const hasLock = lock.tryLock(15000);
    if (!hasLock) {
      return { success: false, error: 'Base de datos ocupada. Intente nuevamente en unos instantes.' };
    }

    const name = (typeof params === 'string' ? params : (params && (params.nombre || params.name || params.nombre_grupo))) || '';
    const cleanName = String(name).trim();
    if (!cleanName) {
      return { success: false, error: 'El nombre del grupo es obligatorio.' };
    }

    const existingGroup = findGroupByName(cleanName);
    if (existingGroup && existingGroup.read_token && existingGroup.admin_token) {
      return {
        success: true,
        data: {
          id: existingGroup.id_grupo,
          name: existingGroup.nombre_grupo,
          readToken: existingGroup.read_token,
          adminToken: existingGroup.admin_token
        }
      };
    }

    const sheet = getGroupsSheet();

    // Generar o adoptar UUIDs para id_grupo, read_token, admin_token
    const passedAdminToken = (params && typeof params === 'object' && (params.adminToken || params.admin_token)) ? String(params.adminToken || params.admin_token).trim() : '';
    const passedReadToken = (params && typeof params === 'object' && (params.readToken || params.read_token)) ? String(params.readToken || params.read_token).trim() : '';

    const idSuffix = Utilities.getUuid().replace(/-/g, '').slice(0, 8);
    const readSuffix = Utilities.getUuid().replace(/-/g, '').slice(0, 8);
    const adminSuffix = Utilities.getUuid().replace(/-/g, '').slice(0, 12);

    const idGrupo = 'grp_' + idSuffix;
    const readToken = passedReadToken || ('view_' + readSuffix);
    const adminToken = passedAdminToken || ('adm_' + adminSuffix);
    const now = new Date().toISOString();
    const estado = 'ACTIVO';

    // Almacenar en hoja 'Grupos'
    sheet.appendRow([
      idGrupo,
      cleanName,
      readToken,
      adminToken,
      estado,
      now
    ]);

    // Actualizar GROUP_TOKENS en ScriptProperties para retrocompatibilidad
    try {
      const scriptProps = PropertiesService.getScriptProperties();
      const raw = scriptProps.getProperty(TOKEN_MAP_KEY);
      let map = {};
      if (raw) {
        try { map = JSON.parse(raw); } catch (e) { map = {}; }
      }
      map[readToken] = cleanName;
      map[adminToken] = cleanName;
      map['mediad_pbgi'] = map['mediad_pbgi'] || 'MediaDocena';
      scriptProps.setProperty(TOKEN_MAP_KEY, JSON.stringify(map));
    } catch (propErr) {
      console.warn('Error actualizando GROUP_TOKENS en createGroup:', propErr);
    }

    invalidateGroupsCache();
    SpreadsheetApp.flush();

    return {
      success: true,
      data: {
        id: idGrupo,
        name: cleanName,
        readToken: readToken,
        adminToken: adminToken,
        id_grupo: idGrupo,
        nombre_grupo: cleanName,
        read_token: readToken,
        admin_token: adminToken
      }
    };
  } catch (error) {
    console.error('Error en createGroupInternal:', error);
    return { success: false, error: error.message || String(error) };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Carga los datos de demostración en la hoja especificada asegurando 13 columnas completas.
 * @param {Sheet} sheet Pestaña de la hoja
 */
function seedDemoData(sheet) {
  const rows = [];
  DEMO_FRIENDS.forEach(function(friend) {
    const friendIdGrupo = friend.id_grupo || getGroupIdByName(friend.group) || '';
    const friendEditToken = 'edt_' + friend.id.replace('persona_', '').slice(0, 10);
    friend.accounts.forEach(function(acc) {
      rows.push([
        friend.id,
        friend.name,
        friend.group,
        acc.id,
        acc.bank,
        acc.type,
        acc.alias,
        acc.cbu,
        acc.titular || '',
        'CONFIRMADO',
        friendEditToken,
        friendIdGrupo,
        ''
      ]);
    });
  });

  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, HEADERS.length).setValues(rows);
  }
}

// ===================================================================
// MÉTODOS RPC EXPUESTOS PARA google.script.run
// ===================================================================

/**
 * Devuelve todas las personas con sus cuentas agrupadas, con soporte opcional de filtro por grupo.
 * @param {string} [groupFilter] Filtro opcional por grupo
 * Respuesta: { success: true, data: [{ id, name, group, avatar, accounts: [...] }] }
 */
function getFriendsData(groupFilter) {
  try {
    const friends = getFriendsDataInternal(groupFilter, { isAdmin: true });
    return { success: true, data: friends };
  } catch (error) {
    console.error('Error en getFriendsData:', error);
    return { success: false, error: error.message || String(error) };
  }
}

/** Alias para compatibilidad terminológica */
function getPersonasData(groupFilter) {
  return getFriendsData(groupFilter);
}

/**
 * Crea o actualiza una persona con sus respectivas cuentas bancarias.
 * Admite guardado por Super-Admin (CONFIRMADO), Group-Admin (CONFIRMADO) o Público/Anónimo (PENDIENTE con datos_previos).
 * @param {Object|string} friendObj Objeto con id, name, group y array accounts
 * @param {Object} [options] Opciones de autorización (adminKey, adminToken, editToken, isRestCall)
 * @returns {Object} Respuesta { success: true, data: friendObj, isPending: boolean, editToken?: string }
 */
function saveFriendWithAccounts(friendObj, options) {
  const lock = LockService.getScriptLock();
  try {
    const hasLock = lock.tryLock(15000);
    if (!hasLock) {
      return { success: false, error: 'Base de datos ocupada. Intente nuevamente en unos instantes.' };
    }

    if (typeof friendObj === 'string') {
      try {
        friendObj = JSON.parse(friendObj);
      } catch (e) {
        return { success: false, error: 'Formato JSON inválido.' };
      }
    }

    if (!friendObj || typeof friendObj !== 'object') {
      return { success: false, error: 'Estructura de persona inválida.' };
    }

    const name = (friendObj.name || friendObj.nombre_persona || '').trim();
    if (!name) {
      return { success: false, error: 'El nombre de la persona es obligatorio.' };
    }

    let groupsArray = [];
    if (Array.isArray(friendObj.groups)) {
      groupsArray = friendObj.groups.map(g => String(g).trim()).filter(Boolean);
    } else if (friendObj.group || friendObj.grupo) {
      groupsArray = String(friendObj.group || friendObj.grupo).split(',').map(s => s.trim()).filter(Boolean);
    }
    if (groupsArray.length === 0) groupsArray = ['General'];
    groupsArray = Array.from(new Set(groupsArray));
    const group = groupsArray.join(', ');

    let idGrupo = (friendObj.id_grupo || (options && options.id_grupo) || '').trim();
    const callerToken = (options && options.token) || friendObj.token || '';
    if (!idGrupo && callerToken) {
      const grpByTok = findGroupByToken(callerToken);
      if (grpByTok) {
        idGrupo = grpByTok.id_grupo;
        if (groupsArray.length === 0 || (groupsArray.length === 1 && groupsArray[0] === 'General')) {
          groupsArray = [grpByTok.nombre_grupo];
          group = grpByTok.nombre_grupo;
        }
      }
    }
    if (!idGrupo && groupsArray.length > 0) {
      idGrupo = getGroupIdByName(groupsArray[0]);
    }

    const friendId = (friendObj.id || friendObj.id_persona || ('persona_' + Utilities.getUuid().slice(0, 8))).trim();

    let rawAccounts = friendObj.accounts;
    if (typeof rawAccounts === 'string') {
      try { rawAccounts = JSON.parse(rawAccounts); } catch (e) { rawAccounts = []; }
    }
    if (!Array.isArray(rawAccounts)) rawAccounts = [];
    if (rawAccounts.length === 0 && (friendObj.alias || friendObj.cbu || friendObj.cbu_cvu || friendObj.bank || friendObj.bankName || friendObj.entidad_banco)) {
      rawAccounts = [{
        id: friendObj.id_cuenta || ('acc_' + Utilities.getUuid().slice(0, 8)),
        bank: friendObj.bank || friendObj.bankName || friendObj.entidad_banco || '',
        type: friendObj.type || friendObj.tipo_cuenta || 'Caja de Ahorro',
        alias: friendObj.alias || '',
        cbu: friendObj.cbu || friendObj.cbu_cvu || '',
        titular: friendObj.titular || friendObj.titular_diferente || ''
      }];
    }

    const sheet = getAccountsSheet();
    const fullData = sheet.getDataRange().getValues();
    const existingRows = fullData.length > 1 ? fullData.slice(1) : [];

    // Localizar filas existentes de esta persona
    const matchingRows = existingRows.filter(function(r) {
      return String(r[0]).trim() === friendId;
    });
    const isExisting = matchingRows.length > 0;

    // Determinar rol del llamador
    const adminKey = (options && options.adminKey) ? String(options.adminKey).trim() : (friendObj.adminKey ? String(friendObj.adminKey).trim() : '');
    let adminToken = (options && options.adminToken) ? String(options.adminToken).trim() : (friendObj.adminToken || friendObj.admin ? String(friendObj.adminToken || friendObj.admin).trim() : '');
    if (!adminToken && callerToken && callerToken.toLowerCase().indexOf('adm_') === 0) {
      adminToken = callerToken;
    }
    const callerEditToken = (options && options.editToken) ? String(options.editToken).trim() : (friendObj.editToken || friendObj.edit_token ? String(friendObj.editToken || friendObj.edit_token).trim() : '');

    let isSuperAdmin = isValidAdminKey(adminKey);
    let isGroupAdmin = false;

    if (!isSuperAdmin && adminToken) {
      const cleanAdminTok = String(adminToken).trim().toLowerCase();
      const matchedGrp = findGroupByAdminToken(cleanAdminTok);
      if (matchedGrp) {
        const mgName = (matchedGrp.nombre_grupo || '').toLowerCase().trim();
        const mgId = (matchedGrp.id_grupo || '').toLowerCase().trim();
        const inGroupList = groupsArray.some(g => g.toLowerCase().trim() === mgName);
        if (!idGrupo || (mgId && idGrupo.toLowerCase() === mgId) || inGroupList) {
          isGroupAdmin = true;
          if (!idGrupo) idGrupo = matchedGrp.id_grupo;
        }
      }
      if (!isGroupAdmin) {
        let grp = null;
        if (idGrupo) grp = findGroupById(idGrupo);
        if (!grp && groupsArray.length > 0) grp = findGroupByName(groupsArray[0]);
        if (grp && grp.admin_token && grp.admin_token.toLowerCase() === cleanAdminTok) {
          isGroupAdmin = true;
        }
      }
    }

    // Si es llamada RPC nativa de Apps Script (no REST), asume privilegios administrativos
    if (!options || !options.isRestCall) {
      isSuperAdmin = true;
    }

    const isAdmin = isSuperAdmin || isGroupAdmin;

    let finalEstado = 'CONFIRMADO';
    let finalDatosPrevios = '';
    let finalEditToken = '';

    if (isAdmin) {
      finalEstado = 'CONFIRMADO';
      finalDatosPrevios = ''; // Confirma y limpia datos_previos
      if (isExisting) {
        finalEditToken = String(matchingRows[0][10] || callerEditToken || ('edt_' + Utilities.getUuid().slice(0, 10))).trim();
      } else {
        finalEditToken = callerEditToken || ('edt_' + Utilities.getUuid().slice(0, 10));
      }
    } else {
      // Miembro Anónimo / Público -> guarda como PENDIENTE
      finalEstado = 'PENDIENTE';

      if (isExisting) {
        finalEditToken = String(matchingRows[0][10] || callerEditToken || ('edt_' + Utilities.getUuid().slice(0, 10))).trim();

        // Almacenar datos previos si aún no tiene snapshot o si el estado era CONFIRMADO
        const existingEstado = String(matchingRows[0][9] || 'CONFIRMADO').trim();
        const existingPrev = matchingRows[0][12] ? String(matchingRows[0][12]).trim() : '';

        if (existingEstado === 'CONFIRMADO' || !existingPrev) {
          const prevAccounts = [];
          matchingRows.forEach(function(r) {
            if (r[3] || r[4] || r[6] || r[7]) {
              prevAccounts.push({
                id: String(r[3] || '').trim(),
                bank: String(r[4] || '').trim(),
                type: String(r[5] || '').trim(),
                alias: String(r[6] || '').trim(),
                cbu: String(r[7] || '').trim(),
                titular: String(r[8] || '').trim()
              });
            }
          });
          const snapshot = {
            id: friendId,
            name: String(matchingRows[0][1] || '').trim(),
            group: String(matchingRows[0][2] || '').trim(),
            groups: String(matchingRows[0][2] || '').split(',').map(s => s.trim()).filter(Boolean),
            id_grupo: String(matchingRows[0][11] || '').trim(),
            accounts: prevAccounts
          };
          finalDatosPrevios = JSON.stringify(snapshot);
        } else {
          finalDatosPrevios = existingPrev;
        }
      } else {
        finalDatosPrevios = '';
        finalEditToken = callerEditToken || ('edt_' + Utilities.getUuid().slice(0, 10));
      }
    }

    // Normalizar cuentas entrantes
    const normalizedAccounts = [];
    const newFriendRows = [];

    if (rawAccounts.length === 0) {
      newFriendRows.push([
        friendId,
        name,
        group,
        '',
        '',
        '',
        '',
        '',
        '',
        finalEstado,
        finalEditToken,
        idGrupo,
        finalDatosPrevios
      ]);
    } else {
      rawAccounts.forEach(function(acc, idx) {
        const accId = (acc.id || acc.id_cuenta || ('acc_' + Utilities.getUuid().slice(0, 8) + '_' + (idx + 1))).trim();
        const bank = (acc.bank || acc.bankName || acc.entidad_banco || '').trim();
        const type = (acc.type || acc.tipo_cuenta || 'Caja de Ahorro').trim();
        const alias = (acc.alias || '').trim();
        const cbu = (acc.cbu || acc.cbu_cvu || '').trim();
        const titular = (acc.titular || acc.titular_diferente || '').trim();

        normalizedAccounts.push({
          id: accId,
          bank: bank,
          type: type,
          alias: alias,
          cbu: cbu,
          titular: titular
        });

        newFriendRows.push([
          friendId,
          name,
          group,
          accId,
          bank,
          type,
          alias,
          cbu,
          titular,
          finalEstado,
          finalEditToken,
          idGrupo,
          finalDatosPrevios
        ]);
      });
    }

    // Mantener la posición relativa si la persona ya existía
    let firstExistingIndex = -1;
    const remainingRows = [];

    for (let i = 0; i < existingRows.length; i++) {
      const rowFriendId = String(existingRows[i][0]).trim();
      if (rowFriendId === friendId) {
        if (firstExistingIndex === -1) {
          firstExistingIndex = remainingRows.length;
        }
      } else {
        const r = existingRows[i];
        while (r.length < HEADERS.length) {
          r.push('');
        }
        remainingRows.push(r);
      }
    }

    if (firstExistingIndex !== -1) {
      remainingRows.splice(firstExistingIndex, 0, ...newFriendRows);
    } else {
      remainingRows.push(...newFriendRows);
    }

    // Reescribir filas en la hoja
    const totalExistingDataRows = fullData.length - 1;
    if (totalExistingDataRows > 0) {
      sheet.getRange(2, 1, totalExistingDataRows, HEADERS.length).clearContent();
    }

    if (remainingRows.length > 0) {
      sheet.getRange(2, 1, remainingRows.length, HEADERS.length).setValues(remainingRows);
    }
    invalidateGroupsCache();
    SpreadsheetApp.flush();

    const savedData = {
      id: friendId,
      name: name,
      group: group,
      groups: groupsArray,
      avatar: getInitials(name),
      estado: finalEstado,
      id_grupo: idGrupo,
      accounts: normalizedAccounts
    };

    if (finalEstado === 'PENDIENTE') {
      return {
        success: true,
        data: savedData,
        isPending: true,
        editToken: finalEditToken,
        estado: 'PENDIENTE'
      };
    }

    return {
      success: true,
      data: savedData,
      isPending: false,
      editToken: finalEditToken,
      estado: 'CONFIRMADO'
    };
  } catch (error) {
    console.error('Error en saveFriendWithAccounts:', error);
    return { success: false, error: error.message || String(error) };
  } finally {
    lock.releaseLock();
  }
}

/** Alias para compatibilidad terminológica */
function savePersonaWithAccounts(personaObj, options) {
  return saveFriendWithAccounts(personaObj, options);
}

/**
 * Confirma un contacto en estado PENDIENTE, cambiando su estado a CONFIRMADO y limpiando datos_previos.
 * Requiere adminToken del grupo o adminKey global.
 * @param {Object} e Evento de petición HTTP con parámetros id, adminToken o adminKey
 * @returns {Object} Respuesta { success: true, message: 'Confirmado' }
 */
function confirmFriendInternal(e) {
  const lock = LockService.getScriptLock();
  try {
    const hasLock = lock.tryLock(15000);
    if (!hasLock) {
      return { success: false, error: 'Base de datos ocupada. Intente nuevamente en unos instantes.' };
    }

    const friendId = (e.parameter.id || e.parameter.friendId || e.parameter.id_persona || '').trim();
    if (!friendId) {
      return { success: false, error: 'Identificador de persona requerido (id).' };
    }

    const sheet = getAccountsSheet();
    const fullData = sheet.getDataRange().getValues();
    if (fullData.length <= 1) {
      return { success: false, error: 'Persona no encontrada.' };
    }

    const rows = fullData.slice(1);
    const matchingRows = rows.filter(r => String(r[0]).trim() === friendId);
    if (matchingRows.length === 0) {
      return { success: false, error: 'Persona no encontrada con ID: ' + friendId };
    }

    const friendGroup = String(matchingRows[0][2] || '').trim();
    const friendIdGrupo = String(matchingRows[0][11] || '').trim();

    // Validar autorización: adminKey global o adminToken de grupo
    const adminKey = (e.parameter.adminKey || '').trim();
    const adminToken = (e.parameter.adminToken || e.parameter.admin || e.parameter.token || '').trim();

    const isSuper = isValidAdminKey(adminKey);
    let isGroupAdmin = false;

    if (!isSuper && adminToken) {
      const cleanTok = String(adminToken).trim().toLowerCase();
      const matchedGrp = findGroupByAdminToken(cleanTok);
      if (matchedGrp) {
        const mgName = (matchedGrp.nombre_grupo || '').toLowerCase().trim();
        const mgId = (matchedGrp.id_grupo || '').toLowerCase().trim();
        const fGrpList = friendGroup.split(',').map(s => s.trim().toLowerCase());
        if (!friendIdGrupo || (mgId && friendIdGrupo.toLowerCase() === mgId) || fGrpList.includes(mgName)) {
          isGroupAdmin = true;
        }
      }
      if (!isGroupAdmin) {
        let grp = null;
        if (friendIdGrupo) grp = findGroupById(friendIdGrupo);
        if (!grp && friendGroup) grp = findGroupByName(friendGroup);
        if (grp && grp.admin_token && grp.admin_token.toLowerCase() === cleanTok) {
          isGroupAdmin = true;
        }
      }
    }

    if (!isSuper && !isGroupAdmin) {
      return { success: false, error: 'No autorizado. Se requiere adminToken de grupo o adminKey global.' };
    }

    // Actualizar estado a CONFIRMADO y limpiar datos_previos
    const updatedRows = rows.map(function(r) {
      while (r.length < HEADERS.length) r.push('');
      if (String(r[0]).trim() === friendId) {
        r[9] = 'CONFIRMADO';
        r[12] = '';
      }
      return r;
    });

    sheet.getRange(2, 1, updatedRows.length, HEADERS.length).setValues(updatedRows);
    invalidateGroupsCache();
    SpreadsheetApp.flush();

    return {
      success: true,
      message: 'Confirmado',
      id: friendId
    };
  } catch (error) {
    console.error('Error en confirmFriendInternal:', error);
    return { success: false, error: error.message || String(error) };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Descarta los cambios pendientes de un contacto.
 * Si existían datos_previos, los restaura y marca CONFIRMADO. Si es un registro nuevo sin datos previos, lo elimina.
 * Requiere adminToken del grupo o adminKey global.
 * @param {Object} e Evento de petición HTTP con parámetros id, adminToken o adminKey
 * @returns {Object} Respuesta { success: true, message: 'Descartado' }
 */
function rejectFriendInternal(e) {
  const lock = LockService.getScriptLock();
  try {
    const hasLock = lock.tryLock(15000);
    if (!hasLock) {
      return { success: false, error: 'Base de datos ocupada. Intente nuevamente en unos instantes.' };
    }

    const friendId = (e.parameter.id || e.parameter.friendId || e.parameter.id_persona || '').trim();
    if (!friendId) {
      return { success: false, error: 'Identificador de persona requerido (id).' };
    }

    const sheet = getAccountsSheet();
    const fullData = sheet.getDataRange().getValues();
    if (fullData.length <= 1) {
      return { success: false, error: 'Persona no encontrada.' };
    }

    const rows = fullData.slice(1);
    const matchingRows = rows.filter(r => String(r[0]).trim() === friendId);
    if (matchingRows.length === 0) {
      return { success: false, error: 'Persona no encontrada con ID: ' + friendId };
    }

    const friendGroup = String(matchingRows[0][2] || '').trim();
    const friendIdGrupo = String(matchingRows[0][11] || '').trim();

    // Validar autorización: adminKey global o adminToken de grupo
    const adminKey = (e.parameter.adminKey || '').trim();
    const adminToken = (e.parameter.adminToken || e.parameter.admin || e.parameter.token || '').trim();

    const isSuper = isValidAdminKey(adminKey);
    let isGroupAdmin = false;

    if (!isSuper && adminToken) {
      const cleanTok = String(adminToken).trim().toLowerCase();
      const matchedGrp = findGroupByAdminToken(cleanTok);
      if (matchedGrp) {
        const mgName = (matchedGrp.nombre_grupo || '').toLowerCase().trim();
        const mgId = (matchedGrp.id_grupo || '').toLowerCase().trim();
        const fGrpList = friendGroup.split(',').map(s => s.trim().toLowerCase());
        if (!friendIdGrupo || (mgId && friendIdGrupo.toLowerCase() === mgId) || fGrpList.includes(mgName)) {
          isGroupAdmin = true;
        }
      }
      if (!isGroupAdmin) {
        let grp = null;
        if (friendIdGrupo) grp = findGroupById(friendIdGrupo);
        if (!grp && friendGroup) grp = findGroupByName(friendGroup);
        if (grp && grp.admin_token && grp.admin_token.toLowerCase() === cleanTok) {
          isGroupAdmin = true;
        }
      }
    }

    if (!isSuper && !isGroupAdmin) {
      return { success: false, error: 'No autorizado. Se requiere adminToken de grupo o adminKey global.' };
    }

    // Verificar si existen datos_previos
    const rawPrev = matchingRows[0][12] ? String(matchingRows[0][12]).trim() : '';

    if (rawPrev) {
      let prevData = null;
      try {
        prevData = JSON.parse(rawPrev);
      } catch (jsonErr) {
        console.error('Error parseando datos_previos en rejectFriend:', jsonErr);
      }

      if (prevData && typeof prevData === 'object') {
        const restoredName = String(prevData.name || matchingRows[0][1] || '').trim();
        const restoredGroup = String(prevData.group || matchingRows[0][2] || '').trim();
        const restoredIdGrupo = String(prevData.id_grupo || matchingRows[0][11] || '').trim();
        const editToken = String(matchingRows[0][10] || '').trim();
        const prevAccounts = Array.isArray(prevData.accounts) ? prevData.accounts : [];

        const restoredRows = [];
        if (prevAccounts.length === 0) {
          restoredRows.push([
            friendId,
            restoredName,
            restoredGroup,
            '',
            '',
            '',
            '',
            '',
            '',
            'CONFIRMADO',
            editToken,
            restoredIdGrupo,
            ''
          ]);
        } else {
          prevAccounts.forEach(function(acc) {
            restoredRows.push([
              friendId,
              restoredName,
              restoredGroup,
              acc.id || '',
              acc.bank || '',
              acc.type || 'Caja de Ahorro',
              acc.alias || '',
              acc.cbu || '',
              acc.titular || '',
              'CONFIRMADO',
              editToken,
              restoredIdGrupo,
              ''
            ]);
          });
        }

        let firstIndex = -1;
        const otherRows = [];
        for (let i = 0; i < rows.length; i++) {
          if (String(rows[i][0]).trim() === friendId) {
            if (firstIndex === -1) firstIndex = otherRows.length;
          } else {
            const r = rows[i];
            while (r.length < HEADERS.length) r.push('');
            otherRows.push(r);
          }
        }

        if (firstIndex !== -1) {
          otherRows.splice(firstIndex, 0, ...restoredRows);
        } else {
          otherRows.push(...restoredRows);
        }

        const totalExistingDataRows = fullData.length - 1;
        sheet.getRange(2, 1, totalExistingDataRows, HEADERS.length).clearContent();
        if (otherRows.length > 0) {
          sheet.getRange(2, 1, otherRows.length, HEADERS.length).setValues(otherRows);
        }
        invalidateGroupsCache();
        SpreadsheetApp.flush();

        return {
          success: true,
          message: 'Descartado',
          id: friendId,
          restored: true
        };
      }
    }

    // Si no existen datos previos (contacto nuevo), se eliminan sus filas
    const remainingRows = rows.filter(function(r) {
      return String(r[0]).trim() !== friendId;
    }).map(function(r) {
      while (r.length < HEADERS.length) r.push('');
      return r;
    });

    const totalExistingDataRows = fullData.length - 1;
    sheet.getRange(2, 1, totalExistingDataRows, HEADERS.length).clearContent();
    if (remainingRows.length > 0) {
      sheet.getRange(2, 1, remainingRows.length, HEADERS.length).setValues(remainingRows);
    }
    invalidateGroupsCache();
    SpreadsheetApp.flush();

    return {
      success: true,
      message: 'Descartado',
      id: friendId,
      deleted: true
    };
  } catch (error) {
    console.error('Error en rejectFriendInternal:', error);
    return { success: false, error: error.message || String(error) };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Elimina una persona y todas sus cuentas asociadas.
 * @param {string} friendId Identificador de la persona
 * @returns {Object} Respuesta { success: true, data: { id, deleted: true } }
 */
function deleteFriend(friendId) {
  const lock = LockService.getScriptLock();
  try {
    const hasLock = lock.tryLock(15000);
    if (!hasLock) {
      return { success: false, error: 'Base de datos ocupada. Intente nuevamente en unos instantes.' };
    }

    if (!friendId) {
      return { success: false, error: 'Identificador de persona requerido.' };
    }

    const sheet = getAccountsSheet();
    const fullData = sheet.getDataRange().getValues();
    if (fullData.length <= 1) {
      return { success: true, data: { id: friendId, deleted: true } };
    }

    const existingRows = fullData.slice(1);
    const targetId = String(friendId).trim();
    const remainingRows = existingRows.filter(function(row) {
      return String(row[0]).trim() !== targetId;
    }).map(function(r) {
      while (r.length < HEADERS.length) r.push('');
      return r;
    });

    const totalExistingDataRows = fullData.length - 1;
    sheet.getRange(2, 1, totalExistingDataRows, HEADERS.length).clearContent();

    if (remainingRows.length > 0) {
      sheet.getRange(2, 1, remainingRows.length, HEADERS.length).setValues(remainingRows);
    }
    invalidateGroupsCache();
    SpreadsheetApp.flush();

    return { success: true, data: { id: friendId, deleted: true } };
  } catch (error) {
    console.error('Error en deleteFriend:', error);
    return { success: false, error: error.message || String(error) };
  } finally {
    lock.releaseLock();
  }
}

/** Alias para compatibilidad terminológica */
function deletePersona(personaId) {
  return deleteFriend(personaId);
}

/**
 * Elimina una cuenta bancaria puntual por su id_cuenta.
 * Si es la única cuenta de la persona, preserva la ficha de la persona con cuentas vacías.
 * @param {string} accountId Identificador de la cuenta bancaria
 * @returns {Object} Respuesta { success: true, data: { id, deleted: true } }
 */
function deleteAccount(accountId) {
  const lock = LockService.getScriptLock();
  try {
    const hasLock = lock.tryLock(15000);
    if (!hasLock) {
      return { success: false, error: 'Base de datos ocupada. Intente nuevamente en unos instantes.' };
    }

    if (!accountId) {
      return { success: false, error: 'Identificador de cuenta requerido.' };
    }

    const sheet = getAccountsSheet();
    const fullData = sheet.getDataRange().getValues();
    if (fullData.length <= 1) {
      return { success: false, error: 'No se encontraron registros de cuentas.' };
    }

    const existingRows = fullData.slice(1);
    const targetAccId = String(accountId).trim();

    // Localizar persona a la que pertenece la cuenta
    let targetFriendId = null;
    let friendRowCount = 0;

    for (let i = 0; i < existingRows.length; i++) {
      if (String(existingRows[i][3]).trim() === targetAccId) {
        targetFriendId = String(existingRows[i][0]).trim();
        break;
      }
    }

    if (!targetFriendId) {
      return { success: false, error: 'Cuenta no encontrada con ID: ' + accountId };
    }

    // Contar cuántas filas tiene esa persona
    for (let i = 0; i < existingRows.length; i++) {
      if (String(existingRows[i][0]).trim() === targetFriendId) {
        friendRowCount++;
      }
    }

    const updatedRows = [];
    for (let i = 0; i < existingRows.length; i++) {
      const row = existingRows[i];
      while (row.length < HEADERS.length) row.push('');
      const isTargetAccount = String(row[3]).trim() === targetAccId;

      if (!isTargetAccount) {
        updatedRows.push(row);
      } else if (friendRowCount === 1) {
        // Preservar la información de la persona con campos de cuenta vacíos
        updatedRows.push([
          row[0],
          row[1],
          row[2],
          '',
          '',
          '',
          '',
          '',
          '',
          row[9] || 'CONFIRMADO',
          row[10] || '',
          row[11] || '',
          row[12] || ''
        ]);
      }
    }

    const totalExistingDataRows = fullData.length - 1;
    sheet.getRange(2, 1, totalExistingDataRows, HEADERS.length).clearContent();

    if (updatedRows.length > 0) {
      sheet.getRange(2, 1, updatedRows.length, HEADERS.length).setValues(updatedRows);
    }
    invalidateGroupsCache();
    SpreadsheetApp.flush();

    return { success: true, data: { id: accountId, deleted: true } };
  } catch (error) {
    console.error('Error en deleteAccount:', error);
    return { success: false, error: error.message || String(error) };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Restablece la base de datos a los datos de prueba iniciales tanto en Cuentas como en Grupos.
 * @returns {Object} Respuesta con la lista de personas restaurada
 */
function resetToDemoData() {
  const lock = LockService.getScriptLock();
  try {
    const hasLock = lock.tryLock(15000);
    if (!hasLock) {
      return { success: false, error: 'Base de datos ocupada. Intente nuevamente en unos instantes.' };
    }

    const sheet = getAccountsSheet();
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.getRange(2, 1, lastRow - 1, HEADERS.length).clearContent();
    }

    seedDemoData(sheet);

    // Re-sembrar hoja Grupos
    try {
      const gSheet = getGroupsSheet();
      const gLastRow = gSheet.getLastRow();
      if (gLastRow > 1) {
        gSheet.getRange(2, 1, gLastRow - 1, GROUPS_HEADERS.length).clearContent();
      }
      seedDefaultGroups(gSheet);
    } catch (gErr) {
      console.warn('Error restableciendo hoja Grupos:', gErr);
    }

    const refreshedData = getFriendsDataInternal(null, { isAdmin: true });

    return {
      success: true,
      message: 'Datos de prueba restablecidos correctamente.',
      data: refreshedData
    };
  } catch (error) {
    console.error('Error en resetToDemoData:', error);
    return { success: false, error: error.message || String(error) };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Retorna metadatos de la hoja de cálculo activa para diagnóstico y configuración.
 * @returns {Object} { success: true, data: { id, name, url } }
 */
function getSpreadsheetInfo() {
  try {
    const ss = getSpreadsheet();
    return {
      success: true,
      data: {
        id: ss.getId(),
        name: ss.getName(),
        url: ss.getUrl()
      }
    };
  } catch (error) {
    console.error('Error en getSpreadsheetInfo:', error);
    return { success: false, error: error.message || String(error) };
  }
}

// ===================================================================
// FUNCIONES AUXILIARES INTERNAS
// ===================================================================

/**
 * Extrae y agrupa las personas con sus cuentas bancarias desde la hoja, con soporte de filtrado por grupo e inclusión de campos extendidos.
 * @param {string} [groupFilter] Filtro opcional de grupo (insensible a mayúsculas y acentos)
 * @param {Object} [options] Opciones opcionales { isAdmin: boolean, id_grupo: string }
 * @returns {Array<Object>} Lista de personas agrupadas
 */
function getFriendsDataInternal(groupFilter, options) {
  const isAdmin = Boolean(options && options.isAdmin);
  const targetIdGrupo = (options && options.id_grupo) ? String(options.id_grupo).trim() : null;

  const sheet = getAccountsSheet();
  const fullData = sheet.getDataRange().getValues();
  if (fullData.length <= 1) {
    return [];
  }

  const friendsMap = new Map();
  const normalizedFilter = groupFilter
    ? normalizeText(groupFilter)
    : null;

  for (let i = 1; i < fullData.length; i++) {
    const row = fullData[i];
    const friendId = String(row[0] || '').trim();
    if (!friendId) continue;

    const friendGroup = String(row[2] || '').trim() || 'General';
    const groupsArray = friendGroup.split(',').map(s => s.trim()).filter(Boolean);
    if (groupsArray.length === 0) groupsArray.push('General');

    const rowIdGrupo = String(row[11] || '').trim();

    // Filtrar por grupo si se especificó groupFilter o targetIdGrupo
    if (targetIdGrupo || (normalizedFilter && normalizedFilter !== 'all')) {
      let isMatch = false;
      if (targetIdGrupo && rowIdGrupo && rowIdGrupo === targetIdGrupo) {
        isMatch = true;
      } else if (normalizedFilter && normalizedFilter !== 'all') {
        isMatch = groupsArray.some(function(g) {
          const norm = normalizeText(g);
          return norm === normalizedFilter;
        });
      }
      if (!isMatch) {
        continue;
      }
    }

    const friendName = String(row[1] || '').trim();
    const accountId = String(row[3] || '').trim();
    const bank = String(row[4] || '').trim();
    const type = String(row[5] || '').trim();
    const alias = String(row[6] || '').trim();
    const cbu = String(row[7] || '').trim();
    const titular = String(row[8] || '').trim();

    const rawEstado = String(row[9] || '').trim();
    const estado = (rawEstado === 'PENDIENTE') ? 'PENDIENTE' : 'CONFIRMADO';
    const editToken = String(row[10] || '').trim();
    const friendIdGrupo = rowIdGrupo || (targetIdGrupo || getGroupIdByName(friendGroup));
    const rawDatosPrevios = row[12] ? String(row[12]).trim() : '';

    if (!friendsMap.has(friendId)) {
      const friendObj = {
        id: friendId,
        name: friendName,
        group: groupsArray.join(', '),
        groups: groupsArray,
        avatar: getInitials(friendName),
        estado: estado,
        id_grupo: friendIdGrupo,
        accounts: []
      };

      if (isAdmin) {
        if (rawDatosPrevios) {
          try {
            friendObj.datos_previos = JSON.parse(rawDatosPrevios);
          } catch (e) {
            friendObj.datos_previos = rawDatosPrevios;
          }
        } else {
          friendObj.datos_previos = null;
        }
        if (editToken) {
          friendObj.edit_token = editToken;
        }
      }

      friendsMap.set(friendId, friendObj);
    }

    // Agregar cuenta solo si contiene algún dato identificatorio
    if (accountId || bank || alias || cbu) {
      const friend = friendsMap.get(friendId);
      friend.accounts.push({
        id: accountId,
        bank: bank,
        bankName: bank,
        type: type,
        alias: alias,
        cbu: cbu,
        titular: titular
      });
    }
  }

  return Array.from(friendsMap.values());
}

/**
 * Genera iniciales visuales a partir del nombre para el avatar.
 * @param {string} name Nombre de la persona
 * @returns {string} Iniciales en mayúscula (ej: 'Martín Gómez' -> 'MG')
 */
function getInitials(name) {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '??';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Valida un CBU o CVU de 22 dígitos según el algoritmo oficial de ponderación y dígitos verificadores del BCRA.
 * Bloque 1 (entidad y sucursal, posiciones 0-7): ponderadores [7, 1, 3, 9, 7, 1, 3], dígito verificador en pos 7.
 * Bloque 2 (cuenta bancaria, posiciones 8-21): ponderadores [3, 9, 7, 1, 3, 9, 7, 3, 9, 7, 1, 3, 9], dígito verificador en pos 21.
 * @param {string} cbu CBU o CVU a validar
 * @returns {Object} { valid: boolean, error?: string, cbu?: string }
 */
function validateCBU(cbu) {
  const clean = String(cbu || '').trim().replace(/[\s-]/g, '');
  if (!clean) {
    return { valid: false, error: 'CBU/CVU vacío.' };
  }
  if (!/^\d{22}$/.test(clean)) {
    return { valid: false, error: 'El CBU/CVU debe tener exactamente 22 dígitos numéricos.' };
  }

  // Verificación Bloque 1 (Banco y Sucursal)
  const w1 = [7, 1, 3, 9, 7, 1, 3];
  let sum1 = 0;
  for (let i = 0; i < 7; i++) {
    sum1 += parseInt(clean.charAt(i), 10) * w1[i];
  }
  const check1 = (10 - (sum1 % 10)) % 10;
  if (check1 !== parseInt(clean.charAt(7), 10)) {
    return { valid: false, error: 'Dígito verificador de entidad/sucursal inválido (bloque 1).' };
  }

  // Verificación Bloque 2 (Cuenta)
  const w2 = [3, 9, 7, 1, 3, 9, 7, 3, 9, 7, 1, 3, 9];
  let sum2 = 0;
  for (let j = 0; j < 13; j++) {
    sum2 += parseInt(clean.charAt(j + 8), 10) * w2[j];
  }
  const check2 = (10 - (sum2 % 10)) % 10;
  if (check2 !== parseInt(clean.charAt(21), 10)) {
    return { valid: false, error: 'Dígito verificador de cuenta inválido (bloque 2).' };
  }

  return { valid: true, cbu: clean };
}

/**
 * Genera un texto preformateado y optimizado para compartir por WhatsApp o clipboard.
 * @param {string} personId Identificador de la persona
 * @returns {Object} { success: boolean, text?: string, error?: string }
 */
function getShareTextInternal(personId) {
  if (!personId) {
    return { success: false, error: 'Identificador de persona requerido (id).' };
  }
  const friends = getFriendsDataInternal(null, { isAdmin: true });
  const friend = friends.find(function(f) { return f.id === personId; });
  if (!friend) {
    return { success: false, error: 'Contacto no encontrado con ID: ' + personId };
  }

  let text = '📲 Datos de transferencia — ' + friend.name + '\n';
  if (friend.group && friend.group !== 'General') {
    text += '👥 Grupo: ' + friend.group + '\n';
  }

  if (friend.accounts && friend.accounts.length > 0) {
    friend.accounts.forEach(function(acc, idx) {
      text += '\n🏦 ' + (acc.bank || acc.bankName || 'Cuenta ' + (idx + 1));
      if (acc.type) text += ' (' + acc.type + ')';
      text += '\n';
      if (acc.alias) text += '• Alias: ' + acc.alias + '\n';
      if (acc.cbu) text += '• CBU/CVU: ' + acc.cbu + '\n';
      if (acc.titular) text += '• Titular: ' + acc.titular + '\n';
    });
  } else {
    text += '\n(Sin cuentas bancarias registradas)\n';
  }

  text += '\n⚡ Compartido vía AliasDB';
  return { success: true, text: text.trim(), person: friend };
}