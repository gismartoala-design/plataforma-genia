
import { Client } from 'pg';

async function checkUsers() {
    const client = new Client({
        connectionString: "postgresql://neondb_owner:npg_8DLHWINgfYS3@ep-holy-scene-ad71wis8-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
    });

    try {
        await client.connect();
        const res = await client.query('SELECT id, nombre, email, "role_id", "institucion_id", "curso_id" FROM usuarios WHERE "role_id" IN (3, 10, 8, 9) ORDER BY id DESC LIMIT 20');
        console.log('--- RECENT USERS ---');
        console.log(JSON.stringify(res.rows, null, 2));
        
        const insts = await client.query('SELECT id, nombre FROM instituciones');
        console.log('--- INSTITUTIONS ---');
        console.log(JSON.stringify(insts.rows, null, 2));

        const cursos = await client.query('SELECT id, nombre FROM cursos');
        console.log('--- COURSES ---');
        console.log(JSON.stringify(cursos.rows, null, 2));

    } catch (err) {
        console.error('Error querying DB:', err);
    } finally {
        await client.end();
    }
}

checkUsers();
