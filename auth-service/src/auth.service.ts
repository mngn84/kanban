import { Injectable, NotFoundException, UnauthorizedException, Inject, ConflictException } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AuthEntity } from './entities/auth.entity';
import * as bcrypt from 'bcrypt';
import { Role, User } from '@prisma/client';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateUserDto } from './dto/update-user.dto';

export const roundsOfHashing = 10;

@Injectable()
export class AuthService {
  constructor(
    @Inject('MAIN_SERVICE') private mainClient: ClientProxy,
    private prisma: PrismaService,
    private jwtService: JwtService
  ) { }

  async login({ email, password }: LoginDto): Promise<AuthEntity> {

    const user = await this.prisma.user.findUnique({ where: { email: email } });

    if (!user) {
      throw new RpcException(new NotFoundException(`No user found for email: ${email}`));
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new RpcException(new UnauthorizedException('Invalid password'));
    }

    return {
      accessToken: this.jwtService.sign({ sub: user.id }, { secret: process.env.JWT_SECRET }),
    };
  }

  async register({ email, password, name }: RegisterDto): Promise<AuthEntity> {

    const hashedPassword = await bcrypt.hash(password, roundsOfHashing);

    const isUserExists = await this.prisma.user.findUnique({
      where: {
        email,
      }
    });
    if (isUserExists) {
      throw new RpcException(new ConflictException(`User with email: ${email} already exists`));
    }
    const user = await this.prisma.user.create({
      data: {
        name: name,
        email: email,
        password: hashedPassword,
      }
    });

    return {
      accessToken: this.jwtService.sign({ sub: user.id }, { secret: process.env.JWT_SECRET }),
    };
  }

  async checkOwner(resource: string, id: number): Promise<number> {
    switch (resource) {
      case 'board':
        return await firstValueFrom(this.mainClient.send('getBoardUserId', id));
      case 'column':
        return await firstValueFrom(this.mainClient.send('getColumnUserId', id));
      case 'task':
        return await firstValueFrom(this.mainClient.send('getTaskUserId', id));
      default: throw new RpcException(new NotFoundException(`Resource ${resource} not found`));
    }
  }

  async findAll() : Promise<User[]> {
    return await this.prisma.user.findMany();
  }

  async findOne(id: number) : Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new RpcException(new NotFoundException(`User with id: ${id} does not exist. `));
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(
        updateUserDto.password,
        roundsOfHashing,
      );
    }
    try{
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

  async checkParentResourceOwner(child: string, id: number): Promise<number> {
    switch (child) {
      case 'board':
        const user = await this.prisma.user.findUnique({
          where: { id },
          select: {
            id: true,
          },
        })
        if (!user) {
          throw new RpcException(new NotFoundException(`User with id: ${id} does not exist.`));
        }
        return user.id;
      case 'column':
        return await firstValueFrom(this.mainClient.send('getBoardUserId', id));
      case 'task':
        return await firstValueFrom(this.mainClient.send('getColumnUserId', id));
      default: throw new RpcException(new NotFoundException(`Resource ${child} not found`));
    }
  }

  async getUserRoles(id: number): Promise<Role[]> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        roles: true,
      },
    });
    return [user.roles];
  }

  async getUser(id: number) : Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user;
  }
}

