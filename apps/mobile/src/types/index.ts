export interface User {
  id: string;
  email: string;
  displayName: string;
  coupleId: string | null;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface Balances {
  liquid: number;
  savings: number;
  available: number;
}

export interface Dashboard {
  couple: { id: string; name: string; inviteCode: string };
  balances: Balances;
  monthSummary: { income: number; expense: number };
  categoryBreakdown: Record<string, number>;
  members: { id: string; displayName: string; email: string }[];
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  kind: 'transaction' | 'savings';
  type: string;
  amount: number;
  category?: string;
  note?: string;
  userName: string;
  createdAt: string;
}

export type ExpenseCategory = 'comida' | 'transporte' | 'hogar' | 'ocio' | 'salud' | 'otros';

export const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  comida: 'Comida',
  transporte: 'Transporte',
  hogar: 'Hogar',
  ocio: 'Ocio',
  salud: 'Salud',
  otros: 'Otros',
};
