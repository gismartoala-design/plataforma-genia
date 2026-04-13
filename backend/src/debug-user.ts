
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function debug() {
  console.log('🔍 Diagnosticating Latam Student...');

  const client = await pool.connect();
  try {
    const studentRes = await client.query('SELECT id, email, role_id, curso_id FROM "usuarios" WHERE email = $1', ['student.latam@genios.com']);
    const student = studentRes.rows[0];
    console.log('User data:', student);

    if (student && student.curso_id) {
      const courseRes = await client.query('SELECT * FROM "cursos" WHERE id = $1', [student.curso_id]);
      console.log('Course data:', courseRes.rows[0]);

      const modulesRes = await client.query('SELECT * FROM "modulos" WHERE curso_id = $1', [student.curso_id]);
      console.log('Modules found:', modulesRes.rows.length);
      
      if (modulesRes.rows.length > 0) {
        const levelsRes = await client.query('SELECT id, titulo_nivel FROM "niveles" WHERE modulo_id = $1', [modulesRes.rows[0].id]);
        console.log('Levels (Buildings) in first module:', levelsRes.rows);
      }
    } else {
      console.log('⚠️ Student has NO curso_id set.');
    }
  } catch (err) {
    console.error('❌ Diagnostic failed:', err);
  } finally {
    client.release();
    process.exit(0);
  }
}

debug();
