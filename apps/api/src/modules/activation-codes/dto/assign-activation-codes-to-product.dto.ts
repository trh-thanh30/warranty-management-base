import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsUUID,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';
import {
  ACTIVATION_CODE_PRODUCT_ASSIGNMENT_MODES,
  MAX_ACTIVATION_CODES_PER_PRODUCT_ASSIGNMENT,
  MAX_AUTOMATIC_ACTIVATION_CODES_PER_PRODUCT_ASSIGNMENT,
  type ActivationCodeProductAssignmentMode,
} from '@repo/shared/constants';

export class AssignActivationCodesToProductDto {
  @IsOptional()
  @IsIn(ACTIVATION_CODE_PRODUCT_ASSIGNMENT_MODES)
  assignmentMode?: ActivationCodeProductAssignmentMode;

  @ValidateIf(
    (input: AssignActivationCodesToProductDto) =>
      !input.assignmentMode || input.assignmentMode === 'SELECTED',
  )
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(MAX_ACTIVATION_CODES_PER_PRODUCT_ASSIGNMENT)
  @IsUUID('all', { each: true })
  activationCodeIds?: string[];

  @ValidateIf(
    (input: AssignActivationCodesToProductDto) =>
      input.assignmentMode === 'ALL_AVAILABLE',
  )
  @IsUUID()
  batchId?: string;

  @ValidateIf(
    (input: AssignActivationCodesToProductDto) =>
      input.assignmentMode === 'QUANTITY' && input.batchIds !== undefined,
  )
  @IsArray()
  @IsUUID('all', { each: true })
  batchIds?: string[];

  @ValidateIf(
    (input: AssignActivationCodesToProductDto) =>
      input.assignmentMode === 'QUANTITY',
  )
  @IsInt()
  @Min(1)
  @Max(MAX_AUTOMATIC_ACTIVATION_CODES_PER_PRODUCT_ASSIGNMENT)
  quantity?: number;

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
