import { RedisModule } from '@/database/redis/redis.module';
import { VietnamProvincesClient } from '@/modules/locations/clients/vietnam-provinces.client';
import { GeoapifyGeocodingClient } from '@/modules/locations/clients/geoapify-geocoding.client';
import { LocationsController } from '@/modules/locations/locations.controller';
import { LocationsCacheService } from '@/modules/locations/services/locations-cache.service';
import { GetVietnamProvinceUseCase } from '@/modules/locations/use-cases/get-vietnam-province.use-case';
import { GeocodeVietnamAddressUseCase } from '@/modules/locations/use-cases/geocode-vietnam-address.use-case';
import { GetVietnamWardUseCase } from '@/modules/locations/use-cases/get-vietnam-ward.use-case';
import { ListVietnamDivisionsUseCase } from '@/modules/locations/use-cases/list-vietnam-divisions.use-case';
import { ListVietnamLegacyWardsUseCase } from '@/modules/locations/use-cases/list-vietnam-legacy-wards.use-case';
import { ListVietnamProvincesUseCase } from '@/modules/locations/use-cases/list-vietnam-provinces.use-case';
import { ListVietnamWardsUseCase } from '@/modules/locations/use-cases/list-vietnam-wards.use-case';
import { LookupVietnamLegacyWardUseCase } from '@/modules/locations/use-cases/lookup-vietnam-legacy-ward.use-case';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

@Module({
  imports: [HttpModule, RedisModule],
  controllers: [LocationsController],
  providers: [
    VietnamProvincesClient,
    GeoapifyGeocodingClient,
    LocationsCacheService,
    ListVietnamDivisionsUseCase,
    ListVietnamProvincesUseCase,
    GetVietnamProvinceUseCase,
    GeocodeVietnamAddressUseCase,
    ListVietnamWardsUseCase,
    GetVietnamWardUseCase,
    LookupVietnamLegacyWardUseCase,
    ListVietnamLegacyWardsUseCase,
  ],
})
export class LocationsModule {}
