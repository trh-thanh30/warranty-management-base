import { User } from '@prisma/client';

declare global {
  namespace Express {
    export interface Request {
      requestId: string;
      session?: any;
      user?: User;
      guestId?: string;
    }
  }
}

export {};
