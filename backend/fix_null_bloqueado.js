const { Client } = require('pg');
require('dotenv').config();

async function fixNulls() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  try {
    const res = await client.query("UPDATE plantillas_kids SET bloqueado = false WHERE bloqueado IS NULL");
    console.log(`Updated ${res.rowCount} rows.`);
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

fixNulls();
