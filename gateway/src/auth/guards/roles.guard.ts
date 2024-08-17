import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { Roles } from '../decorators/roles.decorator';
import { Request } from 'express';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    @Inject('AUTH_SERVICE') private authClient: ClientProxy,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles: string[] = this.reflector.getAllAndOverride(Roles, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles) {
      return true;
    }
    const request: any = await context.switchToHttp().getRequest();
    const token: string = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token not found');
    }
    const payload: any = await this.jwtService.decode(token);
    const currentUserId: number = payload.sub;

    const userRoles = await firstValueFrom(this.authClient.send('getUserRoles', currentUserId));

    const hasRole = (): boolean => {
      return userRoles.some((role: string) => roles.includes(role));
    };

    if (!hasRole()) {
      throw new UnauthorizedException('User does not have enough roles to access this resource');
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
