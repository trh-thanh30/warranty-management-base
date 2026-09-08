import { IsUUID } from 'class-validator';

export class AddDealerMemberDto {
  @IsUUID()
  userId!: string;
}
