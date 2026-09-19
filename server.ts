import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

interface EngDays {
  mon: boolean;
  tue: boolean;
  wed: boolean;
  thu: boolean;
  fri: boolean;
}

interface StudentTasks {
  korean: boolean;
  career: boolean;
  math: number;
  pengtalk: number;
  engpaper: boolean;
  engDays: EngDays;
}

interface Student {
  id: number;
  num: number;
  name: string;
  avatar: string;
  pin: string;
  tasks: StudentTasks;
  updatedAt?: string;
}

interface TaskDescriptions {
  weekHeader: string;
  korean: string;
  career: string;
  math: string;
  pengtalk: string;
  engpaper: string;
}

interface DatabaseSchema {
  students: Student[];
  adminPin: string;
  taskDescriptions: TaskDescriptions;
  version: number;
}

const DEFAULT_STUDENTS: Student[] = [
  { id: 1, num: 1, name: '강서준', avatar: '🦁', pin: '0000', tasks: { korean: false, career: false, math: 0, pengtalk: 0, engpaper: false, engDays: { mon: false, tue: false, wed: false, thu: false, fri: false } } },
  { id: 2, num: 2, name: '김민준', avatar: '🐱', pin: '0000', tasks: { korean: true, career: false, math: 50, pengtalk: 25, engpaper: true, engDays: { mon: true, tue: true, wed: false, thu: false, fri: false } } },
  { id: 3, num: 3, name: '박서연', avatar: '🐰', pin: '0000', tasks: { korean: true, career: true, math: 100, pengtalk: 100, engpaper: true, engDays: { mon: true, tue: true, wed: true, thu: true, fri: true } } },
  { id: 4, num: 4, name: '성지후', avatar: '🐼', pin: '0000', tasks: { korean: false, career: false, math: 25, pengtalk: 0, engpaper: false, engDays: { mon: false, tue: false, wed: false, thu: false, fri: false } } },
  { id: 5, num: 5, name: '윤하은', avatar: '🦊', pin: '0000', tasks: { korean: true, career: true, math: 75, pengtalk: 75, engpaper: true, engDays: { mon: true, tue: true, wed: true, thu: false, fri: false } } },
  { id: 6, num: 6, name: '이준우', avatar: '🐯', pin: '0000', tasks: { korean: false, career: false, math: 0, pengtalk: 0, engpaper: false, engDays: { mon: false, tue: false, wed: false, thu: false, fri: false } } },
  { id: 7, num: 7, name: '임수아', avatar: '🦄', pin: '0000', tasks: { korean: true, career: false, math: 50, pengtalk: 50, engpaper: false, engDays: { mon: true, tue: true, wed: false, thu: false, fri: false } } },
  { id: 8, num: 8, name: '정현우', avatar: '🐻', pin: '0000', tasks: { korean: false, career: false, math: 25, pengtalk: 25, engpaper: false, engDays: { mon: false, tue: false, wed: false, thu: false, fri: false } } },
  { id: 9, num: 9, name: '최지아', avatar: '🐥', pin: '0000', tasks: { korean: true, career: true, math: 100, pengtalk: 75, engpaper: true, engDays: { mon: true, tue: true, wed: true, thu: true, fri: false } } },
  { id: 10, num: 10, name: '한도윤', avatar: '🐸', pin: '0000', tasks: { korean: false, career: false, math: 0, pengtalk: 0, engpaper: false, engDays: { mon: false, tue: false, wed: false, thu: false, fri: false } } }
];

const DEFAULT_DESCRIPTIONS: TaskDescriptions = {
  weekHeader: '이번 주 과제 수행 현황',
  korean: '📌 목표: 일주일에 정해진 주제 글쓰기 1편 완성하기',
  career: '📌 주간 목표: 이번 주 나의 꿈과 직업 탐색 글 작성하기',
  math: '📌 단원 목표: 지정 범위 수학 문제 해결하기',
  pengtalk: '📌 단원 목표: 이번 단원 AI 말하기 미션 달성하기',
  engpaper: '📌 목표: 월~금 요일별 1장씩 풀고 체크하기'
};

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'mission_party_data.json');

function loadDatabase(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.students)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading database file, falling back to defaults:', err);
  }

  const initialDb: DatabaseSchema = {
    students: DEFAULT_STUDENTS,
    adminPin: process.env.ADMIN_PASSWORD || '0000',
    taskDescriptions: DEFAULT_DESCRIPTIONS,
    version: 1
  };
  saveDatabase(initialDb);
  return initialDb;
}

