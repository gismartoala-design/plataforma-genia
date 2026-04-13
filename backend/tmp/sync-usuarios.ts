import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  console.log('--- Syncing usuarios table ---');
  try {
    const queries = [
      "ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS avatar VARCHAR(255) DEFAULT 'avatar_boy';",
      "ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;",
      "ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS especializacion VARCHAR(100);",
      "ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS ultima_conexion TIMESTAMP;",
      "ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS institucion_id INTEGER;",
      "ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS curso_id INTEGER;",
      "ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS geniomonedas INTEGER DEFAULT 0;",
      "ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS skin_equipada_id INTEGER;",
      "ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS google_email VARCHAR(150);",
      "ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS google_access_token TEXT;",
      "ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS google_refresh_token TEXT;"
    ];

    for (const q of queries) {
      console.log(`Executing: ${q}`);
      await pool.query(q);
    }
    console.log('SUCCESS: usuarios table synchronized.');
  } catch (err) {
    console.error('ERROR during synchronization:', err);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

run();
