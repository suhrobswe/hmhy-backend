import { Injectable } from '@nestjs/common';
import { CreateLessonTemplateDto } from './dto/create-lesson-template.dto';
import { UpdateLessonTemplateDto } from './dto/update-lesson-template.dto';

@Injectable()
export class LessonTemplateService {
  create(createLessonTemplateDto: CreateLessonTemplateDto) {
    return 'This action adds a new lessonTemplate';
  }

  findAll() {
    return `This action returns all lessonTemplate`;
  }

  findOne(id: number) {
    return `This action returns a #${id} lessonTemplate`;
  }

  update(id: number, updateLessonTemplateDto: UpdateLessonTemplateDto) {
    return `This action updates a #${id} lessonTemplate`;
  }

  remove(id: number) {
    return `This action removes a #${id} lessonTemplate`;
  }
}
