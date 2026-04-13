const { Client } = require('pg');
require('dotenv').config();

async function debugKids() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  try {
    console.log("--- DUMPING KIDS TEMPLATES ---");
    const res = await client.query('SELECT id, nivel_id, titulo, tipo, bloqueado, actividades FROM plantillas_kids');
    
    for (const row of res.rows) {
        console.log(`\nID: ${row.id} | Nivel: ${row.nivel_id} | Titulo: ${row.titulo} | Tipo: ${row.tipo} | Bloqueado: ${row.bloqueado}`);
        const act = row.actividades;
        if (!act) {
            console.log("  Content: NULL");
        } else {
            const steps = act.steps || (Array.isArray(act) ? act : []);
            const blocks = act.blocks || [];
            console.log(`  Content: Steps=${steps.length}, Blocks=${blocks.length}`);
            if (steps.length === 0 && blocks.length === 0) {
                console.log("  WARNING: THIS TEMPLATE HAS NO CONTENT!");
            }
        }
    }
  } catch (err) {
    console.error("Error debugging:", err.message);
  } finally {
    await client.end();
  }
}

debugKids();
