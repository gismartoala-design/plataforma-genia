import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function check() {
    try {
        const instRank = await pool.query("SELECT id, nombre FROM instituciones WHERE nombre ILIKE '%Ateneos%'");
        console.log('INSTITUTIONS_MATCH:', JSON.stringify(instRank.rows));

        const adminUser = await pool.query("SELECT id, nombre, email FROM usuarios WHERE role_id = 1 LIMIT 1");
        console.log('ADMIN_USER:', JSON.stringify(adminUser.rows));
        
        // Also check if the course already exists
        if (instRank.rows.length > 0) {
            const courses = await pool.query("SELECT id, nombre FROM cursos WHERE institucion_id = $1", [instRank.rows[0].id]);
            console.log('EXISTING_COURSES:', JSON.stringify(courses.rows));
        }
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

check();
