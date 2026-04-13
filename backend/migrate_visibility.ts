
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

async function migrate() {
  console.log('Adding "bloqueado" columns to modulos and niveles...');
  try {
    await pool.query('ALTER TABLE modulos ADD COLUMN IF NOT EXISTS bloqueado BOOLEAN DEFAULT false;');
    await pool.query('ALTER TABLE niveles ADD COLUMN IF NOT EXISTS bloqueado BOOLEAN DEFAULT false;');
    console.log('Migration successful!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

migrate();
