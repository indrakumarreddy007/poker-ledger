import { useEffect, useState } from 'react';
import { transactionsApi } from '../api';
import type { AnalyticsData } from '../types';
import { TrendingUp, TrendingDown, Calendar, Trophy, Target, BarChart3 } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';

export default function Analytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await transactionsApi.getAnalytics();
        setAnalytics(data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const winRate = analytics?.totalSessions
    ? Math.round((analytics.winningSessions / analytics.totalSessions) * 100)
    : 0;

  const [timeframe, setTimeframe] = useState<'monthly' | 'weekly' | 'yearly'>('monthly');

  const getChartData = () => {
    if (!analytics) return [];

    switch (timeframe) {
      case 'weekly':
        return analytics.weeklyData.map(d => ({ name: d.week, profit: d.profit })).reverse();
      case 'yearly':
        return analytics.yearlyData.map(d => ({ name: d.year, profit: d.profit })).reverse();
      case 'monthly':
      default:
        return analytics.monthlyData.map(d => ({ name: d.month, profit: d.profit })).reverse();
    }
  };

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
          <h1 className="text-4xl font-bold text-white mb-2">Analytics</h1>
          <p className="text-gray-400">Track your poker performance over time</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="casino-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Profit/Loss</p>
                <p
                  className={`text-3xl font-bold ${(analytics?.totalProfit || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}
                >
                  {(analytics?.totalProfit || 0) >= 0 ? '+' : ''}${analytics?.totalProfit || 0}
                </p>
              </div>
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${(analytics?.totalProfit || 0) >= 0 ? 'bg-emerald-500/20' : 'bg-red-500/20'
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
                <p className="text-gray-400 text-sm mb-1">Sessions Played</p>
                <p className="text-3xl font-bold text-white">{analytics?.totalSessions || 0}</p>
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

          <div className="casino-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Biggest Win</p>
                <p className="text-3xl font-bold text-emerald-400">+${analytics?.biggestWin || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-amber-400" />
              </div>
            </div>
          </div>
        </div>

        {analytics && (
          <div className="mb-8">
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setTimeframe('monthly')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${timeframe === 'monthly'
                  ? 'bg-amber-500 text-black'
                  : 'bg-[#0a0a0a] text-gray-400 border border-[#333] hover:border-amber-500/50'
                  }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setTimeframe('weekly')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${timeframe === 'weekly'
                  ? 'bg-amber-500 text-black'
                  : 'bg-[#0a0a0a] text-gray-400 border border-[#333] hover:border-amber-500/50'
                  }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setTimeframe('yearly')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${timeframe === 'yearly'
                  ? 'bg-amber-500 text-black'
                  : 'bg-[#0a0a0a] text-gray-400 border border-[#333] hover:border-amber-500/50'
                  }`}
              >
                Yearly
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="casino-card p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)} Profit/Loss
                </h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getChartData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis
                        dataKey="name"
                        stroke="#666"
                        tickFormatter={(value) => value.toString().slice(-2)}
                      />
                      <YAxis stroke="#666" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1a1a1a',
                          border: '1px solid #333',
                          borderRadius: '8px',
                        }}
                        labelStyle={{ color: '#9ca3af' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="profit"
                        stroke="#10b981"
                        strokeWidth={3}
                        dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: '#f59e0b' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="casino-card p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-amber-400" />
                  {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)} Performance
                </h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getChartData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis
                        dataKey="name"
                        stroke="#666"
                        tickFormatter={(value) => value.toString().slice(-2)}
                      />
                      <YAxis stroke="#666" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1a1a1a',
                          border: '1px solid #333',
                          borderRadius: '8px',
                        }}
                        labelStyle={{ color: '#9ca3af' }}
                      />
                      <Bar dataKey="profit" radius={[4, 4, 0, 0]}>
                        {getChartData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.profit >= 0 ? '#10b981' : '#ef4444'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="casino-card p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Average Profit</p>
                <p className="text-2xl font-bold text-white">
                  {analytics?.totalSessions
                    ? Math.round(analytics.totalProfit / analytics.totalSessions)
                    : 0}
                </p>
              </div>
            </div>
          </div>

          <div className="casino-card p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Biggest Loss</p>
                <p className="text-2xl font-bold text-red-400">${analytics?.biggestLoss || 0}</p>
              </div>
            </div>
          </div>

          <div className="casino-card p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Winning Sessions</p>
                <p className="text-2xl font-bold text-white">
                  {analytics?.winningSessions || 0} / {analytics?.totalSessions || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
