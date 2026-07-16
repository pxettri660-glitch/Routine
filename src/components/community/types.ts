export type Role = 'user' | 'moderator' | 'super_admin';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  isOnline: boolean;
  lastSeen: number;
  role: Role;
  isBanned: boolean;
  isDisabled: boolean;
  blockedUsers: string[];
  mutedUsers: string[];
  createdAt: number;
}

export interface Thread {
  id: string;
  type: 'global' | 'group' | 'dm';
  isGlobal?: boolean;
  name?: string;
  photoURL?: string;
  description?: string;
  members: string[];
  admins: string[];
  moderators: string[];
  blockedMembers: string[];
  mutedMembers: string[];
  isLocked: boolean;
  lastMessage?: {
    text: string;
    senderId: string;
    timestamp: number;
  };
  unreadCount?: Record<string, number>;
  pinnedMessageId?: string;
  createdAt: number;
  updatedAt: number;
  createdBy: string;
}

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  text: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'pdf' | 'doc';
  timestamp: number;
  isEdited: boolean;
  isDeleted: boolean;
  replyToId?: string;
  reactions: Record<string, string[]>;
  readBy: string[];
}

export interface Report {
  id: string;
  reportedId: string;
  type: 'message' | 'user';
  reason: 'spam' | 'harassment' | 'fake' | 'inappropriate' | 'other';
  description?: string;
  reporterId: string;
  status: 'pending' | 'resolved' | 'ignored';
  timestamp: number;
}

export interface Announcement {
  id: string;
  title: string;
  text: string;
  target: 'all' | 'group' | 'users';
  targetIds?: string[];
  senderId: string;
  timestamp: number;
}
