import React from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';

interface ToastModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

export const ToastModal: React.FC<ToastModalProps> = ({
  isOpen,
  title,
  message,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="game-card max-w-xs w-full rounded-3xl p-5 border-2 border-cyan-400 text-center relative my-auto animate-pop shadow-2xl">
        <div className="text-4xl mb-2">💡</div>
        <h4 className="text-lg font-black text-white mb-1">{title}</h4>
        <p className="text-xs text-slate-300 font-sans-kr mb-5 leading-relaxed">{message}</p>
        <button
          onClick={onClose}
          className="btn-push w-full bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black py-2.5 rounded-xl text-xs border-b-4 border-cyan-600 transition-colors"
        >
          확인
        </button>
      </div>
    </div>
  );
};
