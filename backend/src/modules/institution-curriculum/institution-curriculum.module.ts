import { Module } from '@nestjs/common';
import { InstitutionalCurriculumService } from './institution-curriculum.service';
import { InstitutionalCurriculumController } from './institution-curriculum.controller';

@Module({
  providers: [InstitutionalCurriculumService],
  controllers: [InstitutionalCurriculumController],
  exports: [InstitutionalCurriculumService],
})
export class InstitutionalCurriculumModule {}
