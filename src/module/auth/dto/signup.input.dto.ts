import { Transform } from 'class-transformer';
import { IsEmail, IsPhoneNumber, IsString, Length } from 'class-validator';

import { IsDateFormat } from '../../../validation/customClassValidation/isDateFormat.js';

export class SignupInputDto {
  @IsString()
  @Length(1, 255, { message: 'firstName must be between 1 and 255 characters' })
  @Transform(({ value }: { value: string }) => value.trim())
  firstName: string;

  @IsString()
  @Length(1, 255, { message: 'firstName must be between 1 and 255 characters' })
  @Transform(({ value }: { value: string }) => value.trim())
  lastName: string;

  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @IsString()
  @Length(8, 50, { message: 'Password must be between 8 and 50 characters' })
  @Transform(({ value }: { value: string }) => value.trim())
  password: string;

  @IsDateFormat('yyyy-MM-dd')
  @Length(1, 20, { message: 'DOB must be between 1 and 20 characters' })
  @Transform(({ value }: { value: string }) => value.trim())
  dob: string;

  @IsPhoneNumber(undefined, { message: 'Phone number is not a valid number' })
  @Length(1, 20, { message: 'PhoneNumber must be between 1 and 20 characters' })
  @Transform(({ value }: { value: string }) => value.trim())
  phoneNumber: string;
}
