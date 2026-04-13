
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

async function main() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('Adding "orden" column to "contenidos" table...');
        await pool.query('ALTER TABLE contenidos ADD COLUMN IF NOT EXISTS orden INTEGER DEFAULT 1;');
        console.log('SUCCESS: Column "orden" added.');
    } catch (error) {
        console.error('FAILED:', error);
    } finally {
        await pool.end();
    }
}

main();
