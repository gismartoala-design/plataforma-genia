import { Controller, Get, Post, Param, ParseIntPipe } from '@nestjs/common';
import { GamificationService } from '../services/gamification.service';
import { eq } from 'drizzle-orm';
import * as schema from '../../../shared/schema';

import { SkinsService } from '../services/skins.service';

@Controller('student/:studentId/gamification')
export class GamificationController {
    constructor(
        private readonly gamificationService: GamificationService,
        private readonly skinsService: SkinsService
    ) { }

    @Post('convert')
    async convertToGeniomonedas(@Param('studentId', ParseIntPipe) studentId: number) {
        return this.gamificationService.convertToGeniomonedas(studentId);
    }

    @Post('checkin')
    async dailyCheckin(@Param('studentId', ParseIntPipe) studentId: number) {
        return this.gamificationService.checkAndAwardDailyLogin(studentId);
    }

    @Get('skins')
    async getAllSkins() {
        return this.skinsService.findAll();
    }

    @Get('skins/owned')
    async getOwnedSkins(@Param('studentId', ParseIntPipe) studentId: number) {
        return this.skinsService.getOwnedSkins(studentId);
    }

    @Post('skins/:skinId/buy')
    async buySkin(
        @Param('studentId', ParseIntPipe) studentId: number,
        @Param('skinId', ParseIntPipe) skinId: number
    ) {
        return this.skinsService.buySkin(studentId, skinId);
    }

    @Post('skins/:skinId/equip')
    async equipSkin(
        @Param('studentId', ParseIntPipe) studentId: number,
        @Param('skinId', ParseIntPipe) skinId: number
    ) {
        return this.skinsService.equipSkin(studentId, skinId);
    }

    @Get('missions')
    async getMissions(@Param('studentId', ParseIntPipe) studentId: number) {
        // First sync weekly missions for Pro students
        await this.gamificationService.syncWeeklyMissions(studentId);

        // Get all active missions
        const missions = await this.gamificationService['db'].select()
            .from(schema.misiones)
            .where(eq(schema.misiones.activa, true));

        // Get student's progress for each mission
        const progress = await this.gamificationService['db'].select()
            .from(schema.progresoMisiones)
            .where(eq(schema.progresoMisiones.estudianteId, studentId));

        return missions.map(mission => {
            const missionProgress = progress.find(p => p.misionId === mission.id);
            return {
                ...mission,
                progresoActual: missionProgress?.progresoActual || 0,
                completada: missionProgress?.completada || false,
                recompensaReclamada: missionProgress?.recompensaReclamada || false,
            };
        });
    }

    @Post('missions/:missionId/claim')
    async claimMission(
        @Param('studentId', ParseIntPipe) studentId: number,
        @Param('missionId', ParseIntPipe) missionId: number
    ) {
        return this.gamificationService.claimMissionReward(studentId, missionId);
    }

    @Get('achievements')
    async getAchievements(@Param('studentId', ParseIntPipe) studentId: number) {
        // Get unlocked achievements
        const achievements = await this.gamificationService['db'].select({
            logro: schema.logros,
            fechaDesbloqueo: schema.logrosDesbloqueados.fechaDesbloqueo
        })
            .from(schema.logrosDesbloqueados)
            .innerJoin(schema.logros, eq(schema.logrosDesbloqueados.logroId, schema.logros.id))
            .where(eq(schema.logrosDesbloqueados.estudianteId, studentId));

        return achievements.map(a => ({
            ...a.logro,
            unlockedAt: a.fechaDesbloqueo
        }));
    }
}
