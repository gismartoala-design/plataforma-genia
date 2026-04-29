import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DRIZZLE_DB } from '../../database/drizzle.provider';
import * as schema from '../../shared/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';

@Injectable()
export class InstitutionalCloningService {
  constructor(
    @Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>,
  ) {}

  /**
   * Deep clones an institution:
   * 1. New Institution entry.
   * 2. New Admin User for that institution.
   * 3. All Courses -> Sections (SeccionesInst) -> Modules (ModulosInst).
   */
  async cloneInstitution(sourceId: number, data: {
    nombre: string;
    ciudad: string;
    email: string;
    adminNombre: string;
    adminEmail: string;
    adminPassword?: string;
  }) {
    return await this.db.transaction(async (tx) => {
      // 1. Create New Institution
      const [newInst] = await tx.insert(schema.instituciones).values({
        nombre: data.nombre,
        logoUrl: null, // Default
        configuracionVisual: { theme: 'cyberpunk', primaryColor: '#f97316' },
      }).returning();

      // 2. Create New Admin User
      const [newAdmin] = await tx.insert(schema.usuarios).values({
        nombre: data.adminNombre,
        email: data.adminEmail,
        password: data.adminPassword || 'admin123',
        roleId: 8, // Institutional Admin
        institucionId: newInst.id,
        activo: true,
        onboardingCompleted: true,
        planId: 4, // Default plan
      }).returning();

      // 3. Fetch Source Courses
      const sourceCourses = await tx.select().from(schema.cursos).where(eq(schema.cursos.institucionId, sourceId));

      for (const course of sourceCourses) {
        // Create Clone Course
        const [newCourse] = await tx.insert(schema.cursos).values({
          nombre: course.nombre,
          institucionId: newInst.id,
          profesorId: null, // Reset professor assignment
          companiaId: course.companiaId,
        }).returning();

        // Fetch Source Sections (SeccionesInst)
        const sourceSections = await tx.select().from(schema.seccionesInst).where(eq(schema.seccionesInst.cursoId, course.id));

        for (const section of sourceSections) {
          // Create Clone Section
          const [newSection] = await tx.insert(schema.seccionesInst).values({
            nombre: section.nombre,
            descripcion: section.descripcion,
            cursoId: newCourse.id,
            orden: section.orden,
          }).returning();

          // Fetch Source Institutional Modules (ModulosInst)
          const sourceModules = await tx.select().from(schema.modulosInst).where(eq(schema.modulosInst.seccionId, section.id));

          for (const mod of sourceModules) {
            // Create Clone Module
            await tx.insert(schema.modulosInst).values({
              titulo: mod.titulo,
              descripcion: mod.descripcion,
              seccionId: newSection.id,
              cursoId: newCourse.id,
              profesorId: null, // Reset
              tipo: mod.tipo,
              contenido: mod.contenido,
              activo: mod.activo,
              bloqueado: mod.bloqueado,
              xpRecompensa: mod.xpRecompensa,
              orden: mod.orden,
            });
          }
        }
      }

      return {
        success: true,
        institutionId: newInst.id,
        adminId: newAdmin.id,
        coursesCloned: sourceCourses.length,
      };
    });
  }

  /**
   * Clones a single institutional module/lesson within a section.
   */
  async cloneModule(moduleId: number, targetSectionId?: number) {
    const [sourceMod] = await this.db.select().from(schema.modulosInst).where(eq(schema.modulosInst.id, moduleId)).limit(1);
    if (!sourceMod) throw new NotFoundException('Module not found');

    const [cloned] = await this.db.insert(schema.modulosInst).values({
      ...sourceMod,
      id: undefined, // Let DB generate new ID
      titulo: `${sourceMod.titulo} (Copia)`,
      seccionId: targetSectionId || sourceMod.seccionId,
      fechaCreacion: new Date(),
    }).returning();

    return cloned;
  }

  /**
   * Copies curriculum (courses, sections, modules) from one existing institution to another.
   */
  async copyCurriculum(sourceId: number, targetId: number) {
    return await this.db.transaction(async (tx) => {
      // Fetch Source Courses
      const sourceCourses = await tx.select().from(schema.cursos).where(eq(schema.cursos.institucionId, sourceId));

      for (const course of sourceCourses) {
        // Create Clone Course in Target Institution
        const [newCourse] = await tx.insert(schema.cursos).values({
          nombre: course.nombre,
          institucionId: targetId,
          profesorId: null, // Reset professor assignment
          companiaId: course.companiaId,
        }).returning();

        // Fetch Source Sections (SeccionesInst)
        const sourceSections = await tx.select().from(schema.seccionesInst).where(eq(schema.seccionesInst.cursoId, course.id));

        for (const section of sourceSections) {
          // Create Clone Section
          const [newSection] = await tx.insert(schema.seccionesInst).values({
            nombre: section.nombre,
            descripcion: section.descripcion,
            cursoId: newCourse.id,
            orden: section.orden,
          }).returning();

          // Fetch Source Institutional Modules (ModulosInst)
          const sourceModules = await tx.select().from(schema.modulosInst).where(eq(schema.modulosInst.seccionId, section.id));

          for (const mod of sourceModules) {
            // Create Clone Module
            await tx.insert(schema.modulosInst).values({
              titulo: mod.titulo,
              descripcion: mod.descripcion,
              seccionId: newSection.id,
              cursoId: newCourse.id,
              profesorId: null, // Reset
              tipo: mod.tipo,
              contenido: mod.contenido,
              activo: mod.activo,
              bloqueado: mod.bloqueado,
              xpRecompensa: mod.xpRecompensa,
              orden: mod.orden,
            });
          }
        }
      }

      return {
        success: true,
        sourceInstitutionId: sourceId,
        targetInstitutionId: targetId,
        coursesCopied: sourceCourses.length,
      };
    });
  }
}
