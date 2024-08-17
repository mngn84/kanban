import { Module } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { UsersController } from './users/users.controller';
import { BoardsController } from './boards/boards.controller';
import { ColumnsController } from './columns/columns.controller';
import { TasksController } from './tasks/tasks.controller';
import { PrismaService } from './prisma/prisma.service';
import { BoardsService } from './boards/boards.service';
import { ColumnsService } from './columns/columns.service';
import { TasksService } from './tasks/tasks.service';

@Module({
  controllers: [UsersController, BoardsController, ColumnsController, TasksController],
  providers: [UsersService, BoardsService, ColumnsService, TasksService, PrismaService],
})
export class MainModule { }
