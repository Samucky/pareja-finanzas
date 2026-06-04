import http from 'http';
import { Server as SocketServer } from 'socket.io';
import { createApp } from './app.js';
import { connectDb } from './config/db.js';
import { env } from './config/env.js';
import { setSocketServer } from './sockets/emitter.js';
import { verifyAccessToken } from './services/jwt.service.js';
import { getDashboard } from './services/dashboard.service.js';
import { CoupleEvents } from './sockets/emitter.js';

async function main() {
  await connectDb();
  const app = createApp();
  const httpServer = http.createServer(app);

  const io = new SocketServer(httpServer, {
    cors: { origin: env.CORS_ORIGIN === '*' ? '*' : env.CORS_ORIGIN.split(',') },
  });
  setSocketServer(io);

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next(new Error('Unauthorized'));
    try {
      socket.data.auth = verifyAccessToken(token);
      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', async (socket) => {
    const { coupleId } = socket.data.auth;
    if (!coupleId) {
      socket.emit('error', { message: 'Sin pareja vinculada' });
      return;
    }
    const room = `couple:${coupleId}`;
    socket.join(room);
    try {
      const dashboard = await getDashboard(coupleId);
      socket.emit(CoupleEvents.SYNC, dashboard);
    } catch (err) {
      console.error('Socket sync error', err);
    }
  });

  const host = '0.0.0.0';
  httpServer.listen(env.PORT, host, () => {
    console.log(`API + WebSocket listening on ${host}:${env.PORT}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
