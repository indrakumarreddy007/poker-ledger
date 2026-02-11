import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { sessionsApi } from '../api';
import type { GameSession } from '../types';
import { Plus, Users, Copy, Check, LogIn, X, Crown } from 'lucide-react';

export default function Sessions() {
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [sessionName, setSessionName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const { sessions } = await sessionsApi.getAll();
      setSessions(sessions);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await sessionsApi.create(sessionName);
      setShowCreate(false);
      setSessionName('');
      fetchSessions();
    } catch (err: any) {
      setError(err.message || 'Failed to create session');
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await sessionsApi.join(joinCode);
      setShowJoin(false);
      setJoinCode('');
      fetchSessions();
    } catch (err: any) {
      setError(err.message || 'Failed to join session');
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const activeSessions = sessions.filter((s) => s.status === 'active');
  const closedSessions = sessions.filter((s) => s.status === 'closed');

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Game Sessions</h1>
            <p className="text-gray-400">Create or join poker sessions</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowJoin(true)}
              className="px-4 py-2 border border-[#333] text-white rounded-lg hover:bg-white/5"
            >
              <LogIn className="w-4 h-4 inline mr-2" />
              Join Session
            </button>
            <button onClick={() => setShowCreate(true)} className="btn-gold">
              <Plus className="w-4 h-4 inline mr-2" />
              Create Session
            </button>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Active Sessions
          </h2>

          {activeSessions.length === 0 ? (
            <div className="casino-card p-8 text-center">
              <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">No active sessions</p>
              <button onClick={() => setShowCreate(true)} className="btn-gold">
                Create Your First Session
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeSessions.map((session) => (
                <Link
                  key={session.id}
                  to={`/session/${session.id}`}
                  className="casino-card p-6 hover:border-amber-500/50 transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                        {session.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(session.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <Users className="w-5 h-5 text-emerald-400" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">Join Code:</span>
                      <code className="px-2 py-1 rounded bg-[#0a0a0a] text-amber-400 font-mono text-sm">
                        {session.join_code}
                      </code>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          copyCode(session.join_code);
                        }}
                        className="p-1 rounded hover:bg-white/10 transition-colors"
                      >
                        {copiedCode === session.join_code ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-500" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs">
                        <Crown className="w-3 h-3" />
                        {session.admin_username}
                      </span>
                      <span className="px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">
                        {session.player_count} players
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {closedSessions.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gray-500" />
              Closed Sessions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {closedSessions.map((session) => (
                <Link
                  key={session.id}
                  to={`/session/${session.id}`}
                  className="casino-card p-6 opacity-60 hover:opacity-100 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">{session.name}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(session.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gray-500/20 flex items-center justify-center">
                      <X className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded-full bg-gray-500/20 text-gray-400 text-xs">
                    Closed
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {showCreate && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowCreate(false)}
          >
            <div className="casino-card p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Plus className="w-6 h-6 text-amber-400" />
                Create New Session
              </h2>
              {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
              <form onSubmit={handleCreate}>
                <input
                  type="text"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  placeholder="Friday Night Poker"
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#333] rounded-lg text-white placeholder:text-gray-600 focus:border-amber-500 focus:outline-none mb-4"
                  required
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreate(false)}
                    className="flex-1 px-4 py-2 border border-[#333] text-white rounded-lg hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 btn-gold">
                    Create Session
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showJoin && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowJoin(false)}
          >
            <div className="casino-card p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <LogIn className="w-6 h-6 text-emerald-400" />
                Join Session
              </h2>
              {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
              <form onSubmit={handleJoin}>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="POKER123"
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#333] rounded-lg text-white placeholder:text-gray-600 focus:border-emerald-500 focus:outline-none mb-4 font-mono text-lg tracking-wider"
                  required
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowJoin(false)}
                    className="flex-1 px-4 py-2 border border-[#333] text-white rounded-lg hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 btn-green">
                    Join Session
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
