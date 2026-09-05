import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, Max, Min } from 'class-validator';
import {
  ACTIVATION_LABEL_PRINTABLE_HEIGHT_MM,
  ACTIVATION_LABEL_PRINTABLE_WIDTH_MM,
  MIN_ACTIVATION_LABEL_HEIGHT_MM,
  MIN_ACTIVATION_LABEL_WIDTH_MM,
} from '@repo/shared/constants';

export class PrintableActivationLabelsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  from?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(MIN_ACTIVATION_LABEL_WIDTH_MM)
  @Max(ACTIVATION_LABEL_PRINTABLE_WIDTH_MM)
  labelWidthMm?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(MIN_ACTIVATION_LABEL_HEIGHT_MM)
  @Max(ACTIVATION_LABEL_PRINTABLE_HEIGHT_MM)
  labelHeightMm?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  to?: number;
}
