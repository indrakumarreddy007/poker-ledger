import React, { useState } from 'react';
import { usePoker } from '@/contexts/PokerContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  DollarSign,
  Trophy,
  Target,
  BarChart3
} from 'lucide-react';
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
  Cell
} from 'recharts';

type TimeFilter = 'week' | 'month' | 'year' | 'all';

const Analytics: React.FC = () => {
  const { profitLossData, sessionHistory, getTotalProfit } = usePoker();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('month');

  const totalProfit = getTotalProfit();
  const sessionsPlayed = sessionHistory.length;
  const winningSessions = sessionHistory.filter(s => s.profit > 0).length;
  const winRate = sessionsPlayed > 0 ? Math.round((winningSessions / sessionsPlayed) * 100) : 0;
  
  const biggestWin = sessionHistory.length > 0 
    ? Math.max(...sessionHistory.map(s => s.profit)) 
    : 0;
  const biggestLoss = sessionHistory.length > 0 
    ? Math.min(...sessionHistory.map(s => s.profit)) 
    : 0;

  // Filter data based on time range
  const getFilteredData = () => {
    const now = new Date();
    const filtered = profitLossData.filter(d => {
      const date = new Date(d.date);
      switch (timeFilter) {
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return date >= weekAgo;
        case 'month':
          const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          return date >= monthAgo;
        case 'year':
          const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
          return date >= yearAgo;
        default:
          return true;
      }
    });
    return filtered;
  };

  const filteredData = getFilteredData();

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString()}`;
  };

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-3 shadow-xl">
          <p className="text-gray-400 text-sm mb-1">{label}</p>
          <p className={`text-lg font-bold ${payload[0].value >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {payload[0].value >= 0 ? '+' : ''}{formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Analytics</h1>
          <p className="text-gray-400">Track your poker performance over time</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Profit */}
          <Card className="casino-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Total Profit/Loss</p>
                  <p className={`text-3xl font-bold ${totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {totalProfit >= 0 ? '+' : ''}{formatCurrency(totalProfit)}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  totalProfit >= 0 ? 'bg-emerald-500/20' : 'bg-red-500/20'
                }`}>
                  {totalProfit >= 0 ? (
                    <TrendingUp className="w-6 h-6 text-emerald-400" />
                  ) : (
                    <TrendingDown className="w-6 h-6 text-red-400" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sessions Played */}
          <Card className="casino-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Sessions Played</p>
                  <p className="text-3xl font-bold text-white">{sessionsPlayed}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Win Rate */}
          <Card className="casino-card border-0">
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

          {/* Biggest Win */}
          <Card className="casino-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Biggest Win</p>
                  <p className="text-3xl font-bold text-emerald-400">
                    +{formatCurrency(biggestWin)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Profit/Loss Trend */}
          <Card className="casino-card border-0">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                Profit/Loss Trend
              </CardTitle>
              <div className="flex gap-2">
                {(['week', 'month', 'year', 'all'] as TimeFilter[]).map((filter) => (
                  <Button
                    key={filter}
                    variant={timeFilter === filter ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTimeFilter(filter)}
                    className={`text-xs ${
                      timeFilter === filter 
                        ? 'bg-amber-500 text-black hover:bg-amber-600' 
                        : 'border-[#333] text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={filteredData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#666"
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getMonth() + 1}/${date.getDate()}`;
                      }}
                    />
                    <YAxis 
                      stroke="#666"
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="cumulative" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: '#f59e0b' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Performance */}
          <Card className="casino-card border-0">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-amber-400" />
                Monthly Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={filteredData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#666"
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getMonth() + 1}/${date.getDate()}`;
                      }}
                    />
                    <YAxis 
                      stroke="#666"
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="profit" radius={[4, 4, 0, 0]}>
                      {filteredData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.profit >= 0 ? '#10b981' : '#ef4444'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Session History Table */}
        <Card className="casino-card border-0">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-400" />
              Session History
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#333]">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Session</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Date</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-medium">Result</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-medium">Profit/Loss</th>
                  </tr>
                </thead>
                <tbody>
                  {sessionHistory.map((session) => (
                    <tr key={session.id} className="border-b border-[#222] hover:bg-white/5 transition-colors">
                      <td className="py-4 px-4">
                        <p className="font-medium text-white">{session.name}</p>
                      </td>
                      <td className="py-4 px-4 text-gray-400">
                        {new Date(session.date).toLocaleDateString()}
                      </td>
                      <td className="text-right py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          session.profit > 0 
                            ? 'bg-emerald-500/20 text-emerald-400' 
                            : session.profit < 0
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {session.profit > 0 ? 'Win' : session.profit < 0 ? 'Loss' : 'Break Even'}
                        </span>
                      </td>
                      <td className={`text-right py-4 px-4 font-bold ${
                        session.profit >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {session.profit >= 0 ? '+' : ''}${session.profit.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="casino-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Average Profit</p>
                  <p className="text-2xl font-bold text-white">
                    {sessionsPlayed > 0 
                      ? formatCurrency(sessionHistory.reduce((sum, s) => sum + s.profit, 0) / sessionsPlayed)
                      : '$0'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="casino-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Biggest Loss</p>
                  <p className="text-2xl font-bold text-red-400">
                    {formatCurrency(biggestLoss)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="casino-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Winning Sessions</p>
                  <p className="text-2xl font-bold text-white">
                    {winningSessions} / {sessionsPlayed}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
