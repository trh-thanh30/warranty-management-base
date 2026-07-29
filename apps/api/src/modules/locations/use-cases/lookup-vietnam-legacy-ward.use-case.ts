import { BadRequestError } from '@/common/response';
import { LookupLegacyWardDto } from '@/modules/locations/dto/lookup-legacy-ward.dto';
import { VietnamProvincesClient } from '@/modules/locations/clients/vietnam-provinces.client';
import { LocationsCacheService } from '@/modules/locations/services/locations-cache.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LookupVietnamLegacyWardUseCase {
  constructor(
    private readonly provincesClient: VietnamProvincesClient,
    private readonly cacheService: LocationsCacheService,
  ) {}

  execute(query: LookupLegacyWardDto) {
    const legacyName = query.legacy_name?.trim() ?? '';
    const legacyCode = query.legacy_code ?? 0;

    if (!legacyName && !legacyCode) {
      throw new BadRequestError(
        'legacy_name or legacy_code is required',
        'VIETNAM_LEGACY_WARD_LOOKUP_REQUIRED',
      );
    }

    return this.cacheService.remember(
      `locations:vietnam:legacy-ward:lookup:name=${legacyName}:code=${legacyCode}`,
      () => this.provincesClient.lookupLegacyWard(legacyName, legacyCode),
    );
  }
}
