export interface User {
  id: string;
  email: string;
  username: string;
  avatar_url?: string;
  created_at?: string;
}

export interface GameSession {
  id: string;
  name: string;
  status: 'active' | 'closed';
  current_admin_id: string;
  admin_username?: string;
  join_code: string;
  created_by: string;
  created_at: string;
  closed_at?: string;
  player_count?: number;
}

export interface SessionPlayer {
  session_id: string;
  user_id: string;
  username: string;
  avatar_url?: string;
  total_buyin: number;
  current_stack: number;
  cash_out_amount?: number | null;
  is_admin?: boolean;
}

export interface Transaction {
  id: string;
  session_id: string;
  player_id: string;
  username?: string;
  amount: number;
  type: 'buyin' | 'cashout' | 'addon';
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  approved_at?: string;
  approved_by?: string;
}

export interface AnalyticsData {
  totalProfit: number;
  totalSessions: number;
  winningSessions: number;
  biggestWin: number;
  biggestLoss: number;
  monthlyData: { month: string; profit: number }[];
}
