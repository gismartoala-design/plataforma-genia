
import { Client } from 'pg';

async function checkInsts() {
    const client = new Client({
        connectionString: "postgresql://neondb_owner:npg_8DLHWINgfYS3@ep-holy-scene-ad71wis8-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
    });

    try {
        await client.connect();
        const res = await client.query('SELECT * FROM instituciones');
        console.log('--- INSTITUTIONS ---');
        console.log(JSON.stringify(res.rows, null, 2));
        
    } catch (err) {
        console.error('Error querying DB:', err);
    } finally {
        await client.end();
    }
}

checkInsts();
