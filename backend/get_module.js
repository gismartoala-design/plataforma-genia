const { Client } = require('pg');

async function main() {
  const client = new Client({ connectionString: 'postgresql://emerson:memerson19@194.140.198.128/bd_instituciones' });
  await client.connect();
  const res = await client.query('SELECT contenido FROM modulo_inst WHERE id = 7');
  console.log(JSON.stringify(res.rows[0], null, 2));
  await client.end();
}
main();
