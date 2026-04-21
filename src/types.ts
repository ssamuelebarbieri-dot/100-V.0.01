export interface Task {
  id: string;
  uid?: string; // Added for Firebase
  title: string;
  description: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  type: 'school' | 'extra' | 'study';
  completed: boolean;
  reasoning?: string;
}

export interface UserStats {
  uid: string;
  displayName: string;
  photoURL: string;
  bio?: string;
  language: string;
  age: number;
  school: string;
  routineDescription?: string;
  totalStudyMinutes: number;
  streak: number;
  lastActive: string;
}

export interface StudyTip {
  id: string;
  title: string;
  content: string;
  category: 'efficiency' | 'concentration' | 'method';
}

export interface FocusSession {
  id: string;
  startTime: string;
  duration: number; // minutes
  taskId?: string;
}
