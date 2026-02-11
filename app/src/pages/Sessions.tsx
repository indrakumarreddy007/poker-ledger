import React, { useState } from 'react';
import { useRouter } from '@/lib/router';
import { usePoker } from '@/contexts/PokerContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Users, 
  ArrowRight, 
  Copy, 
  Check,
  LogIn,
  X,
  Crown
} from 'lucide-react';

const Sessions: React.FC = () => {
  const { navigate } = useRouter();
  useAuth();
  const { sessions, createSession, joinSession, isCurrentUserAdmin } = usePoker();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionName.trim()) return;
    
    setIsLoading(true);
    try {
      const session = await createSession(newSessionName);
      setIsCreateDialogOpen(false);
      setNewSessionName('');
      navigate(`/session/${session.id}`);
    } catch (error) {
      console.error('Failed to create session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    
    setIsLoading(true);
    try {
      await joinSession(joinCode.toUpperCase());
      setIsJoinDialogOpen(false);
      setJoinCode('');
      // Navigate to the joined session
      const joinedSession = sessions.find(s => s.join_code === joinCode.toUpperCase());
      if (joinedSession) {
        navigate(`/session/${joinedSession.id}`);
      }
    } catch (error) {
      console.error('Failed to join session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const activeSessions = sessions.filter(s => s.status === 'active');
  const closedSessions = sessions.filter(s => s.status === 'closed');

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Game Sessions</h1>
            <p className="text-gray-400">Create or join poker sessions</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setIsJoinDialogOpen(true)}
              variant="outline"
              className="border-[#333] text-white hover:bg-white/5 hover:border-amber-500/50"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Join Session
            </Button>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="btn-gold"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Session
            </Button>
          </div>
        </div>

        {/* Active Sessions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Active Sessions
          </h2>
          
          {activeSessions.length === 0 ? (
            <Card className="casino-card border-0">
              <CardContent className="p-8 text-center">
                <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">No active sessions</p>
                <Button onClick={() => setIsCreateDialogOpen(true)} className="btn-gold">
                  Create Your First Session
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeSessions.map((session) => (
                <Card 
                  key={session.id} 
                  className="casino-card border-0 hover:border-amber-500/50 transition-all duration-300 cursor-pointer group"
                  onClick={() => navigate(`/session/${session.id}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                          {session.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Created {new Date(session.created_at).toLocaleDateString()}
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
                            e.stopPropagation();
                            copyToClipboard(session.join_code);
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
                        {isCurrentUserAdmin(session) && (
                          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs">
                            <Crown className="w-3 h-3" />
                            Admin
                          </span>
                        )}
                        <span className="px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">
                          Active
                        </span>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Closed Sessions */}
        {closedSessions.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gray-500" />
              Closed Sessions
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {closedSessions.map((session) => (
                <Card 
                  key={session.id} 
                  className="casino-card border-0 opacity-60 hover:opacity-100 transition-all duration-300 cursor-pointer"
                  onClick={() => navigate(`/session/${session.id}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-white">{session.name}</h3>
                        <p className="text-sm text-gray-500">
                          Created {new Date(session.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-gray-500/20 flex items-center justify-center">
                        <X className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-1 rounded-full bg-gray-500/20 text-gray-400 text-xs">
                        Closed
                      </span>
                      <ArrowRight className="w-5 h-5 text-gray-500" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Create Session Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="casino-card border-0 text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                <Plus className="w-6 h-6 text-amber-400" />
                Create New Session
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Start a new poker game session
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleCreateSession} className="space-y-6 mt-4">
              <div className="space-y-2">
                <Label htmlFor="sessionName" className="text-gray-300">Session Name</Label>
                <Input
                  id="sessionName"
                  placeholder="Friday Night Poker"
                  value={newSessionName}
                  onChange={(e) => setNewSessionName(e.target.value)}
                  className="bg-[#0a0a0a] border-[#333] text-white placeholder:text-gray-600 focus:border-amber-500 focus:ring-amber-500/20"
                  required
                />
              </div>
              
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="flex-1 border-[#333] text-white hover:bg-white/5"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !newSessionName.trim()}
                  className="flex-1 btn-gold disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : (
                    'Create Session'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Join Session Dialog */}
        <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
          <DialogContent className="casino-card border-0 text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                <LogIn className="w-6 h-6 text-emerald-400" />
                Join Session
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Enter the join code to enter a game
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleJoinSession} className="space-y-6 mt-4">
              <div className="space-y-2">
                <Label htmlFor="joinCode" className="text-gray-300">Join Code</Label>
                <Input
                  id="joinCode"
                  placeholder="POKER123"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="bg-[#0a0a0a] border-[#333] text-white placeholder:text-gray-600 focus:border-emerald-500 focus:ring-emerald-500/20 font-mono text-lg tracking-wider"
                  required
                  maxLength={10}
                />
              </div>
              
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsJoinDialogOpen(false)}
                  className="flex-1 border-[#333] text-white hover:bg-white/5"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !joinCode.trim()}
                  className="flex-1 btn-green disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Join Session'
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

export default Sessions;
ns;
