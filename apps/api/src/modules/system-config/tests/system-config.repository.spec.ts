import { PrismaService } from '@/database/prisma/prisma.service';
import { SystemConfigRepository } from '@/modules/system-config/repository/system-config.repository';
import { Prisma } from '@prisma/client';

describe('SystemConfigRepository', () => {
  it('updates policy and all existing batch/code expiries atomically', async () => {
    const upsert = jest.fn().mockResolvedValue(undefined);
    const executeRaw = jest
      .fn<Promise<number>, [Prisma.Sql]>()
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(100);
    const transaction = jest.fn(
      (operation: (tx: unknown) => Promise<unknown>) =>
        operation({
          systemConfig: { upsert },
          $executeRaw: executeRaw,
        }),
    );
    const repository = new SystemConfigRepository(
      // Test double intentionally implements only the transaction boundary.

      { $transaction: transaction } as unknown as PrismaService,
    );
    const policy = { expiryMonths: 12, defaultBatchQuantity: 50 };

    await repository.updateActivationCodePolicy(
      'activation_code_policy',
      policy,
      'admin-id',
      12,
    );

    expect(transaction).toHaveBeenCalledTimes(1);
    expect(upsert).toHaveBeenCalledWith({
      where: { key: 'activation_code_policy' },
      create: {
        key: 'activation_code_policy',
        value: policy,
        updated_by_id: 'admin-id',
      },
      update: { value: policy, updated_by_id: 'admin-id' },
    });
    expect(executeRaw).toHaveBeenCalledTimes(2);
    expect(transaction).toHaveBeenCalledWith(expect.any(Function), {
      timeout: 30_000,
    });

    const batchSql = executeRaw.mock.calls[0]?.[0];
    const codeSql = executeRaw.mock.calls[1]?.[0];
    expect(batchSql.strings.join('')).toContain(
      '"expires_at" = "created_at" + make_interval(months => ',
    );
    expect(batchSql.values).toEqual([12]);
    expect(codeSql.strings.join('')).toContain(
      `WHEN code."status" = 'EXPIRED'`,
    );
    expect(codeSql.strings.join('')).toContain(
      `THEN 'AVAILABLE'::"activation_code_status"`,
    );
    expect(codeSql.values).toEqual([12, 12, 12]);
  });
});
