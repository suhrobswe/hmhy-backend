import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { BaseService } from 'src/infrastructure/base/base-service';
import { Lesson } from 'src/core/entity/lesson.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { GoogleCalendarService } from './google-calendar.service';
import { Teacher } from 'src/core/entity/teacher.entity';
import { Student } from 'src/core/entity/student.entity';
import { LessonStatus, Rating } from 'src/common/enum/index.enum';
import type { LessonRepository } from 'src/core/repository/lesson.repository';
import type { TeacherRepository } from 'src/core/repository/teacher.repository';
import type { StudentRepository } from 'src/core/repository/student.repository';
import { LessonComplete } from './dto/lesson-complete.dto';
import { w } from 'node_modules/@faker-js/faker/dist/airline-DF6RqYmq';
import { successRes } from 'src/infrastructure/response/success.response';
import { LessonHistory } from 'src/core/entity/lessonHistory.entity';
import type { LessonHistoryRepository } from 'src/core/repository/lessonHistory.repository';

@Injectable()
export class LessonService extends BaseService<
  CreateLessonDto,
  UpdateLessonDto,
  Lesson
> {
  constructor(
    @InjectRepository(Lesson) private readonly lessonRepo: LessonRepository,
    @InjectRepository(Teacher)
    private readonly teacherRepo: TeacherRepository,
    @InjectRepository(Student)
    private readonly studentRepo: StudentRepository,
    private readonly calendarService: GoogleCalendarService,

    @InjectRepository(LessonHistory)
    private readonly lessonHistoryRepo: LessonHistoryRepository,
  ) {
    super(lessonRepo);
  }

  /**
   * Teacher yangi dars yaratadi (studentisiz)
   */
  async createLesson(dto: CreateLessonDto, teacherId: string): Promise<Lesson> {
    // Validate time range
    const startTime = new Date(dto.startTime);
    const endTime = new Date(dto.endTime);

    if (startTime >= endTime) {
      throw new BadRequestException('End time must be after start time');
    }

    if (startTime < new Date()) {
      throw new BadRequestException('Start time cannot be in the past');
    }

    // Find teacher (current user)
    const teacher = await this.teacherRepo.findOne({
      where: { id: teacherId },
    });
    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${teacherId} not found`);
    }

    // Validate Google Calendar credentials
    if (!teacher.googleAccessToken || !teacher.googleRefreshToken) {
      throw new BadRequestException(
        'Teacher has not connected Google Calendar',
      );
    }

    // Check for scheduling conflicts (teacher already has a lesson at this time)
    const conflictingLesson = await this.lessonRepo.findOne({
      where: {
        teacherId: teacherId,
        startTime: startTime,
      },
    });

    if (conflictingLesson) {
      throw new BadRequestException('You already have a lesson at this time');
    }

    try {
      // Create Google Calendar event
      const calendar = this.calendarService.getClient(teacher);

      const event = await calendar.events.insert({
        calendarId: 'primary',
        conferenceDataVersion: 1,
        requestBody: {
          summary: `Lesson: ${dto.name}`,
          description: 'Available lesson slot for students to book',
          start: {
            dateTime: startTime.toISOString(),
            timeZone: 'Asia/Tashkent',
          },
          end: {
            dateTime: endTime.toISOString(),
            timeZone: 'Asia/Tashkent',
          },
          conferenceData: {
            createRequest: {
              requestId: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              conferenceSolutionKey: { type: 'hangoutsMeet' },
            },
          },
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'email', minutes: 24 * 60 }, // 1 day before
              { method: 'popup', minutes: 30 }, // 30 minutes before
            ],
          },
        },
      });

      // Create lesson in database (without student initially)
      const lesson = this.lessonRepo.create({
        name: dto.name,
        startTime,
        endTime,
        price: dto.price,
        status: dto.status ?? LessonStatus.AVAILABLE,
        isPaid: dto.isPaid ?? false,
        teacherId: teacherId,
        googleMeetUrl: event.data.hangoutLink ?? undefined,
        googleEventId: event.data.id ?? undefined,
      });

      // Assign teacher relation
      lesson.teacher = teacher;

      return await this.lessonRepo.save(lesson);
    } catch (error) {
      // Handle Google Calendar API errors
      if (error.code === 401) {
        throw new BadRequestException(
          'Google Calendar authorization expired. Please reconnect.',
        );
      }
      if (error.code === 403) {
        throw new BadRequestException(
          'Insufficient permissions for Google Calendar',
        );
      }
      throw new BadRequestException(
        `Failed to create lesson: ${error.message}`,
      );
    }
  }
  // lesson.service.ts
  // lesson.service.ts
  async lessonComplete(
    teacherId: string,
    dto: LessonComplete,
    lessonId: string,
  ) {
    // Lessonni topish
    const lesson = await this.lessonRepo.findOne({
      where: { id: lessonId },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    // Teacher tegishliligini tekshirish
    if (lesson.teacherId !== teacherId) {
      throw new ForbiddenException('You can only complete your own lessons');
    }

    // Agar allaqachon completed bo'lsa
    if (lesson.status === LessonStatus.COMPLETED) {
      throw new BadRequestException('Lesson is already completed');
    }

          console.log(teacherId, lesson);


    return await this.lessonRepo.manager.transaction(async (manager) => {
      // LessonHistory yaratish - faqat schemadagi maydonlar
      const lessonHistory = await manager.save(LessonHistory, {
        lessonId: lessonId,
        star: dto.star || Rating.FIVE,
        feedback: dto.feedback || 'feedback mavjud emas',
        teacherId: lesson.teacherId,
        studentId: lesson.studentId,
      });

      // Lessonni o'chirish
      await manager.delete(Lesson, lessonId);

      return successRes({
        message: 'Lesson completed and moved to history',
        lessonHistory,
      });
    });
  }
  /**
   * Student darsni booking qiladi
   */
  async bookLesson(lessonId: string, studentId: string): Promise<Lesson> {
    // Find lesson
    const lesson = await this.lessonRepo.findOne({
      where: { id: lessonId },
      relations: ['teacher'],
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${lessonId} not found`);
    }

    // Check if lesson is available
    if (lesson.status !== LessonStatus.AVAILABLE) {
      throw new BadRequestException('Lesson is not available for booking');
    }

    if (lesson.studentId) {
      throw new BadRequestException('Lesson is already booked');
    }

    // Find student
    const student = await this.studentRepo.findOne({
      where: { id: studentId },
    });
    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    // Check if student has conflicting lessons
    const conflictingLesson = await this.lessonRepo.findOne({
      where: {
        studentId: studentId,
        startTime: lesson.startTime,
      },
    });

    if (conflictingLesson) {
      throw new BadRequestException('You already have a lesson at this time');
    }

    try {
      // Update Google Calendar event with student info
      if (lesson.googleEventId && lesson.teacher) {
        const calendar = this.calendarService.getClient(lesson.teacher);

        await calendar.events.patch({
          calendarId: 'primary',
          eventId: lesson.googleEventId,
          requestBody: {
            description: `Lesson booked by: ${student.firstName || ''} ${student.lastName || ''}`,
          },
        });
      }

      // Update lesson with student
      lesson.studentId = studentId;
      lesson.student = student;
      lesson.status = LessonStatus.BOOKED;
      lesson.bookedAt = new Date();

      return await this.lessonRepo.save(lesson);
    } catch (error) {
      throw new BadRequestException(`Failed to book lesson: ${error.message}`);
    }
  }

  /**
   * Darsni yangilash
   */
  async updateLesson(id: string, dto: UpdateLessonDto): Promise<Lesson> {
    const lesson = await this.lessonRepo.findOne({
      where: { id },
      relations: ['teacher', 'student'],
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }

    // If time is being updated, validate and update Google Calendar
    if (dto.startTime || dto.endTime) {
      const startTime = dto.startTime
        ? new Date(dto.startTime)
        : lesson.startTime;
      const endTime = dto.endTime ? new Date(dto.endTime) : lesson.endTime;

      if (startTime >= endTime) {
        throw new BadRequestException('End time must be after start time');
      }

      if (lesson.googleEventId && lesson.teacher) {
        try {
          const calendar = this.calendarService.getClient(lesson.teacher);

          await calendar.events.patch({
            calendarId: 'primary',
            eventId: lesson.googleEventId,
            requestBody: {
              start: {
                dateTime: startTime.toISOString(),
                timeZone: 'Asia/Tashkent',
              },
              end: {
                dateTime: endTime.toISOString(),
                timeZone: 'Asia/Tashkent',
              },
            },
          });
        } catch (error) {
          throw new BadRequestException(
            `Failed to update Google Calendar event: ${error.message}`,
          );
        }
      }

      lesson.startTime = startTime;
      lesson.endTime = endTime;
    }

    // Update other fields
    if (dto.name) lesson.name = dto.name;
    if (dto.status) lesson.status = dto.status;
    if (dto.price !== undefined) lesson.price = dto.price;
    if (dto.isPaid !== undefined) lesson.isPaid = dto.isPaid;

    return await this.lessonRepo.save(lesson);
  }

  /**
   * Darsni o'chirish
   */
  async deleteLesson(id: string): Promise<void> {
    const lesson = await this.lessonRepo.findOne({
      where: { id },
      relations: ['teacher'],
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }

    // Delete Google Calendar event
    if (lesson.googleEventId && lesson.teacher) {
      try {
        const calendar = this.calendarService.getClient(lesson.teacher);
        await calendar.events.delete({
          calendarId: 'primary',
          eventId: lesson.googleEventId,
        });
      } catch (error) {
        console.error('Failed to delete Google Calendar event:', error.message);
        // Continue with lesson deletion even if Calendar deletion fails
      }
    }

    await this.lessonRepo.remove(lesson);
  }

  /**
   * Barcha bo'sh darslarni olish (studentlar uchun)
   */
  async getAvailableLessons(): Promise<Lesson[]> {
    return await this.lessonRepo.find({
      where: {
        status: LessonStatus.AVAILABLE,
      },
      relations: ['teacher'],
      order: { startTime: 'ASC' },
    });
  }

  /**
   * Student o'z darslarini ko'radi
   */
  async getMyLessons(studentId: string): Promise<Lesson[]> {
    return await this.lessonRepo.find({
      where: { studentId },
      relations: ['teacher'],
      order: { startTime: 'ASC' },
    });
  }

  /**
   * Teacher o'z darslarini ko'radi
   */
  async getTeacherLessons(teacherId: string): Promise<Lesson[]> {
    return await this.lessonRepo.find({
      where: { teacherId },
      relations: ['student'],
      order: { startTime: 'ASC' },
    });
  }
}
