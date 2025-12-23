import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateLessonHistoryDto } from './dto/create-lesson-history.dto';
import { UpdateLessonHistoryDto } from './dto/update-lesson-history.dto';
import { BaseService } from 'src/infrastructure/base/base-service';
import { ISuccess } from 'src/infrastructure/pagination/successResponse';
import { successRes } from 'src/infrastructure/response/success.response';
import { LessonHistory } from 'src/core/entity/lessonHistory.entity';
import type { LessonHistoryRepository } from 'src/core/repository/lessonHistory.repository';

@Injectable()
export class LessonHistoryService extends BaseService<
  CreateLessonHistoryDto,
  UpdateLessonHistoryDto,
  LessonHistory
> {
  constructor(
    @InjectRepository(LessonHistory)
    private readonly lessonHistoryRepository: LessonHistoryRepository,
  ) {
    super(lessonHistoryRepository);
  }

  async getStudentHistory(studentId: string): Promise<ISuccess> {
    const histories = await this.lessonHistoryRepository.find({
      where: { studentId },
      relations: ['lesson', 'lesson.teacher'],
      order: { createdAt: 'DESC' },
    });

    return successRes(histories);
  }

  /**
   * Lesson'ning barcha studentlar history'sini olish
   */
  async getLessonHistory(lessonId: string): Promise<ISuccess> {
    const histories = await this.lessonHistoryRepository.find({
      where: { lessonId },
      relations: ['student'],
      order: { createdAt: 'DESC' },
    });

    return successRes(histories);
  }

  /**
   * Date range bo'yicha history olish
   */
  async getHistoryByDateRange(
    studentId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<ISuccess> {
    const histories = await this.lessonHistoryRepository
      .createQueryBuilder('history')
      .leftJoinAndSelect('history.lesson', 'lesson')
      .leftJoinAndSelect('lesson.teacher', 'teacher')
      .where('history.studentId = :studentId', { studentId })
      .andWhere('lesson.startTime BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .orderBy('lesson.startTime', 'DESC')
      .getMany();

    return successRes(histories);
  }

  /**
   * Barcha history'larni olish (relations bilan)
   */
}
