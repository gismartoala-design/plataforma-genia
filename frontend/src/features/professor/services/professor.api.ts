import apiClient from '@/services/api.client';

/**
 * Professor API Service
 * Gestión de módulos, estudiantes y contenido del profesor
 */

export interface ProfessorModule {
  id: number;
  nombreModulo: string;
  duracionDias: number;
  students?: any[];
  levels?: any[];
}

export interface LatamCompania {
  id: number;
  nombre: string;
  especializacion: string;
  descripcion: string;
  competencias: string[];
  proyectos: string[];
}

export interface ProfessorCourse {
  id: number;
  nombre: string;
  institucionId?: number;
  profesorId: number;
  companiaId?: number;
  fechaCreacion: string;
  compania?: LatamCompania;
}

export interface CreateStudentPayload {
  name: string;
  email: string;
  password: string;
  moduleId: string;
}

export interface CreateLevelPayload {
  tituloNivel: string;
  descripcion?: string;
  orden: number;
  bloqueadoManual?: boolean;
  diasParaDesbloquear?: number;
  googleMeetUrl?: string;
  googleCalendarUrl?: string;
}

export interface CreateContentPayload {
  tipo: string;
  urlRecurso: string;
  tituloEjercicio?: string;
  descripcionEjercicio?: string;
  codigoInicial?: string;
  codigoEsperado?: string;
  lenguaje?: string;
}

export interface CreateModulePayload {
  title: string;
  description: string;
  professorId: string;
  profesorId?: number;
  cursoId?: number;
  nombreModulo?: string;
}

