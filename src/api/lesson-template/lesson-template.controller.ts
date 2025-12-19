import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LessonTemplateService } from './lesson-template.service';
import { CreateLessonTemplateDto } from './dto/create-lesson-template.dto';
import { UpdateLessonTemplateDto } from './dto/update-lesson-template.dto';

@Controller('lesson-template')
export class LessonTemplateController {
  constructor(private readonly lessonTemplateService: LessonTemplateService) {}

  @Post()
  create(@Body() createLessonTemplateDto: CreateLessonTemplateDto) {
    return this.lessonTemplateService.create(createLessonTemplateDto);
  }

  @Get()
  findAll() {
    return this.lessonTemplateService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lessonTemplateService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLessonTemplateDto: UpdateLessonTemplateDto) {
    return this.lessonTemplateService.update(+id, updateLessonTemplateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.lessonTemplateService.remove(+id);
  }
}
