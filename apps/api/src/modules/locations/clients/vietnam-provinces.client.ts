import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from '@/common/response';
import vietnamProvincesConfig from '@/config/vietnam-provinces.config';
import {
  VietnamLegacyWard,
  VietnamLegacyWardLookupResult,
  VietnamProvince,
  VietnamWard,
} from '@/modules/locations/types/locations.types';
import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { type ConfigType } from '@nestjs/config';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class VietnamProvincesClient {
  constructor(
    private readonly httpService: HttpService,
    @Inject(vietnamProvincesConfig.KEY)
    private readonly provincesCfg: ConfigType<typeof vietnamProvincesConfig>,
  ) {}

  listDivisions(depth = 1): Promise<VietnamProvince[]> {
    return this.get<VietnamProvince[]>('/', { depth });
  }

  listProvinces(search = ''): Promise<VietnamProvince[]> {
    return this.get<VietnamProvince[]>('/p/', { search });
  }

  getProvince(code: number, depth = 1): Promise<VietnamProvince> {
    return this.get<VietnamProvince>(`/p/${code}`, { depth });
  }

  listWards(province = 0, search = ''): Promise<VietnamWard[]> {
    return this.get<VietnamWard[]>('/w/', { province, search });
  }

  getWard(code: number): Promise<VietnamWard> {
    return this.get<VietnamWard>(`/w/${code}`);
  }

  lookupLegacyWard(
    legacyName = '',
    legacyCode = 0,
  ): Promise<VietnamLegacyWardLookupResult[]> {
    return this.get<VietnamLegacyWardLookupResult[]>('/w/from-legacy/', {
      legacy_name: legacyName,
      legacy_code: legacyCode,
    });
  }

  listLegacyWards(code: number): Promise<VietnamLegacyWard[]> {
    return this.get<VietnamLegacyWard[]>(`/w/${code}/to-legacies/`);
  }

  private async get<T>(
    path: string,
    params: Record<string, string | number> = {},
  ): Promise<T> {
    if (!this.provincesCfg.enabled) {
      throw new InternalServerError(
        'Vietnam provinces provider is disabled',
        'VIETNAM_PROVINCES_PROVIDER_DISABLED',
      );
    }

    try {
      const { data } = await firstValueFrom(
        this.httpService.get<T>(this.buildUrl(path), {
          params,
          timeout: this.provincesCfg.timeoutMs,
        }),
      );

      return data;
    } catch (error) {
      throw this.mapProviderError(error);
    }
  }

  private buildUrl(path: string): string {
    const baseUrl = this.provincesCfg.baseUrl.replace(/\/+$/, '');
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${normalizedPath}`;
  }

  private mapProviderError(error: unknown): Error {
    if (!(error instanceof AxiosError)) {
      return new InternalServerError(
        'Vietnam provinces provider request failed',
        'VIETNAM_PROVINCES_PROVIDER_ERROR',
      );
    }

    if (error.response?.status === 404) {
      return new NotFoundError(
        'Vietnam division',
        'VIETNAM_DIVISION_NOT_FOUND',
      );
    }

    if (error.response?.status === 422) {
      return new BadRequestError(
        'Invalid Vietnam provinces query',
        'VIETNAM_PROVINCES_INVALID_QUERY',
        { provider: error.response.data },
      );
    }

    return new InternalServerError(
      'Vietnam provinces provider request failed',
      'VIETNAM_PROVINCES_PROVIDER_ERROR',
      {
        status: error.response?.status,
        message: error.message,
      },
    );
  }
}
