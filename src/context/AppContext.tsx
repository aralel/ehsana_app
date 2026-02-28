import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { AppState, User, FamilyTree, FamilyMember, MedicalDocument, Invitation, Accessor, Notification, NotifPrefs, Visibility } from '../types';

// ─── Seed Data ────────────────────────────────────────────────────────────────

const SEED_USER_ID = 'user-1';
const SEED_TREE_ID = 'tree-1';

const seedMembers: FamilyMember[] = [
  {
    id: 'member-1', linkedUserId: 'user-1', name: 'Alex Johnson', relationship: 'self',
    birthDate: '1988-04-15', gender: 'male', parentIds: ['member-3', 'member-4'],
    childrenIds: ['member-5'], spouseId: 'member-2', isAlive: true, addedById: 'user-1', generation: 1,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex'
  },
  {
    id: 'member-2', linkedUserId: undefined, name: 'Sarah Johnson', relationship: 'spouse',
    birthDate: '1990-07-22', gender: 'female', parentIds: [], childrenIds: ['member-5'],
    spouseId: 'member-1', isAlive: true, addedById: 'user-1', generation: 1,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
  },
  {
    id: 'member-3', linkedUserId: 'user-3', name: 'Robert Johnson', relationship: 'parent',
    birthDate: '1960-11-03', gender: 'male', parentIds: [], childrenIds: ['member-1'],
    spouseId: 'member-4', isAlive: true, addedById: 'user-1', generation: 0,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Robert'
  },
  {
    id: 'member-4', linkedUserId: undefined, name: 'Mary Johnson', relationship: 'parent',
    birthDate: '1963-02-28', gender: 'female', parentIds: [], childrenIds: ['member-1'],
    spouseId: 'member-3', isAlive: true, addedById: 'user-1', generation: 0,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mary'
  },
  {
    id: 'member-5', linkedUserId: undefined, name: 'Emma Johnson', relationship: 'child',
    birthDate: '2015-09-10', gender: 'female', parentIds: ['member-1', 'member-2'],
    childrenIds: [], isAlive: true, addedById: 'user-1', generation: 2,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma'
  },
];

const seedDocuments: MedicalDocument[] = [
  {
    id: 'doc-1', memberId: 'member-1', title: 'Annual Blood Panel 2024',
    type: 'lab_result', date: '2024-03-15', content: 'Complete blood count (CBC): All values within normal range.\nCholesterol: LDL 112 mg/dL, HDL 58 mg/dL, Total 182 mg/dL.\nBlood glucose: 94 mg/dL (fasting).\nThyroid function: TSH 2.1 mIU/L (normal).',
    tags: ['blood work', 'annual', 'cholesterol'], visibility: 'family', sharedWithMemberIds: [],
    sharedWithAccessorIds: [], comments: [], uploadedById: 'user-1', createdAt: '2024-03-15', fileType: 'pdf'
  },
  {
    id: 'doc-2', memberId: 'member-3', title: 'Hypertension Diagnosis',
    type: 'diagnosis', date: '2023-08-10', content: 'Diagnosed with Stage 1 Hypertension (140/90 mmHg). Prescribed Lisinopril 10mg daily. Recommended lifestyle changes: reduce sodium intake, increase physical activity, monitor BP daily.',
    tags: ['hypertension', 'cardiology', 'chronic'], visibility: 'family', sharedWithMemberIds: ['member-1'],
    sharedWithAccessorIds: ['accessor-1'], comments: [
      { id: 'comment-1', authorId: 'accessor-1', authorName: 'Dr. Emily Chen', authorRole: 'doctor', content: 'Patient is responding well to Lisinopril. Consider adding DASH diet guidelines. Follow up in 3 months.', createdAt: '2023-09-01' }
    ], uploadedById: 'user-3', createdAt: '2023-08-10', fileType: 'pdf'
  },
  {
    id: 'doc-3', memberId: 'member-3', title: 'Lisinopril Prescription',
    type: 'prescription', date: '2023-08-10', content: 'Lisinopril 10mg — Take one tablet orally once daily. Refills: 6. Prescribing physician: Dr. Emily Chen, Cardiology.',
    tags: ['medication', 'blood pressure'], visibility: 'custom', sharedWithMemberIds: ['member-1'],
    sharedWithAccessorIds: ['accessor-1'], comments: [], uploadedById: 'user-3', createdAt: '2023-08-10', fileType: 'pdf'
  },
  {
    id: 'doc-4', memberId: 'member-5', title: 'Childhood Vaccination Record',
    type: 'vaccination', date: '2023-11-20', content: 'MMR (Measles, Mumps, Rubella) — Dose 2: Complete\nDTaP (Diphtheria, Tetanus, Pertussis): Complete\nIPV (Polio): Complete\nVaricella: Complete\nHepB: Complete series\nNext scheduled: Flu vaccine - Annual',
    tags: ['vaccines', 'pediatric'], visibility: 'family', sharedWithMemberIds: [],
    sharedWithAccessorIds: [], comments: [], uploadedById: 'user-1', createdAt: '2023-11-20', fileType: 'image'
  },
  {
    id: 'doc-5', memberId: 'member-1', title: 'Appendectomy — 2019',
    type: 'surgery', date: '2019-06-03', content: 'Laparoscopic appendectomy performed at Memorial Hospital. Procedure was uncomplicated. Recovery: standard 2-week. No complications. Pathology: acute appendicitis without perforation.',
    tags: ['surgery', 'appendix', 'historical'], visibility: 'private', sharedWithMemberIds: [],
    sharedWithAccessorIds: [], comments: [], uploadedById: 'user-1', createdAt: '2024-01-10', fileType: 'pdf'
  },
];

