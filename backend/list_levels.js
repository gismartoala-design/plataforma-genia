const { Client } = require('pg');
require('dotenv').config();

async function listLevels() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  try {
    const res = await client.query("SELECT id, titulo_nivel FROM niveles ORDER BY id DESC LIMIT 200");
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

listLevels();
