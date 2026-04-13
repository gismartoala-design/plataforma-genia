import {
  Inject,
  Injectable,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { DRIZZLE_DB } from '../database/drizzle.provider';
import {
  modulos,
  niveles,
  contenidos,
  InsertModulo,
  InsertNivel,
  InsertContenido,
} from '../shared/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../shared/schema';
import { eq, and, or, inArray, asc } from 'drizzle-orm';

@Injectable()
export class ModulesService {
  constructor(@Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>) {}

  async createModule(data: InsertModulo) {
    const [newModule] = await this.db.insert(modulos).values(data).returning();
    return newModule;
  }

  async updateModule(id: number, data: Partial<InsertModulo>) {
    const [updated] = await this.db
      .update(modulos)
      .set(data)
      .where(eq(modulos.id, id))
      .returning();
    return updated;
  }

  async getModulesByProfesorId(professorId: number) {
    const modProfResult = await this.db
      .select({ moduloId: schema.moduloProfesores.moduloId })
      .from(schema.moduloProfesores)
      .where(eq(schema.moduloProfesores.profesorId, professorId));

    const asigResult = await this.db
      .select({ moduloId: schema.asignaciones.moduloId })
      .from(schema.asignaciones)
      .where(eq(schema.asignaciones.profesorId, professorId));

    const modProfIds = modProfResult.map((a) => a.moduloId).filter((id): id is number => id !== null);
    const asigIds = asigResult.map((a) => a.moduloId).filter((id): id is number => id !== null);

    const allAssignedIds = [...new Set([...modProfIds, ...asigIds])];

    const condition = allAssignedIds.length > 0
      ? or(
          eq(modulos.profesorId, professorId),
          inArray(modulos.id as any, allAssignedIds as any),
        )
      : eq(modulos.profesorId, professorId);

    const mods = await this.db
      .select()
      .from(modulos)
      .where(condition)
      .orderBy(modulos.fechaCreacion);

    return mods;
  }

  async getModulesByProfessor(professorId: number) {
    // 1. Get modules where the professor is the owner
    const ownedModules = await this.db
      .select()
      .from(schema.modulos)
      .where(eq(schema.modulos.profesorId, professorId));

    // 2. Get modules assigned to this professor via the assignments table
    const assignedDirectly = await this.db
      .select({
        module: schema.modulos,
      })
      .from(schema.asignaciones)
      .innerJoin(
        schema.modulos,
        eq(schema.asignaciones.moduloId, schema.modulos.id),
      )
      .where(eq(schema.asignaciones.profesorId, professorId));

    // Combine and deduplicate by ID
    const moduleMap = new Map<number, any>();
    ownedModules.forEach(m => moduleMap.set(m.id, m));
    assignedDirectly.forEach(row => moduleMap.set(row.module.id, row.module));

    const allModules = Array.from(moduleMap.values());

    const modulesWithDetails = await Promise.all(
      allModules.map(async (mod) => {
        // Get levels for this module (CRITICAL for LATAM dashboard)
        const lvls = await this.db
          .select()
          .from(schema.niveles)
          .where(eq(schema.niveles.moduloId, mod.id))
          .orderBy(asc(schema.niveles.orden));

        // Get students for this module
        const studentAssignments = await this.db
          .select({
            user: schema.usuarios,
          })
          .from(schema.asignaciones)
          .innerJoin(
            schema.usuarios,
            eq(schema.asignaciones.estudianteId, schema.usuarios.id),
          )
          .where(eq(schema.asignaciones.moduloId, mod.id));

        return {
          ...mod,
          levels: lvls,
          studentsCount: studentAssignments.length,
          students: studentAssignments.map((s) => s.user),
        };
      }),
    );

    return modulesWithDetails;
  }

  async getModuleById(id: number) {
    const [mod] = await this.db
      .select()
      .from(modulos)
      .where(eq(modulos.id, id));
    return mod;
  }

  async createLevel(data: InsertNivel) {
    const [newLevel] = await this.db.insert(niveles).values(data).returning();
    return newLevel;
  }

  async getLevelsByModule(moduleId: number) {
    return this.db
      .select()
      .from(niveles)
      .where(eq(niveles.moduloId, moduleId))
      .orderBy(niveles.orden);
  }

  async createContent(data: InsertContenido) {
    const [newContent] = await this.db
      .insert(contenidos)
      .values(data)
      .returning();
    return newContent;
  }

  async getContentsByLevel(levelId: number) {
    return this.db
      .select()
      .from(contenidos)
      .where(eq(contenidos.nivelId, levelId));
  }

  async getAllModules() {
    const _modules = await this.db.select().from(modulos);

    const modulesWithDetails = await Promise.all(
      _modules.map(async (mod) => {
        // Better approach: Get all assignments for this module, then fetch users.
        // Or simpler:
        const studentAssignments = await this.db
          .select({
            user: schema.usuarios,
          })
          .from(schema.asignaciones)
          .innerJoin(
            schema.usuarios,
            eq(schema.asignaciones.estudianteId, schema.usuarios.id),
          )
          .where(eq(schema.asignaciones.moduloId, mod.id));

        const professorAssignments = await this.db
          .select({
            user: schema.usuarios,
          })
          .from(schema.asignaciones)
          .innerJoin(
            schema.usuarios,
            eq(schema.asignaciones.profesorId, schema.usuarios.id),
          )
          .where(eq(schema.asignaciones.moduloId, mod.id));

        return {
          ...mod,
          studentsCount: studentAssignments.length,
          students: studentAssignments.map((s) => s.user),
          professors: professorAssignments.map((p) => p.user),
          professor:
            professorAssignments.length > 0
              ? professorAssignments[0].user.nombre
              : 'Sin asignar',
        };
      }),
    );

    return modulesWithDetails;
  }

  async assignUserToModule(data: {
    estudianteId?: number;
    profesorId?: number;
    moduloId: number;
  }) {
    // Check for existing assignment
    let updateCondition;
    if (data.estudianteId) {
      updateCondition = eq(schema.asignaciones.estudianteId, data.estudianteId);
    } else if (data.profesorId) {
      updateCondition = eq(schema.asignaciones.profesorId, data.profesorId);
    } else {
      throw new BadRequestException(
        'Debe proporcionar estudianteId o profesorId',
      );
    }

    const existing = await this.db
      .select()
      .from(schema.asignaciones)
      .where(
        and(eq(schema.asignaciones.moduloId, data.moduloId), updateCondition),
      )
      .limit(1);

    if (existing.length > 0) {
      throw new ConflictException('El usuario ya está asignado a este módulo.');
    }

    const [assignment] = await this.db
      .insert(schema.asignaciones)
      .values(data)
      .returning();
    return assignment;
  }

  async deleteModule(moduleId: number) {
    // 1. Delete assignments
    await this.db
      .delete(schema.asignaciones)
      .where(eq(schema.asignaciones.moduloId, moduleId));

    // 2. Get Levels to delete their contents first
    const levels = await this.db
      .select()
      .from(schema.niveles)
      .where(eq(schema.niveles.moduloId, moduleId));

    for (const level of levels) {
      await this.db
        .delete(schema.contenidos)
        .where(eq(schema.contenidos.nivelId, level.id));
      await this.db
        .delete(schema.actividades)
        .where(eq(schema.actividades.nivelId, level.id));
    }

    // 3. Delete Levels
    await this.db
      .delete(schema.niveles)
      .where(eq(schema.niveles.moduloId, moduleId));

    // 4. Delete Certificados
    await this.db
      .delete(schema.certificados)
      .where(eq(schema.certificados.moduloId, moduleId));

    // 5. Delete Module
    await this.db.delete(schema.modulos).where(eq(schema.modulos.id, moduleId));

    return { success: true };
  }

  async duplicateModule(moduleId: number, newName: string, targetProfessorId?: number) {
    return await this.db.transaction(async (tx) => {
      // 1. Get source module
      const [sourceModule] = await tx.select().from(modulos).where(eq(modulos.id, moduleId));
      if (!sourceModule) throw new BadRequestException('Módulo de origen no encontrado');

      // 2. Create new module
      const { id: oldId, ...moduleData } = sourceModule;
      const [newModule] = await tx.insert(modulos).values({
        ...moduleData,
        nombreModulo: newName,
        profesorId: targetProfessorId || sourceModule.profesorId,
        fechaCreacion: new Date()
      }).returning();

      // 3. Get all levels of source module
      const sourceLevels = await tx.select().from(niveles).where(eq(niveles.moduloId, moduleId)).orderBy(niveles.orden);

      for (const level of sourceLevels) {
        const { id: oldLevelId, ...levelData } = level;
        const [newLevel] = await tx.insert(niveles).values({
          ...levelData,
          moduloId: newModule.id
        }).returning();

        // 4. Duplicate Contents
        const levelContents = await tx.select().from(contenidos).where(eq(contenidos.nivelId, oldLevelId));
        for (const content of levelContents) {
          const { id: oldContentId, ...contentData } = content;
          await tx.insert(contenidos).values({ ...contentData, nivelId: newLevel.id });
        }

        // 5. Duplicate Activities
        const levelActivities = await tx.select().from(schema.actividades).where(eq(schema.actividades.nivelId, oldLevelId));
        for (const activity of levelActivities) {
          const { id: oldActivityId, ...activityData } = activity;
          await tx.insert(schema.actividades).values({ ...activityData, nivelId: newLevel.id });
        }

        // 6. Duplicate Templates
        // List of template tables to duplicate
        const templateTables = [
          { table: schema.plantillasRag, name: 'RAG' },
          { table: schema.plantillasHa, name: 'HA' },
          { table: schema.plantillasKids, name: 'Kids' },
          { table: schema.plantillasCity, name: 'City' }
        ];

        for (const t of templateTables) {
          const records = await tx.select().from(t.table as any).where(eq((t.table as any).nivelId, oldLevelId));
          for (const record of records) {
            const { id: oldTemplateId, ...templateData } = record;
            await tx.insert(t.table as any).values({ ...templateData, nivelId: newLevel.id });
          }
        }
      }

      return newModule;
    });
  }
}
