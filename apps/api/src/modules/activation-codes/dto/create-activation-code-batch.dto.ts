import { IsInt, IsUUID, Max, Min } from 'class-validator';

export class CreateActivationCodeBatchDto {
  @IsUUID()
  sourceProductId: string;

  @IsInt()
  @Min(50)
  @Max(1000)
  quantity: number;
}
