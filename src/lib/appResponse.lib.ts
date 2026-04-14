import { IsBoolean, IsInt, IsObject, IsString } from 'class-validator';

export class AppResponse {
  @IsBoolean()
  success: boolean;

  @IsInt()
  statusCode: number;

  @IsString()
  message: string;

  @IsObject()
  data: object;
}
