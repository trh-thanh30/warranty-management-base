import type { TelegramConfig, TelegramSendMessageInput, TelegramSendPhotoInput } from "@/telegram.types.js";

export class TelegramClient {
  private readonly apiBaseUrl: string;

  constructor(private readonly config: TelegramConfig) {
    this.apiBaseUrl = `https://api.telegram.org/bot${config.botToken}`;
  }

  async sendMessage(input: TelegramSendMessageInput): Promise<void> {
    const body: Record<string, unknown> = {
      chat_id: this.config.chatId,
      text: input.text,
      parse_mode: "HTML",
      disable_web_page_preview: input.disableWebPagePreview ?? false,
      disable_notification: this.config.disableNotification ?? false,
    };

    if (this.config.messageThreadId) {
      body.message_thread_id = Number(this.config.messageThreadId);
    }

    await this.request("sendMessage", body);
  }

  async sendPhoto(input: TelegramSendPhotoInput): Promise<void> {
    const form = new FormData();
    const photo = input.photo.buffer.slice(
      input.photo.byteOffset,
      input.photo.byteOffset + input.photo.byteLength,
    ) as ArrayBuffer;

    form.append("chat_id", this.config.chatId);
    form.append("photo", new Blob([photo], { type: "image/png" }), input.filename ?? "notification.png");
    form.append("disable_notification", String(this.config.disableNotification ?? false));

    if (input.caption) {
      form.append("caption", input.caption);
      form.append("parse_mode", "HTML");
    }

    if (this.config.messageThreadId) {
      form.append("message_thread_id", this.config.messageThreadId);
    }

    await this.requestForm("sendPhoto", form);
  }

  private async request(method: string, body: Record<string, unknown>): Promise<void> {
    const response = await fetch(`${this.apiBaseUrl}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    await this.assertOk(response);
  }

  private async requestForm(method: string, body: FormData): Promise<void> {
    const response = await fetch(`${this.apiBaseUrl}/${method}`, {
      method: "POST",
      body,
    });

    await this.assertOk(response);
  }

  private async assertOk(response: Response): Promise<void> {
    if (response.ok) {
      return;
    }

    const error = await response.text();
    throw new Error(`Telegram API request failed with ${response.status}: ${error}`);
  }
}
