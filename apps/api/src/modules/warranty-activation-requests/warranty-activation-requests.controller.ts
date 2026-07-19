import { Permissions } from '@/common/decorators/permissions.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { User } from '@/common/decorators/user.decorator';
import { CreateWarrantyActivationRequestDto } from '@/modules/warranty-activation-requests/dto/create-warranty-activation-request.dto';
import { ListWarrantyActivationRequestsDto } from '@/modules/warranty-activation-requests/dto/list-warranty-activation-requests.dto';
import { ReviewWarrantyActivationRequestDto } from '@/modules/warranty-activation-requests/dto/review-warranty-activation-request.dto';
import { CreateWarrantyActivationRequestUseCase } from '@/modules/warranty-activation-requests/use-cases/create-warranty-activation-request.use-case';
import { GetWarrantyActivationRequestDetailUseCase } from '@/modules/warranty-activation-requests/use-cases/get-warranty-activation-request-detail.use-case';
import { ListWarrantyActivationRequestsUseCase } from '@/modules/warranty-activation-requests/use-cases/list-warranty-activation-requests.use-case';
import { ReviewWarrantyActivationRequestUseCase } from '@/modules/warranty-activation-requests/use-cases/review-warranty-activation-request.use-case';
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

type RequestUser = {
  id?: string;
};

@Controller('warranty-activation-requests')
export class WarrantyActivationRequestsController {
  constructor(
    private readonly createWarrantyActivationRequestUseCase: CreateWarrantyActivationRequestUseCase,
    private readonly listWarrantyActivationRequestsUseCase: ListWarrantyActivationRequestsUseCase,
    private readonly getWarrantyActivationRequestDetailUseCase: GetWarrantyActivationRequestDetailUseCase,
    private readonly reviewWarrantyActivationRequestUseCase: ReviewWarrantyActivationRequestUseCase,
  ) {}

  @Post()
  @Public()
  create(@Body() dto: CreateWarrantyActivationRequestDto) {
    return this.createWarrantyActivationRequestUseCase.execute(dto);
  }

  @Get()
  @Permissions([permission_key.WARRANTY_VIEW])
  list(@Query() query: ListWarrantyActivationRequestsDto) {
    return this.listWarrantyActivationRequestsUseCase.execute(query);
  }

  @Get(':id')
  @Permissions([permission_key.WARRANTY_VIEW])
  detail(@Param('id') id: string) {
    return this.getWarrantyActivationRequestDetailUseCase.execute(id);
  }

  @Patch(':id/review')
  @Permissions([permission_key.WARRANTY_UPDATE])
  review(
    @Param('id') id: string,
    @Body() dto: ReviewWarrantyActivationRequestDto,
    @User() user: RequestUser,
  ) {
    return this.reviewWarrantyActivationRequestUseCase.execute(id, dto, {
      reviewedByUserId: user?.id,
    });
  }
}
