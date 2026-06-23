export interface RoutineItem {
  id: string;
  start: string; // "HH:MM" 24-hour format
  end: string;   // "HH:MM" 24-hour format
  title: string;
  desc: string;
  isCompleted?: boolean;
}

export interface GoalItem {
  id: string;
  title: string;
  completed: boolean;
  category: 'academic' | 'coding' | 'fitness' | 'personal';
  deadline?: string;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  category: string;
  updatedAt: string;
}

export interface AudioTrack {
  id: string;
  name: string;
  url: string;
  duration?: string;
}
