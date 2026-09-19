import React, { useEffect, useRef } from 'react';
import { X, Tablet, Smartphone, Copy, Check } from 'lucide-react';
import QRCode from 'qrcode';

interface QrModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (title: string, message: string) => void;
}

export const QrModal: React.FC<QrModalProps> = ({ isOpen, onClose, onShowToast }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const url = window.location.href;
      QRCode.toCanvas(canvasRef.current, url, {
        width: 200,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      }).catch((err) => {
        console.error('QR code generation error:', err);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      onShowToast('🔗 주소 복사 완료', '현재 접속 URL이 클립보드에 복사되었습니다.');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="game-card max-w-sm w-full rounded-3xl p-6 border-2 border-indigo-400/80 text-center relative my-auto animate-pop shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 bg-slate-800 text-slate-300 hover:text-white rounded-full flex items-center justify-center border border-slate-600 transition-colors"
          aria-label="닫기"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 mx-auto flex items-center justify-center mb-3">
          <Tablet className="w-7 h-7" />
        </div>

        <h3 className="text-xl font-black text-indigo-300 mb-1">
          📱 태블릿 / 모바일 빠른 접속
        </h3>
        <p className="text-xs text-slate-300 font-sans-kr mb-4">
          기기 카메라로 QR을 스캔하면 이 주간 미션 파티 보드로 즉시 연결됩니다!
        </p>

        <div className="bg-white p-3.5 rounded-2xl inline-block shadow-xl mb-4">
          <canvas ref={canvasRef} className="rounded-lg max-w-full" />
        </div>

        <div className="space-y-2">
          <button
            onClick={handleCopyLink}
            className="btn-push w-full bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 py-2.5 rounded-xl text-xs font-sans-kr font-bold flex items-center justify-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? '주소 복사됨!' : '접속 주소(URL) 복사하기'}</span>
          </button>
          <p className="text-[11px] text-cyan-300 font-sans-kr font-bold">
            * 교실 TV나 태블릿 거치대에 띄워놓고 사용하세요!
          </p>
        </div>
      </div>
    </div>
  );
};
