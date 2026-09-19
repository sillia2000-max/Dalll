import React, { useState } from 'react';
import { X, KeyRound } from 'lucide-react';
import { Student } from '../types';

interface ChangePinModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onSavePin: (newPin: string) => Promise<void>;
}

export const ChangePinModal: React.FC<ChangePinModalProps> = ({
  student,
  isOpen,
  onClose,
  onSavePin,
}) => {
  const [newPin, setNewPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !student) return null;

  const handleSubmit = async () => {
    const trimmed = newPin.trim();
    if (trimmed.length !== 4 || isNaN(Number(trimmed))) {
      setErrorMsg('비밀번호는 4자리 숫자여야 합니다.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await onSavePin(trimmed);
      setNewPin('');
      onClose();
    } catch {
      setErrorMsg('서버 저장 실패. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="game-card max-w-sm w-full rounded-3xl p-6 border-2 border-amber-400/80 text-center relative my-auto animate-pop shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 bg-slate-800 text-slate-300 hover:text-white rounded-full flex items-center justify-center border border-slate-600 transition-colors"
          aria-label="닫기"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-400/40 mx-auto flex items-center justify-center mb-3">
          <KeyRound className="w-7 h-7" />
        </div>

        <h3 className="text-xl font-black text-amber-300 mb-1">
          {student.name} 학생 4자리 비밀번호 변경
        </h3>
        <p className="text-xs text-slate-300 font-sans-kr mb-4">
          새로 사용할 4자리 숫자를 입력하세요. (서버에 즉시 보존됩니다)
        </p>

        <input
          type="password"
          maxLength={4}
          pattern="[0-9]*"
          inputMode="numeric"
          value={newPin}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, '');
            setNewPin(val);
          }}
          placeholder="••••"
          className="w-full bg-slate-900 border border-amber-400/50 rounded-2xl p-3 text-center text-3xl tracking-widest text-white mb-2 focus:outline-none focus:border-amber-400 font-bold"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit();
          }}
          autoFocus
        />

        {errorMsg && (
          <div className="text-xs text-rose-400 font-sans-kr font-bold mb-3 h-4">
            {errorMsg}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={isSubmitting || newPin.length !== 4}
          className="btn-push w-full bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-black py-3 rounded-2xl border-b-4 border-amber-600 mt-2"
        >
          {isSubmitting ? '저장 중...' : '새 비밀번호 서버 저장하기'}
        </button>
      </div>
    </div>
  );
};
