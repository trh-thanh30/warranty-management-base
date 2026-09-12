import { IsUUID } from 'class-validator';

export class PresenceHeartbeatDto {
  @IsUUID('4')
  sessionId!: string;
}
