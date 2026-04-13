import { Module } from '@nestjs/common';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { StudentUploadController } from './controllers/student-upload.controller';
import { GamificationController } from './controllers/gamification.controller';
import { DatabaseModule } from '../../database/database.module';
import { StorageModule } from '../storage/storage.module';
import { GamificationService } from './services/gamification.service';
import { UsersModule } from '../users/users.module';

import { SkinsService } from './services/skins.service';

@Module({
  imports: [DatabaseModule, StorageModule, UsersModule],
  controllers: [StudentController, StudentUploadController, GamificationController],
  providers: [StudentService, GamificationService, SkinsService],
  exports: [StudentService, GamificationService, SkinsService],
})
export class StudentModule { }
