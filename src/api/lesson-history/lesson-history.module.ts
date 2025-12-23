import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LessonHistoryService } from './lesson-history.service';
import { LessonHistoryController } from './lesson-history.controller';
import { LessonHistory } from '../../core/entity/lessonHistory.entity';
import { Lesson } from '../../core/entity/lesson.entity';
import { Student } from '../../core/entity/student.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([LessonHistory, Lesson, Student])
  ],
  controllers: [LessonHistoryController],
  providers: [LessonHistoryService],
  exports: [LessonHistoryService]
})
export class LessonHistoryModule {}