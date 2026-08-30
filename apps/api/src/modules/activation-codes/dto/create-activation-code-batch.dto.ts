import { IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class CreateActivationCodeBatchDto {
  @IsUUID()
  sourceProductId: string;

  @IsOptional()
  @IsInt()
  @Min(50)
  @Max(1000)
  quantity?: number;
}
