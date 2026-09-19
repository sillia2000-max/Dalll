import React, { useState } from 'react';
import { X, CheckCircle2, Clock, Calendar, Lock, Check, CloudCheck, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Student, StudentTasks, TaskDescriptions } from '../types';
import { getCompletedTaskCount } from './StudentCard';

interface TaskCheckModalProps {
  student: Student | null;
  isOpen: boolean;
  taskDescriptions: TaskDescriptions;
  onClose: () => void;
  onUpdateTasks: (studentId: number, tasks: StudentTasks) => Promise<void>;
  onOpenChangePin: () => void;
}

export const TaskCheckModal: React.FC<TaskCheckModalProps> = ({
  student,
  isOpen,
  taskDescriptions,
  onClose,
  onUpdateTasks,
  onOpenChangePin,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen || !student) return null;

  const count = getCompletedTaskCount(student);
  const isAllClear = count === 5;

  const triggerConfettiEffect = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.65 },
      colors: ['#38bdf8', '#34d399', '#fbbf24', '#f472b6', '#a78bfa'],
    });
  };

  const handleTaskToggle = async (taskKey: 'korean' | 'career' | 'engpaper', status: boolean) => {
    const updatedTasks: StudentTasks = {
      ...student.tasks,
      [taskKey]: status,
    };

    setIsSaving(true);
    if (status) triggerConfettiEffect();

    try {
      await onUpdateTasks(student.id, updatedTasks);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleGaugeChange = async (taskKey: 'math' | 'pengtalk', val: number) => {
    const updatedTasks: StudentTasks = {
      ...student.tasks,
      [taskKey]: val,
    };

    setIsSaving(true);
    if (val === 100) triggerConfettiEffect();

    try {
      await onUpdateTasks(student.id, updatedTasks);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDayStampToggle = async (day: 'mon' | 'tue' | 'wed' | 'thu' | 'fri') => {
    const currentDays = student.tasks.engDays || { mon: false, tue: false, wed: false, thu: false, fri: false };
    const nextDays = {
      ...currentDays,
      [day]: !currentDays[day],
    };

    // Auto-mark engpaper as done if at least 3 days are stamped
    const stampedCount = Object.values(nextDays).filter(Boolean).length;
    const shouldComplete = stampedCount >= 3;

    const updatedTasks: StudentTasks = {
      ...student.tasks,
      engDays: nextDays,
      engpaper: shouldComplete ? true : student.tasks.engpaper,
    };

    setIsSaving(true);
    if (nextDays[day]) triggerConfettiEffect();

    try {
      await onUpdateTasks(student.id, updatedTasks);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="game-card max-w-2xl w-full rounded-3xl p-5 sm:p-7 border-2 border-cyan-400/80 shadow-2xl relative my-auto animate-pop max-h-[95vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full flex items-center justify-center text-lg border border-slate-600 transition-colors z-10"
          aria-label="닫기"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-700/80 gap-3 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-3xl sm:text-4xl shadow-lg border-2 border-white/20 shrink-0">
              {student.avatar || '🐱'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs px-2.5 py-0.5 rounded-full font-bold">
                  {student.num}번 학생
                </span>
                <span
                  className={`text-xs font-extrabold flex items-center gap-1 ${
                    isAllClear ? 'text-amber-300' : 'text-cyan-300'
                  }`}
                >
                  {count} / 5 미션 완료! {isAllClear ? '👑 올클리어!' : '⭐'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-0.5">{student.name}</h2>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            {/* Server save status */}
            <div className="text-[11px] font-sans-kr px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 flex items-center gap-1">
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                  <span className="text-cyan-300">서버 저장 중...</span>
                </>
              ) : saveSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300 font-bold">서버 보존 완료!</span>
                </>
              ) : (
                <span className="text-slate-400">서버 동기화 상태</span>
              )}
            </div>

            {/* Change PIN button */}
            <button
              onClick={onOpenChangePin}
              className="btn-push bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 font-sans-kr font-bold"
            >
              <Lock className="w-3.5 h-3.5 text-amber-300" />
              <span>비번 변경</span>
            </button>
          </div>
        </div>

        {/* 5 Tasks checklist */}
        <div className="space-y-3.5 overflow-y-auto pr-1 py-4 flex-1">
          {/* 1. 국어 주제 글쓰기 */}
          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs px-2 py-0.5 rounded font-bold">
                  국어
                </span>
                <h3 className="font-bold text-base text-white">📖 국어 주제 글쓰기</h3>
              </div>
              <p className="text-xs text-slate-300 font-sans-kr pl-1">
                {taskDescriptions.korean || '📌 목표: 일주일에 정해진 주제 글쓰기 1편 완성하기'}
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => handleTaskToggle('korean', true)}
                className={`btn-push flex-1 sm:flex-none px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 ${
                  student.tasks.korean
                    ? 'bg-emerald-500 text-slate-950 border-b-4 border-emerald-700'
                    : 'bg-slate-800 text-slate-500 border border-slate-700 opacity-60'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" /> 다 했어요!
              </button>
              <button
                onClick={() => handleTaskToggle('korean', false)}
                className={`btn-push flex-1 sm:flex-none px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 ${
                  !student.tasks.korean
                    ? 'bg-rose-500 text-white border-b-4 border-rose-700'
                    : 'bg-slate-800 text-slate-500 border border-slate-700 opacity-60'
                }`}
              >
                <Clock className="w-4 h-4" /> 아직 못했어요
              </button>
            </div>
          </div>

          {/* 2. 진로 주제 글쓰기 */}
          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs px-2 py-0.5 rounded font-bold">
                  진로
                </span>
                <h3 className="font-bold text-base text-white">🚀 주제 진로 글쓰기</h3>
              </div>
              <p className="text-xs text-slate-300 font-sans-kr pl-1">
                {taskDescriptions.career || '📌 주간 목표: 이번 주 나의 꿈과 직업 탐색 글 작성하기'}
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => handleTaskToggle('career', true)}
                className={`btn-push flex-1 sm:flex-none px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 ${
                  student.tasks.career
                    ? 'bg-emerald-500 text-slate-950 border-b-4 border-emerald-700'
                    : 'bg-slate-800 text-slate-500 border border-slate-700 opacity-60'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" /> 다 했어요!
              </button>
              <button
                onClick={() => handleTaskToggle('career', false)}
                className={`btn-push flex-1 sm:flex-none px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 ${
                  !student.tasks.career
                    ? 'bg-rose-500 text-white border-b-4 border-rose-700'
                    : 'bg-slate-800 text-slate-500 border border-slate-700 opacity-60'
                }`}
              >
                <Clock className="w-4 h-4" /> 아직 못했어요
              </button>
            </div>
          </div>

          {/* 3. 수학 문제지 (4단계 진도 게이지) */}
          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-700 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-blue-500/20 text-blue-300 border border-blue-500/40 text-xs px-2 py-0.5 rounded font-bold">
                    수학
                  </span>
                  <h3 className="font-bold text-base text-white">📐 수학 문제지 (주간 진도 체크)</h3>
                </div>
                <p className="text-xs text-slate-300 font-sans-kr pl-1">
                  {taskDescriptions.math || '📌 단원 목표: 지정 범위 문제 해결하기'}
                </p>
              </div>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                  student.tasks.math === 100
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400'
                    : student.tasks.math > 0
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {student.tasks.math}% 진행중
              </span>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <div className="text-[11px] text-cyan-300 font-sans-kr mb-2 flex items-center justify-between">
                <span>💡 이번 주에 공부한 단계 선택 (25% 이상 클릭 시 체크 인정):</span>
                <button
                  onClick={() => handleGaugeChange('math', 0)}
                  className="text-[10px] text-slate-400 hover:text-rose-400 underline transition-colors"
                >
                  초기화(0%)
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                {[25, 50, 75, 100].map((val) => (
                  <button
                    key={val}
                    onClick={() => handleGaugeChange('math', val)}
                    className={`btn-push py-2 rounded-xl text-xs font-bold ${
                      student.tasks.math >= val
                        ? 'bg-cyan-400 text-slate-950 border-b-4 border-cyan-600'
                        : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {val}% {val === 100 ? '완료 🎉' : ''}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 4. 영어 펭톡 (4단계 진도 게이지) */}
          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-700 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs px-2 py-0.5 rounded font-bold">
                    영어
                  </span>
                  <h3 className="font-bold text-base text-white">🐧 영어 펭톡 (주간 진도 체크)</h3>
                </div>
                <p className="text-xs text-slate-300 font-sans-kr pl-1">
                  {taskDescriptions.pengtalk || '📌 단원 목표: 이번 단원 AI 말하기 미션 달성하기'}
                </p>
              </div>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                  student.tasks.pengtalk === 100
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400'
                    : student.tasks.pengtalk > 0
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {student.tasks.pengtalk}% 진행중
              </span>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <div className="text-[11px] text-cyan-300 font-sans-kr mb-2 flex items-center justify-between">
                <span>💡 이번 주에 공부한 단계 선택 (25% 이상 클릭 시 체크 인정):</span>
                <button
                  onClick={() => handleGaugeChange('pengtalk', 0)}
                  className="text-[10px] text-slate-400 hover:text-rose-400 underline transition-colors"
                >
                  초기화(0%)
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                {[25, 50, 75, 100].map((val) => (
                  <button
                    key={val}
                    onClick={() => handleGaugeChange('pengtalk', val)}
                    className={`btn-push py-2 rounded-xl text-xs font-bold ${
                      student.tasks.pengtalk >= val
                        ? 'bg-amber-400 text-slate-950 border-b-4 border-amber-600'
                        : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {val}% {val === 100 ? '완료 🎉' : ''}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 5. 영어 문제지 (요일별 스탬프) */}
          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-700 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs px-2 py-0.5 rounded font-bold">
                    영어
                  </span>
                  <h3 className="font-bold text-base text-white">🔤 영어 문제지 (매일 1장씩)</h3>
                </div>
                <p className="text-xs text-slate-300 font-sans-kr pl-1">
                  {taskDescriptions.engpaper || '📌 목표: 월~금 요일별 1장씩 풀고 체크하기'}
                </p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => handleTaskToggle('engpaper', true)}
                  className={`btn-push flex-1 sm:flex-none px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 ${
                    student.tasks.engpaper
                      ? 'bg-emerald-500 text-slate-950 border-b-4 border-emerald-700'
                      : 'bg-slate-800 text-slate-500 border border-slate-700 opacity-60'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" /> 다 했어요!
                </button>
                <button
                  onClick={() => handleTaskToggle('engpaper', false)}
                  className={`btn-push flex-1 sm:flex-none px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 ${
                    !student.tasks.engpaper
                      ? 'bg-rose-500 text-white border-b-4 border-rose-700'
                      : 'bg-slate-800 text-slate-500 border border-slate-700 opacity-60'
                  }`}
                >
                  <Clock className="w-4 h-4" /> 아직 못했어요
                </button>
              </div>
            </div>

            {/* Daily stamp buttons */}
            <div className="pt-2 border-t border-slate-800/80">
              <div className="text-[11px] text-slate-400 mb-2 font-sans-kr flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span>요일별 스탬프 도장 (3개 이상 시 자동 완료 인정):</span>
              </div>
              <div className="grid grid-cols-5 gap-2 text-center">
                {(['mon', 'tue', 'wed', 'thu', 'fri'] as const).map((day) => {
                  const dayLabels: Record<string, string> = {
                    mon: '월',
                    tue: '화',
                    wed: '수',
                    thu: '목',
                    fri: '금',
                  };
                  const isStamped = student.tasks.engDays?.[day] || false;
                  return (
                    <button
                      key={day}
                      onClick={() => handleDayStampToggle(day)}
                      className={`p-2.5 rounded-xl border transition-all ${
                        isStamped
                          ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      <div className="text-[11px] font-bold">{dayLabels[day]}</div>
                      <div className="text-xl mt-1 select-none">{isStamped ? '🔥' : '⚪'}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer completion button */}
        <div className="pt-3 border-t border-slate-700/80 text-center shrink-0">
          <button
            onClick={onClose}
            className="btn-push w-full sm:w-auto bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black px-8 py-3 rounded-2xl text-base border-b-4 border-blue-700 shadow-lg"
          >
            ✨ 체크 완료하고 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
