import {CanActivate, ExecutionContext, ForbiddenException,Injectable} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get(Roles, context.getHandler());
  //get c pour lire les metadonnés(quel role demandé) en passant deux arguments qui sont decorateur et context qui donne reference à la fonction de gestion de route
    if (!requiredRoles) {
      return true; // aucune restriction(si aucun role exigé)
    }

    const user = context.switchToHttp().getRequest().user;//recuperer user

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Insufficient role');
    }

    return true;
  }
}
