import { IsString, MinLength, IsUUID } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @MinLength(3)
  title!: string;

  @IsUUID()
  userId!: string;
}
