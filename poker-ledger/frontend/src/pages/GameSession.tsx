import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { sessionsApi, transactionsApi } from '../api';
import type { GameSession, SessionPlayer, Transaction } from '../types';
import { Crown, DollarSign, Users, ArrowLeft, Check, X, RotateCcw, LogOut, AlertCircle } from 'lucide-react';

export default function GameSession() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [session, setSession] = useState<GameSession | null>(null);
  const [players, setPlayers] = useState<SessionPlayer[]>([]);
  const [pendingTransactions, setPendingTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showBuyIn, setShowBuyIn] = useState(false);
  const [showCashOut, setShowCashOut] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [amount, setAmount] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const isAdmin = session?.current_admin_id === user?.id;
  const currentPlayer = players.find((p) => p.user_id === user?.id);

  useEffect(() => {
    if (id) {
      fetchSessionData();
    }
  }, [id]);

  const fetchSessionData = async () => {
    try {
      const [sessionRes, pendingRes] = await Promise.all([
        sessionsApi.getById(id!),
        isAdmin ? transactionsApi.getPending(id!) : Promise.resolve({ transactions: [] }),
      ]);
      setSession(sessionRes.session);
      setPlayers(sessionRes.players);
      setPendingTransactions(pendingRes.transactions);
    } catch (error) {
      console.error('Failed to fetch session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await transactionsApi.requestBuyIn(id!, Number(amount));
      setShowBuyIn(false);
      setAmount('');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to request buy-in');
    }
  };

  const handleApprove = async (transactionId: string) => {
    try {
      await transactionsApi.approve(transactionId);
      fetchSessionData();
    } catch (err: any) {
      setError(err.message || 'Failed to approve transaction');
    }
  };

  const handleReject = async (transactionId: string) => {
    try {
      await transactionsApi.reject(transactionId);
      fetchSessionData();
    } catch (err: any) {
      setError(err.message || 'Failed to reject transaction');
    }
  };

  const handleCashOut = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await transactionsApi.cashOut(id!, Number(amount));
      setShowCashOut(false);
      setAmount('');
      fetchSessionData();
    } catch (err: any) {
      setError(err.message || 'Failed to cash out');
    }
  };

  const handleTransfer = async (newAdminId: string) => {
    setError('');
    try {
      await sessionsApi.transferAdmin(id!, newAdminId);
      setShowTransfer(false);
      fetchSessionData();
    } catch (err: any) {
      setError(err.message || 'Failed to transfer admin');
    }
  };

  const handleClose = async () => {
    if (confirm('Are you sure you want to close this session?')) {
      try {
        await sessionsApi.close(id!);
        navigate('/sessions');
      } catch (err: any) {
        setError(err.message || 'Failed to close session');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Session not found</p>
          <Link to="/sessions" className="btn-gold">
            Back to Sessions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link
              to="/sessions"
              className="p-2 border border-[#333] text-white rounded-lg hover:bg-white/5"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-white">{session.name}</h1>
                {isAdmin && (
                  <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-sm">
                    <Crown className="w-4 h-4" />
                    Admin
                  </span>
                )}
              </div>
              <p className="text-gray-400 flex items-center gap-2">
                Join Code: <code className="text-amber-400 font-mono">{session.join_code}</code>
              </p>
            </div>
          </div>

          {isAdmin && (
            <div className="flex gap-3">
              <button
                onClick={() => setShowTransfer(true)}
                className="px-4 py-2 border border-[#333] text-white rounded-lg hover:bg-white/5"
              >
                <RotateCcw className="w-4 h-4 inline mr-2" />
                Pass Dealer
              </button>
              <button
                onClick={handleClose}
                className="px-4 py-2 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/10"
              >
                <LogOut className="w-4 h-4 inline mr-2" />
                Close Session
              </button>
            </div>
          )}
        </div>

        {showSuccess && (
          <div className="mb-6 p-4 rounded-lg bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 animate-pulse">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span>Buy-in request submitted! Waiting for admin approval.</span>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="casino-card p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                Players ({players.length})
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#333]">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Player</th>
                      <th className="text-right py-3 px-4 text-gray-400 font-medium">Buy-in</th>
                      <th className="text-right py-3 px-4 text-gray-400 font-medium">Stack</th>
                      <th className="text-right py-3 px-4 text-gray-400 font-medium">P/L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {players.map((player) => {
                      const pl =
                        (player.cash_out_amount !== null
                          ? player.cash_out_amount
                          : player.current_stack) - player.total_buyin;
                      return (
                        <tr key={player.user_id} className="border-b border-[#222]">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                                <span className="text-white font-bold">{player.username[0]}</span>
                              </div>
                              <p className="font-medium text-white flex items-center gap-2">
                                {player.username}
                                {player.user_id === session.current_admin_id && (
                                  <Crown className="w-4 h-4 text-amber-400" />
                                )}
                              </p>
                            </div>
                          </td>
                          <td className="text-right py-4 px-4 text-white">${player.total_buyin}</td>
                          <td className="text-right py-4 px-4 text-white">
                            ${player.cash_out_amount !== null ? player.cash_out_amount : player.current_stack}
                          </td>
                          <td
                            className={`text-right py-4 px-4 font-bold ${
                              pl >= 0 ? 'text-emerald-400' : 'text-red-400'
                            }`}
                          >
                            {pl >= 0 ? '+' : ''}${pl}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {isAdmin && pendingTransactions.length > 0 && (
              <div className="casino-card p-6 border-l-4 border-l-amber-500">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-400" />
                  Pending Approvals ({pendingTransactions.length})
                </h2>
                <div className="space-y-3">
                  {pendingTransactions.map((txn) => (
                    <div
                      key={txn.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-[#0a0a0a] border border-[#333]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{txn.username}</p>
                          <p className="text-sm text-gray-500">Requested ${txn.amount} buy-in</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReject(txn.id)}
                          className="p-2 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/10"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleApprove(txn.id)} className="btn-green p-2">
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {currentPlayer && (
              <div className="casino-card p-6">
                <h2 className="text-xl font-bold text-white mb-4">My Status</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-[#0a0a0a]">
                      <p className="text-sm text-gray-400 mb-1">Total Buy-in</p>
                      <p className="text-2xl font-bold text-white">${currentPlayer.total_buyin}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-[#0a0a0a]">
                      <p className="text-sm text-gray-400 mb-1">Current Stack</p>
                      <p className="text-2xl font-bold text-white">${currentPlayer.current_stack}</p>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-[#0a0a0a]">
                    <p className="text-sm text-gray-400 mb-1">Profit/Loss</p>
                    <p
                      className={`text-2xl font-bold ${
                        currentPlayer.current_stack - currentPlayer.total_buyin >= 0
                          ? 'text-emerald-400'
                          : 'text-red-400'
                      }`}
                    >
                      {currentPlayer.current_stack - currentPlayer.total_buyin >= 0 ? '+' : ''}
                      ${currentPlayer.current_stack - currentPlayer.total_buyin}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="casino-card p-6">
              <h2 className="text-xl font-bold text-white mb-4">Actions</h2>
              <div className="space-y-3">
                <button onClick={() => setShowBuyIn(true)} className="w-full btn-gold">
                  <DollarSign className="w-4 h-4 inline mr-2" />
                  Request Buy-in
                </button>
                <button
                  onClick={() => setShowCashOut(true)}
                  className="w-full px-4 py-3 border border-emerald-500/50 text-emerald-400 rounded-lg hover:bg-emerald-500/10"
                >
                  <LogOut className="w-4 h-4 inline mr-2" />
                  Cash Out
                </button>
              </div>
            </div>
          </div>
        </div>

        {showBuyIn && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowBuyIn(false)}
          >
            <div className="casino-card p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-2xl font-bold text-white mb-4">Request Buy-in</h2>
              {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
              <form onSubmit={handleBuyIn}>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="100"
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#333] rounded-lg text-white placeholder:text-gray-600 focus:border-amber-500 focus:outline-none mb-4 text-2xl font-bold"
                  autoFocus
                  required
                  min="1"
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowBuyIn(false)}
                    className="flex-1 px-4 py-2 border border-[#333] text-white rounded-lg hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 btn-gold">
                    Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showCashOut && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowCashOut(false)}
          >
            <div className="casino-card p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-2xl font-bold text-white mb-4">Cash Out</h2>
              {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
              <form onSubmit={handleCashOut}>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="500"
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#333] rounded-lg text-white placeholder:text-gray-600 focus:border-emerald-500 focus:outline-none mb-4 text-2xl font-bold"
                  autoFocus
                  required
                  min="0"
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCashOut(false)}
                    className="flex-1 px-4 py-2 border border-[#333] text-white rounded-lg hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 btn-green">
                    Cash Out
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showTransfer && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowTransfer(false)}
          >
            <div className="casino-card p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-2xl font-bold text-white mb-4">Pass the Dealer Button</h2>
              <p className="text-gray-400 mb-4">Select a player to transfer admin rights to</p>
              <div className="space-y-2 mb-4">
                {players
                  .filter((p) => p.user_id !== user?.id)
                  .map((player) => (
                    <button
                      key={player.user_id}
                      onClick={() => handleTransfer(player.user_id)}
                      className="w-full flex items-center gap-3 p-4 rounded-lg border border-[#333] hover:border-amber-500/50 transition-all"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                        <span className="text-white font-bold">{player.username[0]}</span>
                      </div>
                      <span className="font-medium text-white">{player.username}</span>
                    </button>
                  ))}
              </div>
              <button
                onClick={() => setShowTransfer(false)}
                className="w-full px-4 py-2 border border-[#333] text-white rounded-lg hover:bg-white/5"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
