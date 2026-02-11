import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { sessionsApi, transactionsApi } from '../api';
import type { GameSession, AnalyticsData } from '../types';
import { TrendingUp, TrendingDown, Users, Calendar, DollarSign, Plus, Trophy, Target } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sessionsRes, analyticsRes] = await Promise.all([
          sessionsApi.getAll(),
          transactionsApi.getAnalytics(),
        ]);
        setSessions(sessionsRes.sessions);
        setAnalytics(analyticsRes);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const activeSessions = sessions.filter((s) => s.status === 'active');
  const winRate = analytics?.totalSessions
    ? Math.round((analytics.winningSessions / analytics.totalSessions) * 100)
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, <span className="text-amber-400">{user?.username}</span>
          </h1>
          <p className="text-gray-400">Here's your poker performance overview</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="casino-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Profit/Loss</p>
                <p
                  className={`text-3xl font-bold ${
                    (analytics?.totalProfit || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {(analytics?.totalProfit || 0) >= 0 ? '+' : ''}${analytics?.totalProfit || 0}
                </p>
              </div>
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  (analytics?.totalProfit || 0) >= 0 ? 'bg-emerald-500/20' : 'bg-red-500/20'
                }`}
              >
                {(analytics?.totalProfit || 0) >= 0 ? (
                  <TrendingUp className="w-6 h-6 text-emerald-400" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-red-400" />
                )}
              </div>
            </div>
          </div>

          <div className="casino-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Active Sessions</p>
                <p className="text-3xl font-bold text-white">{activeSessions.length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-amber-400" />
              </div>
            </div>
          </div>

          <div className="casino-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Sessions</p>
                <p className="text-3xl font-bold text-white">{sessions.length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="casino-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Win Rate</p>
                <p className="text-3xl font-bold text-white">{winRate}%</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="casino-card p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-400" />
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link to="/sessions" className="btn-gold h-auto py-6 flex flex-col items-center gap-3 text-center">
                  <Users className="w-8 h-8" />
                  <div>
                    <p className="font-bold text-lg">Join Session</p>
                    <p className="text-sm text-black/70">Enter a game with code</p>
                  </div>
                </Link>
                <Link to="/sessions" className="btn-green h-auto py-6 flex flex-col items-center gap-3 text-center">
                  <DollarSign className="w-8 h-8" />
                  <div>
                    <p className="font-bold text-lg">Create Session</p>
                    <p className="text-sm text-white/70">Start a new game</p>
                  </div>
                </Link>
              </div>
            </div>

            <div className="casino-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-400" />
                  Recent Sessions
                </h2>
                <Link to="/sessions" className="text-amber-400 hover:text-amber-300 text-sm">
                  View All →
                </Link>
              </div>
              <div className="space-y-3">
                {sessions.slice(0, 3).map((session) => (
                  <Link
                    key={session.id}
                    to={`/session/${session.id}`}
                    className="flex items-center justify-between p-4 rounded-lg bg-[#0a0a0a] border border-[#333] hover:border-amber-500/50 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          session.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-gray-500'
                        }`}
                      />
                      <div>
                        <p className="font-medium text-white">{session.name}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(session.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        session.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {session.status === 'active' ? 'Active' : 'Closed'}
                    </span>
                  </Link>
                ))}
                {sessions.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No sessions yet. Create or join one!</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="casino-card p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                Stats
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Biggest Win</span>
                  <span className="text-emerald-400 font-bold">+${analytics?.biggestWin || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Biggest Loss</span>
                  <span className="text-red-400 font-bold">${analytics?.biggestLoss || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Winning Sessions</span>
                  <span className="text-white font-bold">
                    {analytics?.winningSessions || 0} / {analytics?.totalSessions || 0}
                  </span>
                </div>
              </div>
            </div>

            <div className="casino-card p-6 bg-gradient-to-br from-amber-500/10 to-yellow-500/5">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
