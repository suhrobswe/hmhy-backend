import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorator/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) return true;
    const req = context.switchToHttp().getRequest();
    const user = req.user;

    if (!user) throw new ForbiddenException('User not found');

    const hasRole = requiredRoles
      .filter((r) => r !== 'ID')
      .map((r) => r.toUpperCase())
      .includes(user.role?.toUpperCase());

    const isOwner = requiredRoles.includes('ID') && user?.id === req.params.id;

    if (hasRole || isOwner) return true;

    throw new ForbiddenException('Forbidden: insufficient permissions');
  }
}
