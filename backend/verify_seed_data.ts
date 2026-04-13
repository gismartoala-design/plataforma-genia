import { Client } from 'pg';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(__dirname, '.env') });

async function verifySeed() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    console.log('✅ Connected to DB');

    // 1. Verificar Institución
    const inst = await client.query("SELECT id, nombre FROM instituciones WHERE nombre = 'Colegio Tech Demo'");
    console.log('\n--- Instituciones ---');
    console.table(inst.rows);

    if (inst.rows.length > 0) {
      const instId = inst.rows[0].id;

      // 2. Verificar Cursos
      const cursos = await client.query("SELECT id, nombre, profesor_id FROM cursos WHERE institucion_id = $1", [instId]);
      console.log('\n--- Cursos de la Institución ---');
      console.table(cursos.rows);

      // 3. Verificar Módulos
      const modulos = await client.query(`
        SELECT m.id, m.nombre_modulo, m.curso_id, c.nombre as nombre_curso 
        FROM modulos m
        JOIN cursos c ON m.curso_id = c.id
        WHERE c.institucion_id = $1
      `, [instId]);
      console.log('\n--- Módulos vinculados a Cursos ---');
      console.table(modulos.rows);
      
      // 4. Verificar Usuarios
      const users = await client.query("SELECT id, email, role_id, curso_id FROM usuarios WHERE institucion_id = $1", [instId]);
      console.log('\n--- Usuarios de la Institución ---');
      console.table(users.rows);
    }

  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await client.end();
  }
}

verifySeed();
