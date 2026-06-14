import { registerAs } from '@nestjs/config';

// register the app config
export default registerAs('telegram', () => ({
  botToken: process.env.CI_TELEGRAM_BOT_TOKEN ?? '',
  chatId: process.env.CI_TELEGRAM_CHAT_ID ?? '',
}));
