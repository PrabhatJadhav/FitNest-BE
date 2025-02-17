import { UserRoles } from '../enums/roleEnums';

export interface JwtTokenPayload {
  id: string;
  role: UserRoles;
  iat?: number;
  exp?: string;
}
