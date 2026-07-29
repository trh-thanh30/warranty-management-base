import { GeoapifyGeocodingClient } from '@/modules/locations/clients/geoapify-geocoding.client';
import { of } from 'rxjs';

describe('GeoapifyGeocodingClient', () => {
  const httpService = {
    get: jest.fn(),
  };
  const config = {
    apiKey: 'test-key',
    baseUrl: 'https://api.geoapify.com/v1',
    cacheTtlSeconds: 2_592_000,
    maxResults: 5,
    timeoutMs: 5_000,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('limits forward geocoding to Vietnam and maps valid candidates', async () => {
    httpService.get.mockReturnValue(
      of({
        data: {
          results: [
            {
              country_code: 'vn',
              formatted:
                '1 Nguyễn Văn Linh, Phường Hải Châu, Thành phố Đà Nẵng, Việt Nam',
              lat: 16.054407,
              lon: 108.202164,
              rank: { confidence: 0.95 },
              result_type: 'building',
            },
            {
              country_code: 'us',
              formatted: 'Nguyen Van Linh Street, United States',
              lat: 40,
              lon: -74,
            },
          ],
        },
      }),
    );
    const client = new GeoapifyGeocodingClient(httpService as never, config);

    const result = await client.geocodeVietnamAddress({
      address: '1 Nguyễn Văn Linh',
      province: 'Thành phố Đà Nẵng',
      ward: 'Phường Hải Châu',
    });

    expect(httpService.get).toHaveBeenCalledWith(
      'https://api.geoapify.com/v1/geocode/search',
      {
        params: {
          apiKey: 'test-key',
          filter: 'countrycode:vn',
          format: 'json',
          lang: 'vi',
          limit: 5,
          text: '1 Nguyễn Văn Linh, Phường Hải Châu, Thành phố Đà Nẵng, Việt Nam',
        },
        timeout: 5_000,
      },
    );
    expect(result).toEqual([
      {
        confidence: 0.95,
        formattedAddress:
          '1 Nguyễn Văn Linh, Phường Hải Châu, Thành phố Đà Nẵng, Việt Nam',
        latitude: 16.054407,
        longitude: 108.202164,
        resultType: 'building',
      },
    ]);
  });

  it('fails without exposing a provider request when the API key is absent', async () => {
    const client = new GeoapifyGeocodingClient(httpService as never, {
      ...config,
      apiKey: '',
    });

    await expect(
      client.geocodeVietnamAddress({
        province: 'Thành phố Đà Nẵng',
      }),
    ).rejects.toMatchObject({
      code: 'GEOAPIFY_NOT_CONFIGURED',
    });
    expect(httpService.get).not.toHaveBeenCalled();
  });
});
