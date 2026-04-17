
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './shared/schema';
import { eq, and, asc } from 'drizzle-orm';
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_6Mlaq1ZKAuTV@ep-lively-firefly-a5q89531-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require",
});

const db = drizzle(pool, { schema });

async function main() {
    console.log('--- Debugging Student Content (Detailed) ---');
    const email = 'estudiante.i@geniosbot.org';
    
    try {
        const studentResult = await db.select().from(schema.usuarios).where(eq(schema.usuarios.email, email)).limit(1);
        const student = studentResult[0];
        
        if (!student) {
            console.log('Student not found');
            return;
        }
        console.log('Student found:', { id: student.id, name: student.nombre, cursoId: student.cursoId });
        
        const cursoId = student.cursoId;
        if (!cursoId) {
            console.log('Student has no cursoId');
            return;
        }

        const courseResult = await db.select().from(schema.cursos).where(eq(schema.cursos.id, cursoId)).limit(1);
        const course = courseResult[0];
        console.log('Course found:', course?.nombre);
        
        const sections = await db.select().from(schema.seccionesInst).where(eq(schema.seccionesInst.cursoId, cursoId)).orderBy(asc(schema.seccionesInst.orden));
        console.log('\n--- SECTIONS ---');
        for (const sec of sections) {
            console.log(`[Section ${sec.id}] ${sec.nombre}`);
            const modules = await db.select().from(schema.modulosInst).where(eq(schema.modulosInst.seccionId, sec.id)).orderBy(asc(schema.modulosInst.orden));
            for (const mod of modules) {
                console.log(`  - [Module ${mod.id}] [${mod.tipo}] ${mod.titulo}`);
                // Check if this might be the "repaso" module
                if (mod.titulo.toLowerCase().includes('repaso') || sec.nombre.toLowerCase().includes('repaso')) {
                    console.log('    >> CONTENIDO FOUND!');
                    console.log('    >> TIPO:', mod.tipo);
                    console.log('    >> JSON:', JSON.stringify(mod.contenido, null, 2));
                }
            }
        }
    } catch (err) {
        console.error('Error in debug script:', err);
    } finally {
        await pool.end();
    }
}

main();
