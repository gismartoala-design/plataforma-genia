import { Module } from '@nestjs/common';
import { InstitutionController } from './institution.controller';
import { InstitutionService } from './institution.service';

import { StorageModule } from '../storage/storage.module';

@Module({
    imports: [StorageModule],
    controllers: [InstitutionController],
    providers: [InstitutionService],
    exports: [InstitutionService],
})
export class InstitutionModule {}
