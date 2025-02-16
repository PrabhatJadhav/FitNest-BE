import { UserRoles } from '../enums/roleEnums';

export interface JwtTokenPayload {
  email: string;
  password: string;
  role: UserRoles;
  iat?: number;
  exp?: string;
}
