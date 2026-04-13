import { Module } from '@nestjs/common';
import { KidsController } from './kids.controller';
import { KidsService } from './kids.service';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../../database/database.module';
import { StudentModule } from '../student/student.module';

@Module({
  imports: [AuthModule, DatabaseModule, StudentModule],
  controllers: [KidsController],
  providers: [KidsService],
  exports: [KidsService]
})
export class KidsModule { }
