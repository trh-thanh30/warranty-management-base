import { CreateSystemNotificationUseCase } from '@/modules/notification/use-cases/create-system-notification.use-case';
import { Injectable, Logger } from '@nestjs/common';
import {
  notification_scope,
  user_role,
  warranty_claim_status,
  type WarrantyClaim,
} from '@prisma/client';

type ClaimNotificationInput = Pick<
  WarrantyClaim,
  'id' | 'claim_code' | 'warranty_code' | 'status' | 'service_center_id'
>;

@Injectable()
export class WarrantyClaimNotificationService {
  private readonly logger = new Logger(WarrantyClaimNotificationService.name);

  constructor(
    private readonly createSystemNotificationUseCase: CreateSystemNotificationUseCase,
  ) {}

  async claimCreated(claim: ClaimNotificationInput) {
    await this.notifyAdmins({
      title: `New warranty claim ${claim.claim_code}`,
      content: `Warranty claim ${claim.claim_code} has been submitted.`,
      type: 'WARRANTY_CLAIM_CREATED',
      claim,
    });
  }

  async statusChanged(
    claim: ClaimNotificationInput,
    fromStatus: warranty_claim_status,
  ) {
    await this.notifyAdmins({
      title: `Warranty claim ${claim.claim_code} status updated`,
      content: `Warranty claim ${claim.claim_code} moved from ${fromStatus} to ${claim.status}.`,
      type: 'WARRANTY_CLAIM_STATUS_CHANGED',
      claim,
      metadata: { fromStatus, toStatus: claim.status },
    });
  }

  async serviceCenterAssigned(claim: ClaimNotificationInput) {
    await this.notifyAdmins({
      title: `Warranty claim ${claim.claim_code} assigned`,
      content: `Warranty claim ${claim.claim_code} has been assigned to a service center.`,
      type: 'WARRANTY_CLAIM_ASSIGNED_SERVICE_CENTER',
      claim,
    });
  }

  async slaBreached(claim: ClaimNotificationInput) {
    await this.notifyAdmins({
      title: `Warranty claim ${claim.claim_code} is overdue`,
      content: `Warranty claim ${claim.claim_code} has breached its SLA.`,
      type: 'WARRANTY_CLAIM_SLA_BREACHED',
      claim,
    });
  }

  private async notifyAdmins(input: {
    title: string;
    content: string;
    type: string;
    claim: ClaimNotificationInput;
    metadata?: Record<string, unknown>;
  }) {
    try {
      await this.createSystemNotificationUseCase.execute({
        title: input.title,
        content: input.content,
        type: input.type,
        scope: notification_scope.ROLE,
        target_roles: [user_role.ADMIN, user_role.MODERATOR],
        metadata: {
          ...(input.metadata ?? {}),
          claimId: input.claim.id,
          claimCode: input.claim.claim_code,
          warrantyCode: input.claim.warranty_code,
          status: input.claim.status,
          serviceCenterId: input.claim.service_center_id,
        },
      });
    } catch (error) {
      this.logger.warn(
        `Could not publish claim notification ${input.type}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}
