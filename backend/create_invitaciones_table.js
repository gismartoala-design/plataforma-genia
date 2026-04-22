const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
    const client = await pool.connect();
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS invitaciones (
                id SERIAL PRIMARY KEY,
                token VARCHAR(100) UNIQUE NOT NULL,
                institucion_id INTEGER REFERENCES instituciones(id),
                curso_id INTEGER REFERENCES cursos(id),
                usada BOOLEAN DEFAULT false,
                fecha_creacion TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log('✅ Tabla invitaciones creada exitosamente.');
    } catch (err) {
        console.error('❌ Error creando tabla:', err.message);
    } finally {
        client.release();
        await pool.end();
    }
}

main();
