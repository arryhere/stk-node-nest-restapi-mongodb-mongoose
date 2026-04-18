import { RoleEnum } from '../model/user.model.js';

export type JwtAccessTokenPayloadType = {
  id: string;
  role: RoleEnum;
  iat?: number;
  exp?: number;
};
export type JwtRefreshTokenPayloadType = {
  id: string;
  iat?: number;
  exp?: number;
};
