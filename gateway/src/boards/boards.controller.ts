import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Inject,
} from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import {
  ApiBearerAuth,
  ApiTags,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { BoardEntity } from './entities/board.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { OwnerGuard } from '../auth/guards/owner.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError, Observable, throwError } from 'rxjs';

@Controller(':userId/boards')
@Roles(['USER'])
@UseGuards(JwtAuthGuard, RolesGuard)
@UseGuards(OwnerGuard)
@ApiBearerAuth()
@ApiTags('boards')
export class BoardsController {
  constructor(
    @Inject('MAIN_SERVICE') private boardsClient: ClientProxy
  ) { }

  @Post()
  @ApiCreatedResponse({ type: BoardEntity })
  createBoard(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() createBoardDto: CreateBoardDto,
  ): Observable<BoardEntity> {
    return this.boardsClient.send('createBoard', { userId, createBoardDto })
      .pipe(catchError(error => throwError(() => new RpcException(error.response))));
  }

  @Get()
  @ApiOkResponse({ type: BoardEntity, isArray: true })
  findAllBoards(@Param('userId', ParseIntPipe) userId: number): Observable<BoardEntity[]> {
    return this.boardsClient.send('findAllBoards', userId)
      .pipe(catchError(error => throwError(() => new RpcException(error.response))));
  }

  @Get(':id')
  @ApiOkResponse({ type: BoardEntity })
  findOneBoard(@Param('id', ParseIntPipe) id: number): Observable<BoardEntity> {
    return this.boardsClient.send('findOneBoard', id)
      .pipe(catchError(error => throwError(() => new RpcException(error.response))));
  }

  @Patch(':id')
  @ApiOkResponse({ type: BoardEntity })
  updateBoard(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBoardDto: UpdateBoardDto,
  ): Observable<BoardEntity> {
    return this.boardsClient.send('updateBoard', { id, updateBoardDto })
      .pipe(catchError(error => throwError(() => new RpcException(error.response))));
  }

  @Delete(':id')
  @ApiOkResponse({ type: BoardEntity })
  removeBoard(@Param('id', ParseIntPipe) id: number): Observable<BoardEntity> {
    return this.boardsClient.send('removeBoard', id)
      .pipe(catchError(error => throwError(() => new RpcException(error.response))));
  }
}
