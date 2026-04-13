

import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, ilike, or } from 'drizzle-orm';
import { usuarios } from 'src/shared/schema';
import { DRIZZLE_DB } from 'src/database/drizzle.provider';
import * as schema from 'src/shared/schema';
import { GamificationService } from '../student/services/gamification.service';

@Injectable()
export class AuthService {
    constructor(
        @Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>,
        private jwtService: JwtService,
        private gamificationService: GamificationService
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        console.log(`Validating user: ${email} with pass: ${pass}`);
        const result = await this.db.select().from(usuarios).where(or(ilike(usuarios.email, email), ilike(usuarios.nombre, email))).limit(1);
        let user = result[0];
        
        // TEMPORARY FIX: For user 123 with no institucionId, auto-assign to allow testing
        if (user && user.id === 123 && !user.institucionId) {
            console.log('[AuthService] Fixing User 123: Missing institutionId. Auto-assigning...');
            const insts = await this.db.select().from(schema.instituciones).limit(1);
            if (insts.length > 0) {
                user.institucionId = insts[0].id;
                console.log(`[AuthService] User 123 linked to institution: ${user.institucionId}`);
            }
        }

        console.log('[AuthService] User found in DB:', { id: user?.id, email: user?.email, roleId: user?.roleId, institucionId: user?.institucionId });
        console.log('User found:', user);

        if (!user) {
            console.log('User not found');
            return null;
        }

        // Check if account is suspended/blocked
        if (user.activo === false) {
            throw new UnauthorizedException({
                message: 'Esta plataforma ha sido suspendida por falta de pago. Por favor, comuníquese con el área de Contabilidad. Muchas gracias por su atención.',
                code: 'ACCOUNT_SUSPENDED'
            });
        }

        if (user.password === pass) {
            const { password, ...result } = user;
            return result;
        }
        console.log('Password mismatch or user not found');
        return null;
    }

    async login(user: any) {
        const payload = { email: user.email, sub: user.id, roleId: user.roleId };

        // Update last login timestamp
        await this.db.update(schema.usuarios)
            .set({ ultimaConexion: new Date() })
            .where(eq(schema.usuarios.id, user.id));

        // Update streak and award daily login XP for students (Standard: 3, Kids: 6)
        if (user.roleId === 3 || user.roleId === 6) {
            try {
                const streakResult = await this.gamificationService.updateStreak(user.id);
                await this.gamificationService.awardXP(user.id, 50, 'Login diario');
                await this.gamificationService.updateMissionProgress(user.id, 'DAILY_LOGIN', 1);
            } catch (error) {
                console.error('Error updating gamification on login:', error);
            }
        }

        return {
            access_token: this.jwtService.sign(payload),
            user: user,
        };
    }
}
