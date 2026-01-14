import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { LessonService } from './lesson.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import type { IToken } from 'src/infrastructure/token/interface';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { RolesGuard } from 'src/common/guard/role.guard';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { AccessRoles } from 'src/common/decorator/roles.decorator';
import { LessonStatus, Rating, Roles } from 'src/common/enum/index.enum';
import { LessonComplete } from './dto/lesson-complete.dto';
import { LessonFiltersDto } from './dto/lesson-filter.dto';
@ApiTags('Lessons')
@ApiBearerAuth()
@Controller('lessons')
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @AccessRoles(Roles.TEACHER)
  @ApiOperation({
    summary: 'Yangi dars yaratish (Teacher)',
    description:
      "Teacher bo'sh dars slotini yaratadi. Google Meet link avtomatik generatsiya qilinadi. Student keyinchalik bu darsni booking qiladi.",
  })
  @ApiResponse({
    status: 201,
    description: 'Dars muvaffaqiyatli yaratildi',
  })
  @ApiResponse({
    status: 400,
    description: 'Noto`g`ri ma`lumotlar yoki Google Calendar ulanmagan',
  })
  create(
    @Body() createLessonDto: CreateLessonDto,
    @CurrentUser() user: IToken,
  ) {
    return this.lessonService.createLesson(createLessonDto, user.id);
  }

  @Patch('lesson-complete/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @AccessRoles(Roles.TEACHER)
  @ApiOperation({
    summary: 'Complete a lesson',
    description: 'Marks a lesson as complete and moves it to lesson history',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Lesson ID',
    example: '56efa278-5d5d-40e5-b15b-649f0cc7408c',
  })
  @ApiBody({
    type: LessonComplete,
    description: 'Lesson completion data',
    examples: {
      example1: {
        summary: 'Complete with feedback',
        value: {
          status: 'COMPLETED',
          star: 'FIVE',
          feedback: 'Great lesson, student showed excellent progress',
        },
      },
      example2: {
        summary: 'Complete without feedback',
        value: {
          status: 'COMPLETED',
          star: 'FOUR',
        },
      },
    },
  })
  lessonComplete(
    @CurrentUser() teacher: IToken,
    @Body() dto: LessonComplete,
    @Param('id', ParseUUIDPipe) lessonId: string,
  ) {
    return this.lessonService.lessonComplete(teacher.id, dto, lessonId);
  }
  @Get('available')
  @UseGuards(AuthGuard, RolesGuard)
  @AccessRoles(Roles.STUDENT, Roles.TEACHER)
  @ApiOperation({
    summary: "Barcha bo'sh darslarni ko'rish",
    description:
      "Studentlar uchun booking qilish mumkin bo'lgan barcha darslar ro'yxati",
  })
  @ApiResponse({
    status: 200,
    description: "Bo'sh darslar ro'yxati",
  })
  getAvailableLessons() {
    return this.lessonService.getAvailableLessons();
  }

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @AccessRoles()
  @ApiResponse({
    status: 200,
    description: "Bo'sh darslar ro'yxati",
  })
  findAll() {
    return this.lessonService.findAll();
  }

  @Get('for-teacher')
  @UseGuards(AuthGuard, RolesGuard)
  @AccessRoles(Roles.TEACHER)
  @ApiResponse({
    status: 200,
    description: "Bo'sh darslar ro'yxati",
  })
  findAllForTeacher(
    @CurrentUser() user: IToken,
    @Query('status') status?: string,
    @Query('date') date?: string,
  ) {
    return this.lessonService.findAllForTeacher(user.id, status, date);
  }

  @Get('stats')
  @UseGuards(AuthGuard, RolesGuard)
  @AccessRoles(Roles.TEACHER)
  lessonStats(@CurrentUser() user: IToken) {
    return this.lessonService.lessonStats(user.id);
  }

  @Get('my-lessons')
  @UseGuards(AuthGuard, RolesGuard)
  @AccessRoles(Roles.TEACHER)
  @ApiOperation({
    summary: 'Mening darslarim (Student)',
    description: "Student o'zi booking qilgan barcha darslarni ko'radi",
  })
  @ApiResponse({
    status: 200,
    description: "Student darslar ro'yxati",
  })
  getMyLessons(@CurrentUser() user: IToken) {
    return this.lessonService.getMyLessons(user.id);
  }

  @Post(':id/book')
  @UseGuards(AuthGuard, RolesGuard)
  @AccessRoles(Roles.STUDENT)
  @ApiOperation({
    summary: 'Darsni booking qilish (Student)',
    description: "Student bo'sh darsni o'ziga booking qiladi",
  })
  @ApiResponse({
    status: 200,
    description: 'Dars muvaffaqiyatli booking qilindi',
  })
  @ApiResponse({
    status: 400,
    description: 'Dars allaqachon booking qilingan yoki mavjud emas',
  })
  @ApiResponse({
    status: 404,
    description: 'Dars topilmadi',
  })
  bookLesson(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: IToken,
  ) {
    return this.lessonService.bookLesson(id, user.id);
  }

  @Get(':id/lessons')
  @UseGuards(AuthGuard, RolesGuard)
  @AccessRoles(Roles.SUPER_ADMIN, Roles.ADMIN)
  async getTeacherLessonsAdmin(
    @Param('id', ParseUUIDPipe) teacherId: string,
    @Query() query: LessonFiltersDto,
  ) {
    return this.lessonService.getTeacherLessonsForAdmin(teacherId, query);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Darsni yangilash',
    description: "Dars ma'lumotlarini yangilash (vaqt, narx va h.k.)",
  })
  @ApiResponse({
    status: 200,
    description: 'Dars muvaffaqiyatli yangilandi',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLessonDto: UpdateLessonDto,
  ) {
    return this.lessonService.updateLesson(id, updateLessonDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: "Darsni o'chirish",
    description: "Darsni database va Google Calendar'dan o'chirish",
  })
  @ApiResponse({
    status: 200,
    description: "Dars muvaffaqiyatli o'chirildi",
  })
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.lessonService.deleteLesson(id);
  }
}
