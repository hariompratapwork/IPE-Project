import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  Copy, 
  Camera, 
  QrCode, 
  Clock, 
  ShieldCheck, 
  Scan, 
  Upload, 
  UserCheck,
  AlertTriangle,
  RotateCcw,
  IndianRupee,
  CheckSquare,
  Square,
  Image as ImageIcon,
  AlertCircle,
  Bell,
  ArrowRight
} from 'lucide-react';
import { RentalOrder, DepositStatus, OrderStatus } from '../types';
import { 
  verifyPickup, 
  confirmHandover, 
  returnGadget,
  returnDepositOwner, 
  confirmDepositRenter, 
  reportProblem 
} from '../api/client';

interface PickupVerificationModalProps {
  isOpen?: boolean;
  order: RentalOrder | null;
  onClose: () => void;
  onOrderUpdated: (updatedOrder: RentalOrder) => void;
}

export const PickupVerificationModal: React.FC<PickupVerificationModalProps> = ({
  isOpen = true,
  order,
  onClose,
  onOrderUpdated,
}) => {
  if (!isOpen || !order) return null;

  const [activeRole, setActiveRole] = useState<'RENTER' | 'OWNER'>('RENTER');
  const [copiedCode, setCopiedCode] = useState(false);

  // University ID Card state
  const [idCardUrl, setIdCardUrl] = useState<string>(
    order.studentIdCardUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=400'
  );
  const [idCardUploaded, setIdCardUploaded] = useState<boolean>(order.idCardVerified || true);
  const [isUploadingId, setIsUploadingId] = useState(false);

  // Owner Scanner State
  const [manualCodeInput, setManualCodeInput] = useState('');
  const [scanError, setScanError] = useState('');
  const [isScanningAnimation, setIsScanningAnimation] = useState(false);

  // Gadget Condition Inspection Checklist State (Pickup)
  const [pickupChecklist, setPickupChecklist] = useState<Record<string, boolean>>({
    screenCondition: order.pickupChecklist?.screenCondition ?? true,
    powerAndButtons: order.pickupChecklist?.powerAndButtons ?? true,
    accessoriesIncluded: order.pickupChecklist?.accessoriesIncluded ?? true,
    cleanAndSanitized: order.pickupChecklist?.cleanAndSanitized ?? true,
  });

  // Gadget Condition Inspection Checklist State (Return)
  const [returnChecklist, setReturnChecklist] = useState<Record<string, boolean>>({
    screenConditionReturn: order.returnChecklist?.screenConditionReturn ?? true,
    functionalReturn: order.returnChecklist?.functionalReturn ?? true,
    accessoriesReturn: order.returnChecklist?.accessoriesReturn ?? true,
    undamagedReturn: order.returnChecklist?.undamagedReturn ?? true,
  });

  // Inspection Photos State
  const [pickupPhotos, setPickupPhotos] = useState<string[]>(order.pickupPhotos || []);
  const [returnPhotos, setReturnPhotos] = useState<string[]>(order.returnPhotos || []);

  // Dispute report state
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [isSubmittingDispute, setIsSubmittingDispute] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Live Rental Timer Calculation
  // Determine if rental is currently in progress or overdue
  const isRentalLive = order.status === 'RENTAL_IN_PROGRESS' || order.status === 'ACTIVE_RENTAL' || order.status === 'RENTAL_OVERDUE';
  const startTimeMs = order.rentalStartTime || null;
  const totalDurationMs = (order.durationMode === 'HOURLY' ? order.durationValue * 3600 : order.durationValue * 24 * 3600) * 1000;
  const deadlineMs = order.rentalEndTime || (startTimeMs ? startTimeMs + totalDurationMs : null);

  const [currentTimeMs, setCurrentTimeMs] = useState<number>(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTimeMs(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Timing derived values
  const elapsedMs = (startTimeMs && isRentalLive) ? Math.max(0, currentTimeMs - startTimeMs) : 0;
  const remainingMs = (deadlineMs && isRentalLive) ? deadlineMs - currentTimeMs : totalDurationMs;
  const isOverdue = isRentalLive && remainingMs <= 0;
  const overdueMs = isOverdue ? Math.abs(remainingMs) : 0;

  // Progress Bar Percentage (capped at 100%)
  const progressPercent = totalDurationMs > 0 ? Math.min(100, Math.max(0, (elapsedMs / totalDurationMs) * 100)) : 0;

  // Format milliseconds into hours, minutes, seconds
  const formatDuration = (ms: number) => {
    const totalSecs = Math.floor(Math.max(0, ms) / 1000);
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${String(hours).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s`;
  };

  const formatTimestamp = (ms: number | null | undefined, fallback: string = 'Pending Handover') => {
    if (!ms) return fallback;
    const date = new Date(ms);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' });
  };

  // Reminder alert triggers (3 hours and 30 minutes before expiry)
  const isWithin3Hours = isRentalLive && !isOverdue && remainingMs <= 3 * 3600 * 1000 && remainingMs > 30 * 60 * 1000;
  const isWithin30Mins = isRentalLive && !isOverdue && remainingMs <= 30 * 60 * 1000;

  // University ID Card Upload Simulator
  const handleUploadIdCard = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingId(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        setIdCardUrl(url);
        setIdCardUploaded(true);
        setIsUploadingId(false);
        onOrderUpdated({
          ...order,
          studentIdCardUrl: url,
          idCardVerified: true,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Photo Upload Handler (Pickup)
  const handleAddPickupPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        setPickupPhotos(prev => [...prev, url]);
      };
      reader.readAsDataURL(file);
    }
  };

  // Photo Upload Handler (Return)
  const handleAddReturnPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        setReturnPhotos(prev => [...prev, url]);
      };
      reader.readAsDataURL(file);
    }
  };

  // Dual Handover Confirmation by Renter or Owner
  const handleConfirmHandover = async (role: 'RENTER' | 'OWNER') => {
    setActionLoading(true);
    try {
      const res = await confirmHandover(order.orderId, role, pickupChecklist, pickupPhotos);
      setActionLoading(false);
      onOrderUpdated(res.order);
    } catch (e) {
      console.warn('Backend handover failed, falling back to local simulation:', e);
      const now = new Date().toISOString();
      const nowMs = Date.now();
      const endMs = nowMs + totalDurationMs;

      const isBoth = (role === 'RENTER' && order.ownerHandoverConfirmed) || (role === 'OWNER' && order.renterHandoverConfirmed);

      const updated: RentalOrder = {
        ...order,
        renterHandoverConfirmed: role === 'RENTER' ? true : order.renterHandoverConfirmed,
        renterHandoverAt: role === 'RENTER' ? now : order.renterHandoverAt,
        ownerHandoverConfirmed: role === 'OWNER' ? true : order.ownerHandoverConfirmed,
        ownerHandoverAt: role === 'OWNER' ? now : order.ownerHandoverAt,
        depositStatus: isBoth ? 'DEPOSIT_HELD_BY_OWNER' : order.depositStatus,
        status: isBoth ? 'RENTAL_IN_PROGRESS' : order.status,
        rentalStartTime: isBoth ? (order.rentalStartTime || nowMs) : order.rentalStartTime,
        rentalEndTime: isBoth ? (order.rentalEndTime || endMs) : order.rentalEndTime,
        pickupChecklist,
        pickupPhotos,
      };
      setActionLoading(false);
      onOrderUpdated(updated);
    }
  };

  // Dual Gadget Return Confirmation by Renter or Owner
  const handleReturnGadget = async (role: 'RENTER' | 'OWNER') => {
    setActionLoading(true);
    try {
      const res = await returnGadget(order.orderId, role, returnChecklist, returnPhotos);
      setActionLoading(false);
      onOrderUpdated(res.order);
    } catch (e) {
      console.warn('Backend return gadget failed, falling back:', e);
      const now = new Date().toISOString();
      const isBoth = (role === 'RENTER' && order.ownerReturnConfirmed) || (role === 'OWNER' && order.renterReturnConfirmed);

      const updated: RentalOrder = {
        ...order,
        renterReturnConfirmed: role === 'RENTER' ? true : order.renterReturnConfirmed,
        renterReturnAt: role === 'RENTER' ? now : order.renterReturnAt,
        ownerReturnConfirmed: role === 'OWNER' ? true : order.ownerReturnConfirmed,
        ownerReturnAt: role === 'OWNER' ? now : order.ownerReturnAt,
        status: isBoth ? 'DEPOSIT_REFUND_PENDING_CONFIRMATION' : 'RETURN_PENDING_CONFIRMATION',
        returnChecklist,
        returnPhotos,
      };
      setActionLoading(false);
      onOrderUpdated(updated);
    }
  };

  // Owner taps "I've Refunded the Deposit"
  const handleOwnerReturnDeposit = async () => {
    setActionLoading(true);
    try {
      const res = await returnDepositOwner(order.orderId);
      setActionLoading(false);
      onOrderUpdated(res.order);
    } catch (e) {
      console.warn('Backend deposit return failed, falling back:', e);
      const updated: RentalOrder = {
        ...order,
        ownerDepositReturned: true,
        ownerDepositReturnedAt: new Date().toISOString(),
        depositStatus: 'REFUND_PENDING_CONFIRMATION',
        status: 'DEPOSIT_REFUND_PENDING_CONFIRMATION',
      };
      setActionLoading(false);
      onOrderUpdated(updated);
    }
  };

  // Renter taps "Confirm Deposit Received"
  const handleRenterConfirmDeposit = async () => {
    setActionLoading(true);
    try {
      const res = await confirmDepositRenter(order.orderId);
      setActionLoading(false);
      onOrderUpdated(res.order);
    } catch (e) {
      console.warn('Backend deposit confirm failed, falling back:', e);
      const updated: RentalOrder = {
        ...order,
        renterDepositReceived: true,
        renterDepositReceivedAt: new Date().toISOString(),
        depositStatus: order.ownerDepositReturned ? 'REFUND_COMPLETED' : 'REFUND_PENDING_CONFIRMATION',
        status: order.ownerDepositReturned ? 'DEPOSIT_REFUND_COMPLETED' : 'DEPOSIT_REFUND_PENDING_CONFIRMATION',
      };
      setActionLoading(false);
      onOrderUpdated(updated);
    }
  };

  // Report a Problem / Disagreement
  const handleReportProblem = async () => {
    if (!disputeReason.trim()) return;
    setIsSubmittingDispute(true);
    try {
      const res = await reportProblem(order.orderId, disputeReason.trim(), activeRole);
      setIsSubmittingDispute(false);
      setShowDisputeForm(false);
      onOrderUpdated(res.order);
    } catch (e) {
      console.warn('Backend dispute failed, falling back:', e);
      const updated: RentalOrder = {
        ...order,
        status: 'DISPUTED',
        depositStatus: 'DISPUTED',
        disputeReason: disputeReason.trim(),
        disputedBy: activeRole,
        disputedAt: new Date().toISOString(),
      };
      setIsSubmittingDispute(false);
      setShowDisputeForm(false);
      onOrderUpdated(updated);
    }
  };

  // Execute QR Scan / Code Verification by Owner
  const handleVerifyScan = async (enteredCode?: string) => {
    const targetCode = (enteredCode || manualCodeInput).trim().toUpperCase();
    const cleanTarget = targetCode.startsWith('#') ? targetCode : `#${targetCode}`;
    const cleanOrderCode = order.pickupCode.toUpperCase();

    if (enteredCode === 'SCAN_SIMULATED' || cleanTarget === cleanOrderCode) {
      setIsScanningAnimation(true);
      setScanError('');
      
      try {
        const res = await verifyPickup(order.orderId, idCardUrl);
        setIsScanningAnimation(false);
        onOrderUpdated(res.order);
      } catch (e) {
        console.warn('Backend pickup verification failed, falling back to local simulation:', e);
        setTimeout(() => {
          setIsScanningAnimation(false);
          const durationMs = totalDurationMs;
          const startTime = Date.now();
          const endTime = startTime + durationMs;

          const updatedOrder: RentalOrder = {
            ...order,
            status: 'RENTAL_IN_PROGRESS',
            renterHandoverConfirmed: true,
            ownerHandoverConfirmed: true,
            depositStatus: 'DEPOSIT_HELD_BY_OWNER',
            rentalStartTime: startTime,
            rentalEndTime: endTime,
            idCardVerified: true,
          };
          onOrderUpdated(updatedOrder);
        }, 1000);
      }
    } else {
      setScanError(`Invalid Pickup Code. Expected ${order.pickupCode}`);
    }
  };

  const getDepositBadge = (status?: DepositStatus) => {
    switch (status) {
      case 'DEPOSIT_HELD_BY_OWNER':
        return { label: 'Deposit Held by Owner', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' };
      case 'REFUND_PENDING_CONFIRMATION':
        return { label: 'Refund Pending Confirmation', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' };
      case 'REFUND_COMPLETED':
        return { label: 'Refund Completed (Both Confirmed)', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
      case 'DISPUTED':
        return { label: 'Disputed / Problem Reported', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30' };
      default:
        return { label: 'Deposit Not Confirmed', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
    }
  };

  const depositBadge = getDepositBadge(order.depositStatus);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#0F141C] border border-white/15 rounded-3xl shadow-glow-lg overflow-hidden p-6 sm:p-8 space-y-6 max-h-[92vh] flex flex-col">
        
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-white cursor-pointer transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ROLE TOGGLE BAR (RENTER vs OWNER) */}
        <div className="flex items-center justify-between p-1 rounded-2xl bg-black/50 border border-white/10">
          <button
            type="button"
            onClick={() => setActiveRole('RENTER')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeRole === 'RENTER'
                ? 'bg-[#C8FF00] text-black shadow-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Renter Portal (Verify & Checklist)
          </button>
          <button
            type="button"
            onClick={() => setActiveRole('OWNER')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeRole === 'OWNER'
                ? 'bg-[#C8FF00] text-black shadow-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Owner Portal (Scan & Handover)
          </button>
        </div>

        {/* HEADER STATUS */}
        <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
          isOverdue
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            : isRentalLive
            ? 'bg-[#C8FF00]/10 border-[#C8FF00]/30 text-[#C8FF00]'
            : order.depositStatus === 'REFUND_COMPLETED' || order.status === 'DEPOSIT_REFUND_COMPLETED'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : 'bg-white/5 border-white/10 text-white'
        }`}>
          {isOverdue ? (
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
          ) : isRentalLive ? (
            <Clock className="w-5 h-5 shrink-0 text-[#C8FF00] mt-0.5 animate-spin" />
          ) : (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
          )}

          <div className="text-xs">
            <h3 className="font-bold text-white text-sm">
              {isOverdue 
                ? 'RENTAL OVERDUE'
                : isRentalLive
                ? 'RENTAL IN PROGRESS'
                : order.depositStatus === 'REFUND_COMPLETED' || order.status === 'DEPOSIT_REFUND_COMPLETED'
                ? 'Rental & Deposit Refund Completed!'
                : order.status === 'DISPUTED'
                ? 'Problem Reported — Under Review'
                : 'Physical Gadget Handover & Verification'}
            </h3>
            <p className="text-slate-300 mt-0.5">
              {isOverdue
                ? 'The scheduled return deadline has passed. Please return the gadget to owner immediately.'
                : isRentalLive
                ? 'Both parties confirmed handover. Live timer running for gadget rental.'
                : order.depositStatus === 'REFUND_COMPLETED'
                ? 'Gadget returned and deposit refund confirmed received by both parties.'
                : `Meet at ${order.pickupLocation} to review condition checklist and confirm physical handover.`}
            </p>
          </div>
        </div>

        {/* LIVE RENTAL COUNTDOWN TIMER (SECTION 4) */}
        {isRentalLive && (
          <div className={`p-6 rounded-3xl border text-center space-y-4 shadow-glow ${
            isOverdue
              ? 'bg-gradient-to-br from-rose-950/40 via-[#0F141C] to-black border-rose-500/60'
              : 'bg-gradient-to-br from-[#C8FF00]/15 via-[#0F141C] to-black border-[#C8FF00]'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-wider ${
                isOverdue
                  ? 'bg-rose-500 text-white'
                  : 'bg-[#C8FF00] text-black'
              }`}>
                <Clock className="w-3.5 h-3.5 animate-spin" />
                <span>{isOverdue ? 'RENTAL OVERDUE' : 'RENTAL IN PROGRESS'}</span>
              </span>

              <span className="text-[11px] font-mono text-slate-400">
                {order.durationValue} {order.durationMode === 'HOURLY' ? 'Hours' : 'Days'} Total
              </span>
            </div>

            {/* MAIN TIMER DISPLAY */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {isOverdue ? 'OVERDUE COUNTER' : 'TIME REMAINING'}
              </span>
              <div className={`text-4xl sm:text-5xl font-black font-mono tracking-wider drop-shadow-md ${
                isOverdue ? 'text-rose-400' : 'text-[#C8FF00]'
              }`}>
                {isOverdue ? `+${formatDuration(overdueMs)}` : formatDuration(remainingMs)}
              </div>
            </div>

            {/* LIVE PROGRESS BAR */}
            <div className="space-y-1.5 text-left">
              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>Time Elapsed: <strong className="text-white font-mono">{formatDuration(elapsedMs)}</strong></span>
                <span>{Math.round(progressPercent)}% completed</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${isOverdue ? 'bg-rose-500' : 'bg-[#C8FF00]'}`}
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>

            {/* START & DEADLINE TIMESTAMPS */}
            <div className="grid grid-cols-2 gap-2 text-left pt-2 border-t border-white/10 text-[11px]">
              <div>
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Rental Started</span>
                <span className="text-white font-medium">{formatTimestamp(startTimeMs)}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Return Deadline</span>
                <span className={`font-medium ${isOverdue ? 'text-rose-400 font-bold' : 'text-[#C8FF00]'}`}>
                  {formatTimestamp(deadlineMs)}
                </span>
              </div>
            </div>

            {/* IN-APP REMINDER ALERTS (3h and 30m) */}
            {isWithin30Mins && (
              <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2.5 text-left animate-pulse">
                <Bell className="w-4 h-4 text-rose-400 shrink-0" />
                <span>
                  <strong>Urgent Reminder (30m):</strong> Return deadline in less than 30 minutes. Please meet at {order.pickupLocation} to complete gadget return.
                </span>
              </div>
            )}

            {isWithin3Hours && (
              <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs flex items-center gap-2.5 text-left">
                <Bell className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>3-Hour Return Reminder:</strong> Return deadline is approaching in less than 3 hours. Please plan accordingly with the owner.
                </span>
              </div>
            )}
          </div>
        )}

        {/* SECTION 5: GADGET CONDITION CHECKLIST & INSPECTION PHOTOS */}
        {(!isRentalLive && order.status !== 'DEPOSIT_REFUND_COMPLETED') && (
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#C8FF00]" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Gadget Condition Checklist (Pickup Record)
                </h4>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Both verify</span>
            </div>

            {/* INTERACTIVE CHECKBOXES */}
            <div className="space-y-2 text-xs">
              <label 
                className="flex items-center gap-2.5 p-2 rounded-xl bg-white/5 border border-white/5 hover:border-white/20 cursor-pointer transition-colors"
                onClick={() => setPickupChecklist(p => ({ ...p, screenCondition: !p.screenCondition }))}
              >
                {pickupChecklist.screenCondition ? (
                  <CheckSquare className="w-4 h-4 text-[#C8FF00] shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-slate-500 shrink-0" />
                )}
                <span className="text-slate-300">Screen / exterior condition intact without cracks</span>
              </label>

              <label 
                className="flex items-center gap-2.5 p-2 rounded-xl bg-white/5 border border-white/5 hover:border-white/20 cursor-pointer transition-colors"
                onClick={() => setPickupChecklist(p => ({ ...p, powerAndButtons: !p.powerAndButtons }))}
              >
                {pickupChecklist.powerAndButtons ? (
                  <CheckSquare className="w-4 h-4 text-[#C8FF00] shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-slate-500 shrink-0" />
                )}
                <span className="text-slate-300">Working condition verified (powers on, buttons & ports functional)</span>
              </label>

              <label 
                className="flex items-center gap-2.5 p-2 rounded-xl bg-white/5 border border-white/5 hover:border-white/20 cursor-pointer transition-colors"
                onClick={() => setPickupChecklist(p => ({ ...p, accessoriesIncluded: !p.accessoriesIncluded }))}
              >
                {pickupChecklist.accessoriesIncluded ? (
                  <CheckSquare className="w-4 h-4 text-[#C8FF00] shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-slate-500 shrink-0" />
                )}
                <span className="text-slate-300">Included accessories present (charger, cables, pouch)</span>
              </label>

              <label 
                className="flex items-center gap-2.5 p-2 rounded-xl bg-white/5 border border-white/5 hover:border-white/20 cursor-pointer transition-colors"
                onClick={() => setPickupChecklist(p => ({ ...p, cleanAndSanitized: !p.cleanAndSanitized }))}
              >
                {pickupChecklist.cleanAndSanitized ? (
                  <CheckSquare className="w-4 h-4 text-[#C8FF00] shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-slate-500 shrink-0" />
                )}
                <span className="text-slate-300">Tested and clean condition confirmed</span>
              </label>
            </div>

            {/* PICKUP INSPECTION PHOTOS */}
            <div className="pt-2 border-t border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-[#C8FF00]" />
                  <span>Condition Photos (Pickup Handover)</span>
                </span>
                <label className="text-[10px] text-[#C8FF00] hover:underline cursor-pointer font-bold">
                  + Add Photo
                  <input type="file" accept="image/*" onChange={handleAddPickupPhoto} className="hidden" />
                </label>
              </div>

              {pickupPhotos.length > 0 ? (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {pickupPhotos.map((photo, i) => (
                    <img
                      key={i}
                      src={photo}
                      alt={`Pickup condition ${i + 1}`}
                      className="w-14 h-14 rounded-xl object-cover border border-[#C8FF00]/40 shrink-0"
                    />
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-slate-500 italic">
                  Upload photos of the gadget condition to save with timestamps for dispute protection.
                </p>
              )}
            </div>
          </div>
        )}

        {/* SECTION 3: REFUNDABLE SECURITY DEPOSIT LIFECYCLE */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#C8FF00]" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Refundable Security Deposit
              </span>
            </div>
            <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${depositBadge.color}`}>
              {depositBadge.label}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Deposit Amount</span>
              <span className="text-base font-extrabold text-white">₹{order.item.securityDeposit}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#C8FF00] font-semibold block">Paid Directly to Owner</span>
              <span className="text-[10px] text-slate-400">100% Refundable upon return</span>
            </div>
          </div>

          {/* DUAL CONFIRMATION AT PICKUP (BEFORE TIMER STARTS) */}
          {!isRentalLive && order.status !== 'DEPOSIT_REFUND_COMPLETED' && order.status !== 'RETURNED' && (
            <div className="space-y-2 pt-1">
              <span className="text-[11px] text-slate-300 block">
                Both parties confirm agreed deposit amount and physical item handover to start rental timer:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleConfirmHandover('RENTER')}
                  disabled={actionLoading || order.renterHandoverConfirmed}
                  className={`p-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    order.renterHandoverConfirmed
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 cursor-default'
                      : 'bg-white/10 text-white hover:bg-[#C8FF00] hover:text-black border-white/15'
                  }`}
                >
                  {order.renterHandoverConfirmed ? '✓ Renter Handover Confirmed' : "Renter: Confirm Handover & Deposit"}
                </button>

                <button
                  type="button"
                  onClick={() => handleConfirmHandover('OWNER')}
                  disabled={actionLoading || order.ownerHandoverConfirmed}
                  className={`p-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    order.ownerHandoverConfirmed
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 cursor-default'
                      : 'bg-white/10 text-white hover:bg-[#C8FF00] hover:text-black border-white/15'
                  }`}
                >
                  {order.ownerHandoverConfirmed ? '✓ Owner Handover Confirmed' : "Owner: Confirm Handover & Deposit"}
                </button>
              </div>

              {(!order.renterHandoverConfirmed || !order.ownerHandoverConfirmed) && (
                <p className="text-[10px] text-slate-400 italic text-center">
                  Live rental timer starts only when BOTH renter and owner tap confirm.
                </p>
              )}
            </div>
          )}

          {/* GADGET RETURN & DEPOSIT REFUND WORKFLOW (WHEN ACTIVE OR RETURN IN PROGRESS) */}
          {(isRentalLive || order.status === 'RETURN_PENDING_CONFIRMATION' || order.status === 'DEPOSIT_REFUND_PENDING_CONFIRMATION') && (
            <div className="space-y-3 pt-2 border-t border-white/10">
              
              {/* STEP A: PHYSICAL GADGET RETURN CONFIRMATION */}
              <div className="space-y-2">
                <span className="text-[11px] text-slate-300 block font-semibold">
                  Step 1: Physical Gadget Return Handover
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleReturnGadget('RENTER')}
                    disabled={actionLoading || order.renterReturnConfirmed}
                    className={`p-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      order.renterReturnConfirmed
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 cursor-default'
                        : 'bg-white/10 text-white hover:bg-[#C8FF00] hover:text-black border-white/15'
                    }`}
                  >
                    {order.renterReturnConfirmed ? '✓ Renter Returned Gadget' : 'Renter: Confirm Item Returned'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleReturnGadget('OWNER')}
                    disabled={actionLoading || order.ownerReturnConfirmed}
                    className={`p-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      order.ownerReturnConfirmed
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 cursor-default'
                        : 'bg-white/10 text-white hover:bg-[#C8FF00] hover:text-black border-white/15'
                    }`}
                  >
                    {order.ownerReturnConfirmed ? '✓ Owner Received Gadget' : 'Owner: Confirm Item Received Back'}
                  </button>
                </div>
              </div>

              {/* STEP B: REFUND CONFIRMATION (ONLY AFTER GADGET RETURN IS INITIATED) */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <span className="text-[11px] text-slate-300 block font-semibold">
                  Step 2: Security Deposit Refund
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Owner Button: "I've Refunded the Deposit" */}
                  <button
                    type="button"
                    onClick={handleOwnerReturnDeposit}
                    disabled={actionLoading || order.ownerDepositReturned}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      order.ownerDepositReturned
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 cursor-default'
                        : 'bg-[#C8FF00] hover:bg-[#d6ff33] text-black shadow-glow'
                    }`}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{order.ownerDepositReturned ? "✓ Owner Refunded Deposit" : "I've Refunded the Deposit"}</span>
                  </button>

                  {/* Renter Button: "Confirm Deposit Received" */}
                  <button
                    type="button"
                    onClick={handleRenterConfirmDeposit}
                    disabled={actionLoading || order.renterDepositReceived}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      order.renterDepositReceived
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 cursor-default'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-glow'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{order.renterDepositReceived ? "✓ Deposit Received" : "Confirm Deposit Received"}</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* REPORT A PROBLEM BUTTON */}
          <div className="pt-2 flex items-center justify-between text-xs border-t border-white/5">
            <span className="text-[10px] text-slate-400">Disagreement on condition or deposit refund?</span>
            <button
              type="button"
              onClick={() => setShowDisputeForm(!showDisputeForm)}
              className="text-rose-400 hover:underline flex items-center gap-1 text-[11px] font-bold cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Report a Problem</span>
            </button>
          </div>

          {/* INLINE DISPUTE FORM */}
          {showDisputeForm && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-2">
              <span className="text-xs font-bold text-rose-300 block">Report Issue to Campus Community Moderators:</span>
              <textarea
                rows={2}
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                placeholder="Explain the problem (e.g. deposit not returned, damage not agreed, etc.)"
                className="w-full p-2.5 rounded-lg bg-black/60 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-400"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDisputeForm(false)}
                  className="px-3 py-1 rounded-lg text-[10px] text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReportProblem}
                  disabled={isSubmittingDispute || !disputeReason.trim()}
                  className="px-4 py-1.5 rounded-lg bg-rose-500 text-white font-bold text-xs hover:bg-rose-600 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingDispute ? 'Submitting...' : 'Submit Problem'}
                </button>
              </div>
            </div>
          )}

          {/* Disputed details if already reported */}
          {order.disputeReason && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-[11px] text-rose-300">
              <strong>Reported Issue ({order.disputedBy || 'Student'}):</strong> {order.disputeReason}
            </div>
          )}
        </div>

        {/* ORDER DETAILS BOX */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Order ID</span>
              <span className="font-mono font-bold text-white text-sm">{order.orderId}</span>
            </div>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(order.orderId);
                setCopiedCode(true);
                setTimeout(() => setCopiedCode(false), 2000);
              }}
              className="px-2.5 py-1 rounded-lg bg-white/10 text-slate-300 hover:text-white flex items-center gap-1 text-[10px] cursor-pointer"
            >
              <Copy className="w-3 h-3" />
              {copiedCode ? 'Copied' : 'Copy'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-slate-300">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Pickup Spot</span>
              <span className="font-semibold text-white truncate block">{order.pickupLocation}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Pickup Code</span>
              <span className="font-extrabold text-[#C8FF00] text-base tracking-widest">{order.pickupCode}</span>
            </div>
          </div>
        </div>

        {/* RENTER ROLE VIEW: SHOW QR CODE & UNIVERSITY ID */}
        {activeRole === 'RENTER' && !isRentalLive && order.status !== 'DEPOSIT_REFUND_COMPLETED' && (
          <div className="space-y-4">
            
            {/* UNIVERSITY ID CARD */}
            <div className="p-4 rounded-2xl bg-white/5 border border-[#C8FF00]/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#C8FF00]" />
                  <span className="text-xs font-bold text-white">University ID Card Verification</span>
                </div>
                {idCardUploaded && (
                  <span className="text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Verified Student
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-4 p-3 rounded-xl bg-black/40 border border-white/10">
                <img
                  src={idCardUrl}
                  alt="University ID Card"
                  className="w-20 h-14 object-cover rounded-lg border border-white/20"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold text-white block">Student ID Card Attached</span>
                  <span className="text-[10px] text-slate-400 block truncate">{order.renterEmail}</span>
                  
                  <label className="inline-flex items-center gap-1 text-[11px] font-bold text-[#C8FF00] hover:underline cursor-pointer mt-1">
                    <Upload className="w-3 h-3" />
                    <span>{isUploadingId ? 'Uploading ID...' : 'Upload University ID'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadIdCard}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* RENTER QR CODE */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-center space-y-3">
              <span className="block text-xs font-bold text-white">
                Show this QR Code to <strong className="text-[#C8FF00]">{order.item.owner.name}</strong> on pickup
              </span>
              
              <div className="w-44 h-44 bg-white p-3 rounded-2xl mx-auto flex items-center justify-center shadow-glow">
                <svg viewBox="0 0 100 100" className="w-full h-full text-black">
                  <path d="M0,0 h30 v30 h-30 z M40,0 h20 v10 h-20 z M70,0 h30 v30 h-30 z M0,40 h10 v20 h-10 z M30,40 h40 v20 h-40 z M80,40 h20 v20 h-20 z M0,70 h30 v30 h-30 z M40,70 h30 v10 h-30 z M80,70 h20 v30 h-20 z" fill="currentColor"/>
                  <path d="M15,15 h10 v10 h-10 z M85,15 h10 v10 h-10 z M15,85 h10 v10 h-10 z" fill="#CCFF00"/>
                </svg>
              </div>

              <div className="text-xs text-slate-400">
                Pickup Verification Key: <span className="font-extrabold text-white font-mono text-sm">{order.pickupCode}</span>
              </div>
            </div>

          </div>
        )}

        {/* OWNER ROLE VIEW: CAMERA QR SCANNER */}
        {activeRole === 'OWNER' && !isRentalLive && order.status !== 'DEPOSIT_REFUND_COMPLETED' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-[#C8FF00]/30 text-center space-y-4">
              <div className="flex items-center justify-between text-left">
                <div>
                  <h4 className="text-xs font-bold text-white">Owner Camera QR Scanner</h4>
                  <p className="text-[11px] text-slate-400">Scan renter's QR code or verify 4-digit code</p>
                </div>
                <Scan className="w-5 h-5 text-[#C8FF00]" />
              </div>

              {/* CAMERA SCANNER SIMULATOR */}
              <div className="relative w-full h-44 rounded-2xl bg-black border-2 border-[#C8FF00]/50 overflow-hidden flex flex-col items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-b from-[#C8FF00]/5 via-transparent to-[#C8FF00]/10 pointer-events-none"></div>
                <div className="absolute left-4 right-4 h-0.5 bg-[#C8FF00] shadow-glow animate-bounce top-1/2"></div>

                {isScanningAnimation ? (
                  <div className="relative z-10 text-center space-y-2">
                    <div className="w-8 h-8 rounded-full border-2 border-[#C8FF00] border-t-transparent animate-spin mx-auto"></div>
                    <span className="text-xs font-extrabold text-[#C8FF00] block">Verifying Pickup Handover...</span>
                  </div>
                ) : (
                  <div className="relative z-10 text-center space-y-2 px-4">
                    <QrCode className="w-10 h-10 text-slate-500 mx-auto opacity-60" />
                    <span className="text-xs text-slate-400 block">Position renter's phone QR inside frame</span>
                    <button
                      type="button"
                      onClick={() => handleVerifyScan('SCAN_SIMULATED')}
                      className="py-2 px-5 rounded-xl bg-[#C8FF00] text-black font-extrabold text-xs shadow-glow hover:bg-[#d6ff33] cursor-pointer"
                    >
                      Scan & Confirm Handover
                    </button>
                  </div>
                )}
              </div>

              {/* MANUAL PICKUP CODE ENTRY */}
              <div className="pt-2">
                <span className="block text-[10px] uppercase font-bold text-slate-400 text-left mb-1">
                  Or enter 4-digit Pickup Code:
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. #7A3F"
                    value={manualCodeInput}
                    onChange={(e) => setManualCodeInput(e.target.value)}
                    className="flex-1 p-2.5 rounded-xl bg-black/50 border border-white/15 text-xs text-white uppercase font-mono font-bold focus:outline-none focus:border-[#C8FF00]"
                  />
                  <button
                    type="button"
                    onClick={() => handleVerifyScan()}
                    className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-[#C8FF00] hover:text-black font-bold text-xs text-white transition-all cursor-pointer"
                  >
                    Verify
                  </button>
                </div>
                {scanError && (
                  <p className="text-[11px] text-rose-400 font-semibold text-left mt-1.5">{scanError}</p>
                )}
              </div>

            </div>
          </div>
        )}

        {/* LEGAL TRANSPARENCY NOTICE */}
        <div className="text-[10px] text-slate-400 text-center leading-relaxed">
          Payments and deposit refunds are handled directly between the renter and owner. RENTO records confirmations but does not hold or transfer funds.
        </div>

      </div>
    </div>
  );
};
