import { Module } from '@nestjs/common';
import { ColumnsService } from './columns.service';
import { ColumnsController } from './columns.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { BoardsService } from 'src/boards/boards.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [ColumnsController],
  providers: [ColumnsService, BoardsService, JwtService],
  imports: [PrismaModule],
})
export class ColumnsModule {}
