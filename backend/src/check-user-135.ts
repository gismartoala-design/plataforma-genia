import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  try {
    const res = await pool.query('SELECT id, email, curso_id FROM usuarios WHERE id = 135');
    console.log('USER_DATA:', JSON.stringify(res.rows[0]));
  } catch (e) {
    console.error(e);
  } finally {
    await pool.end();
  }
}

run();
