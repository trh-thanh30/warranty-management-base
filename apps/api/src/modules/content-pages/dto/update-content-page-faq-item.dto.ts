import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class UpdateContentPageFaqItemDto {
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @Length(2, 300)
  question?: string;

  @IsOptional()
  @IsString()
  @Length(1, 10000)
  answer?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
