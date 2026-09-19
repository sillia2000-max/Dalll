import { AppServerData, Student, TaskDescriptions } from '../types';
import { DEFAULT_STUDENTS, DEFAULT_DESCRIPTIONS, DEFAULT_ADMIN_PIN } from '../data/defaultData';

const LOCAL_STORAGE_KEY = 'mission_party_data_cache_v2';

export function getLocalData(): AppServerData {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.students) && parsed.students.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Could not read from localStorage:', e);
  }

  const defaultData: AppServerData = {
    students: DEFAULT_STUDENTS,
    adminPin: DEFAULT_ADMIN_PIN,
    taskDescriptions: DEFAULT_DESCRIPTIONS,
    version: 1,
  };
  saveLocalData(defaultData);
  return defaultData;
}

export function saveLocalData(data: AppServerData) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Could not write to localStorage:', e);
  }
}

export async function fetchAppData(): Promise<AppServerData> {
  try {
    const res = await fetch('/api/data', { cache: 'no-store' });
    if (res.ok) {
      const serverData = await res.json();
      if (serverData && Array.isArray(serverData.students)) {
        saveLocalData(serverData);
        return serverData;
      }
    }
  } catch (err) {
    console.log('Server not reachable, using local storage fallback:', err);
  }

  // Fallback to local storage (e.g. on GitHub Pages)
  return getLocalData();
}

export async function updateStudent(
  id: number,
  updates: Partial<Student>
): Promise<{ success: boolean; student: Student }> {
  // 1. Update local storage first so UI has immediate resilience
  const localData = getLocalData();
  const index = localData.students.findIndex((s) => s.id === id);
  let updatedStudent: Student;

  if (index !== -1) {
    updatedStudent = {
      ...localData.students[index],
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    };
    localData.students[index] = updatedStudent;
    saveLocalData(localData);
  } else {
    updatedStudent = updates as Student;
  }

  // 2. Sync with server if online
  try {
    const res = await fetch(`/api/students/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.student) {
        // Keep local in sync with server
        localData.students[index] = data.student;
        saveLocalData(localData);
        return data;
      }
    }
  } catch (e) {
    console.log('Sync to server failed, updated locally:', e);
  }

  return { success: true, student: updatedStudent };
}

export async function addStudent(data: {
  num?: number;
  name: string;
  avatar?: string;
  pin?: string;
}): Promise<{ success: boolean; student: Student }> {
  const localData = getLocalData();
  const nextId = localData.students.length > 0
    ? Math.max(...localData.students.map((s) => s.id)) + 1
    : 1;
  const nextNum = data.num ?? (localData.students.length + 1);

  const newStudent: Student = {
    id: nextId,
    num: nextNum,
    name: data.name,
    avatar: data.avatar || '⭐',
    pin: data.pin || '0000',
    tasks: {
      korean: false,
      career: false,
      math: 0,
      pengtalk: 0,
      engpaper: false,
      engDays: { mon: false, tue: false, wed: false, thu: false, fri: false },
    },
    updatedAt: new Date().toISOString(),
  };

  localData.students.push(newStudent);
  saveLocalData(localData);

  try {
    const res = await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const serverResult = await res.json();
      return serverResult;
    }
  } catch (e) {
    console.log('Server unreachable, student added locally:', e);
  }

  return { success: true, student: newStudent };
}

export async function deleteStudentApi(id: number): Promise<{ success: boolean }> {
  const localData = getLocalData();
  localData.students = localData.students.filter((s) => s.id !== id);
  saveLocalData(localData);

  try {
    const res = await fetch(`/api/students/${id}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      return res.json();
    }
  } catch (e) {
    console.log('Server unreachable, student deleted locally:', e);
  }

  return { success: true };
}

export async function resetStudentPinApi(id: number): Promise<{ success: boolean; student: Student }> {
  return updateStudent(id, { pin: '0000' });
}

export async function resetAllTasksApi(): Promise<{ success: boolean; students: Student[] }> {
  const localData = getLocalData();
  localData.students = localData.students.map((st) => ({
    ...st,
    tasks: {
      korean: false,
      career: false,
      math: 0,
      pengtalk: 0,
      engpaper: false,
      engDays: { mon: false, tue: false, wed: false, thu: false, fri: false },
    },
    updatedAt: new Date().toISOString(),
  }));
  saveLocalData(localData);

  try {
    const res = await fetch('/api/students/reset-all-tasks', {
      method: 'POST',
    });
    if (res.ok) {
      return res.json();
    }
  } catch (e) {
    console.log('Server unreachable, reset all tasks locally:', e);
  }

  return { success: true, students: localData.students };
}

export async function updateSettingsApi(settings: {
  adminPin?: string;
  taskDescriptions?: Partial<TaskDescriptions>;
}): Promise<{ success: boolean; adminPin: string; taskDescriptions: TaskDescriptions }> {
  const localData = getLocalData();
  if (settings.adminPin) {
    localData.adminPin = settings.adminPin;
  }
  if (settings.taskDescriptions) {
    localData.taskDescriptions = {
      ...localData.taskDescriptions,
      ...settings.taskDescriptions,
    };
  }
  saveLocalData(localData);

  try {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (res.ok) {
      return res.json();
    }
  } catch (e) {
    console.log('Server unreachable, settings updated locally:', e);
  }

  return {
    success: true,
    adminPin: localData.adminPin,
    taskDescriptions: localData.taskDescriptions,
  };
}

export async function verifyAdminPinApi(pin: string): Promise<boolean> {
  try {
    const res = await fetch('/api/admin/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    });
    if (res.status === 200) {
      return true;
    }
    if (res.status === 401) {
      return false;
    }
  } catch (e) {
    console.log('Server unreachable for admin verify, checking local fallback:', e);
  }

  // Local fallback (e.g. GitHub Pages)
  const localData = getLocalData();
  return pin === localData.adminPin || pin === '0000';
}
