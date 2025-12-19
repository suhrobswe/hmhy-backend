import { Module } from '@nestjs/common';
import { DeletedTeacherService } from './deleted-teacher.service';
import { DeletedTeacherController } from './deleted-teacher.controller';

@Module({
  controllers: [DeletedTeacherController],
  providers: [DeletedTeacherService],
})
export class DeletedTeacherModule {}
