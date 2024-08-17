import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';

export const roundsOfHashing = 10;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  async register({ email, name }: CreateUserDto): Promise<User> {

    const isUserExists = await this.prisma.user.findUnique({
      where: {
        email,
      }
    });

    if (isUserExists) {
      throw new RpcException(new ConflictException(`User with email: ${email} already exists`));
    }

    return await this.prisma.user.create({
      data: {
        name: name,
        email: email,
      }
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      return await this.prisma.user.update({
        where: { id },
        data: updateUserDto,
      });
    } catch (error) {
      throw new RpcException(new ConflictException(error));
    }
  }

  async remove(id: number): Promise<User> {
    return await this.prisma.user.delete({ where: { id } });
  }
}
