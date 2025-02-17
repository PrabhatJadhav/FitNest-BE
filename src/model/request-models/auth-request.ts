import { Request } from 'express';
import { JwtTokenPayload } from '../jwtTokenPayload.model';

export interface AuthRequestBody {
  email: string;
  password: string;
  userId: string;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtTokenPayload;
  headers: {
    authorization?: string;
  };
}
