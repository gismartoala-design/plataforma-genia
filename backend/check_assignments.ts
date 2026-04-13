import { Pool } from 'pg';

async function checkData() {
  const pool = new Pool({
    connectionString: 'postgres://postgres:password@localhost:5432/edu_connect'
  });

  try {
    console.log('--- ROLES ---');
    const roles = await pool.query('SELECT * FROM roles');
    console.table(roles.rows);

    console.log('\n--- INSTITUTIONAL USERS (Recent) ---');
    const users = await pool.query('SELECT id, nombre, email, "role_id", "institucion_id", "curso_id" FROM usuarios WHERE institucion_id IS NOT NULL LIMIT 10');
    console.table(users.rows);

    console.log('\n--- COURSES ---');
    const courses = await pool.query('SELECT id, nombre, "institucion_id" FROM cursos LIMIT 10');
    console.table(courses.rows);

    console.log('\n--- MODULES ---');
    const modules = await pool.query('SELECT id, nombre_modulo, "profesor_id", "curso_id" FROM modulos LIMIT 10');
    console.table(modules.rows);

    console.log('\n--- ASIGNACIONES (Join Table) ---');
    const asignaciones = await pool.query('SELECT * FROM asignaciones LIMIT 10');
    console.table(asignaciones.rows);

    console.log('\n--- MODULO_PROFESORES (Join Table) ---');
    const modProf = await pool.query('SELECT * FROM modulo_profesores LIMIT 10');
    console.table(modProf.rows);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

checkData();
