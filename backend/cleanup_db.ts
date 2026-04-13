
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './src/shared/schema';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { eq, inArray, or, and } from 'drizzle-orm';

dotenv.config({ path: join(__dirname, '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

async function cleanup() {
  console.log('--- STARTING DATABASE CLEANUP ---');
  
  const targetInstIds = [1, 2, 3, 4];
  
  try {
    await db.transaction(async (tx) => {
      // 0. Find all users tied to these institutions
      const targetUsers = await tx.select().from(schema.usuarios).where(inArray(schema.usuarios.institucionId, targetInstIds));
      const targetUserIds = targetUsers.map(u => u.id);
      
      const superAdminIds = targetUsers.filter(u => u.roleId === 1).map(u => u.id);
      const deleteUserIds = targetUsers.filter(u => u.roleId !== 1).map(u => u.id);

      // 1. Identify Courses
      const courses = await tx.select().from(schema.cursos).where(inArray(schema.cursos.institucionId, targetInstIds));
      const courseIds = courses.map(c => c.id);

      if (courseIds.length > 0) {
        console.log(`Found ${courseIds.length} courses. Identifying sub-resources...`);
        
        // Find standard modules tied to these courses
        const standardModules = await tx.select().from(schema.modulos).where(inArray(schema.modulos.cursoId, courseIds));
        const standardModuleIds = standardModules.map(m => m.id);

        if (standardModuleIds.length > 0) {
          const levels = await tx.select().from(schema.niveles).where(inArray(schema.niveles.moduloId, standardModuleIds));
          const levelIds = levels.map(l => l.id);

          if (levelIds.length > 0) {
            console.log(`Cleaning up content/activities for ${levelIds.length} levels...`);
            
            // Delete content and activities
            await tx.delete(schema.contenidos).where(inArray(schema.contenidos.nivelId, levelIds));
            await tx.delete(schema.actividades).where(inArray(schema.actividades.nivelId, levelIds));
            await tx.delete(schema.asistencia).where(inArray(schema.asistencia.nivelId, levelIds));
            await tx.delete(schema.progresoNiveles).where(inArray(schema.progresoNiveles.nivelId, levelIds));
            
            // Templates tied to levels
            await tx.delete(schema.plantillasRag).where(inArray(schema.plantillasRag.nivelId, levelIds));
            await tx.delete(schema.plantillasHa).where(inArray(schema.plantillasHa.nivelId, levelIds));
            await tx.delete(schema.plantillasBd).where(inArray(schema.plantillasBd.nivelId, levelIds));
            await tx.delete(schema.plantillasIt).where(inArray(schema.plantillasIt.nivelId, levelIds));
            await tx.delete(schema.plantillasPic).where(inArray(schema.plantillasPic.nivelId, levelIds));
            await tx.delete(schema.plantillasPim).where(inArray(schema.plantillasPim.nivelId, levelIds));
            await tx.delete(schema.plantillasKids).where(inArray(schema.plantillasKids.nivelId, levelIds));
            await tx.delete(schema.plantillasCity).where(inArray(schema.plantillasCity.nivelId, levelIds));

            // CRITICAL: Actually delete the levels themselves!
            console.log(`Deleting ${levelIds.length} levels...`);
            await tx.delete(schema.niveles).where(inArray(schema.niveles.id, levelIds));
          }

          console.log(`Deleting assignments/certificates for ${standardModuleIds.length} modules...`);
          await tx.delete(schema.moduloProfesores).where(inArray(schema.moduloProfesores.moduloId, standardModuleIds));
          await tx.delete(schema.asignaciones).where(inArray(schema.asignaciones.moduloId, standardModuleIds));
          await tx.delete(schema.certificados).where(inArray(schema.certificados.moduloId, standardModuleIds));
          
          console.log(`Deleting modules...`);
          await tx.delete(schema.modulos).where(inArray(schema.modulos.id, standardModuleIds));
        }

        // Institutional Hierarchy
        console.log('Cleaning up institutional hierarchy sections/modules...');
        const sections = await tx.select().from(schema.seccionesInst).where(inArray(schema.seccionesInst.cursoId, courseIds));
        const sectionIds = sections.map(s => s.id);
        
        if (sectionIds.length > 0) {
          const modInstList = await tx.select().from(schema.modulosInst).where(inArray(schema.modulosInst.seccionId, sectionIds));
          const modInstIds = modInstList.map(m => m.id);
          
          if (modInstIds.length > 0) {
            await tx.delete(schema.progresoModuloInst).where(inArray(schema.progresoModuloInst.moduloInstId, modInstIds));
            await tx.delete(schema.modulosInst).where(inArray(schema.modulosInst.id, modInstIds));
          }
          await tx.delete(schema.seccionesInst).where(inArray(schema.seccionesInst.id, sectionIds));
        }
      }

      // 2. User-Related Data
      if (targetUserIds.length > 0) {
        console.log(`Cleaning up deliveries and logs for ${targetUserIds.length} users...`);
        // Deliveries
        await tx.delete(schema.entregas).where(inArray(schema.entregas.estudianteId, targetUserIds));
        await tx.delete(schema.entregasBd).where(inArray(schema.entregasBd.estudianteId, targetUserIds));
        await tx.delete(schema.entregasHa).where(inArray(schema.entregasHa.estudianteId, targetUserIds));
        await tx.delete(schema.entregasIt).where(inArray(schema.entregasIt.estudianteId, targetUserIds));
        await tx.delete(schema.entregasPic).where(inArray(schema.entregasPic.estudianteId, targetUserIds));
        await tx.delete(schema.entregasPim).where(inArray(schema.entregasPim.estudianteId, targetUserIds));
        await tx.delete(schema.entregasRag).where(inArray(schema.entregasRag.estudianteId, targetUserIds));
        await tx.delete(schema.entregasKids).where(inArray(schema.entregasKids.estudianteId, targetUserIds));
        
        // Logs/Progress
        await tx.delete(schema.puntosLog).where(inArray(schema.puntosLog.estudianteId, targetUserIds));
        await tx.delete(schema.logrosDesbloqueados).where(inArray(schema.logrosDesbloqueados.estudianteId, targetUserIds));
        await tx.delete(schema.progresoMisiones).where(inArray(schema.progresoMisiones.estudianteId, targetUserIds));
        await tx.delete(schema.gamificacionEstudiante).where(inArray(schema.gamificacionEstudiante.estudianteId, targetUserIds));
        await tx.delete(schema.usuariosSkins).where(inArray(schema.usuariosSkins.usuarioId, targetUserIds));
        await tx.delete(schema.certificados).where(inArray(schema.certificados.estudianteId, targetUserIds));
        await tx.delete(schema.progresoCity).where(inArray(schema.progresoCity.estudianteId, targetUserIds));
        await tx.delete(schema.progresoNiveles).where(inArray(schema.progresoNiveles.estudianteId, targetUserIds));
        await tx.delete(schema.progresoModuloInst).where(inArray(schema.progresoModuloInst.estudianteId, targetUserIds));

        // Mixed references
        await tx.delete(schema.asignaciones).where(or(inArray(schema.asignaciones.estudianteId, targetUserIds), inArray(schema.asignaciones.profesorId, targetUserIds)));
        await tx.delete(schema.moduloProfesores).where(inArray(schema.moduloProfesores.profesorId, targetUserIds));
        await tx.delete(schema.asistencia).where(or(inArray(schema.asistencia.estudianteId, targetUserIds), inArray(schema.asistencia.profesorId, targetUserIds)));

        // 3. Unlink Super Admins
        if (superAdminIds.length > 0) {
          console.log(`Unlinking ${superAdminIds.length} super admins...`);
          await tx.update(schema.usuarios)
            .set({ institucionId: null, cursoId: null })
            .where(inArray(schema.usuarios.id, superAdminIds));
        }

        // 4. Delete Users
        if (deleteUserIds.length > 0) {
          console.log(`Deleting ${deleteUserIds.length} institutional users...`);
          await tx.delete(schema.usuarios).where(inArray(schema.usuarios.id, deleteUserIds));
        }
      }

      // 5. Hierarchy Cleanup
      if (courseIds.length > 0) {
        console.log('Deleting courses...');
        await tx.delete(schema.cursos).where(inArray(schema.cursos.id, courseIds));
      }
      
      console.log('Deleting institutions...');
      await tx.delete(schema.instituciones).where(inArray(schema.instituciones.id, targetInstIds));

      console.log('--- CLEANUP COMPLETE ---');
    });
  } catch (error) {
    console.error('Cleanup failed:', error);
  } finally {
    await pool.end();
  }
}

cleanup();
