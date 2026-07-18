import { Public } from '@/common/decorators/public.decorator';
import { ListVietnamProvincesDto } from '@/modules/locations/dto/list-vietnam-provinces.dto';
import { ListVietnamWardsDto } from '@/modules/locations/dto/list-vietnam-wards.dto';
import { LookupLegacyWardDto } from '@/modules/locations/dto/lookup-legacy-ward.dto';
import { VietnamProvinceDepthDto } from '@/modules/locations/dto/vietnam-province-depth.dto';
import { GetVietnamProvinceUseCase } from '@/modules/locations/use-cases/get-vietnam-province.use-case';
import { GetVietnamWardUseCase } from '@/modules/locations/use-cases/get-vietnam-ward.use-case';
import { ListVietnamDivisionsUseCase } from '@/modules/locations/use-cases/list-vietnam-divisions.use-case';
import { ListVietnamLegacyWardsUseCase } from '@/modules/locations/use-cases/list-vietnam-legacy-wards.use-case';
import { ListVietnamProvincesUseCase } from '@/modules/locations/use-cases/list-vietnam-provinces.use-case';
import { ListVietnamWardsUseCase } from '@/modules/locations/use-cases/list-vietnam-wards.use-case';
import { LookupVietnamLegacyWardUseCase } from '@/modules/locations/use-cases/lookup-vietnam-legacy-ward.use-case';
import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@Public()
@ApiTags('Locations')
@Controller('locations')
export class LocationsController {
  constructor(
    private readonly listVietnamDivisionsUseCase: ListVietnamDivisionsUseCase,
    private readonly listVietnamProvincesUseCase: ListVietnamProvincesUseCase,
    private readonly getVietnamProvinceUseCase: GetVietnamProvinceUseCase,
    private readonly listVietnamWardsUseCase: ListVietnamWardsUseCase,
    private readonly getVietnamWardUseCase: GetVietnamWardUseCase,
    private readonly lookupVietnamLegacyWardUseCase: LookupVietnamLegacyWardUseCase,
    private readonly listVietnamLegacyWardsUseCase: ListVietnamLegacyWardsUseCase,
  ) {}

  @Get('vietnam/divisions')
  listVietnamDivisions(@Query() query: VietnamProvinceDepthDto) {
    return this.listVietnamDivisionsUseCase.execute(query.depth);
  }

  @Get('vietnam/provinces')
  listVietnamProvinces(@Query() query: ListVietnamProvincesDto) {
    return this.listVietnamProvincesUseCase.execute(query);
  }

  @Get('vietnam/provinces/:code')
  getVietnamProvince(
    @Param('code', ParseIntPipe) code: number,
    @Query() query: VietnamProvinceDepthDto,
  ) {
    return this.getVietnamProvinceUseCase.execute(code, query.depth);
  }

  @Get('vietnam/wards')
  listVietnamWards(@Query() query: ListVietnamWardsDto) {
    return this.listVietnamWardsUseCase.execute(query);
  }

  @Get('vietnam/wards/from-legacy')
  lookupVietnamLegacyWard(@Query() query: LookupLegacyWardDto) {
    return this.lookupVietnamLegacyWardUseCase.execute(query);
  }

  @Get('vietnam/wards/:code/legacies')
  listVietnamLegacyWards(@Param('code', ParseIntPipe) code: number) {
    return this.listVietnamLegacyWardsUseCase.execute(code);
  }

  @Get('vietnam/wards/:code')
  getVietnamWard(@Param('code', ParseIntPipe) code: number) {
    return this.getVietnamWardUseCase.execute(code);
  }
}
