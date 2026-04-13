const { Pool } = require('pg');
require('dotenv').config({ path: __dirname + '/../.env' }); // Make sure to load the env file

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function main() {
    const client = await pool.connect();
    try {
        console.log('Using DB:', process.env.DATABASE_URL.split('@')[1]); // Log the host for debugging safely
        const tables = [
            'entregas_bd',
            'entregas_pim',
            'entregas_it',
            'entregas_pic',
            'entregas_kids'
        ];

        for (const table of tables) {
            console.log(`Adding "calificacion_numerica" to ${table}...`);
            await client.query(`ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "calificacion_numerica" integer;`);
        }
        console.log('Success: Missing columns added.');
    } catch (e) {
        console.error('Migration error:', e);
    } finally {
        client.release();
        await pool.end();
    }
}

main();
