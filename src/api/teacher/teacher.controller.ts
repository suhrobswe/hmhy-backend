import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Res,
  UseGuards,
  UnauthorizedException,
  HttpStatus,
  ConflictException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TeacherService } from './teacher.service';
import { JwtService } from '@nestjs/jwt';
import type { Response } from 'express';
import { config } from 'src/config';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiHeader,
  ApiBody,
} from '@nestjs/swagger';
import { CompleteGoogleRegistrationDto } from './dto/google-oauth.dti';
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
  // teacher.controller.ts
  // teacher.controller.ts
  // teacher.controller.ts

  @Post('google/send-otp')
  @ApiOperation({
    summary: 'Google-dan so‘ng email, telefon va parol kiritish',
  })
  async sendOtp(@Body() body: SendOtpDto) {
    // 1. Email bazada borligini tekshirish
    const teacher = await this.teacherService.findByEmail(body.email);

    // 2. Agar email yo'q bo'lsa, qaytadan Google-dan o'tishni so'rash
    if (!teacher) {
      return {
        message:
          "Email bazada topilmadi. Avval Google orqali ro'yxatdan o'ting.",
        google_callback_url: config.GOOGLE_AUTH.GOOGLE_CALBACK_URL, // Siz so'ragan qaytish linki
      };
    }

    // 3. Telefon band emasligini tekshirish
    const phoneCheck = await this.teacherService.findTeacherByPhone(
      body.phoneNumber,
    );
    if (phoneCheck) throw new ConflictException('Bu telefon raqami band');

    // 4. OTP yaratish va Redis-ga saqlash
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

  @Post('google/complete-registration')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Complete Google registration',
    description:
      'Complete registration after Google OAuth by providing phone number and password. Use temporary token from callback redirect.',
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer {temporary_token}',
    required: true,
    example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @ApiBody({
    type: CompleteGoogleRegistrationDto,
    description: 'Registration completion data',
    examples: {
      basic: {
        summary: 'Basic registration',
        value: {
          phoneNumber: '+998901234567',
          password: 'SecurePass123!',
        },
      },
      full: {
        summary: 'Full registration with all fields',
        value: {
          phoneNumber: '+998901234567',
          password: 'SecurePass123!',
          cardNumber: '1234567890123456',
          specification: 'ENGLISH',
          level: 'B2',
          description: 'Experienced English teacher',
          hourPrice: 50000,
          portfolioLink: 'https://portfolio.example.com',
          experience: '5 years',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Registration completed successfully',
    schema: {
      example: {
        message: 'Registration completed successfully',
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        teacher: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'teacher@example.com',
          fullName: 'John Doe',
          phoneNumber: '+998901234567',
          imageUrl: 'https://lh3.googleusercontent.com/...',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or missing token',
    schema: {
      example: {
        statusCode: 401,
        message: 'Token not provided',
        error: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Incomplete registration not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Incomplete registration not found',
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Phone number already in use',
    schema: {
      example: {
        statusCode: 409,
        message: 'Phone number already in use',
        error: 'Conflict',
      },
    },
  })
  async completeRegistration(
    @Body() dto: CompleteGoogleRegistrationDto,
    @Req() req,
  ) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('Token not provided');
    }

    const token = authHeader.split(' ')[1];
    let decoded;

    try {
      decoded = this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('Invalid token');
    }

    if (decoded.type !== 'google-registration') {
      throw new UnauthorizedException('Invalid token type');
    }

    const teacher = await this.teacherService.completeGoogleRegistration(
      decoded.email,
      dto,
    );

    const accessToken = this.jwtService.sign({
      id: teacher.id,
      email: teacher.email,
    });

    return {
      message: 'Registration completed successfully',
      accessToken,
      teacher: {
        id: teacher.id,
        email: teacher.email,
        fullName: teacher.fullName,
        phoneNumber: teacher.phoneNumber,
        imageUrl: teacher.imageUrl,
      },
    };
  }
}
