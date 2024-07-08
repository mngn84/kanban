import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '@prisma/client';
import  { Request } from 'express';
import { UserEntity } from 'src/users/entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

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

    const currentUser: UserEntity = await this.prisma.user.findUnique({
      where: { id: currentUserId },
    });

    const hasRole = (): boolean => {
      const userRoles: Role[] = [currentUser.roles];
      return userRoles.some((role) => roles.includes(role));
    };

    if (!hasRole()) {
      throw new UnauthorizedException(
        'User does not have enough roles to access this resource',
      );
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
