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
import { ColumnsService } from './columns.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import {
  ApiBearerAuth,
  ApiTags,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { ColumnEntity } from './entities/column.entity';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { OwnerGuard } from 'src/auth/guards/owner.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Controller(':boardId/columns')
@Roles(['USER'])
@UseGuards(JwtAuthGuard, RolesGuard)
@UseGuards(OwnerGuard)
@ApiBearerAuth()
@ApiTags('columns')
export class ColumnsController {
  constructor(private readonly columnsService: ColumnsService) {}

  @Post()
  @ApiCreatedResponse({ type: ColumnEntity })
  async createColumn(
    @Param('boardId', ParseIntPipe) boardId: number,
    @Body() createColumnDto: CreateColumnDto,
  ) {
    return new ColumnEntity(
      await this.columnsService.create(boardId, createColumnDto),
    );
  }

  @Get()
  @ApiOkResponse({ type: ColumnEntity, isArray: true })
  async findAllcolumns(@Param('boardId', ParseIntPipe) boardId: number) {
    const columns = await this.columnsService.findAllByBoard(boardId);
    return columns.map((column) => new ColumnEntity(column));
  }

  @Get(':id')
  @ApiOkResponse({ type: ColumnEntity })
  async findOnecolumn(@Param('id', ParseIntPipe) id: number) {
    return new ColumnEntity(await this.columnsService.findOne(id));
  }

  @Patch(':id')
  @ApiOkResponse({ type: ColumnEntity })
  async updatecolumn(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateColumnDto: UpdateColumnDto,
  ) {
    return new ColumnEntity(
      await this.columnsService.update(id, updateColumnDto),
    );
  }

  @Delete(':id')
  @ApiOkResponse({ type: ColumnEntity })
  async removeColumn(@Param('id', ParseIntPipe) id: number) {
    return new ColumnEntity(await this.columnsService.remove(id));
  }

  @Patch(':id/moveTo/:position')
  @ApiOkResponse({ type: ColumnEntity })
  async moveColumn(
    @Param('id', ParseIntPipe) id: number,
    @Param('position', ParseIntPipe) targetPosition: number,
  ) {
    return new ColumnEntity(await this.columnsService.move(id, targetPosition));
  }
}
