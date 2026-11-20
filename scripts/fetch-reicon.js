const https = require('https');
const fs = require('fs');
const path = require('path');

const icons = [
  'Sun',
  'Moon',
  'Search',
  'Copy',
  'Check',
  'CheckCircle',
  'ChevronDown',
  'Key',
  'Settings',
  'Link',
  'Refresh',
  'Eye',
  'User',
  'Users',
  'CreditCard',
  'Bank',
  'Folder',
  'Export',
  'Import',
  'Add',
  'Plus',
  'Edit',
  'Trash',
  'Flash',
  'Save',
  'CloseCircle',
  'Sparkle',
  'Warning',
  'DollarCircle',
  'Coins',
  'Wallet',
  'AlertTriangle',
  'File',
  'X',
  'Lock',
  'Filter',
  'ShieldCheck',
  'ArrowRight',
  'Share'
];

async function fetchIcon(name) {
  const url = `https://cdn.jsdelivr.net/npm/reicon@1.2.5/icons/${name}.js`;
  return new Promise((resolve) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        return resolve({ name, success: false, status: res.statusCode });
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const oIdx = data.indexOf('O: `');
        let oSvg = '';
        if (oIdx !== -1) {
          const end = data.indexOf('`', oIdx + 4);
          oSvg = data.substring(oIdx + 4, end);
        }
        const fIdx = data.indexOf('F: `');
        let fSvg = '';
        if (fIdx !== -1) {
          const end = data.indexOf('`', fIdx + 4);
          fSvg = data.substring(fIdx + 4, end);
        }
        resolve({ name, success: true, outline: oSvg, filled: fSvg });
      });
    }).on('error', err => resolve({ name, success: false, error: err.message }));
  });
}

async function main() {
  const dict = {};
  for (const name of icons) {
    const res = await fetchIcon(name);
    if (res.success && (res.outline || res.filled)) {
      dict[name] = { outline: res.outline, filled: res.filled };
      console.log(`[OK] ${name}`);
    } else {
      console.log(`[SKIP] ${name}`);
    }
  }

  const outPath = path.join(__dirname, 'reicon-extracted.json');
  fs.writeFileSync(outPath, JSON.stringify(dict, null, 2), 'utf8');
  console.log(`Saved ${Object.keys(dict).length} icons to ${outPath}`);
}

main();
