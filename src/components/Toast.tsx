import React from 'react';
import { CheckCircle2, Sparkles, X } from 'lucide-react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce">
      <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-[#0F141C] border border-brand-lime/50 shadow-glow-lg text-xs font-bold text-white">
        <div className="p-1 rounded-full bg-brand-lime text-black">
          <CheckCircle2 className="w-4 h-4" />
        </div>
        <span>{message}</span>
        <button onClick={onClose} className="ml-2 text-slate-400 hover:text-white cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
