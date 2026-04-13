import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { join } from 'path';
import * as fs from 'fs';

dotenv.config({ path: join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function apply() {
  const sqlPath = join(__dirname, '../drizzle/0012_adorable_the_captain.sql');
  console.log(`📖 Reading migration: ${sqlPath}`);
  const content = fs.readFileSync(sqlPath, 'utf8');
  
  // Split by statement-breakpoint
  const statements = content.split('--> statement-breakpoint');
  
  console.log(`🚀 Executing ${statements.length} statements...`);
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i].trim();
        if (!stmt) continue;
        console.log(`Executing statement ${i + 1}...`);
        try {
            await client.query(stmt);
            console.log(`  ✅ Success: Statement ${i + 1}`);
        } catch (e: any) {
            // If it's "already exists", we can ignore if it's a ADD COLUMN (code 42701)
            // But for CREATE TABLE we want to know why it fails if it's not there
            if (e.code === '42701') {
                console.warn(`  ⚠️ Skip (already exists): ${e.message}`);
            } else if (e.code === '42P07') {
                 console.warn(`  ⚠️ Relation already exists: ${e.message}`);
            } else {
                console.error(`  ❌ Error in statement ${i + 1}:`, e.message);
                throw e;
            }
        }
    }
    await client.query('COMMIT');
    console.log('✅ Migration applied successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
  } finally {
    client.release();
    process.exit(0);
  }
}

apply().catch(err => {
  console.error(err);
  process.exit(1);
});
