import { Module } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { BoardsController } from './boards.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [BoardsController],
  providers: [BoardsService, UsersService, JwtService],
  imports: [PrismaModule],
})
export class BoardsModule {}
