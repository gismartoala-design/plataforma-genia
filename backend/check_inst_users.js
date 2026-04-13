
const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function checkUsers() {
    const client = postgres(process.env.DATABASE_URL);
    const db = drizzle(client);
    
    try {
        const columns = await client`SELECT column_name FROM information_schema.columns WHERE table_name = 'usuarios'`;
        console.log('Columns in "usuarios":', columns.map(c => c.column_name).join(', '));
        
        const institutions = await client`SELECT id, nombre FROM instituciones`;
        console.log('Institutions Found:', JSON.stringify(institutions, null, 2));

        const courses = await client`SELECT id, nombre, institucion_id FROM cursos`;
        console.log('Courses Found:', JSON.stringify(courses, null, 2));
        
    } catch (err) {
        console.error('Error checking users:', err);
    } finally {
        await client.end();
    }
}

checkUsers();
