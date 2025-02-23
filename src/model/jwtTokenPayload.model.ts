import { UserRoles } from '../enums/role-enums';

export interface JwtTokenPayload {
  id: string;
  role: UserRoles;
  iat?: number;
  exp?: string;
}
