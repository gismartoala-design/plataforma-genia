import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error('DATABASE_URL not found');
        process.exit(1);
    }

    const pool = new Pool({ connectionString });
    try {
        const sqlFile = path.join(__dirname, 'drizzle/0013_early_the_hand.sql');
        const sql = fs.readFileSync(sqlFile, 'utf8');
        console.log('Applying migration:', sqlFile);
        
        // Execute the SQL. Since it has multiple statements, we can use pool.query
        // or split by --> statement-breakpoint
        const statements = sql.split('--> statement-breakpoint');
        for (const statement of statements) {
            if (statement.trim()) {
                console.log('Executing statement...');
                await pool.query(statement.trim());
            }
        }
        console.log('DONE!');
    } catch (error) {
        console.error('FAILED:', error);
    } finally {
        await pool.end();
    }
}

main();
