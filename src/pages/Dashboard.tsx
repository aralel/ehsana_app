import { useNavigate } from 'react-router-dom';
import {
  FileText, Users, Stethoscope, Share2, Activity,
  Clock, Plus, ChevronRight, Heart, AlertCircle, CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { DocType } from '../types';

const docTypeColors: Record<DocType, string> = {
  lab_result: 'bg-blue-500/20 text-blue-300 border-blue-500/20',
  prescription: 'bg-purple-500/20 text-purple-300 border-purple-500/20',
  diagnosis: 'bg-red-500/20 text-red-300 border-red-500/20',
  imaging: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/20',
  vaccination: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/20',
  surgery: 'bg-orange-500/20 text-orange-300 border-orange-500/20',
  allergy: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/20',
  note: 'bg-slate-500/20 text-slate-300 border-slate-500/20',
  other: 'bg-slate-500/20 text-slate-300 border-slate-500/20',
};

const docTypeLabel: Record<DocType, string> = {
  lab_result: 'Lab Result', prescription: 'Rx', diagnosis: 'Diagnosis',
  imaging: 'Imaging', vaccination: 'Vaccine', surgery: 'Surgery',
  allergy: 'Allergy', note: 'Note', other: 'Other',
};

export default function Dashboard() {
  const { state, getMemberById } = useApp();
  const navigate = useNavigate();
  const user = state.currentUser!;
  const tree = state.tree;

  const myMember = tree?.members.find(m => m.linkedUserId === user.id);
  const recentDocs = [...state.documents]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const pendingInvites = tree?.invitations.filter(i => i.status === 'pending') ?? [];
  const memberCount = tree?.members.length ?? 0;
  const docCount = state.documents.length;
  const accessorCount = tree?.accessors.length ?? 0;
  const sharedDocCount = state.documents.filter(d => d.visibility !== 'private').length;

  const stats = [
    { label: 'Family Members', value: memberCount, icon: Users, color: 'text-indigo-400', bg: 'bg-indigo-500/10', path: '/app/members' },
    { label: 'Medical Records', value: docCount, icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10', path: '/app/documents' },
    { label: 'Doctors & Caretakers', value: accessorCount, icon: Stethoscope, color: 'text-emerald-400', bg: 'bg-emerald-500/10', path: '/app/doctors' },
    { label: 'Shared Records', value: sharedDocCount, icon: Share2, color: 'text-purple-400', bg: 'bg-purple-500/10', path: '/app/sharing' },
  ];

  const getHour = () => new Date().getHours();
  const greeting = getHour() < 12 ? 'Good morning' : getHour() < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Greeting */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">{greeting}, {user.name.split(' ')[0]} 👋</h1>
          <p className="text-slate-400 text-sm mt-1">
            {tree ? `Managing ${tree.name}` : 'Your family health hub'}
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button onClick={() => navigate('/app/members')} className="btn-secondary flex items-center gap-2 text-sm py-2">
            <Plus className="w-4 h-4" /> Add member
          </button>
          <button onClick={() => navigate('/app/documents')} className="btn-primary flex items-center gap-2 text-sm py-2">
            <Plus className="w-4 h-4" /> Add record
          </button>
        </div>
      </div>

      {/* Pending invites alert */}
      {pendingInvites.length > 0 && (
        <div className="glass-card p-4 border-amber-500/20 bg-amber-500/5 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-white font-medium text-sm">{pendingInvites.length} pending invitation{pendingInvites.length > 1 ? 's' : ''}</p>
            <p className="text-slate-400 text-xs mt-0.5">Family members have been invited but haven't joined yet.</p>
          </div>
          <button onClick={() => navigate('/app/sharing')} className="text-amber-400 hover:text-amber-300 text-sm font-medium flex items-center gap-1">
            View <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg, path }) => (
          <button
            key={label}
            onClick={() => navigate(path)}
            className="glass-card p-5 text-left group hover:border-white/15 transition-all duration-200 hover:-translate-y-0.5"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-sm text-slate-400 mt-0.5">{label}</p>
          </button>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent records */}
        <div className="lg:col-span-2 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-white">Recent Records</h2>
              <p className="text-xs text-slate-400 mt-0.5">Latest medical documents across your family</p>
            </div>
            <button onClick={() => navigate('/app/documents')} className="text-indigo-400 hover:text-indigo-300 text-xs font-medium flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2">
            {recentDocs.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No records yet</p>
                <button onClick={() => navigate('/app/documents')} className="btn-primary mt-3 text-sm py-2">
                  Add first record
                </button>
              </div>
            )}
            {recentDocs.map(doc => {
              const member = getMemberById(doc.memberId);
              return (
                <button
                  key={doc.id}
                  onClick={() => navigate(`/app/documents?member=${doc.memberId}`)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-left group"
                >
                  <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate group-hover:text-indigo-300 transition-colors">{doc.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {member?.name ?? 'Unknown'} · {doc.date}
                    </p>
                  </div>
                  <span className={`tag border ${docTypeColors[doc.type]} flex-shrink-0`}>
                    {docTypeLabel[doc.type]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Family members quick view */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-white">Family Members</h2>
              <button onClick={() => navigate('/app/tree')} className="text-indigo-400 hover:text-indigo-300 text-xs font-medium flex items-center gap-1">
                Tree view <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-2">
              {(tree?.members ?? []).slice(0, 5).map(m => {
                const memberDocs = state.documents.filter(d => d.memberId === m.id);
                const isLinked = !!m.linkedUserId;
                return (
                  <button
                    key={m.id}
                    onClick={() => navigate(`/app/members/${m.id}`)}
                    className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors text-left group"
                  >
                    <img
                      src={m.avatar ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.name}`}
                      alt=""
                      className="w-8 h-8 rounded-full bg-slate-700"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{m.name}</p>
                      <p className="text-xs text-slate-400 capitalize">{m.relationship.replace('_', ' ')}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-500">{memberDocs.length}</span>
                      <FileText className="w-3 h-3 text-slate-600" />
                      {isLinked && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                    </div>
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => navigate('/app/members')}
              className="w-full mt-3 py-2 text-xs text-slate-400 hover:text-white border border-white/5 hover:border-white/15 rounded-xl transition-colors"
            >
              Manage all members
            </button>
          </div>

          {/* Health insights */}
          <div className="glass-card p-5">
            <h2 className="text-base font-semibold text-white mb-3">Health Snapshot</h2>
            <div className="space-y-3">
              {(Object.entries(docTypeLabel) as [DocType, string][])
                .map(([type, label]) => {
                  const count = state.documents.filter(d => d.type === type).length;
                  if (count === 0) return null;
                  return (
                    <div key={type} className="flex items-center gap-3">
                      <span className={`tag border ${docTypeColors[type]} flex-shrink-0 w-24 justify-center`}>{label}</span>
                      <div className="flex-1 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full"
                          style={{ width: `${Math.min(100, (count / docCount) * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-400 w-4 text-right">{count}</span>
                    </div>
                  );
                }).filter(Boolean)}
            </div>
          </div>

          {/* Activity */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h2 className="text-base font-semibold text-white">Activity</h2>
            </div>
            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-300">Hypertension diagnosis added for Robert</p>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5"><Clock className="w-2.5 h-2.5" /> 2 months ago</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-300">Dr. Emily Chen joined as cardiologist</p>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5"><Clock className="w-2.5 h-2.5" /> 3 months ago</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-300">Emma's vaccination record updated</p>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5"><Clock className="w-2.5 h-2.5" /> 3 months ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
