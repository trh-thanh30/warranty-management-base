import { MIN_ADDRESS_QUERY_LENGTH } from '@/modules/common/constant';
import { CommonUtils } from '@/modules/common/helpers/common.utils';
import { AddressSearchResult } from '@/modules/common/types';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class CommonService {
  private readonly logger = new Logger(CommonService.name);

  constructor(private readonly commonUtils: CommonUtils) {}

  async search(query: string): Promise<AddressSearchResult[]> {
    const normalizedQuery = this.commonUtils.normalizeQuery(query);
    if (normalizedQuery.length < MIN_ADDRESS_QUERY_LENGTH) return [];

    try {
      const results =
        await this.commonUtils.searchAddressItems(normalizedQuery);
      return results.map((item) => this.commonUtils.mapNominatimAddress(item));
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Address search failed: ${msg}`);
      return [];
    }
  }
}
