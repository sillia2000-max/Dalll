import React, { useState } from 'react';
import {
  X,
  Users,
  ClipboardList,
  KeyRound,
  Plus,
  Trash2,
  RotateCcw,
  LogOut,
  Save,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { Student, TaskDescriptions } from '../types';

interface TeacherControlModalProps {
  isOpen: boolean;
  students: Student[];
  adminPin: string;
  taskDescriptions: TaskDescriptions;
  onClose: () => void;
  onLogout: () => void;
  onAddStudent: (num: number, name: string, avatar: string) => Promise<void>;
  onDeleteStudent: (id: number) => Promise<void>;
  onResetStudentPin: (id: number) => Promise<void>;
  onResetAllTasks: () => Promise<void>;
  onSaveDescriptions: (desc: TaskDescriptions) => Promise<void>;
  onSaveAdminPin: (newPin: string) => Promise<void>;
  onShowToast: (title: string, message: string) => void;
}

const AVATAR_OPTIONS = ['🦁', '🐱', '🐰', '🐼', '🦊', '🐯', '🦄', '🐻', '🐥', '🐸', '🐶', '🐹', '🐨', '🐙'];

export const TeacherControlModal: React.FC<TeacherControlModalProps> = ({
  isOpen,
  students,
  adminPin,
  taskDescriptions,
  onClose,
  onLogout,
  onAddStudent,
  onDeleteStudent,
  onResetStudentPin,
  onResetAllTasks,
  onSaveDescriptions,
  onSaveAdminPin,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<1 | 2 | 3>(1);

  // Tab 1 state
  const [newNum, setNewNum] = useState('');
  const [newName, setNewName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);
  const [isAdding, setIsAdding] = useState(false);
  const [isResettingTasks, setIsResettingTasks] = useState(false);

  // Tab 2 state
  const [localDesc, setLocalDesc] = useState<TaskDescriptions>(taskDescriptions);
  const [isSavingDesc, setIsSavingDesc] = useState(false);

  // Tab 3 state
  const [newAdminPin, setNewAdminPin] = useState('');
  const [confirmAdminPin, setConfirmAdminPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [isSavingPin, setIsSavingPin] = useState(false);

  // Sync descriptions when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setLocalDesc(taskDescriptions);
      setNewNum(String((students.length > 0 ? Math.max(...students.map((s) => s.num)) + 1 : 1)));
      setNewName('');
      setNewAdminPin('');
      setConfirmAdminPin('');
      setPinError('');
    }
  }, [isOpen, taskDescriptions, students]);

  if (!isOpen) return null;

  const handleAddStudent = async () => {
    const numVal = parseInt(newNum, 10);
    const nameVal = newName.trim();

    if (isNaN(numVal) || numVal <= 0 || !nameVal) {
      onShowToast('⚠️ 입력 오류', '학생 번호(양수)와 이름을 정확히 입력하세요.');
      return;
    }

    setIsAdding(true);
    try {
      await onAddStudent(numVal, nameVal, selectedAvatar);
      setNewName('');
      setNewNum(String(numVal + 1));
      setSelectedAvatar(AVATAR_OPTIONS[Math.floor(Math.random() * AVATAR_OPTIONS.length)]);
      onShowToast('✅ 학생 추가 성공', `${numVal}번 ${nameVal} 학생이 서버에 추가되었습니다! (초기 PIN: 0000)`);
    } catch {
      onShowToast('❌ 오류 발생', '학생 추가 중 문제가 발생했습니다.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleResetTasksConfirm = async () => {
    if (!window.confirm('정말 모든 학생의 과제 진도를 0%로 초기화하시겠습니까? (새 주차 시작용)')) {
      return;
    }
    setIsResettingTasks(true);
    try {
      await onResetAllTasks();
      onShowToast('🔄 전체 과제 초기화', '모든 학생의 과제 상태가 성공적으로 초기화되었습니다.');
    } catch {
      onShowToast('❌ 오류 발생', '과제 초기화 중 문제가 발생했습니다.');
    } finally {
      setIsResettingTasks(false);
    }
  };

  const handleSaveDescriptions = async () => {
    setIsSavingDesc(true);
    try {
      await onSaveDescriptions(localDesc);
      onShowToast('📋 설정 저장 완료', '주간 과제 안내 문구가 서버에 안전하게 보존되었습니다.');
    } catch {
      onShowToast('❌ 저장 실패', '과제 설정 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSavingDesc(false);
    }
  };

  const handleSaveAdminPin = async () => {
    const p1 = newAdminPin.trim();
    const p2 = confirmAdminPin.trim();

    if (!p1 || p1.length < 4) {
      setPinError('비밀번호는 4자리 이상이어야 합니다.');
      return;
    }
    if (p1 !== p2) {
      setPinError('비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    setIsSavingPin(true);
    setPinError('');
    try {
      await onSaveAdminPin(p1);
      setNewAdminPin('');
      setConfirmAdminPin('');
      onShowToast('🔑 관리자 암호 변경', `새 관리자 비밀번호가 [${p1}]로 변경되었습니다.`);
    } catch {
      setPinError('서버 저장에 실패했습니다.');
    } finally {
      setIsSavingPin(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="game-card max-w-4xl w-full rounded-3xl p-5 sm:p-8 border-2 border-emerald-400/80 shadow-2xl relative my-auto max-h-[95vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full flex items-center justify-center text-lg border border-slate-600 transition-colors z-10"
          aria-label="닫기"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-700 gap-3 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-2xl font-bold shadow-lg shrink-0">
              👑
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">교사 전용 관리자 제어 모드</h2>
              <p className="text-xs text-slate-400 font-sans-kr">
                학생 등록/암호 초기화, 과제 목표 문구 및 관리자 암호를 통합 제어합니다.
              </p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="btn-push self-start sm:self-center bg-rose-950/80 text-rose-300 border border-rose-800 px-3.5 py-2 rounded-xl text-xs font-sans-kr font-bold flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4" /> 관리자 로그아웃
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex flex-wrap gap-2 my-4 font-sans-kr shrink-0">
          <button
            onClick={() => setActiveTab(1)}
            className={`btn-push px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
              activeTab === 1
                ? 'bg-emerald-500 text-slate-950 border-b-4 border-emerald-700'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Users className="w-4 h-4" /> 학생 및 암호 관리
          </button>
          <button
            onClick={() => setActiveTab(2)}
            className={`btn-push px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
              activeTab === 2
                ? 'bg-emerald-500 text-slate-950 border-b-4 border-emerald-700'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <ClipboardList className="w-4 h-4" /> 과제 항목 및 목표 설정
          </button>
          <button
            onClick={() => setActiveTab(3)}
            className={`btn-push px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
              activeTab === 3
                ? 'bg-emerald-500 text-slate-950 border-b-4 border-emerald-700'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <KeyRound className="w-4 h-4" /> 교사 관리자 암호 변경
          </button>
        </div>

        {/* Tab 1: Students & PINs */}
        {activeTab === 1 && (
          <div className="space-y-4 overflow-y-auto pr-1 flex-1">
            {/* Add student bar */}
            <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-cyan-300 flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> 새 학생 등록 (서버 자동 보존)
              </h4>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="number"
                  placeholder="번호"
                  value={newNum}
                  onChange={(e) => setNewNum(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white w-full sm:w-28 focus:outline-none focus:border-cyan-400 font-sans-kr"
                />
                <input
                  type="text"
                  placeholder="학생 이름 (예: 박지민)"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white w-full sm:flex-1 focus:outline-none focus:border-cyan-400 font-sans-kr"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddStudent();
                  }}
                />
                {/* Avatar picker */}
                <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700 overflow-x-auto max-w-full sm:max-w-xs">
                  {AVATAR_OPTIONS.slice(0, 7).map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setSelectedAvatar(emoji)}
                      className={`w-7 h-7 rounded-lg text-lg flex items-center justify-center transition-transform ${
                        selectedAvatar === emoji ? 'bg-cyan-500 scale-110 shadow' : 'hover:bg-slate-700'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleAddStudent}
                  disabled={isAdding}
                  className="btn-push w-full sm:w-auto bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 border-b-4 border-cyan-700 shrink-0"
                >
                  <Plus className="w-4 h-4" /> 학생 추가
                </button>
              </div>
            </div>

            {/* Reset all tasks button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-amber-950/40 p-4 rounded-2xl border border-amber-500/30 gap-3">
              <div>
                <h4 className="font-bold text-amber-300 text-sm flex items-center gap-1.5">
                  <RotateCcw className="w-4 h-4" /> 새 주차 과제 일괄 초기화
                </h4>
                <p className="text-xs text-slate-300 font-sans-kr mt-0.5">
                  모든 학생의 5가지 과제 수행 기록 및 요일 스탬프를 0%로 초기화합니다.
                </p>
              </div>
              <button
                onClick={handleResetTasksConfirm}
                disabled={isResettingTasks}
                className="btn-push bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs border-b-4 border-amber-700 shrink-0 flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" /> 전체 과제 초기화
              </button>
            </div>

            {/* Student list table */}
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-2 overflow-x-auto">
              <table className="w-full text-left text-xs font-sans-kr">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="p-2.5">번호</th>
                    <th className="p-2.5">이름</th>
                    <th className="p-2.5">현재 암호(PIN)</th>
                    <th className="p-2.5 text-right">관리 액션</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {students.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-800/40">
                      <td className="p-2.5 font-bold">{st.num}번</td>
                      <td className="p-2.5 font-bold text-white flex items-center gap-1.5">
                        <span>{st.avatar}</span>
                        <span>{st.name}</span>
                      </td>
                      <td className="p-2.5 text-cyan-300 font-mono font-bold">{st.pin}</td>
                      <td className="p-2.5 text-right space-x-2">
                        <button
                          onClick={async () => {
                            await onResetStudentPin(st.id);
                            onShowToast('🔑 PIN 리셋', `${st.name} 학생의 PIN이 '0000'으로 초기화되었습니다.`);
                          }}
                          className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg border border-amber-500/40 text-[11px] font-bold"
                        >
                          암호 0000 리셋
                        </button>
                        <button
                          onClick={async () => {
                            if (window.confirm(`${st.name} 학생을 명단에서 삭제하시겠습니까?`)) {
                              await onDeleteStudent(st.id);
                              onShowToast('🗑️ 학생 삭제', `${st.name} 학생이 삭제되었습니다.`);
                            }
                          }}
                          className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-lg border border-rose-500/40 text-[11px] font-bold"
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Mission Goals & Descriptions */}
        {activeTab === 2 && (
          <div className="space-y-3 overflow-y-auto pr-1 flex-1 font-sans-kr">
            <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="font-bold text-amber-300 text-sm">📅 이번 주 목표 상단 헤더 문구</h4>
              <input
                type="text"
                value={localDesc.weekHeader}
                onChange={(e) => setLocalDesc({ ...localDesc, weekHeader: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                placeholder="예: 3월 3주차 과제 수행 현황"
              />

              <h4 className="font-bold text-rose-300 text-sm pt-2">📖 국어 과제 목표 설명</h4>
              <input
                type="text"
                value={localDesc.korean}
                onChange={(e) => setLocalDesc({ ...localDesc, korean: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
              />

              <h4 className="font-bold text-purple-300 text-sm pt-2">🚀 진로 글쓰기 목표 설명</h4>
              <input
                type="text"
                value={localDesc.career}
                onChange={(e) => setLocalDesc({ ...localDesc, career: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
              />

              <h4 className="font-bold text-blue-300 text-sm pt-2">📐 수학 단원 진도 목표 설명</h4>
              <input
                type="text"
                value={localDesc.math}
                onChange={(e) => setLocalDesc({ ...localDesc, math: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
              />

              <h4 className="font-bold text-amber-300 text-sm pt-2">🐧 영어 펭톡 단원 목표 설명</h4>
              <input
                type="text"
                value={localDesc.pengtalk}
                onChange={(e) => setLocalDesc({ ...localDesc, pengtalk: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
              />

              <h4 className="font-bold text-emerald-300 text-sm pt-2">🔤 영어 문제지 목표 설명</h4>
              <input
                type="text"
                value={localDesc.engpaper}
                onChange={(e) => setLocalDesc({ ...localDesc, engpaper: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
              />

              <button
                onClick={handleSaveDescriptions}
                disabled={isSavingDesc}
                className="btn-push w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3 rounded-xl text-sm border-b-4 border-emerald-700 mt-3 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" /> 과제 설정 서버 저장하기
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Admin Password Change */}
        {activeTab === 3 && (
          <div className="space-y-4 overflow-y-auto pr-1 flex-1 font-sans-kr">
            <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 space-y-4 max-w-md mx-auto text-center">
              <div className="w-12 h-12 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center text-2xl mx-auto border border-amber-400/30">
                🔑
              </div>
              <div>
                <h4 className="font-bold text-white text-base">교사 / 관리자 비밀번호 변경</h4>
                <p className="text-xs text-slate-400 mt-1">
                  안전한 학급 관리를 위해 선생님 전용 비밀번호를 설정해주세요.
                </p>
              </div>

              <div className="space-y-3 text-left">
                <div>
                  <label className="text-xs text-slate-300 font-bold mb-1 block">
                    새 관리자 비밀번호
                  </label>
                  <input
                    type="password"
                    maxLength={16}
                    value={newAdminPin}
                    onChange={(e) => setNewAdminPin(e.target.value)}
                    placeholder="새 비밀번호 입력"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-400 font-bold tracking-widest text-center"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-bold mb-1 block">
                    새 관리자 비밀번호 확인
                  </label>
                  <input
                    type="password"
                    maxLength={16}
                    value={confirmAdminPin}
                    onChange={(e) => setConfirmAdminPin(e.target.value)}
                    placeholder="새 비밀번호 재입력"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-400 font-bold tracking-widest text-center"
                  />
                </div>
              </div>

              {pinError && (
                <div className="text-xs text-rose-400 font-bold">
                  {pinError}
                </div>
              )}

              <button
                onClick={handleSaveAdminPin}
                disabled={isSavingPin}
                className="btn-push w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3 rounded-xl text-sm border-b-4 border-emerald-700 flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" /> 관리자 암호 변경 저장
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
