import { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  FileText, Plus, Search, Filter, ChevronDown, X, Eye, EyeOff,
  MessageSquare, Lock, Users, User, Trash2, Edit3, Download, Calendar,
  Tag, Save, Send, Globe
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { MedicalDocument, DocType, Visibility, Comment } from '../types';

function generateId() { return Math.random().toString(36).slice(2, 11); }

const DOC_TYPES: { value: DocType; label: string; color: string }[] = [
  { value: 'lab_result', label: 'Lab Result', color: 'bg-blue-500/20 text-blue-300 border-blue-500/20' },
  { value: 'prescription', label: 'Prescription', color: 'bg-purple-500/20 text-purple-300 border-purple-500/20' },
  { value: 'diagnosis', label: 'Diagnosis', color: 'bg-red-500/20 text-red-300 border-red-500/20' },
  { value: 'imaging', label: 'Imaging', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/20' },
  { value: 'vaccination', label: 'Vaccination', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/20' },
  { value: 'surgery', label: 'Surgery', color: 'bg-orange-500/20 text-orange-300 border-orange-500/20' },
  { value: 'allergy', label: 'Allergy', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/20' },
  { value: 'note', label: 'Note', color: 'bg-slate-500/20 text-slate-300 border-slate-500/20' },
  { value: 'other', label: 'Other', color: 'bg-slate-500/20 text-slate-300 border-slate-500/20' },
];

const visibilityConfig = {
  private: { icon: Lock, label: 'Private', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
  family: { icon: Users, label: 'Family', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  custom: { icon: User, label: 'Custom', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  doctors: { icon: Globe, label: 'Doctors', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
};

function DocTypeTag({ type }: { type: DocType }) {
  const cfg = DOC_TYPES.find(d => d.value === type);
  if (!cfg) return null;
  return <span className={`tag border ${cfg.color}`}>{cfg.label}</span>;
}

interface AddDocModalProps {
  memberId: string;
  onClose: () => void;
  onAdd: (doc: Omit<MedicalDocument, 'id' | 'uploadedById' | 'createdAt' | 'comments'>) => void;
}

function AddDocModal({ memberId, onClose, onAdd }: AddDocModalProps) {
  const { state } = useApp();
  const [title, setTitle] = useState('');
  const [type, setType] = useState<DocType>('lab_result');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<Visibility>('family');
  const [tags, setTags] = useState('');
  const tree = state.tree!;

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) return;
    onAdd({
      memberId, title: title.trim(), type, date, content: content.trim(),
      visibility, tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      sharedWithMemberIds: [], sharedWithAccessorIds: [], fileType: 'note',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-card w-full max-w-lg p-6 animate-scale-in shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white">Add Medical Record</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="space-y-4">
          {/* Member */}
          <div>
            <label className="text-sm text-slate-300 font-medium mb-1.5 block">For member</label>
            <select
              className="input-field"
              value={memberId}
              disabled
              style={{ background: 'rgba(255,255,255,0.05)' }}
            >
              {tree.members.map(m => (
                <option key={m.id} value={m.id} style={{ background: '#1e293b' }}>{m.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-slate-300 font-medium mb-1.5 block">Title *</label>
            <input className="input-field" placeholder="e.g. Annual Blood Panel 2025" value={title} onChange={e => setTitle(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-slate-300 font-medium mb-1.5 block">Type</label>
              <select className="input-field" value={type} onChange={e => setType(e.target.value as DocType)} style={{ background: 'rgba(255,255,255,0.05)' }}>
                {DOC_TYPES.map(d => (
                  <option key={d.value} value={d.value} style={{ background: '#1e293b' }}>{d.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-300 font-medium mb-1.5 block">Date</label>
              <input className="input-field" type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-300 font-medium mb-1.5 block">Content / Notes *</label>
            <textarea
              className="input-field resize-none"
              rows={5}
              placeholder="Enter medical details, findings, notes..."
              value={content}
              onChange={e => setContent(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm text-slate-300 font-medium mb-1.5 block">Visibility</label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.entries(visibilityConfig) as [Visibility, typeof visibilityConfig[Visibility]][]).map(([v, cfg]) => {
                const Icon = cfg.icon;
                return (
                  <button
                    key={v}
                    onClick={() => setVisibility(v)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      visibility === v ? `${cfg.bg} ${cfg.color} border-current` : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    <Icon className="w-4 h-4 mx-auto mb-1" />
                    <p className="text-[10px] font-medium">{cfg.label}</p>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              {visibility === 'private' && 'Only you can see this record.'}
              {visibility === 'family' && 'All family members with access can see this.'}
              {visibility === 'custom' && 'You choose which family members can see this.'}
              {visibility === 'doctors' && 'Visible to invited doctors and caretakers.'}
            </p>
          </div>

          <div>
            <label className="text-sm text-slate-300 font-medium mb-1.5 block">Tags (comma separated)</label>
            <input className="input-field" placeholder="e.g. blood work, annual, cholesterol" value={tags} onChange={e => setTags(e.target.value)} />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleSubmit} disabled={!title.trim() || !content.trim()} className="btn-primary flex-1 flex items-center justify-center gap-2">
            <Save className="w-4 h-4" /> Save Record
          </button>
        </div>
      </div>
    </div>
  );
}

interface DocDetailProps {
  doc: MedicalDocument;
  onClose: () => void;
  onFilterByTag?: (tag: string) => void;
}

function DocDetail({ doc: initialDoc, onClose, onFilterByTag }: DocDetailProps) {
  const { state, dispatch, getMemberById } = useApp();
  const [commentText, setCommentText] = useState('');
  const user = state.currentUser!;

  // Always read the live document from state so comments appear immediately
  const doc = state.documents.find(d => d.id === initialDoc.id) ?? initialDoc;

  const member = getMemberById(doc.memberId);

  // Check if current user is accessor
  const myAccessor = state.tree?.accessors.find(a => a.userId === user.id);
  const canComment = true;

  const visInfo = visibilityConfig[doc.visibility];
  const VisIcon = visInfo.icon;

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    const comment: Comment = {
      id: 'comment-' + generateId(),
      authorId: user.id,
      authorName: myAccessor?.name ?? user.name,
      authorRole: myAccessor?.role ?? user.role,
      content: commentText.trim(),
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_COMMENT', docId: doc.id, comment });
    setCommentText('');
  };

  const handleDelete = () => {
    if (window.confirm('Delete this record?')) {
      dispatch({ type: 'DELETE_DOCUMENT', docId: doc.id });
      onClose();
    }
  };

  const cycleVisibility = () => {
    const order: Visibility[] = ['private', 'family', 'custom', 'doctors'];
    const next = order[(order.indexOf(doc.visibility) + 1) % order.length];
    dispatch({ type: 'UPDATE_DOCUMENT', doc: { ...doc, visibility: next } });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-card w-full sm:max-w-2xl p-0 animate-slide-up shadow-2xl sm:rounded-2xl rounded-t-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-white/5 flex-shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <DocTypeTag type={doc.type} />
                <button
                  onClick={cycleVisibility}
                  className={`tag border ${visInfo.bg} ${visInfo.color} cursor-pointer hover:opacity-80 transition-opacity`}
                >
                  <VisIcon className="w-3 h-3" /> {visInfo.label}
                </button>
                {doc.tags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => { onFilterByTag?.(tag); onClose(); }}
                    className="tag bg-slate-700/50 text-slate-300 border border-white/10 hover:bg-indigo-500/20 hover:text-indigo-300 hover:border-indigo-500/30 transition-colors"
                  >
                    <Tag className="w-2.5 h-2.5" /> {tag}
                  </button>
                ))}
              </div>
              <h2 className="text-lg font-bold text-white">{doc.title}</h2>
              <p className="text-sm text-slate-400 mt-1">
                {member?.name ?? 'Unknown'} · <Calendar className="inline w-3 h-3 mb-0.5" /> {doc.date}
              </p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white flex-shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="glass rounded-xl p-4">
            <pre className="text-sm text-slate-200 whitespace-pre-wrap font-sans leading-relaxed">{doc.content}</pre>
          </div>

          {/* Comments */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              Comments ({doc.comments.length})
            </h3>
            <div className="space-y-3 mb-4">
              {doc.comments.map(c => {
                const isDoctor = c.authorRole === 'doctor' || c.authorRole === 'caretaker';
                return (
                  <div key={c.id} className={`p-3 rounded-xl border ${isDoctor ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-white/5 border-white/5'}`}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isDoctor ? 'bg-indigo-500 text-white' : 'bg-slate-600 text-white'}`}>
                        {c.authorName[0]}
                      </span>
                      <span className="text-sm font-medium text-white">{c.authorName}</span>
                      {isDoctor && (
                        <span className="tag bg-indigo-500/20 text-indigo-300 border-indigo-500/20">
                          {c.authorRole === 'doctor' ? '🩺 Doctor' : '👤 Caretaker'}
                        </span>
                      )}
                      <span className="text-xs text-slate-500 ml-auto">{c.createdAt.split('T')[0]}</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">{c.content}</p>
                  </div>
                );
              })}
            </div>

            {canComment && (
              <div className="flex gap-2">
                <input
                  className="input-field flex-1 text-sm"
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleAddComment()}
                />
                <button onClick={handleAddComment} disabled={!commentText.trim()} className="btn-primary px-3 py-2">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-white/5 flex items-center justify-between flex-shrink-0">
          <button onClick={handleDelete} className="btn-danger text-sm py-2 flex items-center gap-2">
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
          <div className="flex gap-2">
            <button onClick={onClose} className="btn-secondary text-sm py-2">Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Documents() {
  const { state, dispatch, getMemberById } = useApp();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterMember, setFilterMember] = useState(searchParams.get('member') ?? 'all');
  const [filterType, setFilterType] = useState<DocType | 'all'>('all');
  const [filterVis, setFilterVis] = useState<Visibility | 'all'>('all');
  const [filterTag, setFilterTag] = useState(searchParams.get('tag') ?? '');
  const [showAdd, setShowAdd] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<MedicalDocument | null>(null);
  const [addForMember, setAddForMember] = useState('');

  const tree = state.tree;
  const user = state.currentUser!;

  // Clicking a tag on a card filters by that tag; clicking the same tag again clears it
  const handleTagClick = (tag: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFilterTag(prev => prev === tag ? '' : tag);
  };

  const filteredDocs = useMemo(() => {
    return state.documents.filter(doc => {
      if (filterMember !== 'all' && doc.memberId !== filterMember) return false;
      if (filterType !== 'all' && doc.type !== filterType) return false;
      if (filterVis !== 'all' && doc.visibility !== filterVis) return false;
      if (filterTag && !doc.tags.some(t => t.toLowerCase() === filterTag.toLowerCase())) return false;
      if (search) {
        const q = search.toLowerCase();
        return doc.title.toLowerCase().includes(q) || doc.content.toLowerCase().includes(q) || doc.tags.some(t => t.toLowerCase().includes(q));
      }
      return true;
    });
  }, [state.documents, filterMember, filterType, filterVis, filterTag, search]);

  const handleAddDoc = (docData: Omit<MedicalDocument, 'id' | 'uploadedById' | 'createdAt' | 'comments'>) => {
    const newDoc: MedicalDocument = {
      ...docData,
      id: 'doc-' + generateId(),
      uploadedById: user.id,
      createdAt: new Date().toISOString(),
      comments: [],
    };
    dispatch({ type: 'ADD_DOCUMENT', doc: newDoc });
  };

  const openAdd = (memberId?: string) => {
    setAddForMember(memberId ?? (filterMember !== 'all' ? filterMember : tree?.members[0]?.id ?? ''));
    setShowAdd(true);
  };

  const defaultMemberId = tree?.members[0]?.id ?? '';

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="section-title">Medical Records</h1>
          <p className="section-sub">{state.documents.length} records across your family</p>
        </div>
        <button onClick={() => openAdd()} className="btn-primary flex items-center gap-2 text-sm flex-shrink-0">
          <Plus className="w-4 h-4" /> Add Record
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 mb-5 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="input-field pl-10 py-2 text-sm"
            placeholder="Search records..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <select
          className="input-field w-auto py-2 text-sm"
          value={filterMember}
          onChange={e => setFilterMember(e.target.value)}
          style={{ background: 'rgba(255,255,255,0.05)' }}
        >
          <option value="all" style={{ background: '#1e293b' }}>All members</option>
          {tree?.members.map(m => (
            <option key={m.id} value={m.id} style={{ background: '#1e293b' }}>{m.name}</option>
          ))}
        </select>

        <select
          className="input-field w-auto py-2 text-sm"
          value={filterType}
          onChange={e => setFilterType(e.target.value as DocType | 'all')}
          style={{ background: 'rgba(255,255,255,0.05)' }}
        >
          <option value="all" style={{ background: '#1e293b' }}>All types</option>
          {DOC_TYPES.map(d => (
            <option key={d.value} value={d.value} style={{ background: '#1e293b' }}>{d.label}</option>
          ))}
        </select>

        <select
          className="input-field w-auto py-2 text-sm"
          value={filterVis}
          onChange={e => setFilterVis(e.target.value as Visibility | 'all')}
          style={{ background: 'rgba(255,255,255,0.05)' }}
        >
          <option value="all" style={{ background: '#1e293b' }}>All visibility</option>
          {(Object.entries(visibilityConfig) as [Visibility, any][]).map(([v, cfg]) => (
            <option key={v} value={v} style={{ background: '#1e293b' }}>{cfg.label}</option>
          ))}
        </select>

        {/* Active tag filter chip */}
        {filterTag && (
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-sm font-medium">
            <Tag className="w-3.5 h-3.5" />
            {filterTag}
            <button
              onClick={() => setFilterTag('')}
              className="ml-1 text-indigo-400 hover:text-white transition-colors"
              aria-label="Clear tag filter"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Records list */}
      {filteredDocs.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <FileText className="w-12 h-12 mx-auto mb-3 text-slate-600" />
          <p className="text-slate-400 font-medium">No records found</p>
          <p className="text-slate-500 text-sm mt-1 mb-4">
            {search || filterMember !== 'all' || filterType !== 'all' ? 'Try adjusting your filters' : 'Add your first medical record'}
          </p>
          <button onClick={() => openAdd()} className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Record
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredDocs.map(doc => {
            const member = getMemberById(doc.memberId);
            const visInfo = visibilityConfig[doc.visibility];
            const VisIcon = visInfo.icon;

            return (
              <button
                key={doc.id}
                onClick={() => setSelectedDoc(doc)}
                className="glass-card p-4 text-left hover:border-white/20 transition-all duration-200 group hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <DocTypeTag type={doc.type} />
                    <span className={`tag border ${visInfo.bg} ${visInfo.color}`}>
                      <VisIcon className="w-3 h-3" /> {visInfo.label}
                    </span>
                  </div>
                  {doc.comments.length > 0 && (
                    <div className="flex items-center gap-1 text-slate-400 text-xs flex-shrink-0">
                      <MessageSquare className="w-3 h-3" /> {doc.comments.length}
                    </div>
                  )}
                </div>

                <h3 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors mb-1 leading-snug">
                  {doc.title}
                </h3>

                <p className="text-xs text-slate-500 mb-2">
                  {member?.name ?? 'Unknown'} · {doc.date}
                </p>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {doc.content}
                </p>

                {doc.tags.length > 0 && (
                  <div className="flex gap-1 flex-wrap mt-2.5">
                    {doc.tags.slice(0, 3).map(tag => (
                      <button
                        key={tag}
                        onClick={e => handleTagClick(tag, e)}
                        className={`text-[10px] px-1.5 py-0.5 rounded-md transition-colors ${
                          filterTag === tag
                            ? 'bg-indigo-500/30 text-indigo-300 ring-1 ring-indigo-500/50'
                            : 'bg-slate-800 text-slate-400 hover:bg-indigo-500/20 hover:text-indigo-300'
                        }`}
                      >
                        # {tag}
                      </button>
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Add member quick buttons */}
      {tree && (
        <div className="mt-6 glass-card p-4">
          <p className="text-xs font-medium text-slate-400 mb-3">Add record for specific member</p>
          <div className="flex flex-wrap gap-2">
            {tree.members.map(m => (
              <button
                key={m.id}
                onClick={() => openAdd(m.id)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all text-sm"
              >
                <img src={m.avatar ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.name}`} alt="" className="w-5 h-5 rounded-full" />
                <span className="text-slate-300">{m.name}</span>
                <Plus className="w-3 h-3 text-slate-500" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {showAdd && (
        <AddDocModal
          memberId={addForMember || defaultMemberId}
          onClose={() => setShowAdd(false)}
          onAdd={handleAddDoc}
        />
      )}

      {selectedDoc && (
        <DocDetail
          doc={selectedDoc}
          onClose={() => setSelectedDoc(null)}
          onFilterByTag={tag => { setFilterTag(tag); setSelectedDoc(null); }}
        />
      )}
    </div>
  );
}
