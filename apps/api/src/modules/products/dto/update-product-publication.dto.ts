import { IsBoolean } from 'class-validator';

export class UpdateProductPublicationDto {
  @IsBoolean()
  isPublished: boolean;
}
