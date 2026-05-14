export type Role = 'admin' | 'gerente' | 'vendedora';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  storeId?: string;
  active: boolean;
}

export interface Store {
  id: string;
  name: string;
  holidays: string[]; // YYYY-MM-DD
}

export interface LevelConfig {
  level: number;
  name: string;
  targetAmount: number;
  reward?: string;
}

export interface Goal {
  id: string;
  storeId: string;
  month: string; // YYYY-MM
  totalTarget: number;
  levels: LevelConfig[];
}

export interface UserGoal {
  id: string;
  userId: string;
  storeId: string;
  month: string;
  target: number;
}

export interface Sale {
  id: string;
  userId: string;
  storeId: string;
  amount: number;
  date: string; // ISO string
  isConditional: boolean;
  isConverted?: boolean;
}
