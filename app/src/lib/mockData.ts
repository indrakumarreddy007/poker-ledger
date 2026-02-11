import type { User, GameSession, SessionPlayer, Transaction, ProfitLossData } from '@/types';

// Mock current user
export const mockCurrentUser: User = {
  id: 'user-1',
  email: 'player@poker.com',
  username: 'HighRoller',
  avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=HighRoller',
  created_at: '2024-01-15T10:00:00Z',
};

// Mock users
export const mockUsers: User[] = [
  mockCurrentUser,
  {
    id: 'user-2',
    email: 'mike@poker.com',
    username: 'MikeTheShark',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
    created_at: '2024-02-01T10:00:00Z',
  },
  {
    id: 'user-3',
    email: 'sarah@poker.com',
    username: 'SarahBluffs',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    created_at: '2024-02-10T10:00:00Z',
  },
  {
    id: 'user-4',
    email: 'john@poker.com',
    username: 'JohnAllIn',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    created_at: '2024-03-01T10:00:00Z',
  },
];

// Mock sessions
export const mockSessions: GameSession[] = [
  {
    id: 'session-1',
    name: 'Friday Night Poker',
    created_at: '2024-12-01T19:00:00Z',
    status: 'active',
    current_admin_id: 'user-1',
    join_code: 'POKER123',
    created_by: 'user-1',
  },
  {
    id: 'session-2',
    name: 'Weekend Tournament',
    created_at: '2024-11-25T18:00:00Z',
    status: 'closed',
    current_admin_id: 'user-2',
    join_code: 'TOURNEY456',
    created_by: 'user-2',
  },
];

// Mock session players
export const mockSessionPlayers: SessionPlayer[] = [
  {
    session_id: 'session-1',
    user_id: 'user-1',
    username: 'HighRoller',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=HighRoller',
    cash_out_amount: null,
    total_buyin: 500,
    current_stack: 500,
    is_admin: true,
  },
  {
    session_id: 'session-1',
    user_id: 'user-2',
    username: 'MikeTheShark',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
    cash_out_amount: null,
    total_buyin: 300,
    current_stack: 300,
    is_admin: false,
  },
  {
    session_id: 'session-1',
    user_id: 'user-3',
    username: 'SarahBluffs',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    cash_out_amount: null,
    total_buyin: 200,
    current_stack: 200,
    is_admin: false,
  },
];

// Mock transactions
export const mockTransactions: Transaction[] = [
  {
    id: 'txn-1',
    session_id: 'session-1',
    player_id: 'user-1',
    username: 'HighRoller',
    amount: 200,
    type: 'buyin',
    status: 'approved',
    created_at: '2024-12-01T19:05:00Z',
    approved_at: '2024-12-01T19:05:30Z',
    approved_by: 'user-1',
  },
  {
    id: 'txn-2',
    session_id: 'session-1',
    player_id: 'user-1',
    username: 'HighRoller',
    amount: 300,
    type: 'buyin',
    status: 'approved',
    created_at: '2024-12-01T20:15:00Z',
    approved_at: '2024-12-01T20:15:45Z',
    approved_by: 'user-1',
  },
  {
    id: 'txn-3',
    session_id: 'session-1',
    player_id: 'user-2',
    username: 'MikeTheShark',
    amount: 300,
    type: 'buyin',
    status: 'approved',
    created_at: '2024-12-01T19:10:00Z',
    approved_at: '2024-12-01T19:10:20Z',
    approved_by: 'user-1',
  },
  {
    id: 'txn-4',
    session_id: 'session-1',
    player_id: 'user-3',
    username: 'SarahBluffs',
    amount: 200,
    type: 'buyin',
    status: 'pending',
    created_at: '2024-12-01T19:30:00Z',
  },
];

// Mock profit/loss data for charts
export const mockProfitLossData: ProfitLossData[] = [
  { date: '2024-01', profit: 150, cumulative: 150 },
  { date: '2024-02', profit: -80, cumulative: 70 },
  { date: '2024-03', profit: 320, cumulative: 390 },
  { date: '2024-04', profit: -150, cumulative: 240 },
  { date: '2024-05', profit: 280, cumulative: 520 },
  { date: '2024-06', profit: -100, cumulative: 420 },
  { date: '2024-07', profit: 450, cumulative: 870 },
  { date: '2024-08', profit: 200, cumulative: 1070 },
  { date: '2024-09', profit: -300, cumulative: 770 },
  { date: '2024-10', profit: 180, cumulative: 950 },
  { date: '2024-11', profit: 420, cumulative: 1370 },
  { date: '2024-12', profit: -50, cumulative: 1320 },
];

// Mock session history data
export const mockSessionHistory = [
  { id: 'session-2', name: 'Weekend Tournament', date: '2024-11-25', profit: 420, result: 'win' },
  { id: 'session-3', name: 'Tuesday Cash Game', date: '2024-11-18', profit: -150, result: 'loss' },
  { id: 'session-4', name: 'Friday Night Poker', date: '2024-11-11', profit: 280, result: 'win' },
  { id: 'session-5', name: 'Sunday Tournament', date: '2024-11-04', profit: -80, result: 'loss' },
];
