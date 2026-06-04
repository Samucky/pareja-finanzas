import { create } from 'zustand';

type ModalType = 'expense' | 'income' | 'savings-deposit' | 'savings-withdraw' | null;

interface UiState {
  modal: ModalType;
  socketConnected: boolean;
  openModal: (modal: ModalType) => void;
  closeModal: () => void;
  setSocketConnected: (v: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  modal: null,
  socketConnected: false,
  openModal: (modal) => set({ modal }),
  closeModal: () => set({ modal: null }),
  setSocketConnected: (socketConnected) => set({ socketConnected }),
}));
