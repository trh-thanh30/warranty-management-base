import { registerDecorator, type ValidationOptions } from 'class-validator';

export function IsNotFutureDate(validationOptions?: ValidationOptions) {
  return (target: object, propertyName: string) => {
    registerDecorator({
      name: 'isNotFutureDate',
      target: target.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          if (value === undefined || value === null) return true;
          if (typeof value !== 'string') return false;

          const date = new Date(value);
          if (Number.isNaN(date.getTime())) return false;

          const now = new Date();
          const endOfTodayUtc = Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate(),
            23,
            59,
            59,
            999,
          );

          return date.getTime() <= endOfTodayUtc;
        },
      },
    });
  };
}
