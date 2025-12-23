import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Res,
  UseGuards,
  ConflictException,
  BadRequestException,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { JwtService } from '@nestjs/jwt';
import type { Response, Request } from 'express';
import { config } from 'src/config';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { SoftDeleteDto } from './dto/soft-delete.dto';
import { AccessRoles } from 'src/common/decorator/roles.decorator';
import { Roles } from 'src/common/enum/index.enum';
import { RolesGuard } from 'src/common/guard/role.guard';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { AuthGuard as AuthPassportGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import type { IToken } from 'src/infrastructure/token/interface';
import Redis from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { generateOtp } from 'src/common/util/otp-generator';
import passport from 'passport';
import { MailerService } from '@nestjs-modules/mailer';

@ApiTags('Teacher - Google OAuth')
@Controller('teacher')
export class TeacherController {
  constructor(
    private teacherService: TeacherService,
    private jwtService: JwtService,
    private readonly mailService: MailerService,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  // Google OAuth endpoints
  @Get('google')
  @ApiOperation({ summary: 'Google OAuth login' })
  googleLogin(@Req() req, @Res() res) {
    // Custom authenticate with prompt=consent to force refresh token
    passport.authenticate(
      'google',
      {
        scope: [
          'email',
          'profile',
          'https://www.googleapis.com/auth/calendar',
          'https://www.googleapis.com/auth/calendar.events',
        ],
        accessType: 'offline',
        prompt: 'consent',
      } as passport.AuthenticateOptions,
      (err, user, info) => {
        if (err) {
          return res
            .status(500)
            .json({ error: 'Authentication failed', details: err });
        }
        if (!user) {
          return res.status(401).json({ error: 'No user found', info });
        }

        // Manually log in the user
        req.logIn(user, (loginErr) => {
          if (loginErr) {
            return res
              .status(500)
              .json({ error: 'Login failed', details: loginErr });
          }
          return res.redirect('/dashboard'); // yoki kerakli joyga yo'naltiring
        });
      },
    )(req, res);
  }

  // ===================== GOOGLE CALLBACK =====================
  @Get('google/callback')
  @UseGuards(AuthPassportGuard('google'))
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    const googleUser = req.user as any;

    try {
      await this.teacherService.createIncompleteGoogleTeacher({
        email: googleUser.email,
        fullName: googleUser.fullName,
        googleId: googleUser.googleId,
        imageUrl: googleUser.imageUrl,
        accessToken: googleUser.accessToken,
        refreshToken: googleUser.refreshToken,
      });

      const teacher = await this.teacherService.findCompleteGoogleTeacher(
        googleUser.email,
      );

      if (teacher?.isComplete) {
        const token = this.jwtService.sign({
          id: teacher.id,
          email: teacher.email,
        });
        return res.redirect(
          `${config.SWAGGER_URL}#/Teacher%20-%20Google%20OAuth/TeacherController_sendOtp`,
        );
      }

      // Agar ro'yxat to'liq emas bo'lsa
      return res.redirect(
        `${config.SWAGGER_URL}#/Teacher%20-%20Google%20OAuth/TeacherController_sendOtp`,
      );
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  // ===================== SEND OTP =====================
  @Post('google/send-otp')
  async sendOtp(@Body() body: SendOtpDto) {
    const teacher = await this.teacherService.findByEmail(body.email);
    if (!teacher) throw new BadRequestException('Email topilmadi');

    const phoneCheck = await this.teacherService.findTeacherByPhone(
      body.phoneNumber,
    );
    if (phoneCheck) throw new ConflictException('Telefon raqami band');

    const otp = generateOtp();

    await this.redis.set(
      `otp:google:${body.email}`,
      JSON.stringify({
        otp,
        phoneNumber: body.phoneNumber,
        password: body.password,
      }),
      'EX',
      300,
    );

    // await this.mailService.sendOtp(body.email, otp); // buni tog'irlash kerak

    return { message: 'OTP emailingizga yuborildi', otp: otp };
  }

  // ===================== VERIFY OTP =====================
  @Post('google/verify-otp')
  async verifyOtp(@Body() body: VerifyOtpDto) {
    const data = await this.redis.get(`otp:google:${body.email}`);
    if (!data) throw new BadRequestException('OTP muddati o‘tgan');

    const parsed = JSON.parse(data);
    if (parsed.otp !== body.otp) throw new BadRequestException('OTP noto‘g‘ri');

    const teacher = await this.teacherService.activateTeacher(
      body.email,
      parsed.phoneNumber,
      parsed.password,
    );

    await this.redis.del(`otp:google:${body.email}`);

    return {
      message: "Ro'yxatdan o'tish yakunlandi",
      status: 'Pending Admin Approval',
      teacherId: teacher.id,
    };
  }

  // ===================== CRUD =====================
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @AccessRoles(Roles.SUPER_ADMIN, Roles.ADMIN)
  @Patch('soft-delete/:id')
  softDelete(
    @Param('id') id: string,
    @Body() dto: SoftDeleteDto,
    @CurrentUser() admin: IToken,
  ) {
    return this.teacherService.softDelete(id, dto, admin.id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @AccessRoles(Roles.SUPER_ADMIN, Roles.ADMIN)
  @Get()
  findAll() {
    return this.teacherService.findAll({
      where: { isActive: true },
      select: {
        cardNumber: true,
        description: true,
        email: true,
        fullName: true,
        phoneNumber: true,
        experience: true,
        hourPrice: true,
        imageUrl: true,
        level: true,
        portfolioLink: true,
        rating: true,
        specification: true,
      },
    });
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @AccessRoles(Roles.SUPER_ADMIN, Roles.ADMIN)
  @Get('applications')
  findAllApplications() {
    return this.teacherService.findAll({ where: { isActive: false } });
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @AccessRoles(Roles.SUPER_ADMIN, Roles.ADMIN)
  @Patch('activate/:id')
  teacherActivate(@Param('id') id: string) {
    return this.teacherService.updateStatus(id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @AccessRoles(Roles.SUPER_ADMIN)
  @Get('deleted')
  findAllDeleted() {
    return this.teacherService.findAll({ where: { isDelete: true } });
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @AccessRoles(Roles.SUPER_ADMIN)
  @Patch('restore/:id')
  restoreTeacher(@Param('id') id: string) {
    return this.teacherService.restoreTeacher(id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @AccessRoles(Roles.SUPER_ADMIN)
  @Delete('hard-delete/:id')
  hardDelete(@Param('id') id: string) {
    return this.teacherService.delete(id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @AccessRoles(Roles.TEACHER)
  @Get('me')
  getMe(@CurrentUser() user: IToken) {
    return this.teacherService.findOneById(user.id, {
      select: {
        cardNumber: true,
        description: true,
        email: true,
        fullName: true,
        phoneNumber: true,
        experience: true,
        hourPrice: true,
        imageUrl: true,
        level: true,
        portfolioLink: true,
        rating: true,
        specification: true,
      },
    });
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @AccessRoles(Roles.TEACHER)
  @Patch('update')
  update(@CurrentUser() user: IToken, @Body() dto: UpdateTeacherDto) {
    return this.teacherService.updateTeacher(user.id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @UseGuards(AuthGuard, RolesGuard)
  @AccessRoles(Roles.TEACHER)
  @Patch('changePassword')
  changePassword(@CurrentUser() user: IToken, @Body() dto: ChangePasswordDto) {
    return this.teacherService.changePassword(user.id, dto);
  }
}
