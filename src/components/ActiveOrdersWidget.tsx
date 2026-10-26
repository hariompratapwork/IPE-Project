import React, { useState, useEffect } from 'react';
import { Clock, QrCode, Scan, ArrowRight } from 'lucide-react';
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

  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(0);

  useEffect(() => {
    if (activeOrder.status === 'ACTIVE_RENTAL' && activeOrder.rentalEndTime) {
      const diff = Math.max(0, Math.floor((activeOrder.rentalEndTime - Date.now()) / 1000));
      setTimeLeftSeconds(diff);

      const interval = setInterval(() => {
        const remaining = Math.max(0, Math.floor((activeOrder.rentalEndTime! - Date.now()) / 1000));
        setTimeLeftSeconds(remaining);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [activeOrder]);

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="fixed top-24 right-4 z-40 animate-pulse">
      <button
        onClick={onOpenVerificationModal}
        className="p-3.5 rounded-2xl bg-[#0F141C]/95 border-2 border-brand-lime shadow-glow-lg text-left flex items-center gap-3 hover:scale-105 transition-all cursor-pointer"
      >
        <div className="p-2 rounded-xl bg-brand-lime text-black font-extrabold">
          {activeOrder.status === 'ACTIVE_RENTAL' ? <Clock className="w-5 h-5 animate-spin" /> : <QrCode className="w-5 h-5" />}
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-lime">
              {activeOrder.status === 'ACTIVE_RENTAL' ? 'Live Rental Active' : 'Pickup Ready'}
            </span>
            <span className="text-[10px] font-mono font-bold text-white">{activeOrder.pickupCode}</span>
          </div>
          
          <div className="text-sm font-extrabold text-white">
            {activeOrder.status === 'ACTIVE_RENTAL' ? (
              <span className="font-mono text-brand-lime">{formatTime(timeLeftSeconds)} remaining</span>
            ) : (
              <span>Order {activeOrder.orderId}</span>
            )}
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-brand-lime ml-1" />
      </button>
    </div>
  );
};
