import { Injectable } from '@nestjs/common';
import { CreateLessonHistoryDto } from './dto/create-lesson-history.dto';
import { UpdateLessonHistoryDto } from './dto/update-lesson-history.dto';

@Injectable()
export class LessonHistoryService {
  create(createLessonHistoryDto: CreateLessonHistoryDto) {
    return 'This action adds a new lessonHistory';
  }

  findAll() {
    return `This action returns all lessonHistory`;
  }

  findOne(id: number) {
    return `This action returns a #${id} lessonHistory`;
  }

  update(id: number, updateLessonHistoryDto: UpdateLessonHistoryDto) {
    return `This action updates a #${id} lessonHistory`;
  }

  remove(id: number) {
    return `This action removes a #${id} lessonHistory`;
  }
}
