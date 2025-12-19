import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from 'src/core/entity/admin.entity';
import { Teacher } from 'src/core/entity/teacher.entity';
import type { AdminRepository } from 'src/core/repository/admin.repository';
import type { TeacherRepository } from 'src/core/repository/teacher.repository';
import { AdminSignInDto } from './dto/admin-signIn.dto';
import { CryptoService } from 'src/infrastructure/crypto/crypto.service';
import { TokenService } from 'src/infrastructure/token/Token';
import { IToken } from 'src/infrastructure/token/interface';
import { Response } from 'express';
import { successRes } from 'src/infrastructure/response/success.response';
import { ISuccess } from 'src/infrastructure/pagination/successResponse';
import { TeacherSignInDto } from './dto/teacher-signIn.dto';
import { config } from 'src/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Admin) private readonly adminRepo: AdminRepository,
    @InjectRepository(Teacher) private readonly teacherRepo: TeacherRepository,
    private readonly crypto: CryptoService,
    private readonly token: TokenService,
  ) {}
  async adminSignIn(dto: AdminSignInDto, res: Response): Promise<ISuccess> {
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

    return successRes({ accessToken });
  }

  async teacherSignIn(dto: TeacherSignInDto, res: Response) {
    const { email, password } = dto;

    const teacher = await this.teacherRepo.findOne({ where: { email } });
    const isMatchPass = await this.crypto.decrypt(
      password,
      teacher?.password ?? '',
    );

    if (!teacher || !isMatchPass)
      throw new BadRequestException('Email or passoword incorrect');

    const payload: IToken = {
      id: teacher.id,
      role: teacher.role,
    };

    const accessToken = await this.token.accessToken(payload);
    const refreshToken = await this.token.refreshToken(payload);
    await this.token.writeCookie(res, 'token', refreshToken, 30);

    return successRes(accessToken);
  }

  async newToken(token: string) {
    const data: any = await this.token.verifyToken(
      token,
      config.TOKEN.REFRESH_TOKEN_KEY,
    );
    if (!data) throw new UnauthorizedException('Refresh token expired');

    let user: any = null;
    switch (data.role) {
      case 'PATIENT':
        user = await this.teacherRepo.findOne({ where: { id: data.id } });
        break;
      case 'ADMIN':
      case 'SUPERADMIN':
        user = await this.adminRepo.findOne({ where: { id: data.id } });
        break;
    }

    if (!user) throw new ForbiddenException('Forbidden user');

    const payload: IToken = {
      id: user.id,
      role: data.role,
    };
    const accessToken = await this.token.accessToken(payload);

    return successRes({ token: accessToken });
  }

  async signOut(token: string, res: Response, tokenKey: string) {
    const data: any = await this.token.verifyToken(
      token,
      config.TOKEN.REFRESH_TOKEN_KEY,
    );
    if (!data) throw new UnauthorizedException('Refresh token expired');

    let user: any = null;
    switch (data.role) {
      case 'PATIENT':
        user = await this.teacherRepo.findOne({ where: { id: data.id } });
        break;
      case 'ADMIN':
      case 'SUPERADMIN':
        user = await this.adminRepo.findOne({ where: { id: data.id } });
        break;
    }

    if (!user) throw new ForbiddenException('Forbidden user');

    res.clearCookie(tokenKey);
    return successRes({ message: 'Successfully logged out' });
  }
}
