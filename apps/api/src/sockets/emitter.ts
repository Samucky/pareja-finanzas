import type { Server as SocketServer } from 'socket.io';

let io: SocketServer | null = null;

export function setSocketServer(server: SocketServer): void {
  io = server;
}

export function emitToCouple(coupleId: string, event: string, payload: unknown): void {
  io?.to(`couple:${coupleId}`).emit(event, payload);
}

export const CoupleEvents = {
  SYNC: 'couple:sync',
  TRANSACTION_CREATED: 'transaction:created',
  SAVINGS_MOVEMENT: 'savings:movement',
  BALANCE_UPDATED: 'balance:updated',
} as const;
