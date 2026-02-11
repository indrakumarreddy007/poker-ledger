import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from '@/lib/router';
import { usePoker } from '@/contexts/PokerContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Crown, 
  DollarSign, 
  Users, 
  ArrowLeft, 
  Check, 
  X, 
  RotateCcw,
  LogOut,
  AlertCircle
} from 'lucide-react';

const GameSession: React.FC = () => {
  const { params } = useRouter();
  const { sessionId } = params;
  const { navigate } = useRouter();
  const { user } = useAuth();
  const { 
    sessions, 
    getSessionPlayers,
    requestBuyIn,
    approveTransaction,
    rejectTransaction,
    cashOut,
    transferAdmin,
    isCurrentUserAdmin,
    getPendingTransactions,
    closeSession,
    setCurrentSession
  } = usePoker();

  const [buyInAmount, setBuyInAmount] = useState('');
  const [cashOutAmount, setCashOutAmount] = useState('');
  const [isBuyInDialogOpen, setIsBuyInDialogOpen] = useState(false);
  const [isCashOutDialogOpen, setIsCashOutDialogOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const session = sessions.find(s => s.id === sessionId);
  const players = sessionId ? getSessionPlayers(sessionId) : [];
  const pendingTransactions = sessionId ? getPendingTransactions(sessionId) : [];
  const isAdmin = isCurrentUserAdmin(session || null);

  useEffect(() => {
    if (session) {
      setCurrentSession(session);
    }
  }, [session, setCurrentSession]);

  // Redirect if session not found
  useEffect(() => {
    if (!session && sessions.length > 0) {
      navigate('/sessions');
    }
  }, [session, sessions, navigate]);

  if (!session || !user) return null;

  const handleBuyIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyInAmount || isNaN(Number(buyInAmount))) return;
    
    setIsLoading(true);
    try {
      await requestBuyIn(session.id, Number(buyInAmount));
      setIsBuyInDialogOpen(false);
      setBuyInAmount('');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error('Failed to request buy-in:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (transactionId: string) => {
    try {
      await approveTransaction(transactionId);
    } catch (error) {
      console.error('Failed to approve transaction:', error);
    }
  };

  const handleReject = async (transactionId: string) => {
    try {
      await rejectTransaction(transactionId);
    } catch (error) {
      console.error('Failed to reject transaction:', error);
    }
  };

  const handleCashOut = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cashOutAmount || isNaN(Number(cashOutAmount))) return;
    
    setIsLoading(true);
    try {
      await cashOut(session.id, Number(cashOutAmount));
      setIsCashOutDialogOpen(false);
      setCashOutAmount('');
    } catch (error) {
      console.error('Failed to cash out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransferAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayerId) return;
    
    setIsLoading(true);
    try {
      await transferAdmin(session.id, selectedPlayerId);
      setIsTransferDialogOpen(false);
      setSelectedPlayerId('');
    } catch (error) {
      console.error('Failed to transfer admin:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSession = async () => {
    if (window.confirm('Are you sure you want to close this session?')) {
      try {
        await closeSession(session.id);
        navigate('/sessions');
      } catch (error) {
        console.error('Failed to close session:', error);
      }
    }
  };

  const currentPlayer = players.find(p => p.user_id === user.id);
  const otherPlayers = players.filter(p => p.user_id !== user.id && p.user_id !== session.current_admin_id);

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/sessions')}
              className="border-[#333] text-white hover:bg-white/5"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
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
          
          <div className="flex gap-3">
            {isAdmin && (
              <>
                <Button
                  onClick={() => setIsTransferDialogOpen(true)}
                  variant="outline"
                  className="border-[#333] text-white hover:bg-white/5"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Pass Dealer
                </Button>
                <Button
                  onClick={handleCloseSession}
                  variant="outline"
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Close Session
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Success Notification */}
        {showSuccess && (
          <div className="mb-6 p-4 rounded-lg bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 animate-slide-in">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span>Buy-in request submitted! Waiting for admin approval.</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Game Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Players Table */}
            <Card className="casino-card border-0">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-400" />
                  Players ({players.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#333]">
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Player</th>
                        <th className="text-right py-3 px-4 text-gray-400 font-medium">Buy-in</th>
                        <th className="text-right py-3 px-4 text-gray-400 font-medium">Current Stack</th>
                        <th className="text-right py-3 px-4 text-gray-400 font-medium">P/L</th>
                      </tr>
                    </thead>
                    <tbody>
                      {players.map((player) => {
                        const pl = player.cash_out_amount !== null 
                          ? player.cash_out_amount - player.total_buyin 
                          : player.current_stack - player.total_buyin;
                        return (
                          <tr key={player.user_id} className="border-b border-[#222] hover:bg-white/5 transition-colors">
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center overflow-hidden">
                                  {player.avatar_url ? (
                                    <img src={player.avatar_url} alt={player.username} className="w-full h-full object-cover" />
                                  ) : (
                                    <span className="text-white font-bold">{player.username[0]}</span>
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium text-white flex items-center gap-2">
                                    {player.username}
                                    {player.user_id === session.current_admin_id && (
                                      <Crown className="w-4 h-4 text-amber-400" />
                                    )}
                                  </p>
                                  {player.cash_out_amount !== null && (
                                    <span className="text-xs text-gray-500">Cashed out</span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="text-right py-4 px-4 text-white">
                              ${player.total_buyin.toLocaleString()}
                            </td>
                            <td className="text-right py-4 px-4 text-white">
                              ${player.cash_out_amount !== null 
                                ? player.cash_out_amount.toLocaleString() 
                                : player.current_stack.toLocaleString()}
                            </td>
                            <td className={`text-right py-4 px-4 font-bold ${pl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {pl >= 0 ? '+' : ''}${pl.toLocaleString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Pending Approvals (Admin Only) */}
            {isAdmin && pendingTransactions.length > 0 && (
              <Card className="casino-card border-0 border-l-4 border-l-amber-500">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-400" />
                    Pending Approvals ({pendingTransactions.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <div className="space-y-3">
                    {pendingTransactions.map((transaction) => (
                      <div 
                        key={transaction.id} 
                        className="flex items-center justify-between p-4 rounded-lg bg-[#0a0a0a] border border-[#333]"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-amber-400" />
                          </div>
                          <div>
                            <p className="font-medium text-white">{transaction.username}</p>
                            <p className="text-sm text-gray-500">
                              Requested ${transaction.amount} buy-in
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleReject(transaction.id)}
                            variant="outline"
                            className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleApprove(transaction.id)}
                            className="btn-green"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar Actions */}
          <div className="space-y-6">
            {/* My Status */}
            {currentPlayer && (
              <Card className="casino-card border-0">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-white">My Status</CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-[#0a0a0a]">
                      <p className="text-sm text-gray-400 mb-1">Total Buy-in</p>
                      <p className="text-2xl font-bold text-white">
                        ${currentPlayer.total_buyin.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-[#0a0a0a]">
                      <p className="text-sm text-gray-400 mb-1">Current Stack</p>
                      <p className="text-2xl font-bold text-white">
                        ${currentPlayer.current_stack.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-[#0a0a0a]">
                    <p className="text-sm text-gray-400 mb-1">Profit/Loss</p>
                    <p className={`text-2xl font-bold ${
                      (currentPlayer.current_stack - currentPlayer.total_buyin) >= 0 
                        ? 'text-emerald-400' 
                        : 'text-red-400'
                    }`}>
                      {(currentPlayer.current_stack - currentPlayer.total_buyin) >= 0 ? '+' : ''}
                      ${(currentPlayer.current_stack - currentPlayer.total_buyin).toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <Card className="casino-card border-0">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white">Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-3">
                <Button
                  onClick={() => setIsBuyInDialogOpen(true)}
                  className="w-full btn-gold"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Request Buy-in
                </Button>
                
                <Button
                  onClick={() => setIsCashOutDialogOpen(true)}
                  variant="outline"
                  className="w-full border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Cash Out
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Buy-in Dialog */}
        <Dialog open={isBuyInDialogOpen} onOpenChange={setIsBuyInDialogOpen}>
          <DialogContent className="casino-card border-0 text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-amber-400" />
                Request Buy-in
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Enter the amount you want to buy in for
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleBuyIn} className="space-y-6 mt-4">
              <div className="space-y-2">
                <Label htmlFor="buyInAmount" className="text-gray-300">Amount ($)</Label>
                <Input
                  id="buyInAmount"
                  type="number"
                  placeholder="100"
                  value={buyInAmount}
                  onChange={(e) => setBuyInAmount(e.target.value)}
                  className="bg-[#0a0a0a] border-[#333] text-white placeholder:text-gray-600 focus:border-amber-500 focus:ring-amber-500/20 text-2xl font-bold"
                  required
                  min="1"
                  autoFocus
                />
              </div>
              
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsBuyInDialogOpen(false)}
                  className="flex-1 border-[#333] text-white hover:bg-white/5"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !buyInAmount}
                  className="flex-1 btn-gold disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : (
                    'Request'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Cash Out Dialog */}
        <Dialog open={isCashOutDialogOpen} onOpenChange={setIsCashOutDialogOpen}>
          <DialogContent className="casino-card border-0 text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                <LogOut className="w-6 h-6 text-emerald-400" />
                Cash Out
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Enter your final stack amount
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleCashOut} className="space-y-6 mt-4">
              <div className="space-y-2">
                <Label htmlFor="cashOutAmount" className="text-gray-300">Final Stack ($)</Label>
                <Input
                  id="cashOutAmount"
                  type="number"
                  placeholder="500"
                  value={cashOutAmount}
                  onChange={(e) => setCashOutAmount(e.target.value)}
                  className="bg-[#0a0a0a] border-[#333] text-white placeholder:text-gray-600 focus:border-emerald-500 focus:ring-emerald-500/20 text-2xl font-bold"
                  required
                  min="0"
                  autoFocus
                />
              </div>
              
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCashOutDialogOpen(false)}
                  className="flex-1 border-[#333] text-white hover:bg-white/5"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !cashOutAmount}
                  className="flex-1 btn-green disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Cash Out'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Transfer Admin Dialog */}
        <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
          <DialogContent className="casino-card border-0 text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                <RotateCcw className="w-6 h-6 text-amber-400" />
                Pass the Dealer Button
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Select a player to transfer admin rights to
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleTransferAdmin} className="space-y-6 mt-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Select New Admin</Label>
                <div className="space-y-2">
                  {otherPlayers.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No other players in session</p>
                  ) : (
                    otherPlayers.map((player) => (
                      <label
                        key={player.user_id}
                        className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                          selectedPlayerId === player.user_id
                            ? 'border-amber-500 bg-amber-500/10'
                            : 'border-[#333] hover:border-[#444]'
                        }`}
                      >
                        <input
                          type="radio"
                          name="newAdmin"
                          value={player.user_id}
                          checked={selectedPlayerId === player.user_id}
                          onChange={(e) => setSelectedPlayerId(e.target.value)}
                          className="hidden"
                        />
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center overflow-hidden">
                          {player.avatar_url ? (
                            <img src={player.avatar_url} alt={player.username} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-white font-bold">{player.username[0]}</span>
                          )}
                        </div>
                        <span className="font-medium text-white">{player.username}</span>
                        {selectedPlayerId === player.user_id && (
                          <Check className="w-5 h-5 text-amber-400 ml-auto" />
                        )}
                      </label>
                    ))
                  )}
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsTransferDialogOpen(false)}
                  className="flex-1 border-[#333] text-white hover:bg-white/5"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !selectedPlayerId || otherPlayers.length === 0}
                  className="flex-1 btn-gold disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : (
                    'Transfer Admin'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default GameSession;
