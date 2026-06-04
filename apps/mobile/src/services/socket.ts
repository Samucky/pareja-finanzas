import { io, type Socket } from 'socket.io-client';
import { getAccessToken } from './authStorage';
import { getApiUrl } from './api';

let socket: Socket | null = null;

export async function connectSocket(): Promise<Socket> {
  if (socket?.connected) return socket;
  const token = await getAccessToken();
  if (!token) throw new Error('No token');

  socket = io(getApiUrl(), {
    auth: { token },
    transports: ['websocket'],
    autoConnect: true,
  });

  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}

export function getSocket(): Socket | null {
  return socket;
}
