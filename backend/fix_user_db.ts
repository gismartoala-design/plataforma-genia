
import { Client } from 'pg';

async function fixUser() {
    const client = new Client({
        connectionString: "postgresql://neondb_owner:npg_8DLHWINgfYS3@ep-holy-scene-ad71wis8-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
    });

    try {
        await client.connect();
        
        // 1. Get first institution and course
        const inst = await client.query('SELECT id FROM instituciones LIMIT 1');
        const curso = await client.query('SELECT id FROM cursos LIMIT 1');
        
        if (inst.rows.length > 0 && curso.rows.length > 0) {
            const instId = inst.rows[0].id;
            const cursoId = curso.rows[0].id;
            
            // 2. Update user 129 (and any other potential test user like ID 1)
            await client.query('UPDATE usuarios SET institucion_id = $1, curso_id = $2 WHERE id IN (1, 129)', [instId, cursoId]);
            console.log(`[FIX] Users 1 and 129 successfully linked to Institution ${instId} and Course ${cursoId}`);
        } else {
            console.log('[ERROR] No institutions or courses found to link.');
        }

    } catch (err) {
        console.error('Error fixing user in DB:', err);
    } finally {
        await client.end();
    }
}

fixUser();
