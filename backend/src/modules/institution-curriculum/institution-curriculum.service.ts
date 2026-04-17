import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DRIZZLE_DB } from '../../database/drizzle.provider';
import * as schema from '../../shared/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, asc, desc } from 'drizzle-orm';
// import { AiService } from '../ai/ai.service'; // Removed external AI dependency

@Injectable()
export class InstitutionalCurriculumService {
  constructor(
    @Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>,
    // private aiService: AiService, // No longer needed
  ) { }

  async getCourseById(id: number) {
    const course = await this.db.select().from(schema.cursos).where(eq(schema.cursos.id, id)).limit(1);
    if (course.length === 0) throw new NotFoundException(`Curso ID ${id} no encontrado`);
    return course[0];
  }

  // --- SECCIONES ---
  async createSection(data: schema.InsertSeccionInst) {
    console.log('[INSTITUTIONAL_CURRICULUM] Creating Section. Received Data:', data);
    if (!data.cursoId) throw new BadRequestException('ID de curso no proporcionado');

    const course = await this.db.select().from(schema.cursos).where(eq(schema.cursos.id, data.cursoId)).limit(1);
    console.log('[INSTITUTIONAL_CURRICULUM] Course matching ID:', data.cursoId, 'Found:', course.length);

    if (course.length === 0) {
      // Log all IDs to see what's actually there
      const allCursos = await this.db.select({ id: schema.cursos.id }).from(schema.cursos).limit(5);
      console.log('[INSTITUTIONAL_CURRICULUM] First 5 Course IDs in system:', allCursos.map(c => c.id));
      throw new BadRequestException(`El curso ID ${data.cursoId} no existe. No se puede crear fase.`);
    }

    const [section] = await this.db.insert(schema.seccionesInst).values(data).returning();
    return section;
  }

  async getSectionsByCourse(courseId: number) {
    return this.db
      .select()
      .from(schema.seccionesInst)
      .where(eq(schema.seccionesInst.cursoId, courseId))
      .orderBy(asc(schema.seccionesInst.orden));
  }

  async updateSection(id: number, data: Partial<schema.InsertSeccionInst>) {
    const [updated] = await this.db
      .update(schema.seccionesInst)
      .set(data)
      .where(eq(schema.seccionesInst.id, id))
      .returning();
    return updated;
  }

  async deleteSection(id: number) {
    // Note: In a real app we might want to check if there are modules first
    await this.db.delete(schema.modulosInst).where(eq(schema.modulosInst.seccionId, id));
    const [deleted] = await this.db.delete(schema.seccionesInst).where(eq(schema.seccionesInst.id, id)).returning();
    return deleted;
  }

  // --- MÓDULOS ---
  async createModule(data: schema.InsertModuloInst) {
    if (!data.cursoId) throw new BadRequestException('ID de curso no proporcionado');

    const course = await this.db.select().from(schema.cursos).where(eq(schema.cursos.id, data.cursoId)).limit(1);
    if (course.length === 0) {
      throw new BadRequestException(`El curso ID ${data.cursoId} no existe. No se puede crear módulo.`);
    }

    const [module] = await this.db.insert(schema.modulosInst).values(data).returning();
    return module;
  }

  async getModulesBySection(seccionId: number) {
    return this.db
      .select()
      .from(schema.modulosInst)
      .where(eq(schema.modulosInst.seccionId, seccionId))
      .orderBy(asc(schema.modulosInst.orden));
  }

  async getModulesByCourse(courseId: number) {
    return this.db
      .select()
      .from(schema.modulosInst)
      .where(eq(schema.modulosInst.cursoId, courseId))
      .orderBy(asc(schema.modulosInst.orden));
  }

  async updateModule(id: number, data: Partial<schema.InsertModuloInst>) {
    const [updated] = await this.db
      .update(schema.modulosInst)
      .set(data)
      .where(eq(schema.modulosInst.id, id))
      .returning();
    return updated;
  }

  async deleteModule(id: number) {
    await this.db.delete(schema.progresoModuloInst).where(eq(schema.progresoModuloInst.moduloInstId, id));
    const [deleted] = await this.db.delete(schema.modulosInst).where(eq(schema.modulosInst.id, id)).returning();
    return deleted;
  }

