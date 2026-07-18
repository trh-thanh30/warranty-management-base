import { BadRequestError } from '@/common/response';
import { GetVietnamProvinceUseCase } from '@/modules/locations/use-cases/get-vietnam-province.use-case';
import { ListVietnamProvincesUseCase } from '@/modules/locations/use-cases/list-vietnam-provinces.use-case';
import { ListVietnamWardsUseCase } from '@/modules/locations/use-cases/list-vietnam-wards.use-case';
import { LookupVietnamLegacyWardUseCase } from '@/modules/locations/use-cases/lookup-vietnam-legacy-ward.use-case';

const province = {
  code: 1,
  codename: 'ha_noi',
  division_type: 'thành phố trung ương',
  name: 'Thành phố Hà Nội',
  phone_code: 24,
};

const ward = {
  code: 26560,
  codename: 'phuong_ba_ria',
  division_type: 'phường',
  name: 'Phường Bà Rịa',
  province_code: 79,
};

describe('Vietnam provinces use cases', () => {
  const provincesClient = {
    getProvince: jest.fn(),
    listProvinces: jest.fn(),
    listWards: jest.fn(),
    lookupLegacyWard: jest.fn(),
  };

  const cacheService = {
    remember: jest.fn((_: string, load: () => Promise<unknown>) => load()),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lists provinces through cache with normalized search', async () => {
    provincesClient.listProvinces.mockResolvedValue([province]);
    const useCase = new ListVietnamProvincesUseCase(
      provincesClient as never,
      cacheService as never,
    );

    const result = await useCase.execute({ search: ' Hà Nội ' });

    expect(cacheService.remember).toHaveBeenCalledWith(
      'locations:vietnam:provinces:search=Hà Nội',
      expect.any(Function),
    );
    expect(provincesClient.listProvinces).toHaveBeenCalledWith('Hà Nội');
    expect(result).toEqual([province]);
  });

  it('gets province detail with depth cache key', async () => {
    provincesClient.getProvince.mockResolvedValue({ ...province, wards: [] });
    const useCase = new GetVietnamProvinceUseCase(
      provincesClient as never,
      cacheService as never,
    );

    await useCase.execute(1, 2);

    expect(cacheService.remember).toHaveBeenCalledWith(
      'locations:vietnam:province:1:depth=2',
      expect.any(Function),
    );
    expect(provincesClient.getProvince).toHaveBeenCalledWith(1, 2);
  });

  it('lists wards filtered by province and search', async () => {
    provincesClient.listWards.mockResolvedValue([ward]);
    const useCase = new ListVietnamWardsUseCase(
      provincesClient as never,
      cacheService as never,
    );

    await useCase.execute({ province: 79, search: 'Bà Rịa' });

    expect(cacheService.remember).toHaveBeenCalledWith(
      'locations:vietnam:wards:province=79:search=Bà Rịa',
      expect.any(Function),
    );
    expect(provincesClient.listWards).toHaveBeenCalledWith(79, 'Bà Rịa');
  });

  it('requires a legacy name or code for legacy ward lookup', () => {
    const useCase = new LookupVietnamLegacyWardUseCase(
      provincesClient as never,
      cacheService as never,
    );

    expect(() => useCase.execute({})).toThrow(BadRequestError);
  });
});
