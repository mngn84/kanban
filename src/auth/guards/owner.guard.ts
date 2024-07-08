import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { Request } from 'express';

@Injectable()
export class OwnerGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: any = await context.switchToHttp().getRequest();
    const token: string = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token not found');
    }

    const payload: any = await this.jwtService.decode(token);
    const currentUserId: number = payload.sub;

    const resourceId: number = +request.params.id;

    if (request.path.includes('users')) {
      if (request.params.id && +request.params.id !== currentUserId) {
        throw new UnauthorizedException(
          'You are not authorized to access this resource',
        );
      } else {
        return true;
      }
    }

    if (resourceId) {
      const resource = await this.getResource(
        request.path,
        currentUserId,
        resourceId,
      );

      if (resource.userId !== currentUserId) {
        throw new UnauthorizedException(
          'You are not authorized to access this resource',
        );
      }
    } else {

      const ParentResourceUserId = await this.getParentResourceUserId(
        request.path,
        +request.path.split('/')[1],
      );

      if (ParentResourceUserId !== currentUserId) {
        throw new UnauthorizedException(
          'You are not authorized to access this resource',
        );
      }
    }
    return true;
  }
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private async getResource(
    path: string,
    userId: number,
    id?: number,
  ): Promise<any> {
    if (path.includes('boards')) {
      return await this.prisma.board.findUnique({ where: { id } });
    } else if (path.includes('columns')) {
      return await this.prisma.column.findUnique({ where: { id } });
    } else if (path.includes('tasks')) {
      return await this.prisma.task.findUnique({ where: { id } });
    }
  }

  private async getParentResourceUserId(
    child: string,
    id: number,
  ): Promise<number> {
    if (child.includes('boards')) {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
        },
      });
      return user.id;
    } else if (child.includes('columns')) {
      const board = await this.prisma.board.findUnique({
        where: { id },
        select: {
          userId: true,
        },
      });
      return board.userId;
    } else if (child.includes('tasks')) {
      const column = await this.prisma.column.findUnique({
        where: { id },
        select: {
          userId: true,
        },
      });
      return column.userId;
    }
  }
}
