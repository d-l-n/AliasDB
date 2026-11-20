const fs = require('fs');
const os = require('os');
const path = require('path');

const claspAuth = JSON.parse(fs.readFileSync(path.join(os.homedir(), '.clasprc.json'), 'utf8'));
const def = claspAuth.tokens.default;

const STANDALONE_SCRIPT_ID = '1uNkRHVNYyVB4k9qv7_J-f7Tq9zF2dQ9JAK4k7-oXVNWQRRFIAzeGgata';
const BOUND_SHEET_SCRIPT_ID = '11Xma8mqgPKYy2B-7wJ3aywoIvCww0-t_im436VAAp8TjzC2tweVT4MPv';

async function getAccessToken() {
  const refreshRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: def.client_id,
      client_secret: def.client_secret,
      refresh_token: def.refresh_token,
      grant_type: 'refresh_token'
    })
  });
  const data = await refreshRes.json();
  if (!data.access_token) {
    throw new Error('No se pudo refrescar token OAuth: ' + JSON.stringify(data));
  }
  return data.access_token;
}

async function updateScript(token, scriptId, label) {
  const appsscriptJson = fs.readFileSync(path.join(__dirname, '..', 'appsscript.json'), 'utf8');
  const codeJs = fs.readFileSync(path.join(__dirname, '..', 'Code.js'), 'utf8');
  const adminHtml = fs.readFileSync(path.join(__dirname, '..', 'admin.html'), 'utf8');
  const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

  const files = [
    {
      name: 'appsscript',
      type: 'JSON',
      source: appsscriptJson
    },
    {
      name: 'Code',
      type: 'SERVER_JS',
      source: codeJs
    },
    {
      name: 'admin',
      type: 'HTML',
      source: adminHtml
    },
    {
      name: 'index',
      type: 'HTML',
      source: indexHtml
    }
  ];

  const res = await fetch(`https://script.googleapis.com/v1/projects/${scriptId}/content`, {
    method: 'PUT',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ files })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Error actualizando ${label} (${scriptId}): HTTP ${res.status} - ${errText}`);
  }

  const result = await res.json();
  console.log(`✅ [${label}] Sincronizado exitosamente (${result.files ? result.files.length : 0} archivos).`);
}

async function main() {
  console.log('🔄 Iniciando sincronización dual de scripts en Google Apps Script...');
  const token = await getAccessToken();

  await updateScript(token, STANDALONE_SCRIPT_ID, 'Backend WebApp Standalone');
  await updateScript(token, BOUND_SHEET_SCRIPT_ID, 'Google Sheet Bound Script (DB_Alias)');
  console.log('🚀 Ambos proyectos están 100% sincronizados con el código local.');
}

if (require.main === module) {
  main().catch(err => {
    console.error('❌ Error en sincronización dual:', err.message);
    process.exit(1);
  });
}

module.exports = { syncAllScripts: main };
