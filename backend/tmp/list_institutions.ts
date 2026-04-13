import postgres from 'postgres';
import * as dotenv from 'dotenv';
dotenv.config();

const sql = postgres(process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_6Mlaq1ZKAuTV@ep-lively-firefly-a5q89531-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require');

async function main() {
  const rows = await sql`SELECT id, nombre FROM instituciones ORDER BY id`;
  console.log('Institutions found:');
  for (const r of rows) {
    console.log(`  ID=${r.id}  nombre="${r.nombre}"`);
  }
  await sql.end();
}

main().catch(e => { console.error(e); sql.end(); process.exit(1); });
