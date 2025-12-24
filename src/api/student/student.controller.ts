import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { RolesGuard } from 'src/common/guard/role.guard';
import { AccessRoles } from 'src/common/decorator/roles.decorator';
import { Roles } from 'src/common/enum/index.enum';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import type { IToken } from 'src/infrastructure/token/interface';

@Controller('student')
@ApiBearerAuth()
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @AccessRoles(Roles.SUPER_ADMIN, Roles.ADMIN)
  findAll() {
    return this.studentService.findAll({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        tgUsername: true,
        lessons: {
          id: true,
          name: true,
          teacher: { fullName: true },
          startTime: true,
        },
      },
    });
  }

  @Get('me')
  @UseGuards(AuthGuard, RolesGuard)
  @AccessRoles(Roles.TEACHER, Roles.STUDENT)
  getMe(@CurrentUser() user: IToken) {
    return this.studentService.findOneById(user.id, {
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        tgUsername: true,
        lessons: {
          id: true,
          name: true,
          teacher: { fullName: true },
          startTime: true,
        },
      },
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.studentService.findOneById(id, {
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        tgUsername: true,
        lessons: {
          id: true,
          name: true,
          teacher: { fullName: true },
          startTime: true,
        },
      },
    });
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.studentService.delete(id);
  }
}
