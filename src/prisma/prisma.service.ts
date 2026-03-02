import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool, type PoolConfig } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) throw new Error('DATABASE_URL em falta no .env');

    const poolConfig: PoolConfig = { connectionString };

    const pool = new Pool(poolConfig);

    const adapter = new PrismaPg(
      pool,
    ) as unknown as Prisma.PrismaClientOptions['adapter'];

    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }
}
