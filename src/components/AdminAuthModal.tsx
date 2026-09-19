import React, { useState } from 'react';
import { X, Shield, KeyRound, Loader2 } from 'lucide-react';
import { verifyAdminPinApi } from '../utils/api';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!pin.trim()) {
      setErrorMsg('비밀번호를 입력해주세요.');
      return;
    }

    setIsVerifying(true);
    setErrorMsg('');

    try {
      const isValid = await verifyAdminPinApi(pin.trim());
      if (isValid) {
        setPin('');
        onLoginSuccess();
      } else {
        setErrorMsg('❌ 관리자 비밀번호가 올바르지 않습니다.');
      }
    } catch {
      setErrorMsg('비밀번호 확인 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="game-card max-w-sm w-full rounded-3xl p-6 border-2 border-emerald-400/80 text-center relative my-auto animate-pop shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 bg-slate-800 text-slate-300 hover:text-white rounded-full flex items-center justify-center border border-slate-600 transition-colors"
          aria-label="닫기"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 mx-auto flex items-center justify-center text-3xl mb-2 shadow-inner">
          👑
        </div>

        <h3 className="text-2xl font-black text-white">교사 / 관리자 로그인</h3>
        <p className="text-xs text-emerald-300 font-sans-kr mt-1 mb-4">
          선생님 전용 관리자 비밀번호를 입력하세요
        </p>

        <div className="relative mb-3">
          <input
            type="password"
            maxLength={16}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="관리자 비밀번호"
            className="w-full bg-slate-900 border border-emerald-400/50 rounded-2xl p-3 text-center text-2xl tracking-widest text-white focus:outline-none focus:border-emerald-400 font-bold"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit();
            }}
            autoFocus
          />
        </div>

        {errorMsg && (
          <div className="text-xs text-rose-400 font-sans-kr font-bold mb-3">
            {errorMsg}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={isVerifying}
          className="btn-push w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black py-3 rounded-2xl border-b-4 border-emerald-700 flex items-center justify-center gap-2"
        >
          {isVerifying ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>확인 중...</span>
            </>
          ) : (
            <span>관리자 인증하기 🚀</span>
          )}
        </button>
      </div>
    </div>
  );
};
