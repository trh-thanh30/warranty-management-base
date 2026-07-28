import { DealersRepository } from '@/modules/dealers/repository/dealers.repository';
import { ServiceCentersRepository } from '@/modules/service-centers/repository/service-centers.repository';
import { Injectable } from '@nestjs/common';
import type {
  PublicNetworkLocation,
  PublicNetworkLocationKind,
} from '@repo/shared';
import { createGoogleMapsUrl } from '@repo/shared/utils';

type NetworkRecord = {
  address: string;
  district: string | null;
  id: string;
  latitude: number;
  longitude: number;
  name: string;
  phone: string | null;
  province: string;
};

@Injectable()
export class PublicListNetworkLocationsUseCase {
  constructor(
    private readonly dealersRepository: DealersRepository,
    private readonly serviceCentersRepository: ServiceCentersRepository,
  ) {}

  async execute(): Promise<PublicNetworkLocation[]> {
    const [dealers, serviceCenters] = await Promise.all([
      this.dealersRepository.listActiveForNetwork(),
      this.serviceCentersRepository.listActiveForNetwork(),
    ]);

    return [
      ...dealers.map((dealer) => this.mapLocation(dealer, 'DEALER')),
      ...serviceCenters.map((serviceCenter) =>
        this.mapLocation(serviceCenter, 'SERVICE_CENTER'),
      ),
    ];
  }

  private mapLocation(
    record: NetworkRecord,
    kind: PublicNetworkLocationKind,
  ): PublicNetworkLocation {
    return {
      ...record,
      kind,
      googleMapsUrl: createGoogleMapsUrl(record),
    };
  }
}
