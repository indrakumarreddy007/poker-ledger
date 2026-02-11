import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, Users, BarChart3, LogOut, Crown, User } from 'lucide-react';

function FloatingChips() {
  const chips = [
    { left: '10%', color: '#f59e0b', suit: '♠', delay: '0s' },
    { left: '30%', color: '#ef4444', suit: '♥', delay: '3s' },
    { left: '50%', color: '#10b981', suit: '♣', delay: '6s' },
    { left: '70%', color: '#3b82f6', suit: '♦', delay: '9s' },
    { left: '90%', color: '#f59e0b', suit: '♠', delay: '12s' },
  ];

  return (
    <>
      {chips.map((chip, i) => (
        <div
          key={i}
          className="floating-chip"
          style={{
            left: chip.left,
            borderColor: chip.color,
            animationDelay: chip.delay,
            color: chip.color,
          }}
        >
          {chip.suit}
        </div>
      ))}
    </>
  );
}

function Navigation() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/sessions', label: 'Sessions', icon: Users },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-[#333]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-yellow-400 flex items-center justify-center">
              <Crown className="w-6 h-6 text-black" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
              Poker Ledger
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                    isActive(item.path)
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <>
                <div className="hidden sm:flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center overflow-hidden">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-300">{user.username}</span>
                </div>
                <button
                  onClick={() => { logout(); navigate('/login'); }}
                  className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="md:hidden flex justify-around py-2 border-t border-[#333]">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg ${
                isActive(item.path) ? 'text-amber-400' : 'text-gray-400'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <FloatingChips />
      <Navigation />
      <main className="relative z-10 pt-20">
        <Outlet />
      </main>
    </div>
  );
}