  // --- PROGRESO DE LOS ESTUDIANTES INISTITUCIÓN---
  async updateProgress(estudianteId: number, moduloInstId: number, data: Partial<schema.InsertProgresoModuloInst>) {
    const existing = await this.db
      .select()
      .from(schema.progresoModuloInst)
      .where(
        and(
          eq(schema.progresoModuloInst.estudianteId, estudianteId),
          eq(schema.progresoModuloInst.moduloInstId, moduloInstId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      const [updated] = await this.db
        .update(schema.progresoModuloInst)
        .set({
          ...data,
          intentos: (existing[0].intentos || 0) + 1,
          fechaCompletado: data.completado ? new Date() : existing[0].fechaCompletado,
        })
        .where(eq(schema.progresoModuloInst.id, existing[0].id))
        .returning();
      return updated;
    } else {
      const [inserted] = await this.db
        .insert(schema.progresoModuloInst)
        .values({
          estudianteId,
          moduloInstId,
          ...data,
          intentos: 1,
          fechaCompletado: data.completado ? new Date() : undefined,
        } as any)
        .returning();
      return inserted;
    }
  }

  async getStudentProgressInCourse(estudianteId: number, courseId: number) {
    // Get all modules in the course and join with progress if exists
    const courseModules = await this.db
      .select({
        module: schema.modulosInst,
        progress: schema.progresoModuloInst,
      })
      .from(schema.modulosInst)
      .leftJoin(
        schema.progresoModuloInst,
        and(
          eq(schema.progresoModuloInst.moduloInstId, schema.modulosInst.id),
          eq(schema.progresoModuloInst.estudianteId, estudianteId)
        )
      )
      .where(eq(schema.modulosInst.cursoId, courseId))
      .orderBy(asc(schema.modulosInst.orden));

    return courseModules;
  }

  async reorderSections(orderedIds: number[]) {
    await Promise.all(
      orderedIds.map((id, index) =>
        this.db.update(schema.seccionesInst).set({ orden: index }).where(eq(schema.seccionesInst.id, id))
      )
    );
    return { success: true };
  }

  async reorderModules(orderedIds: number[]) {
    await Promise.all(
      orderedIds.map((id, index) =>
        this.db.update(schema.modulosInst).set({ orden: index }).where(eq(schema.modulosInst.id, id))
      )
    );
    return { success: true };
  }

  // --- LOCAL CURRICULUM PARSER ---
  private parseCurriculumFromText(text: string): Array<{ courseName: string; modules: string[] }> {
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    const courses: Array<{ courseName: string; modules: string[] }> = [];
    let currentCourse: { courseName: string; modules: string[] } | null = null;

    const moduleRegex = /Módulo\s*\d+\.?\s*[-:]?\s*(.+)/i;
    const courseRegex = /^(?:[Nn]ivel\s*\d+|.*[Ee][Gg][Bb]|.*[Bb][Gg][Uu]|Curso|Program[ae]).*$/;

    for (const line of lines) {
      const moduleMatch = line.match(moduleRegex);
      if (moduleMatch && moduleMatch[1]) {
        if (!currentCourse) {
          currentCourse = { courseName: 'Curso General', modules: [] };
          courses.push(currentCourse);
        }
        currentCourse.modules.push(moduleMatch[1].trim());
      } else if (courseRegex.test(line)) {
        // If it starts with "Nivel", we can prepend it to the next course name or start a new course
        if (line.toLowerCase().startsWith('nivel')) {
          // We'll keep it as a potential prefix or start a course if none exists
          currentCourse = { courseName: line, modules: [] };
          courses.push(currentCourse);
        } else {
          // If we have a Level but no modules yet, maybe merge the titles
          if (currentCourse && currentCourse.modules.length === 0 && currentCourse.courseName.toLowerCase().startsWith('nivel')) {
            currentCourse.courseName = `${currentCourse.courseName} - ${line}`;
          } else {
            currentCourse = { courseName: line, modules: [] };
            courses.push(currentCourse);
          }
        }
      } else if (line.length > 5) {
        // Fallback for lines that look like titles but don't match the regex
        if (!currentCourse || currentCourse.modules.length > 0) {
          currentCourse = { courseName: line, modules: [] };
          courses.push(currentCourse);
        } else if (currentCourse && currentCourse.modules.length === 0) {
          currentCourse.courseName = `${currentCourse.courseName} ${line}`;
        }
      }
    }

    // Clean up empty courses
    return courses.filter(c => c.modules.length > 0);
  }

  // --- TEXT-BASED STRUCTURE BUILDER ---
  async generateStructureFromText(institucionId: number, text: string) {
    const parsedCourses = this.parseCurriculumFromText(text);
    if (parsedCourses.length === 0) {
      throw new Error('No se pudieron extraer cursos ni módulos del texto proporcionado.');
    }

    const createdData = [];

    for (const { courseName, modules } of parsedCourses) {
      // 1. Create the Course
      const [course] = await this.db.insert(schema.cursos).values({
        nombre: courseName || 'Nuevo Curso Institucional',
        institucionId: institucionId,
      }).returning();

      // 2. Create Sections and default lessons
      const sections = [];
      for (let i = 0; i < modules.length; i++) {
        const [section] = await this.db.insert(schema.seccionesInst).values({
          cursoId: course.id,
          nombre: modules[i],
          orden: i,
        }).returning();

        await this.db.insert(schema.modulosInst).values({
          seccionId: section.id,
          cursoId: course.id,
          titulo: 'Introducción y Actividades',
          tipo: 'lesson',
          orden: 0,
        });
        sections.push(section);
      }
      createdData.push({ course, sections });
    }

    return createdData.length === 1 ? createdData[0] : { multipleResult: createdData };
  }
}
