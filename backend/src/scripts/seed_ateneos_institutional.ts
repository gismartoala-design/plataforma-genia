import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../shared/schema';
import { eq, and } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

const db = drizzle(pool, { schema });

async function main() {
    console.log('--- Ateneos Institutional Visibility Fix ---');

    try {
        // 1. Find the Institution
        const [inst] = await db.select().from(schema.instituciones).where(eq(schema.instituciones.nombre, 'Unidad Educativa los Ateneos')).limit(1);
        if (!inst) throw new Error('Institution not found');

        // 2. Find the Course
        const [course] = await db.select().from(schema.cursos).where(and(eq(schema.cursos.nombre, '1ro de EGB'), eq(schema.cursos.institucionId, inst.id))).limit(1);
        if (!course) throw new Error('Course not found');

        // 3. Clear existing institutional sections for this course to avoid duplicates
        await db.delete(schema.seccionesInst).where(eq(schema.seccionesInst.cursoId, course.id));

        // 4. Create the 4 Modules as Institutional Sections
        const modulesData = [
            "Módulo 1. Descubro objetos, secuencias y funciones",
            "Módulo 2. Exploro acciones que producen respuestas",
            "Módulo 3. Represento y construyo ideas sencillas",
            "Módulo 4. Creo, comparto y cuido en comunidad"
        ];

        for (let i = 0; i < modulesData.length; i++) {
            const modName = modulesData[i];
            console.log(`Creating section: ${modName}`);
            const [section] = await db.insert(schema.seccionesInst).values({
                cursoId: course.id,
                nombre: modName,
                orden: i
            }).returning();

            // Also create a default "Lección Inicial" for each section to show content
            await db.insert(schema.modulosInst).values({
                seccionId: section.id,
                cursoId: course.id,
                titulo: 'Lección Inicial',
                tipo: 'lesson',
                orden: 0
            });
        }

        console.log('--- Seeding Complete (Athens course id: ' + course.id + ') ---');
    } catch (error) {
        console.error('FAILED:', error);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

main();
