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

@ApiTags('Teacher - Google OAuth')
@Controller('teacher')
export class TeacherController {
  constructor(
    private teacherService: TeacherService,
    private jwtService: JwtService,
  ) {}
  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({
    summary: 'Start Google OAuth login',
    description:
      '⚠️ BROWSER ORQALI TEST QILING! Swagger UI dan ishlamaydi. Browserda: http://localhost:4000/api/v1/teacher/google/callback',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirects to Google login page',
  })
  async googleAuth() {
    // Guard redirects to Google
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({
    summary: 'Google OAuth callback',
    description:
      'Google redirects here after authentication. Not testable via Swagger.',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirects to frontend with token or registration page',
  })
  async googleCallback(@Req() req, @Res() res: Response) {
    const googleUser = req.user;

    try {
      const completeTeacher =
        await this.teacherService.findCompleteGoogleTeacher(googleUser.email);

      if (completeTeacher) {
        const token = this.jwtService.sign({
          id: completeTeacher.id,
          email: completeTeacher.email,
        });

        return res.redirect(
          `${config.FRONTEND_URL}/login/success?token=${token}`,
        );
      }

      const incompleteTeacher =
        await this.teacherService.createIncompleteGoogleTeacher({
          email: googleUser.email,
          fullName: googleUser.fullName,
          imageUrl: googleUser.imageUrl,
          googleId: googleUser.googleId,
        });

      const tempToken = this.jwtService.sign(
        { email: incompleteTeacher.email, type: 'google-registration' },
        { expiresIn: '30m' },
      );

      return res.redirect(
        `${config.FRONTEND_URL}/register/complete?token=${tempToken}`,
      );
    } catch (error) {
      return res.redirect(
        `${config.FRONTEND_URL}/login/error?message=${error.message}`,
      );
    }
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
