import { Permissions } from '@/common/decorators/permissions.decorator';
import { CreateServiceCenterDto } from '@/modules/service-centers/dto/create-service-center.dto';
import { ListServiceCentersDto } from '@/modules/service-centers/dto/list-service-centers.dto';
import { UpdateServiceCenterDto } from '@/modules/service-centers/dto/update-service-center.dto';
import { CreateServiceCenterUseCase } from '@/modules/service-centers/use-cases/create-service-center.use-case';
import { GetServiceCenterDetailUseCase } from '@/modules/service-centers/use-cases/get-service-center-detail.use-case';
import { ListServiceCenterProvincesUseCase } from '@/modules/service-centers/use-cases/list-service-center-provinces.use-case';
import { ListServiceCentersUseCase } from '@/modules/service-centers/use-cases/list-service-centers.use-case';
import { UpdateServiceCenterUseCase } from '@/modules/service-centers/use-cases/update-service-center.use-case';
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { permission_key } from '@prisma/client';

@Controller('service-centers')
export class ServiceCentersController {
  constructor(
    private readonly createServiceCenterUseCase: CreateServiceCenterUseCase,
    private readonly listServiceCentersUseCase: ListServiceCentersUseCase,
    private readonly listServiceCenterProvincesUseCase: ListServiceCenterProvincesUseCase,
    private readonly getServiceCenterDetailUseCase: GetServiceCenterDetailUseCase,
    private readonly updateServiceCenterUseCase: UpdateServiceCenterUseCase,
  ) {}

  @Post()
  @Permissions([permission_key.SERVICE_CENTER_CREATE])
  create(@Body() dto: CreateServiceCenterDto) {
    return this.createServiceCenterUseCase.execute(dto);
  }

  @Get()
  @Permissions([permission_key.SERVICE_CENTER_VIEW])
  list(@Query() query: ListServiceCentersDto) {
    return this.listServiceCentersUseCase.execute(query);
  }

  @Get('provinces')
  @Permissions([permission_key.SERVICE_CENTER_VIEW])
  listProvinces() {
    return this.listServiceCenterProvincesUseCase.execute();
  }

  @Get(':id')
  @Permissions([permission_key.SERVICE_CENTER_VIEW])
  detail(@Param('id') id: string) {
    return this.getServiceCenterDetailUseCase.execute(id);
  }

  @Patch(':id')
  @Permissions([permission_key.SERVICE_CENTER_UPDATE])
  update(@Param('id') id: string, @Body() dto: UpdateServiceCenterDto) {
    return this.updateServiceCenterUseCase.execute(id, dto);
  }

  @Patch(':id/deactivate')
  @Permissions([permission_key.SERVICE_CENTER_DELETE])
  deactivate(@Param('id') id: string) {
    return this.updateServiceCenterUseCase.execute(id, { isActive: false });
  }
}
