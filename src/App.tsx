import React, { useState, useEffect, useCallback } from 'react';
import { Users, TableCellsSplit, Key, ShieldCheck, Wifi, WifiOff } from 'lucide-react';
import { Student, StudentTasks, TaskDescriptions, AppServerData } from './types';
import {
  fetchAppData,
  getLocalData,
  updateStudent,
  addStudent,
  deleteStudentApi,
  resetStudentPinApi,
  resetAllTasksApi,
  updateSettingsApi,
} from './utils/api';
import { DEFAULT_ADMIN_PIN, DEFAULT_DESCRIPTIONS } from './data/defaultData';
import { Header } from './components/Header';
import { StudentCard, getCompletedTaskCount } from './components/StudentCard';
import { MatrixView } from './components/MatrixView';
import { PinModal } from './components/PinModal';
import { TaskCheckModal } from './components/TaskCheckModal';
import { ChangePinModal } from './components/ChangePinModal';
import { AdminAuthModal } from './components/AdminAuthModal';
import { TeacherControlModal } from './components/TeacherControlModal';
import { QrModal } from './components/QrModal';
import { ToastModal } from './components/ToastModal';

export default function App() {
  const initialData = getLocalData();
  const [students, setStudents] = useState<Student[]>(initialData.students);
  const [adminPin, setAdminPin] = useState(initialData.adminPin || DEFAULT_ADMIN_PIN);
  const [taskDescriptions, setTaskDescriptions] = useState<TaskDescriptions>(
    initialData.taskDescriptions || DEFAULT_DESCRIPTIONS
  );

  const [currentView, setCurrentView] = useState<'students' | 'matrix'>('students');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isServerConnected, setIsServerConnected] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Modals state
  const [selectedStudentForPin, setSelectedStudentForPin] = useState<Student | null>(null);
  const [activeStudentForTasks, setActiveStudentForTasks] = useState<Student | null>(null);
  const [isChangePinOpen, setIsChangePinOpen] = useState(false);
  const [isAdminAuthOpen, setIsAdminAuthOpen] = useState(false);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{ isOpen: boolean; title: string; message: string }>({
    isOpen: false,
    title: '',
    message: '',
  });

  const showToast = useCallback((title: string, message: string) => {
    setToast({ isOpen: true, title, message });
  }, []);

  const closeToast = useCallback(() => {
    setToast((prev) => ({ ...prev, isOpen: false }));
  }, []);

  // Fetch initial data from server
  const loadDataFromServer = useCallback(async (showSyncIndicator = false) => {
    if (showSyncIndicator) setIsSyncing(true);
    try {
      const data: AppServerData = await fetchAppData();
      if (data.students && data.students.length > 0) {
        setStudents(data.students);
      }
      if (data.adminPin) {
        setAdminPin(data.adminPin);
      }
      if (data.taskDescriptions) {
        setTaskDescriptions(data.taskDescriptions);
      }
      setIsServerConnected(true);
    } catch (err) {
      console.error('Server sync error:', err);
      setIsServerConnected(false);
    } finally {
      if (showSyncIndicator) {
        setTimeout(() => setIsSyncing(false), 300);
      }
    }
  }, []);

  useEffect(() => {
    loadDataFromServer(true);

    // Continuous polling every 6 seconds to synchronize multiple devices (tablets, PC, TV)
    const interval = setInterval(() => {
      loadDataFromServer(false);
    }, 6000);

    return () => clearInterval(interval);
  }, [loadDataFromServer]);

  // Total class progress calculation
  const totalTasks = students.length * 5;
  const completedTasks = students.reduce(
    (acc, st) => acc + getCompletedTaskCount(st),
    0
  );
  const totalPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Student card clicked
  const handleStudentCardClick = (student: Student) => {
    if (isAdminLoggedIn) {
      // Teacher mode: directly open task check modal
      setActiveStudentForTasks(student);
    } else {
      // Student mode: prompt for 4-digit PIN
      setSelectedStudentForPin(student);
    }
  };

  // Student PIN verification success
  const handlePinSuccess = (student: Student) => {
    setSelectedStudentForPin(null);
    setActiveStudentForTasks(student);
  };

  // Update tasks for a student (persisted to server)
  const handleUpdateTasks = async (studentId: number, newTasks: StudentTasks) => {
    // Optimistic UI update
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, tasks: newTasks } : s))
    );
    if (activeStudentForTasks && activeStudentForTasks.id === studentId) {
      setActiveStudentForTasks((prev) => (prev ? { ...prev, tasks: newTasks } : null));
    }

    try {
      const res = await updateStudent(studentId, { tasks: newTasks });
      if (res.student) {
        setStudents((prev) =>
          prev.map((s) => (s.id === studentId ? res.student : s))
        );
      }
    } catch (err) {
      console.error('Failed to update student tasks on server:', err);
      showToast('⚠️ 저장 지연', '서버 통신에 문제가 있어 잠시 후 다시 시도합니다.');
    }
  };

  // Save new student PIN
  const handleSaveStudentPin = async (newPin: string) => {
    if (!activeStudentForTasks) return;
    const studentId = activeStudentForTasks.id;

    try {
      const res = await updateStudent(studentId, { pin: newPin });
      if (res.student) {
        setStudents((prev) =>
          prev.map((s) => (s.id === studentId ? res.student : s))
        );
        setActiveStudentForTasks(res.student);
        showToast('✅ 비밀번호 변경 완료', `${res.student.name} 학생의 비밀번호가 [${newPin}]으로 저장되었습니다.`);
      }
    } catch (err) {
      console.error('Failed to update PIN on server:', err);
      showToast('❌ 오류', '비밀번호 저장 중 오류가 발생했습니다.');
    }
  };

  // Admin button click
  const handleAdminButtonClick = () => {
    if (isAdminLoggedIn) {
      setIsTeacherModalOpen(true);
    } else {
      setIsAdminAuthOpen(true);
    }
  };

  // Admin login success
  const handleAdminLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    setIsAdminAuthOpen(false);
    setIsTeacherModalOpen(true);
    showToast('👑 관리자 로그인 성공', '교사/관리자 권한이 승인되었습니다!');
  };

  // Admin logout
  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    setIsTeacherModalOpen(false);
    showToast('👋 로그아웃', '관리자 모드에서 로그아웃되었습니다.');
  };

  // Teacher action: add student
  const handleAddStudent = async (num: number, name: string, avatar: string) => {
    const res = await addStudent({ num, name, avatar, pin: '0000' });
    if (res.student) {
      await loadDataFromServer(true);
    }
  };

  // Teacher action: delete student
  const handleDeleteStudent = async (id: number) => {
    await deleteStudentApi(id);
    await loadDataFromServer(true);
  };

  // Teacher action: reset student PIN to 0000
  const handleResetStudentPin = async (id: number) => {
    await resetStudentPinApi(id);
    await loadDataFromServer(true);
  };

  // Teacher action: reset all students' tasks to 0
  const handleResetAllTasks = async () => {
    await resetAllTasksApi();
    await loadDataFromServer(true);
  };

  // Teacher action: save descriptions
  const handleSaveDescriptions = async (desc: TaskDescriptions) => {
    const res = await updateSettingsApi({ taskDescriptions: desc });
    if (res.taskDescriptions) {
      setTaskDescriptions(res.taskDescriptions);
    }
  };

  // Teacher action: save admin PIN
  const handleSaveAdminPin = async (newPin: string) => {
    const res = await updateSettingsApi({ adminPin: newPin });
    if (res.adminPin) {
      setAdminPin(res.adminPin);
    }
  };

  return (
    <div className="min-h-screen p-3 sm:p-6 pb-24 text-slate-100 max-w-[1700px] mx-auto">
      {/* Top Header */}
      <Header
        taskDescriptions={taskDescriptions}
        totalPercent={totalPercent}
        isAdminLoggedIn={isAdminLoggedIn}
        isServerConnected={isServerConnected}
        isSyncing={isSyncing}
        onOpenQr={() => setIsQrModalOpen(true)}
        onAdminClick={handleAdminButtonClick}
        onRefreshData={() => loadDataFromServer(true)}
      />

      {/* View Switcher and Notice Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between border-b border-slate-700/80 pb-4 gap-3 mb-6">
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            id="view-students-btn"
            onClick={() => setCurrentView('students')}
            className={`btn-push px-5 py-2.5 rounded-2xl text-sm sm:text-base font-bold flex items-center gap-2 transition-all ${
              currentView === 'students'
                ? 'bg-cyan-400 text-slate-950 border-b-4 border-cyan-600'
                : 'bg-slate-800 text-slate-300 border-b-4 border-slate-950 hover:bg-slate-700'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>학생 카드 모드 (개인 PIN)</span>
          </button>
          <button
            id="view-matrix-btn"
            onClick={() => setCurrentView('matrix')}
            className={`btn-push px-5 py-2.5 rounded-2xl text-sm sm:text-base font-bold flex items-center gap-2 transition-all ${
              currentView === 'matrix'
                ? 'bg-cyan-400 text-slate-950 border-b-4 border-cyan-600'
                : 'bg-slate-800 text-slate-300 border-b-4 border-slate-950 hover:bg-slate-700'
            }`}
          >
            <TableCellsSplit className="w-4 h-4" />
            <span>학급 종합 현황표</span>
          </button>
        </div>

        <div className="text-xs text-amber-300 font-sans-kr bg-slate-900/90 px-4 py-2 rounded-xl border border-slate-800 flex items-center gap-2">
          <Key className="w-3.5 h-3.5 text-yellow-300" />
          <span>
            학생 본인의 카드를 누른 후 <b className="text-white">4자리 비밀번호</b>를 입력하세요! (초기: 0000)
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <main>
        {currentView === 'students' ? (
          <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
            {students.map((st) => (
              <StudentCard
                key={st.id}
                student={st}
                onClick={() => handleStudentCardClick(st)}
              />
            ))}
          </section>
        ) : (
          <MatrixView
            students={students}
            onSelectStudent={(st) => handleStudentCardClick(st)}
          />
        )}
      </main>

      {/* Modals */}
      <PinModal
        student={selectedStudentForPin}
        isOpen={selectedStudentForPin !== null}
        onClose={() => setSelectedStudentForPin(null)}
        onSuccess={handlePinSuccess}
      />

      <TaskCheckModal
        student={activeStudentForTasks}
        isOpen={activeStudentForTasks !== null}
        taskDescriptions={taskDescriptions}
        onClose={() => {
          setActiveStudentForTasks(null);
          loadDataFromServer(false);
        }}
        onUpdateTasks={handleUpdateTasks}
        onOpenChangePin={() => setIsChangePinOpen(true)}
      />

      <ChangePinModal
        student={activeStudentForTasks}
        isOpen={isChangePinOpen}
        onClose={() => setIsChangePinOpen(false)}
        onSavePin={handleSaveStudentPin}
      />

      <AdminAuthModal
        isOpen={isAdminAuthOpen}
        onClose={() => setIsAdminAuthOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />

      <TeacherControlModal
        isOpen={isTeacherModalOpen}
        students={students}
        adminPin={adminPin}
        taskDescriptions={taskDescriptions}
        onClose={() => setIsTeacherModalOpen(false)}
        onLogout={handleAdminLogout}
        onAddStudent={handleAddStudent}
        onDeleteStudent={handleDeleteStudent}
        onResetStudentPin={handleResetStudentPin}
        onResetAllTasks={handleResetAllTasks}
        onSaveDescriptions={handleSaveDescriptions}
        onSaveAdminPin={handleSaveAdminPin}
        onShowToast={showToast}
      />

      <QrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        onShowToast={showToast}
      />

      <ToastModal
        isOpen={toast.isOpen}
        title={toast.title}
        message={toast.message}
        onClose={closeToast}
      />
    </div>
  );
}
