import { PartialType } from '@nestjs/mapped-types';
import { CreateDeletedTeacherDto } from './create-deleted-teacher.dto';

export class UpdateDeletedTeacherDto extends PartialType(CreateDeletedTeacherDto) {}
