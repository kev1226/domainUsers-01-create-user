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

/**
 * AuthGuard that verifies JWT token and required user roles.
 * Throws 401 if token is missing or invalid.
 * Throws 403 if user lacks the required role.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Retrieve required roles from handler metadata
    const roles = this.reflector.get<string[]>(ROLES_KEY, context.getHandler());

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers?.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('Token not provided');
    }

    let decoded: any;

    try {
      // Verify token and attach decoded user to request
      decoded = await this.jwtService.verifyAsync(token);
      request.user = decoded;
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Validate if user has at least one of the required roles
    if (roles && !roles.some((role) => decoded.roles?.includes(role))) {
      throw new ForbiddenException('Insufficient role');
    }

    return true;
  }
}
