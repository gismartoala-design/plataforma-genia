import { Controller, Post, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { InstitutionalCloningService } from './institutional-cloning.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('institutional-cloning')
@UseGuards(JwtAuthGuard)
export class InstitutionalCloningController {
  constructor(private readonly cloningService: InstitutionalCloningService) {}

  @Post('clone/:id')
  async cloneInstitution(
    @Param('id', ParseIntPipe) sourceId: number,
    @Body() data: {
      nombre: string;
      ciudad: string;
      email: string;
      adminNombre: string;
      adminEmail: string;
      adminPassword?: string;
    }
  ) {
    return this.cloningService.cloneInstitution(sourceId, data);
  }

  @Post('module/:id/clone')
  async cloneModule(
    @Param('id', ParseIntPipe) moduleId: number,
    @Body('targetSectionId') targetSectionId?: number
  ) {
    return this.cloningService.cloneModule(moduleId, targetSectionId);
  }
}
