import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import { Request } from 'express';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OwnerGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    @Inject('AUTH_SERVICE') private authClient: ClientProxy,
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
        throw new UnauthorizedException('You are not authorized to access this resource');
      } else {
        return true;
      }
    }

    const resourceType: string = this.getResourceType(request.path);
    if (resourceId) {
      const userId: any = (await firstValueFrom(this.authClient.send('checkOwner', { currentUserId, resourceType, resourceId })));
      if (!userId) {
        throw new NotFoundException(`${resourceType} with id ${resourceId} not found`);
      }
      if (userId.userId !== currentUserId) {
        throw new UnauthorizedException('You are not authorized to access this resource');
      }
    } else {
      const parentResourceType = this.getParentResourceType(request.path);
      const parentResourceId = request.path.split('/')[1];
      
      if (parentResourceType === 'user') {
        if(parentResourceId !== currentUserId.toString()) {
          throw new UnauthorizedException('You are not authorized to access this resource');
        }
        return true;
      }
      const parentResourceUserId = (await firstValueFrom(this.authClient.send('checkParentResourceOwner', { resourceType, parentResourceId }))).userId;

      if (+parentResourceUserId !== currentUserId) {
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

  private getResourceType(path: string): string {
    if (path.includes('boards')) return 'board';
    if (path.includes('columns')) return 'column';
    if (path.includes('tasks')) return 'task';
  }

  private getParentResourceType(child: string): string {
    if (child.includes('boards')) return 'user';
    if (child.includes('columns')) return 'board';
    if (child.includes('tasks')) return 'column';
  }
}
