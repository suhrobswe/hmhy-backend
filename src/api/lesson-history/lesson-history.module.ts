import { Module } from '@nestjs/common';
import { LessonHistoryService } from './lesson-history.service';
import { LessonHistoryController } from './lesson-history.controller';

@Module({
  controllers: [LessonHistoryController],
  providers: [LessonHistoryService],
})
export class LessonHistoryModule {}
