import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './backend/src/shared/schema';
import { eq, or, sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, 'backend/.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

const db = drizzle(pool, { schema });

async function checkJostin() {
    const email = 'jostin.duarte@intuit.com';
    console.log(`Checking data for: ${email}`);

    try {
        // 1. User Record
        const [user] = await db.select().from(schema.usuarios).where(eq(schema.usuarios.email, email)).limit(1);
        if (!user) {
            console.log('User not found!');
            return;
        }
        console.log(`User ID: ${user.id}, Name: ${user.nombre}, InstitucionID: ${user.institucionId}`);

        // 2. Direct Course Ownership
        const directCourses = await db.select().from(schema.cursos).where(eq(schema.cursos.profesorId, user.id));
        console.log(`Directly Owned Courses: ${directCourses.length}`, directCourses.map(c => c.nombre));

        // 3. Modulos Standard Assignments
        const standardModules = await db.select().from(schema.modulos).where(eq(schema.modulos.profesorId, user.id));
        console.log(`Standard Modules Assigned: ${standardModules.length}`, standardModules.map(m => m.nombreModulo));

        // 4. Modulo Profesores (Join Table)
        const joinTableAssignments = await db.select().from(schema.moduloProfesores).where(eq(schema.moduloProfesores.profesorId, user.id));
        console.log(`Modulo Profesores Assignments: ${joinTableAssignments.length}`);

        // 5. Institutional Modules (Ateneos)
        const instModules = await db.select().from(schema.modulosInst).where(eq(schema.modulosInst.profesorId, user.id));
        console.log(`Institutional Modules Assigned: ${instModules.length}`, instModules.map(m => m.titulo));

        // 6. Test the actual combined query logic
        const professorId = user.id;
        const results = await db
            .select({ id: schema.cursos.id, nombre: schema.cursos.nombre })
            .from(schema.cursos)
            .where(
                or(
                    eq(schema.cursos.profesorId, professorId),
                    sql`EXISTS (
                        SELECT 1 FROM ${schema.modulos} m 
                        WHERE m.curso_id = ${schema.cursos.id} 
                        AND (
                            m.profesor_id = ${professorId}
                            OR EXISTS (SELECT 1 FROM ${schema.moduloProfesores} mp WHERE mp.modulo_id = m.id AND mp.profesor_id = ${professorId})
                            OR EXISTS (SELECT 1 FROM ${schema.asignaciones} a WHERE a.modulo_id = m.id AND a.profesor_id = ${professorId})
                        )
                    )`,
                    sql`EXISTS (
                        SELECT 1 FROM ${schema.modulosInst} mi 
                        WHERE mi.curso_id = ${schema.cursos.id} 
                        AND mi.profesor_id = ${professorId}
                    )`
                )
            );
        console.log(`\n--- QUERY TEST RESULT ---`);
        console.log(`Courses found by the combined query: ${results.length}`, results);

    } catch (error) {
        console.error('ERROR:', error);
    } finally {
        await pool.end();
    }
}

checkJostin();
