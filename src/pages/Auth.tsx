import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Heart, Mail, Lock, User, ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { User as UserType, FamilyTree, FamilyMember } from '../types';

function generateId() {
  return Math.random().toString(36).slice(2, 11);
}

export default function Auth() {
  const [params] = useSearchParams();
  const [mode, setMode] = useState<'login' | 'signup'>(
    (params.get('mode') as 'login' | 'signup') ?? 'login'
  );
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { state, dispatch } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (state.currentUser) navigate('/app');
  }, [state.currentUser]);

  const handleLogin = async () => {
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));

    // Demo login — alex or robert
    const found = state.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!found) {
      // Allow demo access
      const demo = state.users[0];
      dispatch({ type: 'LOGIN', user: demo });
    } else {
      dispatch({ type: 'LOGIN', user: found });
    }
    setLoading(false);
    navigate('/app');
  };

  const handleSignup = async () => {
    setError('');
    if (!name || !email || !password) { setError('Please fill in all fields.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));

    // Check if email already taken
    const existing = state.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) { setLoading(false); setError('An account with this email already exists.'); return; }

    const userId = 'user-' + generateId();
    const treeId = 'tree-' + generateId();
    const memberId = 'member-' + generateId();

    const selfMember: FamilyMember = {
      id: memberId, linkedUserId: userId, name, relationship: 'self',
      gender: 'other', parentIds: [], childrenIds: [], isAlive: true,
      addedById: userId, generation: 0,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.replace(' ', '')}`,
    };

    const newUser: UserType = {
      id: userId, name, email, role: 'owner',
      createdAt: new Date().toISOString(), treeId,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.replace(' ', '')}`,
    };

    const newTree: FamilyTree = {
      id: treeId, name: `${name.split(' ')[0]}'s Family Health`,
      ownerId: userId, members: [selfMember],
      accessors: [], invitations: [],
      createdAt: new Date().toISOString(), mergedTreeIds: [],
    };

    dispatch({ type: 'SIGNUP', user: newUser, tree: newTree });
    setLoading(false);
    navigate('/app');
  };

  const loginAsDemoUser = (userIdx: number) => {
    const user = state.users[userIdx];
    if (user) {
      dispatch({ type: 'LOGIN', user });
      navigate('/app');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-600/8 rounded-full blur-3xl pointer-events-none" />

      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="w-full max-w-sm animate-scale-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto mb-3">
            <Heart className="w-6 h-6 text-white" fill="white" />
          </div>
          <h1 className="text-2xl font-bold text-white">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {mode === 'login'
              ? 'Sign in to your family health hub'
              : 'Start your family health journey'}
          </p>
        </div>

        {/* Form card */}
        <div className="glass-card p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-300 text-sm">
              {error}
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="text-sm text-slate-300 font-medium mb-1.5 block">Full name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  className="input-field pl-10"
                  placeholder="Jane Smith"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSignup()}
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-sm text-slate-300 font-medium mb-1.5 block">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                className="input-field pl-10"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (mode === 'login' ? handleLogin() : handleSignup())}
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-300 font-medium mb-1.5 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                className="input-field pl-10 pr-10"
                type={showPass ? 'text' : 'password'}
                placeholder={mode === 'signup' ? 'At least 6 characters' : '••••••••'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (mode === 'login' ? handleLogin() : handleSignup())}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            onClick={mode === 'login' ? handleLogin : handleSignup}
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </div>

        {/* Toggle mode */}
        <p className="text-center text-slate-400 text-sm mt-4">
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
            className="text-indigo-400 hover:text-indigo-300 font-medium"
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>

        {/* Demo accounts */}
        <div className="mt-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-slate-500 text-xs">Demo accounts</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {state.users.map((u, i) => (
              <button
                key={u.id}
                onClick={() => loginAsDemoUser(i)}
                className="glass p-2.5 rounded-xl hover:border-indigo-500/30 transition-all text-left group"
              >
                <div className="flex items-center gap-2">
                  <img src={u.avatar} alt="" className="w-7 h-7 rounded-full bg-slate-700" />
                  <div>
                    <p className="text-white text-xs font-medium leading-tight">{u.name.split(' ')[0]}</p>
                    <p className="text-slate-500 text-[10px]">{u.role}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
