require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { Client } = require('pg');

async function checkModuleFks() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  // Check if 'modulos' has any FK issues (profesor_id references usuarios)
  // When we delete a user who is profesor, we need to null out profesor_id first
  const r1 = await client.query('SELECT id, nombre_modulo, profesor_id FROM modulos WHERE curso_id IN (1,2)');
  console.log('Modulos for inst 1 courses:', JSON.stringify(r1.rows));

  // Check if 'cursos' table has profesor_id FK 
  const r2 = await client.query('SELECT id, nombre, profesor_id FROM cursos WHERE institucion_id = 1');
  console.log('Cursos:', JSON.stringify(r2.rows));

  // Query FK constraints from cursos
  const r3 = await client.query(`
    SELECT tc.table_name, kcu.column_name, tc2.table_name AS ref_table
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.referential_constraints AS rc ON tc.constraint_name = rc.constraint_name
    JOIN information_schema.table_constraints AS tc2 ON rc.unique_constraint_name = tc2.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name IN ('cursos', 'modulos', 'usuarios', 'asignaciones')
  `);
  console.log('\nFK graph:');
  console.table(r3.rows);

  await client.end();
}
checkModuleFks().catch(e => { console.error('ERR:', e.message, e.detail); process.exit(1); });
