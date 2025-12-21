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
  Patch,
  Param,
  Delete,
  BadRequestException,
} from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { JwtService } from '@nestjs/jwt';
import type { Response } from 'express';
import { config } from 'src/config';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { SendOtpDto } from './dto/send-otp.dto';
import { AccessRoles } from 'src/common/decorator/roles.decorator';
import { Roles } from 'src/common/enum/index.enum';
import { RolesGuard } from 'src/common/guard/role.guard';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { AuthGuard as AuthPassportGuard } from '@nestjs/passport';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import type { IToken } from 'src/infrastructure/token/interface';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';
import { SoftDeleteDto } from './dto/soft-delete.dto';
import { randomUUID } from 'crypto';
import { InjectRedis } from '@songkeys/nestjs-redis';
import Redis from 'ioredis';
import { VerifyTelegramOtpDto } from './dto/verify-otp.dto';

@ApiTags('Teacher - Google OAuth')
@Controller('teacher')
export class TeacherController {
  constructor(
    private teacherService: TeacherService,
    private jwtService: JwtService,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  // ==================   GOOGLE CALLBACK     ====================================================================================================================

  // teacher.controller.ts

  @Get('google/callback')
  @UseGuards(AuthPassportGuard('google'))
  async googleCallback(@Req() req, @Res() res: Response) {
    const googleUser = req.user;
    try {
      await this.teacherService.createIncompleteGoogleTeacher({
        email: googleUser.email,
        fullName: googleUser.fullName,
        googleId: googleUser.googleId,
        imageUrl: googleUser.imageUrl,
        accessToken: googleUser.accessToken,
        refreshToken: googleUser.refreshToken,
      });

      const completeTeacher =
        await this.teacherService.findCompleteGoogleTeacher(googleUser.email);

      if (completeTeacher && completeTeacher.isComplete) {
        const token = this.jwtService.sign({
          id: completeTeacher.id,
          email: completeTeacher.email,
        });
        return res.redirect(
          `${config.FRONTEND_URL}/login/success?token=${token}`,
        );
      }

      return res.redirect(
        `${config.SWAGGER_URL}#/Teacher%20-%20Google%20OAuth/TeacherController_sendOtp`,
      );
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  // ==================   SEND OTP     ====================================================================================================================

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
        google_callback_url: config.GOOGLE_AUTH.GOOGLE_CALLBACK_URL,
      };
    }

    const phoneCheck = await this.teacherService.findTeacherByPhone(
      body.phoneNumber,
    );
    if (phoneCheck) {
      throw new ConflictException('Bu telefon raqami band');
    }

    const token = randomUUID();

    await this.redis.set(
      `tg:register:${token}`,
      JSON.stringify({
        email: body.email,
        password: body.password,
      }),
      'EX',
      300,
    );

    return {
      message: 'Telegram botga o‘ting va telefon raqamingizni tasdiqlang',
      telegram_url: `https://t.me/hmhy_otp_bot?start=${token}`,
    };
  }

  // ==================   VERIFY OTP     ====================================================================================================================

  @Post('google/verify-telegram')
  async verifyTelegram(@Body() body: VerifyTelegramOtpDto) {
    const otpData = await this.redis.get(`otp:${body.phoneNumber}`);
    if (!otpData) {
      throw new BadRequestException('OTP muddati o‘tgan');
    }

    const parsedOtp = JSON.parse(otpData);
    if (parsedOtp.otp !== body.otp) {
      throw new BadRequestException('OTP noto‘g‘ri');
    }

    const registerData = await this.redis.get(`tg:register:${body.token}`);
    if (!registerData) {
      throw new BadRequestException('Token eskirgan');
    }

    const { email, password } = JSON.parse(registerData);

    const teacher = await this.teacherService.activateTeacher(
      email,
      body.phoneNumber,
      password,
    );

    await this.redis.del(`otp:${body.phoneNumber}`);
    await this.redis.del(`tg:register:${body.token}`);

    return {
      message:
        "Muvaffaqiyatli ro'yxatdan o'tdingiz. Admin tasdiqlashini kuting.",
      teacherId: teacher.id,
      status: 'Pending Admin Approval',
    };
  }

  // ================ CRUD ETC ====================================================================================

  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @AccessRoles(Roles.SUPER_ADMIN, Roles.ADMIN)
  @Patch('soft-delete/:id')
  softDelete(
    @Param('id') id: string,
    @Body() dto: SoftDeleteDto,
    @CurrentUser() adminId: IToken,
  ) {
    return this.teacherService.softDelete(id, dto, adminId.id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @AccessRoles(Roles.SUPER_ADMIN, Roles.ADMIN)
  @Get()
  @ApiOperation({ summary: 'Get all teachers' })
  @ApiResponse({ status: 200, description: 'Teachers list' })
  async findAll() {
    return this.teacherService.findAll({ where: { isActive: true } });
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @AccessRoles(Roles.SUPER_ADMIN, Roles.ADMIN)
  @Get('applications')
  findAllApplications() {
    return this.teacherService.findAll({
      where: { isActive: false },
    });
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
  hardDetete(@Param('id') id: string) {
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
  @AccessRoles(Roles.SUPER_ADMIN, Roles.ADMIN, 'ID')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teacherService.findOneById(id);
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
  @AccessRoles(Roles.TEACHER)
  @Patch('changePassword')
  changePassword(@CurrentUser() user: IToken, @Body() dto: ChangePasswordDto) {
    return this.teacherService.changePassword(user.id, dto);
  }
}
