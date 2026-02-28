import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, FileText, Plus, Edit3, Trash2, Link2, CheckCircle2,
  Mail, Users, Calendar, User, Heart, Baby, UserCog, X, Save
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { FamilyMember, Gender, RelationshipType } from '../types';

function generateId() { return Math.random().toString(36).slice(2, 11); }

const docTypeColors: Record<string, string> = {
  lab_result: 'bg-blue-500/20 text-blue-300',
  prescription: 'bg-purple-500/20 text-purple-300',
  diagnosis: 'bg-red-500/20 text-red-300',
  imaging: 'bg-cyan-500/20 text-cyan-300',
  vaccination: 'bg-emerald-500/20 text-emerald-300',
  surgery: 'bg-orange-500/20 text-orange-300',
  allergy: 'bg-yellow-500/20 text-yellow-300',
  note: 'bg-slate-500/20 text-slate-300',
  other: 'bg-slate-500/20 text-slate-300',
};

const visColors = {
  private: 'bg-red-500/15 text-red-300 border-red-500/20',
  family: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
  custom: 'bg-amber-500/15 text-amber-300 border-amber-500/20',
  doctors: 'bg-blue-500/15 text-blue-300 border-blue-500/20',
};

function EditMemberModal({ member, onClose }: { member: FamilyMember; onClose: () => void }) {
  const { dispatch } = useApp();
  const [name, setName] = useState(member.name);
  const [gender, setGender] = useState<Gender>(member.gender);
  const [birthDate, setBirthDate] = useState(member.birthDate ?? '');
  const [notes, setNotes] = useState(member.notes ?? '');
  const [relationship, setRelationship] = useState<RelationshipType>(member.relationship);

  const handleSave = () => {
    dispatch({
      type: 'UPDATE_MEMBER',
      member: { ...member, name, gender, birthDate: birthDate || undefined, notes: notes || undefined, relationship }
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-card w-full max-w-md p-6 animate-scale-in shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white">Edit Member</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-300 font-medium mb-1.5 block">Full name</label>
            <input className="input-field" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-slate-300 font-medium mb-1.5 block">Relationship</label>
              <select className="input-field" value={relationship} onChange={e => setRelationship(e.target.value as RelationshipType)} style={{ background: 'rgba(255,255,255,0.05)' }}>
                {(['parent', 'child', 'sibling', 'spouse', 'grandparent', 'grandchild', 'aunt_uncle', 'cousin', 'other', 'self'] as RelationshipType[]).map(r => (
                  <option key={r} value={r} style={{ background: '#1e293b' }}>{r.replace('_', ' / ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-300 font-medium mb-1.5 block">Gender</label>
              <select className="input-field" value={gender} onChange={e => setGender(e.target.value as Gender)} style={{ background: 'rgba(255,255,255,0.05)' }}>
                {(['male', 'female', 'other'] as Gender[]).map(g => (
                  <option key={g} value={g} style={{ background: '#1e293b' }}>{g}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm text-slate-300 font-medium mb-1.5 block">Date of birth</label>
            <input className="input-field" type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-slate-300 font-medium mb-1.5 block">Notes</label>
            <textarea className="input-field resize-none" rows={2} value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleSave} className="btn-primary flex-1 flex items-center justify-center gap-2">
            <Save className="w-4 h-4" /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

function MemberProfile() {
  const { id } = useParams<{ id: string }>();
  const { state, dispatch, getMemberDocuments, getMemberById } = useApp();
  const navigate = useNavigate();
  const [showEdit, setShowEdit] = useState(false);

  const member = getMemberById(id!);
  if (!member) return <div className="text-slate-400 text-center py-16">Member not found.</div>;

  const docs = getMemberDocuments(member.id);
  const linkedUser = state.users.find(u => u.id === member.linkedUserId);
  const parents = member.parentIds.map(pid => getMemberById(pid)).filter(Boolean);
  const children = member.childrenIds.map(cid => getMemberById(cid)).filter(Boolean);
  const spouse = member.spouseId ? getMemberById(member.spouseId) : undefined;

  const handleRemove = () => {
    if (window.confirm(`Remove ${member.name} from the family tree? This will also delete their ${docs.length} medical records.`)) {
      dispatch({ type: 'REMOVE_MEMBER', memberId: member.id });
      navigate('/app/members');
    }
  };

  const age = member.birthDate
    ? Math.floor((Date.now() - new Date(member.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
    : null;

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      {/* Back */}
      <button onClick={() => navigate('/app/members')} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-5 transition-colors">
        <ArrowLeft className="w-4 h-4" /> All Members
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile card */}
        <div className="space-y-4">
          <div className="glass-card p-6 text-center">
            <img
              src={member.avatar ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`}
              alt=""
              className="w-20 h-20 rounded-full bg-slate-700 mx-auto mb-4"
            />
            <h1 className="text-xl font-bold text-white mb-1">{member.name}</h1>
            <p className="text-slate-400 text-sm capitalize mb-3">{member.relationship.replace('_', ' ')}</p>

            {linkedUser ? (
              <div className="flex items-center justify-center gap-2 p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 mb-4">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-emerald-300 font-medium">Account linked</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 p-2 bg-amber-500/10 rounded-xl border border-amber-500/20 mb-4">
                <Link2 className="w-4 h-4 text-amber-400" />
                <span className="text-xs text-amber-300">No account yet</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 text-left mb-4">
              {age !== null && (
                <div className="p-2.5 bg-white/5 rounded-xl">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Age</p>
                  <p className="text-sm font-semibold text-white mt-0.5">{age} yrs</p>
                </div>
              )}
              <div className="p-2.5 bg-white/5 rounded-xl">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Gender</p>
                <p className="text-sm font-semibold text-white mt-0.5 capitalize">{member.gender}</p>
              </div>
              <div className="p-2.5 bg-white/5 rounded-xl col-span-2">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Records</p>
                <p className="text-sm font-semibold text-white mt-0.5">{docs.length} documents</p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button onClick={() => setShowEdit(true)} className="btn-secondary text-sm py-2 flex items-center justify-center gap-2">
                <Edit3 className="w-3.5 h-3.5" /> Edit Profile
              </button>
              <button onClick={() => navigate(`/app/sharing?invite=true&member=${member.id}`)} className="btn-primary text-sm py-2 flex items-center justify-center gap-2">
                <Mail className="w-3.5 h-3.5" /> Invite Member
              </button>
              {member.linkedUserId !== state.currentUser?.id && (
                <button onClick={handleRemove} className="btn-danger text-sm py-2 flex items-center justify-center gap-2">
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
              )}
            </div>
          </div>

          {/* Family connections */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" /> Family Connections
            </h3>
            <div className="space-y-2">
              {parents.map(p => p && (
                <button key={p.id} onClick={() => navigate(`/app/members/${p.id}`)} className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/5 transition-colors text-left">
                  <img src={p.avatar ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.name}`} alt="" className="w-7 h-7 rounded-full bg-slate-700" />
                  <div>
                    <p className="text-xs font-medium text-white">{p.name}</p>
                    <p className="text-[10px] text-slate-500">Parent</p>
                  </div>
                </button>
              ))}
              {spouse && (
                <button key={spouse.id} onClick={() => navigate(`/app/members/${spouse.id}`)} className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/5 transition-colors text-left">
                  <img src={spouse.avatar ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${spouse.name}`} alt="" className="w-7 h-7 rounded-full bg-slate-700" />
                  <div>
                    <p className="text-xs font-medium text-white">{spouse.name}</p>
                    <p className="text-[10px] text-slate-500">Spouse</p>
                  </div>
                </button>
              )}
              {children.map(c => c && (
                <button key={c.id} onClick={() => navigate(`/app/members/${c.id}`)} className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/5 transition-colors text-left">
                  <img src={c.avatar ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.name}`} alt="" className="w-7 h-7 rounded-full bg-slate-700" />
                  <div>
                    <p className="text-xs font-medium text-white">{c.name}</p>
                    <p className="text-[10px] text-slate-500">Child</p>
                  </div>
                </button>
              ))}
              {parents.length === 0 && !spouse && children.length === 0 && (
                <p className="text-xs text-slate-500 py-1">No connections added yet</p>
              )}
            </div>
          </div>

          {member.notes && (
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-white mb-2">Notes</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{member.notes}</p>
            </div>
          )}
        </div>

        {/* Documents */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Medical Records ({docs.length})</h2>
            <button
              onClick={() => navigate(`/app/documents?member=${member.id}`)}
              className="btn-primary text-sm py-2 flex items-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" /> Add Record
            </button>
          </div>

          {docs.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <FileText className="w-10 h-10 mx-auto mb-3 text-slate-600" />
              <p className="text-slate-400 font-medium">No records yet</p>
              <p className="text-slate-500 text-sm mt-1 mb-4">Start building {member.name}'s health history</p>
              <button onClick={() => navigate(`/app/documents?member=${member.id}`)} className="btn-primary text-sm">
                Add first record
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {docs.map(doc => (
                <button
                  key={doc.id}
                  onClick={() => navigate(`/app/documents?member=${member.id}`)}
                  className="w-full glass-card p-4 text-left hover:border-white/20 transition-all group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className={`tag ${docTypeColors[doc.type]}`}>{doc.type.replace('_', ' ')}</span>
                        <span className={`tag border ${visColors[doc.visibility]}`}>{doc.visibility}</span>
                      </div>
                      <p className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">{doc.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {doc.date}
                      </p>
                    </div>
                    {doc.comments.length > 0 && (
                      <span className="text-xs text-slate-500 flex items-center gap-1 flex-shrink-0">
                        {doc.comments.length} comment{doc.comments.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">{doc.content}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {showEdit && <EditMemberModal member={member} onClose={() => setShowEdit(false)} />}
    </div>
  );
}

function MembersList() {
  const { state, getMemberDocuments } = useApp();
  const navigate = useNavigate();
  const tree = state.tree;

  const membersByGen = (tree?.members ?? []).reduce((acc, m) => {
    if (!acc[m.generation]) acc[m.generation] = [];
    acc[m.generation].push(m);
    return acc;
  }, {} as Record<number, FamilyMember[]>);

  const genLabels: Record<number, string> = {
    [-1]: 'Great Grandparents',
    0: 'Grandparents / Previous Generation',
    1: 'Current Generation',
    2: 'Children',
    3: 'Grandchildren',
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="section-title">Family Members</h1>
          <p className="section-sub">{tree?.members.length ?? 0} people in your family tree</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/app/tree')} className="btn-secondary flex items-center gap-2 text-sm">
            <Users className="w-4 h-4" /> Tree view
          </button>
          <button onClick={() => navigate('/app/tree')} className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> Add Member
          </button>
        </div>
      </div>

      {Object.entries(membersByGen)
        .sort(([a], [b]) => parseInt(a) - parseInt(b))
        .map(([gen, members]) => (
          <div key={gen} className="mb-8">
            <h2 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <div className="flex-1 h-px bg-white/5" />
              {genLabels[parseInt(gen)] ?? `Generation ${gen}`}
              <div className="flex-1 h-px bg-white/5" />
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {members.map(m => {
                const docs = getMemberDocuments(m.id);
                const isLinked = !!m.linkedUserId;
                const isCurrentUser = m.linkedUserId === state.currentUser?.id;
                const age = m.birthDate
                  ? Math.floor((Date.now() - new Date(m.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
                  : null;

                return (
                  <button
                    key={m.id}
                    onClick={() => navigate(`/app/members/${m.id}`)}
                    className="glass-card p-5 text-left hover:border-white/20 transition-all group hover:-translate-y-0.5"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="relative">
                        <img
                          src={m.avatar ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.name}`}
                          alt=""
                          className="w-12 h-12 rounded-full bg-slate-700"
                        />
                        {isLinked && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 absolute -bottom-0.5 -right-0.5" fill="rgba(16, 185, 129, 0.2)" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors truncate">
                          {m.name} {isCurrentUser && <span className="text-indigo-400 text-xs">(you)</span>}
                        </p>
                        <p className="text-xs text-slate-400 capitalize">{m.relationship.replace('_', ' ')}</p>
                        {age !== null && (
                          <p className="text-xs text-slate-500">Age {age}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">{docs.length} record{docs.length !== 1 ? 's' : ''}</span>
                      {!isLinked && (
                        <span className="text-amber-400/70 flex items-center gap-1">
                          <Link2 className="w-3 h-3" /> Invite
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
    </div>
  );
}

export default function Members() {
  const { id } = useParams<{ id?: string }>();
  return id ? <MemberProfile /> : <MembersList />;
}
