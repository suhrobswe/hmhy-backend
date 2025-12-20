import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  HttpException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { config } from 'src/config';

@Injectable()
export class CheckIsActiveTeacherGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers['authorization'];

    if (!authHeader)
      throw new UnauthorizedException('Authorization header missing');

    const [bearer, token] = authHeader.split(' ');

    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid authorization format');
    }

    try {
      const payload = this.jwt.verify(token, {
        secret: config.TOKEN.ACCESS_TOKEN_KEY,
      });

      if (!payload.isActive)
        throw new ForbiddenException('Sizni hali admin tasdiqlamagan');
      req.user = payload;

      return true;
    } catch (error) {
      throw new HttpException('Invalid or expired token', 401);
    }
  }
}
