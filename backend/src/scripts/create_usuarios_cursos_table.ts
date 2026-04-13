import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(__dirname, '../../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    console.log('📦 Creating usuarios_cursos join table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS usuarios_cursos (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        curso_id INTEGER NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
        fecha_asignacion TIMESTAMP DEFAULT NOW(),
        UNIQUE(usuario_id, curso_id)
      );
    `);
    console.log('✅ usuarios_cursos table created (or already exists).');

    await client.query('COMMIT');
    console.log('🎉 Migration complete!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', err);
  } finally {
    client.release();
    process.exit(0);
  }
}

run();
