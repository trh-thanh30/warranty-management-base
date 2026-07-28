import { GeocodeVietnamAddressUseCase } from '@/modules/locations/use-cases/geocode-vietnam-address.use-case';

describe('GeocodeVietnamAddressUseCase', () => {
  const geocodingClient = {
    geocodeVietnamAddress: jest.fn(),
  };
  const cacheService = {
    remember: jest.fn((_key: string, load: () => Promise<unknown>) => load()),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('normalizes and caches a Vietnam address lookup', async () => {
    const candidates = [
      {
        formattedAddress:
          '1 Nguyễn Văn Linh, Phường Hải Châu, Thành phố Đà Nẵng, Việt Nam',
        latitude: 16.054407,
        longitude: 108.202164,
      },
    ];
    geocodingClient.geocodeVietnamAddress.mockResolvedValue(candidates);
    const useCase = new GeocodeVietnamAddressUseCase(
      geocodingClient as never,
      cacheService as never,
      { cacheTtlSeconds: 2_592_000 } as never,
    );

    const result = await useCase.execute({
      address: '  1 Nguyễn Văn Linh ',
      province: ' Thành phố Đà Nẵng ',
      ward: ' Phường Hải Châu ',
    });

    expect(geocodingClient.geocodeVietnamAddress).toHaveBeenCalledWith({
      address: '1 Nguyễn Văn Linh',
      province: 'Thành phố Đà Nẵng',
      ward: 'Phường Hải Châu',
    });
    expect(cacheService.remember).toHaveBeenCalledWith(
      expect.stringMatching(/^locations:geocode:vietnam:[a-f0-9]{64}$/),
      expect.any(Function),
      2_592_000,
    );
    expect(result).toEqual(candidates);
  });
});
