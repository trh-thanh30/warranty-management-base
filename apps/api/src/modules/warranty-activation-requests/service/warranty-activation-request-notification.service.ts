import { CreateSystemNotificationUseCase } from '@/modules/notification/use-cases/create-system-notification.use-case';
import { Injectable, Logger } from '@nestjs/common';
import {
  notification_scope,
  user_role,
  type WarrantyActivationRequest,
} from '@prisma/client';

type ActivationRequestNotificationInput = Pick<
  WarrantyActivationRequest,
  | 'id'
  | 'request_code'
  | 'warranty_code'
  | 'customer_name'
  | 'customer_phone'
  | 'source'
  | 'status'
>;

@Injectable()
export class WarrantyActivationRequestNotificationService {
  private readonly logger = new Logger(
    WarrantyActivationRequestNotificationService.name,
  );

  constructor(
    private readonly createSystemNotificationUseCase: CreateSystemNotificationUseCase,
  ) {}

  async requestCreated(request: ActivationRequestNotificationInput) {
    try {
      await this.createSystemNotificationUseCase.execute({
        title: `New warranty activation request ${request.request_code}`,
        content: `Warranty activation request ${request.request_code} has been submitted.`,
        type: 'WARRANTY_ACTIVATION_REQUEST_CREATED',
        scope: notification_scope.ROLE,
        target_roles: [user_role.ADMIN, user_role.MODERATOR],
        metadata: {
          requestId: request.id,
          requestCode: request.request_code,
          warrantyCode: request.warranty_code,
          customerName: request.customer_name,
          customerPhone: request.customer_phone,
          source: request.source,
          status: request.status,
        },
      });
    } catch (error) {
      this.logger.warn(
        `Could not publish activation request notification: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}
