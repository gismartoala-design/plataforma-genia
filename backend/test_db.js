const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
    const client = await pool.connect();
    try {
        const res = await client.query("SELECT id, nombre, email, role_id FROM usuarios WHERE email LIKE '%profesor%' OR email LIKE '%kids%' OR nombre ILIKE '%profesor%' OR nombre ILIKE '%kids%'");
        console.table(res.rows);
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        client.release();
        await pool.end();
    }
}

main();
