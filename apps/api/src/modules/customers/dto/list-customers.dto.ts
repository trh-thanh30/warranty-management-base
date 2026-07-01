import { IsOptional, IsString } from 'class-validator';

export class ListCustomersDto {
  @IsOptional()
  @IsString()
  search?: string;
}
