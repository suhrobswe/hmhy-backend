import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { config } from 'src/config';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    const auth: string = req.headers.authorization;
    if (!auth) {
      throw new UnauthorizedException('Authorization error');
    }
    const bearer = auth.split(' ')[0];
    const token = auth.split(' ')[1];
    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedException('Unauthorized');
    }
    try {
      const data = this.jwt.verify(token, { secret: config.TOKEN.ACCESS_TOKEN_KEY });
      req.user = data;
      return true;
    } catch (error) {
      const errorObject = {
        statusCode: error?.response ? 403 : 401,
        error: {
          message: error?.response
            ? error?.message
            : 'Token expired or incorrect',
        },
      };
      throw new HttpException(
        errorObject.error.message,
        errorObject.statusCode,
      );
    }
  }
}
