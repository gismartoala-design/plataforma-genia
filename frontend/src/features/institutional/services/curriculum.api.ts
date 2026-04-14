import apiClient from '@/services/api.client';

export interface SectionInst {
  id: number;
  cursoId: number;
  nombre: string;
  descripcion?: string;
  orden: number;
  activo: boolean;
  fechaCreacion: string;
}

export interface ModuloInst {
  id: number;
  seccionId: number;
  cursoId: number;
  profesorId?: number;
  titulo: string;
  descripcion?: string;
  orden: number;
  tipo: string;
  contenido: any;
  activo: boolean;
  bloqueado: boolean;
  xpRecompensa: number;
  fechaLimite?: string;
  fechaCreacion: string;
}

// Grades for Missions (4to EGB to 3ro BGU)
export const MISSION_GRADES = [
    "4to EGB", "5to EGB", "6to EGB", "7mo EGB", "8vo EGB", "9no EGB", "10mo EGB",
    "1ro Bachillerato", "2do Bachillerato", "3ro Bachillerato"
];

export interface MissionMoment {
    id: string;
    title: string;
    time_minutes: number;
    isVisible?: boolean;
    config: {
        interaction_type: string;
        input_mode?: string[];
        affects_kpi?: boolean;
        max_attempts?: number | null;
        auto_feedback?: boolean;
        [key: string]: any;
    };
    teacher?: {
        intention: string;
        pedagogy: string[];
        script: string;
        observation: string;
        common_errors: string[];
        intervention: string;
        evaluation?: string;
    };
    student: {
        content?: string;
        context?: string;
        question?: string;
        instruction?: string;
        concept?: string;
        activity?: string;
        correct_answer?: string | number | boolean;
        options?: any[];
        items?: string[];
        [key: string]: any;
    };
    logic?: any;
}

export const institutionalCurriculumApi = {
  // --- SECCIONES ---
  async getSections(courseId: number): Promise<SectionInst[]> {
    return apiClient.get<SectionInst[]>(`/api/institution-curriculum/sections/course/${courseId}`);
  },

  async getCourse(courseId: number): Promise<any> {
    return apiClient.get<any>(`/api/institution-curriculum/course/${courseId}`);
  },

  async createSection(payload: { cursoId: number; nombre: string; orden: number; descripcion?: string }): Promise<SectionInst> {
    return apiClient.post<SectionInst>('/api/institution-curriculum/sections', payload);
  },

  async updateSection(id: number, payload: Partial<SectionInst>): Promise<SectionInst> {
    return apiClient.put<SectionInst>(`/api/institution-curriculum/sections/${id}`, payload);
  },

  async deleteSection(id: number): Promise<SectionInst> {
    return apiClient.delete<SectionInst>(`/api/institution-curriculum/sections/${id}`);
  },

  // --- MÓDULOS ---
  async getModulesBySection(sectionId: number): Promise<ModuloInst[]> {
    return apiClient.get<ModuloInst[]>(`/api/institution-curriculum/modules/section/${sectionId}`);
  },

  async getModulesByCourse(courseId: number): Promise<ModuloInst[]> {
    return apiClient.get<ModuloInst[]>(`/api/institution-curriculum/modules/course/${courseId}`);
  },

  async createModule(payload: {
    seccionId: number;
    cursoId: number;
    titulo: string;
    tipo: string;
    contenido?: any;
    profesorId?: number;
    orden: number;
  }): Promise<ModuloInst> {
    return apiClient.post<ModuloInst>('/api/institution-curriculum/modules', payload);
  },

  async updateModule(id: number, payload: Partial<ModuloInst>): Promise<ModuloInst> {
    return apiClient.put<ModuloInst>(`/api/institution-curriculum/modules/${id}`, payload);
  },

  async deleteModule(id: number): Promise<ModuloInst> {
    return apiClient.delete<ModuloInst>(`/api/institution-curriculum/modules/${id}`);
  },

  // --- PROGRESO ---
  async updateProgress(estudianteId: number, moduloInstId: number, data: any): Promise<any> {
    return apiClient.patch('/api/institution-curriculum/progress', { estudianteId, moduloInstId, data });
  },

  async getStudentProgress(estudianteId: number, courseId: number): Promise<any[]> {
    return apiClient.get(`/api/institution-curriculum/student/${estudianteId}/course/${courseId}/progress`);
  },

  async reorderSections(orderedIds: number[]): Promise<any> {
    return apiClient.patch('/api/institution-curriculum/sections/reorder', { orderedIds });
  },

  async reorderModules(orderedIds: number[]): Promise<any> {
    return apiClient.patch('/api/institution-curriculum/modules/reorder', { orderedIds });
  }
};
