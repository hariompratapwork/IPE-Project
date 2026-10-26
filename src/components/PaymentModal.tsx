import React, { useState } from 'react';
import { X, ShieldCheck, QrCode, CreditCard, ArrowRight, CheckCircle2, Lock, Smartphone, Copy } from 'lucide-react';
import { RentalItem, RentalOrder } from '../types';
import { createOrder } from '../api/client';

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

  const [paymentMethod, setPaymentMethod] = useState<'UPI_QR' | 'CARD'>('UPI_QR');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Calculations
  const rentalFee = durationMode === 'HOURLY' 
    ? Math.round((item.pricePerDay / 8) * durationValue) 
    : item.pricePerDay * durationValue;
  const platformFee = Math.round(rentalFee * 0.03) || 15; // 3%
  const securityDeposit = item.securityDeposit;
  const grandTotal = rentalFee + platformFee + securityDeposit;

  const upiId = `hiro.${item.id.replace(/[^a-zA-Z0-9]/g, '')}@upi`;

  const handlePay = async () => {
    setIsProcessing(true);

    try {
      // Call Django backend API
      const serverOrder = await createOrder({
        itemId: item.id,
        renterName: renterName || 'Student Renter',
        renterEmail: renterEmail || 'student@marwadi.ac.in',
        renterCampus: renterCampus || item.campus,
        durationMode,
        durationValue,
        startDate,
        endDate,
        paymentMethod,
        rentalFee,
        platformFee,
        securityDeposit,
        totalPaid: grandTotal,
      });

      setIsProcessing(false);
      onPaymentComplete(serverOrder);
    } catch (e) {
      console.warn('Backend order failed, using local simulated order:', e);
      // Fallback local simulation
      setTimeout(() => {
        setIsProcessing(false);
        const randomOrderNum = Math.floor(1000 + Math.random() * 9000);
        const orderId = `CLP${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${new Date().getDate()}-${randomOrderNum}`;
        const pickupCode = `#${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

        const newOrder: RentalOrder = {
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
          status: 'PAID',
          payment: {
            method: paymentMethod,
            transactionId: `TXN_${Date.now()}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            rentalFee,
            platformFee,
            securityDeposit,
            totalPaid: grandTotal,
          }
        };

        onPaymentComplete(newOrder);
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#0F141C] border border-white/15 rounded-3xl shadow-glow-lg overflow-hidden p-6 sm:p-8 space-y-6">
        
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* HEADER */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-brand-lime/10 text-brand-lime border border-brand-lime/30">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Campus Payment Gateway</h2>
            <p className="text-xs text-slate-400">Escrow protected student checkout</p>
          </div>
        </div>

        {/* ITEM SUMMARY */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-14 h-14 rounded-xl object-contain bg-black/40 p-1 border border-white/10"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-white truncate">{item.title}</h3>
            <p className="text-xs text-slate-400">
              {durationValue} {durationMode === 'HOURLY' ? 'Hours' : 'Days'} Rental • {item.location}
            </p>
          </div>
        </div>

        {/* FEE BREAKDOWN (Matching Reference Slide 3) */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2.5 text-xs">
          <div className="flex justify-between text-slate-300">
            <span>Rental Fee ({durationValue} {durationMode === 'HOURLY' ? 'hrs' : 'days'})</span>
            <span className="font-semibold text-white">₹{rentalFee}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Campus Platform Fee (3%)</span>
            <span className="font-semibold text-white">₹{platformFee}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Refundable Security Deposit</span>
            <span className="font-semibold text-white">₹{securityDeposit}</span>
          </div>
          <div className="pt-2 border-t border-white/10 flex justify-between font-extrabold text-base text-white">
            <span>Total Payable</span>
            <span className="text-brand-lime">₹{grandTotal}</span>
          </div>
        </div>

        {/* PAYMENT METHOD SELECTOR */}
        <div className="space-y-3">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Select Payment Method
          </span>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod('UPI_QR')}
              className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                paymentMethod === 'UPI_QR'
                  ? 'bg-brand-lime/10 border-brand-lime text-brand-lime shadow-glow'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>UPI / Scan QR</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('CARD')}
              className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                paymentMethod === 'CARD'
                  ? 'bg-brand-lime/10 border-brand-lime text-brand-lime shadow-glow'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Card / NetBanking</span>
            </button>
          </div>
        </div>

        {/* UPI QR PAYMENT BOX */}
        {paymentMethod === 'UPI_QR' && (
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center space-y-3">
            <div className="w-36 h-36 bg-white p-2.5 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
              {/* Generated SVG QR Code representation */}
              <svg viewBox="0 0 100 100" className="w-full h-full text-black">
                <path d="M0,0 h30 v30 h-30 z M40,0 h20 v10 h-20 z M70,0 h30 v30 h-30 z M0,40 h10 v20 h-10 z M30,40 h40 v20 h-40 z M80,40 h20 v20 h-20 z M0,70 h30 v30 h-30 z M40,70 h30 v10 h-30 z M80,70 h20 v30 h-20 z" fill="currentColor"/>
                <path d="M15,15 h10 v10 h-10 z M85,15 h10 v10 h-10 z M15,85 h10 v10 h-10 z" fill="#CCFF00"/>
              </svg>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs font-mono text-slate-300">
              <span>{upiId}</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(upiId);
                  setCopiedUpi(true);
                  setTimeout(() => setCopiedUpi(false), 2000);
                }}
                className="text-brand-lime hover:underline flex items-center gap-1 font-sans cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                {copiedUpi ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Scan with GPay, PhonePe, Paytm or BHIM UPI
            </p>
          </div>
        )}

        {/* CARD INPUT FORM */}
        {paymentMethod === 'CARD' && (
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Card Number (e.g. 4532 •••• •••• 8901)"
              className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-lime"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="MM/YY"
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-lime"
              />
              <input
                type="password"
                placeholder="CVV"
                maxLength={4}
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-lime"
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 text-[10px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Payment held safely in escrow until you verify item pickup with owner.</span>
        </div>

        {/* PAY SECURELY BUTTON */}
        <button
          type="button"
          onClick={handlePay}
          disabled={isProcessing}
          className="w-full py-4 px-6 rounded-2xl bg-brand-lime text-black font-extrabold text-sm flex items-center justify-center gap-2 hover:bg-brand-limeHover shadow-glow transition-all duration-200 cursor-pointer disabled:opacity-50 active:scale-95"
        >
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin"></div>
              <span>Processing Payment...</span>
            </div>
          ) : (
            <>
              <Lock className="w-4 h-4 fill-black" />
              <span>Pay ₹{grandTotal} Securely</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </>
          )}
        </button>

      </div>
    </div>
  );
};
