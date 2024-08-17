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
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError, Observable, throwError } from 'rxjs';

@Controller(':boardId/columns')
@Roles(['USER'])
@UseGuards(JwtAuthGuard, RolesGuard)
@UseGuards(OwnerGuard)
@ApiBearerAuth()
@ApiTags('columns')
export class ColumnsController {
  constructor(
    @Inject('MAIN_SERVICE') private columnsClient: ClientProxy,
  ) { }

  @Post()
  @ApiCreatedResponse({ type: ColumnEntity })
  createColumn(
    @Param('boardId', ParseIntPipe) boardId: number,
    @Body() createColumnDto: CreateColumnDto,
  ): Observable<ColumnEntity> {
    return this.columnsClient.send('createColumn', { boardId, createColumnDto })
      .pipe(catchError(error => throwError(() => new RpcException(error.response))));
  }

  @Get()
  @ApiOkResponse({ type: ColumnEntity, isArray: true })
  findAllcolumns(@Param('boardId', ParseIntPipe) boardId: number): Observable<ColumnEntity[]> {
    return this.columnsClient.send('findAllColumns', boardId)
      .pipe(catchError(error => throwError(() => new RpcException(error.response))));
  }

  @Get(':id')
  @ApiOkResponse({ type: ColumnEntity })
  findOnecolumn(@Param('id', ParseIntPipe) id: number): Observable<ColumnEntity> {
    return this.columnsClient.send('findOneColumn', id)
      .pipe(catchError(error => throwError(() => new RpcException(error.response))));
  }

  @Patch(':id')
  @ApiOkResponse({ type: ColumnEntity })
  updatecolumn(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateColumnDto: UpdateColumnDto,
  ): Observable<ColumnEntity> {
    return this.columnsClient.send('updateColumn', { id, updateColumnDto })
      .pipe(catchError(error => throwError(() => new RpcException(error.response))));
  }

  @Delete(':id')
  @ApiOkResponse({ type: ColumnEntity })
  removeColumn(@Param('id', ParseIntPipe) id: number): Observable<ColumnEntity> {
    return this.columnsClient.send('removeColumn', id)
      .pipe(catchError(error => throwError(() => new RpcException(error.response))));
  }

  @Patch(':id/moveTo/:position')
  @ApiOkResponse({ type: ColumnEntity })
  moveColumn(
    @Param('id', ParseIntPipe) id: number,
    @Param('position', ParseIntPipe) targetPosition: number,
  ): Observable<ColumnEntity> {
    return this.columnsClient.send('moveColumn', { id, targetPosition })
      .pipe(catchError(error => throwError(() => new RpcException(error.response))));
  }
}
