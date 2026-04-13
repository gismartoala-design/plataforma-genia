import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { DRIZZLE_DB } from 'src/database/drizzle.provider';
import * as schema from 'src/shared/schema';
import { GamificationService } from '../student/services/gamification.service';

@Injectable()
export class KidsService {
  constructor(
    @Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>,
    private readonly gamificationService: GamificationService,
  ) { }

  async getTemplatesByNivel(nivelId: number) {
    return this.db.select()
      .from(schema.plantillasKids)
      .where(eq(schema.plantillasKids.nivelId, nivelId));
  }

  async getLevelInfo(nivelId: number) {
    return this.db.select()
      .from(schema.niveles)
      .where(eq(schema.niveles.id, nivelId))
      .limit(1);
  }

  async createTemplate(data: Partial<schema.InsertPlantillaKids>) {
    const result = await this.db.insert(schema.plantillasKids)
      .values(data as any)
      .returning();
    return result[0];
  }

  async updateTemplate(id: number, data: Partial<schema.InsertPlantillaKids>) {
    const result = await this.db.update(schema.plantillasKids)
      .set(data as any)
      .where(eq(schema.plantillasKids.id, id))
      .returning();

    if (!result.length) throw new NotFoundException('Template not found');
    return result[0];
  }

  async deleteTemplate(id: number) {
    const result = await this.db.delete(schema.plantillasKids)
      .where(eq(schema.plantillasKids.id, id))
      .returning();

    if (!result.length) throw new NotFoundException('Template not found');
    return { success: true };
  }

  async submitResult(data: schema.InsertEntregaKids) {
    const result = await this.db.insert(schema.entregasKids)
      .values(data)
      .returning();

    // Award XP and Trigger Missions
    try {
      if (data.estudianteId) {
        console.log(`[XP AWARD] Awarding 100 XP to Kids student ${data.estudianteId} for activity completion`);
        await this.gamificationService.awardXP(Number(data.estudianteId), 100, "Actividad Kids Completada");
        await this.gamificationService.updateMissionProgress(Number(data.estudianteId), 'COMPLETE_ACTIVITY', 1);
      }
    } catch (error) {
      console.error('[GAMIFICATION ERROR] Error awarding XP for Kids activity:', error.message);
    }

    return result[0];
  }
}
