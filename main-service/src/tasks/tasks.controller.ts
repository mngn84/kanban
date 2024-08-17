import { Controller } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskEntity } from './entities/task.entity';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class TasksController {
  constructor(private readonly tasksService: TasksService) { }

  @MessagePattern('createTask')
  async createtask(
    @Payload() { columnId, createTaskDto }: { columnId: number, createTaskDto: CreateTaskDto },
  ): Promise<TaskEntity> {
    return new TaskEntity(await this.tasksService.create(columnId, createTaskDto));
  }

  @MessagePattern('findAllTasks')
  async findAlltasks(columnId: number): Promise<TaskEntity[]> {
    const tasks = await this.tasksService.findAllByColumn(columnId);
    return tasks.map((task) => new TaskEntity(task));
  }

  @MessagePattern('findOneTask')
  async findOnetask(id: number): Promise<TaskEntity> {
    return new TaskEntity(await this.tasksService.findOne(id));
  }

  @MessagePattern('updateTask')
  async updatetask(
    @Payload() { id, updateTaskDto }: { id: number, updateTaskDto: UpdateTaskDto }
  ): Promise<TaskEntity> {
    return new TaskEntity(await this.tasksService.update(id, updateTaskDto));
  }

  @MessagePattern('removeTask')
  async removetask(id: number): Promise<TaskEntity> {
    return new TaskEntity(await this.tasksService.remove(id));
  }

  @MessagePattern('moveToColumn')
  async moveToColumn({ id, targetId }: { id: number, targetId: number }): Promise<TaskEntity> {
    return new TaskEntity(await this.tasksService.move(id, targetId));
  }

  @MessagePattern('getTaskUserId')
  getTaskUserId(id: number): Promise<{ userId: number }> {
    return this.tasksService.getUserId(id);
  }
}
