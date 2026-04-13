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
    console.log('--- Ateneos Academic Content Population ---');

    try {
        // 1. Find the Institution
        const [inst] = await db.select().from(schema.instituciones).where(eq(schema.instituciones.nombre, 'Unidad Educativa los Ateneos')).limit(1);
        if (!inst) throw new Error('Institution not found');

        // 2. Find the Course
        const [course] = await db.select().from(schema.cursos).where(and(eq(schema.cursos.nombre, '1ro de EGB'), eq(schema.cursos.institucionId, inst.id))).limit(1);
        if (!course) throw new Error('Course not found');

        // 3. Find all Modules and their levels
        const mods = await db.select().from(schema.modulos).where(eq(schema.modulos.cursoId, course.id));
        
        for (const mod of mods) {
            console.log(`Processing Module: ${mod.nombreModulo}`);
            const lvls = await db.select().from(schema.niveles).where(eq(schema.niveles.moduloId, mod.id));
            
            for (const lvl of lvls) {
                console.log(`  Adding content to Level: ${lvl.tituloNivel}`);

                // A. Add a PDF Content
                await db.insert(schema.contenidos).values({
                    nivelId: lvl.id,
                    tipo: 'pdf',
                    urlRecurso: 'https://edu-docs.s3.amazonaws.com/ateneos/intro.pdf',
                    orden: 1
                }).onConflictDoNothing();

                // B. Add a RAG Template
                await db.insert(schema.plantillasRag).values({
                    nivelId: lvl.id,
                    hitoAprendizaje: `Hito Inicial - ${mod.nombreModulo}`,
                    proposito: `Introducción a los conceptos básicos de ${mod.nombreModulo}.`,
                    objetivoAprendizaje: 'Comprender los fundamentos y aplicaciones prácticas.',
                    tipoRag: 'Práctica',
                    modalidad: 'Autónoma',
                    duracionEstimada: '2 horas'
                }).onConflictDoNothing();

                // C. Add an HA Template
                await db.insert(schema.plantillasHa).values({
                    nivelId: lvl.id,
                    fase: 'Exploración',
                    objetivoSemana: `Dominar los conceptos iniciales de ${mod.nombreModulo}.`,
                    resultadoEsperado: 'El estudiante identifica correctamente los elementos clave.'
                }).onConflictDoNothing();
            }
        }

        console.log('--- Population Complete ---');
    } catch (error) {
        console.error('FAILED:', error);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

main();
