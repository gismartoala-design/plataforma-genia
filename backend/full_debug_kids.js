const { Client } = require('pg');
require('dotenv').config();

async function fullDebug() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  try {
    console.log("--- DETAILED KIDS DATA DUMP ---");
    const res = await client.query('SELECT id, nivel_id, titulo, tipo, bloqueado, actividades FROM plantillas_kids');
    
    res.rows.forEach(row => {
        console.log(`\n--- Template ID: ${row.id} ---`);
        console.log(`Nivel ID: ${row.nivel_id}`);
        console.log(`Titulo: ${row.titulo}`);
        console.log(`Tipo: ${row.tipo}`);
        console.log(`Bloqueado: ${row.bloqueado}`);
        console.log(`Actividades (Type): ${typeof row.actividades}`);
        console.log(`Actividades (Value): ${JSON.stringify(row.actividades, null, 2)}`);
    });

  } catch (err) {
    console.error("Error debugging:", err.message);
  } finally {
    await client.end();
  }
}

fullDebug();
