import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Res,
  UseGuards,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TeacherService } from './teacher.service';
import { JwtService } from '@nestjs/jwt';
import type { Response } from 'express';
import { config } from 'src/config';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@ApiTags('Teacher - Google OAuth')
@Controller('teacher')
export class TeacherController {
  constructor(
    private teacherService: TeacherService,
    private jwtService: JwtService,
  ) {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req, @Res() res: Response) {
    const googleUser = req.user;
    try {
      const completeTeacher =
        (await this.teacherService.findCompleteGoogleTeacher(
          googleUser.email,
        )) as any;

      if (completeTeacher) {
        const token = this.jwtService.sign({
          id: completeTeacher.id,
          email: completeTeacher.email,
        });
        return res.redirect(
          `http://localhost:4000/api/docs#/Teacher%20-%20Google%20OAuth?token=${token}`,
        );
      }

      const tempToken = this.jwtService.sign(
        {
          email: googleUser.email,
          fullName: googleUser.fullName,
          imageUrl: googleUser.imageUrl,
          googleId: googleUser.googleId,
          type: 'google-registration',
        },
        { expiresIn: '15m' },
      );

      return res.redirect(
        `http://localhost:4000/api/docs#/Teacher%20-%20Google%20OAuth/TeacherController_completeRegistration?token=${tempToken}`,
      );
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
  @Post('google/send-otp')
  @ApiOperation({
    summary: 'Google-dan so‘ng email, telefon va parol kiritish',
  })
  async sendOtp(@Body() body: SendOtpDto) {
    const teacher = await this.teacherService.findByEmail(body.email);

    if (!teacher) {
      return {
        message:
          "Email bazada topilmadi. Avval Google orqali ro'yxatdan o'ting.",
        google_callback_url: config.GOOGLE_AUTH.GOOGLE_CALBACK_URL, // Siz so'ragan qaytish linki
      };
    }

    const phoneCheck = await this.teacherService.findTeacherByPhone(
      body.phoneNumber,
    );
    if (phoneCheck) throw new ConflictException('Bu telefon raqami band');

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await this.teacherService.saveOtpToRedis(body.phoneNumber, {
      email: body.email,
      password: body.password,
      phoneNumber: body.phoneNumber,
      otp,
    });

    return {
      message: 'OTP telefon raqamga yuborildi',
      otp: otp,
      verify_link: `${config.BACKEND_URL}/teacher/google/verify-otp`,
    };
  }

  @Post('google/verify-otp')
  @ApiOperation({ summary: 'OTP-ni tasdiqlash va faollashtirish' })
  async verifyOtp(@Body() body: VerifyOtpDto) {
    const data = await this.teacherService.getOtpFromRedis(body.phoneNumber);

    if (!data || data.otp !== body.otp) {
      throw new UnauthorizedException("OTP xato yoki muddati o'tgan");
    }

    // Ma'lumotlarni bazada yangilash (isComplete: true)
    const teacher = await this.teacherService.activateTeacher(
      data.email,
      data.phoneNumber,
      data.password,
    );

    await this.teacherService.deleteOtpFromRedis(body.phoneNumber);

    return {
      message:
        "Muvaffaqiyatli ro'yxatdan o'tdingiz. Admin tasdiqlashini kuting.",
      teacherId: teacher.id,
      status: 'Pending Admin Approval',
    };
  }
}
