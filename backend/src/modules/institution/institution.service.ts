import { Inject, Injectable } from '@nestjs/common';
import { DRIZZLE_DB } from '../../database/drizzle.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../shared/schema';
import { eq, and, inArray } from 'drizzle-orm';

@Injectable()
export class InstitutionService {
    constructor(
        @Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>,
    ) { }

    async getAllInstitutions() {
        return this.db.select().from(schema.instituciones);
    }

    async createInstitution(data: any) {
        const [inst] = await this.db.insert(schema.instituciones).values(data).returning();
        return inst;
    }

    async getCoursesByInstitution(institutionId: number) {
        return this.db.select().from(schema.cursos).where(eq(schema.cursos.institucionId, institutionId));
    }

    async createCourse(data: any) {
        const [curso] = await this.db.insert(schema.cursos).values(data).returning();
        return curso;
    }

    async getModulesByCourse(courseId: number) {
        return this.db.select().from(schema.modulos).where(eq(schema.modulos.cursoId, courseId));
    }

    async getInstitutionalUsers(institutionId: number) {
        return this.db.select().from(schema.usuarios).where(eq(schema.usuarios.institucionId, institutionId));
    }

    async createModule(data: any) {
        const [mod] = await this.db.insert(schema.modulos).values({
            nombreModulo: data.nombreModulo,
            duracionDias: data.duracionDias || 30,
            cursoId: data.cursoId,
            profesorId: data.profesorId,
            categoria: 'institutional',
        }).returning();
        return mod;
    }

    async deleteModule(moduleId: number) {
        const [mod] = await this.db.delete(schema.modulos).where(eq(schema.modulos.id, moduleId)).returning();
        return mod;
    }

    async deleteCourse(courseId: number) {
        const [course] = await this.db.delete(schema.cursos).where(eq(schema.cursos.id, courseId)).returning();
        return course;
    }

    async assignModuleToCourse(moduleId: number, courseId: number) {
        const [mod] = await this.db.update(schema.modulos)
            .set({ cursoId: courseId })
            .where(eq(schema.modulos.id, moduleId))
            .returning();
        return mod;
    }

    async createUser(data: any) {
        const [user] = await this.db.insert(schema.usuarios).values({
            ...data,
            activo: true,
            onboardingCompleted: true,
        }).returning();
        return user;
    }

    async updateUser(userId: number, data: any) {
        const [user] = await this.db.update(schema.usuarios)
            .set(data)
            .where(eq(schema.usuarios.id, userId))
            .returning();
        return user;
    }

    async updateModule(moduleId: number, data: any) {
        const [mod] = await this.db.update(schema.modulos)
            .set(data)
            .where(eq(schema.modulos.id, moduleId))
            .returning();
        return mod;
    }

    async getUserCourses(userId: number) {
        return this.db
            .select({ cursoId: schema.usuariosCursos.cursoId })
            .from(schema.usuariosCursos)
            .where(eq(schema.usuariosCursos.usuarioId, userId));
    }

    async syncUserCourses(userId: number, courseIds: number[]) {
        // Delete all current assignments for the user
        await this.db
            .delete(schema.usuariosCursos)
            .where(eq(schema.usuariosCursos.usuarioId, userId));

        // Insert new assignments
        if (courseIds.length > 0) {
            await this.db.insert(schema.usuariosCursos).values(
                courseIds.map((cursoId) => ({ usuarioId: userId, cursoId }))
            );
        }
        return { userId, courseIds };
    }

    async toggleUserStatus(userId: number, activo: boolean) {
        const [user] = await this.db.update(schema.usuarios)
            .set({ activo })
            .where(eq(schema.usuarios.id, userId))
            .returning();
        return user;
    }

    async getGradeReport(courseId: number) {
        const courseUsers = await this.db
            .select({
                id: schema.usuarios.id,
                nombre: schema.usuarios.nombre,
                email: schema.usuarios.email,
            })
            .from(schema.usuarios)
            .innerJoin(
                schema.usuariosCursos, 
                eq(schema.usuarios.id, schema.usuariosCursos.usuarioId)
            )
            .where(eq(schema.usuariosCursos.cursoId, courseId));

        const reports = await Promise.all(courseUsers.map(async (user) => {
            const userSubmissions = await this.db
                .select({
                    calificacion: schema.entregas.calificacionNumerica,
                })
                .from(schema.entregas)
                .where(eq(schema.entregas.estudianteId, user.id));
            
            const avg = userSubmissions.length > 0 
                ? userSubmissions.reduce((acc, curr) => acc + (curr.calificacion || 0), 0) / userSubmissions.length 
                : 0;
            
            return {
                ...user,
                promedio: avg.toFixed(2),
                entregas: userSubmissions.length
            };
        }));

        return reports;
    }
}
