import { PrismaService } from '@/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SystemConfigRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByKey(key: string) {
    return this.prisma.systemConfig.findUnique({ where: { key } });
  }

  upsert(key: string, value: object, updatedById: string) {
    return this.prisma.systemConfig.upsert({
      where: { key },
      create: { key, value, updated_by_id: updatedById },
      update: { value, updated_by_id: updatedById },
    });
  }
}
