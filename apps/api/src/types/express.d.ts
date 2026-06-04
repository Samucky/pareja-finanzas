import type { Types } from 'mongoose';

export interface AuthPayload {
  userId: string;
  coupleId: string | null;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthPayload;
    }
  }
}

export type ObjectId = Types.ObjectId;
