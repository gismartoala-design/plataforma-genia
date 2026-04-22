import { Inject, Injectable } from '@nestjs/common';
import { DRIZZLE_DB } from '../../database/drizzle.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../shared/schema';
import { eq, ilike, or, and, inArray, sql } from 'drizzle-orm';

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
        const result = await this.db
            .select({
                id: schema.usuarios.id,
                nombre: schema.usuarios.nombre,
                email: schema.usuarios.email,
                promedio: sql<number>`avg(${schema.entregas.calificacionNumerica})`.mapWith(Number),
                entregas: sql<number>`count(${schema.entregas.id})`.mapWith(Number),
            })
            .from(schema.usuarios)
            .innerJoin(
                schema.usuariosCursos,
                eq(schema.usuarios.id, schema.usuariosCursos.usuarioId)
            )
            .leftJoin( // leftJoin in case a user has no submissions
                schema.entregas,
                eq(schema.usuarios.id, schema.entregas.estudianteId)
            )
            .where(eq(schema.usuariosCursos.cursoId, courseId))
            .groupBy(schema.usuarios.id, schema.usuarios.nombre, schema.usuarios.email)
            .orderBy(schema.usuarios.nombre); // Optional: order by name
    
        return result.map(r => ({
            ...r,
            promedio: r.promedio ? r.promedio.toFixed(2) : '0.00',
            entregas: r.entregas || 0,
        }));
    }

    async registerStudentFromParent(token: string | undefined, studentData: any) {
        // 1. If token provided, validate and get info
        let preSetInfo: any = {};
        if (token) {
            const inv = await this.getInvitation(token);
            if (!inv) throw new Error('Invitación inválida o ya utilizada');
            preSetInfo = {
                institucionId: inv.institucionId,
                cursoId: inv.cursoId
            };
        }

        // 2. Generate Credentials
        const password = studentData.roleId === 10 ? 
            Math.floor(1000 + Math.random() * 9000).toString() : // 4 digits for Kids
            Math.random().toString(36).substring(2, 8); // alphanumeric for others

        // 3. Create User
        const [user] = await this.db.insert(schema.usuarios).values({
            nombre: studentData.nombre,
            email: studentData.email || `${studentData.nombre.toLowerCase().replace(/ /g, '')}@genia.edu`,
            password,
            roleId: studentData.roleId || 10,
            institucionId: studentData.institucionId || preSetInfo.institucionId,
            cursoId: studentData.cursoId || preSetInfo.cursoId,
            nombrePadre: studentData.nombrePadre,
            emailPadre: studentData.emailPadre,
            celularPadre: studentData.celularPadre,
            trabajoPadre: studentData.trabajoPadre,
            activo: true
        }).returning();

        // 4. Mark invitation as used if applicable
        if (token) {
            await this.markInvitationUsed(token);
        }

        return {
            user,
            rawPassword: password
        };
    }

    async createMassiveUsers(data: { students: any[], institucionId: number, cursoId: number }) {
        const results = [];
        for (const student of data.students) {
            const password = student.roleId === 6 
                ? `${Math.floor(Math.random() * 9) + 1}-${Math.floor(Math.random() * 9) + 1}-${Math.floor(Math.random() * 9) + 1}-${Math.floor(Math.random() * 9) + 1}`
                : Math.random().toString(36).substring(2, 8).toUpperCase();

            const [user] = await this.db.insert(schema.usuarios).values({
                nombre: student.nombre,
                email: student.email || `${student.nombre.toLowerCase().replace(/\s+/g, '.')}@edu.com`,
                password: password,
                roleId: student.roleId || 10,
                institucionId: data.institucionId,
                cursoId: data.cursoId,
                activo: true,
                onboardingCompleted: true,
            }).returning();
            
            results.push({ ...user, password });
        }
        return results;
    }

    async generateInvitations(data: { quantity: number, institucionId: number, cursoId?: number | null }) {
        const results = [];
        for (let i = 0; i < data.quantity; i++) {
            const token = Math.random().toString(36).substring(2, 10).toUpperCase() + '-' + (i + 1);
            const [inv] = await this.db.insert(schema.invitaciones).values({
                token,
                institucionId: data.institucionId,
                cursoId: data.cursoId || null,
                usada: false,
            }).returning();
            results.push(inv);
        }
        return results;
    }

    async getInvitation(token: string) {
        const [inv] = await this.db.select().from(schema.invitaciones)
            .where(and(eq(schema.invitaciones.token, token), eq(schema.invitaciones.usada, false)))
            .limit(1);
        return inv;
    }

    async markInvitationUsed(token: string) {
        await this.db.update(schema.invitaciones)
            .set({ usada: true })
            .where(eq(schema.invitaciones.token, token));
    }

    async updateInstitutionLogo(id: number, logoUrl: string) {
        const [inst] = await this.db.update(schema.instituciones)
            .set({ logoUrl })
            .where(eq(schema.instituciones.id, id))
            .returning();
        return inst;
    }
}
