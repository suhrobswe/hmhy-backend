import { Module } from '@nestjs/common';
import { LessonService } from './lesson.service';
import { LessonController } from './lesson.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lesson } from 'src/core/entity/lesson.entity';
import { Teacher } from 'src/core/entity/teacher.entity';
import { Student } from 'src/core/entity/student.entity';
import { GoogleCalendarModule } from './google-calendar.module';
import { LessonHistoryModule } from '../lesson-history/lesson-history.module';
import { LessonHistory } from 'src/core/entity/lessonHistory.entity';

@Module({
  imports: [GoogleCalendarModule, TypeOrmModule.forFeature([Lesson, Teacher, Student, LessonHistory])],
  controllers: [LessonController, ],
  providers: [LessonService],
})
export class LessonModule {}
