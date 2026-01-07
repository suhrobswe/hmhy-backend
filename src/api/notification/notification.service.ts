import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Telegraf } from 'telegraf';
import { Student } from '../../core/entity/student.entity';
import { Lesson } from '../../core/entity/lesson.entity';
import { config } from 'src/config';

@Injectable()
export class NotificationService implements OnModuleInit {
  private bot: Telegraf;
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(Lesson)
    private readonly lessonRepo: Repository<Lesson>,
  ) {}

  async onModuleInit() {
    try {
      if (!config.TELEGRAM_BOT_TOKEN) {
        throw new Error(
          'TELEGRAM_BOT_TOKEN topilmadi! .env faylni tekshiring.',
        );
      }
      this.bot = new Telegraf(config.TELEGRAM_BOT_TOKEN);
      this.logger.log('✅ Telegram bot initialized');
    } catch (error) {
      this.logger.error('❌ Telegram bot initialization error:', error.message);
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleLessonReminders() {
    const now = new Date();

    const startWindow = new Date(now.getTime() - 5 * 60000);
    const endWindow = new Date(now.getTime() + 20 * 60000);

    this.logger.log('=============================================');
    this.logger.log(`⏰ Hozirgi vaqt (Server): ${now.toString()}`);
    this.logger.log(
      `🔎 Qidirilayotgan oraliq: ${startWindow.getHours()}:${startWindow.getMinutes()} dan ${endWindow.getHours()}:${endWindow.getMinutes()} gacha`,
    );

    try {
      const upcomingLessons = await this.lessonRepo.find({
        where: {
          startTime: Between(startWindow, endWindow),
        },
        relations: ['student'],
      });

      this.logger.log(
        `📊 Oraliqqa tushgan darslar soni: ${upcomingLessons.length}`,
      );

      if (upcomingLessons.length === 0) {
        this.logger.warn(
          '⚠️ Oraliqda dars topilmadi. Bazadagi yaqin 2 soatlik darslarni tekshiramiz...',
        );

        const next2Hours = new Date(now.getTime() + 120 * 60000);
        const allUpcoming = await this.lessonRepo.find({
          where: {
            startTime: Between(now, next2Hours),
          },
          order: { startTime: 'ASC' },
          take: 3,
        });

        if (allUpcoming.length > 0) {
          this.logger.log(
            '💡 Bazada quyidagi darslar mavjud (Vaqtni solishtiring!):',
          );
          allUpcoming.forEach((l) => {
            this.logger.log(
              ` - Dars: "${l.name}" | Vaqti: ${l.startTime} | (JS Date: ${new Date(l.startTime).toString()})`,
            );
          });
        } else {
          this.logger.error(
            '❌ Bazada yaqin 2 soat ichida umuman dars yoq! Yangi dars yarating.',
          );
        }
      }

      for (const lesson of upcomingLessons) {
        const student = lesson.student;

        if (!student) {
          this.logger.warn(
            `⚠️ Dars ID: ${lesson.id} uchun student biriktirilmagan.`,
          );
          continue;
        }

        await this.sendTelegramReminder(student, lesson);
      }
    } catch (error) {
      this.logger.error('❌ Darslarni qidirishda xatolik:', error.message);
    }

    this.logger.log('=============================================');
  }

  private async sendTelegramReminder(student: Student, lesson: Lesson) {
    if (!student.tgId) {
      this.logger.warn(`⚠️ Student (ID: ${student.id}) da Telegram ID yo'q.`);
      return;
    }

    const dateObj = new Date(lesson.startTime);
    const timeString = dateObj.toLocaleTimeString('uz-UZ', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Tashkent',
    });

    const message =
      `🔔 *Dars eslatmasi!*\n\n` +
      `📚 *Fan:* ${lesson.name || 'Dars'}\n` +
      `⏰ *Vaqt:* ${timeString}\n` +
      `📍 *Link:* ${lesson.googleMeetUrl || 'Onlayn'}\n\n` +
      `Iltimos, darsga kechikmasdan kiring!`;

    try {
      if (!this.bot) {
        this.logger.error('❌ Bot initialized emas.');
        return;
      }

      await this.bot.telegram.sendMessage(student.tgId, message, {
        parse_mode: 'Markdown',
      });
      this.logger.log(
        `✅ Xabar yuborildi: ${student.id || 'Student'} (TG: ${student.tgId})`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Telegram xabar yuborishda xatolik (TG ID: ${student.tgId}): ${error.message}`,
      );
    }
  }
}
