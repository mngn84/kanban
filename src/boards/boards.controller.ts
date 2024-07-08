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
} from '@nestjs/common';
import { BoardsService } from './boards.service';
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

@Controller(':userId/boards')
@Roles(['USER'])
@UseGuards(JwtAuthGuard, RolesGuard)
@UseGuards(OwnerGuard)
@ApiBearerAuth()
@ApiTags('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Post()
  @ApiCreatedResponse({ type: BoardEntity })
  async createBoard(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() createBoardDto: CreateBoardDto,
  ) {
    return new BoardEntity(
      await this.boardsService.create(userId, createBoardDto),
    );
  }

  @Get()
  @ApiOkResponse({ type: BoardEntity, isArray: true })
  async findAllBoards(@Param('userId', ParseIntPipe) userId: number) {
    const boards = await this.boardsService.findAllByUser(userId);
    return boards.map((board) => new BoardEntity(board));
  }

  @Get(':id')
  @ApiOkResponse({ type: BoardEntity })
  async findOneBoard(@Param('id', ParseIntPipe) id: number) {
    return new BoardEntity(await this.boardsService.findOne(id));
  }

  @Patch(':id')
  @ApiOkResponse({ type: BoardEntity })
  async updateBoard(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBoardDto: UpdateBoardDto,
  ) {
    return new BoardEntity(await this.boardsService.update(id, updateBoardDto));
  }

  @Delete(':id')
  @ApiOkResponse({ type: BoardEntity })
  async removeBoard(@Param('id', ParseIntPipe) id: number) {
    return new BoardEntity(await this.boardsService.remove(id));
  }
}
