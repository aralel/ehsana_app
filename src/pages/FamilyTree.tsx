import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, ZoomIn, ZoomOut, Maximize2, Users, CheckCircle2,
  FileText, Link2, UserPlus, X, ChevronDown, Save
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { FamilyMember, RelationshipType, Gender } from '../types';

function generateId() { return Math.random().toString(36).slice(2, 11); }

const genderColors = {
  male: { bg: 'from-blue-500/30 to-blue-700/20', border: 'border-blue-500/40', text: 'text-blue-200' },
  female: { bg: 'from-pink-500/30 to-pink-700/20', border: 'border-pink-500/40', text: 'text-pink-200' },
  other: { bg: 'from-purple-500/30 to-purple-700/20', border: 'border-purple-500/40', text: 'text-purple-200' },
};

interface TreeNode {
  member: FamilyMember;
  x: number;
  y: number;
  generation: number;
}

function buildTreeLayout(members: FamilyMember[]): TreeNode[] {
  const byGen: Record<number, FamilyMember[]> = {};
  members.forEach(m => {
    const g = m.generation;
    if (!byGen[g]) byGen[g] = [];
    byGen[g].push(m);
  });

  const nodes: TreeNode[] = [];
  const CARD_W = 140;
  const CARD_H = 100;
  const H_GAP = 30;
  const V_GAP = 80;

  Object.entries(byGen).forEach(([gen, mems]) => {
    const g = parseInt(gen);
    const totalW = mems.length * CARD_W + (mems.length - 1) * H_GAP;
    mems.forEach((m, i) => {
      nodes.push({
        member: m,
        x: i * (CARD_W + H_GAP) - totalW / 2 + CARD_W / 2,
        y: g * (CARD_H + V_GAP),
        generation: g,
      });
    });
  });
  return nodes;
}

interface AddMemberModalProps {
  onClose: () => void;
  onAdd: (member: Omit<FamilyMember, 'id' | 'addedById'>) => void;
}