const seedTree: FamilyTree = {
  id: SEED_TREE_ID,
  name: "Johnson Family Health",
  ownerId: SEED_USER_ID,
  members: seedMembers,
  accessors: [
    {
      id: 'accessor-1', userId: 'doctor-user-1', name: 'Dr. Emily Chen', email: 'dr.chen@hospital.com',
      role: 'doctor', specialty: 'Cardiology', accessibleMemberIds: ['member-3'],
      invitedById: 'user-1', addedAt: '2023-09-01'
    }
  ],
  invitations: [],
  createdAt: '2024-01-01',
  mergedTreeIds: [],
};

const seedUsers: User[] = [
  { id: 'user-1', name: 'Alex Johnson', email: 'alex@example.com', role: 'owner', createdAt: '2024-01-01', treeId: SEED_TREE_ID, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex' },
  { id: 'user-3', name: 'Robert Johnson', email: 'robert@example.com', role: 'family', createdAt: '2024-01-05', treeId: SEED_TREE_ID, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Robert' },
];

const initialSeedState: AppState = {
  currentUser: null,
  tree: seedTree,
  documents: seedDocuments,
  users: seedUsers,
  allTrees: [seedTree],
  activeView: 'dashboard',
  selectedMemberId: null,
  notifications: [
    { id: 'notif-1', type: 'invite', title: 'Invitation pending', message: 'Robert Johnson has a pending invitation to join your family tree', read: false, createdAt: '2024-12-01' },
    { id: 'notif-2', type: 'comment', title: 'New comment', message: 'Dr. Emily Chen commented on Robert\'s Hypertension Diagnosis', read: false, createdAt: '2024-12-10' },
  ],
  notifPrefs: { invites: true, comments: true, merges: true },
  defaultDocVisibility: 'family',
};

// ─── Actions ──────────────────────────────────────────────────────────────────

type Action =
  | { type: 'LOGIN'; user: User }
  | { type: 'LOGOUT' }
  | { type: 'SIGNUP'; user: User; tree: FamilyTree }
  | { type: 'SET_VIEW'; view: string }
  | { type: 'SELECT_MEMBER'; memberId: string | null }
  | { type: 'ADD_MEMBER'; member: FamilyMember }
  | { type: 'UPDATE_MEMBER'; member: FamilyMember }
  | { type: 'REMOVE_MEMBER'; memberId: string }
  | { type: 'ADD_DOCUMENT'; doc: MedicalDocument }
  | { type: 'UPDATE_DOCUMENT'; doc: MedicalDocument }
  | { type: 'DELETE_DOCUMENT'; docId: string }
  | { type: 'ADD_COMMENT'; docId: string; comment: import('../types').Comment }
  | { type: 'SEND_INVITATION'; invitation: Invitation }
  | { type: 'ACCEPT_INVITATION'; invitationId: string }
  | { type: 'DECLINE_INVITATION'; invitationId: string }
  | { type: 'ADD_ACCESSOR'; accessor: Accessor }
  | { type: 'REMOVE_ACCESSOR'; accessorId: string }
  | { type: 'MARK_NOTIFICATION_READ'; notifId: string }
  | { type: 'MARK_ALL_NOTIFICATIONS_READ' }
  | { type: 'ADD_NOTIFICATION'; notification: Notification }
  | { type: 'MERGE_TREE'; targetTreeId: string }
  | { type: 'LINK_MEMBER_USER'; memberId: string; userId: string }
  | { type: 'UPDATE_USER'; name: string; email: string }
  | { type: 'UPDATE_TREE_NAME'; name: string }
  | { type: 'UPDATE_NOTIF_PREFS'; prefs: NotifPrefs }
  | { type: 'UPDATE_DEFAULT_VISIBILITY'; visibility: Visibility };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, currentUser: action.user };

    case 'LOGOUT':
      return { ...state, currentUser: null, activeView: 'dashboard' };

    case 'SIGNUP': {
      const newUsers = [...state.users, action.user];
      const newTrees = [...state.allTrees, action.tree];
      return { ...state, currentUser: action.user, users: newUsers, tree: action.tree, allTrees: newTrees };
    }

    case 'SET_VIEW':
      return { ...state, activeView: action.view };

    case 'SELECT_MEMBER':
      return { ...state, selectedMemberId: action.memberId };

    case 'ADD_MEMBER': {
      const updatedTree = { ...state.tree!, members: [...state.tree!.members, action.member] };
      return { ...state, tree: updatedTree };
    }

    case 'UPDATE_MEMBER': {
      const updatedTree = {
        ...state.tree!,
        members: state.tree!.members.map(m => m.id === action.member.id ? action.member : m)
      };
      return { ...state, tree: updatedTree };
    }

    case 'REMOVE_MEMBER': {
      const updatedTree = {
        ...state.tree!,
        members: state.tree!.members.filter(m => m.id !== action.memberId)
      };
      const updatedDocs = state.documents.filter(d => d.memberId !== action.memberId);
      return { ...state, tree: updatedTree, documents: updatedDocs };
    }

    case 'ADD_DOCUMENT':
      return { ...state, documents: [...state.documents, action.doc] };

    case 'UPDATE_DOCUMENT':
      return { ...state, documents: state.documents.map(d => d.id === action.doc.id ? action.doc : d) };

    case 'DELETE_DOCUMENT':
      return { ...state, documents: state.documents.filter(d => d.id !== action.docId) };

    case 'ADD_COMMENT':
      return {
        ...state,
        documents: state.documents.map(d =>
          d.id === action.docId ? { ...d, comments: [...d.comments, action.comment] } : d
        )
      };

    case 'SEND_INVITATION': {
      const updatedTree = { ...state.tree!, invitations: [...state.tree!.invitations, action.invitation] };
      return { ...state, tree: updatedTree };
    }

    case 'ACCEPT_INVITATION': {
      const updatedTree = {
        ...state.tree!,
        invitations: state.tree!.invitations.map(i =>
          i.id === action.invitationId ? { ...i, status: 'accepted' as const } : i
        )
      };
      return { ...state, tree: updatedTree };
    }

    case 'DECLINE_INVITATION': {
      const updatedTree = {
        ...state.tree!,
        invitations: state.tree!.invitations.map(i =>
          i.id === action.invitationId ? { ...i, status: 'declined' as const } : i
        )
      };
      return { ...state, tree: updatedTree };
    }

    case 'ADD_ACCESSOR': {
      const updatedTree = { ...state.tree!, accessors: [...state.tree!.accessors, action.accessor] };
      return { ...state, tree: updatedTree };
    }

    case 'REMOVE_ACCESSOR': {
      const updatedTree = {
        ...state.tree!,
        accessors: state.tree!.accessors.filter(a => a.id !== action.accessorId)
      };
      return { ...state, tree: updatedTree };
    }

    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.notifId ? { ...n, read: true } : n
        )
      };

    case 'MARK_ALL_NOTIFICATIONS_READ':
      return { ...state, notifications: state.notifications.map(n => ({ ...n, read: true })) };

    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.notification, ...state.notifications] };

    case 'LINK_MEMBER_USER': {
      const updatedTree = {
        ...state.tree!,
        members: state.tree!.members.map(m =>
          m.id === action.memberId ? { ...m, linkedUserId: action.userId } : m
        )
      };
      return { ...state, tree: updatedTree };
    }

    case 'UPDATE_USER': {
      if (!state.currentUser) return state;
      const updated = { ...state.currentUser, name: action.name, email: action.email };
      // Also update the avatar seed when name changes
      if (action.name !== state.currentUser.name) {
        updated.avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${action.name.replace(/\s+/g, '')}`;
      }
      const updatedUsers = state.users.map(u => u.id === updated.id ? updated : u);
      // Also update the linked family member name
      const updatedTree = state.tree ? {
        ...state.tree,
        members: state.tree.members.map(m =>
          m.linkedUserId === updated.id ? { ...m, name: action.name, avatar: updated.avatar } : m
        )
      } : state.tree;
      return { ...state, currentUser: updated, users: updatedUsers, tree: updatedTree };
    }

    case 'UPDATE_TREE_NAME': {
      if (!state.tree) return state;
      const updatedTree = { ...state.tree, name: action.name };
      return { ...state, tree: updatedTree };
    }

    case 'UPDATE_NOTIF_PREFS':
      return { ...state, notifPrefs: action.prefs };

    case 'UPDATE_DEFAULT_VISIBILITY':
      return { ...state, defaultDocVisibility: action.visibility };

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  getMemberDocuments: (memberId: string) => MedicalDocument[];
  canViewDocument: (doc: MedicalDocument) => boolean;
  getMemberById: (id: string) => FamilyMember | undefined;
  getUserById: (id: string) => User | undefined;
  getAccessorById: (id: string) => Accessor | undefined;
  getMembersForAccessor: (accessorId: string) => FamilyMember[];
  unreadNotificationCount: number;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY = 'ehsana_state';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, (() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AppState;
        // Migration: fill missing fields added after initial release
        return {
          ...parsed,
          notifPrefs: parsed.notifPrefs ?? { invites: true, comments: true, merges: true },
          defaultDocVisibility: parsed.defaultDocVisibility ?? 'family',
        };
      }
    } catch { /* ignore */ }
    return initialSeedState;
  })());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const getMemberDocuments = (memberId: string) =>
    state.documents.filter(d => d.memberId === memberId);

  const canViewDocument = (doc: MedicalDocument): boolean => {
    if (!state.currentUser) return false;
    if (state.currentUser.id === doc.uploadedById) return true;
    const myMember = state.tree?.members.find(m => m.linkedUserId === state.currentUser!.id);
    if (!myMember) return false;
    if (doc.visibility === 'family') return true;
    if (doc.visibility === 'custom') {
      return doc.sharedWithMemberIds.includes(myMember.id);
    }
    if (doc.visibility === 'private') return myMember.id === doc.memberId;
    return false;
  };

  const getMemberById = (id: string) => state.tree?.members.find(m => m.id === id);
  const getUserById = (id: string) => state.users.find(u => u.id === id);
  const getAccessorById = (id: string) => state.tree?.accessors.find(a => a.id === id);

  const getMembersForAccessor = (accessorId: string): FamilyMember[] => {
    const accessor = getAccessorById(accessorId);
    if (!accessor) return [];
    return state.tree?.members.filter(m => accessor.accessibleMemberIds.includes(m.id)) ?? [];
  };

  const unreadNotificationCount = state.notifications.filter(n => !n.read).length;

  return (
    <AppContext.Provider value={{
      state, dispatch,
      getMemberDocuments, canViewDocument,
      getMemberById, getUserById, getAccessorById, getMembersForAccessor,
      unreadNotificationCount,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
