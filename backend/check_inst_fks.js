require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { Client } = require('pg');

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  
  // Check cursos for inst 1
  const r1 = await client.query('SELECT id FROM cursos WHERE institucion_id=1');
  console.log('Cursos inst 1:', JSON.stringify(r1.rows));
  
  // Check usuarios for inst 1
  const r2 = await client.query('SELECT id, email FROM usuarios WHERE institucion_id=1 LIMIT 5');
  console.log('Usuarios inst 1:', JSON.stringify(r2.rows));

  // Check FK references pointing to instituciones
  const r3 = await client.query(`
    SELECT
      tc.table_name,
      kcu.column_name
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.referential_constraints AS rc
      ON tc.constraint_name = rc.constraint_name
    JOIN information_schema.table_constraints AS tc2
      ON rc.unique_constraint_name = tc2.constraint_name
    WHERE tc2.table_name = 'instituciones'
      AND tc.constraint_type = 'FOREIGN KEY'
  `);
  console.log('\nFKs pointing to instituciones:');
  console.table(r3.rows);
  
  await client.end();
}
main().catch(e => { console.error('ERR:', e.message); process.exit(1); });
