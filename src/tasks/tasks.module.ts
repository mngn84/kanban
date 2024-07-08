import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ColumnsService } from 'src/columns/columns.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [TasksController],
  providers: [TasksService, ColumnsService, JwtService],
  imports: [PrismaModule],
})
export class TasksModule {}
