import { Controller } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { BoardEntity } from './entities/board.entity';

@Controller()
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) { }

  @MessagePattern('createBoard')
  async createBoard(
    @Payload() { userId, createBoardDto }: { userId: number, createBoardDto: CreateBoardDto },
  ): Promise<BoardEntity> {
    return new BoardEntity(await this.boardsService.create(userId, createBoardDto));
  }

  @MessagePattern('findAllBoards')
  async findAllBoards(userId: number): Promise<BoardEntity[]> {
    const boards = await this.boardsService.findAllByUser(userId);
    return boards.map(user => new BoardEntity(user));
  }

  @MessagePattern('findOneBoard')
  async findOneBoard(id: number): Promise<BoardEntity> {
    return new BoardEntity(await this.boardsService.findOne(id));
  }

  @MessagePattern('updateBoard')
  async updateBoard(
    @Payload() { id, updateBoardDto }: { id: number, updateBoardDto: UpdateBoardDto }
  ): Promise<BoardEntity> {
    return new BoardEntity(await this.boardsService.update(id, updateBoardDto));
  }

  @MessagePattern('removeBoard')
  async removeBoard(id: number): Promise<BoardEntity> {
    return new BoardEntity(await this.boardsService.remove(id));
  }

  @MessagePattern('getBoardUserId')
  getBoardUserId(id: number): Promise<{ userId: number }> {
    return this.boardsService.getUserId(+id);
  }
}
