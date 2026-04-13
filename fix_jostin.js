const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, 'backend/.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function fixJostin() {
    const email = 'jostin.duarte@intuit.com';
    const ateneosId = 4;
    const courseIds = [9, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34];

    console.log(`--- RAW SQL FIX: Syncing Jostin Duarte (email: ${email}) ---`);

    try {
        const client = await pool.connect();
        
        // 1. Get User ID
        const userRes = await client.query('SELECT id FROM usuarios WHERE email = $1', [email]);
        if (userRes.rows.length === 0) {
            console.error('User not found!');
            return;
        }
        const userId = userRes.rows[0].id;
        console.log(`Found Jostin ID: ${userId}`);

        // 2. Update Institution
        await client.query('UPDATE usuarios SET institucion_id = $1 WHERE id = $2', [ateneosId, userId]);
        console.log(`Updated Jostin to Institucion ID: ${ateneosId}`);

        // 3. Assign Courses as profesor_id
        const courseIdsStr = courseIds.join(',');
        await client.query(`UPDATE cursos SET profesor_id = $1 WHERE id = ANY($2)`, [userId, courseIds]);
        console.log(`Assigned courses: ${courseIdsStr}`);

        // 4. Assign Institutional Modules as profesor_id
        await client.query(`UPDATE modulos_inst SET profesor_id = $1 WHERE curso_id = ANY($2)`, [userId, courseIds]);
        console.log(`Assigned all institutional modules in those courses to Jostin.`);

        client.release();
        console.log('\n✅ Jostin sync complete. Please refresh the Genia portal.');

    } catch (err) {
        console.error('ERROR during SQL fix:', err);
    } finally {
        await pool.end();
    }
}

fixJostin();
