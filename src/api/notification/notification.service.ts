import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Telegraf } from 'telegraf';
import { Student } from '../../core/entity/student.entity';
import { Lesson } from '../../core/entity/lesson.entity';
import { config } from 'src/config';

@Injectable()
export class NotificationService {
  private bot: Telegraf;
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(Lesson)
    private readonly lessonRepo: Repository<Lesson>,
  ) {
    this.bot = new Telegraf(config.TELEGRAM_BOT_TOKEN);
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleLessonReminders() {
    this.logger.log('Dars eslatmalarini tekshirish boshlandi...');

    const now = new Date();
    const in15Minutes = new Date(now.getTime() + 15 * 60000);
    const in25Minutes = new Date(now.getTime() + 25 * 60000);

    const upcomingLessons = await this.lessonRepo.find({
      where: {
        startTime: Between(in15Minutes, in25Minutes),
        // Agar entityda hali isCancelled bo'lmasa, pastdagi qatorni o'chirib turing:
        // isCancelled: false,
      } as any, // Vaqtincha xatolikni chetlab o'tish uchun 'as any' ishlatsa bo'ladi
      relations: ['student'], // Entityda nomlanishi qanday bo'lsa o'shani yozing
    });

    for (const lesson of upcomingLessons) {
      // Entitydagi bog'liqlik nomini tekshiring (students yoki student)
      const participants = (lesson as any).students || (lesson as any).student;

      if (participants && participants.length > 0) {
        for (const student of participants) {
          await this.sendTelegramReminder(student, lesson);
        }
      }
    }
  }

  private async sendTelegramReminder(student: Student, lesson: Lesson) {
    if (!student.tgId || student.isBlocked) return;

    const timeString = lesson.startTime.toLocaleTimeString('uz-UZ', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const message =
      `🔔 *Dars eslatmasi!*\n\n` +
      `📚 *Fan:* ${(lesson as any).title || 'Dars'}\n` +
      `⏰ *Vaqt:* ${timeString}\n` +
      `📍 *Joy:* ${(lesson as any).room || 'Onlayn'}\n\n` +
      `Iltimos, darsga kechikmasdan kiring!`;

    try {
      await this.bot.telegram.sendMessage(student.tgId, message, {
        parse_mode: 'Markdown',
      });
      this.logger.log(
        `Eslatma yuborildi: Student ID ${student.id} (TG: ${student.tgId})`,
      );
    } catch (error) {
      this.logger.error(
        `Telegram xabar yuborishda xatolik (Student: ${student.id}):`,
        error.message,
      );
    }
  }
}
