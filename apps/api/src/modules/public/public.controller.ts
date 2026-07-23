import { Public } from '@/common/decorators/public.decorator';
import { ListServiceCentersDto } from '@/modules/service-centers/dto/list-service-centers.dto';
import { LookupWarrantyDto } from '@/modules/warranties/dto/lookup-warranty.dto';
import { LookupWarrantyByCodeUseCase } from '@/modules/warranties/use-cases/lookup-warranty-by-code.use-case';
import { CreateWarrantyActivationRequestDto } from '@/modules/warranty-activation-requests/dto/create-warranty-activation-request.dto';
import { CreateWarrantyActivationRequestUseCase } from '@/modules/warranty-activation-requests/use-cases/create-warranty-activation-request.use-case';
import { CreateWarrantyClaimDto } from '@/modules/warranty-claims/dto/create-warranty-claim.dto';
import { CreateWarrantyClaimUseCase } from '@/modules/warranty-claims/use-cases/create-warranty-claim.use-case';
import { PublicListServiceCentersUseCase } from '@/modules/public/use-cases/public-list-service-centers.use-case';
import { PublicLookupWarrantyClaimByCodeUseCase } from '@/modules/public/use-cases/public-lookup-warranty-claim-by-code.use-case';
import { PublicLookupWarrantyClaimsByWarrantyCodeUseCase } from '@/modules/public/use-cases/public-lookup-warranty-claims-by-warranty-code.use-case';
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';

@Public()
@Controller('public')
export class PublicController {
  constructor(
    private readonly lookupWarrantyByCodeUseCase: LookupWarrantyByCodeUseCase,
    private readonly createWarrantyActivationRequestUseCase: CreateWarrantyActivationRequestUseCase,
    private readonly createWarrantyClaimUseCase: CreateWarrantyClaimUseCase,
    private readonly publicLookupWarrantyClaimByCodeUseCase: PublicLookupWarrantyClaimByCodeUseCase,
    private readonly publicLookupWarrantyClaimsByWarrantyCodeUseCase: PublicLookupWarrantyClaimsByWarrantyCodeUseCase,
    private readonly publicListServiceCentersUseCase: PublicListServiceCentersUseCase,
  ) {}

  @Get('warranties/lookup')
  lookupWarranty(@Query() query: LookupWarrantyDto) {
    return this.lookupWarrantyByCodeUseCase.execute(query);
  }

  @Post('warranty-activation-requests')
  createWarrantyActivationRequest(
    @Body() dto: CreateWarrantyActivationRequestDto,
  ) {
    return this.createWarrantyActivationRequestUseCase.execute(dto);
  }

  @Post('warranty-claims')
  createWarrantyClaim(@Body() dto: CreateWarrantyClaimDto) {
    return this.createWarrantyClaimUseCase.execute(dto);
  }

  @Get('warranty-claims/by-code/:claimCode')
  lookupWarrantyClaimByCode(@Param('claimCode') claimCode: string) {
    return this.publicLookupWarrantyClaimByCodeUseCase.execute(claimCode);
  }

  @Get('warranty-claims/by-warranty-code/:warrantyCode')
  lookupWarrantyClaimsByWarrantyCode(
    @Param('warrantyCode') warrantyCode: string,
  ) {
    return this.publicLookupWarrantyClaimsByWarrantyCodeUseCase.execute(
      warrantyCode,
    );
  }

  @Get('service-centers')
  listServiceCenters(@Query() query: ListServiceCentersDto) {
    return this.publicListServiceCentersUseCase.execute(query);
  }
}
