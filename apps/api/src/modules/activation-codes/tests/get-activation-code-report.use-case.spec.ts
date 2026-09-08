import { GetActivationCodeReportUseCase } from '@/modules/activation-codes/use-cases/get-activation-code-report.use-case';

describe('GetActivationCodeReportUseCase', () => {
  it('returns lifecycle totals and province breakdown from one report query', async () => {
    const repository = {
      getReport: jest.fn().mockResolvedValue({
        byStatus: [
          { status: 'AVAILABLE', count: 4 },
          { status: 'ACTIVATED', count: 2 },
          { status: 'EXPIRED', count: 1 },
        ],
        byProvince: [
          {
            provinceCode: '79',
            provinceName: 'TP Hồ Chí Minh',
            total: 2,
            byStatus: [{ status: 'ACTIVATED', count: 2 }],
          },
        ],
        total: 7,
      }),
    };

    const result = await new GetActivationCodeReportUseCase(
      repository as never,
    ).execute({ dateFrom: '2026-01-01', dateTo: '2026-09-01' });

    expect(repository.getReport).toHaveBeenCalledWith({
      dateFrom: '2026-01-01',
      dateTo: '2026-09-01',
    });
    expect(result.total).toBe(7);
    expect(result.byStatus.ACTIVATED).toBe(2);
    expect(result.byProvince[0]?.provinceCode).toBe('79');
  });
});
