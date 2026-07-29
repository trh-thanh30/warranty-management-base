import { InternalServerError } from '@/common/response';
import geoapifyConfig from '@/config/geoapify.config';
import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { type ConfigType } from '@nestjs/config';
import type {
  GeocodeVietnamAddressBody,
  GeocodeVietnamAddressCandidate,
} from '@repo/shared';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';

type GeoapifyResult = {
  country_code?: string;
  formatted?: string;
  lat?: number;
  lon?: number;
  rank?: {
    confidence?: number;
  };
  result_type?: string;
};

type GeoapifyResponse = {
  results?: GeoapifyResult[];
};

@Injectable()
export class GeoapifyGeocodingClient {
  constructor(
    private readonly httpService: HttpService,
    @Inject(geoapifyConfig.KEY)
    private readonly config: ConfigType<typeof geoapifyConfig>,
  ) {}

  async geocodeVietnamAddress(
    input: GeocodeVietnamAddressBody,
  ): Promise<GeocodeVietnamAddressCandidate[]> {
    if (!this.config.apiKey) {
      throw new InternalServerError(
        'Geoapify API key is not configured',
        'GEOAPIFY_NOT_CONFIGURED',
      );
    }

    try {
      const { data } = await firstValueFrom(
        this.httpService.get<GeoapifyResponse>(
          `${this.config.baseUrl}/geocode/search`,
          {
            params: {
              apiKey: this.config.apiKey,
              filter: 'countrycode:vn',
              format: 'json',
              lang: 'vi',
              limit: this.config.maxResults,
              text: this.buildQuery(input),
            },
            timeout: this.config.timeoutMs,
          },
        ),
      );

      return (data.results ?? []).flatMap((result) => {
        if (
          result.country_code?.toLowerCase() !== 'vn' ||
          typeof result.lat !== 'number' ||
          typeof result.lon !== 'number' ||
          !result.formatted
        ) {
          return [];
        }

        return [
          {
            confidence: result.rank?.confidence,
            formattedAddress: result.formatted,
            latitude: result.lat,
            longitude: result.lon,
            resultType: result.result_type,
          },
        ];
      });
    } catch (error) {
      if (error instanceof InternalServerError) throw error;

      const axiosError =
        error instanceof AxiosError ? error : new AxiosError(String(error));

      throw new InternalServerError(
        'Geoapify geocoding request failed',
        'GEOAPIFY_REQUEST_FAILED',
        {
          message: axiosError.message,
          status: axiosError.response?.status,
        },
      );
    }
  }

  private buildQuery(input: GeocodeVietnamAddressBody): string {
    return [input.address, input.ward, input.province, 'Việt Nam']
      .filter((part): part is string => Boolean(part))
      .join(', ');
  }
}
