
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../../shared/schema';
import { eq, or, sql, asc } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../../../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

async function checkCoursesForProfessor(professorId: number) {
  console.log(`Checking Courses for Professor ID: ${professorId}`);
  
  const results = await db
    .select({
      id: schema.cursos.id,
      nombre: schema.cursos.nombre,
      profesorId: schema.cursos.profesorId,
    })
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
    )
    .orderBy(asc(schema.cursos.id));

  console.log('--- COURSES_FOUND ---');
  console.log(JSON.stringify(results, null, 2));

  // Also check if any module has curso_id = 1
  const mod1 = await db.select().from(schema.modulos).where(eq(schema.modulos.cursoId, 1));
  console.log('--- MODULOS_WITH_CURSO_1 ---');
  console.log(JSON.stringify(mod1, null, 2));

  // Check Jostin's profile again
  const user = await db.select().from(schema.usuarios).where(eq(schema.usuarios.id, professorId));
  console.log('--- USER_PROFILE ---');
  console.log(JSON.stringify(user, null, 2));

  process.exit(0);
}

checkCoursesForProfessor(145).catch(err => {
  console.error(err);
  process.exit(1);
});
