import React, { useState, useEffect } from 'react';
import { Clock, QrCode, ArrowRight, AlertTriangle, AlertCircle, CheckCircle2, RotateCcw } from 'lucide-react';
import { RentalOrder } from '../types';

interface ActiveOrdersWidgetProps {
  activeOrder: RentalOrder | null;
  onOpenVerificationModal: () => void;
}

export const ActiveOrdersWidget: React.FC<ActiveOrdersWidgetProps> = ({
  activeOrder,
  onOpenVerificationModal,
}) => {
  if (!activeOrder) return null;

  const [currentTimeMs, setCurrentTimeMs] = useState<number>(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTimeMs(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const isRentalLive = 
    activeOrder.status === 'RENTAL_IN_PROGRESS' || 
    activeOrder.status === 'ACTIVE_RENTAL' || 
    activeOrder.status === 'RENTAL_OVERDUE';

  const startTime = activeOrder.rentalStartTime || null;
  const totalDurationMs = (activeOrder.durationMode === 'HOURLY' ? activeOrder.durationValue * 3600 : activeOrder.durationValue * 24 * 3600) * 1000;
  const deadlineTime = activeOrder.rentalEndTime || (startTime ? startTime + totalDurationMs : null);

  const remainingMs = deadlineTime ? deadlineTime - currentTimeMs : 0;
  const isOverdue = isRentalLive && remainingMs <= 0;
  const overdueMs = isOverdue ? Math.abs(remainingMs) : 0;

  const formatSecs = (ms: number) => {
    const totalSecs = Math.floor(Math.max(0, ms) / 1000);
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const getStatusDisplay = () => {
    if (isOverdue) {
      return {
        label: 'RENTAL OVERDUE',
        detail: `+${formatSecs(overdueMs)} overdue`,
        borderClass: 'border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.3)]',
        badgeBg: 'bg-rose-500 text-white',
        icon: <AlertCircle className="w-5 h-5 text-rose-400" />
      };
    }
    if (isRentalLive) {
      return {
        label: 'RENTAL IN PROGRESS',
        detail: `${formatSecs(remainingMs)} remaining`,
        borderClass: 'border-[#C8FF00] shadow-[0_0_20px_rgba(200,255,0,0.25)]',
        badgeBg: 'bg-[#C8FF00] text-black',
        icon: <Clock className="w-5 h-5 text-[#C8FF00] animate-spin" />
      };
    }
    if (activeOrder.status === 'PAYMENT_PROOF_SUBMITTED') {
      return {
        label: 'AWAITING OWNER CONFIRMATION',
        detail: 'Proof submitted to owner',
        borderClass: 'border-cyan-400/60 shadow-[0_0_15px_rgba(34,211,238,0.2)]',
        badgeBg: 'bg-cyan-400 text-black',
        icon: <Clock className="w-5 h-5 text-cyan-400" />
      };
    }
    if (activeOrder.status === 'DEPOSIT_REFUND_PENDING_CONFIRMATION') {
      return {
        label: 'DEPOSIT REFUND PENDING',
        detail: `₹${activeOrder.item.securityDeposit} deposit return`,
        borderClass: 'border-purple-400/60 shadow-[0_0_15px_rgba(192,132,252,0.2)]',
        badgeBg: 'bg-purple-400 text-black',
        icon: <RotateCcw className="w-5 h-5 text-purple-400" />
      };
    }
    if (activeOrder.status === 'DEPOSIT_REFUND_COMPLETED' || activeOrder.status === 'COMPLETED') {
      return {
        label: 'RENTAL COMPLETED',
        detail: 'Deposit refund confirmed',
        borderClass: 'border-emerald-500/60',
        badgeBg: 'bg-emerald-500 text-black',
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />
      };
    }
    if (activeOrder.status === 'DISPUTED' || activeOrder.status === 'PAYMENT_DISPUTED') {
      return {
        label: 'PROBLEM REPORTED',
        detail: 'Moderator reviewing dispute',
        borderClass: 'border-rose-400/60',
        badgeBg: 'bg-rose-500 text-white',
        icon: <AlertTriangle className="w-5 h-5 text-rose-400" />
      };
    }
    return {
      label: 'READY FOR PICKUP',
      detail: `Pickup Code: ${activeOrder.pickupCode}`,
      borderClass: 'border-[#C8FF00] shadow-[0_0_20px_rgba(200,255,0,0.25)]',
      badgeBg: 'bg-[#C8FF00] text-black',
      icon: <QrCode className="w-5 h-5 text-[#C8FF00]" />
    };
  };

  const statusInfo = getStatusDisplay();

  return (
    <div className="fixed top-24 right-4 z-40">
      <button
        onClick={onOpenVerificationModal}
        className={`p-3.5 rounded-2xl bg-[#0F141C]/95 border-2 ${statusInfo.borderClass} text-left flex items-center gap-3 hover:scale-105 transition-all cursor-pointer backdrop-blur-md`}
      >
        <div className="p-2 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
          {statusInfo.icon}
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${statusInfo.badgeBg}`}>
              {statusInfo.label}
            </span>
            <span className="text-[10px] font-mono font-bold text-white">{activeOrder.pickupCode}</span>
          </div>
          
          <div className="text-xs font-extrabold text-white mt-1">
            <span className="font-mono">{statusInfo.detail}</span>
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-slate-400 ml-1" />
      </button>
    </div>
  );
};
