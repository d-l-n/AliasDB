const API_URL = 'https://script.google.com/macros/s/AKfycbz7Pp_RisFpuIFiAycBSL4EJXpydQZRfToR7T-Wd7-Hoaio1n2A4KzUm4d8WAEKVtqeQg/exec?action=getFriends';

async function checkAccess() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    if (data && data.success) {
      console.log('✅ Permiso verificado: "Cualquier usuario" activo y respondiendo datos en vivo.');
      process.exit(0);
    } else {
      throw new Error(data.error || 'Respuesta no válida');
    }
  } catch (err) {
    console.error('❌ ERROR CRÍTICO: "Quién tiene acceso" no está configurado en "Cualquier usuario".');
    console.error('   Detalle: ' + err.message);
    console.error('   Solución: En el editor de Apps Script, vaya a Administrar implementaciones > Editar');
    console.error('   y confirme que "Quién tiene acceso" esté en "Cualquier usuario".');
    process.exit(1);
  }
}

checkAccess();
