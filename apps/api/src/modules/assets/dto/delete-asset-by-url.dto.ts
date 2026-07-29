import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class DeleteAssetByUrlDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2048)
  url: string;
}
