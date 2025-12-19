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

  @ApiBearerAuth()
  @Post('google/send-otp')
  async sendOtp(@Body() dto: SendOtpDto, @Req() req) {
    const authHeader = req.headers.authorization;
    if (!authHeader) throw new UnauthorizedException('Token taqdim etilmadi');

    try {
      const token = authHeader.split(' ')[1];
      const decoded = this.jwtService.verify(token); // XATO SHU YERDA SODIR BO'LYAPTI

      // ... qolgan mantiq
    } catch (error) {
      // Agar token muddati o'tgan yoki noto'g'ri bo'lsa, 401 qaytaramiz
      throw new UnauthorizedException('Token yaroqsiz yoki muddati otgan');
    }
  }

  @Post('google/verify-otp')
  @ApiOperation({
    summary: 'Step 2: OTP tasdiqlash va Registratsiyani yakunlash',
  })
  async verifyOtp(@Body() body: { phoneNumber: string; otp: string }) {
    const data = await this.teacherService.getOtpFromRedis(body.phoneNumber);

    if (!data || data.otp !== body.otp) {
      throw new UnauthorizedException("OTP xato yoki muddati o'tgan");
    }

    // Bazaga isActive: false holatida saqlash
    const teacher = await this.teacherService.createFinalTeacher(data);

    // Redis-dan o'chirish
    await this.teacherService.deleteOtpFromRedis(body.phoneNumber);

    return {
      message:
        "Ro'yxatdan o'tdingiz. Akkauntingiz admin tomonidan tasdiqlangach faollashadi.",
      teacher: {
        id: teacher.id,
        fullName: teacher.fullName,
        email: teacher.email,
        isActive: teacher.isActive,
      },
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
