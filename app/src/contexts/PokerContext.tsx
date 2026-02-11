import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { GameSession, SessionPlayer, Transaction, ProfitLossData } from '@/types';
import { 
  mockSessions, 
  mockSessionPlayers, 
  mockTransactions, 
  mockProfitLossData,
  mockSessionHistory 
} from '@/lib/mockData';
import { useAuth } from './AuthContext';

interface PokerContextType {
  // Sessions
  sessions: GameSession[];
  currentSession: GameSession | null;
  createSession: (name: string) => Promise<GameSession>;
  joinSession: (joinCode: string) => Promise<void>;
  setCurrentSession: (session: GameSession | null) => void;
  closeSession: (sessionId: string) => Promise<void>;
  
  // Players
  sessionPlayers: SessionPlayer[];
  getSessionPlayers: (sessionId: string) => SessionPlayer[];
  
  // Transactions
  transactions: Transaction[];
  requestBuyIn: (sessionId: string, amount: number) => Promise<void>;
  approveTransaction: (transactionId: string) => Promise<void>;
  rejectTransaction: (transactionId: string) => Promise<void>;
  cashOut: (sessionId: string, amount: number) => Promise<void>;
  getPendingTransactions: (sessionId: string) => Transaction[];
  
  // Admin
  transferAdmin: (sessionId: string, newAdminId: string) => Promise<void>;
  isCurrentUserAdmin: (session: GameSession | null) => boolean;
  
  // Analytics
  profitLossData: ProfitLossData[];
  sessionHistory: typeof mockSessionHistory;
  getTotalProfit: () => number;
  getSessionProfit: (sessionId: string) => number;
  
  // Real-time
  isRealtimeConnected: boolean;
}

const PokerContext = createContext<PokerContextType | undefined>(undefined);

