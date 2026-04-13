import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { InstitutionService } from './institution.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('instituciones')
// @UseGuards(JwtAuthGuard)
export class InstitutionController {
    constructor(private readonly institutionService: InstitutionService) {}

    @Get()
    async getAll() {
        return this.institutionService.getAllInstitutions();
    }

    @Post()
    async create(@Body() data: any) {
        return this.institutionService.createInstitution(data);
    }

    @Get(':id/cursos')
    async getCourses(@Param('id') id: string) {
        return this.institutionService.getCoursesByInstitution(parseInt(id));
    }

    @Post('cursos')
    async createCourse(@Body() data: any) {
        return this.institutionService.createCourse(data);
    }

    @Get('cursos/:id/modulos')
    async getModules(@Param('id') id: string) {
        return this.institutionService.getModulesByCourse(parseInt(id));
    }

    @Get(':id/usuarios')
    async getUsers(@Param('id') id: string) {
        return this.institutionService.getInstitutionalUsers(parseInt(id));
    }

    @Post('modulos')
    async createModule(@Body() data: any) {
        return this.institutionService.createModule(data);
    }

    @Delete('modulos/:id')
    async deleteModule(@Param('id') id: string) {
        return this.institutionService.deleteModule(parseInt(id));
    }

    @Delete('cursos/:id')
    async deleteCourse(@Param('id') id: string) {
        return this.institutionService.deleteCourse(parseInt(id));
    }

    @Put('modulos/:moduleId/curso/:courseId')
    async assignModule(@Param('moduleId') moduleId: string, @Param('courseId') courseId: string) {
        return this.institutionService.assignModuleToCourse(parseInt(moduleId), parseInt(courseId));
    }

    @Post('usuarios')
    async createUser(@Body() data: any) {
        return this.institutionService.createUser(data);
    }

    @Put('usuarios/:id')
    async updateUser(@Param('id') id: string, @Body() data: any) {
        return this.institutionService.updateUser(parseInt(id), data);
    }

    @Put('modulos/:id')
    async updateModule(@Param('id') id: string, @Body() data: any) {
        return this.institutionService.updateModule(parseInt(id), data);
    }

    @Get('usuarios/:id/cursos')
    async getUserCourses(@Param('id') id: string) {
        return this.institutionService.getUserCourses(parseInt(id));
    }

    @Put('usuarios/:id/cursos')
    async syncUserCourses(@Param('id') id: string, @Body() body: { courseIds: number[] }) {
        return this.institutionService.syncUserCourses(parseInt(id), body.courseIds);
    }

    @Put('usuarios/:id/status')
    async toggleStatus(@Param('id') id: string, @Body() body: { activo: boolean }) {
        return this.institutionService.toggleUserStatus(parseInt(id), body.activo);
    }

    @Get('cursos/:id/reporte-notas')
    async getGradeReport(@Param('id') id: string) {
        return this.institutionService.getGradeReport(parseInt(id));
    }
}
