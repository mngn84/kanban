import { Controller } from '@nestjs/common';
import { ColumnsService } from './columns.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { ColumnEntity } from './entities/column.entity';
import { MessagePattern, Payload } from '@nestjs/microservices';


@Controller()
export class ColumnsController {
  constructor(private readonly columnsService: ColumnsService) { }

  @MessagePattern('createColumn')
  async createColumn(
    @Payload() { boardId, createColumnDto }: { boardId: number, createColumnDto: CreateColumnDto }
  ): Promise<ColumnEntity> {
    return new ColumnEntity(await this.columnsService.create(boardId, createColumnDto),
    );
  }

  @MessagePattern('findAllColumns')
  async findAllColumns(boardId: number): Promise<ColumnEntity[]> {
    const columns = await this.columnsService.findAllByBoard(boardId);
    return columns.map((column) => new ColumnEntity(column));
  }

  @MessagePattern('findOneColumn')
  async findOneColumn(id: number): Promise<ColumnEntity> {
    return new ColumnEntity(await this.columnsService.findOne(id));
  }

  @MessagePattern('updateColumn')
  async updateColumn(
    @Payload() { id, updateColumnDto }: { id: number, updateColumnDto: UpdateColumnDto }
  ): Promise<ColumnEntity> {
    return new ColumnEntity(await this.columnsService.update(id, updateColumnDto),
    );
  }

  @MessagePattern('removeColumn')
  async removeColumn(id: number): Promise<ColumnEntity> {
    return new ColumnEntity(await this.columnsService.remove(id));
  }

  @MessagePattern('moveColumn')
  async moveColumn({ id, targetPosition }: { id: number, targetPosition: number }): Promise<ColumnEntity> {
    return new ColumnEntity(await this.columnsService.move(id, targetPosition));
  }

  @MessagePattern('getColumnUserId')
  getColumnUserId(id: number): Promise<{ userId: number }> {
    return this.columnsService.getUserId(+id);
  }
}
