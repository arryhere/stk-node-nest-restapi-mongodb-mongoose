import { Transform } from 'class-transformer';
import { IsEmail, IsString, Length } from 'class-validator';

export class SigninInputDto {
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @IsString()
  @Length(8, 50, { message: 'Password must be between 8 and 50 characters' })
  @Transform(({ value }: { value: string }) => value.trim())
  password: string;
}
