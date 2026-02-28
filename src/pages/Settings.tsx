import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Bell, Shield, TreePine, LogOut, ChevronRight, CheckCircle2,
  Save, Edit3, Trash2, AlertTriangle, Lock, Users, Globe
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Visibility } from '../types';

const visibilityOptions: { value: Visibility; label: string; desc: string; active: string; inactive: string }[] = [
  { value: 'private',  label: 'Private',  desc: 'Only you',              active: 'border-red-500/50 bg-red-500/15 text-red-300',      inactive: 'border-white/10 bg-white/5 text-slate-400' },
  { value: 'family',   label: 'Family',   desc: 'All family',            active: 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300', inactive: 'border-white/10 bg-white/5 text-slate-400' },
  { value: 'custom',   label: 'Custom',   desc: 'You choose',            active: 'border-amber-500/50 bg-amber-500/15 text-amber-300', inactive: 'border-white/10 bg-white/5 text-slate-400' },
  { value: 'doctors',  label: 'Doctors',  desc: 'Doctors & caretakers',  active: 'border-blue-500/50 bg-blue-500/15 text-blue-300',    inactive: 'border-white/10 bg-white/5 text-slate-400' },
];

const visIcons: Record<Visibility, typeof Lock> = { private: Lock, family: Users, custom: User, doctors: Globe };

export default function Settings() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const user = state.currentUser!;
  const tree = state.tree;

  // ── Profile ──────────────────────────────────────────────────────────────────
  const [name,  setName]  = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [profileSaved, setProfileSaved] = useState(false);

  // ── Tree name ─────────────────────────────────────────────────────────────────
  const [treeName, setTreeName]         = useState(tree?.name ?? '');
  const [editingTree, setEditingTree]   = useState(false);
  const [treeNameSaved, setTreeNameSaved] = useState(false);

  // ── Notif prefs (seeded from persisted state) ─────────────────────────────────
  const [notifInvites,  setNotifInvites]  = useState(state.notifPrefs.invites);
  const [notifComments, setNotifComments] = useState(state.notifPrefs.comments);
  const [notifMerge,    setNotifMerge]    = useState(state.notifPrefs.merges);

  // ── Default visibility ────────────────────────────────────────────────────────
  const [defaultVis, setDefaultVis] = useState<Visibility>(state.defaultDocVisibility);
  const [visSaved, setVisSaved]     = useState(false);

  // ── Danger zone ───────────────────────────────────────────────────────────────
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteText, setDeleteText]               = useState('');

  const myMember = tree?.members.find(m => m.linkedUserId === user.id);
  const myDocs   = state.documents.filter(d => d.memberId === myMember?.id);

  // ── Handlers ──────────────────────────────────────────────────────────────────

  const handleSaveProfile = () => {
    if (!name.trim()) return;
    dispatch({ type: 'UPDATE_USER', name: name.trim(), email: email.trim() });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const handleSaveTreeName = () => {
    if (!treeName.trim()) return;
    dispatch({ type: 'UPDATE_TREE_NAME', name: treeName.trim() });
    setEditingTree(false);
    setTreeNameSaved(true);
    setTimeout(() => setTreeNameSaved(false), 2000);
  };

  const handleToggleNotif = (key: 'invites' | 'comments' | 'merges', value: boolean) => {
    const next = {
      invites:  key === 'invites'  ? value : notifInvites,
      comments: key === 'comments' ? value : notifComments,
      merges:   key === 'merges'   ? value : notifMerge,
    };
    if (key === 'invites')  setNotifInvites(value);
    if (key === 'comments') setNotifComments(value);
    if (key === 'merges')   setNotifMerge(value);
    dispatch({ type: 'UPDATE_NOTIF_PREFS', prefs: next });
  };

  const handleDefaultVis = (v: Visibility) => {
    setDefaultVis(v);
    dispatch({ type: 'UPDATE_DEFAULT_VISIBILITY', visibility: v });
    setVisSaved(true);
    setTimeout(() => setVisSaved(false), 1500);
  };

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    navigate('/');
  };

  const profileDirty = name.trim() !== user.name || email.trim() !== user.email;

  return (
    <div className="max-w-2xl mx-auto animate-fade-in space-y-6">
      <div>
        <h1 className="section-title">Settings</h1>
        <p className="section-sub">Manage your account and preferences</p>
      </div>

      {/* ── Profile ────────────────────────────────────────────────────────────── */}
      <div className="glass-card p-5">
        <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <User className="w-4 h-4 text-indigo-400" /> Profile
        </h2>

        <div className="flex items-center gap-4 mb-5">
          <div className="relative">
            <img
              src={user.avatar ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
              alt=""
              className="w-16 h-16 rounded-full bg-slate-700"
            />
            <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center border-2 border-slate-900">
              <Edit3 className="w-2.5 h-2.5 text-white" />
            </div>
          </div>
          <div>
            <p className="font-semibold text-white">{user.name}</p>
            <p className="text-sm text-slate-400">{user.email}</p>
            <span className={`tag mt-1 ${user.role === 'owner' ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20' : 'bg-white/5 text-slate-300'}`}>
              {user.role}
            </span>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div>
            <label className="text-sm text-slate-300 font-medium mb-1.5 block">Display name</label>
            <input
              className="input-field"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSaveProfile()}
            />
          </div>
          <div>
            <label className="text-sm text-slate-300 font-medium mb-1.5 block">Email</label>
            <input
              className="input-field"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSaveProfile()}
            />
          </div>
        </div>

        <button
          onClick={handleSaveProfile}
          disabled={!profileDirty || !name.trim()}
          className={`flex items-center gap-2 text-sm px-5 py-2.5 rounded-xl font-semibold transition-all
            disabled:opacity-40 disabled:cursor-not-allowed
            ${profileSaved ? 'bg-emerald-600 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}
        >
          {profileSaved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {profileSaved ? 'Saved!' : 'Save Profile'}
        </button>
      </div>

      {/* ── Family Tree ─────────────────────────────────────────────────────────── */}
      <div className="glass-card p-5">
        <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <TreePine className="w-4 h-4 text-emerald-400" /> Family Tree
          {treeNameSaved && (
            <span className="ml-auto flex items-center gap-1 text-emerald-400 text-xs font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Saved
            </span>
          )}
        </h2>

        <div className="space-y-3">
          {/* Editable tree name */}
          <div className="p-3 bg-white/5 rounded-xl">
            {editingTree ? (
              <div className="space-y-2">
                <label className="text-xs text-slate-400">Tree name</label>
                <input
                  className="input-field py-1.5 text-sm"
                  value={treeName}
                  onChange={e => setTreeName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleSaveTreeName();
                    if (e.key === 'Escape') setEditingTree(false);
                  }}
                  autoFocus
                />
                <div className="flex gap-2">
                  <button onClick={() => setEditingTree(false)} className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors">Cancel</button>
                  <button onClick={handleSaveTreeName} disabled={!treeName.trim()} className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition-colors font-medium disabled:opacity-40">Save</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">{tree?.name ?? 'My Family'}</p>
                  <p className="text-xs text-slate-400">{tree?.members.length ?? 0} members · {myDocs.length} your records</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => { setEditingTree(true); setTreeName(tree?.name ?? ''); }} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
                    <Edit3 className="w-3 h-3" /> Rename
                  </button>
                  <button onClick={() => navigate('/app/tree')} className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors">
                    View <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {myMember && (
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
              <div>
                <p className="text-sm font-medium text-white">Your member profile</p>
                <p className="text-xs text-slate-400">{myMember.name} · <span className="capitalize">{myMember.relationship}</span></p>
              </div>
              <button onClick={() => navigate(`/app/members/${myMember.id}`)} className="text-indigo-400 hover:text-indigo-300 text-xs flex items-center gap-1 transition-colors">
                Edit <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Notifications ───────────────────────────────────────────────────────── */}
      <div className="glass-card p-5">
        <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-400" /> Notifications
        </h2>
        <div className="space-y-3">
          {([
            { key: 'invites'  as const, label: 'Invitations', desc: 'When someone accepts or sends you an invite',                 val: notifInvites  },
            { key: 'comments' as const, label: 'Comments',    desc: 'When a doctor or family member comments on a record',         val: notifComments },
            { key: 'merges'   as const, label: 'Tree merges', desc: 'When someone requests to merge their family tree with yours', val: notifMerge    },
          ]).map(({ key, label, desc, val }) => (
            <div key={key} className="flex items-start justify-between gap-4 p-3 bg-white/5 rounded-xl">
              <div>
                <p className="text-sm font-medium text-white">{label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
              </div>
              <button
                onClick={() => handleToggleNotif(key, !val)}
                className={`flex-shrink-0 w-10 h-6 rounded-full transition-colors relative ${val ? 'bg-indigo-600' : 'bg-slate-700'}`}
                aria-label={`Toggle ${label} notifications`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${val ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Privacy defaults ────────────────────────────────────────────────────── */}
      <div className="glass-card p-5">
        <h2 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-400" /> Privacy Defaults
          {visSaved && (
            <span className="ml-auto flex items-center gap-1 text-emerald-400 text-xs font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Saved
            </span>
          )}
        </h2>
        <p className="text-xs text-slate-400 mb-4">Default visibility when you create a new record</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {visibilityOptions.map(({ value, label, desc, active, inactive }) => {
            const Icon = visIcons[value];
            const isActive = defaultVis === value;
            return (
              <button
                key={value}
                onClick={() => handleDefaultVis(value)}
                className={`p-3 rounded-xl border text-center transition-all hover:-translate-y-0.5 ${isActive ? active : inactive}`}
              >
                <Icon className="w-4 h-4 mx-auto mb-1.5" />
                <p className="text-xs font-semibold">{label}</p>
                <p className="text-[10px] mt-0.5 opacity-70 leading-tight">{desc}</p>
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between p-3 bg-white/5 rounded-xl">
          <div>
            <p className="text-sm font-medium text-white">Account created</p>
            <p className="text-xs text-slate-400">{user.createdAt?.split('T')[0] ?? 'Unknown'}</p>
          </div>
        </div>
      </div>

      {/* ── Danger zone ─────────────────────────────────────────────────────────── */}
      <div className="glass-card p-5 border-red-500/20">
        <h2 className="text-sm font-semibold text-red-400 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> Danger Zone
        </h2>
        <div className="space-y-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/8 rounded-xl transition-colors group"
          >
            <div className="text-left">
              <p className="text-sm font-medium text-white">Sign out</p>
              <p className="text-xs text-slate-400">Sign out of your account on this device</p>
            </div>
            <LogOut className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
          </button>

          <button
            onClick={() => { setShowDeleteConfirm(v => !v); setDeleteText(''); }}
            className="w-full flex items-center justify-between p-3 bg-red-500/5 hover:bg-red-500/10 rounded-xl border border-red-500/20 transition-colors group"
          >
            <div className="text-left">
              <p className="text-sm font-medium text-red-400">Delete account</p>
              <p className="text-xs text-slate-400">Permanently delete your account and all data</p>
            </div>
            <Trash2 className="w-4 h-4 text-red-400" />
          </button>

          {showDeleteConfirm && (
            <div className="p-4 bg-red-500/5 rounded-xl border border-red-500/20 animate-slide-up space-y-3">
              <p className="text-sm text-red-300 leading-relaxed">
                This will permanently delete your account, your family tree, and all medical records.
                Type <strong className="text-white">DELETE</strong> to confirm.
              </p>
              <input
                className="input-field"
                style={{ borderColor: 'rgba(239,68,68,0.3)' }}
                placeholder="Type DELETE to confirm"
                value={deleteText}
                onChange={e => setDeleteText(e.target.value)}
              />
              <button
                disabled={deleteText !== 'DELETE'}
                onClick={handleLogout}
                className="btn-danger w-full disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Permanently Delete Account
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
