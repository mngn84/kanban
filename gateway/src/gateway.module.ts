import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthController } from './auth/auth.controller';
import { UsersController } from './users/users.controller';
import { BoardsController } from './boards/boards.controller';
import { ColumnsController } from './columns/columns.controller';
import { TasksController } from './tasks/tasks.controller';
import { JwtService } from '@nestjs/jwt';
import { JwtStrategy } from './auth/strategies/jwt.strategy';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `./.env`,
    }),
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RMQ_URL],
          queue: process.env.RMQ_AUTH_QUEUE,
          queueOptions: {
            durable: false,
          },
        },
      },
      {
        name: 'MAIN_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RMQ_URL],
          queue: process.env.RMQ_MAIN_QUEUE,
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [AuthController, UsersController, BoardsController, ColumnsController, TasksController],
  providers: [JwtService, JwtStrategy],
})

export class AppModule { }
