import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProfessorService } from './professor.service';
import { StorageService } from '../storage/storage.service';
import { memoryStorage } from 'multer';

@Controller('professor')
export class ProfessorController {
  constructor(
    private readonly professorService: ProfessorService,
    private readonly storageService: StorageService,
  ) { }

  // Resource Library Endpoints
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(), // Store in memory so we can buffer upload to SFTP
    }),
  )
  async uploadFile(
    @UploadedFile() file: any,
    @Body('profesorId') profesorId: string,
    @Body('carpeta') carpeta?: string,
  ) {
    // Upload via StorageService (Local or SFTP)
    const url = await this.storageService.uploadFile(file);

    return this.professorService.createResource({
      profesorId: parseInt(profesorId) || 1, // Default to 1
      nombre: file.originalname,
      tipo: file.mimetype,
      url: url,
      peso: file.size,
      carpeta: carpeta,
    });
  }

  @Get('resources')
  async getResources() {
    // Hardcoded ID 1 since we don't have full auth context passed yet
    return this.professorService.getResources(1);
  }

  @Get(':id/modules')
  async getModules(@Param('id', ParseIntPipe) id: number) {
    return this.professorService.getModulesByProfessor(id);
  }

  @Delete('resources/:id')
  async deleteResource(@Param('id', ParseIntPipe) id: number) {
    return this.professorService.deleteResource(id);
  }

  @Delete('folders')
  async deleteFolder(@Query('path') path: string) {
    return this.professorService.deleteFolder(path);
  }

  @Post('students')
  async createStudent(
    @Body()
    body: {
      name: string;
      email: string;
      password: string;
      moduleId: number;
    },
  ) {
    return this.professorService.createStudentAndAssign(body);
  }

  @Post('modules/:moduleId/students/:studentId')
  async assignStudent(
    @Param('moduleId', ParseIntPipe) moduleId: number,
    @Param('studentId', ParseIntPipe) studentId: number,
  ) {
    return this.professorService.assignStudentToModule(studentId, moduleId);
  }

  @Delete('modules/:moduleId/students/:studentId')
  async unassignStudent(
    @Param('moduleId', ParseIntPipe) moduleId: number,
    @Param('studentId', ParseIntPipe) studentId: number,
  ) {
    return this.professorService.unassignStudentFromModule(studentId, moduleId);
  }

  // Level Management
  @Post('modules/:id/levels')
  async createLevel(
    @Param('id', ParseIntPipe) moduleId: number,
    @Body() body: { tituloNivel: string; orden: number; descripcion?: string },
  ) {
    return this.professorService.createLevel(moduleId, body);
  }

  @Get('modules/:id/levels')
  async getLevels(@Param('id', ParseIntPipe) moduleId: number) {
    return this.professorService.getLevelsByModule(moduleId);
  }

  @Patch('modules/:id/levels/reorder')
  async reorderLevels(
    @Param('id', ParseIntPipe) moduleId: number,
    @Body('orderedLevelIds') orderedLevelIds: number[],
  ) {
    return this.professorService.reorderLevels(moduleId, orderedLevelIds);
  }

  // Content Management
  @Post('levels/:id/contents')
  async createContent(
    @Param('id', ParseIntPipe) levelId: number,
    @Body() body: { tipo: string; urlRecurso: string; orden?: number },
  ) {
    return this.professorService.createContent(levelId, body);
  }

  @Patch('contents/:id')
  async updateContent(
    @Param('id', ParseIntPipe) contentId: number,
    @Body() body: any,
  ) {
    return this.professorService.updateContent(contentId, body);
  }

  @Patch('levels/:id/contents/reorder')
  async reorderContents(
    @Param('id', ParseIntPipe) levelId: number,
    @Body('orderedContentIds') orderedContentIds: number[],
  ) {
    return this.professorService.reorderContents(levelId, orderedContentIds);
  }

  @Get('levels/:id/contents')
  async getContents(@Param('id', ParseIntPipe) levelId: number) {
    return this.professorService.getContentsByLevel(levelId);
  }

  @Delete('contents/:id')
  async deleteContent(@Param('id', ParseIntPipe) contentId: number) {
    return this.professorService.deleteContent(contentId);
  }

  @Delete('levels/:id')
  async deleteLevel(@Param('id', ParseIntPipe) levelId: number) {
    return this.professorService.deleteLevel(levelId);
  }

  @Put('levels/:id')
  @Patch('levels/:id')
  async updateLevel(
    @Param('id', ParseIntPipe) levelId: number,
    @Body() body: any,
  ) {
    return this.professorService.updateLevel(levelId, body);
  }

  // RAG Templates
  @Post('levels/:id/rag')
  async createRag(
    @Param('id', ParseIntPipe) levelId: number,
    @Body() body: any,
  ) {
    return this.professorService.createRagTemplate(levelId, body);
  }

  @Get('levels/:id/rag')
  async getRagTemplate(@Param('id', ParseIntPipe) levelId: number) {
    try {
      const ragTemplate = await this.professorService.getRagTemplate(levelId);
      return ragTemplate;
    } catch (error) {
      console.error(`Error fetching RAG for level ${levelId}:`, error);
      throw error; // Let NestJS handle the exception properly
    }
  }

  // HA Routes
  @Post('levels/:id/ha')
  async createHaTemplate(
    @Param('id', ParseIntPipe) levelId: number,
    @Body() body: any,
  ) {
    return this.professorService.createHaTemplate(levelId, body);
  }

  @Get('levels/:id/ha')
  async getHaTemplate(@Param('id', ParseIntPipe) levelId: number) {
    try {
      return await this.professorService.getHaTemplate(levelId);
    } catch (error) {
      console.error(`Error fetching HA for level ${levelId}:`, error);
      throw error;
    }
  }

  @Post('levels/:id/ha')
  async saveHaTemplate(@Param('id', ParseIntPipe) levelId: number, @Body() data: any) {
    return this.professorService.createHaTemplate(levelId, data);
  }



  // Attendance Endpoints
  @Get('levels/:id/attendance')
  async getAttendance(@Param('id', ParseIntPipe) levelId: number) {
    return this.professorService.getAttendance(levelId);
  }

  @Post('levels/:id/attendance')
  async saveAttendance(
    @Param('id', ParseIntPipe) levelId: number,
    @Body() body: { professorId: number; records: { estudianteId: number; asistio: boolean }[] }
  ) {
    return this.professorService.saveAttendance(levelId, body.professorId || 1, body.records);
  }

  // --- LATAM & COURSES ---

  @Get('latam/companies')
  async getLatamCompanies() {
    return this.professorService.getLatamCompanies();
  }

  @Get(':id/latam/students')
  async getLatamStudents(@Param('id', ParseIntPipe) id: number) {
    return this.professorService.getLatamStudents(id);
  }

  @Get(':id/courses')
  async getCourses(@Param('id', ParseIntPipe) id: number) {
    return this.professorService.getCoursesByProfessor(id);
  }

  @Post('courses')
  async createCourse(
    @Body() body: { professorId: number; nombre: string; companiaId?: number; institucionId?: number }
  ) {
    const { professorId, ...data } = body;
    return this.professorService.createCourse(professorId, data);
  }

  @Patch('courses/:id')
  async updateCourse(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any
  ) {
    return this.professorService.updateCourse(id, body);
  }

  @Delete('courses/:id')
  async deleteCourse(@Param('id', ParseIntPipe) id: number) {
    return this.professorService.deleteCourse(id);
  }
}
