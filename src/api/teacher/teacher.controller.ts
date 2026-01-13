import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Res,
  UseGuards,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { JwtService } from '@nestjs/jwt';
import type { Response } from 'express';
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
import passport from 'passport';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@ApiTags('Teacher - Google OAuth')
@Controller('teacher')
export class TeacherController {
  constructor(
    private teacherService: TeacherService,
    private jwtService: JwtService,
  ) {}

  // Google OAuth endpoints
  @Get('google')
  @ApiOperation({ summary: 'Google OAuth login' })
  googleLogin(@Req() req, @Res() res) {
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

        req.logIn(user, (loginErr) => {
          if (loginErr) {
            return res
              .status(500)
              .json({ error: 'Login failed', details: loginErr });
          }
          return res.redirect('/dashboard');
        });
      },
    )(req, res);
  }

  @Get('google/callback')
  @UseGuards(AuthPassportGuard('google'))
  async googleCallback(@Req() req, @Res() res: Response) {
    const googleUser = req.user;

    try {
      const teacher = await this.teacherService.findCompleteGoogleTeacher(
        googleUser.email,
      );

      if (teacher) {
        return res.redirect(`${config.FRONTEND_URL}/login/teacher`);
      }

      await this.teacherService.createIncompleteGoogleTeacher({
        email: googleUser.email,
        fullName: googleUser.fullName,
        googleId: googleUser.googleId,
        imageUrl: googleUser.imageUrl,
        accessToken: googleUser.accessToken,
        refreshToken: googleUser.refreshToken,
      });

      const registerUrl = `${config.FRONTEND_URL}/teacher/register?email=${encodeURIComponent(googleUser.email)}`;
      return res.redirect(registerUrl);
    } catch (error) {
      console.error('Google Auth Error:', error);
      return res.redirect(`${config.FRONTEND_URL}/auth-error`);
    }
  }

  @Post('google/send-otp')
  async sendOtp(@Body() body: SendOtpDto) {
    return await this.teacherService.initiateGoogleRegistration(body);
  }

  @Post('google/verify-otp')
  async verifyOtp(
    @Body() body: VerifyOtpDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.teacherService.verifyAndActivate(body, res);
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @AccessRoles(Roles.TEACHER)
  getMe(@CurrentUser() user: IToken) {
    return this.teacherService.findOneById(user.id, {
      select: {
        id: true,
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
  findAll(@Query() query: PaginationDto) {
    return this.teacherService.findAllWithPagination({
      page: query.page,
      limit: query.limit,
      where: { isDelete: false, isComplete: true },
      select: {
        id: true,
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
        isActive: true,
      },
    });
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @AccessRoles(Roles.SUPER_ADMIN)
  @Get('deleted')
  findAllDeleted() {
    return this.teacherService.findAll({
      where: { isDelete: true },
      select: {
        id: true,
        fullName: true,
        imageUrl: true,
        deletedBy: true,
        reasonDelete: true,
        email: true,
        phoneNumber: true,
        level: true,
        isActive: true,
        isDelete: true,
        rating: true,
        specification: true,
        hourPrice: true,
        experience: true,
        description: true,
        portfolioLink: true,
      },
    });
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @AccessRoles(Roles.SUPER_ADMIN, Roles.ADMIN)
  @Get('applications')
  findAllApplications() {
    return this.teacherService.findAll({
      where: { isActive: false },
      select: {
        id: true,
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
  @AccessRoles(Roles.TEACHER, 'ID')
  @Patch('update')
  update(@CurrentUser() user: IToken, @Body() dto: UpdateTeacherDto) {
    return this.teacherService.updateTeacher(user.id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @AccessRoles(Roles.TEACHER, 'ID')
  @Patch('changePassword')
  changePassword(@CurrentUser() user: IToken, @Body() dto: ChangePasswordDto) {
    return this.teacherService.changePassword(user.id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @AccessRoles(Roles.SUPER_ADMIN, Roles.ADMIN)
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    const options: any = {
      relations: {
        lessons: {
          student: true,
        },
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        description: true,
        experience: true,
        hourPrice: true,
        imageUrl: true,
        level: true,
        portfolioLink: true,
        rating: true,
        specification: true,
        createdAt: true,
        updatedAt: true,
        isActive: true,
      },
    };
    return this.teacherService.findOneById(id, options);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @AccessRoles(Roles.SUPER_ADMIN, Roles.ADMIN)
  @Patch('activate/:id')
  teacherActivate(@Param('id', ParseUUIDPipe) id: string) {
    return this.teacherService.updateStatus(id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @AccessRoles(Roles.SUPER_ADMIN)
  @Patch('restore/:id')
  restoreTeacher(@Param('id', ParseUUIDPipe) id: string) {
    return this.teacherService.restoreTeacher(id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @AccessRoles(Roles.SUPER_ADMIN)
  @Delete('hard-delete/:id')
  hardDelete(@Param('id', ParseUUIDPipe) id: string) {
    return this.teacherService.delete(id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @AccessRoles(Roles.SUPER_ADMIN, Roles.ADMIN)
  @Patch(':id')
  updateForAdmin(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTeacherDto,
  ) {
    return this.teacherService.updateTeacherForAdmin(id, dto);
  }
}
