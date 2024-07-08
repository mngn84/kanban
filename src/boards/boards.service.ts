import { Injectable } from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class BoardsService {
  constructor(private prisma: PrismaService) { }

  async create(userId: number, createBoardDto: CreateBoardDto) {
    return await this.prisma.board.create({
      data: {
        ...createBoardDto,
        user: { connect: { id: userId } },
      },
    });
  }

  async findAllByUser(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with id: ${userId} does not exist.`);
    }
    return await this.prisma.board.findMany({
      where: {
        user: { id: userId },
      },
      include: {
        user: true,
      }
    });
  }

  async findOne( id: number) {
    return await this.prisma.board.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });
  }

  async update( id: number, updateBoardDto: UpdateBoardDto) {
    return await this.prisma.board.update({
      where: {  id },
      data: updateBoardDto,
    });
  }

  async remove(id: number) {
    return await this.prisma.board.delete({ where: { id } });
  }
}
