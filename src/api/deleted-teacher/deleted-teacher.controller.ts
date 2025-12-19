import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DeletedTeacherService } from './deleted-teacher.service';
import { CreateDeletedTeacherDto } from './dto/create-deleted-teacher.dto';
import { UpdateDeletedTeacherDto } from './dto/update-deleted-teacher.dto';

@Controller('deleted-teacher')
export class DeletedTeacherController {
  constructor(private readonly deletedTeacherService: DeletedTeacherService) {}

  @Post()
  create(@Body() createDeletedTeacherDto: CreateDeletedTeacherDto) {
    return this.deletedTeacherService.create(createDeletedTeacherDto);
  }

  @Get()
  findAll() {
    return this.deletedTeacherService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.deletedTeacherService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDeletedTeacherDto: UpdateDeletedTeacherDto) {
    return this.deletedTeacherService.update(+id, updateDeletedTeacherDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deletedTeacherService.remove(+id);
  }
}
