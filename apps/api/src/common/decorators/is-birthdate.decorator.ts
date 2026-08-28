import { registerDecorator, type ValidationOptions } from 'class-validator';

const BIRTHDATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MINIMUM_BIRTHDATE = '1900-01-01';

export function IsBirthdate(validationOptions?: ValidationOptions) {
  return (target: object, propertyName: string) => {
    registerDecorator({
      name: 'isBirthdate',
      target: target.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          if (value === undefined) return true;
          if (typeof value !== 'string') return false;
          if (!BIRTHDATE_PATTERN.test(value)) return false;
          if (value < MINIMUM_BIRTHDATE) return false;

          const date = new Date(`${value}T00:00:00.000Z`);
          if (
            Number.isNaN(date.getTime()) ||
            date.toISOString().slice(0, 10) !== value
          ) {
            return false;
          }

          const now = new Date();
          const today = [
            now.getUTCFullYear().toString().padStart(4, '0'),
            (now.getUTCMonth() + 1).toString().padStart(2, '0'),
            now.getUTCDate().toString().padStart(2, '0'),
          ].join('-');

          return value <= today;
        },
        defaultMessage() {
          return 'Birthdate must use YYYY-MM-DD and be between 1900-01-01 and today';
        },
      },
    });
  };
}
