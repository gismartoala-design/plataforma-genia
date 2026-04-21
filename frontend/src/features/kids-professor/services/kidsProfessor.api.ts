import apiClient from "@/services/api.client";

export interface KidsTemplate {
    id?: number;
    nivelId?: number;
    titulo: string;
    descripcion?: string;
    tipo?: string;
    videoUrl?: string;
    bloqueado?: boolean;
    actividades: any;
    configuracion: any;
}

const kidsProfessorApi = {
    /**
     * Obtener los módulos del profesor kids
     */
    getModules: async (professorId: string): Promise<any[]> => {
        return apiClient.get(`/api/modules/by-professor/${professorId}`);
    },

    /**
     * Obtener los datos de un módulo por ID
     */
    getModuleById: async (moduleId: number | string): Promise<any> => {
        return apiClient.get(`/api/modules/${moduleId}`);
    },

    createModule: async (payload: { title: string, description: string, professorId: string, duracionDias?: number, cursoId?: number }): Promise<any> => {
        return apiClient.post('/api/modules', {
            nombreModulo: payload.title,
            descripcion: payload.description,
            profesorId: Number(payload.professorId),
            cursoId: payload.cursoId,
            duracionDias: payload.duracionDias || 0,
        });
    },

    /**
     * Actualizar un módulo
     */
    updateModule: async (moduleId: number, payload: { title?: string, description?: string, duration?: number, bloqueado?: boolean }): Promise<any> => {
        return apiClient.patch(`/api/modules/${moduleId}`, {
            nombreModulo: payload.title,
            descripcion: payload.description,
            duracionDias: payload.duration,
            bloqueado: payload.bloqueado
        });
    },

    /**
     * Actualizar un nivel
     */
    updateLevel: async (levelId: number, payload: { tituloNivel?: string, orden?: number, bloqueado?: boolean }): Promise<any> => {
        return apiClient.patch(`/api/professor/levels/${levelId}`, payload);
    },

    /**
     * Obtener niveles de un módulo
     */
    getModuleLevels: async (moduleId: string): Promise<any[]> => {
        return apiClient.get(`/api/professor/modules/${moduleId}/levels`);
    },

    /**
     * Crear un nuevo nivel
     */
    createLevel: async (moduleId: string, payload: { tituloNivel: string, orden: number }): Promise<any> => {
        return apiClient.post(`/api/professor/modules/${moduleId}/levels`, payload);
    },

    /**
     * Eliminar un nivel
     */
    deleteLevel: async (moduleId: string | number, levelId: number): Promise<any> => {
        return apiClient.delete(`/api/professor/modules/${moduleId}/levels/${levelId}`);
    },

    /**
     * Gestión de Contenidos (Extras)
     */
    createContent: async (levelId: number, payload: { tipo: string, urlRecurso: string, orden?: number }): Promise<any> => {
        return apiClient.post(`/api/professor/levels/${levelId}/contents`, payload);
    },

    deleteContent: async (contentId: number): Promise<any> => {
        return apiClient.delete(`/api/professor/contents/${contentId}`);
    },

    getContents: async (levelId: number): Promise<any[]> => {
        return apiClient.get(`/api/professor/levels/${levelId}/contents`);
    },

    /**
     * Obtener plantilla kids de un nivel por tipo
     */
    getTemplateByType: async (nivelId: number, tipo: string): Promise<KidsTemplate | null> => {
        const templates = await apiClient.get<KidsTemplate[]>(`/api/kids/levels/${nivelId}/templates`);
        return templates.find(t => t.tipo === tipo) || null;
    },

    /**
     * Guardar plantilla kids con tipo especificado
     */
    saveTypedTemplate: async (nivelId: number, tipo: string, data: Partial<KidsTemplate>): Promise<KidsTemplate> => {
        const existing = await apiClient.get<KidsTemplate[]>(`/api/kids/levels/${nivelId}/templates`)
            .then(res => res.find(t => t.tipo === tipo))
            .catch(() => null);

        if (existing) {
            return apiClient.put(`/api/kids/templates/${existing.id}`, { ...data, tipo });
        } else {
            return apiClient.post(`/api/kids/templates`, { ...data, nivelId, tipo });
        }
    },

    /**
     * Obtener plantilla kids de un nivel (Legacy/General)
     */
    getTemplateByLevel: async (nivelId: number): Promise<KidsTemplate> => {
        return apiClient.get(`/api/kids/levels/${nivelId}/template`);
    },

    /**
     * Guardar/Actualizar plantilla kids (Legacy/General)
     */
    saveTemplate: async (nivelId: number, data: Partial<KidsTemplate>): Promise<KidsTemplate> => {
        const existing = await apiClient.get<KidsTemplate | null>(`/api/kids/levels/${nivelId}/template`).catch(() => null);

        if (existing) {
            return apiClient.put(`/api/kids/templates/${existing.id}`, data);
        } else {
            return apiClient.post(`/api/kids/templates`, { ...data, nivelId });
        }
    },

    /**
     * Actualizar una plantilla existente
     */
    updateTemplate: async (id: number, data: Partial<KidsTemplate>): Promise<KidsTemplate> => {
        return apiClient.put(`/api/kids/templates/${id}`, data);
    },

    /**
     * Eliminar plantilla
     */
    deleteTemplate: async (id: number): Promise<any> => {
        return apiClient.delete(`/api/kids/templates/${id}`);
    },

    /**
     * Subir archivo al servidor
     */
    uploadFile: async (file: File, professorId: string = '1'): Promise<{ url: string }> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('profesorId', professorId); 
        return apiClient.post<{ url: string }>('/api/professor/upload', formData);
    }
};

export default kidsProfessorApi;
