import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { InstitutionService } from './institution.service';

@Controller('public/instituciones')
export class PublicInstitutionController {
    constructor(private readonly institutionService: InstitutionService) {}

    @Post('registro-padres')
    async registerFromParent(@Body() data: { token?: string, studentData: any }) {
        return this.institutionService.registerStudentFromParent(data.token, data.studentData);
    }

    @Get('invitacion/:token')
    async getInvitation(@Param('token') token: string) {
        return this.institutionService.getInvitation(token);
    }

    @Get(':id/cursos')
    async getPublicCourses(@Param('id') id: string) {
        return this.institutionService.getCoursesByInstitution(parseInt(id));
    }
}
