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

      return res.redirect(
        `${config.SWAGGER_URL}#/Teacher%20-%20Google%20OAuth/TeacherController_sendOtp`,
      );
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  @Post('google/send-otp')
  async sendOtp(@Body() body: SendOtpDto) {
    return await this.teacherService.initiateGoogleRegistration(body);
  }

  @Post('google/verify-otp')
  async verifyOtp(@Body() body: VerifyOtpDto) {
    return await this.teacherService.verifyAndActivate(body);
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
      where: { isDelete: false },
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
