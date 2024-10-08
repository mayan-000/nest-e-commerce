import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enums';

@Injectable()
export class UserIdGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      throw new ForbiddenException(
        'You do not have permission to perform this action',
      );
    }
    if (user.roles.includes(Role.User) && !user.id) {
      throw new ForbiddenException('User ID is required for this action');
    }
    return true;
  }
}
