import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';

type Status = 'todo' | 'doing' | 'done';

@Injectable()
export class TaskService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(userId?: string) {
    return this.prisma.task.findMany({
      where: {
        ...(userId ? { userId } : {}),
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: CreateTaskDto) {
    // garante que user existe (melhor erro)
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });
    if (!user) throw new BadRequestException('Invalid userId');

    return this.prisma.task.create({
      data: {
        title: dto.title,
        userId: dto.userId,
        status: 'todo',
      },
    });
  }

  private isValidTransition(from: Status, to: Status) {
    if (from === to) return true;
    if (from === 'todo' && (to === 'doing' || to === 'done')) return true;
    if (from === 'doing' && to === 'done') return true;
    return false;
  }

  async updateStatus(id: string, newStatus: Status) {
    const task = await this.prisma.task.findFirst({
      where: { id, deletedAt: null },
    });
    if (!task) throw new NotFoundException('Task not found');

    const from = task.status as Status;
    const to = newStatus;

    if (!this.isValidTransition(from, to)) {
      throw new BadRequestException(
        `Invalid status transition: ${from} -> ${to}`,
      );
    }

    return this.prisma.task.update({
      where: { id },
      data: { status: to },
    });
  }

  async softDelete(id: string) {
    const task = await this.prisma.task.findFirst({
      where: { id, deletedAt: null },
    });
    if (!task) throw new NotFoundException('Task not found');

    return this.prisma.task.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
