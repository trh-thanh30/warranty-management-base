import { containsDisallowedVietnamAddressDetailUnit } from '@repo/shared/utils';
import { registerDecorator, type ValidationOptions } from 'class-validator';

export function IsLocalAddressDetail(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsLocalAddressDetail',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          return (
            typeof value === 'string' &&
            !containsDisallowedVietnamAddressDetailUnit(value)
          );
        },
        defaultMessage() {
          return 'Address detail must not include a ward, commune, province, or city';
        },
      },
    });
  };
}
