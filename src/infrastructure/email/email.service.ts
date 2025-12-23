import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Welcome email yuborish (Student registration)
   */
  async sendWelcomeEmail(data: {
    email: string;
    firstName: string;
    lastName: string;
  }): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: data.email,
        subject: 'Welcome to HMHY Education! 🎓',
        template: './welcome',
        context: {
          firstName: data.firstName,
          lastName: data.lastName,
          appUrl: this.configService.get('APP_URL'),
        },
      });

      this.logger.log(`Welcome email sent to ${data.email}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${data.email}:`, error);
      throw error;
    }
  }

  /**
   * Lesson reminder email (30 min oldin)
   */
  async sendLessonReminder(data: {
    email: string;
    studentName: string;
    teacherName: string;
    subject: string;
    startTime: Date;
    meetLink?: string;
  }): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: data.email,
        subject: `Lesson Reminder: ${data.subject} 📚`,
        template: './lesson-reminder',
        context: {
          studentName: data.studentName,
          teacherName: data.teacherName,
          subject: data.subject,
          startTime: data.startTime.toLocaleString('uz-UZ'),
          meetLink: data.meetLink,
        },
      });

      this.logger.log(`Lesson reminder sent to ${data.email}`);
    } catch (error) {
      this.logger.error(`Failed to send lesson reminder to ${data.email}:`, error);
    }
  }

  /**
   * Payment confirmation email
   */
  async sendPaymentConfirmation(data: {
    email: string;
    studentName: string;
    amount: number;
    transactionId: string;
    lessonSubject?: string;
    paymentDate: Date;
  }): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: data.email,
        subject: 'Payment Confirmation ✅',
        template: './payment-confirmation',
        context: {
          studentName: data.studentName,
          amount: data.amount.toLocaleString(),
          transactionId: data.transactionId,
          lessonSubject: data.lessonSubject,
          paymentDate: data.paymentDate.toLocaleString('uz-UZ'),
        },
      });

      this.logger.log(`Payment confirmation sent to ${data.email}`);
    } catch (error) {
      this.logger.error(`Failed to send payment confirmation to ${data.email}:`, error);
    }
  }

  /**
   * Teacher payment notification
   */
  async sendTeacherPaymentNotification(data: {
    email: string;
    teacherName: string;
    amount: number;
    period: string;
    totalLessons: number;
  }): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: data.email,
        subject: 'Payment Notification 💰',
        template: './teacher-payment',
        context: {
          teacherName: data.teacherName,
          amount: data.amount.toLocaleString(),
          period: data.period,
          totalLessons: data.totalLessons,
        },
      });

      this.logger.log(`Teacher payment notification sent to ${data.email}`);
    } catch (error) {
      this.logger.error(`Failed to send teacher payment notification to ${data.email}:`, error);
    }
  }

  /**
   * Generic email yuborish
   */
  async sendEmail(data: {
    to: string;
    subject: string;
    text?: string;
    html?: string;
  }): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: data.to,
        subject: data.subject,
        text: data.text,
        html: data.html,
      });

      this.logger.log(`Email sent to ${data.to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${data.to}:`, error);
      throw error;
    }
  }

  /**
   * Bulk email yuborish
   */
  async sendBulkEmail(data: {
    recipients: string[];
    subject: string;
    text?: string;
    html?: string;
  }): Promise<void> {
    const promises = data.recipients.map((email) =>
      this.sendEmail({
        to: email,
        subject: data.subject,
        text: data.text,
        html: data.html,
      }),
    );

    await Promise.allSettled(promises);
    this.logger.log(`Bulk email sent to ${data.recipients.length} recipients`);
  }

  async sendTeacherLessonReminder(data: {
  email: string;
  teacherName: string;
  studentName: string;
  subject: string;
  startTime: Date;
  meetLink?: string;
}): Promise<void> {
  try {
    await this.mailerService.sendMail({
      to: data.email,
      subject: `Lesson Reminder: ${data.subject} 📚`,
      template: './teacher-lesson-reminder',
      context: {
        teacherName: data.teacherName,
        studentName: data.studentName,
        subject: data.subject,
        startTime: data.startTime.toLocaleString('uz-UZ'),
        meetLink: data.meetLink,
      },
    });

    this.logger.log(`Teacher lesson reminder sent to ${data.email}`);
  } catch (error) {
    this.logger.error(`Failed to send teacher lesson reminder to ${data.email}:`, error);
  }
}

/**
 * Teacher'ga welcome email
 */
async sendTeacherWelcomeEmail(data: {
  email: string;
  firstName: string;
  lastName: string;
}): Promise<void> {
  try {
    await this.mailerService.sendMail({
      to: data.email,
      subject: 'Welcome to HMHY Education! 🎓',
      template: './teacher-welcome',
      context: {
        firstName: data.firstName,
        lastName: data.lastName,
        appUrl: this.configService.get('APP_URL'),
      },
    });

    this.logger.log(`Teacher welcome email sent to ${data.email}`);
  } catch (error) {
    this.logger.error(`Failed to send teacher welcome email to ${data.email}:`, error);
    throw error;
  }
}
}