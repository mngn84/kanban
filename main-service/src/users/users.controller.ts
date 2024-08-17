import { Controller } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @MessagePattern('register')
  async register(@Payload() createUserDto: CreateUserDto): Promise<UserEntity> {
    return new UserEntity(await this.usersService.register(createUserDto));
  }

  @MessagePattern('updateUser')
  async updateUser(
    @Payload() { id, shortDto }: { id: number, shortDto: UpdateUserDto },
  ): Promise<UserEntity> {
    return new UserEntity(await this.usersService.update(id, shortDto));
  }

  @MessagePattern('removeUser')
  async removeUser(id: number): Promise<UserEntity> {
    return new UserEntity(this.usersService.remove(id)[1]);
  }
}
