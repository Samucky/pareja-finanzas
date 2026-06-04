import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { connectSocket, disconnectSocket, getSocket } from '../services/socket';
import { useAuthStore } from '../store/authStore';
import { useUiStore } from '../store/uiStore';
import type { Dashboard } from '../types';

const EVENTS = ['couple:sync', 'transaction:created', 'savings:movement', 'balance:updated'] as const;

export function useSocketSync(enabled: boolean) {
  const queryClient = useQueryClient();
  const setConnected = useUiStore((s) => s.setSocketConnected);
  const coupleId = useAuthStore((s) => s.user?.coupleId);

  useEffect(() => {
    if (!enabled || !coupleId) return;

    let mounted = true;

    (async () => {
      try {
        const socket = await connectSocket();
        if (!mounted) return;

        const onSync = (dashboard: Dashboard) => {
          queryClient.setQueryData(['dashboard'], dashboard);
        };

        const handler = (payload: Dashboard | unknown) => {
          if (payload && typeof payload === 'object' && 'balances' in payload) {
            queryClient.setQueryData(['dashboard'], payload as Dashboard);
          } else {
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
          }
        };

        EVENTS.forEach((event) => socket.on(event, handler));
        socket.on('connect', () => setConnected(true));
        socket.on('disconnect', () => setConnected(false));
        setConnected(socket.connected);
      } catch {
        setConnected(false);
      }
    })();

    return () => {
      mounted = false;
      const s = getSocket();
      if (s) {
        EVENTS.forEach((event) => s.off(event));
        s.off('connect');
        s.off('disconnect');
      }
      disconnectSocket();
      setConnected(false);
    };
  }, [enabled, coupleId, queryClient, setConnected]);
}
