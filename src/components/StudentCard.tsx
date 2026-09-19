import React from 'react';
import { Student } from '../types';

interface StudentCardProps {
  student: Student;
  onClick: () => void;
}

export const getCompletedTaskCount = (student: Student): number => {
  let count = 0;
  if (student.tasks.korean) count++;
  if (student.tasks.career) count++;
  if (student.tasks.math >= 25) count++;
  if (student.tasks.pengtalk >= 25) count++;
  if (student.tasks.engpaper) count++;
  return count;
};

export const StudentCard: React.FC<StudentCardProps> = ({ student, onClick }) => {
  const count = getCompletedTaskCount(student);
  const isAllClear = count === 5;

  return (
    <div
      id={`student-card-${student.id}`}
      onClick={onClick}
      className={`game-card p-4 rounded-3xl cursor-pointer relative overflow-hidden group border-2 transition-all ${
        isAllClear
          ? 'border-amber-400 bg-amber-950/20 shadow-amber-400/20'
          : 'border-slate-700/80 hover:border-cyan-400/60'
      }`}
    >
      {isAllClear && (
        <div className="absolute -right-7 -top-7 w-20 h-20 bg-amber-400 rotate-45 flex items-end justify-center pb-1 text-slate-950 font-black text-[10px] shadow-lg pointer-events-none">
          올클리어
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="w-13 h-13 rounded-2xl bg-slate-800 text-2xl flex items-center justify-center border border-slate-700 group-hover:scale-105 transition-transform shrink-0 shadow-md">
          {student.avatar || '🦁'}
        </div>
        <div className="overflow-hidden">
          <span className="text-[11px] font-bold text-cyan-300 font-sans-kr block">
            {student.num}번 학생
          </span>
          <h3 className="text-xl font-extrabold text-white leading-tight truncate">
            {student.name}
          </h3>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs">
          <span
            title="국어 글쓰기"
            className={student.tasks.korean ? 'opacity-100 scale-110' : 'opacity-30 grayscale'}
          >
            📖
          </span>
          <span
            title="진로 글쓰기"
            className={student.tasks.career ? 'opacity-100 scale-110' : 'opacity-30 grayscale'}
          >
            🚀
          </span>
          <span
            title="수학"
            className={student.tasks.math >= 25 ? 'opacity-100 scale-110' : 'opacity-30 grayscale'}
          >
            📐
          </span>
          <span
            title="펭톡"
            className={student.tasks.pengtalk >= 25 ? 'opacity-100 scale-110' : 'opacity-30 grayscale'}
          >
            🐧
          </span>
          <span
            title="영어 문제지"
            className={student.tasks.engpaper ? 'opacity-100 scale-110' : 'opacity-30 grayscale'}
          >
            🔤
          </span>
        </div>

        <span
          className={`text-xs font-black font-sans-kr flex items-center gap-1 ${
            isAllClear ? 'text-amber-300' : 'text-cyan-400'
          }`}
        >
          <span>{count} / 5</span>
          <span>{isAllClear ? '👑' : '⭐'}</span>
        </span>
      </div>
    </div>
  );
};
