import { create } from 'zustand';
import type { ActivityItem } from '../types';

type ModalType = 'expense' | 'income' | 'savings-deposit' | 'savings-withdraw' | null;

interface UiState {
  modal: ModalType;
  editingTransaction: ActivityItem | null;
  socketConnected: boolean;
  openModal: (modal: ModalType) => void;
  openEditTransaction: (item: ActivityItem) => void;
  closeModal: () => void;
  setSocketConnected: (v: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  modal: null,
  editingTransaction: null,
  socketConnected: false,
  openModal: (modal) => set({ modal, editingTransaction: null }),
  openEditTransaction: (item) =>
    set({
      editingTransaction: item,
      modal: item.type === 'income' ? 'income' : 'expense',
    }),
  closeModal: () => set({ modal: null, editingTransaction: null }),
  setSocketConnected: (socketConnected) => set({ socketConnected }),
}));
