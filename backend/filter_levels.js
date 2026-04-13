const fs = require('fs');
try {
    const raw = fs.readFileSync('c:/tmp/levels_full.log', 'utf16le');
    // Remove BOM if present
    const clean = raw.replace(/^\uFEFF/, '');
    const data = JSON.parse(clean);
    const filtered = data.filter(l => l.titulo_nivel.toLowerCase().includes('juego'));
    console.log(JSON.stringify(filtered, null, 2));
} catch (e) {
    console.error(e);
}
