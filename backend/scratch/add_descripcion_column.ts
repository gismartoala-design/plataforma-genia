import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
  const connectionString = process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5432/edu_connect';
  const sql = postgres(connectionString);
  
  console.log('Adding "descripcion" column to "niveles" table...');
  try {
    await sql.unsafe('ALTER TABLE niveles ADD COLUMN IF NOT EXISTS descripcion TEXT;');
    console.log('Column added successfully!');
  } catch (err) {
    console.error('Failed to add column:', err);
  } finally {
    await sql.end();
  }
}

main();
