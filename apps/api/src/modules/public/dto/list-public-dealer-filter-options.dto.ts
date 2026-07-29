import { IsOptional, IsString, Length } from 'class-validator';

export class ListPublicDealerFilterOptionsDto {
  @IsOptional()
  @IsString()
  @Length(1, 120)
  province?: string;
}
