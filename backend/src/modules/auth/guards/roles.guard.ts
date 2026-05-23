import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ROLES_KEY } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../common/enums/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    let req;
    if (context.getType<string>() === 'graphql') {
      const ctx = GqlExecutionContext.create(context);
      req = ctx.getContext().req;
    } else {
      req = context.switchToHttp().getRequest();
    }

    const user = req?.user;

    if (!user || !user.role) {
      throw new ForbiddenException(
        'You do not have permission (Role is missing)',
      );
    }

    const hasRole = requiredRoles.some((role) => user.role === role);

    if (!hasRole) {
      throw new ForbiddenException(
        `You do not have permission. Required roles: ${requiredRoles.join(', ')}`,
      );
    }

    return hasRole;
  }
}
