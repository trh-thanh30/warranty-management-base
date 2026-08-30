import { Permissions } from '@/common/decorators/permissions.decorator';
import { User } from '@/common/decorators/user.decorator';
import { BadRequestError } from '@/common/response';
import { CreateActivationCodeBatchDto } from '@/modules/activation-codes/dto/create-activation-code-batch.dto';
import { CreateActivationCodeBatchUseCase } from '@/modules/activation-codes/use-cases/create-activation-code-batch.use-case';
import { Body, Controller, Post } from '@nestjs/common';
import { permission_key } from '@prisma/client';

type RequestUser = { id?: string };

@Controller('activation-code-batches')
export class ActivationCodesController {
  constructor(
    private readonly createActivationCodeBatchUseCase: CreateActivationCodeBatchUseCase,
  ) {}

  @Post()
  @Permissions([permission_key.WARRANTY_CREATE])
  create(@Body() dto: CreateActivationCodeBatchDto, @User() user: RequestUser) {
    if (!user?.id) {
      throw new BadRequestError(
        'Authenticated user is required',
        'ACTIVATION_CODE_CREATOR_REQUIRED',
      );
    }
    return this.createActivationCodeBatchUseCase.execute({
      ...dto,
      createdById: user.id,
    });
  }
}
