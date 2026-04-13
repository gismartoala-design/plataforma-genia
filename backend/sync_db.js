const { Pool } = require('pg');
const dotenv = require('dotenv');
const { resolve } = require('path');

dotenv.config({ path: resolve(__dirname, '.env') });

async function syncDb() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Starting DB Sync...');

    // 1. Create instituciones table
    console.log('Creating table "instituciones"...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS instituciones (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        logo_url TEXT,
        configuracion_visual JSONB,
        fecha_creacion TIMESTAMP DEFAULT NOW()
      )
    `);

    // 2. Create plantillas_city table
    console.log('Creating table "plantillas_city"...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS plantillas_city (
        id SERIAL PRIMARY KEY,
        nivel_id INTEGER REFERENCES niveles(id),
        titulo VARCHAR(255) NOT NULL,
        sector VARCHAR(50),
        tipo_reto VARCHAR(50),
        configuracion JSONB,
        recompensa_xp INTEGER DEFAULT 100,
        fecha_creacion TIMESTAMP DEFAULT NOW()
      )
    `);

    // 3. Create progreso_city table
    console.log('Creating table "progreso_city"...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS progreso_city (
        id SERIAL PRIMARY KEY,
        estudiante_id INTEGER REFERENCES usuarios(id),
        sector VARCHAR(50),
        reparado BOOLEAN DEFAULT FALSE,
        fecha_reparacion TIMESTAMP
      )
    `);

    // 4. Add institucion_id to usuarios
    console.log('Adding column "institucion_id" to "usuarios"...');
    try {
      await pool.query(`
        ALTER TABLE usuarios 
        ADD COLUMN IF NOT EXISTS institucion_id INTEGER REFERENCES instituciones(id)
      `);
      console.log('Column "institucion_id" added (or already existed).');
    } catch (e) {
      console.log('Note: Column "institucion_id" might bereits exist or another error occurred:', e.message);
    }

    console.log('DB Sync completed successfully!');

  } catch (error) {
    console.error('Error during DB Sync:', error);
  } finally {
    await pool.end();
  }
}

syncDb();
