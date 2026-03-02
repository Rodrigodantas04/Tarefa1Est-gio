import { IsIn } from 'class-validator';
import { TaskStatus } from '@prisma/client';

export class UpdateTaskStatusDto {
  @IsIn(['todo', 'doing', 'done'])
  status!: TaskStatus;
}