function AddMemberModal({ onClose, onAdd }: AddMemberModalProps) {
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState<RelationshipType>('parent');
  const [gender, setGender] = useState<Gender>('other');
  const [birthDate, setBirthDate] = useState('');
  const [notes, setNotes] = useState('');
  const { state } = useApp();
  const tree = state.tree!;

  const genMap: Record<RelationshipType, number> = {
    grandparent: -1, parent: 0, self: 0, sibling: 0, spouse: 0,
    child: 2, grandchild: 3, aunt_uncle: 0, cousin: 0, other: 0
  };

  const myMember = tree.members.find(m => m.linkedUserId === state.currentUser?.id);
  const myGen = myMember?.generation ?? 1;

  const getGeneration = (rel: RelationshipType): number => {
    if (rel === 'parent' || rel === 'grandparent') return myGen - 1;
    if (rel === 'child' || rel === 'grandchild') return myGen + 1;
    return myGen;
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    onAdd({
      name: name.trim(), relationship, gender,
      birthDate: birthDate || undefined, notes: notes || undefined,
      parentIds: [], childrenIds: [], isAlive: true,
      generation: getGeneration(relationship),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.trim().replace(/\s/g, '')}`,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-card w-full max-w-md p-6 animate-scale-in shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white">Add Family Member</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-300 font-medium mb-1.5 block">Full name *</label>
            <input className="input-field" placeholder="e.g. John Smith" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-slate-300 font-medium mb-1.5 block">Relationship</label>
              <select
                className="input-field"
                value={relationship}
                onChange={e => setRelationship(e.target.value as RelationshipType)}
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                {(['parent', 'child', 'sibling', 'spouse', 'grandparent', 'grandchild', 'aunt_uncle', 'cousin', 'other'] as RelationshipType[]).map(r => (
                  <option key={r} value={r} style={{ background: '#1e293b' }}>{r.replace('_', ' / ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-300 font-medium mb-1.5 block">Gender</label>
              <select
                className="input-field"
                value={gender}
                onChange={e => setGender(e.target.value as Gender)}
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
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
            <textarea className="input-field resize-none" rows={2} placeholder="Any additional notes..." value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleSubmit} disabled={!name.trim()} className="btn-primary flex-1">Add Member</button>
        </div>
      </div>
    </div>
  );
}

export default function FamilyTreePage() {
  const { state, dispatch, getMemberDocuments } = useApp();
  const navigate = useNavigate();
  const svgRef = useRef<SVGSVGElement>(null);
  const [zoom, setZoom] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const tree = state.tree;

  if (!tree) return (
    <div className="flex items-center justify-center h-64 text-slate-400">No family tree found.</div>
  );

  const nodes = buildTreeLayout(tree.members);
  const CARD_W = 140;
  const CARD_H = 100;

  // SVG viewBox dimensions
  const allX = nodes.map(n => n.x);
  const allY = nodes.map(n => n.y);
  const minX = Math.min(...allX) - CARD_W;
  const minY = Math.min(...allY) - 40;
  const maxX = Math.max(...allX) + CARD_W;
  const maxY = Math.max(...allY) + CARD_H + 40;
  const vbW = maxX - minX;
  const vbH = maxY - minY;

  // Build connections
  const connections: { x1: number; y1: number; x2: number; y2: number; type: 'parent' | 'spouse' }[] = [];

  tree.members.forEach(m => {
    const mNode = nodes.find(n => n.member.id === m.id);
    if (!mNode) return;

    // Parent → child connections
    m.childrenIds.forEach(cid => {
      const cNode = nodes.find(n => n.member.id === cid);
      if (cNode) {
        connections.push({
          x1: mNode.x,
          y1: mNode.y + CARD_H,
          x2: cNode.x,
          y2: cNode.y,
          type: 'parent'
        });
      }
    });

    // Spouse connections (only one direction)
    if (m.spouseId && m.id < m.spouseId) {
      const sNode = nodes.find(n => n.member.id === m.spouseId);
      if (sNode) {
        connections.push({
          x1: mNode.x + CARD_W / 2,
          y1: mNode.y + CARD_H / 2,
          x2: sNode.x - CARD_W / 2,
          y2: sNode.y + CARD_H / 2,
          type: 'spouse'
        });
      }
    }
  });

  const handleAddMember = (memberData: Omit<FamilyMember, 'id' | 'addedById'>) => {
    const newMember: FamilyMember = {
      ...memberData,
      id: 'member-' + generateId(),
      addedById: state.currentUser!.id,
    };
    dispatch({ type: 'ADD_MEMBER', member: newMember });
    dispatch({
      type: 'ADD_NOTIFICATION',
      notification: {
        id: 'notif-' + generateId(),
        type: 'info',
        title: 'Member added',
        message: `${newMember.name} has been added to your family tree`,
        read: false,
        createdAt: new Date().toISOString(),
      }
    });
  };

  const selectedNode = selectedId ? nodes.find(n => n.member.id === selectedId) : null;
  const selectedMember = selectedNode?.member;
  const selectedDocs = selectedMember ? getMemberDocuments(selectedMember.id) : [];

  return (
    <div className="flex flex-col h-full animate-fade-in" style={{ height: 'calc(100vh - 120px)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h1 className="section-title">{tree.name}</h1>
          <p className="section-sub">{tree.members.length} members across {Math.max(...tree.members.map(m => m.generation)) - Math.min(...tree.members.map(m => m.generation)) + 1} generations</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setZoom(z => Math.max(0.4, z - 0.15))} className="btn-secondary p-2">
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-slate-400 text-sm w-12 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.min(2, z + 0.15))} className="btn-secondary p-2">
            <ZoomIn className="w-4 h-4" />
          </button>
          <button onClick={() => setZoom(1)} className="btn-secondary p-2">
            <Maximize2 className="w-4 h-4" />
          </button>
          <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2 text-sm">
            <UserPlus className="w-4 h-4" /> Add Member
          </button>
        </div>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Tree canvas */}
        <div className="flex-1 glass-card overflow-hidden relative">
          <svg
            ref={svgRef}
            viewBox={`${minX} ${minY} ${vbW} ${vbH}`}
            style={{ width: '100%', height: '100%', transform: `scale(${zoom})`, transformOrigin: 'center' }}
            className="transition-transform duration-200"
          >
            {/* Connections */}
            <defs>
              <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                <path d="M0,0 L0,6 L6,3 z" fill="rgba(99,102,241,0.5)" />
              </marker>
            </defs>

            {connections.map((c, i) => {
              if (c.type === 'parent') {
                const midY = (c.y1 + c.y2) / 2;
                return (
                  <path
                    key={i}
                    d={`M ${c.x1} ${c.y1} C ${c.x1} ${midY}, ${c.x2} ${midY}, ${c.x2} ${c.y2}`}
                    stroke="rgba(99,102,241,0.35)"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray="0"
                  />
                );
              } else {
                return (
                  <line
                    key={i}
                    x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2}
                    stroke="rgba(236,72,153,0.35)"
                    strokeWidth="1.5"
                    strokeDasharray="5,3"
                  />
                );
              }
            })}

            {/* Member nodes */}
            {nodes.map(({ member: m, x, y }) => {
              const cols = genderColors[m.gender] ?? genderColors.other;
              const docCount = getMemberDocuments(m.id).length;
              const isSelected = selectedId === m.id;
              const isHovered = hoveredId === m.id;
              const isLinked = !!m.linkedUserId;

              return (
                <g
                  key={m.id}
                  transform={`translate(${x - CARD_W / 2}, ${y})`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedId(selectedId === m.id ? null : m.id)}
                  onMouseEnter={() => setHoveredId(m.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {/* Card shadow */}
                  <rect
                    x="-2" y="2" width={CARD_W + 4} height={CARD_H + 4}
                    rx="14"
                    fill="rgba(0,0,0,0.3)"
                    style={{ filter: 'blur(4px)' }}
                  />
                  {/* Card background */}
                  <rect
                    x="0" y="0" width={CARD_W} height={CARD_H}
                    rx="12"
                    fill={isSelected ? 'rgba(99,102,241,0.25)' : isHovered ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.05)'}
                    stroke={isSelected ? 'rgba(99,102,241,0.8)' : isHovered ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)'}
                    strokeWidth={isSelected ? 2 : 1}
                  />

                  {/* Avatar */}
                  <clipPath id={`clip-${m.id}`}>
                    <circle cx={CARD_W / 2} cy="28" r="18" />
                  </clipPath>
                  <circle cx={CARD_W / 2} cy="28" r="20" fill="rgba(255,255,255,0.1)" />
                  <image
                    href={m.avatar ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.name}`}
                    x={CARD_W / 2 - 18}
                    y={10}
                    width="36"
                    height="36"
                    clipPath={`url(#clip-${m.id})`}
                  />

                  {/* Linked badge */}
                  {isLinked && (
                    <circle cx={CARD_W / 2 + 14} cy="12" r="6" fill="#10b981" />
                  )}

                  {/* Name */}
                  <text
                    x={CARD_W / 2} y="62"
                    textAnchor="middle"
                    fill="white"
                    fontSize="11"
                    fontWeight="600"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {m.name.split(' ')[0]}
                  </text>
                  <text
                    x={CARD_W / 2} y="75"
                    textAnchor="middle"
                    fill="rgba(148,163,184,0.8)"
                    fontSize="10"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {m.name.split(' ').slice(1).join(' ')}
                  </text>

                  {/* Relationship */}
                  <text
                    x={CARD_W / 2} y="89"
                    textAnchor="middle"
                    fill="rgba(99,102,241,0.8)"
                    fontSize="9"
                    fontWeight="500"
                    style={{ fontFamily: 'Inter, sans-serif', textTransform: 'capitalize' }}
                  >
                    {m.relationship.replace('_', ' ')}
                  </text>

                  {/* Doc count badge */}
                  {docCount > 0 && (
                    <g transform={`translate(${CARD_W - 22}, 4)`}>
                      <rect x="0" y="0" width="18" height="14" rx="7" fill="rgba(99,102,241,0.8)" />
                      <text x="9" y="10" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {docCount}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Legend */}
          <div className="absolute bottom-3 left-3 flex items-center gap-4 glass rounded-xl p-2.5">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <div className="w-4 h-0.5 bg-indigo-400/50" />Parent / child
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <div className="w-4 h-0.5 bg-pink-400/50 border-dashed border-b border-pink-400/50" style={{ background: 'none', borderBottom: '2px dashed rgba(236,72,153,0.5)' }} />Spouse
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />Has account
            </div>
          </div>
        </div>

        {/* Side panel — selected member */}
        {selectedMember && (
          <div className="w-72 flex-shrink-0 glass-card p-5 overflow-y-auto animate-slide-in">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <img
                  src={selectedMember.avatar ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedMember.name}`}
                  alt=""
                  className="w-12 h-12 rounded-full bg-slate-700"
                />
                <div>
                  <p className="font-semibold text-white">{selectedMember.name}</p>
                  <p className="text-xs text-slate-400 capitalize">{selectedMember.relationship.replace('_', ' ')}</p>
                </div>
              </div>
              <button onClick={() => setSelectedId(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedMember.birthDate && (
              <div className="glass rounded-xl p-3 mb-3">
                <p className="text-xs text-slate-400">Date of birth</p>
                <p className="text-sm text-white font-medium">{selectedMember.birthDate}</p>
              </div>
            )}

            {selectedMember.linkedUserId ? (
              <div className="flex items-center gap-2 mb-4 p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-emerald-300 font-medium">Linked account</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-4 p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20">
                <Link2 className="w-4 h-4 text-amber-400" />
                <div className="flex-1">
                  <span className="text-xs text-amber-300 font-medium">No account linked</span>
                  <button
                    onClick={() => navigate('/app/sharing')}
                    className="block text-[10px] text-amber-400/70 hover:text-amber-300 mt-0.5"
                  >
                    Send invitation →
                  </button>
                </div>
              </div>
            )}

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-slate-300">Medical Records ({selectedDocs.length})</p>
                <button
                  onClick={() => navigate(`/app/documents?member=${selectedMember.id}`)}
                  className="text-[10px] text-indigo-400 hover:text-indigo-300"
                >
                  View all
                </button>
              </div>
              {selectedDocs.length === 0 ? (
                <p className="text-xs text-slate-500 py-2">No records yet</p>
              ) : (
                <div className="space-y-1.5">
                  {selectedDocs.slice(0, 4).map(doc => (
                    <div key={doc.id} className="flex items-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/8 transition-colors">
                      <FileText className="w-3 h-3 text-slate-400 flex-shrink-0" />
                      <p className="text-xs text-slate-300 truncate flex-1">{doc.title}</p>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                        doc.visibility === 'private' ? 'bg-red-500/20 text-red-300' :
                        doc.visibility === 'family' ? 'bg-green-500/20 text-green-300' :
                        'bg-yellow-500/20 text-yellow-300'
                      }`}>
                        {doc.visibility}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => navigate(`/app/members/${selectedMember.id}`)}
                className="btn-primary text-sm py-2"
              >
                View full profile
              </button>
              <button
                onClick={() => navigate(`/app/documents?member=${selectedMember.id}`)}
                className="btn-secondary text-sm py-2 flex items-center justify-center gap-2"
              >
                <Plus className="w-3.5 h-3.5" /> Add record
              </button>
            </div>
          </div>
        )}
      </div>

      {showAddModal && (
        <AddMemberModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddMember}
        />
      )}
    </div>
  );
}
