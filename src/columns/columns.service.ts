import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { type Prisma } from '@prisma/client';

@Injectable()
export class ColumnsService {
  constructor(private prisma: PrismaService) {}

  async create(boardId: number, createColumnDto: CreateColumnDto) {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
    });
    const userId = board.userId;

    const data: Prisma.ColumnCreateInput = {
      ...createColumnDto,
      board: { connect: { id: boardId } },
      user: { connect: { id: userId } },
    };

    return await this.prisma.column.create({ data });
  }

  async findAllByBoard(boardId: number) {
    return await this.prisma.column.findMany({
      where: {
        board: { id: boardId },
      },
      include: {
        board: true,
      },
    });
  }

  async findOne(id: number) {
    return await this.prisma.column.findUnique({
      where: { id },
      include: {
        board: true,
      },
    });
  }

  async update(id: number, updateColumnDto: UpdateColumnDto) {
    return await this.prisma.column.update({
      where: { id },
      data: updateColumnDto,
    });
  }

  async remove(id: number) {
    return await this.prisma.column.delete({ where: { id } });
  }

  async move(id: number, targetPosition: number) {
    const column = await this.prisma.column.findUnique({
      where: { id },
      select: {
        position: true,
        boardId: true,
      },
    });
    if (!column) {
      throw new NotFoundException('Column not found');
    }
    if (column.position > targetPosition) {
      await this.prisma.column.updateMany({
        where: {
          boardId: column.boardId,

          position: {
            gte: targetPosition,
            lt: column.position,
          },
        },
        data: {
          position: {
            increment: 1,
          },
        },
      });
    } else if (column.position < targetPosition) {
      await this.prisma.column.updateMany({
        where: {
          boardId: column.boardId,
          position: {
            gt: column.position,
            lte: targetPosition,
          },
        },
        data: {
          position: {
            decrement: 1,
          },
        },
      });
    }

    return await this.prisma.column.update({
      where: { id },
      data: { position: targetPosition },
    });
  }
}
