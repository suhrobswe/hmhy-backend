import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Telegraf, Context, Markup } from 'telegraf';
import { Student } from 'src/core/entity/student.entity';
import { Roles } from 'src/common/enum/index.enum';
import { config } from 'src/config';
import { BaseService } from 'src/infrastructure/base/base-service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import type { StudentRepository } from 'src/core/repository/student.repository';

interface SessionData {
  step:
    | 'WAITING_FIRST_NAME'
    | 'WAITING_LAST_NAME'
    | 'WAITING_PHONE'
    | 'COMPLETED';
  firstName?: string;
  lastName?: string;
}

@Injectable()
export class StudentService extends BaseService<
  CreateStudentDto,
  UpdateStudentDto,
  Student
> {
  private bot: Telegraf<Context>;
  private sessions: Map<number, SessionData> = new Map();
  private readonly logger = new Logger(StudentService.name);

  constructor(
    @InjectRepository(Student)
    private readonly studentRepo: StudentRepository,
  ) {
    super(studentRepo);
    this.bot = new Telegraf(config.TELEGRAM_BOT_TOKEN);
    // this.initializeBot();
  }

  private assertFrom(
    ctx: Context,
  ): asserts ctx is Context & { from: NonNullable<Context['from']> } {
    if (!ctx.from) {
      throw new Error("Foydalanuvchi ma'lumotlari topilmadi");
    }
  }

  private initializeBot() {
    this.bot.start(async (ctx) => {
      try {
        this.assertFrom(ctx);

        const tgId = ctx.from.id.toString();
        const tgUsername = ctx.from.username || null;

        const existingStudent = await this.studentRepo.findOne({
          where: { tgId },
        });

        if (existingStudent) {
          await ctx.reply(
            `Siz allaqachon ro'yxatdan o'tgansiz!\n\n` +
              `👤 Ism: ${existingStudent.firstName}\n` +
              `👤 Familiya: ${existingStudent.lastName}\n` +
              `📱 Telefon: ${existingStudent.phoneNumber}`,
          );
          return;
        }

        this.sessions.set(ctx.from.id, { step: 'WAITING_FIRST_NAME' });

        await ctx.reply(
          "👋 Assalomu aleykum! O'quv platformasiga xush kelibsiz.\n\n" +
            "📝 Ro'yxatdan o'tish uchun quyidagi ma'lumotlarni kiriting.\n\n" +
            '👤 Ismingizni kiriting:',
        );
      } catch (error) {
        this.logger.error('Start command error:', error);
        await ctx.reply("Xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring.");
      }
    });

    // Text messages
    this.bot.on('text', async (ctx) => {
      try {
        this.assertFrom(ctx);

        const session = this.sessions.get(ctx.from.id);
        if (!session) {
          await ctx.reply(
            "Ro'yxatdan o'tish uchun /start buyrug'ini yuboring.",
          );
          return;
        }

        await this.handleRegistrationStep(ctx, session);
      } catch (error) {
        this.logger.error('Text handler error:', error);
        await ctx.reply("Xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring.");
      }
    });

    this.bot.on('contact', async (ctx) => {
      try {
        this.assertFrom(ctx);

        const session = this.sessions.get(ctx.from.id);
        if (!session || session.step !== 'WAITING_PHONE') {
          await ctx.reply("Iltimos, avval /start buyrug'ini yuboring.");
          return;
        }

        if (!ctx.message || !('contact' in ctx.message)) {
          await ctx.reply('Telefon raqam topilmadi.');
          return;
        }

        const phoneNumber = ctx.message.contact.phone_number;
        await this.completeRegistration(ctx, session, phoneNumber);
      } catch (error) {
        this.logger.error('Contact handler error:', error);
        await ctx.reply("Xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring.");
      }
    });

    // Bot error catcher
    this.bot.catch((err, ctx) => {
      this.logger.error(`Bot error for ${ctx.from?.id}:`, err);
      ctx.reply("Xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring.");
    });

    this.bot.launch().then(() => {
      this.logger.log('Student registration bot started successfully');
    });

    process.once('SIGINT', () => this.bot.stop('SIGINT'));
    process.once('SIGTERM', () => this.bot.stop('SIGTERM'));
  }

  private async handleRegistrationStep(ctx: Context, session: SessionData) {
    const text = (ctx.message as any).text?.trim();
    if (!text) {
      await ctx.reply('Iltimos, matn kiriting.');
      return;
    }

    switch (session.step) {
      case 'WAITING_FIRST_NAME':
        if (text.length < 2 || text.length > 50) {
          await ctx.reply(
            "Ism 2-50 belgi orasida bo'lishi kerak. Qaytadan kiriting:",
          );
          return;
        }
        session.firstName = text;
        session.step = 'WAITING_LAST_NAME';
        this.sessions.set(ctx.from!.id, session);
        await ctx.reply('✅ Ism qabul qilindi!\n\n👤 Familiyangizni kiriting:');
        break;

      case 'WAITING_LAST_NAME':
        if (text.length < 2 || text.length > 50) {
          await ctx.reply(
            "Familiya 2-50 belgi orasida bo'lishi kerak. Qaytadan kiriting:",
          );
          return;
        }
        session.lastName = text;
        session.step = 'WAITING_PHONE';
        this.sessions.set(ctx.from!.id, session);
        await ctx.reply(
          '✅ Familiya qabul qilindi!\n\n' +
            '📱 Endi telefon raqamingizni yuboring.\n\n' +
            'Quyidagi tugmani bosing yoki +998XXXXXXXXX formatida kiriting:',
          Markup.keyboard([
            Markup.button.contactRequest('📱 Telefon raqamni ulashish'),
          ]).resize(),
        );
        break;

      case 'WAITING_PHONE':
        let phoneNumber = text.replace(/[\s\-\(\)]/g, '');
        if (!phoneNumber.startsWith('+')) phoneNumber = '+' + phoneNumber;
        const phoneRegex = /^\+?998[0-9]{9}$/;

        if (!phoneRegex.test(phoneNumber)) {
          await ctx.reply(
            "❌ Noto'g'ri telefon raqam formati!\n\n" +
              'Iltimos, +998XXXXXXXXX formatida kiriting yoki pastdagi tugmani bosing.',
            Markup.keyboard([
              Markup.button.contactRequest('📱 Telefon raqamni ulashish'),
            ]).resize(),
          );
          return;
        }

        await this.completeRegistration(ctx, session, phoneNumber);
        break;
    }
  }

  private async completeRegistration(
    ctx: Context,
    session: SessionData,
    phoneNumber: string,
  ) {
    try {
      this.assertFrom(ctx);

      const existingPhone = await this.studentRepo.findOne({
        where: { phoneNumber },
      });
      if (existingPhone) {
        await ctx.reply(
          "❌ Bu telefon raqam allaqachon ro'yxatdan o'tgan!\n\n" +
            "Boshqa raqam kiriting yoki admin bilan bog'laning.",
          Markup.removeKeyboard(),
        );
        return;
      }

      const student = this.studentRepo.create({
        firstName: session.firstName,
        lastName: session.lastName,
        phoneNumber,
        tgId: ctx.from.id.toString(),
        tgUsername: ctx.from.username,
        role: Roles.STUDENT,
        isBlocked: false,
      });

      await this.studentRepo.save(student);

      this.sessions.delete(ctx.from.id);

      await ctx.reply(
        "✅ Ro'yxatdan o'tish muvaffaqiyatli yakunlandi!\n\n" +
          "📋 Sizning ma'lumotlaringiz:\n" +
          `👤 Ism: ${student.firstName}\n` +
          `👤 Familiya: ${student.lastName}\n` +
          `📱 Telefon: ${student.phoneNumber}\n` +
          `🆔 Telegram: @${student.tgUsername || "username yo'q"}\n\n` +
          "🎓 Endi siz darslarni ko'rishingiz va booking qilishingiz mumkin!",
        Markup.removeKeyboard(),
      );

      this.logger.log(
        `New student registered: ${student.id} - ${student.firstName} ${student.lastName}`,
      );
    } catch (error) {
      this.logger.error('Error completing registration:', error);
      await ctx.reply(
        "❌ Xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring.\n\nMuammo davom etsa, admin bilan bog'laning.",
        Markup.removeKeyboard(),
      );
    }
  }

  async onModuleDestroy() {
    await this.bot.stop();
    this.logger.log('Student registration bot stopped');
  }

  async getStats() {
    const [total, active, blocked] = await Promise.all([
      this.studentRepo.count(),
      this.studentRepo.count({ where: { isBlocked: false } }),
      this.studentRepo.count({ where: { isBlocked: true } }),
    ]);

    return {
      totalStudents: total,
      activeStudents: active,
      blockedStudents: blocked,
    };
  }

  async toggleStudentBlock(id: string) {
    const student = await this.studentRepo.findOne({ where: { id } });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    student.isBlocked = !student.isBlocked;

    return await this.studentRepo.save(student);
  }
}
