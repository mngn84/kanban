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
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import {
  ApiBearerAuth,
  ApiTags,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { TaskEntity } from './entities/task.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OwnerGuard } from '../auth/guards/owner.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError, Observable, throwError } from 'rxjs';

@Controller(':columnId/tasks')
@Roles(['USER'])
@UseGuards(JwtAuthGuard, RolesGuard)
@UseGuards(OwnerGuard)
@ApiBearerAuth()
@ApiTags('tasks')
export class TasksController {
  constructor(
    @Inject('MAIN_SERVICE') private tasksClient: ClientProxy,
  ) { }

  @Post()
  @ApiCreatedResponse({ type: TaskEntity })
  createtask(
    @Param('columnId', ParseIntPipe) columnId: number,
    @Body() createTaskDto: CreateTaskDto,
  ): Observable<TaskEntity> {
    return this.tasksClient.send('createTask', { columnId, createTaskDto })
      .pipe(catchError(error => throwError(() => new RpcException(error.response))));
  }

  @Get()
  @ApiOkResponse({ type: TaskEntity, isArray: true })
  findAlltasks(@Param('columnId', ParseIntPipe) columnId: number): Observable<TaskEntity[]> {
    return this.tasksClient.send('findAllTasks', columnId)
      .pipe(catchError(error => throwError(() => new RpcException(error.response))));
  }

  @Get(':id')
  @ApiOkResponse({ type: TaskEntity })
  findOnetask(@Param('id', ParseIntPipe) id: number): Observable<TaskEntity> {
    return this.tasksClient.send('findOneTask', id)
      .pipe(catchError(error => throwError(() => new RpcException(error.response))));
  }

  @Patch(':id')
  @ApiOkResponse({ type: TaskEntity })
  updatetask(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Observable<TaskEntity> {
    return this.tasksClient.send('updateTask', { id, updateTaskDto })
      .pipe(catchError(error => throwError(() => new RpcException(error.response))));
  }

  @Delete(':id')
  @ApiOkResponse({ type: TaskEntity })
  removetask(@Param('id', ParseIntPipe) id: number): Observable<TaskEntity> {
    return this.tasksClient.send('removeTask', id)
      .pipe(catchError(error => throwError(() => new RpcException(error.response))));
  }

  @Patch(':id/moveTo/:columnId')
  @ApiOkResponse({ type: TaskEntity })
  moveToColumn(
    @Param('id', ParseIntPipe) id: number,
    @Param('columnId', ParseIntPipe) targetId: number,
  ): Observable<TaskEntity> {
    return this.tasksClient.send('moveToColumn', { id, targetId })
      .pipe(catchError(error => throwError(() => new RpcException(error.response))));
  }
}
