/**
 * ===================================================================
 * AliasDB | Backend Google Apps Script
 * Gestión centralizada de alias bancarios y CBU/CVU de contactos
 * ===================================================================
 */

const SHEET_NAME = 'Cuentas';
const SPREADSHEET_PROP_KEY = 'SPREADSHEET_ID';
const TOKEN_MAP_KEY = 'GROUP_TOKENS';
const ADMIN_KEY_PROP = 'ADMIN_KEY';
const DEFAULT_ADMIN_KEY = 'aliasdb_admin_2026';

const HEADERS = [
  'id_persona',
  'nombre_persona',
  'grupo',
  'id_cuenta',
  'entidad_banco',
  'tipo_cuenta',
  'alias',
  'cbu_cvu',
  'titular_diferente'
];

/**
 * Datos demo predefinidos para inicialización y reseteo
 */
const DEMO_FRIENDS = [
  {
    id: 'persona_martin_gomez',
    name: 'Martín Gómez',
    group: 'Fútbol',
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
        // --- Endpoints Públicos de Consulta ---
        case 'getFriends':
        case 'getPersons':
        case 'getPersonas': {
          let groupFilter = null;
          if (e.parameter.token) {
            groupFilter = resolveGroupFromToken(e.parameter.token);
            if (!groupFilter) {
              return jsonResponse({ success: false, error: 'Token inválido o expirado.' });
            }
          } else if (e.parameter.grupo) {
            groupFilter = e.parameter.grupo;
          }

          const friends = getFriendsDataInternal(groupFilter);
          return jsonResponse({ success: true, data: friends, grupo: groupFilter });
        }

        case 'getGroups': {
          return jsonResponse({ success: true, data: getDistinctGroups() });
        }

        // --- Endpoints de Administración (Requieren adminKey) ---
        case 'save':
        case 'savePerson':
        case 'saveFriend': {
          const authError = requireAdmin(e);
          if (authError) return authError;

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
          return jsonResponse(saveFriendWithAccounts(body));
        }

        case 'deleteFriend':
        case 'deletePerson':
        case 'deletePersona': {
          const authError = requireAdmin(e);
          if (authError) return authError;
          return jsonResponse(deleteFriend(e.parameter.id));
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

        case 'generateToken': {
          const authError = requireAdmin(e);
          if (authError) return authError;
          const grupo = e.parameter.grupo;
          if (!grupo) {
            return jsonResponse({ success: false, error: 'Parámetro grupo requerido.' });
          }
          const token = generateGroupToken(grupo);
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
 * Valida la clave de administrador provista en la petición HTTP.
 * Si no hay clave configurada en ScriptProperties, inicializa DEFAULT_ADMIN_KEY.
 * @param {Object} e Evento de petición HTTP
 * @returns {TextOutput|null} null si la clave es válida; salida JSON con error si es inválida
 */
function requireAdmin(e) {
  const adminKey = (e && e.parameter && e.parameter.adminKey) ? String(e.parameter.adminKey).trim() : '';
  const scriptProps = PropertiesService.getScriptProperties();
  let storedKey = scriptProps.getProperty(ADMIN_KEY_PROP);

  if (!storedKey) {
    storedKey = DEFAULT_ADMIN_KEY;
    try {
      scriptProps.setProperty(ADMIN_KEY_PROP, storedKey);
    } catch (err) {
      console.warn('No se pudo inicializar ADMIN_KEY por defecto:', err);
    }
  }

  if (!adminKey || adminKey !== storedKey) {
    return jsonResponse({ success: false, error: 'No autorizado. adminKey inválida.' });
  }

  return null;
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
  PropertiesService.getScriptProperties().setProperty(ADMIN_KEY_PROP, cleanKey);
  return { success: true, message: 'ADMIN_KEY actualizada correctamente.' };
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
  if (!raw) return null;
  try {
    const map = JSON.parse(raw);
    const trimmed = String(token).trim();
    return map[trimmed] || null;
  } catch (e) {
    console.error('Error resolviendo token de grupo:', e);
    return null;
  }
}

/**
 * Genera y almacena un nuevo token de acceso para un grupo.
 * @param {string} groupName Nombre del grupo
 * @returns {string} Token generado (ej: 'futbol_a1b2')
 */
function generateGroupToken(groupName) {
  const cleanGroup = String(groupName || 'General').trim();
  const prefix = cleanGroup
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 6) || 'grp';
  const token = prefix + '_' + Utilities.getUuid().slice(0, 4);

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
  if (fullData.length <= 1) {
    return ['General'];
  }
  const groups = new Set();
  for (let i = 1; i < fullData.length; i++) {
    const g = String(fullData[i][2] || '').trim();
    if (g) groups.add(g);
  }
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

    const normOld = cleanOld.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    let updatedCount = 0;
    const rowsToUpdate = [];

    for (let i = 1; i < fullData.length; i++) {
      const row = fullData[i];
      const currentGroup = String(row[2] || '').trim();
      const normCurrent = currentGroup.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (normCurrent === normOld) {
        row[2] = cleanNew;
        updatedCount++;
      }
      rowsToUpdate.push(row);
    }

    if (updatedCount > 0) {
      sheet.getRange(2, 1, rowsToUpdate.length, HEADERS.length).setValues(rowsToUpdate);
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
          const normTGroup = tGroup.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
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
  }

  return sheet;
}

/**
 * Carga los datos de demostración en la hoja especificada.
 * @param {Sheet} sheet Pestaña de la hoja
 */
function seedDemoData(sheet) {
  const rows = [];
  DEMO_FRIENDS.forEach(function(friend) {
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
        acc.titular || ''
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
    const friends = getFriendsDataInternal(groupFilter);
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
 * @param {Object|string} friendObj Objeto con id, name, group y array accounts
 * @returns {Object} Respuesta { success: true, data: friendObj } o error
 */
function saveFriendWithAccounts(friendObj) {
  const lock = LockService.getScriptLock();
  try {
    const hasLock = lock.tryLock(15000);
    if (!hasLock) {
      return { success: false, error: 'Base de datos ocupada. Intente nuevamente en unos instantes.' };
    }

    if (typeof friendObj === 'string') {
      friendObj = JSON.parse(friendObj);
    }

    if (!friendObj || typeof friendObj !== 'object') {
      return { success: false, error: 'Estructura de persona inválida.' };
    }

    const name = (friendObj.name || friendObj.nombre_persona || '').trim();
    if (!name) {
      return { success: false, error: 'El nombre de la persona es obligatorio.' };
    }

    const group = (friendObj.group || friendObj.grupo || 'General').trim();
    const friendId = (friendObj.id || friendObj.id_persona || ('persona_' + Utilities.getUuid().slice(0, 8))).trim();
    const rawAccounts = Array.isArray(friendObj.accounts) ? friendObj.accounts : [];

    const sheet = getAccountsSheet();
    const fullData = sheet.getDataRange().getValues();
    const existingRows = fullData.length > 1 ? fullData.slice(1) : [];

    // Normalizar cuentas entrantes
    const normalizedAccounts = [];
    const newFriendRows = [];

    if (rawAccounts.length === 0) {
      newFriendRows.push([friendId, name, group, '', '', '', '', '', '']);
    } else {
      rawAccounts.forEach(function(acc, idx) {
        const accId = (acc.id || acc.id_cuenta || ('acc_' + Utilities.getUuid().slice(0, 8) + '_' + (idx + 1))).trim();
        const bank = (acc.bank || acc.entidad_banco || '').trim();
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

        newFriendRows.push([friendId, name, group, accId, bank, type, alias, cbu, titular]);
      });
    }

    // Identificar si la persona ya existía para mantener su posición ordinal
    let firstExistingIndex = -1;
    const remainingRows = [];

    for (let i = 0; i < existingRows.length; i++) {
      const rowFriendId = String(existingRows[i][0]).trim();
      if (rowFriendId === friendId) {
        if (firstExistingIndex === -1) {
          firstExistingIndex = remainingRows.length;
        }
      } else {
        remainingRows.push(existingRows[i]);
      }
    }

    if (firstExistingIndex !== -1) {
      // Reemplazo en la misma posición relativa
      remainingRows.splice(firstExistingIndex, 0, ...newFriendRows);
    } else {
      // Persona nueva: agregarla al final
      remainingRows.push(...newFriendRows);
    }

    // Reescribir datos en hoja asegurando consistencia atómica
    const totalExistingDataRows = fullData.length - 1;
    if (totalExistingDataRows > 0) {
      sheet.getRange(2, 1, totalExistingDataRows, HEADERS.length).clearContent();
    }

    if (remainingRows.length > 0) {
      sheet.getRange(2, 1, remainingRows.length, HEADERS.length).setValues(remainingRows);
    }
    SpreadsheetApp.flush();

    return {
      success: true,
      data: {
        id: friendId,
        name: name,
        group: group,
        avatar: getInitials(name),
        accounts: normalizedAccounts
      }
    };
  } catch (error) {
    console.error('Error en saveFriendWithAccounts:', error);
    return { success: false, error: error.message || String(error) };
  } finally {
    lock.releaseLock();
  }
}

/** Alias para compatibilidad terminológica */
function savePersonaWithAccounts(personaObj) {
  return saveFriendWithAccounts(personaObj);
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
    });

    const totalExistingDataRows = fullData.length - 1;
    sheet.getRange(2, 1, totalExistingDataRows, HEADERS.length).clearContent();

    if (remainingRows.length > 0) {
      sheet.getRange(2, 1, remainingRows.length, HEADERS.length).setValues(remainingRows);
    }
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
      const isTargetAccount = String(row[3]).trim() === targetAccId;

      if (!isTargetAccount) {
        updatedRows.push(row);
      } else if (friendRowCount === 1) {
        // Preservar la información de la persona con campos de cuenta vacíos
        updatedRows.push([row[0], row[1], row[2], '', '', '', '', '', '']);
      }
    }

    const totalExistingDataRows = fullData.length - 1;
    sheet.getRange(2, 1, totalExistingDataRows, HEADERS.length).clearContent();

    if (updatedRows.length > 0) {
      sheet.getRange(2, 1, updatedRows.length, HEADERS.length).setValues(updatedRows);
    }
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
 * Restablece la base de datos a los datos de prueba iniciales.
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
    const refreshedData = getFriendsDataInternal();

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
 * Extrae y agrupa las personas con sus cuentas bancarias desde la hoja, con soporte de filtrado por grupo.
 * @param {string} [groupFilter] Filtro opcional de grupo (insensible a mayúsculas y acentos)
 * @returns {Array<Object>} Lista de personas agrupadas
 */
function getFriendsDataInternal(groupFilter) {
  const sheet = getAccountsSheet();
  const fullData = sheet.getDataRange().getValues();
  if (fullData.length <= 1) {
    return [];
  }

  const friendsMap = new Map();
  const normalizedFilter = groupFilter
    ? String(groupFilter).trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    : null;

  for (let i = 1; i < fullData.length; i++) {
    const row = fullData[i];
    const friendId = String(row[0] || '').trim();
    if (!friendId) continue;

    const friendGroup = String(row[2] || '').trim() || 'General';

    // Filtrar por grupo si se especificó groupFilter
    if (normalizedFilter) {
      const normalizedGroup = friendGroup
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
      if (normalizedGroup !== normalizedFilter) {
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

    if (!friendsMap.has(friendId)) {
      friendsMap.set(friendId, {
        id: friendId,
        name: friendName,
        group: friendGroup,
        avatar: getInitials(friendName),
        accounts: []
      });
    }

    // Agregar cuenta solo si contiene algún dato identificatorio
    if (accountId || bank || alias || cbu) {
      const friend = friendsMap.get(friendId);
      friend.accounts.push({
        id: accountId,
        bank: bank,
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