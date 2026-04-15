/* eslint-disable @typescript-eslint/no-unused-vars */
import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';
import { isMatch } from 'date-fns';

export function IsDateFormat(format: string, validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'IsDateFormat',
      target: object.constructor,
      propertyName,
      constraints: [format],
      options: validationOptions,
      validator: {
        validate(value: string, args: ValidationArguments) {
          const [format] = args.constraints;

          if (!value) return false;

          const test = /^\d{4}-\d{2}-\d{2}$/.test(value);
          if (!test) return false;

          const match = isMatch(value, format);
          if (!match) return false;

          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return `Date format must be: yyyy-MM-dd`;
        },
      },
    });
  };
}
