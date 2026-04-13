import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req, Query } from '@nestjs/common';
import { KidsService } from './kids.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('kids')
export class KidsController {
  constructor(private readonly kidsService: KidsService) {}

  @Get('levels/:nivelId/template')
  async getTemplateByLevel(@Param('nivelId') nivelId: string, @Query('tipo') tipo?: string) {
    const nId = parseInt(nivelId);
    
    // Check if the level itself is blocked
    const [level] = await this.kidsService.getLevelInfo(nId);
    if (level?.bloqueado) return null;

    const allTemplates = await this.kidsService.getTemplatesByNivel(nId);
    if (!allTemplates || allTemplates.length === 0) return null;
    
    // Filter out blocked templates (null is treated as false/unblocked)
    const templates = allTemplates.filter(t => t.bloqueado !== true);
    if (templates.length === 0) return null;

    // Function to check if a template has actual content
    const hasContent = (t: any) => {
      if (!t.actividades) return false;
      const act = t.actividades;
      if (Array.isArray(act)) return act.length > 0;
      if (typeof act === 'object') {
        const screens = act.steps || act.screens || act.blocks || act.milestones;
        return Array.isArray(screens) && screens.length > 0;
      }
      return false;
    };

    let filtered: any[] = templates;
    if (tipo) {
      filtered = templates.filter(t => t.tipo === tipo);
      // If no exact match for tipo among unblocked templates, return null 
      // instead of falling back to all templates (which might include blocked ones)
      if (filtered.length === 0) return null;
    }

    // Sort: templates with content first, then by ID (favoring older for stability if multiple exist, 
    // though usually there's only one per level/type)
    const sorted = [...filtered].sort((a, b) => {
      const aHas = hasContent(a) ? 1 : 0;
      const bHas = hasContent(b) ? 1 : 0;
      if (aHas !== bHas) return bHas - aHas; // 1 (has Content) comes before 0
      return a.id - b.id; 
    });

    return sorted[0];
  }

  // Plural alias used by kidsProfessorApi
  @Get('levels/:nivelId/templates')
  async getTemplatesByLevel(@Param('nivelId') nivelId: string) {
    return this.kidsService.getTemplatesByNivel(parseInt(nivelId));
  }

  @UseGuards(JwtAuthGuard)
  @Post('submit')
  async submitResult(@Body() data: any, @Req() req: any) {
    try {
      // Diagnostic logging (to be removed once verified)
      console.log(`[KidsController] Submission attempt by student ${data.estudianteId} for template ${data.plantillaKidsId}`);
      const res = await this.kidsService.submitResult(data);
      console.log('[KidsController] Submission SUCCESS. ID:', res.id);
      return res;
    } catch (error) {
      console.error('[KidsController] submitResult Error:', error);
      throw error;
    }
  }

  @Get('templates/:nivelId')
  async getTemplates(@Param('nivelId') nivelId: string) {
    return this.kidsService.getTemplatesByNivel(parseInt(nivelId));
  }

  @Post('templates')
  async createTemplate(@Body() data: any) {
    return this.kidsService.createTemplate(data);
  }

  @Put('templates/:id')
  async updateTemplate(@Param('id') id: string, @Body() data: any) {
    return this.kidsService.updateTemplate(parseInt(id), data);
  }

  @Delete('templates/:id')
  async deleteTemplate(@Param('id') id: string) {
    return this.kidsService.deleteTemplate(parseInt(id));
  }
}
