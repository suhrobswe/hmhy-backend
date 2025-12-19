import { IsNotEmpty, IsUUID } from 'class-validator';

export class RestoreTeacherDto {
  @IsUUID()
  @IsNotEmpty()
  teacher: string;
}
