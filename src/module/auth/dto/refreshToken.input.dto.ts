import { Transform } from 'class-transformer';
import { IsString, Length } from 'class-validator';

export class RefreshTokenInputDto {
  @IsString()
  @Length(1, 500, { message: 'Refresh token must be between 1 and 500 characters' })
  @Transform(({ value }: { value: string }) => value.trim())
  refreshToken: string;
}
