import { Module } from '@nestjs/common';
import { InstitutionalCloningController } from './institutional-cloning.controller';
import { InstitutionalCloningService } from './institutional-cloning.service';

@Module({
  controllers: [InstitutionalCloningController],
  providers: [InstitutionalCloningService],
  exports: [InstitutionalCloningService]
})
export class InstitutionalCloningModule {}
