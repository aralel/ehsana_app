export type UserRole = 'owner' | 'family' | 'doctor' | 'caretaker';
export type DocType = 'lab_result' | 'prescription' | 'diagnosis' | 'imaging' | 'vaccination' | 'surgery' | 'allergy' | 'note' | 'other';
export type RelationshipType = 'self' | 'parent' | 'child' | 'sibling' | 'spouse' | 'grandparent' | 'grandchild' | 'aunt_uncle' | 'cousin' | 'other';
export type InviteStatus = 'pending' | 'accepted' | 'declined';
export type Gender = 'male' | 'female' | 'other';
export type Visibility = 'private' | 'family' | 'custom' | 'doctors';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  createdAt: string;
  treeId: string;
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  content: string;
  createdAt: string;
}

export interface MedicalDocument {
  id: string;
  memberId: string;
  title: string;
  type: DocType;
  date: string;
  content: string;
  tags: string[];
  visibility: Visibility;
  sharedWithMemberIds: string[];
  sharedWithAccessorIds: string[];
  comments: Comment[];
  uploadedById: string;
  createdAt: string;
  fileType?: string;
}

export interface FamilyMember {
  id: string;
  linkedUserId?: string;
  name: string;
  relationship: RelationshipType;
  birthDate?: string;
  gender: Gender;
  parentIds: string[];
  childrenIds: string[];
  spouseId?: string;
  notes?: string;
  avatar?: string;
  isAlive: boolean;
  addedById: string;
  generation: number;
}

export interface Accessor {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: 'doctor' | 'caretaker';
  specialty?: string;
  accessibleMemberIds: string[];
  invitedById: string;
  addedAt: string;
}

export interface Invitation {
  id: string;
  fromUserId: string;
  fromUserName: string;
  toEmail: string;
  role: UserRole;
  memberId?: string;
  treeId: string;
  status: InviteStatus;
  createdAt: string;
  expiresAt: string;
  message?: string;
  accessorName?: string;
  specialty?: string;
}

export interface FamilyTree {
  id: string;
  name: string;
  ownerId: string;
  members: FamilyMember[];
  accessors: Accessor[];
  invitations: Invitation[];
  createdAt: string;
  mergedTreeIds: string[];
}

export interface NotifPrefs {
  invites: boolean;
  comments: boolean;
  merges: boolean;
}

export interface AppState {
  currentUser: User | null;
  tree: FamilyTree | null;
  documents: MedicalDocument[];
  users: User[];
  allTrees: FamilyTree[];
  activeView: string;
  selectedMemberId: string | null;
  notifications: Notification[];
  notifPrefs: NotifPrefs;
  defaultDocVisibility: Visibility;
}

export interface Notification {
  id: string;
  type: 'invite' | 'comment' | 'merge' | 'share' | 'info';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}
