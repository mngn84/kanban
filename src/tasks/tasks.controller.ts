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
import { TasksService } from './tasks.service';
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

@Controller(':columnId/tasks')
@Controller(':userId/boards')
@Roles(['USER'])
@UseGuards(JwtAuthGuard, RolesGuard)
@UseGuards(OwnerGuard)
@ApiBearerAuth()
@ApiTags('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiCreatedResponse({ type: TaskEntity })
  async createtask(
    @Param('columnId', ParseIntPipe) columnId: number,
    @Body() createTaskDto: CreateTaskDto,
  ) {
    return new TaskEntity(
      await this.tasksService.create(columnId, createTaskDto),
    );
  }

  @Get()
  @ApiOkResponse({ type: TaskEntity, isArray: true })
  async findAlltasks(@Param('columnId', ParseIntPipe) columnId: number) {
    const tasks = await this.tasksService.findAllByColumn(columnId);
    return tasks.map((task) => new TaskEntity(task));
  }

  @Get(':id')
  @ApiOkResponse({ type: TaskEntity })
  async findOnetask(@Param('id', ParseIntPipe) id: number) {
    return new TaskEntity(await this.tasksService.findOne(id));
  }

  @Patch(':id')
  @ApiOkResponse({ type: TaskEntity })
  async updatetask(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return new TaskEntity(await this.tasksService.update(id, updateTaskDto));
  }

  @Delete(':id')
  @ApiOkResponse({ type: TaskEntity })
  async removetask(@Param('id', ParseIntPipe) id: number) {
    return new TaskEntity(await this.tasksService.remove(id));
  }

  @Patch(':id/moveTo/:targetColumnId')
  @ApiOkResponse({ type: TaskEntity })
  async moveToColumn(
    @Param('id', ParseIntPipe) id: number,
    @Param('columnId', ParseIntPipe) targetId: number,
  ) {
    return new TaskEntity(await this.tasksService.move(id, targetId));
  }
}
