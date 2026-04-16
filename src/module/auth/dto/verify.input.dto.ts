import { Transform } from 'class-transformer';
import { IsString, Length } from 'class-validator';

export class VerifyInputDto {
  @IsString()
  @Length(1, 500, { message: 'Verify token must be between 1 and 500 characters' })
  @Transform(({ value }: { value: string }) => value.trim())
  verifyToken: string;
}
