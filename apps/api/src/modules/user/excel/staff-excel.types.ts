export type StaffExcelRow = {
  email: string;
  fullName: string;
  phone: string | null;
  status: string;
  username: string;
};

export type StaffTemporaryCredential =
  StaffImportResult['temporaryCredentials'][number];
import type { StaffImportResult } from '@repo/shared';
