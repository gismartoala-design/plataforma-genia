const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_6Mlaq1ZKAuTV@ep-lively-firefly-a5q89531-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require",
});

async function main() {
    const client = await pool.connect();
    try {
        console.log('Adding "calificacion_numerica" column to entregas_bd...');
        await client.query(`ALTER TABLE "entregas_bd" ADD COLUMN IF NOT EXISTS "calificacion_numerica" integer;`);
        
        console.log('Adding "calificacion_numerica" column to entregas_pim...');
        await client.query(`ALTER TABLE "entregas_pim" ADD COLUMN IF NOT EXISTS "calificacion_numerica" integer;`);

        console.log('Adding "calificacion_numerica" column to entregas_it...');
        await client.query(`ALTER TABLE "entregas_it" ADD COLUMN IF NOT EXISTS "calificacion_numerica" integer;`);

        console.log('Adding "calificacion_numerica" column to entregas_pic...');
        await client.query(`ALTER TABLE "entregas_pic" ADD COLUMN IF NOT EXISTS "calificacion_numerica" integer;`);

        // Check if other tables might be missing it based on recent schema changes
        console.log('Success!');
    } catch (e) {
        console.error('Error:', e);
    } finally {
        client.release();
        await pool.end();
    }
}

main();
