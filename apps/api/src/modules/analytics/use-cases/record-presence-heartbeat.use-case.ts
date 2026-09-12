import { PresenceRepository } from '@/modules/analytics/repository/presence.repository';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class RecordPresenceHeartbeatUseCase {
  constructor(
    @Inject(PresenceRepository)
    private readonly repository: Pick<PresenceRepository, 'heartbeat'>,
  ) {}

  async execute(source: 'web' | 'admin', identity: string) {
    await this.repository.heartbeat(source, identity);
    return { recorded: true };
  }
}
