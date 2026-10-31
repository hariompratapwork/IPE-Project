import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  QrCode, 
  ArrowRight, 
  CheckCircle2, 
  Lock, 
  Copy, 
  UserCheck, 
  Clock, 
  Info,
  FileText,
  Image as ImageIcon,
  AlertTriangle,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { RentalItem, RentalOrder } from '../types';
import { createOrder, renterPaid, ownerConfirmPayment, ownerRejectPayment, reportProblem } from '../api/client';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: RentalItem | null;
  durationMode: 'HOURLY' | 'DAILY';
  durationValue: number;
  startDate: string;
  endDate: string;
  renterName: string;
  renterEmail: string;
  renterCampus: string;
  onPaymentComplete: (newOrder: RentalOrder) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  item,
  durationMode,
  durationValue,
  startDate,
  endDate,
  renterName,
  renterEmail,
  renterCampus,
  onPaymentComplete,
}) => {
  if (!isOpen || !item) return null;

  // Step state: 'PAY_OWNER' | 'AWAITING_OWNER_CONFIRMATION'
  const [step, setStep] = useState<'PAY_OWNER' | 'AWAITING_OWNER_CONFIRMATION'>('PAY_OWNER');
  const [createdOrder, setCreatedOrder] = useState<RentalOrder | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Proof fields
  const [upiReferenceNo, setUpiReferenceNo] = useState('');
  const [paymentProofUrl, setPaymentProofUrl] = useState('');
  const [disputeMessage, setDisputeMessage] = useState<string | null>(null);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState('Payment was not received in owner UPI bank account.');

  // Calculations
  const rentalFee = durationMode === 'HOURLY' 
    ? Math.round((item.pricePerDay / 8) * durationValue) 
    : item.pricePerDay * durationValue;

  const securityDeposit = item.securityDeposit;

  // RENTO Configurable Commission (Strictly calculated on rental fee only, excluding refundable deposit)
  const COMMISSION_RATE = 5.0; // 5%
  const commissionAmount = Math.round((rentalFee * COMMISSION_RATE) / 100);

  // Total payable directly to the gadget owner
  const totalPayableToOwner = rentalFee + securityDeposit;

  // Gadget Owner's Real UPI ID & QR Code
  const ownerUpiId = item.ownerUpiId || item.owner?.upiId || `${item.owner.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@oksbi`;
  const ownerQrUrl = item.ownerUpiQrUrl || item.owner?.upiQrUrl || 
    `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
      `upi://pay?pa=${ownerUpiId}&pn=${encodeURIComponent(item.owner.name)}&am=${totalPayableToOwner}&cu=INR&tn=RENTO%20Rental%20${item.id}`
    )}`;

  // Step 1: Renter taps "I've Paid"
  const handleRenterConfirmPaid = async () => {
    setIsProcessing(true);
    setDisputeMessage(null);

    try {
      let currentOrder = createdOrder;
      if (!currentOrder) {
        currentOrder = await createOrder({
          itemId: item.id,
          renterName: renterName || 'Student Renter',
          renterEmail: renterEmail || 'student@marwadi.ac.in',
          renterCampus: renterCampus || item.campus,
          durationMode,
          durationValue,
          startDate,
          endDate,
          paymentMethod: 'UPI_QR',
          rentalFee,
          platformFee: 0,
          securityDeposit,
          totalPaid: totalPayableToOwner,
          commissionRate: COMMISSION_RATE,
          commissionAmount,
          ownerUpiId,
          ownerUpiQrUrl: item.ownerUpiQrUrl || '',
        });
      }

      // Mark renter paid confirmed with screenshot & UTR reference
      try {
        const confirmedRes = await renterPaid(currentOrder.orderId, {
          paymentProofUrl: paymentProofUrl || undefined,
          upiReferenceNo: upiReferenceNo || undefined,
        });
        setCreatedOrder(confirmedRes.order);
      } catch (err) {
        console.warn('Backend renterPaid error:', err);
        setCreatedOrder({
          ...currentOrder,
          status: 'PAYMENT_PROOF_SUBMITTED',
          renterPaidConfirmed: true,
          renterPaidAt: new Date().toISOString(),
          paymentProofUrl,
          upiReferenceNo,
        });
      }

      setIsProcessing(false);
      setStep('AWAITING_OWNER_CONFIRMATION');
    } catch (e) {
      console.warn('Backend order creation failed, using local simulated state:', e);
      // Fallback local order
      const randomOrderNum = Math.floor(1000 + Math.random() * 9000);
      const orderId = `CLP${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${new Date().getDate()}-${randomOrderNum}`;
      const pickupCode = `#${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      const localOrder: RentalOrder = {
        orderId,
        pickupCode,
        qrPayload: JSON.stringify({ orderId, pickupCode, itemId: item.id, renterName }),
        item,
        renterName: renterName || 'Student Renter',
        renterEmail: renterEmail || 'student@marwadi.ac.in',
        renterCampus: renterCampus || item.campus,
        durationMode,
        durationValue,
        startDate,
        endDate,
        pickupTime: 'Today, 4:00 PM - 5:00 PM',
        pickupLocation: item.location,
        status: 'PAYMENT_PROOF_SUBMITTED',
        ownerUpiId,
        renterPaidConfirmed: true,
        renterPaidAt: new Date().toISOString(),
        paymentProofUrl,
        upiReferenceNo,
        ownerPaymentConfirmed: false,
        commissionRate: COMMISSION_RATE,
        commissionAmount,
        commissionStatus: 'UNPAID',
        depositStatus: 'DEPOSIT_NOT_CONFIRMED',
        payment: {
          method: 'UPI_QR',
          transactionId: `UPI_${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          rentalFee,
          platformFee: 0,
          securityDeposit,
          totalPaid: totalPayableToOwner,
          ownerUpiId,
          renterPaidConfirmed: true,
          renterPaidAt: new Date().toISOString(),
          commissionRate: COMMISSION_RATE,
          commissionAmount,
          commissionStatus: 'UNPAID',
          depositStatus: 'DEPOSIT_NOT_CONFIRMED',
        }
      };

      setCreatedOrder(localOrder);
      setIsProcessing(false);
      setStep('AWAITING_OWNER_CONFIRMATION');
    }
  };

  // Step 2: Owner taps "Payment Received"
  const handleOwnerConfirmReceived = async () => {
    if (!createdOrder) return;
    setIsProcessing(true);

    try {
      const res = await ownerConfirmPayment(createdOrder.orderId);
      setIsProcessing(false);
      onPaymentComplete(res.order);
    } catch (e) {
      console.warn('Backend owner payment confirmation failed, falling back:', e);
      const confirmedOrder: RentalOrder = {
        ...createdOrder,
        status: 'PAYMENT_CONFIRMED_BY_OWNER',
        ownerPaymentConfirmed: true,
        ownerPaymentConfirmedAt: new Date().toISOString(),
      };
      setIsProcessing(false);
      onPaymentComplete(confirmedOrder);
    }
  };

  // Step 2: Owner taps "Payment Not Received"
  const handleOwnerReject = async () => {
    if (!createdOrder) return;
    setIsProcessing(true);

    try {
      const res = await ownerRejectPayment(createdOrder.orderId, rejectReason);
      setCreatedOrder(res.order);
      setDisputeMessage("Owner reported that payment was not received in their bank account.");
      setShowRejectInput(false);
    } catch (e) {
      console.warn('Backend owner payment rejection failed, falling back:', e);
      setCreatedOrder({
        ...createdOrder,
        status: 'PAYMENT_DISPUTED',
        ownerPaymentRejected: true,
        paymentDisputeReason: rejectReason,
      });
      setDisputeMessage("Owner reported that payment was not received in their bank account.");
      setShowRejectInput(false);
    } finally {
      setIsProcessing(false);
    }
  };

  // Renter reports problem on dispute
  const handleReportProblem = async () => {
    if (!createdOrder) return;
    setIsProcessing(true);
    try {
      await reportProblem(createdOrder.orderId, "Payment discrepancy reported by renter.", renterName);
      setDisputeMessage("Your dispute has been logged with campus community moderators. We will verify transaction records.");
    } catch (e) {
      console.warn('Report problem error:', e);
      setDisputeMessage("Your dispute has been recorded. Our campus community moderator will intervene.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#0F141C] border border-white/15 rounded-3xl shadow-glow-lg overflow-hidden p-6 sm:p-8 space-y-6 max-h-[92vh] flex flex-col">
        
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-white cursor-pointer transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* HEADER */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-[#C8FF00]/10 text-[#C8FF00] border border-[#C8FF00]/30">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Direct Owner UPI Checkout</h2>
            <p className="text-xs text-slate-400">Direct peer-to-peer campus payment</p>
          </div>
        </div>

        {/* ITEM & OWNER SUMMARY */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3.5">
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-14 h-14 rounded-xl object-contain bg-black/40 p-1 border border-white/10 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-white truncate">{item.title}</h3>
            <p className="text-xs text-slate-400">
              {durationValue} {durationMode === 'HOURLY' ? 'Hours' : 'Days'} Rental • {item.location}
            </p>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-300">
              <span className="text-slate-400">Owner:</span>
              <strong className="text-white">{item.owner.name}</strong>
              <span className="text-slate-500">•</span>
              <span className="text-[#C8FF00] font-medium">{item.owner.hostelOrDept}</span>
            </div>
          </div>
        </div>

        {/* TRANSPARENT CHECKOUT BREAKDOWN */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2.5 text-xs">
          <div className="flex justify-between text-slate-300">
            <span>Rental Fee ({durationValue} {durationMode === 'HOURLY' ? 'hrs' : 'days'})</span>
            <span className="font-semibold text-white">₹{rentalFee}</span>
          </div>

          <div className="flex justify-between text-slate-300">
            <div>
              <span className="font-medium">Refundable Security Deposit</span>
              <span className="block text-[10px] text-[#C8FF00]">Paid Directly to Owner • 100% Refundable</span>
            </div>
            <span className="font-semibold text-white">₹{securityDeposit}</span>
          </div>

          <div className="pt-2 border-t border-white/5 flex justify-between text-slate-400 text-[11px]">
            <div className="flex items-center gap-1">
              <Info className="w-3 h-3 text-slate-400" />
              <span>RENTO Platform Commission (5%)</span>
            </div>
            <span className="text-slate-400">
              ₹{commissionAmount} <span className="text-[10px] text-slate-500">(Due from Owner — Not added to total)</span>
            </span>
          </div>

          <div className="pt-3 border-t border-white/10 flex justify-between items-baseline font-extrabold text-base text-white">
            <div>
              <span>Total Amount Payable Directly to Owner</span>
              <span className="block text-[10px] font-normal text-slate-400">Rental fee + Refundable deposit</span>
            </div>
            <span className="text-[#C8FF00] text-xl font-mono">₹{totalPayableToOwner}</span>
          </div>
        </div>

        {/* STEP 1: SCAN AND PAY OWNER DIRECTLY */}
        {step === 'PAY_OWNER' && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-[#070A0D] border border-white/10 text-center space-y-3.5">
              <div className="flex items-center justify-center gap-2">
                <QrCode className="w-4 h-4 text-[#C8FF00]" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Scan and pay the owner directly
                </span>
              </div>

              {/* OWNER UPI QR CODE */}
              <div className="w-48 h-48 bg-white p-3 rounded-2xl mx-auto flex items-center justify-center shadow-[0_0_24px_rgba(200,255,0,0.12)] border border-[#C8FF00]/40">
                <img
                  src={ownerQrUrl}
                  alt={`UPI QR code for ${item.owner.name}`}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* OWNER UPI ID & COPY BUTTON */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Owner UPI ID ({item.owner.name})
                </span>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-[#C8FF00]">
                  <span>{ownerUpiId}</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(ownerUpiId);
                      setCopiedUpi(true);
                      setTimeout(() => setCopiedUpi(false), 2000);
                    }}
                    className="text-white hover:text-[#C8FF00] flex items-center gap-1 font-sans cursor-pointer transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                    <span className="text-[10px]">{copiedUpi ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed">
                Open GPay, PhonePe, Paytm or BHIM UPI, scan the QR code above and transfer exact <strong className="text-white">₹{totalPayableToOwner}</strong> directly to {item.owner.name}.
              </p>
            </div>

            {/* PAYMENT PROOF INPUTS */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3 text-left">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#C8FF00]" />
                  <span>UPI Reference / UTR Number (Optional but recommended)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 429810239102 (from UPI payment receipt)"
                  value={upiReferenceNo}
                  onChange={(e) => setUpiReferenceNo(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-[#C8FF00]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-[#C8FF00]" />
                  <span>Upload Payment Screenshot (Proof)</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          setPaymentProofUrl(event.target?.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[11px] file:font-bold file:bg-[#C8FF00] file:text-black hover:file:bg-[#d6ff33] file:cursor-pointer"
                  />
                  {paymentProofUrl && (
                    <img
                      src={paymentProofUrl}
                      alt="Proof Preview"
                      className="w-10 h-10 rounded-lg object-cover border border-[#C8FF00] shrink-0"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* MANDATORY LEGAL NOTICE */}
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2.5 text-[11px] text-slate-300 leading-relaxed">
              <ShieldCheck className="w-4 h-4 text-[#C8FF00] shrink-0 mt-0.5" />
              <span>
                <strong>Notice:</strong> Payments and deposit refunds are handled directly between the renter and owner. RENTO records confirmations but does not hold or transfer funds.
              </span>
            </div>

            {/* RENTER "I'VE PAID" BUTTON */}
            <button
              type="button"
              onClick={handleRenterConfirmPaid}
              disabled={isProcessing}
              className="w-full py-4 px-6 rounded-2xl bg-[#C8FF00] text-black font-extrabold text-sm flex items-center justify-center gap-2 hover:bg-[#d6ff33] shadow-[0_0_24px_rgba(200,255,0,0.25)] transition-all duration-200 cursor-pointer disabled:opacity-50 active:scale-95"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin"></div>
                  <span>Recording Your Payment Proof...</span>
                </div>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 fill-black" />
                  <span>I've Paid ₹{totalPayableToOwner} Directly to Owner</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </div>
        )}

        {/* STEP 2: DUAL CONFIRMATION - AWAITING OWNER RECEIPT CONFIRMATION */}
        {step === 'AWAITING_OWNER_CONFIRMATION' && (
          <div className="space-y-4">
            
            {/* RENTER SUBMITTED STATUS BADGE */}
            <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                <h3 className="font-extrabold text-sm text-white">Payment Proof Submitted — Awaiting Owner Confirmation</h3>
              </div>
              <p className="text-xs text-slate-300">
                You marked payment of <strong className="text-white font-mono">₹{totalPayableToOwner}</strong> sent to <strong className="text-cyan-400">{ownerUpiId}</strong>.
              </p>
              {(createdOrder?.upiReferenceNo || upiReferenceNo) && (
                <div className="text-[11px] text-slate-300 font-mono">
                  UTR / Reference: <span className="text-white">{createdOrder?.upiReferenceNo || upiReferenceNo}</span>
                </div>
              )}
              {(createdOrder?.paymentProofUrl || paymentProofUrl) && (
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[10px] text-slate-400">Attached Proof:</span>
                  <img
                    src={createdOrder?.paymentProofUrl || paymentProofUrl}
                    alt="Payment proof screenshot"
                    className="w-12 h-12 rounded-lg object-cover border border-white/20"
                  />
                </div>
              )}
            </div>

            {/* PENDING OWNER CONFIRMATION NOTICE */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 animate-spin" />
                <span className="font-bold text-xs uppercase tracking-wider text-amber-300">
                  Manual Owner Confirmation Required
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                A QR payment made directly to an owner's personal UPI cannot be automatically verified by RENTO. Status will change to <strong>“Payment Confirmed by Owner”</strong> only when {item.owner.name} confirms receipt.
              </p>
            </div>

            {/* DISPUTE DISPLAY IF PAYMENT WAS REJECTED */}
            {(createdOrder?.status === 'PAYMENT_DISPUTED' || disputeMessage) && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 space-y-3">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>Payment Disputed</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {createdOrder?.paymentDisputeReason || disputeMessage || "The owner reported that this payment was not received in their bank account."}
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setStep('PAY_OWNER')}
                    className="flex-1 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Re-upload Proof</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleReportProblem}
                    disabled={isProcessing}
                    className="flex-1 py-2 px-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Report a Problem</span>
                  </button>
                </div>
              </div>
            )}

            {/* OWNER PORTAL CONFIRMATION (DUAL CONFIRMATION CONTROLS) */}
            <div className="p-4 rounded-2xl bg-[#070A0D] border border-[#C8FF00]/40 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#C8FF00]" />
                  <span className="text-xs font-bold text-white">Owner Receipt Portal ({item.owner.name})</span>
                </div>
                <span className="text-[10px] font-bold text-[#C8FF00] px-2 py-0.5 rounded-full bg-[#C8FF00]/10 border border-[#C8FF00]/30">
                  Dual Confirmation
                </span>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                As the owner ({item.owner.name}), open your UPI app ({ownerUpiId}) and check if you received exact <strong className="text-white">₹{totalPayableToOwner}</strong>:
              </p>

              {/* TWO BUTTONS: PAYMENT RECEIVED vs PAYMENT NOT RECEIVED */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleOwnerConfirmReceived}
                  disabled={isProcessing}
                  className="py-3 px-4 rounded-xl bg-[#C8FF00] hover:bg-[#d6ff33] text-black font-extrabold text-xs shadow-glow flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  {isProcessing ? (
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-black border-t-transparent animate-spin"></div>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 fill-black" />
                      <span>Payment Received</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setShowRejectInput(!showRejectInput)}
                  disabled={isProcessing}
                  className="py-3 px-4 rounded-xl bg-transparent hover:bg-rose-500/10 border border-rose-500/40 text-rose-400 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>Payment Not Received</span>
                </button>
              </div>

              {/* SHOW REJECT REASON INPUT IF TAPPED */}
              {showRejectInput && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-2 mt-2">
                  <label className="block text-[10px] uppercase font-bold text-rose-300">
                    Reason for Payment Rejection:
                  </label>
                  <input
                    type="text"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="e.g. Transaction not found in bank statement"
                    className="w-full p-2 rounded-lg bg-black/60 border border-rose-500/30 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleOwnerReject}
                    disabled={isProcessing}
                    className="w-full py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer transition-colors"
                  >
                    Confirm "Payment Not Received"
                  </button>
                </div>
              )}
            </div>

            {/* MANDATORY NOTICE */}
            <div className="text-[10px] text-slate-400 text-center leading-relaxed">
              RENTO records confirmations with timestamps but does not hold or transfer funds directly.
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
