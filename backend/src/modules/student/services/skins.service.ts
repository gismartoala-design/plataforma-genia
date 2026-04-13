
import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../../shared/schema';
import { eq, and } from 'drizzle-orm';
import { DRIZZLE_DB } from '../../../database/drizzle.provider';

@Injectable()
export class SkinsService {
    constructor(
        @Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>,
    ) { }

    async findAll() {
        return this.db.select().from(schema.skins).where(eq(schema.skins.disponible, true));
    }

    async getOwnedSkins(studentId: number) {
        return this.db.select({
            id: schema.skins.id,
            nombre: schema.skins.nombre,
            descripcion: schema.skins.descripcion,
            imagenUrl: schema.skins.imagenUrl,
            tipo: schema.skins.tipo,
        })
        .from(schema.usuariosSkins)
        .innerJoin(schema.skins, eq(schema.usuariosSkins.skinId, schema.skins.id))
        .where(eq(schema.usuariosSkins.usuarioId, studentId));
    }

    async buySkin(studentId: number, skinId: number) {
        // 1. Get skin details
        const [skin] = await this.db.select()
            .from(schema.skins)
            .where(eq(schema.skins.id, skinId))
            .limit(1);

        if (!skin) throw new BadRequestException('Skin no encontrada');

        // 2. Get student details
        const [user] = await this.db.select({ geniomonedas: schema.usuarios.geniomonedas })
            .from(schema.usuarios)
            .where(eq(schema.usuarios.id, studentId))
            .limit(1);

        if ((user.geniomonedas || 0) < (skin.precioGeniomonedas || 0)) {
            throw new BadRequestException('Geniomonedas insuficientes');
        }

        // 3. Check if already owned
        const [owned] = await this.db.select()
            .from(schema.usuariosSkins)
            .where(and(
                eq(schema.usuariosSkins.usuarioId, studentId),
                eq(schema.usuariosSkins.skinId, skinId)
            ))
            .limit(1);

        if (owned) throw new BadRequestException('Ya posees esta skin');

        // 4. Perform transaction
        await this.db.transaction(async (tx) => {
            // Deduct Geniomonedas
            await tx.update(schema.usuarios)
                .set({ geniomonedas: (user.geniomonedas || 0) - (skin.precioGeniomonedas || 0) })
                .where(eq(schema.usuarios.id, studentId));

            // Add to owned skins
            await tx.insert(schema.usuariosSkins).values({
                usuarioId: studentId,
                skinId: skinId,
            });
        });

        return { success: true, message: 'Skin adquirida con éxito' };
    }

    async equipSkin(studentId: number, skinId: number) {
        // 1. Check if owned
        const [owned] = await this.db.select()
            .from(schema.usuariosSkins)
            .where(and(
                eq(schema.usuariosSkins.usuarioId, studentId),
                eq(schema.usuariosSkins.skinId, skinId)
            ))
            .limit(1);

        if (!owned && skinId !== 0) { // 0 could be "unequip"
            throw new BadRequestException('No posees esta skin');
        }

        // 2. Update user
        await this.db.update(schema.usuarios)
            .set({ skinEquipadaId: skinId === 0 ? null : skinId })
            .where(eq(schema.usuarios.id, studentId));

        return { success: true, message: 'Skin equipada' };
    }
}
