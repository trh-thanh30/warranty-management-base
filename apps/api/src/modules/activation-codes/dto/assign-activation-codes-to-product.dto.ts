import { IsUUID } from 'class-validator';

export class AssignActivationCodesToProductDto {
  @IsUUID()
  activationCodeId!: string;

  @IsUUID()
  productId!: string;
}

export class UnassignActivationCodesFromProductDto {
  @IsUUID()
  activationCodeId!: string;
}

export class ReplaceProductActivationCodeAssignmentDto {
  @IsUUID()
  currentActivationCodeId!: string;

  @IsUUID()
  replacementActivationCodeId!: string;

  @IsUUID()
  productId!: string;
}
