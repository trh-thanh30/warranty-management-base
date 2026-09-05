export type ActivationCodePrintJobStatus =
  | "QUEUED"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED";

export type ActivationCodePrintJob = {
  id: string;
  batch_id: string;
  requested_by_id: string;
  idempotency_key: string;
  status: ActivationCodePrintJobStatus;
  progress_percent: number;
  from_index: number;
  to_index: number;
  label_width_mm: number;
  label_height_mm: number;
  bull_job_id: string | null;
  storage_key: string | null;
  filename: string | null;
  error_message: string | null;
  attempts: number;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type RequestActivationCodePrintJobQuery = {
  from?: number;
  labelHeightMm?: number;
  labelWidthMm?: number;
  to?: number;
};
