import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { usuarios, InsertUsuario, Usuario } from 'src/shared/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from 'src/shared/schema';
import { eq } from 'drizzle-orm';
import { DRIZZLE_DB } from 'src/database/drizzle.provider';

@Injectable()
export class UsersService {
  constructor(@Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>) {}

  async getUser(id: number): Promise<Usuario | undefined> {
    const [user] = await this.db
      .select()
      .from(usuarios)
      .where(eq(usuarios.id, id));
    return user;
  }

  async ensureUserIsActive(id: number): Promise<Usuario> {
    const user = await this.getUser(id);

    if (!user) {
      throw new UnauthorizedException({
        message: 'Usuario no encontrado.',
        code: 'USER_NOT_FOUND',
      });
    }

    if (user.activo === false) {
      throw new UnauthorizedException({
        message:
          'Esta plataforma ha sido suspendida por falta de pago. Por favor, comuníquese con el área de Contabilidad. Muchas gracias por su atención.',
        code: 'ACCOUNT_SUSPENDED',
      });
    }

    return user;
  }

  async getUserByEmail(email: string): Promise<Usuario | undefined> {
    const [user] = await this.db
      .select()
      .from(usuarios)
      .where(eq(usuarios.email, email));
    return user;
  }

  async createUser(user: InsertUsuario): Promise<Usuario> {
    const [newUser] = await this.db.insert(usuarios).values(user).returning();
    return newUser;
  }

  async getAllUsers(): Promise<any[]> {
    const users = await this.db.select().from(usuarios);

    // Fetch assignments for each user (inefficient for large datasets but works for now)
    // A better approach would be a single query with joins, but Drizzle join syntax varies.
    // Let's do a simple map solution for clarity in this iteration.

    const usersWithModules = await Promise.all(
      users.map(async (user) => {
        const userAssignments = await this.db
          .select({
            moduloId: schema.asignaciones.moduloId,
            nombreModulo: schema.modulos.nombreModulo,
          })
          .from(schema.asignaciones)
          .leftJoin(
            schema.modulos,
            eq(schema.asignaciones.moduloId, schema.modulos.id),
          )
          .where(
            user.roleId === 2
              ? eq(schema.asignaciones.profesorId, user.id)
              : eq(schema.asignaciones.estudianteId, user.id),
          );

        return {
          ...user,
          modules: userAssignments,
        };
      }),
    );

    return usersWithModules;
  }

  async updateUser(
    id: number,
    updates: Partial<InsertUsuario>,
  ): Promise<Usuario> {
    const [updatedUser] = await this.db
      .update(usuarios)
      .set(updates)
      .where(eq(usuarios.id, id))
      .returning();
    return updatedUser;
  }

  async deleteUser(id: number) {
    // Delete related data first (Manual Cascade)
    
    // 1. Asignaciones y Módulos
    await this.db.delete(schema.asignaciones).where(eq(schema.asignaciones.estudianteId, id));
    await this.db.delete(schema.asignaciones).where(eq(schema.asignaciones.profesorId, id));
    await this.db.delete(schema.moduloProfesores).where(eq(schema.moduloProfesores.profesorId, id));

    // 2. Entregas (Todas las variantes)
    await this.db.delete(schema.entregas).where(eq(schema.entregas.estudianteId, id));

    await this.db.delete(schema.entregasRag).where(eq(schema.entregasRag.estudianteId, id));
    await this.db.delete(schema.entregasHa).where(eq(schema.entregasHa.estudianteId, id));
    await this.db.delete(schema.entregasKids).where(eq(schema.entregasKids.estudianteId, id));

    // 3. Progreso y Gamificación
    await this.db.delete(schema.progresoNiveles).where(eq(schema.progresoNiveles.estudianteId, id));
    await this.db.delete(schema.progresoMisiones).where(eq(schema.progresoMisiones.estudianteId, id));
    await this.db.delete(schema.progresoCity).where(eq(schema.progresoCity.estudianteId, id));
    await this.db.delete(schema.gamificacionEstudiante).where(eq(schema.gamificacionEstudiante.estudianteId, id));
    await this.db.delete(schema.logrosDesbloqueados).where(eq(schema.logrosDesbloqueados.estudianteId, id));
    await this.db.delete(schema.usuariosSkins).where(eq(schema.usuariosSkins.usuarioId, id));

    // 4. Awards, Points y Certificados
    await this.db.delete(schema.rankingAwards).where(eq(schema.rankingAwards.estudianteId, id));
    await this.db.delete(schema.puntosLog).where(eq(schema.puntosLog.estudianteId, id));
    await this.db.delete(schema.certificados).where(eq(schema.certificados.estudianteId, id));
    
    // 5. Asistencia y Recursos
    await this.db.delete(schema.asistencia).where(eq(schema.asistencia.estudianteId, id));
    await this.db.delete(schema.asistencia).where(eq(schema.asistencia.profesorId, id));
    await this.db.delete(schema.recursos).where(eq(schema.recursos.profesorId, id));

    // 6. Eliminar dependencias donde el usuario es profesor (Nullear o borrar según regla de negocio)
    // Nullear en cursos
    await this.db.update(schema.cursos).set({ profesorId: null }).where(eq(schema.cursos.profesorId, id));
    // Nullear en modulos
    await this.db.update(schema.modulos).set({ profesorId: null }).where(eq(schema.modulos.profesorId, id));

    // Finally delete the user
    await this.db.delete(schema.usuarios).where(eq(schema.usuarios.id, id));
    return { success: true };
  }
}
