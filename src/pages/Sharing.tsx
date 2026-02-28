import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Mail, Send, UserPlus, Clock, CheckCircle2, XCircle, Users,
  ChevronRight, Copy, RefreshCw, X, Merge, AlertTriangle, Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Invitation, UserRole } from '../types';

function generateId() { return Math.random().toString(36).slice(2, 11); }

const roleConfig = {
  family: { label: 'Family Member', color: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20', desc: 'Full access to shared family records. Can add records for family members.' },
  doctor: { label: 'Doctor', color: 'text-blue-300 bg-blue-500/10 border-blue-500/20', desc: 'View designated records and leave clinical comments.' },
  caretaker: { label: 'Caretaker', color: 'text-purple-300 bg-purple-500/10 border-purple-500/20', desc: 'View and comment on assigned member records.' },
};

function InviteModal({ onClose, defaultMemberId }: { onClose: () => void; defaultMemberId?: string }) {
  const { state, dispatch } = useApp();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('family');
  const [memberId, setMemberId] = useState(defaultMemberId ?? '');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const tree = state.tree!;

  const handleSend = () => {
    if (!email.trim()) return;
    const invitation: Invitation = {
      id: 'invite-' + generateId(),
      fromUserId: state.currentUser!.id,
      fromUserName: state.currentUser!.name,
      toEmail: email.trim(),
      role,
      memberId: role !== 'family' ? memberId : undefined,
      treeId: tree.id,
      status: 'pending',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      message: message.trim() || undefined,
    };
    dispatch({ type: 'SEND_INVITATION', invitation });
    dispatch({
      type: 'ADD_NOTIFICATION',
      notification: {
        id: 'notif-' + generateId(),
        type: 'invite',
        title: 'Invitation sent',
        message: `Invitation sent to ${email}`,
        read: false,
        createdAt: new Date().toISOString(),
      }
    });
    setSent(true);
  };

  if (sent) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
        <div className="relative glass-card w-full max-w-md p-8 animate-scale-in text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Invitation Sent!</h3>
          <p className="text-slate-400 text-sm mb-6">
            An invitation has been sent to <strong className="text-white">{email}</strong>.
            They'll receive a link to join your family health tree.
          </p>
          <div className="glass rounded-xl p-3 mb-4 text-left">
            <p className="text-xs text-slate-500 mb-1">What happens next:</p>
            <ul className="space-y-1">
              {[
                'They receive an email with a secure link',
                'If they have an account, they can merge trees',
                'If new, they create an account and join',
                'You\'ll be notified when they accept'
              ].map(step => (
                <li key={step} className="text-xs text-slate-300 flex items-start gap-1.5">
                  <ChevronRight className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                  {step}
                </li>
              ))}
            </ul>
          </div>
          <button onClick={onClose} className="btn-primary w-full">Done</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-card w-full max-w-md p-6 animate-scale-in shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white">Send Invitation</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-300 font-medium mb-1.5 block">Email address *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                className="input-field pl-10"
                type="email"
                placeholder="person@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-300 font-medium mb-2 block">Access type</label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.entries(roleConfig) as [UserRole, typeof roleConfig[keyof typeof roleConfig]][]).map(([r, cfg]) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    role === r ? `${cfg.color} border-current` : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                  }`}
                >
                  <p className="text-xs font-semibold">{cfg.label}</p>
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {roleConfig[role as keyof typeof roleConfig]?.desc}
            </p>
          </div>

          {role !== 'family' && (
            <div>
              <label className="text-sm text-slate-300 font-medium mb-1.5 block">Access to member</label>
              <select
                className="input-field"
                value={memberId}
                onChange={e => setMemberId(e.target.value)}
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                <option value="" style={{ background: '#1e293b' }}>Select a family member…</option>
                {tree.members.map(m => (
                  <option key={m.id} value={m.id} style={{ background: '#1e293b' }}>{m.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="text-sm text-slate-300 font-medium mb-1.5 block">Personal message (optional)</label>
            <textarea
              className="input-field resize-none"
              rows={2}
              placeholder="I'd like you to join our family health tree so we can share medical records..."
              value={message}
              onChange={e => setMessage(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button
            onClick={handleSend}
            disabled={!email.trim()}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" /> Send Invite
          </button>
        </div>
      </div>
    </div>
  );
}

function MergeModal({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useApp();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [found, setFound] = useState(false);
  const [merging, setMerging] = useState(false);

  const handleSearch = () => {
    // Simulate finding the other user's tree
    const otherUser = state.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.id !== state.currentUser?.id);
    if (otherUser) {
      setFound(true);
      setStep(2);
    } else {
      setStep(2); // show not found state
    }
  };

  const handleMerge = async () => {
    setMerging(true);
    await new Promise(r => setTimeout(r, 1500));
    // In a real app, this would merge the trees server-side
    dispatch({
      type: 'ADD_NOTIFICATION',
      notification: {
        id: 'notif-' + generateId(),
        type: 'merge',
        title: 'Merge request sent',
        message: `A merge request has been sent to ${email}. They need to accept it.`,
        read: false,
        createdAt: new Date().toISOString(),
      }
    });
    setMerging(false);
    setStep(3);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-card w-full max-w-md p-6 animate-scale-in shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Merge className="w-5 h-5 text-indigo-400" /> Merge Family Trees
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div className="glass rounded-xl p-4 flex gap-3">
              <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-slate-300 leading-relaxed">
                If a family member already has an Ehsana account with their own family tree, you can merge your trees into one unified tree.
              </p>
            </div>
            <div>
              <label className="text-sm text-slate-300 font-medium mb-1.5 block">Their email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  className="input-field pl-10"
                  type="email"
                  placeholder="family@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleSearch} disabled={!email.trim()} className="btn-primary flex-1">Search</button>
            </div>
          </div>
        )}

        {step === 2 && found && (
          <div className="space-y-4">
            <div className="glass rounded-xl p-4 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-white">Account found!</p>
                <p className="text-xs text-slate-400">{email} has an Ehsana account</p>
              </div>
            </div>
            <div className="glass rounded-xl p-4">
              <p className="text-sm font-medium text-white mb-2">What will be merged:</p>
              <ul className="space-y-1.5">
                {[
                  'Family members from both trees will be combined',
                  'Medical records will be preserved and linked',
                  'Duplicate members can be resolved',
                  'Both families will see the unified tree',
                ].map(item => (
                  <li key={item} className="text-xs text-slate-300 flex items-start gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="glass rounded-xl p-3 border border-amber-500/20 bg-amber-500/5 flex gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-200">Both parties must consent. The other person will receive a merge request to approve.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-secondary flex-1">Back</button>
              <button onClick={handleMerge} disabled={merging} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {merging ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Merge className="w-4 h-4" />}
                {merging ? 'Sending…' : 'Send Request'}
              </button>
            </div>
          </div>
        )}

        {step === 2 && !found && (
          <div className="space-y-4">
            <div className="glass rounded-xl p-4 flex items-center gap-3">
              <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-white">No account found</p>
                <p className="text-xs text-slate-400">{email} doesn't have an Ehsana account yet</p>
              </div>
            </div>
            <p className="text-sm text-slate-300">Would you like to send them an invitation instead?</p>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-secondary flex-1">Try another email</button>
              <button onClick={onClose} className="btn-primary flex-1">Send Invite</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <Send className="w-7 h-7 text-emerald-400" />
            </div>
            <h4 className="text-white font-semibold mb-2">Merge request sent!</h4>
            <p className="text-slate-400 text-sm mb-4">Waiting for {email} to accept the merge request.</p>
            <button onClick={onClose} className="btn-primary w-full">Done</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Sharing() {
  const { state, dispatch } = useApp();
  const [searchParams] = useSearchParams();
  const [showInvite, setShowInvite] = useState(searchParams.get('invite') === 'true');
  const [showMerge, setShowMerge] = useState(false);
  const defaultMemberId = searchParams.get('member') ?? '';

  const tree = state.tree;
  const pendingInvites = tree?.invitations.filter(i => i.status === 'pending') ?? [];
  const acceptedInvites = tree?.invitations.filter(i => i.status === 'accepted') ?? [];
  const declinedInvites = tree?.invitations.filter(i => i.status === 'declined') ?? [];

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.origin + '/auth?mode=signup&ref=' + tree?.id);
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="section-title">Sharing & Invitations</h1>
          <p className="section-sub">Manage who has access to your family health tree</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button onClick={() => setShowMerge(true)} className="btn-secondary flex items-center gap-2 text-sm">
            <Merge className="w-4 h-4" /> Merge Tree
          </button>
          <button onClick={() => setShowInvite(true)} className="btn-primary flex items-center gap-2 text-sm">
            <UserPlus className="w-4 h-4" /> Invite Someone
          </button>
        </div>
      </div>

      {/* Share link */}
      <div className="glass-card p-5 mb-6">
        <h3 className="text-sm font-semibold text-white mb-1">Family invite link</h3>
        <p className="text-xs text-slate-400 mb-3">Share this link to let family members join directly</p>
        <div className="flex gap-2">
          <div className="flex-1 input-field py-2 text-sm text-slate-400 truncate">
            {window.location.origin}/auth?mode=signup&ref={tree?.id.slice(0, 8)}…
          </div>
          <button onClick={copyLink} className="btn-secondary flex items-center gap-2 text-sm py-2">
            <Copy className="w-4 h-4" /> Copy
          </button>
        </div>
      </div>

      {/* Merge info */}
      <div className="glass-card p-5 mb-6 border-indigo-500/20 bg-indigo-500/5">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
            <Merge className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white mb-1">Tree Merging</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              If a family member already has their own Ehsana account, you can merge your trees.
              For example, a sibling might have set up their own tree with your parents' records —
              merging creates one unified family health view for everyone.
            </p>
            <button onClick={() => setShowMerge(true)} className="text-indigo-400 hover:text-indigo-300 text-sm font-medium mt-2 flex items-center gap-1">
              Start a merge <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Pending */}
      {pendingInvites.length > 0 && (
        <div className="glass-card p-5 mb-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" /> Pending Invitations ({pendingInvites.length})
          </h3>
          <div className="space-y-3">
            {pendingInvites.map(inv => (
              <div key={inv.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                <div className="w-9 h-9 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{inv.toEmail}</p>
                  <p className="text-xs text-slate-400">
                    Invited as <span className={`font-medium ${roleConfig[inv.role as keyof typeof roleConfig]?.color.split(' ')[0] ?? 'text-white'}`}>{roleConfig[inv.role as keyof typeof roleConfig]?.label ?? inv.role}</span>
                    {' '}· Expires {inv.expiresAt.split('T')[0]}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => dispatch({ type: 'DECLINE_INVITATION', invitationId: inv.id })}
                    className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded-lg hover:bg-red-500/10 transition-colors"
                  >
                    Revoke
                  </button>
                  <button className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg hover:bg-white/5 transition-colors flex items-center gap-1">
                    <RefreshCw className="w-3 h-3" /> Resend
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Accepted */}
      {acceptedInvites.length > 0 && (
        <div className="glass-card p-5 mb-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Accepted ({acceptedInvites.length})
          </h3>
          <div className="space-y-3">
            {acceptedInvites.map(inv => (
              <div key={inv.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                <div className="w-9 h-9 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{inv.toEmail}</p>
                  <p className="text-xs text-slate-400 capitalize">{inv.role} · Accepted</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Members with access */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-400" /> Family Members with Access
        </h3>
        <div className="space-y-2">
          {state.users.map(u => {
            const member = tree?.members.find(m => m.linkedUserId === u.id);
            return (
              <div key={u.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                <img src={u.avatar ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`} alt="" className="w-9 h-9 rounded-full bg-slate-700" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{u.name} {u.id === state.currentUser?.id && '(you)'}</p>
                  <p className="text-xs text-slate-400">{u.email} · {member ? `Linked as ${member.name}` : 'Unlinked'}</p>
                </div>
                <span className={`tag border ${u.role === 'owner' ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20' : 'bg-white/5 text-slate-300 border-white/10'}`}>
                  {u.role}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {showInvite && (
        <InviteModal onClose={() => setShowInvite(false)} defaultMemberId={defaultMemberId} />
      )}
      {showMerge && (
        <MergeModal onClose={() => setShowMerge(false)} />
      )}
    </div>
  );
}
