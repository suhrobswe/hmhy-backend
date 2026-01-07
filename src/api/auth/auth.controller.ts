import { Controller, Post, Body, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AdminSignInDto } from './dto/admin-signIn.dto';
import type { Response } from 'express';
import { TeacherSignInDto } from './dto/teacher-signIn.dto';
import { RolesGuard } from 'src/common/guard/role.guard';
import { Roles } from 'src/common/enum/index.enum';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { AccessRoles } from 'src/common/decorator/roles.decorator';
import { CookieGetter } from 'src/common/decorator/cookie-getter.decorator';
import { AuthGuard } from 'src/common/guard/auth.guard';

@ApiTags('Auth')
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Admin sign in' })
  @ApiBody({ type: AdminSignInDto })
  @Post('signin/admin')
  adminSignIn(
    @Body() dto: AdminSignInDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.adminSignIn(dto, res);
  }

  @ApiOperation({ summary: 'Teacher sign in' })
  @ApiBody({ type: TeacherSignInDto })
  @Post('signin/teacher')
  teacherSignIn(
    @Body() dto: TeacherSignInDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.teacherSignIn(dto, res);
  }

  @ApiOperation({ summary: 'Telegram Web App login (Production)' })
  @ApiBody({ schema: { properties: { initData: { type: 'string' } } } })
  @Post('telegram/login')
  loginTelegram(@Body('initData') initData: string) {
    return this.authService.telegramLogin(initData);
  }

  @ApiOperation({ summary: 'TEST UCHUN: Student ID orqali token olish' })
  @ApiBody({ schema: { properties: { studentId: { type: 'string' } } } })
  @Post('dev/login')
  devLogin(
    @Body('studentId') studentId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.devLogin(studentId, res);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @AccessRoles(Roles.ADMIN, Roles.SUPER_ADMIN, Roles.TEACHER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get new token using refresh token' })
  @Post('new-token')
  newToken(@CookieGetter('token') token: string) {
    return this.authService.newToken(token);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @AccessRoles(Roles.ADMIN, Roles.SUPER_ADMIN, Roles.TEACHER, Roles.STUDENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Sign out user' })
  @Post('signout')
  signOut(
    @CookieGetter('token') token: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.signOut(token, res, 'token');
  }
}
