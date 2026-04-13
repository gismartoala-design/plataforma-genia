
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './shared/schema';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(__dirname, '../.env') });

console.log('DATABASE_URL loaded:', process.env.DATABASE_URL ? 'YES' : 'NO');
if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL is not defined in .env or not being loaded.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

async function test() {
  try {
    const res = await db.execute(sql`SELECT relname, relkind FROM pg_class WHERE relname = 'cursos'`);
    console.log('RelKind:', res.rows);
    
    const attrs = await db.execute(sql`SELECT attname, attnum FROM pg_attribute WHERE attrelid = 'cursos'::regclass AND attnum > 0`);
    console.log('Attributes:', attrs.rows);
  } catch (e) {
    console.error('Error:', e);
  } finally {
    process.exit(0);
  }
}

test();
