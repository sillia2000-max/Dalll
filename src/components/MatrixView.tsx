import React from 'react';
import { Student } from '../types';
import { getCompletedTaskCount } from './StudentCard';
import { BarChart3, CheckCircle2, Circle } from 'lucide-react';

interface MatrixViewProps {
  students: Student[];
  onSelectStudent: (student: Student) => void;
}

export const MatrixView: React.FC<MatrixViewProps> = ({ students, onSelectStudent }) => {
  return (
    <section className="game-card p-4 sm:p-7 rounded-3xl overflow-x-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-2">
        <h2 className="text-xl sm:text-2xl font-bold text-amber-300 flex items-center gap-2.5">
          <BarChart3 className="w-6 h-6" />
          <span>우리반 과제 종합 체크 현황판</span>
        </h2>
        <span className="text-xs text-slate-400 font-sans-kr">
          * 5개 미션 완수 시 <span className="text-amber-300 font-bold">👑 올클리어 컬러 승급!</span>
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[720px]">
          <thead>
            <tr className="border-b border-slate-700/80 text-xs sm:text-sm text-cyan-300 bg-slate-900/80">
              <th className="p-3.5 font-bold rounded-tl-xl">번호 및 학생 이름</th>
              <th className="p-3.5 font-bold">📖 국어 (주1편)</th>
              <th className="p-3.5 font-bold">🚀 진로 글쓰기</th>
              <th className="p-3.5 font-bold">📐 수학 (진도율)</th>
              <th className="p-3.5 font-bold">🐧 펭톡 (진도율)</th>
              <th className="p-3.5 font-bold">🔤 영어 문제지</th>
              <th className="p-3.5 font-bold text-center rounded-tr-xl">달성률</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 text-sm font-sans-kr">
            {students.map((st) => {
              const count = getCompletedTaskCount(st);
              const percent = Math.round((count / 5) * 100);
              const isAllClear = count === 5;

              return (
                <tr
                  key={st.id}
                  onClick={() => onSelectStudent(st)}
                  className={`hover:bg-slate-800/60 cursor-pointer transition-colors ${
                    isAllClear ? 'bg-amber-950/20' : ''
                  }`}
                >
                  <td className="p-3.5 font-bold flex items-center gap-2">
                    <span className="text-xs text-slate-400 w-8">{st.num}번</span>
                    <span className="text-lg">{st.avatar}</span>
                    <span className="text-white hover:text-cyan-300 transition-colors">{st.name}</span>
                    {isAllClear && (
                      <span className="text-[11px] text-amber-300 font-bold bg-amber-400/20 border border-amber-400/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                        👑 완수
                      </span>
                    )}
                  </td>
                  <td className="p-3.5">
                    {st.tasks.korean ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-xs bg-emerald-950/40 px-2 py-1 rounded-md border border-emerald-500/30">
                        <CheckCircle2 className="w-3.5 h-3.5" /> 완료
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-500 text-xs">
                        <Circle className="w-3.5 h-3.5" /> 미완료
                      </span>
                    )}
                  </td>
                  <td className="p-3.5">
                    {st.tasks.career ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-xs bg-emerald-950/40 px-2 py-1 rounded-md border border-emerald-500/30">
                        <CheckCircle2 className="w-3.5 h-3.5" /> 완료
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-500 text-xs">
                        <Circle className="w-3.5 h-3.5" /> 미완료
                      </span>
                    )}
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        st.tasks.math === 100
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : st.tasks.math > 0
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {st.tasks.math}% {st.tasks.math === 100 ? '🎉' : ''}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        st.tasks.pengtalk === 100
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : st.tasks.pengtalk > 0
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {st.tasks.pengtalk}% {st.tasks.pengtalk === 100 ? '🎉' : ''}
                    </span>
                  </td>
                  <td className="p-3.5">
                    {st.tasks.engpaper ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-xs bg-emerald-950/40 px-2 py-1 rounded-md border border-emerald-500/30">
                        <CheckCircle2 className="w-3.5 h-3.5" /> 완료
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-500 text-xs">
                        <Circle className="w-3.5 h-3.5" /> 미완료
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-center font-black">
                    <span
                      className={`text-sm ${
                        isAllClear ? 'text-amber-300 text-base font-black' : 'text-cyan-400'
                      }`}
                    >
                      {percent}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};
