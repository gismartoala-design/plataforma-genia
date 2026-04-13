import {
  Inject,
  Injectable,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { DRIZZLE_DB } from '../../database/drizzle.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../shared/schema';
import { eq, and, asc, sql, like, or } from 'drizzle-orm';
import { StorageService } from '../storage/storage.service';
import { StudentService } from '../student/student.service';

@Injectable()
export class ProfessorService {
  constructor(
    @Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>,
    private readonly storageService: StorageService,
    private readonly studentService: StudentService,
  ) { }
  async getModulesByProfessor(professorId: number) {
    // Select all modules where:
    // 1. A multi-professor assignment exists and it matches this professor
    // 2. OR: No multi-professor assignments exist for the module AND this professor is the record's main professorId
    const assignedModules = await this.db
      .select()
      .from(schema.modulos)
      .where(
        or(
          // Case 1: Assigned via the newer join table
          sql`EXISTS (SELECT 1 FROM ${schema.moduloProfesores} mp WHERE mp.modulo_id = ${schema.modulos.id} AND mp.profesor_id = ${professorId})`,
          // Case 2: Legacy fallback (only if join table is completely empty for this module)
          and(
            eq(schema.modulos.profesorId, professorId),
            sql`NOT EXISTS (SELECT 1 FROM ${schema.moduloProfesores} mp WHERE mp.modulo_id = ${schema.modulos.id})`
          ),
          // Case 3: Assigned to specific students in this module 
          // (Usually restricted by multi-professor list, but kept for student-specific oversight)
          sql`EXISTS (SELECT 1 FROM ${schema.asignaciones} a WHERE a.modulo_id = ${schema.modulos.id} AND a.profesor_id = ${professorId})`
        )
      );

    const modulesWithDetails = await Promise.all(
      assignedModules.map(async (mod) => {

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
          studentsCount: studentAssignments.length,
          students: studentAssignments.map((s) => s.user),
          levels: await this.db
            .select()
            .from(schema.niveles)
            .where(eq(schema.niveles.moduloId, mod.id))
            .orderBy(asc(schema.niveles.orden)),
        };
      }),
    );

    return modulesWithDetails;
  }

  async assignStudentToModule(studentId: number, moduleId: number) {
    // Check if already assigned
    const existing = await this.db
      .select()
      .from(schema.asignaciones)
      .where(
        and(
          eq(schema.asignaciones.estudianteId, studentId),
          eq(schema.asignaciones.moduloId, moduleId)
        )
      );

    if (existing.length > 0) return existing[0];

    const [assignment] = await this.db
      .insert(schema.asignaciones)
      .values({
        estudianteId: studentId,
        moduloId: moduleId,
      })
      .returning();

    return assignment;
  }

  async unassignStudentFromModule(studentId: number, moduleId: number) {
    await this.db
      .delete(schema.asignaciones)
      .where(
        and(
          eq(schema.asignaciones.estudianteId, studentId),
          eq(schema.asignaciones.moduloId, moduleId)
        )
      );
    return { success: true };
  }

  async createStudentAndAssign(data: {
    name: string;
    email: string;
    password: string;
    moduleId: number;
  }) {
    // 1. Create User
    // Check if email exists
    const existing = await this.db
      .select()
      .from(schema.usuarios)
      .where(eq(schema.usuarios.email, data.email));
    if (existing.length > 0) {
      throw new ConflictException('El email ya está registrado');
    }

    const [newUser] = await this.db
      .insert(schema.usuarios)
      .values({
        nombre: data.name,
        email: data.email,
        password: data.password, // Plain text as per current simplified implementation
        roleId: 3, // Student
        planId: 1, // Basic
        activo: true,
      })
      .returning();

    // 2. Assign to Module
    await this.db.insert(schema.asignaciones).values({
      estudianteId: newUser.id,
      moduloId: data.moduleId,
    });

    return newUser;
  }

  // Level Management
  async createLevel(
    moduleId: number,
    data: { tituloNivel: string; orden: number; descripcion?: string },
  ) {
    const [newLevel] = await this.db
      .insert(schema.niveles)
      .values({
        moduloId: moduleId,
        tituloNivel: data.tituloNivel,
        orden: data.orden,
        descripcion: data.descripcion,
      })
      .returning();
    return newLevel;
  }

  async getLevelsByModule(moduleId: number) {
    const levels: schema.Nivel[] = await this.db
      .select()
      .from(schema.niveles)
      .where(eq(schema.niveles.moduloId, moduleId))
      .orderBy(asc(schema.niveles.orden));

    // For each level, get its contents and kids templates
    const levelsWithContents = await Promise.all(
      levels.map(async (lvl: any) => {
        const [contents, kidsTemplates] = await Promise.all([
          this.db
            .select()
            .from(schema.contenidos)
            .where(eq(schema.contenidos.nivelId, lvl.id)),
          this.db
            .select()
            .from(schema.plantillasKids)
            .where(eq(schema.plantillasKids.nivelId, lvl.id))
        ]);

        return {
          ...lvl,
          contents,
          kidsTemplates,
        };
      }),
    );

    return levelsWithContents;
  }

  async reorderLevels(moduleId: number, orderedLevelIds: number[]) {
    // orderedLevelIds is an array of level IDs in the new, correct order
    for (let i = 0; i < orderedLevelIds.length; i++) {
      await this.db
        .update(schema.niveles)
        .set({ orden: i + 1 })
        .where(
          and(
            eq(schema.niveles.id, orderedLevelIds[i]),
            eq(schema.niveles.moduloId, moduleId)
          )
        );
    }
    return { success: true };
  }

  // Content Management
  async createContent(
    levelId: number,
    data: { tipo: string; urlRecurso: string; orden?: number },
  ) {
    const [newContent] = await this.db
      .insert(schema.contenidos)
      .values({
        nivelId: levelId,
        tipo: data.tipo,
        urlRecurso: data.urlRecurso,
        orden: data.orden || 1,
      })
      .returning();
    return newContent;
  }

  async updateContent(contentId: number, data: any) {
    const { id, nivelId, ...payload } = data;
    const [updated] = await this.db
      .update(schema.contenidos)
      .set(payload)
      .where(eq(schema.contenidos.id, contentId))
      .returning();
    return updated;
  }

  async reorderContents(levelId: number, orderedContentIds: number[]) {
    for (let i = 0; i < orderedContentIds.length; i++) {
      await this.db
        .update(schema.contenidos)
        .set({ orden: i + 1 })
        .where(
          and(
            eq(schema.contenidos.id, orderedContentIds[i]),
            eq(schema.contenidos.nivelId, levelId)
          )
        );
    }
    return { success: true };
  }

  async getContentsByLevel(levelId: number) {
    return await this.db
      .select()
      .from(schema.contenidos)
      .where(eq(schema.contenidos.nivelId, levelId))
      .orderBy(asc(schema.contenidos.orden), asc(schema.contenidos.id));
  }

  async deleteContent(contentId: number) {
    await this.db
      .delete(schema.contenidos)
      .where(eq(schema.contenidos.id, contentId));
    return { success: true };
  }

  async getLevelContents(levelId: number) {
    const contents = await this.db
      .select()
      .from(schema.contenidos)
      .where(eq(schema.contenidos.nivelId, levelId));
    return contents;
  }

  // Resource Library
  async createResource(data: {
    profesorId: number;
    nombre: string;
    tipo: string;
    url: string;
    peso: number;
    carpeta?: string;
  }) {
    const [resource] = await this.db
      .insert(schema.recursos)
      .values({
        profesorId: data.profesorId,
        nombre: data.nombre,
        tipo: data.tipo,
        url: data.url,
        peso: data.peso,
        carpeta: data.carpeta,
      })
      .returning();
    return resource;
  }

  async getResources(profesorId: number) {
    return await this.db
      .select()
      .from(schema.recursos)
      //.where(eq(schema.recursos.profesorId, profesorId)) // Descomentar cuando tengamos auth real
      .orderBy(asc(schema.recursos.fechaSubida));
  }

  async deleteResource(id: number) {
    const [resource] = await this.db
      .select()
      .from(schema.recursos)
      .where(eq(schema.recursos.id, id));

    if (!resource) return { success: false, message: 'Recurso no encontrado' };

    // Delete physical file
    try {
      await this.storageService.deleteFile(resource.url);
    } catch (error) {
      console.error(`Error deleting file for resource ${id}:`, error);
      // Continue with DB deletion even if file deletion fails (e.g. file already gone)
    }

    // Delete from DB
    await this.db
      .delete(schema.recursos)
      .where(eq(schema.recursos.id, id));

    return { success: true };
  }

  async deleteFolder(path: string) {
    console.log(`[DELETE FOLDER] Path: ${path}`);
    // Find all resources in this folder or subfolders
    const items = await this.db
      .select()
      .from(schema.recursos)
      .where(
        or(
          eq(schema.recursos.carpeta, path),
          like(schema.recursos.carpeta, `${path}/%`)
        )
      );

    console.log(`[DELETE FOLDER] Found ${items.length} items to delete`);

    for (const item of items) {
      console.log(`[DELETE FOLDER] Deleting resource ${item.id} (${item.nombre})`);
      await this.deleteResource(item.id);
    }

    return { success: true, count: items.length };
  }

  async getHaTemplate(levelId: number) {
    return await this.db
      .select()
      .from(schema.plantillasHa)
      .where(eq(schema.plantillasHa.nivelId, levelId))
      .execute()
      .then((res) => res[0]);
  }

  async createHaTemplate(levelId: number, data: any) {
    console.log('Saving HA for level:', levelId);
    try {
      // Remove 'id' if present to avoid PK violation
      const { id, ...payload } = data;
      payload.fechaCreacion = null;

      const existing = await this.getHaTemplate(levelId);
      if (existing) {
        const [updated] = await this.db
          .update(schema.plantillasHa)
          .set({ ...payload })
          .where(eq(schema.plantillasHa.id, existing.id)) // Use existing ID for update
          .returning();
        return updated;
      } else {
        const [inserted] = await this.db
          .insert(schema.plantillasHa)
          .values({ ...payload, nivelId: levelId })
          .returning();
        return inserted;
      }
    } catch (error) {
      console.log('Error in createHaTemplate:', error);
      throw new BadRequestException('Error en la creación de la plantilla HA');
    }
  }



  async deleteLevel(levelId: number) {
    // Cascade delete RAG
    await this.db
      .delete(schema.plantillasRag)
      .where(eq(schema.plantillasRag.nivelId, levelId));
    // Cascade delete HA
    await this.db
      .delete(schema.plantillasHa)
      .where(eq(schema.plantillasHa.nivelId, levelId));



    // Cascade delete student progress for this level
    await this.db
      .delete(schema.progresoNiveles)
      .where(eq(schema.progresoNiveles.nivelId, levelId));

    // Cascade delete contents
    await this.db
      .delete(schema.contenidos)
      .where(eq(schema.contenidos.nivelId, levelId));

    // Cascade delete activities
    await this.db
      .delete(schema.actividades)
      .where(eq(schema.actividades.nivelId, levelId));

    // Delete level
    await this.db.delete(schema.niveles).where(eq(schema.niveles.id, levelId));
    return { success: true };
  }

  async updateLevel(levelId: number, data: any) {
    console.log(`[UPDATE LEVEL] ID: ${levelId}, Data:`, data);
    const { id, moduloId, ...payload } = data;
    try {
      const [updated] = await this.db
        .update(schema.niveles)
        .set(payload)
        .where(eq(schema.niveles.id, levelId))
        .returning();
      console.log(`[UPDATE LEVEL] Success:`, updated);
      return updated;
    } catch (error) {
      console.error(`[UPDATE LEVEL] Error:`, error);
      throw error;
    }
  }

  // RAG Templates
  async createRagTemplate(nivelId: number, data: any) {
    try {
      // Remove 'id' if present and reset timestamps to avoid issues
      const { id, fechaCreacion, ...payload } = data;

      // Check if exists update, otherwise insert
      const existing = await this.db
        .select()
        .from(schema.plantillasRag)
        .where(eq(schema.plantillasRag.nivelId, nivelId));

      let result;
      if (existing.length > 0) {
        // Update
        [result] = await this.db
          .update(schema.plantillasRag)
          .set(payload)
          .where(eq(schema.plantillasRag.id, existing[0].id))
          .returning();
      } else {
        // Insert
        [result] = await this.db
          .insert(schema.plantillasRag)
          .values({
            ...payload,
            nivelId,
          })
          .returning();
      }
      return result;
    } catch (error) {
      console.error('Error in createRagTemplate:', error);
      throw new BadRequestException('Error en la creación de la plantilla RAG');
    }
  }

  async getRagTemplate(nivelId: number) {
    const templates = await this.db
      .select()
      .from(schema.plantillasRag)
      .where(eq(schema.plantillasRag.nivelId, nivelId));
    return templates[0] || null;
  }

  // Grading
  async getSubmissions(professorId: number) {
    // RAG Submissions
    const ragSubmissions = await this.db.select({
      id: schema.entregasRag.id,
      studentName: schema.usuarios.nombre,
      studentAvatar: schema.usuarios.avatar,
      activityTitle: schema.plantillasRag.hitoAprendizaje,
      stepIndex: schema.entregasRag.pasoIndice,
      fileUrl: schema.entregasRag.archivoUrl,
      fileType: schema.entregasRag.tipoArchivo,
      submittedAt: schema.entregasRag.fechaSubida,
      type: sql<string>`'rag'`,
      grade: schema.entregasRag.calificacionNumerica,
      feedback: schema.entregasRag.feedbackProfe,
      levelId: schema.niveles.id,
      levelTitle: schema.niveles.tituloNivel,
      moduleId: schema.modulos.id,
      moduleTitle: schema.modulos.nombreModulo
    })
      .from(schema.entregasRag)
      .innerJoin(schema.usuarios, eq(schema.entregasRag.estudianteId, schema.usuarios.id))
      .innerJoin(schema.plantillasRag, eq(schema.entregasRag.plantillaRagId, schema.plantillasRag.id))
      .innerJoin(schema.niveles, eq(schema.plantillasRag.nivelId, schema.niveles.id))
      .innerJoin(schema.modulos, eq(schema.niveles.moduloId, schema.modulos.id));

    // HA Submissions
    const haSubmissions = await this.db.select({
      id: schema.entregasHa.id,
      studentName: schema.usuarios.nombre,
      studentAvatar: schema.usuarios.avatar,
      activityTitle: schema.plantillasHa.objetivoSemana,
      submittedAt: schema.entregasHa.fechaSubida,
      files: schema.entregasHa.archivosUrls,
      comment: schema.entregasHa.comentarioEstudiante,
      validated: schema.entregasHa.validado,
      type: sql<string>`'ha'`,
      grade: schema.entregasHa.calificacionNumerica,
      feedback: schema.entregasHa.feedbackProfe,
      levelId: schema.niveles.id,
      levelTitle: schema.niveles.tituloNivel,
      moduleId: schema.modulos.id,
      moduleTitle: schema.modulos.nombreModulo
    })
      .from(schema.entregasHa)
      .innerJoin(schema.usuarios, eq(schema.entregasHa.estudianteId, schema.usuarios.id))
      .innerJoin(schema.plantillasHa, eq(schema.entregasHa.plantillaHaId, schema.plantillasHa.id))
      .innerJoin(schema.niveles, eq(schema.plantillasHa.nivelId, schema.niveles.id))
      .innerJoin(schema.modulos, eq(schema.niveles.moduloId, schema.modulos.id));

    return {
      rag: ragSubmissions,
      ha: haSubmissions
    };
  }

  async gradeSubmission(id: number, type: 'rag' | 'ha', grade: number, feedback: string) {
    let targetTable: any;

    switch (type) {
      case 'ha':
        targetTable = schema.entregasHa;
        break;
      case 'rag':
        targetTable = schema.entregasRag;
        break;

      default:
        throw new Error(`Unknown submission type: ${type}`);
    }

    await this.db.update(targetTable)
      .set({
        calificacionNumerica: grade,
        feedbackProfe: feedback,
        ...(type === 'ha' ? { validado: grade >= 70 } : {})
      })
      .where(eq(targetTable.id, id));

    return { success: true };
  }

  // Attendance Management
  async getAttendance(nivelId: number) {
    // 1. Get the module ID and cursoId for this level
    const [levelMod] = await this.db
      .select({
        moduloId: schema.niveles.moduloId,
        cursoId: schema.modulos.cursoId
      })
      .from(schema.niveles)
      .innerJoin(schema.modulos, eq(schema.niveles.moduloId, schema.modulos.id))
      .where(eq(schema.niveles.id, nivelId));

    if (!levelMod) throw new BadRequestException('Nivel no encontrado');

    // 2. Get all students assigned to this module (Direct + Course)
    const studentsDirect = await this.db
      .select({
        id: schema.usuarios.id,
        nombre: schema.usuarios.nombre,
        email: schema.usuarios.email,
        avatar: schema.usuarios.avatar,
      })
      .from(schema.asignaciones)
      .innerJoin(schema.usuarios, eq(schema.asignaciones.estudianteId, schema.usuarios.id))
      .where(eq(schema.asignaciones.moduloId, levelMod.moduloId!));

    let studentsCourse: any[] = [];
    if (levelMod.cursoId) {
      studentsCourse = await this.db
        .select({
          id: schema.usuarios.id,
          nombre: schema.usuarios.nombre,
          email: schema.usuarios.email,
          avatar: schema.usuarios.avatar,
        })
        .from(schema.usuarios)
        .where(and(
          eq(schema.usuarios.cursoId, levelMod.cursoId),
          eq(schema.usuarios.roleId, 3) // Role 3 = Student
        ));
    }

    // 3. Combine and Deduplicate
    const studentsMap = new Map<number, any>();
    studentsDirect.forEach(s => studentsMap.set(s.id, s));
    studentsCourse.forEach(s => studentsMap.set(s.id, s));
    const allStudents = Array.from(studentsMap.values());

    // 4. Get existing attendance for this level
    const existingAttendance = await this.db
      .select()
      .from(schema.asistencia)
      .where(eq(schema.asistencia.nivelId, nivelId));

    // 5. Merge
    return allStudents.map(student => {
      const record = existingAttendance.find(a => a.estudianteId === student.id);
      return {
        ...student,
        asistio: record ? record.asistio : false,
        attendanceId: record ? record.id : null
      };
    });
  }

  async saveAttendance(nivelId: number, professorId: number, records: { estudianteId: number; asistio: boolean }[]) {
    const results = [];

    for (const record of records) {
      // Check if exists
      const [existing] = await this.db
        .select()
        .from(schema.asistencia)
        .where(
          and(
            eq(schema.asistencia.nivelId, nivelId),
            eq(schema.asistencia.estudianteId, record.estudianteId)
          )
        );

      if (existing) {
        const [updated] = await this.db
          .update(schema.asistencia)
          .set({
            asistio: record.asistio,
            profesorId: professorId,
            fecha: new Date()
          })
          .where(eq(schema.asistencia.id, existing.id))
          .returning();
        results.push(updated);
      } else {
        const [inserted] = await this.db
          .insert(schema.asistencia)
          .values({
            estudianteId: record.estudianteId,
            nivelId,
            profesorId: professorId,
            asistio: record.asistio,
          })
          .returning();
        results.push(inserted);
      }
    }

    // Trigger level progress update for each student involved
    for (const record of records) {
      try {
        await this.studentService.updateLevelProgress(record.estudianteId, nivelId);
      } catch (err) {
        console.error(`Error updating progress for student ${record.estudianteId} at level ${nivelId}:`, err);
      }
    }

    return results;
  }

  // --- LATAM & COURSES MANAGEMENT ---

  async getLatamCompanies() {
    return this.db.select().from(schema.latamCompanias).orderBy(asc(schema.latamCompanias.nombre));
  }

  async getLatamStudents(professorId: number) {
    const students = await this.db
      .select({
        id: schema.usuarios.id,
        name: schema.usuarios.nombre,
        level: schema.roles.nombreRol,
        status: schema.usuarios.activo,
        avatar: schema.usuarios.avatar,
        project: schema.cursos.nombre,
        progress: sql<number>`COALESCE((
          SELECT AVG(pn.porcentaje_completado)
          FROM progreso_niveles pn
          INNER JOIN niveles n ON pn.nivel_id = n.id
          INNER JOIN modulos m ON n.modulo_id = m.id
          WHERE pn.estudiante_id = usuarios.id
          AND m.profesor_id = ${professorId}
        ), 0)`
      })
      .from(schema.usuarios)
      .innerJoin(schema.usuariosCursos, eq(schema.usuariosCursos.usuarioId, schema.usuarios.id))
      .innerJoin(schema.cursos, eq(schema.usuariosCursos.cursoId, schema.cursos.id))
      .leftJoin(schema.roles, eq(schema.usuarios.roleId, schema.roles.id))
      .where(eq(schema.cursos.profesorId, professorId));

    return students.map(s => ({
      id: s.id,
      name: s.name,
      level: s.level || 'Estudiante',
      status: s.status ? 'active' : 'on_hold',
      project: s.project,
      progress: Math.round(Number(s.progress)) || 0,
      avatar: s.avatar?.startsWith('http') ? s.avatar : `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.name}`
    }));
  }

  async getCoursesByProfessor(professorId: number) {
    const results = await this.db
      .select({
        id: schema.cursos.id,
        nombre: schema.cursos.nombre,
        institucionId: schema.cursos.institucionId,
        profesorId: schema.cursos.profesorId,
        companiaId: schema.cursos.companiaId,
        fechaCreacion: schema.cursos.fechaCreacion,
        compania: schema.latamCompanias,
        studentCount: sql<number>`(
          SELECT count(*)::int 
          FROM ${schema.usuarios} u 
          WHERE u.curso_id = ${schema.cursos.id} 
          AND (u.role_id = 3 OR u.role_id = 6)
        )`
      })
      .from(schema.cursos)
      .leftJoin(schema.latamCompanias, eq(schema.cursos.companiaId, schema.latamCompanias.id))
      .where(
        or(
          // Case 1: Direct owner of the course
          eq(schema.cursos.profesorId, professorId),
          // Case 2: Assigned via any module in this course
          sql`EXISTS (
            SELECT 1 FROM ${schema.modulos} m 
            WHERE m.curso_id = ${schema.cursos.id} 
            AND (
              m.profesor_id = ${professorId}
              OR EXISTS (SELECT 1 FROM ${schema.moduloProfesores} mp WHERE mp.modulo_id = m.id AND mp.profesor_id = ${professorId})
              OR EXISTS (SELECT 1 FROM ${schema.asignaciones} a WHERE a.modulo_id = m.id AND a.profesor_id = ${professorId})
            )
          )`,
          // Case 3: Assigned via institutional curriculum (modulos_inst)
          sql`EXISTS (
            SELECT 1 FROM ${schema.modulosInst} mi 
            WHERE mi.curso_id = ${schema.cursos.id} 
            AND mi.profesor_id = ${professorId}
          )`,
          // Case 4: Linked via usuarios_cursos join table (Institutional Professor direct assignment)
          sql`EXISTS (
            SELECT 1 FROM ${schema.usuariosCursos} uc
            WHERE uc.curso_id = ${schema.cursos.id}
            AND uc.usuario_id = ${professorId}
          )`
        )
      )
      .orderBy(asc(schema.cursos.id)); // Order by ID for consistency
    return results;
  }

  async createCourse(professorId: number, data: { nombre: string; companiaId?: number; institucionId?: number }) {
    const [course] = await this.db
      .insert(schema.cursos)
      .values({
        ...data,
        profesorId: professorId,
      })
      .returning();
    return course;
  }

  async updateCourse(courseId: number, data: Partial<{ nombre: string; companiaId: number; institucionId: number }>) {
    const [course] = await this.db
      .update(schema.cursos)
      .set(data)
      .where(eq(schema.cursos.id, courseId))
      .returning();
    return course;
  }

  async deleteCourse(courseId: number) {
    return this.db.delete(schema.cursos).where(eq(schema.cursos.id, courseId)).returning();
  }
}
