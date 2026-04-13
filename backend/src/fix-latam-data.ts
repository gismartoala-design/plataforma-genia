
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function fix() {
  console.log('🔧 Final Latam Student Fix (Minimal mode)...');

  const client = await pool.connect();
  try {
    // 1. Find Student
    const studentIdToFix = 135; 
    const studentRes = await client.query('SELECT * FROM "usuarios" WHERE id = $1', [studentIdToFix]);
    const student = studentRes.rows[0];
    if (!student) return console.error('❌ Student not found');

    // 2. Create Course (Name only, since FKs fail)
    let cursoId = student.curso_id;
    if (!cursoId) {
      console.log('Creating course...');
      const name = 'Trayectoria Master Latam ' + Date.now();
      await client.query('INSERT INTO "cursos" (nombre) VALUES ($1)', [name]);
      const res = await client.query('SELECT id FROM "cursos" WHERE nombre = $1', [name]);
      cursoId = res.rows[0].id;
      await client.query('UPDATE "usuarios" SET curso_id = $1 WHERE id = $2', [cursoId, student.id]);
      console.log("✅ Student updated with curso_id:", cursoId);

      // EXTRA: Update string fields for profile display
      await client.query(
        "UPDATE \"usuarios\" SET institucion = $1, curso = $2 WHERE id = $3",
        ["Latam Academy", "Trayectoria Master", student.id]
      );
      console.log("✅ Student profile strings (institucion, curso) updated.");
    }

    // 3. Create Module
    const modRes = await client.query('SELECT * FROM "modulos" WHERE curso_id = $1', [cursoId]);
    let moduloId;
    if (modRes.rows.length === 0) {
      console.log('Creating module...');
      const modName = 'Módulo RPG Latam ' + Date.now();
      // Modulos table seems to allow curso_id if it's the old schema, but let's be careful
      await client.query('INSERT INTO "modulos" (nombre_modulo, curso_id) VALUES ($1, $2)', [modName, cursoId]);
      const res = await client.query('SELECT id FROM "modulos" WHERE nombre_modulo = $1', [modName]);
      moduloId = res.rows[0].id;
      console.log('✅ Module created:', moduloId);
    } else {
      moduloId = modRes.rows[0].id;
    }

    // 4. Create Levels (These are the buildings)
    const levelRes = await client.query('SELECT * FROM "niveles" WHERE modulo_id = $1', [moduloId]);
    if (levelRes.rows.length === 0) {
      console.log('Creating levels...');
      await client.query('INSERT INTO "niveles" (modulo_id, titulo_nivel, orden) VALUES ($1, $2, $3)', [moduloId, 'Oficinas Latam', 1]);
      await client.query('INSERT INTO "niveles" (modulo_id, titulo_nivel, orden) VALUES ($1, $2, $3)', [moduloId, 'Laboratorio Tech', 2]);
      await client.query('INSERT INTO "niveles" (modulo_id, titulo_nivel, orden) VALUES ($1, $2, $3)', [moduloId, 'Sala de Juntas', 3]);
      console.log('✅ Levels created.');
    }

    console.log('🚀 Latam Student data populated successfully!');
  } catch (err) {
    console.error('❌ Final fix failed:', err);
  } finally {
    client.release();
    process.exit(0);
  }
}

fix();
