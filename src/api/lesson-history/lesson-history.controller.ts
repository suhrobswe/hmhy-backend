import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LessonHistoryService } from './lesson-history.service';
import { CreateLessonHistoryDto } from './dto/create-lesson-history.dto';
import { UpdateLessonHistoryDto } from './dto/update-lesson-history.dto';

@Controller('lesson-history')
export class LessonHistoryController {
  constructor(private readonly lessonHistoryService: LessonHistoryService) {}

  @Post()
  create(@Body() createLessonHistoryDto: CreateLessonHistoryDto) {
    return this.lessonHistoryService.create(createLessonHistoryDto);
  }

  @Get()
  findAll() {
    return this.lessonHistoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lessonHistoryService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLessonHistoryDto: UpdateLessonHistoryDto) {
    return this.lessonHistoryService.update(+id, updateLessonHistoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.lessonHistoryService.remove(+id);
  }
}