export function PokerProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<GameSession[]>(mockSessions);
  const [currentSession, setCurrentSession] = useState<GameSession | null>(null);
  const [sessionPlayers, setSessionPlayers] = useState<SessionPlayer[]>(mockSessionPlayers);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [profitLossData] = useState<ProfitLossData[]>(mockProfitLossData);
  const [sessionHistory] = useState(mockSessionHistory);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(true);

  // Simulate real-time connection
  useEffect(() => {
    const interval = setInterval(() => {
      setIsRealtimeConnected(prev => !prev === false ? true : prev);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const createSession = async (name: string): Promise<GameSession> => {
    if (!user) throw new Error('Must be logged in');
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newSession: GameSession = {
      id: `session-${Date.now()}`,
      name,
      created_at: new Date().toISOString(),
      status: 'active',
      current_admin_id: user.id,
      join_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
      created_by: user.id,
    };
    
    setSessions(prev => [newSession, ...prev]);
    
    // Add creator as first player
    const newPlayer: SessionPlayer = {
      session_id: newSession.id,
      user_id: user.id,
      username: user.username,
      avatar_url: user.avatar_url,
      cash_out_amount: null,
      total_buyin: 0,
      current_stack: 0,
      is_admin: true,
    };
    
    setSessionPlayers(prev => [...prev, newPlayer]);
    return newSession;
  };

  const joinSession = async (joinCode: string): Promise<void> => {
    if (!user) throw new Error('Must be logged in');
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const session = sessions.find(s => s.join_code === joinCode && s.status === 'active');
    if (!session) throw new Error('Session not found or inactive');
    
    // Check if already joined
    const existingPlayer = sessionPlayers.find(
      p => p.session_id === session.id && p.user_id === user.id
    );
    if (existingPlayer) {
      setCurrentSession(session);
      return;
    }
    
    // Add player to session
    const newPlayer: SessionPlayer = {
      session_id: session.id,
      user_id: user.id,
      username: user.username,
      avatar_url: user.avatar_url,
      cash_out_amount: null,
      total_buyin: 0,
      current_stack: 0,
      is_admin: false,
    };
    
    setSessionPlayers(prev => [...prev, newPlayer]);
    setCurrentSession(session);
  };

  const closeSession = async (sessionId: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    setSessions(prev => prev.map(s => 
      s.id === sessionId ? { ...s, status: 'closed' as const } : s
    ));
    if (currentSession?.id === sessionId) {
      setCurrentSession(prev => prev ? { ...prev, status: 'closed' as const } : null);
    }
  };

  const getSessionPlayers = useCallback((sessionId: string) => {
    return sessionPlayers.filter(p => p.session_id === sessionId);
  }, [sessionPlayers]);

  const requestBuyIn = async (sessionId: string, amount: number): Promise<void> => {
    if (!user) throw new Error('Must be logged in');
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const newTransaction: Transaction = {
      id: `txn-${Date.now()}`,
      session_id: sessionId,
      player_id: user.id,
      username: user.username,
      amount,
      type: 'buyin',
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    
    setTransactions(prev => [...prev, newTransaction]);
  };

  const approveTransaction = async (transactionId: string): Promise<void> => {
    if (!user) throw new Error('Must be logged in');
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const transaction = transactions.find(t => t.id === transactionId);
    if (!transaction) throw new Error('Transaction not found');
    
    setTransactions(prev => prev.map(t => 
      t.id === transactionId 
        ? { ...t, status: 'approved' as const, approved_at: new Date().toISOString(), approved_by: user.id }
        : t
    ));
    
    // Update player stack
    setSessionPlayers(prev => prev.map(p => {
      if (p.session_id === transaction.session_id && p.user_id === transaction.player_id) {
        return {
          ...p,
          total_buyin: p.total_buyin + transaction.amount,
          current_stack: p.current_stack + transaction.amount,
        };
      }
      return p;
    }));
  };

  const rejectTransaction = async (transactionId: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    setTransactions(prev => prev.map(t => 
      t.id === transactionId 
        ? { ...t, status: 'rejected' as const }
        : t
    ));
  };

  const cashOut = async (sessionId: string, amount: number): Promise<void> => {
    if (!user) throw new Error('Must be logged in');
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Update player cash out
    setSessionPlayers(prev => prev.map(p => {
      if (p.session_id === sessionId && p.user_id === user.id) {
        return { ...p, cash_out_amount: amount };
      }
      return p;
    }));
    
    // Create cashout transaction
    const newTransaction: Transaction = {
      id: `txn-${Date.now()}`,
      session_id: sessionId,
      player_id: user.id,
      username: user.username,
      amount,
      type: 'cashout',
      status: 'approved',
      created_at: new Date().toISOString(),
      approved_at: new Date().toISOString(),
      approved_by: user.id,
    };
    
    setTransactions(prev => [...prev, newTransaction]);
  };

  const getPendingTransactions = useCallback((sessionId: string) => {
    return transactions.filter(t => 
      t.session_id === sessionId && t.status === 'pending'
    );
  }, [transactions]);

  const transferAdmin = async (sessionId: string, newAdminId: string): Promise<void> => {
    if (!user) throw new Error('Must be logged in');
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    setSessions(prev => prev.map(s => 
      s.id === sessionId ? { ...s, current_admin_id: newAdminId } : s
    ));
    
    if (currentSession?.id === sessionId) {
      setCurrentSession(prev => prev ? { ...prev, current_admin_id: newAdminId } : null);
    }
    
    // Update player admin status
    setSessionPlayers(prev => prev.map(p => {
      if (p.session_id === sessionId) {
        return { ...p, is_admin: p.user_id === newAdminId };
      }
      return p;
    }));
  };

  const isCurrentUserAdmin = useCallback((session: GameSession | null): boolean => {
    if (!session || !user) return false;
    return session.current_admin_id === user.id;
  }, [user]);

  const getTotalProfit = useCallback((): number => {
    if (!user) return 0;
    const userTransactions = transactions.filter(t => t.player_id === user.id);
    const buyins = userTransactions
      .filter(t => t.type === 'buyin' && t.status === 'approved')
      .reduce((sum, t) => sum + t.amount, 0);
    const cashouts = userTransactions
      .filter(t => t.type === 'cashout')
      .reduce((sum, t) => sum + t.amount, 0);
    return cashouts - buyins;
  }, [transactions, user]);

  const getSessionProfit = useCallback((sessionId: string): number => {
    if (!user) return 0;
    const sessionTransactions = transactions.filter(
      t => t.session_id === sessionId && t.player_id === user.id
    );
    const buyins = sessionTransactions
      .filter(t => t.type === 'buyin' && t.status === 'approved')
      .reduce((sum, t) => sum + t.amount, 0);
    const cashouts = sessionTransactions
      .filter(t => t.type === 'cashout')
      .reduce((sum, t) => sum + t.amount, 0);
    return cashouts - buyins;
  }, [transactions, user]);

  return (
    <PokerContext.Provider value={{
      sessions,
      currentSession,
      createSession,
      joinSession,
      setCurrentSession,
      closeSession,
      sessionPlayers,
      getSessionPlayers,
      transactions,
      requestBuyIn,
      approveTransaction,
      rejectTransaction,
      cashOut,
      getPendingTransactions,
      transferAdmin,
      isCurrentUserAdmin,
      profitLossData,
      sessionHistory,
      getTotalProfit,
      getSessionProfit,
      isRealtimeConnected,
    }}>
      {children}
    </PokerContext.Provider>
  );
}

export function usePoker() {
  const context = useContext(PokerContext);
  if (context === undefined) {
    throw new Error('usePoker must be used within a PokerProvider');
  }
  return context;
}
