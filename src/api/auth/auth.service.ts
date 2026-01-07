import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from 'src/core/entity/admin.entity';
import { Teacher } from 'src/core/entity/teacher.entity';
import { Student } from 'src/core/entity/student.entity';
import { AdminSignInDto } from './dto/admin-signIn.dto';
import { TeacherSignInDto } from './dto/teacher-signIn.dto';
import { CryptoService } from 'src/infrastructure/crypto/crypto.service';
import { TokenService } from 'src/infrastructure/token/Token';
import { IToken } from 'src/infrastructure/token/interface';
import { Response } from 'express';
import { successRes } from 'src/infrastructure/response/success.response';
import { config } from 'src/config';
import * as crypto from 'crypto';
import { Roles } from 'src/common/enum/index.enum';
import type { AdminRepository } from 'src/core/repository/admin.repository';
import type { TeacherRepository } from 'src/core/repository/teacher.repository';
import type { StudentRepository } from 'src/core/repository/student.repository';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Admin) private readonly adminRepo: AdminRepository,
    @InjectRepository(Teacher)
    private readonly teacherRepo: TeacherRepository,
    @InjectRepository(Student)
    private readonly studentRepo: StudentRepository,
    private readonly crypto: CryptoService,
    private readonly token: TokenService,
  ) {}

  async adminSignIn(dto: AdminSignInDto, res: Response) {
    const { username, password } = dto;
    const admin = await this.adminRepo.findOne({ where: { username } });
    if (!admin) throw new BadRequestException('Username or password incorrect');

    const isMatchPass = await this.crypto.decrypt(password, admin.password);
    if (!isMatchPass)
      throw new BadRequestException('Username or password incorrect');

    const payload: IToken = { id: admin.id, role: admin.role };
    const accessToken = await this.token.accessToken(payload);
    const refreshToken = await this.token.refreshToken(payload);
    await this.token.writeCookie(res, 'token', refreshToken, 15);
    return successRes({ accessToken, role: admin.role });
  }

  async teacherSignIn(dto: TeacherSignInDto, res: Response) {
    const { email, password } = dto;
    const teacher = await this.teacherRepo.findOne({ where: { email } });
    const isMatchPass = await this.crypto.decrypt(
      password,
      teacher?.password ?? '',
    );

    if (!teacher || !isMatchPass)
      throw new BadRequestException('Email or password incorrect');

    const payload: IToken = {
      id: teacher.id,
      role: teacher.role,
      isActive: teacher.isActive,
    };
    const accessToken = await this.token.accessToken(payload);
    const refreshToken = await this.token.refreshToken(payload);
    await this.token.writeCookie(res, 'token', refreshToken, 30);
    return successRes({ accessToken, role: teacher.role });
  }

  async telegramLogin(initData: string) {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    const userStr = urlParams.get('user');

    if (!hash || !userStr) throw new BadRequestException('Invalid initData');

    urlParams.delete('hash');
    const dataCheckString = Array.from(urlParams.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, val]) => `${key}=${val}`)
      .join('\n');

    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(process.env.TELEGRAM_BOT_TOKEN || '')
      .digest();

    const hmac = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (hmac !== hash) throw new UnauthorizedException('Invalid hash');

    const tgUser = JSON.parse(userStr);
    const telegramId = String(tgUser.id);
    const student = await this.studentRepo.findOne({
      where: { telegramId } as any,
    });

    if (!student) throw new UnauthorizedException('Student not registered');

    const payload: IToken = { id: student.id, role: 'STUDENT' };
    return successRes({ accessToken: await this.token.accessToken(payload) });
  }

  async devLogin(studentId: string, res: Response) {
    const student = await this.studentRepo.findOne({
      where: { id: studentId },
    });
    if (!student) throw new BadRequestException('Student not found');
    const payload: IToken = { id: student.id, role: Roles.STUDENT };
    const accessToken = await this.token.accessToken(payload);
    const refreshToken = await this.token.refreshToken(payload);
    await this.token.writeCookie(res, 'token', refreshToken, 30);
    return successRes({ accessToken });
  }

  async newToken(token: string) {
    const data: any = await this.token.verifyToken(
      token,
      config.TOKEN.REFRESH_TOKEN_KEY,
    );
    if (!data) throw new UnauthorizedException('Refresh token expired');

    let user: any = null;
    if (data.role === 'STUDENT')
      user = await this.studentRepo.findOne({ where: { id: data.id } });
    else if (data.role === 'TEACHER')
      user = await this.teacherRepo.findOne({ where: { id: data.id } });
    else user = await this.adminRepo.findOne({ where: { id: data.id } });

    if (!user) throw new ForbiddenException('User not found');
    return successRes({
      token: await this.token.accessToken({ id: user.id, role: data.role }),
    });
  }

  async signOut(token: string, res: Response, tokenKey: string) {
    res.clearCookie(tokenKey);
    return successRes({ message: 'Successfully logged out' });
  }
}
