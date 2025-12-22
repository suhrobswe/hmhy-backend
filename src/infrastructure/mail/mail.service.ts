import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';
import { config } from 'src/config';

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.MAIL.MAIL_HOST,
      port: config.MAIL.MAIL_PORT,
      secure: config.MAIL.MAIL_SECURE,
      auth: {
        user: config.MAIL.MAIL_USER,
        pass: config.MAIL.MAIL_PASS,
      },
    });
  }

  async sendOtp(email: string, otp: string) {
    await this.transporter.sendMail({
      from: `"HMHY" <${process.env.MAIL_USER}>`,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is: ${otp}`,
    });
  }
}
