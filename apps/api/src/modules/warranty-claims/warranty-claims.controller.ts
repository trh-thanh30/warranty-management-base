import { Permissions } from '@/common/decorators/permissions.decorator';
import { CreateWarrantyClaimDto } from '@/modules/warranty-claims/dto/create-warranty-claim.dto';
import { ListWarrantyClaimsDto } from '@/modules/warranty-claims/dto/list-warranty-claims.dto';
import { UpdateWarrantyClaimStatusDto } from '@/modules/warranty-claims/dto/update-warranty-claim-status.dto';
import { CreateWarrantyClaimUseCase } from '@/modules/warranty-claims/use-cases/create-warranty-claim.use-case';
import { GetWarrantyClaimDetailUseCase } from '@/modules/warranty-claims/use-cases/get-warranty-claim-detail.use-case';
import { ListWarrantyClaimsUseCase } from '@/modules/warranty-claims/use-cases/list-warranty-claims.use-case';
import { LookupWarrantyClaimByCodeUseCase } from '@/modules/warranty-claims/use-cases/lookup-warranty-claim-by-code.use-case';
import { LookupWarrantyClaimsByWarrantyCodeUseCase } from '@/modules/warranty-claims/use-cases/lookup-warranty-claims-by-warranty-code.use-case';
import { UpdateWarrantyClaimStatusUseCase } from '@/modules/warranty-claims/use-cases/update-warranty-claim-status.use-case';
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

@Controller('warranty-claims')
export class WarrantyClaimsController {
  constructor(
    private readonly createWarrantyClaimUseCase: CreateWarrantyClaimUseCase,
    private readonly listWarrantyClaimsUseCase: ListWarrantyClaimsUseCase,
    private readonly getWarrantyClaimDetailUseCase: GetWarrantyClaimDetailUseCase,
    private readonly lookupWarrantyClaimByCodeUseCase: LookupWarrantyClaimByCodeUseCase,
    private readonly lookupWarrantyClaimsByWarrantyCodeUseCase: LookupWarrantyClaimsByWarrantyCodeUseCase,
    private readonly updateWarrantyClaimStatusUseCase: UpdateWarrantyClaimStatusUseCase,
  ) {}

  @Post()
  @Permissions([permission_key.WARRANTY_CLAIM_CREATE])
  create(@Body() dto: CreateWarrantyClaimDto) {
    return this.createWarrantyClaimUseCase.execute(dto);
  }

  @Get()
  @Permissions([permission_key.WARRANTY_CLAIM_VIEW])
  list(@Query() query: ListWarrantyClaimsDto) {
    return this.listWarrantyClaimsUseCase.execute(query);
  }

  @Get('by-code/:claimCode')
  @Permissions([permission_key.WARRANTY_CLAIM_VIEW])
  lookupByClaimCode(@Param('claimCode') claimCode: string) {
    return this.lookupWarrantyClaimByCodeUseCase.execute(claimCode);
  }

  @Get('by-warranty-code/:warrantyCode')
  @Permissions([permission_key.WARRANTY_CLAIM_VIEW])
  lookupByWarrantyCode(@Param('warrantyCode') warrantyCode: string) {
    return this.lookupWarrantyClaimsByWarrantyCodeUseCase.execute(warrantyCode);
  }

  @Get(':id')
  @Permissions([permission_key.WARRANTY_CLAIM_VIEW])
  detail(@Param('id') id: string) {
    return this.getWarrantyClaimDetailUseCase.execute(id);
  }

  @Patch(':id/status')
  @Permissions([permission_key.WARRANTY_CLAIM_STATUS_UPDATE])
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateWarrantyClaimStatusDto,
  ) {
    return this.updateWarrantyClaimStatusUseCase.execute(id, dto);
  }
}
