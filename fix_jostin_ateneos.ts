import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './backend/src/shared/schema';
import { eq, inArray } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, 'backend/.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

const db = drizzle(pool, { schema });

async function fixJostin() {
    const email = 'jostin.duarte@intuit.com';
    const ateneosId = 4;
    const courseIds = [9, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34];

    console.log(`--- Syncing Jostin Duarte (ID: 128) for Ateneos (ID: ${ateneosId}) ---`);

    try {
        // 1. Find Jostin
        const [user] = await db.select().from(schema.usuarios).where(eq(schema.usuarios.email, email)).limit(1);
        if (!user) throw new Error('User jostin.duarte@intuit.com not found!');
        
        console.log(`Updating Jostin (ID: ${user.id}) to Institution: ${ateneosId}`);
        
        // 2. Update Jostin's Institution
        await db.update(schema.usuarios)
            .set({ institucionId: ateneosId })
            .where(eq(schema.usuarios.id, user.id));

        // 3. Assign as Professor to Courses
        console.log(`Assigning as profesor_id to Courses: ${courseIds.join(', ')}`);
        await db.update(schema.cursos)
            .set({ profesorId: user.id })
            .where(inArray(schema.cursos.id, courseIds));

        // 4. Assign as Professor to Modules (Institutional) in those courses
        // (Optional: help visibility by assigning modulos_inst as well)
        console.log(`Checking for institutional modules in those courses...`);
        const instModules = await db.select().from(schema.modulosInst).where(inArray(schema.modulosInst.cursoId, courseIds));
        
        if (instModules.length > 0) {
            console.log(`Assigning ${instModules.length} institutional modules to Jostin...`);
            await db.update(schema.modulosInst)
                .set({ profesorId: user.id })
                .where(inArray(schema.modulosInst.cursoId, courseIds));
        }

        console.log(`\n✅ Jostin Duarte Sync Complete!`);
        console.log(`He is now the Lead Engineer for Los Ateneos.`);

    } catch (error) {
        console.error('FAILED:', error);
    } finally {
        await pool.end();
    }
}

fixJostin();
