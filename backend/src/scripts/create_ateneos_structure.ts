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
    console.log('--- Ateneos Institutional Setup ---');

    try {
        // 1. Find or Create Institution
        const instName = 'Unidad Educativa los Ateneos';
        let instId: number;
        const existingInst = await db.select().from(schema.instituciones).where(eq(schema.instituciones.nombre, instName)).limit(1);
        
        if (existingInst.length === 0) {
            console.log(`Creating institution: ${instName}`);
            const [inst] = await db.insert(schema.instituciones).values({ nombre: instName }).returning();
            instId = inst.id;
        } else {
            console.log(`Found existing institution: ${instName}`);
            instId = existingInst[0].id;
        }

        // 2. Find a Professor (SuperAdmin or Default)
        console.log('Finding default professor...');
        const [admin] = await db.select().from(schema.usuarios).where(eq(schema.usuarios.roleId, 1)).limit(1);
        const profId = admin?.id || 1;

        // 3. Create Course: 1ro de EGB
        const courseName = '1ro de EGB';
        let courseId: number;
        const existingCourse = await db.select().from(schema.cursos)
            .where(
                and(
                    eq(schema.cursos.nombre, courseName),
                    eq(schema.cursos.institucionId, instId)
                )
            )
            .limit(1);

        if (existingCourse.length === 0) {
            console.log(`Creating course: ${courseName}`);
            const [course] = await db.insert(schema.cursos).values({
                nombre: courseName,
                institucionId: instId,
                profesorId: profId
            }).returning();
            courseId = course.id;
        } else {
            console.log(`Found existing course: ${courseName}`);
            courseId = existingCourse[0].id;
        }

        // 4. Create Modules and Levels
        const modulesData = [
            "Módulo 1. Descubro objetos, secuencias y funciones",
            "Módulo 2. Exploro acciones que producen respuestas",
            "Módulo 3. Represento y construyo ideas sencillas",
            "Módulo 4. Creo, comparto y cuido en comunidad"
        ];

        for (const modName of modulesData) {
            const existingMod = await db.select().from(schema.modulos)
                .where(
                    and(
                        eq(schema.modulos.nombreModulo, modName),
                        eq(schema.modulos.cursoId, courseId)
                    )
                )
                .limit(1);

            let modId: number;
            if (existingMod.length === 0) {
                console.log(`Creating module: ${modName}`);
                const [mod] = await db.insert(schema.modulos).values({
                    nombreModulo: modName,
                    cursoId: courseId,
                    profesorId: profId,
                    categoria: 'standard'
                }).returning();
                modId = mod.id;
            } else {
                console.log(`Found existing module: ${modName}`);
                modId = existingMod[0].id;
            }

            // Create Level: Nivel 1: Exploración
            const levelTitle = 'Nivel 1: Exploración';
            const existingLvl = await db.select().from(schema.niveles)
                .where(
                    and(
                        eq(schema.niveles.tituloNivel, levelTitle),
                        eq(schema.niveles.moduloId, modId)
                    )
                )
                .limit(1);

            if (existingLvl.length === 0) {
                console.log(`Creating level for module ${modId}: ${levelTitle}`);
                await db.insert(schema.niveles).values({
                    moduloId: modId,
                    tituloNivel: levelTitle,
                    orden: 1,
                    bloqueado: false
                }).execute();
            } else {
                console.log(`Level already exists for module ${modId}`);
            }
        }

        console.log('--- Setup Complete ---');
    } catch (error) {
        console.error('FAILED:', error);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

main();
