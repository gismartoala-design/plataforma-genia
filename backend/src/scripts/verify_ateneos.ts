import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function verify() {
    try {
        const inst = await pool.query("SELECT id, nombre FROM instituciones WHERE nombre ILIKE '%Ateneos%'");
        console.log('INSTITUTION:', JSON.stringify(inst.rows));
        
        if (inst.rows.length === 0) return;

        const courses = await pool.query("SELECT id, nombre FROM cursos WHERE institucion_id = $1", [inst.rows[0].id]);
        console.log('COURSES:', JSON.stringify(courses.rows));

        if (courses.rows.length === 0) return;

        const modules = await pool.query("SELECT id, nombre_modulo FROM modulos WHERE curso_id = $1", [courses.rows[0].id]);
        console.log('MODULES:', JSON.stringify(modules.rows));
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

verify();
