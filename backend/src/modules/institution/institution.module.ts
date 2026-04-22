import { Module } from '@nestjs/common';
import { InstitutionController } from './institution.controller';
import { PublicInstitutionController } from './public-institution.controller';
import { InstitutionService } from './institution.service';

import { StorageModule } from '../storage/storage.module';

@Module({
    imports: [StorageModule],
    controllers: [InstitutionController, PublicInstitutionController],
    providers: [InstitutionService],
    exports: [InstitutionService],
})
export class InstitutionModule {}
