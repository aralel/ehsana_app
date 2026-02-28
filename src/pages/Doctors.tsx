import { useState } from 'react';
import {
  Stethoscope, Plus, X, Users, FileText, MessageSquare,
  Trash2, Shield, ChevronRight, CheckCircle2, Building, Mail, Save
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Accessor } from '../types';

function generateId() { return Math.random().toString(36).slice(2, 11); }

function AddAccessorModal({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'doctor' | 'caretaker'>('doctor');
  const [specialty, setSpecialty] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [step, setStep] = useState(1);

  const tree = state.tree!;

  const toggleMember = (id: string) => {
    setSelectedMemberIds(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const handleCreate = () => {
    if (!name.trim() || !email.trim() || selectedMemberIds.length === 0) return;
    const accessor: Accessor = {
      id: 'accessor-' + generateId(),
      userId: 'doc-user-' + generateId(),
      name: name.trim(),
      email: email.trim(),
      role,
      specialty: specialty.trim() || undefined,
      accessibleMemberIds: selectedMemberIds,
      invitedById: state.currentUser!.id,
      addedAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_ACCESSOR', accessor });
    dispatch({
      type: 'ADD_NOTIFICATION',
      notification: {
        id: 'notif-' + generateId(),
        type: 'invite',
        title: `${role === 'doctor' ? 'Doctor' : 'Caretaker'} invited`,
        message: `${name} has been invited to access family records`,
        read: false,
        createdAt: new Date().toISOString(),
      }
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-card w-full max-w-md p-6 animate-scale-in shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white">
            {step === 1 ? 'Add Doctor or Caretaker' : 'Select Member Access'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            {/* Role toggle */}
            <div>
              <label className="text-sm text-slate-300 font-medium mb-2 block">Role</label>
              <div className="grid grid-cols-2 gap-2">
                {(['doctor', 'caretaker'] as const).map(r => (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={`p-3 rounded-xl border text-center transition-all capitalize font-medium text-sm ${
                      role === r
                        ? r === 'doctor'
                          ? 'bg-blue-500/15 text-blue-300 border-blue-500/40'
                          : 'bg-purple-500/15 text-purple-300 border-purple-500/40'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    {r === 'doctor' ? '🩺' : '👤'} {r}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-slate-300 font-medium mb-1.5 block">Full name *</label>
              <input className="input-field" placeholder="Dr. Jane Smith" value={name} onChange={e => setName(e.target.value)} />
            </div>

            <div>
              <label className="text-sm text-slate-300 font-medium mb-1.5 block">Email *</label>
              <input className="input-field" type="email" placeholder="doctor@hospital.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>

            {role === 'doctor' && (
              <div>
                <label className="text-sm text-slate-300 font-medium mb-1.5 block">Specialty</label>
                <input className="input-field" placeholder="e.g. Cardiology, Pediatrics, General Practice" value={specialty} onChange={e => setSpecialty(e.target.value)} />
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
              <button
                onClick={() => setStep(2)}
                disabled={!name.trim() || !email.trim()}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-slate-300">
              Which family members should <strong className="text-white">{name}</strong> have access to?
            </p>

            <div className="glass rounded-xl p-3 flex gap-2">
              <Shield className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-300">
                They will only be able to view records that are set to "Doctors" visibility or that you explicitly share.
              </p>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto">
              {tree.members.map(m => (
                <button
                  key={m.id}
                  onClick={() => toggleMember(m.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                    selectedMemberIds.includes(m.id)
                      ? 'bg-indigo-500/10 border-indigo-500/30'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <img
                    src={m.avatar ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.name}`}
                    alt=""
                    className="w-8 h-8 rounded-full bg-slate-700"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{m.name}</p>
                    <p className="text-xs text-slate-400 capitalize">{m.relationship.replace('_', ' ')}</p>
                  </div>
                  {selectedMemberIds.includes(m.id) && (
                    <CheckCircle2 className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-secondary flex-1">Back</button>
              <button
                onClick={handleCreate}
                disabled={selectedMemberIds.length === 0}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" /> Add {role === 'doctor' ? 'Doctor' : 'Caretaker'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AccessorCard({ accessor }: { accessor: Accessor }) {
  const { state, dispatch, getMemberById } = useApp();
  const [expanded, setExpanded] = useState(false);

  const accessibleMembers = accessor.accessibleMemberIds.map(id => getMemberById(id)).filter(Boolean);
  const accessorDocs = state.documents.filter(d =>
    accessor.accessibleMemberIds.includes(d.memberId) && d.visibility !== 'private'
  );
  const totalComments = state.documents.reduce((sum, doc) =>
    sum + doc.comments.filter(c => c.authorId === accessor.id).length, 0
  );

  const handleRemove = () => {
    if (window.confirm(`Remove ${accessor.name}'s access to your family tree?`)) {
      dispatch({ type: 'REMOVE_ACCESSOR', accessorId: accessor.id });
    }
  };

  return (
    <div className="glass-card p-5">
      <div className="flex items-start gap-4 mb-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl flex-shrink-0 ${
          accessor.role === 'doctor' ? 'bg-blue-500/20' : 'bg-purple-500/20'
        }`}>
          {accessor.role === 'doctor' ? '🩺' : '👤'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-white">{accessor.name}</p>
              {accessor.specialty && (
                <p className="text-sm text-indigo-300">{accessor.specialty}</p>
              )}
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                <Mail className="w-3 h-3" /> {accessor.email}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`tag border ${
                accessor.role === 'doctor'
                  ? 'bg-blue-500/10 text-blue-300 border-blue-500/20'
                  : 'bg-purple-500/10 text-purple-300 border-purple-500/20'
              }`}>
                {accessor.role === 'doctor' ? '🩺' : '👤'} {accessor.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="glass rounded-xl p-2.5 text-center">
          <p className="text-base font-bold text-white">{accessibleMembers.length}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Members</p>
        </div>
        <div className="glass rounded-xl p-2.5 text-center">
          <p className="text-base font-bold text-white">{accessorDocs.length}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Visible docs</p>
        </div>
        <div className="glass rounded-xl p-2.5 text-center">
          <p className="text-base font-bold text-white">{totalComments}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Comments</p>
        </div>
      </div>

      {/* Accessible members */}
      <div className="mb-4">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 mb-2 transition-colors"
        >
          <ChevronRight className={`w-3 h-3 transition-transform ${expanded ? 'rotate-90' : ''}`} />
          Has access to {accessibleMembers.length} member{accessibleMembers.length !== 1 ? 's' : ''}
        </button>

        {expanded && (
          <div className="space-y-1.5 animate-slide-up">
            {accessibleMembers.map(m => m && (
              <div key={m.id} className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                <img src={m.avatar ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.name}`} alt="" className="w-6 h-6 rounded-full" />
                <p className="text-xs text-slate-300">{m.name}</p>
                <span className="text-[10px] text-slate-500 capitalize ml-auto">{m.relationship}</span>
              </div>
            ))}

            {/* Recent comments */}
            {state.documents.map(doc => {
              const docComments = doc.comments.filter(c => c.authorId === accessor.id);
              if (docComments.length === 0) return null;
              return docComments.map(comment => (
                <div key={comment.id} className="p-2.5 bg-indigo-500/5 rounded-lg border border-indigo-500/10">
                  <p className="text-[10px] text-indigo-300 mb-0.5 font-medium">{doc.title}</p>
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">{comment.content}</p>
                  <p className="text-[10px] text-slate-500 mt-1">{comment.createdAt.split('T')[0]}</p>
                </div>
              ));
            })}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button onClick={handleRemove} className="btn-danger flex-1 text-sm py-2 flex items-center justify-center gap-2">
          <Trash2 className="w-3.5 h-3.5" /> Remove Access
        </button>
      </div>
    </div>
  );
}

export default function Doctors() {
  const { state } = useApp();
  const [showAdd, setShowAdd] = useState(false);

  const tree = state.tree;
  const doctors = tree?.accessors.filter(a => a.role === 'doctor') ?? [];
  const caretakers = tree?.accessors.filter(a => a.role === 'caretaker') ?? [];

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="section-title">Doctors & Caretakers</h1>
          <p className="section-sub">Manage external access to your family health records</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2 text-sm flex-shrink-0">
          <Plus className="w-4 h-4" /> Add Doctor / Caretaker
        </button>
      </div>

      {/* How it works */}
      <div className="glass-card p-5 mb-6">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-indigo-400" /> How access control works
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: Users, title: 'Choose members', desc: 'Select which family members each doctor or caretaker can see', color: 'text-indigo-400 bg-indigo-500/10' },
            { icon: FileText, title: 'Document visibility', desc: 'Only "Doctors" and "Family" visibility records are shown — never private ones', color: 'text-emerald-400 bg-emerald-500/10' },
            { icon: MessageSquare, title: 'Clinical comments', desc: 'They can leave notes on records, which your family can see', color: 'text-blue-400 bg-blue-500/10' },
          ].map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="glass rounded-xl p-3">
              <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center mb-2`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-sm font-medium text-white mb-1">{title}</p>
              <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Doctors */}
      {doctors.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <div className="flex-1 h-px bg-white/5" />
            Doctors ({doctors.length})
            <div className="flex-1 h-px bg-white/5" />
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {doctors.map(a => <AccessorCard key={a.id} accessor={a} />)}
          </div>
        </div>
      )}

      {/* Caretakers */}
      {caretakers.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <div className="flex-1 h-px bg-white/5" />
            Caretakers ({caretakers.length})
            <div className="flex-1 h-px bg-white/5" />
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {caretakers.map(a => <AccessorCard key={a.id} accessor={a} />)}
          </div>
        </div>
      )}

      {/* Empty state */}
      {doctors.length === 0 && caretakers.length === 0 && (
        <div className="glass-card p-16 text-center">
          <Stethoscope className="w-12 h-12 mx-auto mb-3 text-slate-600" />
          <p className="text-slate-400 font-medium text-base mb-1">No doctors or caretakers yet</p>
          <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
            Invite doctors or caretakers to view specific family members' records and leave clinical notes
          </p>
          <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2 mx-auto">
            <Plus className="w-4 h-4" /> Add Doctor or Caretaker
          </button>
        </div>
      )}

      {showAdd && <AddAccessorModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}