export const professorApi = {
  /**
   * Crear un nuevo módulo
   */
  async createModule(payload: CreateModulePayload): Promise<any> {
    return apiClient.post<any>('/api/modules', payload);
  },
  /**
   * Obtener los módulos asignados al profesor
   */
  async getModules(professorId: string): Promise<ProfessorModule[]> {
    return apiClient.get<ProfessorModule[]>(`/api/professor/${professorId}/modules`);
  },

  /**
   * Actualizar un módulo (metadatos)
   */
  async updateModule(moduleId: number, payload: Partial<CreateModulePayload>): Promise<any> {
    return apiClient.patch<any>(`/api/modules/${moduleId}`, payload);
  },

  /**
   * Eliminar un módulo y todo su contenido
   */
  async deleteModule(moduleId: number): Promise<void> {
    return apiClient.delete<void>(`/api/modules/${moduleId}`);
  },

  /**
   * Asignar un estudiante existente a un módulo
   */
  async assignStudentToModule(moduleId: number, studentId: number): Promise<any> {
    return apiClient.post(`/api/professor/modules/${moduleId}/students/${studentId}`, {});
  },

  /**
   * Desasignar un estudiante de un módulo
   */
  async unassignStudentFromModule(moduleId: number, studentId: number): Promise<any> {
    return apiClient.delete(`/api/professor/modules/${moduleId}/students/${studentId}`);
  },

  /**
   * Crear un nuevo estudiante y asignarlo a un módulo
   */
  async createStudent(payload: CreateStudentPayload): Promise<any> {
    return apiClient.post<any>('/api/professor/students', payload);
  },

  /**
   * Obtener información de un módulo específico
   */
  async getModule(moduleId: string): Promise<any> {
    return apiClient.get<any>(`/api/modules/${moduleId}`);
  },

  /**
   * Obtener niveles de un módulo
   */
  async getModuleLevels(moduleId: string): Promise<any[]> {
    return apiClient.get<any[]>(`/api/professor/modules/${moduleId}/levels`);
  },

  /**
   * Reordenar niveles
   */
  async reorderLevels(moduleId: string, orderedLevelIds: number[]): Promise<any> {
    return apiClient.patch<any>(`/api/professor/modules/${moduleId}/levels/reorder`, { orderedLevelIds });
  },

  /**
   * Actualizar un nivel
   */
  async updateLevel(levelId: number, payload: Partial<CreateLevelPayload>): Promise<any> {
    return apiClient.put<any>(`/api/professor/levels/${levelId}`, payload);
  },

  /**
   * Crear un nuevo nivel en un módulo
   */
  async createLevel(moduleId: string, payload: CreateLevelPayload): Promise<any> {
    return apiClient.post<any>(`/api/professor/modules/${moduleId}/levels`, payload);
  },

  /**
   * Eliminar un nivel
   */
  async deleteLevel(levelId: number): Promise<void> {
    return apiClient.delete<void>(`/api/professor/levels/${levelId}`);
  },

  /**
   * Crear contenido en un nivel
   */
  async createContent(levelId: number, payload: CreateContentPayload & { orden?: number }): Promise<any> {
    return apiClient.post<any>(`/api/professor/levels/${levelId}/contents`, payload);
  },

  /**
   * Actualizar contenido
   */
  async updateContent(contentId: number, payload: Partial<CreateContentPayload> & { orden?: number }): Promise<any> {
    return apiClient.patch<any>(`/api/professor/contents/${contentId}`, payload);
  },

  /**
   * Reordenar contenidos de un nivel
   */
  async reorderContents(levelId: number, orderedContentIds: number[]): Promise<any> {
    return apiClient.patch<any>(`/api/professor/levels/${levelId}/contents/reorder`, { orderedContentIds });
  },

  /**
   * Eliminar contenido
   */
  async deleteContent(contentId: number): Promise<void> {
    return apiClient.delete<void>(`/api/professor/contents/${contentId}`);
  },

  /**
   * Obtener recursos del profesor
   */
  async getResources(): Promise<any[]> {
    return apiClient.get<any[]>('/api/professor/resources');
  },

  /**
   * Subir archivo
   */
  async uploadFile(formData: FormData): Promise<any> {
    // Special case for file upload - use fetch directly
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/professor/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Error al subir archivo');
    }

    return response.json();
  },

  /**
   * Eliminar un recurso del sistema de archivos
   */
  async deleteResource(id: number): Promise<any> {
    return apiClient.delete<any>(`/api/professor/resources/${id}`);
  },

  /**
   * Eliminar una carpeta y todo su contenido
   */
  async deleteFolder(path: string): Promise<any> {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/professor/folders?path=${encodeURIComponent(path)}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Error al eliminar carpeta');
    }

    return response.json();
  },

  // Attendance
  async getAttendance(levelId: number): Promise<any[]> {
    return apiClient.get(`/api/professor/levels/${levelId}/attendance`);
  },

  async saveAttendance(levelId: number, professorId: number, records: { estudianteId: number; asistio: boolean }[]): Promise<any> {
    return apiClient.post(`/api/professor/levels/${levelId}/attendance`, {
      professorId,
      records
    });
  },

  // RAG Templates
  async saveRagTemplate(levelId: number, data: any): Promise<any> {
    return apiClient.post(`/api/professor/levels/${levelId}/rag`, data);
  },

  async getRagTemplate(levelId: number): Promise<any> {
    return apiClient.get(`/api/professor/levels/${levelId}/rag`);
  },

  // HA Templates
  async saveHaTemplate(levelId: number, data: any): Promise<any> {
    return apiClient.post(`/api/professor/levels/${levelId}/ha`, data);
  },

  async getHaTemplate(levelId: number): Promise<any> {
    return apiClient.get(`/api/professor/levels/${levelId}/ha`);
  },

  // PIM Templates
  async getPimTemplate(levelId: number): Promise<any> {
    return apiClient.get(`/api/professor/levels/${levelId}/pim`);
  },

  async savePimTemplate(levelId: number, data: any): Promise<any> {
    return apiClient.post(`/api/professor/levels/${levelId}/pim`, data);
  },

  // Grading
  async getSubmissions(): Promise<{ rag: any[]; ha: any[]; bd: any[]; it: any[]; pic: any[] }> {
    return apiClient.get('/api/professor/grading/submissions');
  },

  async gradeSubmission(id: number, data: { type: 'rag' | 'ha' | 'bd' | 'it' | 'pic'; grade: number; feedback: string }): Promise<any> {
    return apiClient.post(`/api/professor/grading/submissions/${id}/grade`, data);
  },

  // --- LATAM & COURSES ---
  async getLatamCompanies(): Promise<LatamCompania[]> {
    return apiClient.get<LatamCompania[]>('/api/professor/latam/companies');
  },

  async getProfessorCourses(professorId: string): Promise<ProfessorCourse[]> {
    return apiClient.get<ProfessorCourse[]>(`/api/professor/${professorId}/courses`);
  },

  async getLatamStudents(professorId: string): Promise<any[]> {
    return apiClient.get<any[]>(`/api/professor/${professorId}/latam/students`);
  },

  async createCourse(payload: { professorId: number; nombre: string; companiaId?: number; institucionId?: number }): Promise<ProfessorCourse> {
    return apiClient.post<ProfessorCourse>('/api/professor/courses', payload);
  },

  async updateCourse(id: number, payload: any): Promise<ProfessorCourse> {
    return apiClient.patch<ProfessorCourse>(`/api/professor/courses/${id}`, payload);
  },

  async deleteCourse(id: number): Promise<void> {
    return apiClient.delete<void>(`/api/professor/courses/${id}`);
  },

  async linkGoogleAccount(professorId: string, email: string): Promise<any> {
    // This will be a PATCH to the user profile
    return apiClient.patch(`/api/users/${professorId}`, { googleEmail: email });
  },
  
  /**
   * Duplicar un módulo y su contenido (niveles, plantillas, etc.)
   */
  async duplicateModule(moduleId: number, newName: string, targetProfessorId?: number): Promise<any> {
    return apiClient.post(`/api/modules/${moduleId}/duplicate`, { newName, targetProfessorId });
  },
};

export default professorApi;
