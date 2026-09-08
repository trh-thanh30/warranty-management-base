import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateActivationCodeBatchDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  batchName: string;
}
