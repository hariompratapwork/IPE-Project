import React, { useState } from 'react';
import { 
  X, 
  Star, 
  MapPin, 
  ShieldCheck, 
  Calendar, 
  Heart, 
  Clock, 
  UserCheck, 
  CheckCircle2, 
  Zap, 
  MessageSquare,
  AlertCircle,
  CreditCard,
  Lock
} from 'lucide-react';
import { RentalItem } from '../types';

interface ProductDetailModalProps {
  item: RentalItem | null;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (itemId: string, e: React.MouseEvent) => void;
  onProceedToPayment: (checkoutData: {
    item: RentalItem;
    durationMode: 'HOURLY' | 'DAILY';
    durationValue: number;
    startDate: string;
    endDate: string;
    renterName: string;
    renterEmail: string;
    renterCampus: string;
  }) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  item,
  onClose,
  isSaved,
  onToggleSave,
  onProceedToPayment,
}) => {
  if (!item) return null;

  const [activeImg, setActiveImg] = useState<string>(item.imageUrl);
  const [durationMode, setDurationMode] = useState<'HOURLY' | 'DAILY'>('DAILY');
  const [durationValue, setDurationValue] = useState<number>(1);
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // Calculate default end date
  const defaultEnd = new Date();
  defaultEnd.setDate(defaultEnd.getDate() + 1);
  const [endDate, setEndDate] = useState<string>(defaultEnd.toISOString().split('T')[0]);

  const [renterName, setRenterName] = useState<string>('');
  const [renterEmail, setRenterEmail] = useState<string>('');

  // Cost Calculations matching Reference Slide 3
  const rentalFee = durationMode === 'HOURLY' 
    ? Math.round((item.pricePerDay / 8) * durationValue) 
    : item.pricePerDay * durationValue;
  const platformFee = Math.round(rentalFee * 0.03) || 15; // 3%
  const securityDeposit = item.securityDeposit;
  const grandTotal = rentalFee + platformFee + securityDeposit;

  const handleSubmitCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    onProceedToPayment({
      item,
      durationMode,
      durationValue,
      startDate,
      endDate,
      renterName: renterName.trim() || 'Student Renter',
      renterEmail: renterEmail.trim() || 'student@marwadi.edu.in',
      renterCampus: item.campus,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#0F141C] border border-white/15 rounded-2xl sm:rounded-3xl shadow-glow-lg overflow-hidden my-auto max-h-[90vh] flex flex-col">
        
        {/* MODAL HEADER BAR */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#07090E]/60 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-brand-lime text-black shadow-glow">
              {item.category}
            </span>
            <span className="text-xs text-slate-400 font-semibold">• {item.condition}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={(e) => onToggleSave(item.id, e)}
              className={`p-2 rounded-full border transition-all cursor-pointer ${
                isSaved
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-500' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MODAL BODY CONTENT */}
        <div className="p-6 overflow-y-auto space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT COLUMN: Gallery & Info (Cols 1-7) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Main Product Image */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-white/10 h-72 sm:h-80 flex items-center justify-center p-4">
                <img
                  src={activeImg}
                  alt={item.title}
                  className="max-h-full max-w-full object-contain filter drop-shadow-xl"
                />
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-xs font-semibold text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Available near campus
                </div>
              </div>

              {/* Thumbnails */}
              {item.images && item.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {item.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImg(img)}
                      className={`relative w-20 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        activeImg === img ? 'border-brand-lime shadow-glow' : 'border-white/10 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Title & Ratings */}
              <div>
                <h1 className="text-2xl font-extrabold text-white leading-tight">
                  {item.title}
                </h1>
                <div className="flex items-center gap-3 mt-2 text-xs">
                  <div className="flex items-center text-amber-400 font-bold gap-1">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <span>{item.rating}</span>
                  </div>
                  <span className="text-slate-400">({item.reviewCount} reviews)</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-300 font-semibold">{item.campus}</span>
                </div>
              </div>

              {/* Description */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  About this item
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* OWNER DETAILS CARD */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-white/5 via-white/5 to-transparent border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={item.owner.avatar}
                    alt={item.owner.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-brand-lime shadow-glow"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-white">{item.owner.name}</span>
                      <UserCheck className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="text-xs text-slate-400 block">{item.owner.hostelOrDept}</span>
                    <span className="text-[10px] text-brand-lime font-semibold">
                      {item.owner.rentalsCompleted} successful rentals • {item.owner.rating} ★ Rating
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Pickup Point</span>
                  <span className="text-xs font-semibold text-slate-200 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-brand-lime" /> {item.location}
                  </span>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Interactive Booking & Payment Trigger (Matching Slide 3) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="p-5 sm:p-6 rounded-2xl bg-white/5 border border-brand-lime/30 backdrop-blur-xl shadow-glow sticky top-20 space-y-5">
                
                {/* PRICE DISPLAY */}
                <div className="flex items-baseline justify-between border-b border-white/10 pb-4">
                  <div>
                    <span className="text-3xl font-extrabold text-brand-lime">₹{item.pricePerDay}</span>
                    <span className="text-xs text-slate-400 font-semibold"> / day</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Security Deposit</span>
                    <span className="text-xs font-bold text-slate-200">₹{item.securityDeposit} (Refundable)</span>
                  </div>
                </div>

                {/* DURATION MODE SELECTOR (HOURLY vs DAILY) */}
                <div className="space-y-3">
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Rental Type</span>
                  <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-black/40 border border-white/10">
                    <button
                      type="button"
                      onClick={() => { setDurationMode('HOURLY'); setDurationValue(3); }}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        durationMode === 'HOURLY' ? 'bg-brand-lime text-black shadow-glow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Hourly Pass
                    </button>
                    <button
                      type="button"
                      onClick={() => { setDurationMode('DAILY'); setDurationValue(1); }}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        durationMode === 'DAILY' ? 'bg-brand-lime text-black shadow-glow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Daily Pass
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmitCheckout} className="space-y-4">
                  {durationMode === 'HOURLY' ? (
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                        Select Hours
                      </label>
                      <select
                        value={durationValue}
                        onChange={(e) => setDurationValue(Number(e.target.value))}
                        className="w-full p-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-brand-lime cursor-pointer"
                      >
                        <option value={2} className="bg-[#0F141C]">2 Hours</option>
                        <option value={3} className="bg-[#0F141C]">3 Hours (Popular)</option>
                        <option value={6} className="bg-[#0F141C]">6 Hours (Half Day)</option>
                        <option value={12} className="bg-[#0F141C]">12 Hours (Full Day Exam)</option>
                      </select>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-brand-lime"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                          End Date
                        </label>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-brand-lime"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* RENTER QUICK INFO */}
                  <div className="space-y-2 pt-2 border-t border-white/10">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                        Your Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Hariom Singh"
                        value={renterName}
                        onChange={(e) => setRenterName(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-brand-lime"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                        Campus Email / ID
                      </label>
                      <input
                        type="email"
                        placeholder="hariom@marwadi.edu.in"
                        value={renterEmail}
                        onChange={(e) => setRenterEmail(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-brand-lime"
                        required
                      />
                    </div>
                  </div>

                  {/* FEE BREAKDOWN MATCHING REFERENCE SLIDE 3 */}
                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>Rental ({durationValue} {durationMode === 'HOURLY' ? 'hrs' : 'days'})</span>
                      <span className="font-semibold text-white">₹{rentalFee}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Platform Fee (3%)</span>
                      <span className="font-semibold text-white">₹{platformFee}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Refundable Deposit</span>
                      <span className="font-semibold text-white">₹{securityDeposit}</span>
                    </div>
                    <div className="pt-2 border-t border-white/10 flex justify-between font-bold text-sm text-white">
                      <span>Payable Amount</span>
                      <span className="text-brand-lime">₹{grandTotal}</span>
                    </div>
                  </div>

                  {/* PROCEED TO PAYMENT CTA */}
                  <button
                    type="submit"
                    className="w-full py-3.5 px-6 rounded-xl bg-brand-lime text-black font-extrabold text-sm flex items-center justify-center gap-2 hover:bg-brand-limeHover shadow-glow transition-all duration-200 cursor-pointer active:scale-95"
                  >
                    <Lock className="w-4 h-4 fill-black" />
                    <span>Pay Securely & Get QR Pass</span>
                  </button>
                </form>

              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
