import { registerAs } from '@nestjs/config';

export default registerAs('time', () => ({
  millisecondsPerDay: parseInt(
    process.env.MILLISECONDS_PER_DAY ?? '86400000',
    10,
  ),
}));
