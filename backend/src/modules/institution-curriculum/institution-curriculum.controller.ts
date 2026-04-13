import { Controller, Get, Post, Body, Param, Put, Delete, Patch, UseGuards, ParseIntPipe } from '@nestjs/common';
import { InstitutionalCurriculumService } from './institution-curriculum.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('institution-curriculum')
// @UseGuards(JwtAuthGuard)
export class InstitutionalCurriculumController {
  constructor(private readonly curriculumService: InstitutionalCurriculumService) { }

  // --- SECCIONES ---
  @Post('sections')
  async createSection(@Body() data: any) {
    return this.curriculumService.createSection(data);
  }

  @Get('course/:id')
  async getCourse(@Param('id', ParseIntPipe) id: number) {
    return this.curriculumService.getCourseById(id);
  }

  @Get('sections/course/:courseId')
  async getSections(@Param('courseId', ParseIntPipe) courseId: number) {
    return this.curriculumService.getSectionsByCourse(courseId);
  }

  @Put('sections/:id')
  async updateSection(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.curriculumService.updateSection(id, data);
  }

  @Delete('sections/:id')
  async deleteSection(@Param('id', ParseIntPipe) id: number) {
    return this.curriculumService.deleteSection(id);
  }

  // --- MÓDULOS ---
  @Post('modules')
  async createModule(@Body() data: any) {
    return this.curriculumService.createModule(data);
  }

  @Get('modules/section/:sectionId')
  async getModulesBySection(@Param('sectionId', ParseIntPipe) sectionId: number) {
    return this.curriculumService.getModulesBySection(sectionId);
  }

  @Get('modules/course/:courseId')
  async getModulesByCourse(@Param('courseId', ParseIntPipe) courseId: number) {
    return this.curriculumService.getModulesByCourse(courseId);
  }

  @Put('modules/:id')
  async updateModule(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.curriculumService.updateModule(id, data);
  }

  @Delete('modules/:id')
  async deleteModule(@Param('id', ParseIntPipe) id: number) {
    return this.curriculumService.deleteModule(id);
  }

  // --- PROGRESO ---
  @Patch('progress')
  async updateProgress(@Body() data: { estudianteId: number; moduloInstId: number; data: any }) {
    return this.curriculumService.updateProgress(data.estudianteId, data.moduloInstId, data.data);
  }

  @Post('ai-generate')
  async aiGenerate(@Body() data: { institucionId: number; text: string }) {
    return this.curriculumService.generateStructureFromAI(data.institucionId, data.text);
  }

  @Get('student/:estudianteId/course/:courseId/progress')
  async getProgress(
    @Param('estudianteId', ParseIntPipe) estudianteId: number,
    @Param('courseId', ParseIntPipe) courseId: number
  ) {
    return this.curriculumService.getStudentProgressInCourse(estudianteId, courseId);
  }

  @Patch('sections/reorder')
  async reorderSections(@Body() data: { orderedIds: number[] }) {
    return this.curriculumService.reorderSections(data.orderedIds);
  }

  @Patch('modules/reorder')
  async reorderModules(@Body() data: { orderedIds: number[] }) {
    return this.curriculumService.reorderModules(data.orderedIds);
  }
}
