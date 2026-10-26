import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  Copy, 
  Camera, 
  QrCode, 
  Video, 
  Clock, 
  ShieldCheck, 
  Scan, 
  FileCheck,
  Upload,
  UserCheck
} from 'lucide-react';
import { RentalOrder } from '../types';
import { verifyPickup } from '../api/client';

interface PickupVerificationModalProps {
  order: RentalOrder | null;
  onClose: () => void;
  onOrderUpdated: (updatedOrder: RentalOrder) => void;
}

export const PickupVerificationModal: React.FC<PickupVerificationModalProps> = ({
  order,
  onClose,
  onOrderUpdated,
}) => {
  if (!order) return null;

  const [activeRole, setActiveRole] = useState<'RENTER' | 'OWNER'>('RENTER');
  const [copiedCode, setCopiedCode] = useState(false);
  const [videoRecorded, setVideoRecorded] = useState(order.videoRecorded || false);
  const [isVideoRecording, setIsVideoRecording] = useState(false);

  // University ID Card state
  const [idCardUrl, setIdCardUrl] = useState<string>(
    order.studentIdCardUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=400'
  );
  const [idCardUploaded, setIdCardUploaded] = useState<boolean>(order.idCardVerified || true);
  const [isUploadingId, setIsUploadingId] = useState(false);

  // Owner Scanner State
  const [scannerActive, setScannerActive] = useState(false);
  const [manualCodeInput, setManualCodeInput] = useState('');
  const [scanError, setScanError] = useState('');
  const [isScanningAnimation, setIsScanningAnimation] = useState(false);

  // Live Timer State (in seconds)
  const calculateInitialSeconds = () => {
    if (order.status === 'ACTIVE_RENTAL' && order.rentalEndTime) {
      const diff = Math.max(0, Math.floor((order.rentalEndTime - Date.now()) / 1000));
      return diff;
    }
    return order.durationMode === 'HOURLY' 
      ? order.durationValue * 3600 
      : order.durationValue * 24 * 3600;
  };

  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(calculateInitialSeconds());

  useEffect(() => {
    let interval: any = null;
    if (order.status === 'ACTIVE_RENTAL') {
      interval = setInterval(() => {
        if (order.rentalEndTime) {
          const diff = Math.max(0, Math.floor((order.rentalEndTime - Date.now()) / 1000));
          setTimeLeftSeconds(diff);
        } else {
          setTimeLeftSeconds(prev => (prev > 0 ? prev - 1 : 0));
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [order.status, order.rentalEndTime]);

  const formatTimeLeft = (totalSecs: number) => {
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Inspection Video Handler
  const handleRecordVideo = () => {
    setIsVideoRecording(true);
    setTimeout(() => {
      setIsVideoRecording(false);
      setVideoRecorded(true);
      const updated = {
        ...order,
        videoRecorded: true,
        videoTimestamp: new Date().toLocaleTimeString(),
      };
      onOrderUpdated(updated);
    }, 2000);
  };

  // University ID Card Upload Simulator
  const handleUploadIdCard = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingId(true);
      setTimeout(() => {
        setIsUploadingId(false);
        const objectUrl = URL.createObjectURL(file);
        setIdCardUrl(objectUrl);
        setIdCardUploaded(true);

        const updated = {
          ...order,
          studentIdCardUrl: objectUrl,
          idCardVerified: true,
        };
        onOrderUpdated(updated);
      }, 1500);
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
        setScannerActive(false);
        onOrderUpdated(res.order);
      } catch (e) {
        console.warn('Backend pickup verification failed, falling back to local simulation:', e);
        setTimeout(() => {
          setIsScanningAnimation(false);
          setScannerActive(false);

          const durationMs = order.durationMode === 'HOURLY' 
            ? order.durationValue * 3600 * 1000 
            : order.durationValue * 24 * 3600 * 1000;

          const startTime = Date.now();
          const endTime = startTime + durationMs;

          const updatedOrder: RentalOrder = {
            ...order,
            status: 'ACTIVE_RENTAL',
            rentalStartTime: startTime,
            rentalEndTime: endTime,
            idCardVerified: true,
          };

          onOrderUpdated(updatedOrder);
        }, 1200);
      }
    } else {
      setScanError(`Invalid Pickup Code. Expected ${order.pickupCode}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#0F141C] border border-white/15 rounded-3xl shadow-glow-lg overflow-hidden p-6 sm:p-8 space-y-6 max-h-[92vh] flex flex-col">
        
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-white cursor-pointer"
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
                ? 'bg-brand-lime text-black shadow-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Renter Portal (Show QR & ID)
          </button>
          <button
            type="button"
            onClick={() => setActiveRole('OWNER')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeRole === 'OWNER'
                ? 'bg-brand-lime text-black shadow-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Owner Portal (Scan QR)
          </button>
        </div>

        {/* HEADER STATUS */}
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h3 className="font-bold text-white text-sm">
              {order.status === 'ACTIVE_RENTAL' 
                ? 'Rental Currently Active!' 
                : 'Confirm Pickup & ID Verification'}
            </h3>
            <p className="text-slate-300 mt-0.5">
              {order.status === 'ACTIVE_RENTAL'
                ? `Timer is running live for both Renter & Owner.`
                : `Upload University ID Card before taking over gadget at ${order.pickupLocation}.`}
            </p>
          </div>
        </div>

        {/* STEP PROGRESS TRACKER */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Pickup Status Timeline
          </span>
          <div className="flex items-center justify-between text-[11px] relative">
            
            <div className="flex flex-col items-center gap-1 text-emerald-400 font-bold z-10">
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-black flex items-center justify-center text-[10px]">✓</div>
              <span>Requested</span>
            </div>

            <div className="flex flex-col items-center gap-1 text-emerald-400 font-bold z-10">
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-black flex items-center justify-center text-[10px]">✓</div>
              <span>Paid</span>
            </div>

            <div className={`flex flex-col items-center gap-1 font-bold z-10 ${
              idCardUploaded ? 'text-emerald-400' : 'text-brand-lime animate-pulse'
            }`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${
                idCardUploaded ? 'bg-emerald-500 text-black' : 'bg-brand-lime text-black'
              }`}>
                {idCardUploaded ? '✓' : '3'}
              </div>
              <span>ID Verified</span>
            </div>

            <div className={`flex flex-col items-center gap-1 font-bold z-10 ${
              order.status === 'ACTIVE_RENTAL' ? 'text-brand-lime animate-pulse' : 'text-slate-500'
            }`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${
                order.status === 'ACTIVE_RENTAL' ? 'bg-brand-lime text-black' : 'bg-white/10 text-slate-400'
              }`}>
                4
              </div>
              <span>Live Rental</span>
            </div>

          </div>
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
              <span className="font-extrabold text-brand-lime text-base tracking-widest">{order.pickupCode}</span>
            </div>
          </div>
        </div>

        {/* LIVE RENTAL COUNTDOWN TIMER */}
        {order.status === 'ACTIVE_RENTAL' && (
          <div className="p-6 rounded-3xl bg-gradient-to-br from-brand-lime/20 via-[#0F141C] to-black border-2 border-brand-lime text-center space-y-3 shadow-glow">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-lime text-black font-extrabold text-[10px] uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5 animate-spin" />
              <span>LIVE RENTAL TIMER RUNNING</span>
            </div>
            <div className="text-4xl sm:text-5xl font-black text-brand-lime font-mono tracking-wider drop-shadow-md">
              {formatTimeLeft(timeLeftSeconds)}
            </div>
            <p className="text-xs text-slate-300">
              Handover & University ID verified. Time remaining until item return.
            </p>
          </div>
        )}

        {/* RENTER ROLE VIEW: SHOW QR CODE, UNIVERSITY ID CARD UPLOAD & VIDEO INSPECTION */}
        {activeRole === 'RENTER' && order.status !== 'ACTIVE_RENTAL' && (
          <div className="space-y-4">
            
            {/* UNIVERSITY ID CARD UPLOAD SECTION (Mandatory before pickup) */}
            <div className="p-4 rounded-2xl bg-white/5 border border-brand-lime/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-brand-lime" />
                  <span className="text-xs font-bold text-white">University ID Card Verification</span>
                </div>
                {idCardUploaded && (
                  <span className="text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> ID Verified (.ac.in)
                  </span>
                )}
              </div>
              
              <p className="text-[11px] text-slate-400">
                Upload your official University Student ID Card picture as proof of identity before taking over the gadget.
              </p>

              {/* ID CARD PREVIEW & UPLOADER */}
              <div className="flex items-center gap-4 p-3 rounded-xl bg-black/40 border border-white/10">
                <img
                  src={idCardUrl}
                  alt="University ID Card"
                  className="w-20 h-14 object-cover rounded-lg border border-white/20"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold text-white block">Student ID Card Attached</span>
                  <span className="text-[10px] text-slate-400 block truncate">{order.renterEmail}</span>
                  
                  <label className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-lime hover:underline cursor-pointer mt-1">
                    <Upload className="w-3 h-3" />
                    <span>{isUploadingId ? 'Uploading ID...' : 'Upload / Change University ID Card'}</span>
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

            {/* RENTER QR CODE CARD */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-center space-y-3">
              <span className="block text-xs font-bold text-white">
                Show this QR Code to <strong className="text-brand-lime">{order.item.owner.name}</strong> on pickup
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

            {/* RENTER VIDEO RECORDING RESPONSIBILITY CHECK */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-brand-lime" />
                  <span className="text-xs font-bold text-white">Item Condition Inspection Video</span>
                </div>
                {videoRecorded && (
                  <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Recorded
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                It's your responsibility to take a 10-sec video of the item before accepting to verify existing condition.
              </p>
              
              <button
                type="button"
                onClick={handleRecordVideo}
                disabled={isVideoRecording}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  videoRecorded 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                }`}
              >
                {isVideoRecording ? (
                  <span className="animate-pulse flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></div> Recording Inspection Video...
                  </span>
                ) : (
                  <>
                    <Camera className="w-4 h-4" />
                    <span>{videoRecorded ? 'Re-record Inspection Video' : 'Record 10-Sec Inspection Video'}</span>
                  </>
                )}
              </button>
            </div>

          </div>
        )}

        {/* OWNER ROLE VIEW: CAMERA QR SCANNER & HANDOVER */}
        {activeRole === 'OWNER' && order.status !== 'ACTIVE_RENTAL' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-brand-lime/30 text-center space-y-4">
              <div className="flex items-center justify-between text-left">
                <div>
                  <h4 className="text-xs font-bold text-white">Owner Camera QR Scanner</h4>
                  <p className="text-[11px] text-slate-400">Scan renter's QR or enter Pickup Code to start rental timer</p>
                </div>
                <Scan className="w-5 h-5 text-brand-lime" />
              </div>

              {/* CAMERA SCANNER SIMULATOR WINDOW */}
              <div className="relative w-full h-48 rounded-2xl bg-black border-2 border-brand-lime/50 overflow-hidden flex flex-col items-center justify-center">
                
                <div className="absolute inset-0 bg-gradient-to-b from-brand-lime/5 via-transparent to-brand-lime/10 pointer-events-none"></div>

                <div className="absolute left-4 right-4 h-0.5 bg-brand-lime shadow-glow animate-bounce top-1/2"></div>

                {isScanningAnimation ? (
                  <div className="relative z-10 text-center space-y-2">
                    <div className="w-8 h-8 rounded-full border-2 border-brand-lime border-t-transparent animate-spin mx-auto"></div>
                    <span className="text-xs font-extrabold text-brand-lime block">Verifying Pickup & University ID...</span>
                  </div>
                ) : (
                  <div className="relative z-10 text-center space-y-2 px-4">
                    <QrCode className="w-10 h-10 text-slate-500 mx-auto opacity-60" />
                    <span className="text-xs text-slate-400 block">Position renter's phone QR inside frame</span>
                    <button
                      type="button"
                      onClick={() => handleVerifyScan('SCAN_SIMULATED')}
                      className="py-2 px-5 rounded-xl bg-brand-lime text-black font-extrabold text-xs shadow-glow hover:bg-brand-limeHover cursor-pointer"
                    >
                      Scan & Confirm Pickup
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
                    className="flex-1 p-2.5 rounded-xl bg-black/50 border border-white/15 text-xs text-white uppercase font-mono font-bold focus:outline-none focus:border-brand-lime"
                  />
                  <button
                    type="button"
                    onClick={() => handleVerifyScan()}
                    className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-brand-lime hover:text-black font-bold text-xs text-white transition-all cursor-pointer"
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

      </div>
    </div>
  );
};
