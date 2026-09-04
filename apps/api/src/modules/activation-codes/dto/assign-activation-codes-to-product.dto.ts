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
