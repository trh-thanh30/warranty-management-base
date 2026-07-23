import { Public } from '@/common/decorators/public.decorator';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { CreateDealerDto } from '@/modules/dealers/dto/create-dealer.dto';
import { ListDealersDto } from '@/modules/dealers/dto/list-dealers.dto';
import { UpdateDealerDto } from '@/modules/dealers/dto/update-dealer.dto';
import { CreateDealerUseCase } from '@/modules/dealers/use-cases/create-dealer.use-case';
import { GetDealerDetailUseCase } from '@/modules/dealers/use-cases/get-dealer-detail.use-case';
import { ListDealersUseCase } from '@/modules/dealers/use-cases/list-dealers.use-case';
import { UpdateDealerUseCase } from '@/modules/dealers/use-cases/update-dealer.use-case';
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

@Controller('dealers')
export class DealersController {
  constructor(
    private readonly createDealerUseCase: CreateDealerUseCase,
    private readonly listDealersUseCase: ListDealersUseCase,
    private readonly getDealerDetailUseCase: GetDealerDetailUseCase,
    private readonly updateDealerUseCase: UpdateDealerUseCase,
  ) {}

  @Post()
  @Permissions([permission_key.DEALER_CREATE])
  create(@Body() dto: CreateDealerDto) {
    return this.createDealerUseCase.execute(dto);
  }

  @Get()
  @Public()
  list(@Query() query: ListDealersDto) {
    return this.listDealersUseCase.execute({
      ...query,
      isActive: query.isActive ?? 'true',
    });
  }

  @Get(':id')
  @Permissions([permission_key.DEALER_VIEW])
  detail(@Param('id') id: string) {
    return this.getDealerDetailUseCase.execute(id);
  }

  @Patch(':id')
  @Permissions([permission_key.DEALER_UPDATE])
  update(@Param('id') id: string, @Body() dto: UpdateDealerDto) {
    return this.updateDealerUseCase.execute(id, dto);
  }

  @Patch(':id/deactivate')
  @Permissions([permission_key.DEALER_DELETE])
  deactivate(@Param('id') id: string) {
    return this.updateDealerUseCase.execute(id, { isActive: false });
  }
}
