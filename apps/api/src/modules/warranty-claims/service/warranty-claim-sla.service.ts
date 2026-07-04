import {
  warranty_claim_priority,
  warranty_claim_status,
  type WarrantyClaim,
} from '@prisma/client';
import { Injectable } from '@nestjs/common';

const SLA_DAYS_BY_PRIORITY: Record<warranty_claim_priority, number> = {
  [warranty_claim_priority.LOW]: 7,
  [warranty_claim_priority.NORMAL]: 3,
  [warranty_claim_priority.HIGH]: 1,
  [warranty_claim_priority.URGENT]: 0,
};

const TERMINAL_STATUSES = new Set<warranty_claim_status>([
  warranty_claim_status.COMPLETED,
  warranty_claim_status.REJECTED,
  warranty_claim_status.CANCELLED,
]);

@Injectable()
export class WarrantyClaimSlaService {
  calculateDueAt(
    priority: warranty_claim_priority = warranty_claim_priority.NORMAL,
    from = new Date(),
  ) {
    const dueAt = new Date(from);
    dueAt.setDate(dueAt.getDate() + SLA_DAYS_BY_PRIORITY[priority]);

    if (priority === warranty_claim_priority.URGENT) {
      dueAt.setHours(23, 59, 59, 999);
    }

    return dueAt;
  }

  calculateSlaBreachedAt(
    claim: Pick<WarrantyClaim, 'status' | 'due_at' | 'sla_breached_at'>,
    now = new Date(),
  ) {
    if (!claim.due_at || TERMINAL_STATUSES.has(claim.status)) {
      return null;
    }

    if (claim.sla_breached_at) {
      return claim.sla_breached_at;
    }

    return claim.due_at < now ? now : null;
  }

  isTerminal(status: warranty_claim_status) {
    return TERMINAL_STATUSES.has(status);
  }
}
