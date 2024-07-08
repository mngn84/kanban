import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { type Prisma } from '@prisma/client'

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) { }

  async create(columnId: number, createTaskDto: CreateTaskDto) {
    const column = await this.prisma.column.findUnique({ where: { id: columnId } });
    if (!column) {
      throw new NotFoundException(`Column with ID ${columnId} not found`);
    }
    const userId = column.userId;

    const data: Prisma.TaskCreateInput = {
      ...createTaskDto,
      column: { connect: { id: columnId } },
      user: { connect: { id: userId } },
    };

    return await this.prisma.task.create({ data });
  }

  async findAllByColumn(columnId: number) {
    const column = await this.prisma.column.findUnique({ where: { id: columnId } });
    if (!column) {
      throw new NotFoundException(`Column with ID ${columnId} not found`);
    }
    return await this.prisma.task.findMany({
      where: {
        column: { id: columnId },
      },
      include: {
        column: true,
      }
    });
  }

  async findOne(id: number) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        column: true,
      },
    });
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

  async update(id: number, updateTaskDto: UpdateTaskDto) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return await this.prisma.task.update({
      where: { id },
      data: updateTaskDto,
    });
  }

  async remove(id: number) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return await this.prisma.task.delete({ where: { id } });
  }

  async move(id: number, columnId: number) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    const column = await this.prisma.column.findUnique({ where: { id: columnId } });
    if (!task || !column) {
      throw new NotFoundException(`Task with ID ${id} was not found in Column with ID ${columnId}`);
    }
    return await this.prisma.task.update({
      where: { id },
      data: {
        columnId: columnId,
      }
    });
  }
}
