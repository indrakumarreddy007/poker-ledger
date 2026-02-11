import React, { useEffect, useState } from 'react';
import { useRouter } from '@/lib/router';
import { useAuth } from '@/contexts/AuthContext';
import { usePoker } from '@/contexts/PokerContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar, 
  DollarSign,
  ArrowRight,
  Plus,
  Trophy,
  Target
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { navigate } = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { sessions, getTotalProfit, sessionHistory } = usePoker();
  const [animatedProfit, setAnimatedProfit] = useState(0);
  
  const totalProfit = getTotalProfit();
  const activeSessions = sessions.filter(s => s.status === 'active');
  const totalSessions = sessions.length;
  
  // Calculate win rate
  const sessionsPlayed = sessionHistory.length;
  const winningSessions = sessionHistory.filter(s => s.profit > 0).length;
  const winRate = sessionsPlayed > 0 ? Math.round((winningSessions / sessionsPlayed) * 100) : 0;

  // Animate profit number
  useEffect(() => {
    const duration = 1000;
    const steps = 30;
    const increment = totalProfit / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if ((increment > 0 && current >= totalProfit) || 
          (increment < 0 && current <= totalProfit)) {
        setAnimatedProfit(totalProfit);
        clearInterval(timer);
      } else {
        setAnimatedProfit(Math.round(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [totalProfit]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !user) {
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-slide-in">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, <span className="text-amber-400">{user.username}</span>
          </h1>
          <p className="text-gray-400">Here's your poker performance overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Profit/Loss */}
          <Card className="casino-card border-0 animate-slide-in stagger-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Total Profit/Loss</p>
                  <p className={`text-3xl font-bold ${animatedProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {animatedProfit >= 0 ? '+' : ''}${animatedProfit.toLocaleString()}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  animatedProfit >= 0 ? 'bg-emerald-500/20' : 'bg-red-500/20'
                }`}>
                  {animatedProfit >= 0 ? (
                    <TrendingUp className="w-6 h-6 text-emerald-400" />
                  ) : (
                    <TrendingDown className="w-6 h-6 text-red-400" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Sessions */}
          <Card className="casino-card border-0 animate-slide-in stagger-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Active Sessions</p>
                  <p className="text-3xl font-bold text-white">{activeSessions.length}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Sessions */}
          <Card className="casino-card border-0 animate-slide-in stagger-3">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Total Sessions</p>
                  <p className="text-3xl font-bold text-white">{totalSessions}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Win Rate */}
          <Card className="casino-card border-0 animate-slide-in stagger-4">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Win Rate</p>
                  <p className="text-3xl font-bold text-white">{winRate}%</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Target className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <Card className="casino-card border-0 animate-slide-in stagger-5">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-amber-400" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button
                    onClick={() => navigate('/sessions')}
                    className="btn-gold h-auto py-6 flex flex-col items-center gap-3"
                  >
                    <Users className="w-8 h-8" />
                    <div className="text-center">
                      <p className="font-bold text-lg">Join Session</p>
                      <p className="text-sm text-black/70">Enter a game with code</p>
                    </div>
                  </Button>
                  
                  <Button
                    onClick={() => navigate('/sessions')}
                    className="btn-green h-auto py-6 flex flex-col items-center gap-3"
                  >
                    <DollarSign className="w-8 h-8" />
                    <div className="text-center">
                      <p className="font-bold text-lg">Create Session</p>
                      <p className="text-sm text-white/70">Start a new game</p>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Sessions */}
            <Card className="casino-card border-0 mt-6 animate-slide-in stagger-5">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-400" />
                  Recent Sessions
                </CardTitle>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/sessions')}
                  className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
                >
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                {sessions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No sessions yet. Create or join one!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sessions.slice(0, 3).map((session) => (
                      <div
                        key={session.id}
                        onClick={() => navigate(`/session/${session.id}`)}
                        className="flex items-center justify-between p-4 rounded-lg bg-[#0a0a0a] border border-[#333] hover:border-amber-500/50 cursor-pointer transition-all duration-300"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${
                            session.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-gray-500'
                          }`} />
                          <div>
                            <p className="font-medium text-white">{session.name}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(session.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            session.status === 'active' 
                              ? 'bg-emerald-500/20 text-emerald-400' 
                              : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {session.status === 'active' ? 'Active' : 'Closed'}
                          </span>
                          <ArrowRight className="w-5 h-5 text-gray-500" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Session History */}
            <Card className="casino-card border-0 animate-slide-in stagger-5">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  Session History
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="space-y-3">
                  {sessionHistory.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-[#0a0a0a] border border-[#333]"
                    >
                      <div>
                        <p className="font-medium text-white text-sm">{session.name}</p>
                        <p className="text-xs text-gray-500">{session.date}</p>
                      </div>
                      <span className={`font-bold ${
                        session.profit >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {session.profit >= 0 ? '+' : ''}${session.profit}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card className="casino-card border-0 bg-gradient-to-br from-amber-500/10 to-yellow-500/5 animate-slide-in stagger-5">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <Trophy className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="font-bold text-white mb-1">Pro Tip</p>
                    <p className="text-sm text-gray-400">
                      Track your buy-ins and cash outs carefully. The key to profitable poker is knowing your numbers.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
