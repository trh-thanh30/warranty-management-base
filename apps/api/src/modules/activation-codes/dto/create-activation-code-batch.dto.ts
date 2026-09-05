import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateActivationCodeBatchDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  batchName?: string;

  @IsOptional()
  @IsUUID()
  sourceProductId?: string;

  @IsOptional()
  @IsInt()
  @Min(50)
  @Max(1000)
  quantity?: number;
}
