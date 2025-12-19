import { Module } from '@nestjs/common';
import { LessonTemplateService } from './lesson-template.service';
import { LessonTemplateController } from './lesson-template.controller';

@Module({
  controllers: [LessonTemplateController],
  providers: [LessonTemplateService],
})
export class LessonTemplateModule {}
