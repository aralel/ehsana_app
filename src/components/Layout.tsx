import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, TreePine, FileText, Users, Share2, Bell,
  LogOut, Settings, Menu, X, ChevronDown, Heart, Stethoscope
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/app' },
  { id: 'tree', label: 'Family Tree', icon: TreePine, path: '/app/tree' },
  { id: 'documents', label: 'Records', icon: FileText, path: '/app/documents' },
  { id: 'members', label: 'Members', icon: Users, path: '/app/members' },
  { id: 'sharing', label: 'Sharing', icon: Share2, path: '/app/sharing' },
  { id: 'doctors', label: 'Doctors & Care', icon: Stethoscope, path: '/app/doctors' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { state, dispatch, unreadNotificationCount } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const user = state.currentUser;
  const active = location.pathname;

  useEffect(() => {
    if (!state.currentUser) navigate('/auth');
  }, [state.currentUser]);

  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    navigate('/');
  };

  if (!user) return null;

  const Sidebar = ({ mobile = false }) => (
    <div className={`flex flex-col h-full ${mobile ? 'p-4' : 'p-5'}`}>
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-8">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
          <Heart className="w-4 h-4 text-white" fill="white" />
        </div>
        <span className="font-bold text-white text-base">Ehsana</span>
        {mobile && (
          <button onClick={() => setSidebarOpen(false)} className="ml-auto text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* User info */}
      <div className="glass rounded-xl p-3 mb-6 flex items-center gap-3">
        <img
          src={user.avatar ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
          alt=""
          className="w-9 h-9 rounded-full bg-slate-700"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{user.name}</p>
          <p className="text-xs text-slate-400 truncate">{user.email}</p>
        </div>
      </div>

      {/* Tree name */}
      {state.tree && (
        <div className="mb-4">
          <div className="flex items-center gap-2 px-4 py-1">
            <TreePine className="w-3 h-3 text-emerald-400" />
            <span className="text-[11px] text-slate-500 font-medium uppercase tracking-wider truncate">{state.tree.name}</span>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(({ id, label, icon: Icon, path }) => {
          const isActive = active === path || (path !== '/app' && active.startsWith(path));
          return (
            <button
              key={id}
              onClick={() => navigate(path)}
              className={isActive ? 'nav-link-active' : 'nav-link'}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="space-y-1 mt-4 pt-4 border-t border-white/5">
        <button onClick={() => navigate('/app/settings')} className="nav-link w-full">
          <Settings className="w-4 h-4" /> Settings
        </button>
        <button onClick={handleLogout} className="nav-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/5">
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-col w-60 border-r border-white/5 glass flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-72 glass border-r border-white/10 animate-slide-in">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="relative z-10 flex items-center justify-between px-4 md:px-6 py-3.5 border-b border-white/5 glass flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden text-slate-400 hover:text-white">
              <Menu className="w-5 h-5" />
            </button>
            {/* Breadcrumb */}
            <div className="text-sm text-slate-400">
              {navItems.find(n => active === n.path || (n.path !== '/app' && active.startsWith(n.path)))?.label ?? 'Dashboard'}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => { setNotifOpen(!notifOpen); setUserMenuOpen(false); }}
                className="relative p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full" />
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 glass-card shadow-2xl shadow-black/50 z-[200] overflow-hidden">
                  <div className="flex items-center justify-between p-3 border-b border-white/5">
                    <span className="text-sm font-semibold text-white">Notifications</span>
                    {unreadNotificationCount > 0 && (
                      <button
                        onClick={() => dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' })}
                        className="text-xs text-indigo-400 hover:text-indigo-300"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-white/5">
                    {state.notifications.length === 0 && (
                      <p className="p-4 text-slate-400 text-sm text-center">No notifications</p>
                    )}
                    {state.notifications.map(n => (
                      <button
                        key={n.id}
                        onClick={() => dispatch({ type: 'MARK_NOTIFICATION_READ', notifId: n.id })}
                        className={`w-full text-left p-3 hover:bg-white/5 transition-colors ${!n.read ? 'bg-indigo-500/5' : ''}`}
                      >
                        <div className="flex items-start gap-2">
                          {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />}
                          <div className={!n.read ? '' : 'ml-3.5'}>
                            <p className="text-sm font-medium text-white">{n.title}</p>
                            <p className="text-xs text-slate-400 mt-0.5 leading-snug">{n.message}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => { setUserMenuOpen(!userMenuOpen); setNotifOpen(false); }}
                className="flex items-center gap-2 p-1 hover:bg-white/5 rounded-xl transition-colors"
              >
                <img
                  src={user.avatar ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                  alt=""
                  className="w-7 h-7 rounded-full bg-slate-700"
                />
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-44 glass-card shadow-2xl shadow-black/50 z-[200] overflow-hidden">
                  <div className="p-1">
                    <button onClick={() => { navigate('/app/settings'); setUserMenuOpen(false); }}
                      className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors flex items-center gap-2">
                      <Settings className="w-3.5 h-3.5" /> Settings
                    </button>
                    <button onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 rounded-lg transition-colors flex items-center gap-2">
                      <LogOut className="w-3.5 h-3.5" /> Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>

      {/* Click outside to close dropdowns */}
      {(notifOpen || userMenuOpen) && (
        <div className="fixed inset-0 z-[9]" onClick={() => { setNotifOpen(false); setUserMenuOpen(false); }} />
      )}
    </div>
  );
}
