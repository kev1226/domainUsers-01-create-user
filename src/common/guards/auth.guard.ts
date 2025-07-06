import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ROLES_KEY } from '../decorators/auth.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<string[]>(ROLES_KEY, context.getHandler());

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers?.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    let decoded: any;

    try {
      decoded = await this.jwtService.verifyAsync(token);
      request.user = decoded;
    } catch (err) {
      throw new UnauthorizedException('Token inválido o expirado');
    }

    if (roles && !roles.some((role) => decoded.roles?.includes(role))) {
      throw new ForbiddenException('Rol no autorizado');
    }

    return true;
  }
}
