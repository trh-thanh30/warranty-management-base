import { clientConfig } from '@/config';
import {
  ADDRESS_SEARCH_LIMIT,
  UK_COUNTRY_CODE,
  UK_POSTCODE_PATTERN,
} from '@/modules/common/constant';
import {
  AddressSearchResult,
  NominatimAddress,
  NominatimSearchItem,
} from '@/modules/common/types';
import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { type ConfigType } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CommonUtils {
  constructor(
    private readonly httpService: HttpService,
    @Inject(clientConfig.KEY)
    private readonly clientCfg: ConfigType<typeof clientConfig>,
  ) {}
  async searchAddressItems(query: string): Promise<NominatimSearchItem[]> {
    const primaryResults = (await this.callNominatim(query)).filter((item) =>
      this.isUkAddress(item),
    );
    if (primaryResults.length > 0) return primaryResults;

    if (this.isUkPostcode(query)) {
      return (
        await this.callNominatim(`${this.formatPostcode(query)} london`)
      ).filter((item) => this.isUkAddress(item));
    }

    return [];
  }

  async callNominatim(query: string): Promise<NominatimSearchItem[]> {
    const { data } = await firstValueFrom(
      this.httpService.get<NominatimSearchItem[]>(
        `${this.clientCfg.nominatimBaseUrl}/search`,
        {
          params: {
            q: query,
            format: 'json',
            addressdetails: 1,
            countrycodes: UK_COUNTRY_CODE,
            limit: ADDRESS_SEARCH_LIMIT,
            dedupe: 1,
            extratags: 1,
          },
          headers: {
            'User-Agent': this.clientCfg.nominatimUserAgent,
          },
        },
      ),
    );

    return data ?? [];
  }

  private isUkAddress(item: NominatimSearchItem): boolean {
    const a = item.address;

    if (!a) return false;

    return (
      a.country_code?.toLowerCase() === 'gb' &&
      Boolean(a.postcode) &&
      (Boolean(this.getStreetName(a)) ||
        Boolean(a.city) ||
        Boolean(a.town) ||
        Boolean(a.village) ||
        Boolean(a.county))
    );
  }

  mapNominatimAddress(item: NominatimSearchItem): AddressSearchResult {
    const address = item.address ?? {};
    const street = this.getStreetName(address);
    const addressLine1 =
      this.joinAddressParts([address.house_number, street], ' ') || street;
    const city =
      address.city || address.town || address.village || address.county || '';
    const state = address.state || address.county || '';

    return {
      display_name: item.display_name,
      address_line1: addressLine1,
      address_line2: this.joinAddressParts([
        address.neighbourhood,
        address.suburb,
      ]),
      city,
      state,
      postal_code: address.postcode ?? '',
      country: 'GB',
    };
  }

  getStreetName(address: NominatimAddress): string {
    return (
      address.road ||
      address.pedestrian ||
      address.footway ||
      address.path ||
      address.residential ||
      ''
    );
  }

  joinAddressParts(parts: Array<string | undefined>, separator = ', '): string {
    return parts
      .map((part) => part?.trim())
      .filter((part): part is string => Boolean(part))
      .join(separator);
  }

  normalizeQuery(value?: string): string {
    return value?.trim() ?? '';
  }

  isUkPostcode(value: string): boolean {
    return UK_POSTCODE_PATTERN.test(value.trim());
  }

  formatPostcode(value: string): string {
    const compact = value.replace(/\s+/g, '').toUpperCase();
    if (compact.length <= 3) return compact;
    return `${compact.slice(0, -3)} ${compact.slice(-3)}`;
  }
}
