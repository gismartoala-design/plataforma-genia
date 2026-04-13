const { Client } = require('pg');
require('dotenv').config();

async function findLevel() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  try {
    const res = await client.query("SELECT id, titulo_nivel FROM niveles WHERE titulo_nivel ILIKE '%REGLAS DEL JUEGO%'");
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

findLevel();
