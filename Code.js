/**
 * ===================================================================
 * Amigos & Alias | Backend Google Apps Script
 * Gestión centralizada de alias bancarios y CBU/CVU de contactos
 * ===================================================================
 */

const SHEET_NAME = 'Cuentas';
const SPREADSHEET_PROP_KEY = 'SPREADSHEET_ID';

const HEADERS = [
  'id_amigo',
  'nombre_amigo',
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
    id: 'amigo_martin_gomez',
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
    id: 'amigo_sofia_rossi',
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
    id: 'amigo_lucas_benitez',
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

// ===================================================================
// CONTROLADOR WEB (doGet) E INCLUDES
// ===================================================================

/**
 * Manejador de solicitudes HTTP GET para servir la Single Page Application (SPA).
 * @param {Object} e Evento de petición HTTP
 * @returns {HtmlOutput} Interfaz web configurada
 */
function doGet(e) {
  try {
    // Modo API REST: Servir JSON público para clientes externos (ej: GitHub Pages)
    if (e && e.parameter && (e.parameter.action === 'getFriends' || e.parameter.format === 'json')) {
      const friends = getFriendsDataInternal();
      return ContentService.createTextOutput(JSON.stringify({ success: true, data: friends }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const template = HtmlService.createTemplateFromFile('index');
    return template.evaluate()
      .setTitle('Amigos & Alias | Pagos Rápidos')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } catch (error) {
    if (e && e.parameter && (e.parameter.action === 'getFriends' || e.parameter.format === 'json')) {
      return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.message || String(error) }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    console.error('Error renderizando Index.html:', error);
    return HtmlService.createHtmlOutput(
      '<div style="font-family:sans-serif;padding:24px;text-align:center;">' +
      '<h2>Amigos & Alias | Pagos Rápidos</h2>' +
      '<p>No se pudo cargar la vista principal: ' + error.message + '</p>' +
      '</div>'
    );
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
  const newSpreadsheet = SpreadsheetApp.create('DB_Amigos_Alias');
  scriptProps.setProperty(SPREADSHEET_PROP_KEY, newSpreadsheet.getId());
  console.log('Nueva base de datos creada. ID registrado:', newSpreadsheet.getId());
  return newSpreadsheet;
}

/**
 * Obtiene la hoja 'Cuentas'. La crea y formatea con cabeceras y seeding si está vacía.
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

  // Inicialización de encabezados y formato
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#F1F3F4');
    headerRange.setFontColor('#202124');
    sheet.setFrozenRows(1);
    
    // Forzar formato de texto plano en CBU/CVU y Alias para conservar ceros a la izquierda
    sheet.getRange('A:I').setNumberFormat('@');
    seedDemoData(sheet);
  } else if (sheet.getLastRow() === 1) {
    // Si solo existen los encabezados sin datos, inicializar demo
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
    sheet.getRange(2, 1, rows.length, HEADERS.length).setNumberFormat('@');
    sheet.getRange(2, 1, rows.length, HEADERS.length).setValues(rows);
  }
}

// ===================================================================
// MÉTODOS RPC EXPUESTOS PARA google.script.run
// ===================================================================

/**
 * Devuelve todos los amigos con sus cuentas agrupadas.
 * Respuesta: { success: true, data: [{ id, name, group, avatar, accounts: [...] }] }
 */
function getFriendsData() {
  try {
    const friends = getFriendsDataInternal();
    return { success: true, data: friends };
  } catch (error) {
    console.error('Error en getFriendsData:', error);
    return { success: false, error: error.message || String(error) };
  }
}

/**
 * Crea o actualiza un amigo con sus respectivas cuentas bancarias.
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
      return { success: false, error: 'Estructura de amigo inválida.' };
    }

    const name = (friendObj.name || friendObj.nombre_amigo || '').trim();
    if (!name) {
      return { success: false, error: 'El nombre del amigo es obligatorio.' };
    }

    const group = (friendObj.group || friendObj.grupo || 'General').trim();
    const friendId = (friendObj.id || friendObj.id_amigo || ('amigo_' + Utilities.getUuid().slice(0, 8))).trim();
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

    // Identificar si el amigo ya existía para mantener su posición ordinal
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
      // Amigo nuevo: agregarlo al final
      remainingRows.push(...newFriendRows);
    }

    // Reescribir datos en hoja asegurando consistencia atómica
    const totalExistingDataRows = fullData.length - 1;
    if (totalExistingDataRows > 0) {
      sheet.getRange(2, 1, totalExistingDataRows, HEADERS.length).clearContent();
    }

    if (remainingRows.length > 0) {
      sheet.getRange(2, 1, remainingRows.length, HEADERS.length).setNumberFormat('@');
      sheet.getRange(2, 1, remainingRows.length, HEADERS.length).setValues(remainingRows);
    }

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

/**
 * Elimina un amigo y todas sus cuentas asociadas.
 * @param {string} friendId Identificador del amigo
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
      return { success: false, error: 'Identificador de amigo requerido.' };
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
      sheet.getRange(2, 1, remainingRows.length, HEADERS.length).setNumberFormat('@');
      sheet.getRange(2, 1, remainingRows.length, HEADERS.length).setValues(remainingRows);
    }

    return { success: true, data: { id: friendId, deleted: true } };
  } catch (error) {
    console.error('Error en deleteFriend:', error);
    return { success: false, error: error.message || String(error) };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Elimina una cuenta bancaria puntual por su id_cuenta.
 * Si es la única cuenta del amigo, preserva la ficha del amigo con cuentas vacías.
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

    // Localizar amigo al que pertenece la cuenta
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

    // Contar cuántas filas tiene ese amigo
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
        // Preservar la información del amigo con campos de cuenta vacíos
        updatedRows.push([row[0], row[1], row[2], '', '', '', '', '', '']);
      }
    }

    const totalExistingDataRows = fullData.length - 1;
    sheet.getRange(2, 1, totalExistingDataRows, HEADERS.length).clearContent();

    if (updatedRows.length > 0) {
      sheet.getRange(2, 1, updatedRows.length, HEADERS.length).setNumberFormat('@');
      sheet.getRange(2, 1, updatedRows.length, HEADERS.length).setValues(updatedRows);
    }

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
 * @returns {Object} Respuesta con la lista de amigos restaurada
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
 * Extrae y agrupa todos los amigos con sus cuentas bancarias desde la hoja.
 * @returns {Array<Object>} Lista de amigos agrupados
 */
function getFriendsDataInternal() {
  const sheet = getAccountsSheet();
  const fullData = sheet.getDataRange().getValues();
  if (fullData.length <= 1) {
    return [];
  }

  const friendsMap = new Map();

  for (let i = 1; i < fullData.length; i++) {
    const row = fullData[i];
    const friendId = String(row[0] || '').trim();
    if (!friendId) continue;

    const friendName = String(row[1] || '').trim();
    const friendGroup = String(row[2] || '').trim() || 'General';
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
 * @param {string} name Nombre del amigo
 * @returns {string} Iniciales en mayúscula (ej: 'Martín Gómez' -> 'MG')
 */
function getInitials(name) {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '??';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}