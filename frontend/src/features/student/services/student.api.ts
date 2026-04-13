import apiClient from '@/services/api.client';
import type { LevelProgressSnapshot } from '../types/progress.types';

/**
 * Student API Service
 * Gestión de módulos, progreso y contenido del estudiante
 */

export interface StudentModule {
  id: number;
  nombreModulo: string;
  duracionDias: number;
  levels?: StudentLevel[];
  levelCount?: number;
  progressPercentage?: number;
  categoria?: string;
  zoneIndex?: number;
  bloqueado?: boolean;
}

export interface StudentLevel {
  id: number;
  orden: number;
  titulo: string;
  descripcion: string;
  type?: string;
  bloqueado?: boolean;
}

export interface StudentProgress {
  totalPoints: number;
  completedLevels: number;
  achievements: string[];
}

export interface LevelContent {
  id: number;
  titulo: string;
  tipoContenido: string;
  contenido: string;
  orden: number;
}

export interface LeaderboardEntry {
  studentId: number;
  name: string;
  xp: number;
  level: number;
  streak: number;
  avatar?: string;
}

export const studentApi = {
  /**
   * Obtener los módulos asignados al estudiante
   */
  async getModules(studentId: string): Promise<{ cursoNombre: string; modules: StudentModule[] }> {
    return apiClient.get<{ cursoNombre: string; modules: StudentModule[] }>(`/api/student/${studentId}/modules`);
  },

  /**
   * Obtener el progreso general del estudiante
   */
  async getProgress(studentId: string): Promise<StudentProgress> {
    return apiClient.get<StudentProgress>(`/api/student/${studentId}/progress`);
  },

  /**
   * Obtener el progreso de un módulo específico
   */
  async getModuleProgress(studentId: string, moduleId: number): Promise<LevelProgressSnapshot[]> {
    return apiClient.get<LevelProgressSnapshot[]>(`/api/student/${studentId}/module/${moduleId}/progress`);
  },

  /**
   * Obtener estado de asistencia para un nivel
   */
  async getAttendanceStatus(studentId: number, levelId: number): Promise<{ asistio: boolean, fecha: string | null }> {
    return apiClient.get(`/api/student/${studentId}/level/${levelId}/attendance`);
  },

  /**
   * Obtener estado detallado de completitud de un nivel (asistencia, RAG, HA)
   */
  async getDetailedLevelStatus(studentId: number, levelId: number): Promise<any> {
    return apiClient.get(`/api/student/${studentId}/level/${levelId}/detailed-status`);
  },

  /**
   * Obtener el contenido de un nivel específico
   */
  async getLevelContents(levelId: string): Promise<LevelContent[]> {
    return apiClient.get<LevelContent[]>(`/api/student/level/${levelId}/contents`);
  },

  /**
   * Obtener información de usuario
   */
  async getUserInfo(userId: string): Promise<any> {
    return apiClient.get<any>(`/api/usuarios/${userId}`);
  },

  /**
   * Obtener plantilla RAG de un nivel
   */
  async getRagTemplate(levelId: number): Promise<any> {
    return apiClient.get<any>(`/api/professor/levels/${levelId}/rag`);
  },

  /**
   * Obtener plantilla HA de un nivel
   */
  async getHaTemplate(levelId: number): Promise<any> {
    return apiClient.get<any>(`/api/professor/levels/${levelId}/ha`);
  },

  /**
   * Subir evidencia (archivo general)
   */
  async uploadEvidence(file: File): Promise<{ url: string; filename: string; mimetype: string }> {
    const formData = new FormData();
    formData.append('file', file);
    // Note: apiClient might automatically set Content-Type for FormData, but standard fetch needs it removed to let browser set boundary.
    // If apiClient is a wrapper (likely axios or custom fetch), we need to ensure correct handling.
    // Assuming standard fetch wrapper where we can pass body directly.
    return apiClient.post<{ url: string; filename: string; mimetype: string }>('/api/student/upload', formData);
  },

  /**
   * Registrar progreso RAG (con entregable)
   */
  async submitRagProgress(data: { studentId: number; plantillaRagId: number; pasoIndice: number; archivoUrl: string; tipoArchivo: string }) {
    return apiClient.post('/api/student/rag/submit', data);
  },

  /**
   * Registrar entrega HA
   */
  async submitHaEvidence(data: { studentId: number; plantillaHaId: number; archivosUrls: string[]; comentarioEstudiante: string }) {
    return apiClient.post('/api/student/ha/submit', data);
  },

  /**
   * Obtener misiones del estudiante
   */
  async getMissions(studentId: number): Promise<any[]> {
    return apiClient.get(`/api/student/${studentId}/missions`);
  },

  /**
   * Obtener ranking global
   */
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    return apiClient.get<any[]>('/api/student/leaderboard/global');
  },

  /**
   * Obtener estadísticas de gamificación
   */
  async getGamificationStats(studentId: number): Promise<any> {
    return apiClient.get<any>(`/api/student/${studentId}/gamification`);
  },

  /**
   * Realizar el check-in diario para obtener misiones y XP
   */
  async dailyCheckin(studentId: number): Promise<{ success: boolean; xpAwarded: number; missionTitle?: string }> {
    return apiClient.post<{ success: boolean; xpAwarded: number; missionTitle?: string }>(`/api/student/${studentId}/gamification/checkin`, {});
  },

  /**
   * Obtener todas las misiones con progreso del estudiante
   */
  async getAllMissions(studentId: number): Promise<any[]> {
    return apiClient.get<any[]>(`/api/student/${studentId}/gamification/missions`);
  },

  /**
   * Reclamar recompensa de misión completada
   */
  async claimMissionReward(studentId: number, missionId: number): Promise<{ success: boolean; xpAwarded: number }> {
    return apiClient.post<{ success: boolean; xpAwarded: number }>(`/api/student/${studentId}/gamification/missions/${missionId}/claim`, {});
  },

  /**
   * Obtener logros desbloqueados del estudiante
   */
  async getAchievements(studentId: number): Promise<any[]> {
    return apiClient.get<any[]>(`/api/student/${studentId}/gamification/achievements`);
  },

  /**
   * Obtener entregas previas RAG
   */
  async getRagSubmissions(studentId: number, templateId: number): Promise<any[]> {
    return apiClient.get<any[]>(`/api/student/${studentId}/rag/${templateId}/submissions`);
  },

  /**
   * Obtener entregas previas HA
   */
  async getHaSubmissions(studentId: number, templateId: number): Promise<any[]> {
    return apiClient.get<any[]>(`/api/student/${studentId}/ha/${templateId}/submissions`);
  },

  /**
   * Obtener currículo digital completo del estudiante
   */
  async getCurriculum(studentId: number): Promise<any> {
    return apiClient.get<any>(`/api/student/${studentId}/curriculum`);
  },

  /**
   * Obtener plantilla PIM de un nivel
   */
  async getPimTemplate(levelId: number): Promise<any> {
    return apiClient.get<any>(`/api/professor/levels/${levelId}/pim`);
  },

  /**
   * Guardar plantilla PIM (para profesor)
   */
  async savePimTemplate(levelId: number, data: any): Promise<any> {
    return apiClient.post<any>(`/api/professor/levels/${levelId}/pim`, data);
  },

  /**
   * Registrar entrega PIM
   */
  async submitPimEvidence(data: { studentId: number; plantillaPimId: number; archivoUrl: string; comentarioEstudiante: string }) {
    return apiClient.post('/api/student/pim/submit', data);
  },

  /**
   * Obtener entregas previas PIM
   */
  async getPimSubmissions(studentId: number, templateId: number): Promise<any[]> {
    return apiClient.get<any[]>(`/api/student/${studentId}/pim/${templateId}/submissions`);
  },

  /**
   * Obtener plantilla Kids de un nivel por tipo
   */
  async getKidsTemplate(levelId: number, tipo?: string): Promise<any> {
    const query = tipo ? `?tipo=${tipo}` : '';
    return apiClient.get<any>(`/api/kids/levels/${levelId}/template${query}`);
  },

  /**
   * Registrar resultado de actividad Kids
   */
  async submitKidsResult(data: { estudianteId: number; plantillaKidsId: number; resultados: any[]; calificacionNumerica: number }) {
    return apiClient.post('/api/kids/submit', data);
  }
};

export default studentApi;
