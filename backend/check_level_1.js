const { Client } = require('pg');
require('dotenv').config();

async function checkLevel1() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  try {
    const res = await client.query("SELECT id, nivel_id, tipo, bloqueado, actividades FROM plantillas_kids WHERE nivel_id = 1");
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

checkLevel1();
