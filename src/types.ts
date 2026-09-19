export interface EngDays {
  mon: boolean;
  tue: boolean;
  wed: boolean;
  thu: boolean;
  fri: boolean;
}

export interface StudentTasks {
  korean: boolean;
  career: boolean;
  math: number; // 0, 25, 50, 75, 100
  pengtalk: number; // 0, 25, 50, 75, 100
  engpaper: boolean;
  engDays: EngDays;
}

export interface Student {
  id: number;
  num: number;
  name: string;
  avatar: string;
  pin: string;
  tasks: StudentTasks;
  updatedAt?: string;
}

export interface TaskDescriptions {
  weekHeader: string;
  korean: string;
  career: string;
  math: string;
  pengtalk: string;
  engpaper: string;
}

export interface AppServerData {
  students: Student[];
  adminPin: string;
  taskDescriptions: TaskDescriptions;
  version: number;
}
