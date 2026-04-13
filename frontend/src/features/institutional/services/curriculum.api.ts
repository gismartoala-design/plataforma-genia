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
