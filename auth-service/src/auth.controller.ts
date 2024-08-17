import { Controller, Inject } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthEntity } from './entities/auth.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { MessagePattern, ClientProxy, Payload } from '@nestjs/microservices';
import { UserEntity } from './entities/user.entity';
import { Role } from '@prisma/client';
import { from, map, mergeMap, Observable } from 'rxjs';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject('MAIN_SERVICE') private mainClient: ClientProxy,
  ) { }

  @MessagePattern('login')
  login(@Payload() loginDto: LoginDto): Promise<AuthEntity> {
    return this.authService.login(loginDto);
  }

  @MessagePattern('register')
  register(@Payload() registerDto: RegisterDto): Observable<AuthEntity> {
    const token = this.authService.register(registerDto);
    return from(token).pipe(
      mergeMap(token => {
        const { password, ...shortDto } = registerDto
        return this.mainClient.send('register', shortDto).pipe(
          map(() => token)
        )
      }
      ));
  }

  @MessagePattern('findAllUsers')
  async findAllUsers(): Promise<UserEntity[]> {
    const users = await this.authService.findAll();
    return users.map((user) => new UserEntity(user));
  }

  @MessagePattern('findOneUser')
  async findOneUser(id: number): Promise<UserEntity> {
    return new UserEntity(await this.authService.findOne(id));
  }

  @MessagePattern('updateUser')
  async updateUser(
    @Payload() { id, updateUserDto }: { id: number, updateUserDto: UpdateUserDto },
  ): Promise<Observable<UserEntity>> {
    const updatedUser = this.authService.update(id, updateUserDto)
    return from(updatedUser).pipe(
      mergeMap((updatedUser) => {
        const { password, ...shortDto } = updateUserDto
        return this.mainClient.send('updateUser', { id, shortDto }).pipe(
          map(() => new UserEntity(updatedUser)))
      }
      ));
  }

  @MessagePattern('removeUser')
  async removeUser(id: number): Promise<Observable<any>> {
    this.authService.remove(id)[1];
    return this.mainClient.send('removeUser', id);
  }

  @MessagePattern('checkOwner')
  checkOwner({ resourceType, resourceId }): Promise<number> {
    return this.authService.checkOwner(resourceType, resourceId);
  }

  @MessagePattern('checkParentResourceOwner')
  checkParentResourceOwner({ resourceType, parentResourceId }: { resourceType: string, parentResourceId: number }): Promise<number> {
    return this.authService.checkParentResourceOwner(resourceType, parentResourceId);
  }

  @MessagePattern('getUserRoles')
  getUserRoles(id: number): Promise<Role[]> {
    return this.authService.getUserRoles(id);
  }

  @MessagePattern('validate')
  getUser(id: number): Promise<UserEntity> {
    return this.authService.getUser(id);
  }
}
