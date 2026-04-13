
const { Pool } = require('pg');
const pool = new Pool({
    connectionString: "postgresql://neondb_owner:npg_8DLHWINgfYS3@ep-holy-scene-ad71wis8-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"
});

async function verifyFix() {
    try {
        const professorId = 152; // Jostin

        // Simulate the new backend query logic
        const query = `
      SELECT id, nombre 
      FROM cursos 
      WHERE 
        profesor_id = $1
        OR EXISTS (
          SELECT 1 FROM modulos m 
          WHERE m.curso_id = cursos.id 
          AND (
            m.profesor_id = $1
            OR EXISTS (SELECT 1 FROM modulo_profesores mp WHERE mp.modulo_id = m.id AND mp.profesor_id = $1)
            OR EXISTS (SELECT 1 FROM asignaciones a WHERE a.modulo_id = m.id AND a.profesor_id = $1)
          )
        )
        OR EXISTS (
          SELECT 1 FROM modulos_inst mi 
          WHERE mi.curso_id = cursos.id 
          AND mi.profesor_id = $1
        )
        OR EXISTS (
          SELECT 1 FROM usuarios_cursos uc
          WHERE uc.curso_id = cursos.id
          AND uc.usuario_id = $1
        )
    `;

        const res = await pool.query(query, [professorId]);
        console.log('--- VERIFICATION RESULTS ---');
        console.log(`Found ${res.rows.length} courses for professor 152:`);
        console.log(JSON.stringify(res.rows, null, 2));

    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

verifyFix();
