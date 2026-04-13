
import { Inject, Injectable } from '@nestjs/common';
import { DRIZZLE_DB } from '../../database/drizzle.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../shared/schema';
import { eq, asc, desc, and, sql, inArray, or, isNull } from 'drizzle-orm';
import { StorageService } from '../storage/storage.service';
import { GamificationService } from './services/gamification.service';

type ActivityCode = 'RAG' | 'HA' | 'TRADITIONAL';
type CompletionStatus = 'not_started' | 'in_progress' | 'completed';
type AccessStatus = 'locked_time' | 'locked_sequence' | 'locked_manual' | 'unlocked';

@Injectable()
export class StudentService {
    constructor(
        @Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>,
        private storageService: StorageService,
        private gamificationService: GamificationService
    ) { }

    private safeParsePasos(raw: any): any[] {
        if (!raw) return [];
        if (Array.isArray(raw)) return raw;

        try {
            let parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
            if (typeof parsed === 'string') parsed = JSON.parse(parsed);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    }

    private uniqueActivityCodes(codes: ActivityCode[]): ActivityCode[] {
        return [...new Set(codes)];
    }

    private async getSingleLevelProgressContext(studentId: number, levelId: number) {
        const level = await this.db.select()
            .from(schema.niveles)
            .where(eq(schema.niveles.id, levelId))
            .limit(1)
            .then(res => res[0]);

        if (!level) {
            return null;
        }

        const [
            module,
            assignment,
            progressRow,
            activities,
            rags,
            has,
            genericSubs,
            ragSubs,
            haSubs,
            attendance
        ] = await Promise.all([
            this.db.select({ categoria: schema.modulos.categoria })
                .from(schema.modulos)
                .where(eq(schema.modulos.id, level.moduloId!))
                .limit(1)
                .then(res => res[0]),
            this.db.select()
                .from(schema.asignaciones)
                .where(and(
                    eq(schema.asignaciones.estudianteId, studentId),
                    eq(schema.asignaciones.moduloId, level.moduloId!)
                ))
                .limit(1)
                .then(res => res[0]),
            this.db.select()
                .from(schema.progresoNiveles)
                .where(and(
                    eq(schema.progresoNiveles.estudianteId, studentId),
                    eq(schema.progresoNiveles.nivelId, levelId)
                ))
                .limit(1)
                .then(res => res[0]),
            this.db.select().from(schema.actividades).where(eq(schema.actividades.nivelId, levelId)),
            this.db.select().from(schema.plantillasRag).where(eq(schema.plantillasRag.nivelId, levelId)),
            this.db.select().from(schema.plantillasHa).where(eq(schema.plantillasHa.nivelId, levelId)),
            this.db.select().from(schema.entregas).where(eq(schema.entregas.estudianteId, studentId)),
            this.db.select().from(schema.entregasRag).where(eq(schema.entregasRag.estudianteId, studentId)),
            this.db.select().from(schema.entregasHa).where(eq(schema.entregasHa.estudianteId, studentId)),
            this.db.select()
                .from(schema.asistencia)
                .where(and(
                    eq(schema.asistencia.estudianteId, studentId),
                    eq(schema.asistencia.nivelId, levelId)
                ))
                .limit(1)
                .then(res => res[0])
        ]);

        const fechaAsignacion = assignment?.fechaAsignacion || new Date();
        const now = new Date();
        const daysPassed = Math.floor(
            Math.abs(now.getTime() - new Date(fechaAsignacion).getTime()) / (1000 * 60 * 60 * 24)
        );

        return {
            level,
            moduleCategory: module?.categoria || 'standard',
            progressRow,
            daysPassed,
            activities,
            rags,
            has,
            genericSubs,
            ragSubs,
            haSubs,
            attendance
        };
    }

    private buildLevelProgressSnapshot(params: {
        level: any;
        moduleCategory?: string | null;
        progressRow?: any;
        daysPassed: number;
        previousLevelCompleted: boolean;
        activities: any[];
        genericSubs: any[];
        rags: any[];
        ragSubs: any[];
        has: any[];
        haSubs: any[];
        attendances: any[];
    }) {
        const {
            level,
            moduleCategory,
            progressRow,
            daysPassed,
            previousLevelCompleted,
            activities,
            genericSubs,
            rags,
            ragSubs,
            has,
            haSubs,
            attendances
        } = params;

        const isSpecialization = false; // logic removed
        const attendance = attendances.find(a => a.nivelId === level.id);
        const hasAttended = attendance?.asistio === true;

        let totalTasks = 0;
        let completedTasks = 0;
        let mandatoryTotal = 0;
        let mandatoryDone = 0;

        const availableActivities: ActivityCode[] = [];
        const requiredActivities: ActivityCode[] = [];
        const completedActivities: ActivityCode[] = [];

        const levelActs = activities.filter(a => a.nivelId === level.id);
        if (levelActs.length > 0) {
            availableActivities.push('TRADITIONAL');
            totalTasks += levelActs.length;

            const completedTraditionalIds = new Set(
                genericSubs
                    .filter(s => s.actividadId && levelActs.some(a => a.id === s.actividadId) && s.calificacionNumerica !== null)
                    .map(s => s.actividadId)
            );

            completedTasks += completedTraditionalIds.size;

            if (completedTraditionalIds.size === levelActs.length) {
                completedActivities.push('TRADITIONAL');
            }
        }

        const levelRags = rags.filter(r => r.nivelId === level.id);
        if (levelRags.length > 0) {
            availableActivities.push('RAG');
            if (!isSpecialization) {
                requiredActivities.push('RAG');
                mandatoryTotal += levelRags.length;
            }

            let ragDoneCount = 0;
            for (const rag of levelRags) {
                totalTasks += 1;

                if (hasAttended) {
                    completedTasks += 1;
                    ragDoneCount += 1;
                    if (!isSpecialization) mandatoryDone += 1;
                    continue;
                }

                const pasos = this.safeParsePasos(rag.pasosGuiados);
                if (!pasos.length) {
                    completedTasks += 1;
                    ragDoneCount += 1;
                    if (!isSpecialization) mandatoryDone += 1;
                    continue;
                }

                const submittedIndices = new Set(
                    ragSubs
                        .filter(s => s.plantillaRagId === rag.id)
                        .map(s => s.pasoIndice)
                );

                const isRagDone = pasos.every((p: any, idx: number) => !p.requiereEntregable || submittedIndices.has(idx));
                if (isRagDone) {
                    completedTasks += 1;
                    ragDoneCount += 1;
                    if (!isSpecialization) mandatoryDone += 1;
                }
            }

            if (ragDoneCount === levelRags.length) {
                completedActivities.push('RAG');
            }
        }

        const levelHas = has.filter(h => h.nivelId === level.id);
        if (levelHas.length > 0) {
            availableActivities.push('HA');
            if (!isSpecialization) {
                requiredActivities.push('HA');
                mandatoryTotal += levelHas.length;
            }

            let haDoneCount = 0;
            for (const ha of levelHas) {
                totalTasks += 1;
                const isHaDone = haSubs.some(s => s.plantillaHaId === ha.id);
                if (isHaDone) {
                    completedTasks += 1;
                    haDoneCount += 1;
                    if (!isSpecialization) mandatoryDone += 1;
                }
            }

            if (haDoneCount === levelHas.length) {
                completedActivities.push('HA');
            }
        }



        const porcentajeCompletado = totalTasks === 0
            ? 100
            : Math.min(100, Math.round((completedTasks / totalTasks) * 100));

        const completado = mandatoryTotal === 0 || mandatoryDone === mandatoryTotal;

        let completionStatus: CompletionStatus = 'not_started';
        if (completado) {
            completionStatus = 'completed';
        } else if (completedTasks > 0 || (progressRow?.porcentajeCompletado ?? 0) > 0) {
            completionStatus = 'in_progress';
        }

        const daysRequired = (level.orden || 1) <= 1 ? 0 : (level.diasParaDesbloquear ?? (isSpecialization ? 0 : 7));
        const hasEnoughTime = daysPassed >= daysRequired;
        const isForceUnlocked = level.bloqueadoManual === false;
        const isUnlockedByTime = isForceUnlocked || (level.bloqueadoManual !== true && hasEnoughTime);
        const isUnlockedByProgress = previousLevelCompleted;
        const isUnlocked = isForceUnlocked || (isUnlockedByTime && isUnlockedByProgress);

        let accessStatus: AccessStatus = 'unlocked';
        if (level.bloqueadoManual === true) {
            accessStatus = 'locked_manual';
        } else if (!isForceUnlocked && !hasEnoughTime) {
            accessStatus = 'locked_time';
        } else if (!isForceUnlocked && !previousLevelCompleted) {
            accessStatus = 'locked_sequence';
        }

        const uniqueRequiredActivities = this.uniqueActivityCodes(requiredActivities);
        const uniqueCompletedActivities = this.uniqueActivityCodes(completedActivities);
        const uniqueAvailableActivities = this.uniqueActivityCodes(availableActivities);
        const optionalActivities = uniqueAvailableActivities.filter(code => !uniqueRequiredActivities.includes(code));

        const tipoActividad: ActivityCode = levelRags.length
                        ? 'RAG'
                        : levelHas.length
                            ? 'HA'
                            : 'TRADITIONAL';

        return {
            ...level,
            porcentajeCompletado,
            completado,
            isUnlocked,
            isUnlockedByTime,
            isUnlockedByProgress,
            isStuck: isUnlockedByTime && !isUnlockedByProgress && !isForceUnlocked,
            isManuallyBlocked: level.bloqueadoManual === true,
            daysPassed,
            daysRequired,
            tipoActividad,
            progressPercent: porcentajeCompletado,
            completionStatus,
            accessStatus,
            requiredActivities: uniqueRequiredActivities,
            completedActivities: uniqueCompletedActivities,
            optionalActivities
        };
    }

    async getStudentModules(studentId: number) {
        // 0. Get User to check cursoId
        const [user] = await this.db.select()
            .from(schema.usuarios)
            .where(eq(schema.usuarios.id, studentId))
            .limit(1);

        // 1. Get Direct Assigned Modules
        const directAssignments = await this.db.select({
            module: schema.modulos,
            fechaAsignacion: schema.asignaciones.fechaAsignacion
        })
            .from(schema.asignaciones)
            .innerJoin(schema.modulos, eq(schema.asignaciones.moduloId, schema.modulos.id))
            .where(and(
                eq(schema.asignaciones.estudianteId, studentId),
                or(eq(schema.modulos.bloqueado, false), isNull(schema.modulos.bloqueado))
            ));

        // 2. Get Modules from Course (if any)
        let courseModules: { module: any, fechaAsignacion: Date | null }[] = [];
        if (user?.cursoId) {
            const cms = await this.db.select({
                module: schema.modulos,
            })
            .from(schema.modulos)
            .where(and(
                eq(schema.modulos.cursoId, user.cursoId),
                or(eq(schema.modulos.bloqueado, false), isNull(schema.modulos.bloqueado))
            ));
            
            courseModules = cms.map(m => ({
                module: m.module,
                fechaAsignacion: user.ultimaConexion || new Date()
            }));
        }

        // 3. Combine and Deduplicate
        const modulesMap = new Map<number, any>();
        
        // Add course modules first (lower priority if direct exists? or just add all)
        courseModules.forEach(row => modulesMap.set(row.module.id, row));
        // Direct assignments overwrite/complement
        directAssignments.forEach(row => modulesMap.set(row.module.id, row));

        const assignments = Array.from(modulesMap.values());

        // 2. For each module, get Levels and Progress
        const modulesWithLevels = await Promise.all(assignments.map(async (row) => {
            const mod = row.module;

            const levels = await this.db.select()
                .from(schema.niveles)
                .where(and(
                    eq(schema.niveles.moduloId, mod.id),
                    or(eq(schema.niveles.bloqueado, false), isNull(schema.niveles.bloqueado))
                ))
                .orderBy(asc(schema.niveles.orden));

            const levelIds = levels.map(l => l.id);
            let progressPercentage = 0;

            if (levelIds.length > 0) {
                const completions = await this.db.select()
                    .from(schema.progresoNiveles)
                    .where(and(
                        eq(schema.progresoNiveles.estudianteId, studentId),
                        sql`${schema.progresoNiveles.nivelId} IN (${sql.join(levelIds, sql`, `)})`,
                        eq(schema.progresoNiveles.completado, true)
                    ));
                progressPercentage = Math.round((completions.length / levels.length) * 100);
            }

            return {
                ...mod,
                levels,
                levelCount: levels.length,
                progressPercentage
            };
        }));

        // 3. Get Course Info for the header
        let cursoNombre = "Sin Curso Asignado";
        if (user?.cursoId) {
            const [curso] = await this.db.select()
                .from(schema.cursos)
                .where(eq(schema.cursos.id, user.cursoId))
                .limit(1);
            if (curso) cursoNombre = curso.nombre;
        }

        return {
            cursoNombre,
            modules: modulesWithLevels
        };
    }

    async getStudentProgress(studentId: number) {
        // Get total points
        const pointsResult = await this.db.select({
            total: schema.puntosLog.cantidad
        })
            .from(schema.puntosLog)
            .where(eq(schema.puntosLog.estudianteId, studentId));

        const totalPoints = pointsResult.reduce((sum, row) => sum + (row.total || 0), 0);

        // Get module progress (days elapsed for each assigned module)
        const assignments = await this.db.select({
            moduloId: schema.asignaciones.moduloId,
            duracionDias: schema.modulos.duracionDias,
            fechaAsignacion: schema.asignaciones.fechaAsignacion
        })
            .from(schema.asignaciones)
            .innerJoin(schema.modulos, eq(schema.asignaciones.moduloId, schema.modulos.id))
            .where(eq(schema.asignaciones.estudianteId, studentId));

        const moduleProgress = await Promise.all(assignments.map(async (assignment) => {
            const startDate = assignment.fechaAsignacion || new Date();
            const today = new Date();
            const daysElapsed = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
            const totalDays = assignment.duracionDias || 30;

            // Calculate actual completion percentage based on finished levels
            const levels = await this.db.select({ id: schema.niveles.id })
                .from(schema.niveles)
                .where(eq(schema.niveles.moduloId, assignment.moduloId!));

            const levelIds = levels.map(l => l.id);
            let finishedLevels = 0;

            if (levelIds.length > 0) {
                const completions = await this.db.select()
                    .from(schema.progresoNiveles)
                    .where(and(
                        eq(schema.progresoNiveles.estudianteId, studentId),
                        sql`${schema.progresoNiveles.nivelId} IN (${sql.join(levelIds, sql`, `)})`,
                        eq(schema.progresoNiveles.completado, true)
                    ));
                finishedLevels = completions.length;
            }

            const progressPercentage = levels.length > 0
                ? Math.round((finishedLevels / levels.length) * 100)
                : 0;

            return {
                moduloId: assignment.moduloId,
                daysElapsed: Math.max(0, daysElapsed),
                totalDays,
                progressPercentage
            };
        }));

        return {
            totalPoints,
            moduleProgress
        };
    }

    async getLevelContents(levelId: number) {
        const contents = await this.db.select()
            .from(schema.contenidos)
            .where(eq(schema.contenidos.nivelId, levelId));
        return contents;
    }

    async calculateLevelProgress(studentId: number, levelId: number) {
        const context = await this.getSingleLevelProgressContext(studentId, levelId);

        if (!context) {
            return {
                porcentajeCompletado: 0,
                completado: false,
                progressPercent: 0,
                completionStatus: 'not_started' as CompletionStatus,
                accessStatus: 'locked_sequence' as AccessStatus,
                requiredActivities: [],
                completedActivities: [],
                optionalActivities: []
            };
        }

        const snapshot = this.buildLevelProgressSnapshot({
            level: context.level,
            moduleCategory: context.moduleCategory,
            progressRow: context.progressRow,
            daysPassed: context.daysPassed,
            previousLevelCompleted: true,
            activities: context.activities,
            genericSubs: context.genericSubs,
            rags: context.rags,
            ragSubs: context.ragSubs,
            has: context.has,
            haSubs: context.haSubs,
            attendances: context.attendance ? [context.attendance] : []
        });

        return {
            porcentajeCompletado: snapshot.porcentajeCompletado,
            completado: snapshot.completado,
            progressPercent: snapshot.progressPercent,
            completionStatus: snapshot.completionStatus,
            accessStatus: snapshot.accessStatus,
            requiredActivities: snapshot.requiredActivities,
            completedActivities: snapshot.completedActivities,
            optionalActivities: snapshot.optionalActivities
        };
    }

    async getAttendanceStatus(studentId: number, levelId: number) {
        const [attendance] = await this.db.select()
            .from(schema.asistencia)
            .where(and(
                eq(schema.asistencia.estudianteId, studentId),
                eq(schema.asistencia.nivelId, levelId)
            ))
            .limit(1);

        return {
            asistio: attendance?.asistio === true,
            recuperada: attendance?.recuperada === true,
            fecha: attendance?.fecha || null
        };
    }

    async getDetailedLevelStatus(studentId: number, levelId: number) {
        const context = await this.getSingleLevelProgressContext(studentId, levelId);
        if (!context) {
            return {
                attendance: { asistio: false, recuperada: false, fecha: null },
                rag: null,
                ha: null,
                progressPercent: 0,
                completionStatus: 'not_started' as CompletionStatus,
                accessStatus: 'locked_sequence' as AccessStatus,
                requiredActivities: [],
                completedActivities: [],
                optionalActivities: []
            };
        }

        const attendance = {
            asistio: context.attendance?.asistio === true,
            recuperada: context.attendance?.recuperada === true,
            fecha: context.attendance?.fecha || null
        };

        const snapshot = this.buildLevelProgressSnapshot({
            level: context.level,
            moduleCategory: context.moduleCategory,
            progressRow: context.progressRow,
            daysPassed: context.daysPassed,
            previousLevelCompleted: true,
            activities: context.activities,
            genericSubs: context.genericSubs,
            rags: context.rags,
            ragSubs: context.ragSubs,
            has: context.has,
            haSubs: context.haSubs,
            attendances: context.attendance ? [context.attendance] : []
        });

        const hasAttended = attendance.asistio || attendance.recuperada;

        const ragStatuses = context.rags.map((rag) => {
            const pasos = this.safeParsePasos(rag.pasosGuiados);
            const submittedIndices = new Set(
                context.ragSubs
                    .filter(s => s.plantillaRagId === rag.id)
                    .map(s => s.pasoIndice)
            );

            const completed = pasos.length === 0
                ? true
                : pasos.every((p, idx) => !p.requiereEntregable || submittedIndices.has(idx));
            const pending = pasos.some((p, idx) => p.requiereEntregable && !submittedIndices.has(idx));

            return { completed, pending };
        });

        const ragCompleted = hasAttended || (context.rags.length > 0 && ragStatuses.every(status => status.completed));
        const ragPendingDeliverables = !hasAttended && ragStatuses.some(status => status.pending);

        const haCompleted = context.has.length > 0
            ? context.has.every(ha => context.haSubs.some(sub => sub.plantillaHaId === ha.id))
            : false;



        // 6. Kids Completion
        const kidsTemplates = await this.db.select()
            .from(schema.plantillasKids)
            .where(and(
                eq(schema.plantillasKids.nivelId, levelId),
                or(
                    eq(schema.plantillasKids.bloqueado, false),
                    isNull(schema.plantillasKids.bloqueado)
                )
            ));
            
        let ragKids = null;
        let haKids = null;
        let adventureKids = null;

        if (kidsTemplates.length > 0) {
            const kidsDeliveries = await this.db.select()
                .from(schema.entregasKids)
                .where(eq(schema.entregasKids.estudianteId, studentId));
                
            for (const kt of kidsTemplates) {
                const isCompleted = kidsDeliveries.some(d => d.plantillaKidsId === kt.id);
                const statusObj = {
                    completed: isCompleted,
                    status: isCompleted ? 'completed' : 'pending'
                };
                if (kt.tipo === 'rag_kids') ragKids = statusObj;
                else if (kt.tipo === 'ha_kids') haKids = statusObj;
                else if (kt.tipo === 'adventure') adventureKids = statusObj;
            }
        }

        return {
            attendance,
            progressPercent: snapshot.progressPercent,
            completionStatus: snapshot.completionStatus,
            accessStatus: snapshot.accessStatus,
            requiredActivities: snapshot.requiredActivities,
            completedActivities: snapshot.completedActivities,
            optionalActivities: snapshot.optionalActivities,
            rag: context.rags.length > 0 ? {
                completed: ragCompleted,
                pending: ragPendingDeliverables,
                status: ragCompleted ? 'completed' : (hasAttended ? 'completed' : (ragPendingDeliverables ? 'pending' : 'missing'))
            } : null,
            ha: context.has.length > 0 ? {
                completed: haCompleted,
                status: haCompleted ? 'completed' : 'pending'
            } : null,
            adventureKids
        };
    }

    async updateLevelProgress(studentId: number, levelId: number) {
        const { porcentajeCompletado, completado } = await this.calculateLevelProgress(studentId, levelId);

        // Check for attendance recovery
        if (completado) {
            const [attendance] = await this.db.select()
                .from(schema.asistencia)
                .where(and(
                    eq(schema.asistencia.estudianteId, studentId),
                    eq(schema.asistencia.nivelId, levelId),
                    eq(schema.asistencia.asistio, false),
                    eq(schema.asistencia.recuperada, false)
                ))
                .limit(1);

            if (attendance) {
                console.log(`[ATTENDANCE RECOVERY] Student ${studentId} recovered attendance for level ${levelId}`);
                await this.db.update(schema.asistencia)
                    .set({ recuperada: true })
                    .where(eq(schema.asistencia.id, attendance.id));

                // Award points for recovery
                await this.gamificationService.awardXP(studentId, 150, "Asistencia Recuperada");
            }
        }

        // Check if progress record exists
        const existing = await this.db.select()
            .from(schema.progresoNiveles)
            .where(and(
                eq(schema.progresoNiveles.estudianteId, studentId),
                eq(schema.progresoNiveles.nivelId, levelId)
            ))
            .limit(1);

        if (existing.length > 0) {
            // Update existing
            await this.db.update(schema.progresoNiveles)
                .set({
                    porcentajeCompletado,
                    completado: completado,
                    fechaCompletado: (completado && !existing[0].completado) ? new Date() : existing[0].fechaCompletado
                })
                .where(eq(schema.progresoNiveles.id, existing[0].id));
        } else {
            // Create new
            await this.db.insert(schema.progresoNiveles).values({
                estudianteId: studentId,
                nivelId: levelId,
                porcentajeCompletado,
                completado,
                fechaCompletado: completado ? new Date() : null
            });
        }

        // If newly completed, award Level XP and unlock next level
        if (completado && (existing.length === 0 || !existing[0].completado)) {
            try {
                // Get level info to determine category
                const [levelData] = await this.db.select({ 
                    id: schema.niveles.id,
                    moduleId: schema.niveles.moduloId,
                    categoria: schema.modulos.categoria
                })
                    .from(schema.niveles)
                    .innerJoin(schema.modulos, eq(schema.niveles.moduloId, schema.modulos.id))
                    .where(eq(schema.niveles.id, levelId))
                    .limit(1);

                if (levelData) {
                    let levelXP = 200; // Base XP for standard levels
                    if (levelData.categoria === 'pim') {
                        levelXP = 500; // Higher reward for projects
                    }

                    console.log(`[LEVEL XP] Student ${studentId} completed level ${levelId}. Awarding ${levelXP} XP.`);
                    await this.gamificationService.awardXP(studentId, levelXP, `Nivel Completado (${levelData.categoria})`);
                }
            } catch (error) {
                console.error('[GAMIFICATION ERROR] Error awarding XP for level completion:', error.message);
            }

            await this.unlockNextLevel(studentId, levelId);
        }

        return { porcentajeCompletado, completado };
    }

    async unlockNextLevel(studentId: number, currentLevelId: number) {
        // Get current level info
        const currentLevel = await this.db.select()
            .from(schema.niveles)
            .where(eq(schema.niveles.id, currentLevelId))
            .limit(1);

        if (currentLevel.length === 0) return;

        const moduleId = currentLevel[0].moduloId;
        const currentOrder = currentLevel[0].orden;

        // Find next level
        const nextLevel = await this.db.select()
            .from(schema.niveles)
            .where(and(
                eq(schema.niveles.moduloId, moduleId!),
                eq(schema.niveles.orden, currentOrder! + 1)
            ))
            .limit(1);

        if (nextLevel.length === 0) return; // No next level

        // Create progress record for next level (unlocked but not started)
        const existingNext = await this.db.select()
            .from(schema.progresoNiveles)
            .where(and(
                eq(schema.progresoNiveles.estudianteId, studentId),
                eq(schema.progresoNiveles.nivelId, nextLevel[0].id)
            ))
            .limit(1);

        if (existingNext.length === 0) {
            await this.db.insert(schema.progresoNiveles).values({
                estudianteId: studentId,
                nivelId: nextLevel[0].id,
                porcentajeCompletado: 0,
                completado: false
            });
        }
    }

    async getStudentLevelProgress(studentId: number, moduleId: number) {
        console.log(`[GET MODULE PROGRESS] Student: ${studentId}, Module: ${moduleId}`);

        // 1. Metadata Batch
        const [moduleRes, assignment, levels, progressRows] = await Promise.all([
            this.db.select({ categoria: schema.modulos.categoria })
                .from(schema.modulos).where(eq(schema.modulos.id, moduleId)).limit(1),
            this.db.select().from(schema.asignaciones)
                .where(and(eq(schema.asignaciones.estudianteId, studentId), eq(schema.asignaciones.moduloId, moduleId)))
                .limit(1).then(res => res[0]),
            this.db.select().from(schema.niveles)
                .where(eq(schema.niveles.moduloId, moduleId))
                .orderBy(asc(schema.niveles.orden)),
            this.db.select().from(schema.progresoNiveles)
                .where(eq(schema.progresoNiveles.estudianteId, studentId))
        ]);

        if (!levels.length) return [];

        const levelIds = levels.map(l => l.id);
        const module = moduleRes[0];
        const fechaAsignacion = assignment?.fechaAsignacion || new Date();
        const now = new Date();
        const daysPassed = Math.floor(Math.abs(now.getTime() - new Date(fechaAsignacion).getTime()) / (1000 * 60 * 60 * 24));

        // 2. Data Batch (Get templates first)
        const [
            rags, has, activities
        ] = await Promise.all([
            this.db.select().from(schema.plantillasRag).where(inArray(schema.plantillasRag.nivelId, levelIds)),
            this.db.select().from(schema.plantillasHa).where(inArray(schema.plantillasHa.nivelId, levelIds)),
            this.db.select().from(schema.actividades).where(inArray(schema.actividades.nivelId, levelIds)),
        ]);

        // 3. Submissions Batch (Filtered by templates found in step 2)
        const ragIds = rags.map(r => r.id);
        const haIds = has.map(h => h.id);
        const actIds = activities.map(a => a.id);

        const [
            ragSubs, haSubs, genericSubs, attendances
        ] = await Promise.all([
            ragIds.length ? this.db.select().from(schema.entregasRag).where(and(eq(schema.entregasRag.estudianteId, studentId), inArray(schema.entregasRag.plantillaRagId, ragIds))) : this.db.select().from(schema.entregasRag).where(sql`false`),
            haIds.length ? this.db.select().from(schema.entregasHa).where(and(eq(schema.entregasHa.estudianteId, studentId), inArray(schema.entregasHa.plantillaHaId, haIds))) : this.db.select().from(schema.entregasHa).where(sql`false`),
            actIds.length ? this.db.select().from(schema.entregas).where(and(eq(schema.entregas.estudianteId, studentId), inArray(schema.entregas.actividadId, actIds))) : this.db.select().from(schema.entregas).where(sql`false`),
            this.db.select().from(schema.asistencia).where(and(eq(schema.asistencia.estudianteId, studentId), inArray(schema.asistencia.nivelId, levelIds)))
        ]);

        let previousLevelCompleted = true;
        const results = [];

        for (const level of levels) {
            const levelProgress = progressRows.find(p => p.nivelId === level.id);
            const snapshot = this.buildLevelProgressSnapshot({
                level,
                moduleCategory: module?.categoria,
                progressRow: levelProgress,
                daysPassed,
                previousLevelCompleted,
                activities,
                genericSubs,
                rags,
                ragSubs,
                has,
                haSubs,
                attendances
            });

            // Sync with DB if Mandatory status doesn't match DB state
            if (snapshot.completado !== !!levelProgress?.completado) {
                this.updateLevelProgress(studentId, level.id).catch(e => console.error(`[SYNC ERROR] Level ${level.id}:`, e));
            }

            results.push(snapshot);
            previousLevelCompleted = snapshot.completado;
        }

        return results;
    }


    async getAvailableMissions(studentId: number) {
        const assignments = await this.db.select({ moduleId: schema.asignaciones.moduloId })
            .from(schema.asignaciones)
            .where(eq(schema.asignaciones.estudianteId, studentId));

        if (assignments.length === 0) return [];
        const moduleIds = assignments.map(a => a.moduleId).filter((id): id is number => id !== null);

        let missions = [];
        for (const modId of moduleIds) {
            const levelsInfos = await this.getStudentLevelProgress(studentId, modId);
            if (levelsInfos.length === 0) continue;

            const levelIds = levelsInfos.map(l => l.id);

            // Fetch info for all levels in the module at once
            const [tags, haInfos] = await Promise.all([
                this.db.select({ nivelId: schema.plantillasRag.nivelId, id: schema.plantillasRag.id, nombre: schema.plantillasRag.nombreActividad, hito: schema.plantillasRag.hitoAprendizaje })
                    .from(schema.plantillasRag).where(inArray(schema.plantillasRag.nivelId, levelIds)),
                this.db.select({ nivelId: schema.plantillasHa.nivelId, id: schema.plantillasHa.id, fase: schema.plantillasHa.fase })
                    .from(schema.plantillasHa).where(inArray(schema.plantillasHa.nivelId, levelIds))
            ]);

            for (const level of levelsInfos) {
                const rag = tags.find(t => t.nivelId === level.id);
                const ha = haInfos.find(h => h.nivelId === level.id);

                const missionName = rag?.hito || ha?.fase || `Nivel ${level.orden}`;
                const description = rag?.nombre || "Completar las actividades del nivel.";

                missions.push({
                    id: level.id,
                    title: missionName,
                    description: description,
                    status: level.completado ? 'completed' : (level.isUnlocked ? 'active' : 'locked'),
                    xp: 500,
                    location: `Zona ${level.orden}`,
                    type: rag ? 'RAG' : 'HA'
                });
            }
        }

        return missions;
    }



    // =========== GAMIFICATION ===========
    async getGamificationStats(studentId: number) {
        // First check if user exists to avoid FK violations
        const user = await this.db.select({ id: schema.usuarios.id })
            .from(schema.usuarios)
            .where(eq(schema.usuarios.id, studentId))
            .limit(1);

        if (user.length === 0) {
            console.warn(`[getGamificationStats] Student ${studentId} not found in Table usuarios. Returning null stats.`);
            return null;
        }

        let gamification = await this.db.select({
            id: schema.gamificacionEstudiante.id,
            xpTotal: schema.gamificacionEstudiante.xpTotal,
            nivelActual: schema.gamificacionEstudiante.nivelActual,
            puntosDisponibles: schema.gamificacionEstudiante.puntosDisponibles,
            rachaDias: schema.gamificacionEstudiante.rachaDias,
            geniomonedas: schema.usuarios.geniomonedas,
            skinEquipadaId: schema.usuarios.skinEquipadaId,
        })
            .from(schema.gamificacionEstudiante)
            .innerJoin(schema.usuarios, eq(schema.gamificacionEstudiante.estudianteId, schema.usuarios.id))
            .where(eq(schema.gamificacionEstudiante.estudianteId, studentId))
            .limit(1);
        if (gamification.length === 0) {
            // Initialize gamification for student
            await this.db.insert(schema.gamificacionEstudiante).values({
                estudianteId: studentId,
                xpTotal: 0,
                nivelActual: 1,
                puntosDisponibles: 0,
                rachaDias: 0
            });
            gamification = await this.db.select({
                id: schema.gamificacionEstudiante.id,
                xpTotal: schema.gamificacionEstudiante.xpTotal,
                nivelActual: schema.gamificacionEstudiante.nivelActual,
                puntosDisponibles: schema.gamificacionEstudiante.puntosDisponibles,
                rachaDias: schema.gamificacionEstudiante.rachaDias,
                geniomonedas: schema.usuarios.geniomonedas,
                skinEquipadaId: schema.usuarios.skinEquipadaId,
            })
                .from(schema.gamificacionEstudiante)
                .innerJoin(schema.usuarios, eq(schema.gamificacionEstudiante.estudianteId, schema.usuarios.id))
                .where(eq(schema.gamificacionEstudiante.estudianteId, studentId))
                .limit(1);
        }

        // Get total points from puntos_log
        const pointsResult = await this.db.select({ total: schema.puntosLog.cantidad })
            .from(schema.puntosLog)
            .where(eq(schema.puntosLog.estudianteId, studentId));

        const totalPoints = pointsResult.reduce((sum, row) => sum + (row.total || 0), 0);

        // Get unlocked achievements
        const achievements = await this.db.select({
            logro: schema.logros,
            fechaDesbloqueo: schema.logrosDesbloqueados.fechaDesbloqueo
        })
            .from(schema.logrosDesbloqueados)
            .innerJoin(schema.logros, eq(schema.logrosDesbloqueados.logroId, schema.logros.id))
            .where(eq(schema.logrosDesbloqueados.estudianteId, studentId));

        // Get equipped skin details if any
        let skinEquipada = null;
        if (gamification[0].skinEquipadaId) {
            const [skin] = await this.db.select()
                .from(schema.skins)
                .where(eq(schema.skins.id, gamification[0].skinEquipadaId))
                .limit(1);
            skinEquipada = skin;
        }

        return {
            ...gamification[0],
            totalPoints,
            skinEquipada,
            achievements: achievements.map(a => ({
                ...a.logro,
                unlockedAt: a.fechaDesbloqueo
            }))
        };
    }

    async getGlobalLeaderboard(limit: number = 10) {
        const leaderboard = await this.db.select({
            studentId: schema.usuarios.id,
            name: schema.usuarios.nombre,
            avatar: schema.usuarios.avatar,
            xp: schema.gamificacionEstudiante.xpTotal,
            level: schema.gamificacionEstudiante.nivelActual,
            streak: schema.gamificacionEstudiante.rachaDias
        })
            .from(schema.usuarios)
            .leftJoin(schema.gamificacionEstudiante, eq(schema.gamificacionEstudiante.estudianteId, schema.usuarios.id))
            .where(and(
                eq(schema.usuarios.roleId, 3) // Only students (all plans can compete)
            ))
            .orderBy(desc(sql`COALESCE(${schema.gamificacionEstudiante.xpTotal}, 0)`))
            .limit(limit);

        // Map nulls for students without gamification records yet
        const mapped = leaderboard.map(player => ({
            ...player,
            xp: player.xp ?? 0,
            level: player.level ?? 1,
            streak: player.streak ?? 0
        }));

        // Re-sort after mapping to ensure 0 XP students are at the bottom
        return mapped.sort((a, b) => b.xp - a.xp);
    }

    async getModuleLeaderboard(moduleId: number, limit: number = 5) {
        const leaderboard = await this.db.select({
            studentId: schema.usuarios.id,
            name: schema.usuarios.nombre,
            avatar: schema.usuarios.avatar,
            xp: schema.gamificacionEstudiante.xpTotal,
            level: schema.gamificacionEstudiante.nivelActual,
        })
            .from(schema.usuarios)
            .innerJoin(schema.asignaciones, eq(schema.asignaciones.estudianteId, schema.usuarios.id))
            .leftJoin(schema.gamificacionEstudiante, eq(schema.gamificacionEstudiante.estudianteId, schema.usuarios.id))
            .where(and(
                eq(schema.asignaciones.moduloId, moduleId),
                eq(schema.usuarios.roleId, 3) // Only students
            ))
            .orderBy(desc(sql`COALESCE(${schema.gamificacionEstudiante.xpTotal}, 0)`))
            .limit(limit);

        return leaderboard.map((player, index) => ({
            ...player,
            rank: index + 1,
            xp: player.xp ?? 0,
            level: player.level ?? 1
        }));
    }

    async addXP(studentId: number, amount: number, reason: string) {
        // Delegate to gamification service
        return await this.gamificationService.awardXP(studentId, amount, reason);
    }

    // =========== FILE UPLOADS ===========
    // =========== SUBMISSIONS (URL BASED) ===========
    async submitHaEvidence(data: { studentId: number; plantillaHaId: number; archivosUrls: string[]; comentarioEstudiante: string }) {
        const { studentId, plantillaHaId, archivosUrls, comentarioEstudiante } = data;

        // Check if already submitted
        const existing = await this.db.select()
            .from(schema.entregasHa)
            .where(and(
                eq(schema.entregasHa.estudianteId, studentId),
                eq(schema.entregasHa.plantillaHaId, plantillaHaId)
            ))
            .limit(1);

        if (existing.length > 0) {
            console.log(`Student ${studentId} is updating HA evidence for template ${plantillaHaId}`);
            // Allow update by deleting old one
            await this.db.delete(schema.entregasHa)
                .where(and(
                    eq(schema.entregasHa.estudianteId, studentId),
                    eq(schema.entregasHa.plantillaHaId, plantillaHaId)
                ));
        }

        // Get levelId for this template
        const template = await this.db.select({ nivelId: schema.plantillasHa.nivelId })
            .from(schema.plantillasHa)
            .where(eq(schema.plantillasHa.id, plantillaHaId))
            .limit(1);

        const res = await this.db.insert(schema.entregasHa).values({
            estudianteId: studentId,
            plantillaHaId: plantillaHaId,
            archivosUrls: JSON.stringify(archivosUrls),
            comentarioEstudiante: comentarioEstudiante,
            validado: false
        }).returning();

        const resId = res[0].id;

        // Award XP immediately since HA is a single submission activity
        try {
            const student = await this.db.select({ planId: schema.usuarios.planId })
                .from(schema.usuarios)
                .where(eq(schema.usuarios.id, studentId))
                .limit(1);

            let baseXP = 100;
            const isOro = student.length > 0 && student[0].planId === 3;
            if (isOro) baseXP = Math.floor(baseXP * 1.2);

            if (existing.length === 0) {
                console.log(`[XP AWARD] Awarding 100 XP to student ${studentId} for HA completion`);
                await this.gamificationService.awardXP(studentId, baseXP, `HA completado${isOro ? ' (Bono Oro)' : ''}`);
                await this.gamificationService.updateMissionProgress(studentId, 'COMPLETE_ACTIVITY', 1);
            }
        } catch (error) {
            console.error('[GAMIFICATION ERROR] Error awarding XP for HA:', error.message);
        }

        // Trigger level progress update
        if (template.length > 0 && template[0].nivelId) {
            await this.updateLevelProgress(studentId, template[0].nivelId);
        }

        return { success: true, action: 'created', id: resId };
    }

    async submitRagProgress(data: { studentId: any; plantillaRagId: any; pasoIndice: number; archivoUrl: string; tipoArchivo: string }) {
        const studentId = parseInt(data.studentId);
        const plantillaRagId = parseInt(data.plantillaRagId);
        const { pasoIndice, archivoUrl, tipoArchivo } = data;

        console.log(`[RAG SUBMIT] Student: ${studentId}, Template: ${plantillaRagId}, Step: ${pasoIndice}`);

        // 1. Check if this specific step was already submitted
        const existingStep = await this.db.select()
            .from(schema.entregasRag)
            .where(and(
                eq(schema.entregasRag.estudianteId, studentId),
                eq(schema.entregasRag.plantillaRagId, plantillaRagId),
                eq(schema.entregasRag.pasoIndice, pasoIndice)
            ))
            .limit(1);

        if (existingStep.length > 0) {
            console.log(`[RAG SUBMIT] Updating existing step. Deleting old record.`);
            await this.db.delete(schema.entregasRag)
                .where(and(
                    eq(schema.entregasRag.estudianteId, studentId),
                    eq(schema.entregasRag.plantillaRagId, plantillaRagId),
                    eq(schema.entregasRag.pasoIndice, pasoIndice)
                ));
        }

        // 2. Get RAG template and levelId
        const rag = await this.db.select()
            .from(schema.plantillasRag)
            .where(eq(schema.plantillasRag.id, plantillaRagId))
            .limit(1);

        if (rag.length === 0) {
            console.error(`[RAG SUBMIT] ERROR: Template ${plantillaRagId} not found in DB`);
            throw new Error(`Plantilla RAG #${plantillaRagId} no encontrada`);
        }
        const nivelId = rag[0].nivelId;

        // 3. Pre-check: Is it already finished? (To avoid awarding XP twice)
        const submissionsBefore = await this.db.select().from(schema.entregasRag)
            .where(and(eq(schema.entregasRag.estudianteId, studentId), eq(schema.entregasRag.plantillaRagId, plantillaRagId)));

        // Safe parsing of pasosGuiados
        let pasos: any[] = [];
        try {
            const rawPasos = rag[0].pasosGuiados;
            pasos = typeof rawPasos === 'string' ? JSON.parse(rawPasos) : (Array.isArray(rawPasos) ? rawPasos : []);
        } catch (e) {
            console.error('Error parsing pasosGuiados:', e);
            pasos = [];
        }

        const submittedIndicesBefore = new Set(submissionsBefore.map(s => s.pasoIndice));
        const isAlreadyComplete = pasos.length > 0 && pasos.every((p, idx) => !p.requiereEntregable || submittedIndicesBefore.has(idx));

        // We removed the strict throw to allow updates after completion
        // but we use isAlreadyComplete in Section 5 below.

        // 4. Perform submission
        await this.db.insert(schema.entregasRag).values({
            estudianteId: studentId,
            plantillaRagId: plantillaRagId,
            pasoIndice: pasoIndice,
            archivoUrl: archivoUrl,
            tipoArchivo: tipoArchivo,
            feedbackAvatar: '¡Excelente trabajo! Entregable recibido.'
        });

        // 5. Post-check: Is it NOW complete?
        const submissionsAfter = await this.db.select().from(schema.entregasRag)
            .where(and(eq(schema.entregasRag.estudianteId, studentId), eq(schema.entregasRag.plantillaRagId, plantillaRagId)));
        const submittedIndicesAfter = new Set(submissionsAfter.map(s => s.pasoIndice));
        const isNowComplete = pasos.length > 0 && pasos.every((p, idx) => !p.requiereEntregable || submittedIndicesAfter.has(idx));

        if (isNowComplete && !isAlreadyComplete) {
            // Award XP only if this is the transition to completion
            try {
                const student = await this.db.select({ planId: schema.usuarios.planId })
                    .from(schema.usuarios)
                    .where(eq(schema.usuarios.id, studentId))
                    .limit(1);

                let baseXP = 100; // Standard RAG Reward
                const isOro = student.length > 0 && student[0].planId === 3;
                if (isOro) baseXP = Math.floor(baseXP * 1.2);

                console.log(`[XP AWARD] Awarding 100 XP to student ${studentId} for RAG completion`);
                await this.gamificationService.awardXP(studentId, baseXP, `RAG completado${isOro ? ' (Bono Oro)' : ''}`);
                await this.gamificationService.updateMissionProgress(studentId, 'COMPLETE_ACTIVITY', 1);
            } catch (error) {
                console.error('[GAMIFICATION ERROR] Error awarding XP for RAG:', error.message);
            }
        }

        // 6. Trigger level progress update
        if (nivelId) {
            await this.updateLevelProgress(studentId, nivelId);
        }

        return { success: true, pasoIndice, isCompleted: isNowComplete };
    }

    async getRagSubmissions(studentId: number, plantillaRagId: number) {
        return this.db.select()
            .from(schema.entregasRag)
            .where(and(
                eq(schema.entregasRag.estudianteId, studentId),
                eq(schema.entregasRag.plantillaRagId, plantillaRagId)
            ));
    }

    async getHaSubmissions(studentId: number, plantillaHaId: number) {
        return this.db.select()
            .from(schema.entregasHa)
            .where(and(
                eq(schema.entregasHa.estudianteId, studentId),
                eq(schema.entregasHa.plantillaHaId, plantillaHaId)
            ));
    }



    async getStudentCurriculum(studentId: number) {
        // 1. Basic user info
        const student = await this.db.select({
            id: schema.usuarios.id,
            nombre: schema.usuarios.nombre,
            email: schema.usuarios.email,
            avatar: schema.usuarios.avatar,
            planId: schema.usuarios.planId
        })
            .from(schema.usuarios)
            .where(eq(schema.usuarios.id, studentId))
            .limit(1);

        if (student.length === 0) throw new Error('Estudiante no encontrado');

        // 2. Gamification Stats
        const stats = await this.getGamificationStats(studentId);

        // 0. Get User for cursoId
        const [userData] = await this.db.select({ cursoId: schema.usuarios.cursoId, ultimaConexion: schema.usuarios.ultimaConexion })
            .from(schema.usuarios)
            .where(eq(schema.usuarios.id, studentId))
            .limit(1);

        // 3.1 Direct assignments
        const directAssignments = await this.db.select({
            id: schema.modulos.id,
            nombreModulo: schema.modulos.nombreModulo,
            duracionDias: schema.modulos.duracionDias
        })
            .from(schema.asignaciones)
            .innerJoin(schema.modulos, eq(schema.asignaciones.moduloId, schema.modulos.id))
            .where(eq(schema.asignaciones.estudianteId, studentId));

        // 3.2 Course assignments
        let courseAssignments: any[] = [];
        if (userData?.cursoId) {
            courseAssignments = await this.db.select({
                id: schema.modulos.id,
                nombreModulo: schema.modulos.nombreModulo,
                duracionDias: schema.modulos.duracionDias,
                type: sql<string>`'standard'`
            })
                .from(schema.modulos)
                .where(eq(schema.modulos.cursoId, userData.cursoId));
        }

        // 3.3 Institutional Curriculum (New V2 Sections & Modules)
        let institutionalSections: any[] = [];
        if (userData?.cursoId) {
            institutionalSections = await this.db.select({
                id: schema.seccionesInst.id,
                nombreModulo: schema.seccionesInst.nombre,
                type: sql<string>`'institutional'`
            })
                .from(schema.seccionesInst)
                .where(eq(schema.seccionesInst.cursoId, userData.cursoId));
        }

        // Combine and deduplicate
        const modulesMap = new Map<string, any>(); // Key by type-id
        
        courseAssignments.forEach(m => modulesMap.set(`std-${m.id}`, m));
        directAssignments.forEach(m => modulesMap.set(`std-${m.id}`, { ...m, type: 'standard' }));
        institutionalSections.forEach(s => modulesMap.set(`inst-${s.id}`, s));
        
        const moduleAssignments = Array.from(modulesMap.values());

        const modulesDetailed = await Promise.all(moduleAssignments.map(async (mod) => {
            if (mod.type === 'institutional') {
                // For Institutional sections, "levels" are modulos_inst
                const lessons = await this.db.select({ 
                    id: schema.modulosInst.id,
                    titulo: schema.modulosInst.titulo,
                    descripcion: schema.modulosInst.descripcion
                })
                    .from(schema.modulosInst)
                    .where(eq(schema.modulosInst.seccionId, mod.id));

                // TODO: Add institutional progress tracking join here if needed
                return {
                    id: mod.id,
                    nombreModulo: mod.nombreModulo,
                    duracionDias: 0,
                    totalLevels: lessons.length,
                    completedLevels: 0, // Implement progressive tracking later
                    percentage: 0,
                    levels: lessons,
                    type: 'institutional'
                };
            }

            // Standard Module logic (Existing)
            const levels = await this.db.select({ 
                id: schema.niveles.id,
                titulo: schema.niveles.tituloNivel,
                descripcion: schema.niveles.tituloNivel // fallback
            })
                .from(schema.niveles)
                .where(eq(schema.niveles.moduloId, mod.id));

            const levelIds = levels.map(l => l.id);

            let completedLevels = 0;
            if (levelIds.length > 0) {
                const progress = await this.db.select()
                    .from(schema.progresoNiveles)
                    .where(and(
                        eq(schema.progresoNiveles.estudianteId, studentId),
                        sql`${schema.progresoNiveles.nivelId} IN (${sql.join(levelIds, sql`, `)})`,
                        eq(schema.progresoNiveles.completado, true)
                    ));
                completedLevels = progress.length;
            }

            return {
                id: mod.id,
                nombreModulo: mod.nombreModulo,
                duracionDias: mod.duracionDias,
                totalLevels: levels.length,
                completedLevels,
                percentage: levels.length > 0 ? Math.round((completedLevels / levels.length) * 100) : 0,
                levels,
                type: 'standard'
            };
        }));

        // 4. Points History (Top 20)
        const pointsHistory = await this.db.select()
            .from(schema.puntosLog)
            .where(eq(schema.puntosLog.estudianteId, studentId))
            .orderBy(desc(schema.puntosLog.fechaObtencion))
            .limit(20);

        // 5. Recent Submissions (RAG & HA)
        const recentRag = await this.db.select({
            id: schema.entregasRag.id,
            tipo: sql`'RAG'`,
            titulo: schema.plantillasRag.nombreActividad,
            fecha: schema.entregasRag.fechaSubida,
            grade: schema.entregasRag.calificacionNumerica,
            feedback: schema.entregasRag.feedbackProfe
        })
            .from(schema.entregasRag)
            .innerJoin(schema.plantillasRag, eq(schema.entregasRag.plantillaRagId, schema.plantillasRag.id))
            .where(eq(schema.entregasRag.estudianteId, studentId))
            .orderBy(desc(schema.entregasRag.fechaSubida))
            .limit(5);

        const recentHa = await this.db.select({
            id: schema.entregasHa.id,
            tipo: sql`'HA'`,
            titulo: schema.plantillasHa.fase,
            fecha: schema.entregasHa.fechaSubida,
            grade: schema.entregasHa.calificacionNumerica,
            feedback: schema.entregasHa.feedbackProfe
        })
            .from(schema.entregasHa)
            .innerJoin(schema.plantillasHa, eq(schema.entregasHa.plantillaHaId, schema.plantillasHa.id))
            .where(eq(schema.entregasHa.estudianteId, studentId))
            .orderBy(desc(schema.entregasHa.fechaSubida))
            .limit(5);

        const activity = [...recentRag, ...recentHa].sort((a, b) => {
            const dateA = a.fecha ? new Date(a.fecha).getTime() : 0;
            const dateB = b.fecha ? new Date(b.fecha).getTime() : 0;
            return dateB - dateA;
        }).slice(0, 10);

        return {
            student: student[0],
            stats,
            modules: modulesDetailed,
            pointsHistory,
            activity
        };
    }
}
