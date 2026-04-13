import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const sql = postgres(process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5432/edu_connect');
  const db = drizzle(sql);

  console.log('Applying migration...');
  try {
    const migrationPath = path.join(__dirname, 'drizzle', '0008_late_rocket_raccoon.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');
    
    // Split by statement-breakpoint
    const statements = migrationSql.split('--> statement-breakpoint');
    
    for (const stmt of statements) {
      const q = stmt.trim();
      if (q) {
        console.log('Executing:', q.substring(0, 100) + '...');
        await sql.unsafe(q);
      }
    }
    
    console.log('Migration successfully applied!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

main();
