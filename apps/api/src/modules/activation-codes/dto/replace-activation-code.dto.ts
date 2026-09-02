import { IsString, Length } from 'class-validator';

export class ReplaceActivationCodeDto {
  @IsString()
  @Length(8, 120)
  replacementCode!: string;
}
