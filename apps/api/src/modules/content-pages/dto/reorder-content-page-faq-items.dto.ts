import { ArrayMinSize, ArrayUnique, IsArray, IsUUID } from 'class-validator';

export class ReorderContentPageFaqItemsDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsUUID('4', { each: true })
  itemIds!: string[];
}
