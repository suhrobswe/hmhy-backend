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
  Query,
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
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('student')
@ApiBearerAuth()
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @AccessRoles(Roles.SUPER_ADMIN, Roles.ADMIN)
  findAll(@Query() query: PaginationDto) {
    return this.studentService.findAllWithPagination({
      limit: query.limit,
      page: query.page,

      select: {
        id: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        tgUsername: true,
        tgId: true,
        blockedReason: true,
        createdAt: true,
        updatedAt: true,
        isBlocked: true,
        email: true,

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
        tgId: true,
        createdAt: true,
        updatedAt: true,
        email: true,
        isBlocked: true,

        lessons: {
          id: true,
          name: true,
          teacher: { fullName: true },
          startTime: true,
        },
      },
    });
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStudentDto: UpdateStudentDto,
  ) {
    return await this.studentService.update(id, updateStudentDto);
  }

  @Get('stats')
  async getStudentStats() {
    return await this.studentService.getStats();
  }

  @Post('/:id/toggle-block')
  async blockStudent(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() reason: string,
  ) {
    return await this.studentService.toggleStudentBlock(id);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.studentService.findOneById(id, {
      select: {
        id: true,
        firstName: true,
        email: true,

        lastName: true,
        phoneNumber: true,
        isBlocked: true,
        tgId: true,
        createdAt: true,
        updatedAt: true,
        tgUsername: true,
        blockedReason: true,

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
