import { PrismaService } from '@/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

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

  updateActivationCodePolicy(
    key: string,
    value: object,
    updatedById: string,
    expiryMonths: number,
  ) {
    return this.prisma.$transaction(
      async (tx) => {
        await tx.systemConfig.upsert({
          where: { key },
          create: { key, value, updated_by_id: updatedById },
          update: { value, updated_by_id: updatedById },
        });

        await tx.$executeRaw(Prisma.sql`
          UPDATE "activation_code_batch"
          SET
            "expires_at" = "created_at" + make_interval(months => ${expiryMonths}),
            "updated_at" = CURRENT_TIMESTAMP
        `);

        await tx.$executeRaw(Prisma.sql`
          UPDATE "activation_code" AS code
          SET
            "expires_at" = batch."created_at" + make_interval(months => ${expiryMonths}),
            "status" = CASE
              WHEN code."status" = 'AVAILABLE'
                AND batch."created_at" + make_interval(months => ${expiryMonths}) <= CURRENT_TIMESTAMP
                THEN 'EXPIRED'::"activation_code_status"
              WHEN code."status" = 'EXPIRED'
                AND batch."created_at" + make_interval(months => ${expiryMonths}) > CURRENT_TIMESTAMP
                THEN 'AVAILABLE'::"activation_code_status"
              ELSE code."status"
            END,
            "updated_at" = CURRENT_TIMESTAMP
          FROM "activation_code_batch" AS batch
          WHERE code."batch_id" = batch."id"
        `);
      },
      { timeout: 30_000 },
    );
  }
}
