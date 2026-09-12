import { PresenceRepository } from '@/modules/analytics/repository/presence.repository';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class GetOnlinePresenceUseCase {
  constructor(
    @Inject(PresenceRepository)
    private readonly repository: Pick<PresenceRepository, 'getOnlineCounts'>,
  ) {}

  execute() {
    return this.repository.getOnlineCounts();
  }
}
