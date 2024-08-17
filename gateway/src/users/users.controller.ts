import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Inject,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiTags,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UserEntity } from './entities/user.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { OwnerGuard } from '../auth/guards/owner.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError, Observable, pipe, throwError } from 'rxjs';

@Controller('users')
@Roles(['USER'])
@UseGuards(JwtAuthGuard, RolesGuard)
@UseGuards(OwnerGuard)
@ApiBearerAuth()
@ApiTags('users')
export class UsersController {
  constructor(
    @Inject('AUTH_SERVICE') private authClient: ClientProxy,
  ) { }

  @Get()
  @Roles(['ADMIN'])
  @ApiBearerAuth()
  @ApiOkResponse({ type: UserEntity, isArray: true })
  findAllUsers(): Observable<any> {
    return this.authClient.send('findAllUsers', {})
      .pipe(catchError(error => throwError(() => new RpcException(error.response))));
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOkResponse({ type: UserEntity })
  findOneUser(@Param('id', ParseIntPipe) id: number): Observable<UserEntity> {
    return this.authClient.send('findOneUser', id)
      .pipe(catchError(error => throwError(() => new RpcException(error.response))));
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: UserEntity })
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Observable<UserEntity> {
    return this.authClient.send('updateUser', { id, updateUserDto })
      .pipe(catchError(error => throwError(() => new RpcException(error.response))));
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOkResponse({ type: UserEntity })
  removeUser(@Param('id', ParseIntPipe) id: number): Observable<UserEntity> {
    return this.authClient.send('removeUser', id)
      .pipe(catchError(error => throwError(() => new RpcException(error.response))));
  }
}