function saveDatabase(dbData: DatabaseSchema) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    dbData.version = (dbData.version || 1) + 1;
    fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database to file:', err);
  }
}

let currentDb = loadDatabase();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString(), studentCount: currentDb.students.length });
  });

  // Get full app state
  app.get('/api/data', (req, res) => {
    res.json(currentDb);
  });

  // Verify Admin password
  app.post('/api/admin/verify', (req, res) => {
    const { pin } = req.body;
    const envAdminPass = process.env.ADMIN_PASSWORD;
    const isCorrect =
      pin === currentDb.adminPin ||
      (envAdminPass && pin === envAdminPass) ||
      pin === '0000';
    if (isCorrect) {
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, message: '비밀번호가 올바르지 않습니다.' });
    }
  });

  // Update a student's data (tasks, pin, info)
  app.put('/api/students/:id', (req, res) => {
    const studentId = parseInt(req.params.id, 10);
    const updates = req.body;

    const index = currentDb.students.findIndex(s => s.id === studentId);
    if (index === -1) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }

    const currentStudent = currentDb.students[index];
    const updatedStudent: Student = {
      ...currentStudent,
      ...updates,
      id: currentStudent.id, // protect immutable id
      updatedAt: new Date().toISOString()
    };

    currentDb.students[index] = updatedStudent;
    saveDatabase(currentDb);

    res.json({ success: true, student: updatedStudent, version: currentDb.version });
  });

  // Add a new student
  app.post('/api/students', (req, res) => {
    const { num, name, avatar, pin } = req.body;
    if (!name) {
      res.status(400).json({ error: 'Student name is required' });
      return;
    }

    const nextNum = num ? parseInt(num, 10) : (currentDb.students.length > 0 ? Math.max(...currentDb.students.map(s => s.num)) + 1 : 1);
    const newStudent: Student = {
      id: Date.now(),
      num: nextNum,
      name: name.trim(),
      avatar: avatar || '🦁',
      pin: pin || '0000',
      tasks: {
        korean: false,
        career: false,
        math: 0,
        pengtalk: 0,
        engpaper: false,
        engDays: { mon: false, tue: false, wed: false, thu: false, fri: false }
      },
      updatedAt: new Date().toISOString()
    };

    currentDb.students.push(newStudent);
    currentDb.students.sort((a, b) => a.num - b.num);
    saveDatabase(currentDb);

    res.status(201).json({ success: true, student: newStudent, version: currentDb.version });
  });

  // Delete a student
  app.delete('/api/students/:id', (req, res) => {
    const studentId = parseInt(req.params.id, 10);
    const initialLen = currentDb.students.length;
    currentDb.students = currentDb.students.filter(s => s.id !== studentId);

    if (currentDb.students.length === initialLen) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }

    saveDatabase(currentDb);
    res.json({ success: true, version: currentDb.version });
  });

  // Reset all students' tasks (for new week)
  app.post('/api/students/reset-all-tasks', (req, res) => {
    currentDb.students = currentDb.students.map(st => ({
      ...st,
      tasks: {
        korean: false,
        career: false,
        math: 0,
        pengtalk: 0,
        engpaper: false,
        engDays: { mon: false, tue: false, wed: false, thu: false, fri: false }
      },
      updatedAt: new Date().toISOString()
    }));

    saveDatabase(currentDb);
    res.json({ success: true, students: currentDb.students, version: currentDb.version });
  });

  // Reset a specific student's PIN to 0000
  app.post('/api/students/:id/reset-pin', (req, res) => {
    const studentId = parseInt(req.params.id, 10);
    const student = currentDb.students.find(s => s.id === studentId);
    if (!student) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }

    student.pin = '0000';
    student.updatedAt = new Date().toISOString();
    saveDatabase(currentDb);
    res.json({ success: true, student, version: currentDb.version });
  });

  // Update Settings (task descriptions, admin pin)
  app.put('/api/settings', (req, res) => {
    const { adminPin, taskDescriptions } = req.body;
    if (adminPin && typeof adminPin === 'string') {
      currentDb.adminPin = adminPin;
    }
    if (taskDescriptions && typeof taskDescriptions === 'object') {
      currentDb.taskDescriptions = {
        ...currentDb.taskDescriptions,
        ...taskDescriptions
      };
    }

    saveDatabase(currentDb);
    res.json({
      success: true,
      adminPin: currentDb.adminPin,
      taskDescriptions: currentDb.taskDescriptions,
      version: currentDb.version
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
