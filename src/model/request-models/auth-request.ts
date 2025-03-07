import { Request } from 'express';
// import { JwtTokenPayload } from '../jwtTokenPayload.model';
import { User } from '../user';

export interface AuthRequestBody {
  email: string;
  password: string;
  userId: string;
}

export interface AuthenticatedRequest<T = any> extends Request {
  user?: User;
  headers: {
    authorization?: string;
  };
  body: T;
}
