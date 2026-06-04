import { create } from 'zustand';

export type AlertVariant = 'info' | 'success' | 'warning' | 'danger';

interface AlertState {
  visible: boolean;
  title: string;
  message: string;
  variant: AlertVariant;
  confirmLabel: string;
  cancelLabel: string | null;
  onConfirm: (() => void) | null;
  onCancel: (() => void) | null;
  show: (opts: {
    title: string;
    message: string;
    variant?: AlertVariant;
    confirmLabel?: string;
    cancelLabel?: string | null;
    onConfirm?: () => void;
    onCancel?: () => void;
  }) => void;
  hide: () => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  visible: false,
  title: '',
  message: '',
  variant: 'info',
  confirmLabel: 'Aceptar',
  cancelLabel: null,
  onConfirm: null,
  onCancel: null,
  show: (opts) =>
    set({
      visible: true,
      title: opts.title,
      message: opts.message,
      variant: opts.variant ?? 'info',
      confirmLabel: opts.confirmLabel ?? 'Aceptar',
      cancelLabel: opts.cancelLabel ?? null,
      onConfirm: opts.onConfirm ?? null,
      onCancel: opts.onCancel ?? null,
    }),
  hide: () =>
    set({
      visible: false,
      onConfirm: null,
      onCancel: null,
    }),
}));

export function showAlert(opts: Parameters<AlertState['show']>[0]) {
  useAlertStore.getState().show(opts);
}

export function confirmAlert(opts: {
  title: string;
  message: string;
  variant?: AlertVariant;
  confirmLabel?: string;
  cancelLabel?: string;
}): Promise<boolean> {
  return new Promise((resolve) => {
    useAlertStore.getState().show({
      ...opts,
      cancelLabel: opts.cancelLabel ?? 'Cancelar',
      onConfirm: () => {
        useAlertStore.getState().hide();
        resolve(true);
      },
      onCancel: () => {
        useAlertStore.getState().hide();
        resolve(false);
      },
    });
  });
}
