import { Injectable } from '@nestjs/common';
import { CreateDeletedTeacherDto } from './dto/create-deleted-teacher.dto';
import { UpdateDeletedTeacherDto } from './dto/update-deleted-teacher.dto';

@Injectable()
export class DeletedTeacherService {
  create(createDeletedTeacherDto: CreateDeletedTeacherDto) {
    return 'This action adds a new deletedTeacher';
  }

  findAll() {
    return `This action returns all deletedTeacher`;
  }

  findOne(id: number) {
    return `This action returns a #${id} deletedTeacher`;
  }

  update(id: number, updateDeletedTeacherDto: UpdateDeletedTeacherDto) {
    return `This action updates a #${id} deletedTeacher`;
  }

  remove(id: number) {
    return `This action removes a #${id} deletedTeacher`;
  }
}
