const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('--- Verificación de Iconografía Reicon (reicon.dev) ---');

['index.html', 'admin.html'].forEach(fileName => {
  const filePath = path.join(__dirname, '..', fileName);
  const content = fs.readFileSync(filePath, 'utf8');

  // 1. Prohibición de emojis Unicode en HTML y UI
  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1FA00}-\u{1FAFF}\u{1F1E6}-\u{1F1FF}]/gu;
  const emojis = content.match(emojiRegex) || [];
  assert.strictEqual(emojis.length, 0, `No deben existir emojis en ${fileName}. Encontrados: ${emojis.join(', ')}`);

  // 2. Prohibición de entidades decimales asociadas a emojis o iconos antiguos (excepto entidades HTML seguras como &#039; si las hubiera)
  const forbiddenEntities = ['&#128064;', '&#128065;', '&#128190;', '&#128193;', '&#128196;', '&#128203;', '&#128228;', '&#128229;', '&#128260;', '&#128273;', '&#128279;', '&#128465;', '&#9881;', '&#9888;', '&#9889;', '&#9998;', '&#10024;'];
  forbiddenEntities.forEach(ent => {
    assert(!content.includes(ent), `Entidad prohibida ${ent} presente en ${fileName}`);
  });

  // 3. Verificación de presencia de tokens y clases del sistema Reicon
  assert(content.includes('.reicon'), `${fileName} debe contener estilos para la clase .reicon`);
  assert(content.includes('REICONS'), `${fileName} debe contener el mapa REICONS`);
  assert(content.includes('getReiconSvg'), `${fileName} debe contener la función auxiliar getReiconSvg`);

  console.log(`PASS: ${fileName} verificado con iconografía Reicon limpia`);
});

console.log('Todas las verificaciones de iconografía Reicon pasaron exitosamente.');
