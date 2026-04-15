import { apiClient } from './api.client';

export const institutionApi = {
    getAllInstitutions: async () => {
        return apiClient.get('/api/instituciones');
    },

    createInstitution: async (data: any) => {
        return apiClient.post('/api/instituciones', data);
    },

    getCourses: async (institutionId: number) => {
        return apiClient.get(`/api/instituciones/${institutionId}/cursos`);
    },

    createCourse: async (data: any) => {
        return apiClient.post('/api/instituciones/cursos', data);
    },

    getCourseModules: async (courseId: number) => {
        return apiClient.get(`/api/instituciones/cursos/${courseId}/modulos`);
    },

    createModule: async (data: { nombreModulo: string; duracionDias: number; cursoId: number; profesorId?: number }) => {
        return apiClient.post('/api/instituciones/modulos', data);
    },

    deleteModule: async (moduleId: number) => {
        return apiClient.delete(`/api/instituciones/modulos/${moduleId}`);
    },

    deleteCourse: async (courseId: number) => {
        return apiClient.delete(`/api/instituciones/cursos/${courseId}`);
    },

    getInstitutionalUsers: async (institutionId: number) => {
        return apiClient.get(`/api/instituciones/${institutionId}/usuarios`);
    },

    assignModuleToCourse: async (moduleId: number, courseId: number) => {
        return apiClient.put(`/api/instituciones/modulos/${moduleId}/curso/${courseId}`, {});
    },

    createUser: async (data: any) => {
        return apiClient.post('/api/instituciones/usuarios', data);
    },

    updateUser: async (userId: number, data: any) => {
        return apiClient.put(`/api/instituciones/usuarios/${userId}`, data);
    },
    updateModule: async (moduleId: number, data: any) => {
        return apiClient.put(`/api/instituciones/modulos/${moduleId}`, data);
    },

    // --- CURRICULUM HIERARCHY ---
    getCourseSections: async (courseId: number) => {
        return apiClient.get(`/api/institution-curriculum/sections/course/${courseId}`);
    },
    createSection: async (data: { nombre: string; cursoId: number; orden?: number }) => {
        return apiClient.post('/api/institution-curriculum/sections', data);
    },
    getSectionModules: async (sectionId: number) => {
        return apiClient.get(`/api/institution-curriculum/modules/section/${sectionId}`);
    },

    // --- ENHANCED CLONING ---
    cloneInstitution: async (id: number, data: any) => {
        return apiClient.post(`/api/institutional-cloning/clone/${id}`, data);
    },
    cloneModule: async (moduleId: number, targetSectionId?: number) => {
        return apiClient.post(`/api/institutional-cloning/module/${moduleId}/clone`, { targetSectionId });
    },
    aiGenerateStructure: async (data: { institucionId: number; text: string }) => {
        return apiClient.post('/api/institution-curriculum/ai-generate', data);
    },

    getUserCourses: async (userId: number) => {
        return apiClient.get(`/api/instituciones/usuarios/${userId}/cursos`);
    },

    syncUserCourses: async (userId: number, courseIds: number[]) => {
        return apiClient.put(`/api/instituciones/usuarios/${userId}/cursos`, { courseIds });
    },

    toggleUserStatus: async (userId: number, activo: boolean) => {
        return apiClient.put(`/api/instituciones/usuarios/${userId}/status`, { activo });
    },

    getGradeReport: async (courseId: number) => {
        return apiClient.get(`/api/instituciones/cursos/${courseId}/reporte-notas`);
    },

    deleteInstitucion: async (instId: number) => {
        return apiClient.delete(`/api/admin/instituciones/${instId}`);
    },

    renameInstitucion: async (instId: number, nombre: string) => {
        return apiClient.patch(`/api/admin/instituciones/${instId}`, { nombre });
    },

    deleteUser: async (userId: number) => {
        return apiClient.delete(`/api/admin/users/${userId}`);
    },

    updateInstitutionLogo: async (instId: number, file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return apiClient.patch(`/api/instituciones/${instId}/logo`, formData);
    },
};
