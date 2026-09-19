import React from 'react';
import { Sparkles, Trophy, QrCode, ShieldCheck, Server, RefreshCw } from 'lucide-react';
import { TaskDescriptions } from '../types';

interface HeaderProps {
  taskDescriptions: TaskDescriptions;
  totalPercent: number;
  isAdminLoggedIn: boolean;
  isServerConnected: boolean;
  isSyncing: boolean;
  onOpenQr: () => void;
  onAdminClick: () => void;
  onRefreshData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  taskDescriptions,
  totalPercent,
  isAdminLoggedIn,
  isServerConnected,
  isSyncing,
  onOpenQr,
  onAdminClick,
  onRefreshData,
}) => {
  return (
    <header className="max-w-7xl mx-auto mb-6">
      <div className="game-card p-4 sm:p-6 rounded-3xl flex flex-col xl:flex-row items-center justify-between gap-5 border-amber-400/30">
        {/* Title area */}
        <div className="flex items-center gap-4 text-center sm:text-left w-full xl:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-3xl sm:text-4xl shadow-lg text-slate-950 font-black ring-4 ring-yellow-300/25 shrink-0">
              ⭐
            </div>
            <div>
              <div className="flex items-center flex-wrap gap-2">
                <span className="bg-amber-400 text-slate-950 text-xs px-2.5 py-0.5 rounded-full font-black">
                  5학년
                </span>
                <span className="text-xs text-cyan-300 font-sans-kr font-bold">
                  {taskDescriptions.weekHeader || '이번 주 과제 수행 현황'}
                </span>
                {isAdminLoggedIn && (
                  <span className="bg-rose-500 text-white text-[11px] px-2.5 py-0.5 rounded-full font-bold animate-pulse flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> 관리자 로그인 중
                  </span>
                )}
                {/* Server persistence badge */}
                <div
                  className={`flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-sans-kr font-medium ${
                    isServerConnected
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                  title={isServerConnected ? '중앙 서버에 실시간 자동 저장 중' : '브라우저 로컬 저장소에 자동 저장 중'}
                >
                  <Server className="w-3 h-3" />
                  <span>{isServerConnected ? '서버 지속 저장' : '자동 저장 활성화'}</span>
                  {isSyncing && <RefreshCw className="w-2.5 h-2.5 animate-spin ml-0.5" />}
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl xl:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-cyan-300 tracking-wide mt-1 flex items-center gap-2">
                우리반 주간 미션 파티! 🚀
              </h1>
            </div>
          </div>

          {/* Mobile Admin toggle */}
          <button
            id="mobile-admin-btn"
            onClick={onAdminClick}
            className="xl:hidden btn-push bg-emerald-600 hover:bg-emerald-500 text-white font-bold p-3 rounded-2xl text-xs flex items-center gap-1 border-b-4 border-emerald-800"
            title="관리자 모드"
          >
            <ShieldCheck className="w-5 h-5 text-amber-300" />
          </button>
        </div>

        {/* Class progress and action buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
          {/* Class progress bar */}
          <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-700/70 w-full sm:w-72 shadow-inner">
            <div className="flex justify-between text-xs mb-1.5 font-bold">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-400" />
                우리반 전체 달성률
              </span>
              <span className="text-cyan-400 font-extrabold text-sm">{totalPercent}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden p-0.5 border border-slate-700">
              <div
                className="bg-gradient-to-r from-cyan-400 via-emerald-400 to-amber-300 h-full rounded-full transition-all duration-500"
                style={{ width: `${totalPercent}%` }}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              id="refresh-btn"
              onClick={onRefreshData}
              className="btn-push bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold px-3 py-3 rounded-2xl text-sm flex items-center gap-1.5 border-b-4 border-slate-950"
              title="서버 데이터 새로고침"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-cyan-400' : ''}`} />
            </button>

            <button
              id="qr-btn"
              onClick={onOpenQr}
              className="btn-push bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-3 rounded-2xl text-sm flex items-center gap-2 border-b-4 border-indigo-800 shrink-0"
            >
              <QrCode className="w-4 h-4 text-yellow-300" />
              <span>TV/태블릿 QR</span>
            </button>

            <button
              id="desktop-admin-btn"
              onClick={onAdminClick}
              className="hidden xl:flex btn-push bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-3 rounded-2xl text-sm items-center gap-2 border-b-4 border-emerald-800 shrink-0"
            >
              <ShieldCheck className="w-4 h-4 text-amber-300" />
              <span>{isAdminLoggedIn ? '관리자 설정 열기' : '교사/관리자 모드'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
