import React, { useState, useEffect, useCallback } from 'react';
import { X, Delete } from 'lucide-react';
import { Student } from '../types';

interface PinModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (student: Student) => void;
}

export const PinModal: React.FC<PinModalProps> = ({
  student,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setErrorMsg('');
    }
  }, [isOpen]);

  const verifyPin = useCallback(
    (enteredPin: string) => {
      if (!student) return;
      if (enteredPin === student.pin) {
        onSuccess(student);
      } else {
        setErrorMsg('❌ 비밀번호가 올바르지 않습니다! (초기: 0000)');
        setTimeout(() => {
          setPin('');
          setErrorMsg('');
        }, 1000);
      }
    },
    [student, onSuccess]
  );

  const handlePressNum = useCallback(
    (num: string) => {
      if (pin.length < 4) {
        const next = pin + num;
        setPin(next);
        if (next.length === 4) {
          verifyPin(next);
        }
      }
    },
    [pin, verifyPin]
  );

  const handleBackspace = useCallback(() => {
    setPin((prev) => prev.slice(0, -1));
  }, []);

  const handleClear = useCallback(() => {
    setPin('');
  }, []);

  // Keyboard support
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handlePressNum(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handlePressNum, handleBackspace, onClose]);

  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="game-card max-w-sm w-full rounded-3xl p-6 border-2 border-cyan-400/80 text-center relative my-auto animate-pop shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full flex items-center justify-center border border-slate-600 transition-colors"
          aria-label="닫기"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 mx-auto flex items-center justify-center text-3xl mb-2 shadow-inner">
          {student.avatar || '🐱'}
        </div>
        <h3 className="text-2xl font-black text-white">
          {student.num}번 {student.name}
        </h3>
        <p className="text-xs text-cyan-300 font-sans-kr mt-1 mb-4">
          4자리 비밀번호(PIN)를 입력하세요 <span className="text-slate-400">(초기: 0000)</span>
        </p>

        {/* 4 dots display */}
        <div className="flex justify-center gap-3 mb-6">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-4 h-4 rounded-full transition-all duration-150 ${
                idx < pin.length
                  ? 'bg-cyan-400 border-2 border-cyan-300 shadow-md shadow-cyan-400/50 scale-110'
                  : 'bg-slate-700 border border-slate-600'
              }`}
            />
          ))}
        </div>

        {/* Numeric keypad */}
        <div className="grid grid-cols-3 gap-2.5 max-w-[240px] mx-auto font-black text-xl">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((n) => (
            <button
              key={n}
              onClick={() => handlePressNum(n)}
              className="btn-push py-3 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 rounded-2xl text-white border border-slate-700 select-none"
            >
              {n}
            </button>
          ))}
          <button
            onClick={handleClear}
            className="btn-push py-3 bg-rose-950/60 text-rose-400 hover:bg-rose-900/60 rounded-2xl border border-rose-800 text-xs font-sans-kr font-bold select-none"
          >
            지우기
          </button>
          <button
            onClick={() => handlePressNum('0')}
            className="btn-push py-3 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 rounded-2xl text-white border border-slate-700 select-none"
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            className="btn-push py-3 bg-slate-800 text-amber-400 hover:bg-slate-700 rounded-2xl border border-slate-700 flex items-center justify-center select-none"
            aria-label="한 글자 지우기"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        <div className="text-xs text-rose-400 font-sans-kr font-bold mt-4 h-5">
          {errorMsg}
        </div>
      </div>
    </div>
  );
};
