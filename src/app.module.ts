import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { ColumnsModule } from './columns/columns.module';
import { TasksModule } from './tasks/tasks.module';
import { PrismaModule } from './prisma/prisma.module';
import { BoardsModule } from './boards/boards.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    UsersModule,
    BoardsModule,
    ColumnsModule,
    TasksModule,
    PrismaModule,
    AuthModule,
  ],
/*   controllers: [AppController],
  providers: [AppService], */
})
export class AppModule { }
