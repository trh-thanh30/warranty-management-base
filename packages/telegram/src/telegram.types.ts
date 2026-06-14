export type TelegramNotifyMode = "text" | "image" | "both";

export type TelegramEventType = "ci" | "deploy";

export type TelegramStatus = "success" | "failed" | "running" | "cancelled";

export type TelegramJobStep = {
  name: string;
  status: TelegramStatus;
  duration?: string;
};

export type TelegramJobSummary = {
  name: string;
  status: TelegramStatus;
  duration?: string;
  url?: string;
  steps?: TelegramJobStep[];
};

export type TelegramConfig = {
  botToken: string;
  chatId: string;
  messageThreadId?: string;
  disableNotification?: boolean;
};

export type CiCdNotificationPayload = {
  event: TelegramEventType;
  status: TelegramStatus;
  project: string;
  environment: string;
  branch?: string;
  repository?: string;
  commitSha?: string;
  commitUrl?: string;
  commitMessage?: string;
  author?: string;
  actorUrl?: string;
  workflow?: string;
  job?: string;
  jobs?: TelegramJobSummary[];
  duration?: string;
  totals?: {
    passed?: number;
    failed?: number;
    running?: number;
    cancelled?: number;
  };
  runUrl?: string;
  dashboardUrl?: string;
  repositoryUrl?: string;
  createdAt?: Date;
};

export type TelegramSendMessageInput = {
  text: string;
  disableWebPagePreview?: boolean;
};

export type TelegramSendPhotoInput = {
  photo: Buffer;
  filename?: string;
  caption?: string;
};
