// User types
export interface User {
  id: string;
  email: string;
  username: string;
  avatar_url?: string;
  created_at: string;
}

// Session types
export type SessionStatus = 'active' | 'closed';

export interface GameSession {
  id: string;
  name: string;
  created_at: string;
  status: SessionStatus;
  current_admin_id: string;
  join_code: string;
  created_by: string;
}

// Session Player types
export interface SessionPlayer {
  session_id: string;
  user_id: string;
  username: string;
  avatar_url?: string;
  cash_out_amount: number | null;
  total_buyin: number;
  current_stack: number;
  is_admin: boolean;
}

// Transaction types
export type TransactionType = 'buyin' | 'cashout' | 'addon';
export type TransactionStatus = 'pending' | 'approved' | 'rejected';

export interface Transaction {
  id: string;
  session_id: string;
  player_id: string;
  username: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  created_at: string;
  approved_at?: string;
  approved_by?: string;
}

// Analytics types
export interface ProfitLossData {
  date: string;
  profit: number;
  cumulative: number;
}

export interface PlayerStats {
  total_sessions: number;
  total_profit: number;
  biggest_win: number;
  biggest_loss: number;
  win_rate: number;
}

// UI types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  created_at: string;
}
