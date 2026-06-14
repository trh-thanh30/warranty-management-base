import { IsEmail, IsNotEmpty } from 'class-validator';

export class RequestVerificationDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
