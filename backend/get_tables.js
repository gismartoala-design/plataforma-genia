const { Client } = require('pg');

async function main() {
  const client = new Client({ connectionString: 'postgresql://emerson:memerson19@194.140.198.128/bd_instituciones' });
  await client.connect();
  const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
  console.log(JSON.stringify(res.rows, null, 2));
  await client.end();
}
main();
