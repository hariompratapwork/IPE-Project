import React, { useState } from 'react';
import { X, ShieldCheck, Mail, CheckCircle2, KeyRound, RefreshCw, ArrowRight } from 'lucide-react';
import { Campus } from '../types';
import { sendOtp, verifyOtp } from '../api/client';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCampus: Campus;
  onAuthSuccess: (email: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentCampus,
  onAuthSuccess,
}) => {
  if (!isOpen) return null;

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState(['4', '8', '2', '9']);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [authComplete, setAuthComplete] = useState(false);
  const [verifyError, setVerifyError] = useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    
    // STRICT .ac.in VALIDATION
    if (!cleanEmail.endsWith('.ac.in')) {
      setEmailError('Only official university emails ending with .ac.in are allowed (e.g. student@marwadi.ac.in)');
      return;
    }

    setEmailError('');
    setIsSending(true);

    try {
      const res = await sendOtp(cleanEmail);
      if (res.test_otp && res.test_otp.length === 4) {
        setOtpCode(res.test_otp.split(''));
      }
      setOtpSent(true);
    } catch (err: any) {
      setEmailError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setVerifyError('');

    try {
      const fullCode = otpCode.join('');
      await verifyOtp(email.trim().toLowerCase(), fullCode);
      setIsVerifying(false);
      setAuthComplete(true);
      onAuthSuccess(email);
    } catch (err: any) {
      setIsVerifying(false);
      setVerifyError(err.message || 'Invalid OTP code. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-[#0F141C] border border-white/15 rounded-3xl shadow-glow-lg overflow-hidden p-6 sm:p-8 space-y-6">
        
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* HEADER */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-lime/10 border border-brand-lime/30 text-brand-lime flex items-center justify-center mx-auto shadow-glow">
            <span className="font-extrabold text-2xl">R</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">University Sign In</h2>
          <p className="text-xs text-slate-400">
            No password or registration required. Use your official <strong className="text-white font-mono">.ac.in</strong> email.
          </p>
        </div>

        {authComplete ? (
          /* SUCCESS STATE */
          <div className="py-6 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-glow">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-white">Authentication Verified!</h3>
            <p className="text-xs text-slate-300">
              Welcome aboard <strong className="text-brand-lime">{email}</strong>. You can now rent gadgets, list items, and upload your University ID Card for verification.
            </p>
            <button
              onClick={onClose}
              className="mt-4 w-full py-3.5 rounded-xl bg-brand-lime text-black font-extrabold text-xs shadow-glow hover:bg-brand-limeHover cursor-pointer"
            >
              Continue to RENTOZI
            </button>
          </div>
        ) : !otpSent ? (
          /* STEP 1: EMAIL ENTRY WITH STRICTIONS ON .ac.in */
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-[11px] uppercase font-bold text-slate-300 mb-1.5">
                University Email Address (.ac.in Required) *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="e.g. student@marwadi.ac.in"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (e.target.value && !e.target.value.toLowerCase().endsWith('.ac.in')) {
                      setEmailError('Email must end with .ac.in');
                    } else {
                      setEmailError('');
                    }
                  }}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border text-xs text-white placeholder-slate-500 focus:outline-none ${
                    emailError ? 'border-rose-500' : 'border-white/10 focus:border-brand-lime'
                  }`}
                />
              </div>
              {emailError && (
                <p className="text-[11px] text-rose-400 font-semibold mt-1.5">{emailError}</p>
              )}
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-[11px] text-slate-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Restricted to verified university domain emails ending with .ac.in</span>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-brand-lime text-black font-extrabold text-xs shadow-glow hover:bg-brand-limeHover transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
            >
              <span>Send 4-Digit OTP Code</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* STEP 2: 4-DIGIT OTP VERIFICATION ENTRY */
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-lime/10 text-brand-lime text-xs font-mono font-bold">
                <KeyRound className="w-3.5 h-3.5" />
                <span>OTP Sent to {email}</span>
              </div>
              <p className="text-[11px] text-slate-400">Enter the 4-digit verification code sent to your inbox:</p>
            </div>

            {/* 4-DIGIT OTP CODE INPUT BOXES */}
            <div className="flex justify-center gap-3">
              {otpCode.map((digit, idx) => (
                <input
                  key={idx}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => {
                    const newOtp = [...otpCode];
                    newOtp[idx] = e.target.value;
                    setOtpCode(newOtp);
                  }}
                  className="w-12 h-14 rounded-2xl bg-black/60 border-2 border-brand-lime/50 text-center font-mono font-extrabold text-xl text-brand-lime shadow-glow focus:outline-none focus:border-brand-lime"
                />
              ))}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <button
                type="button"
                onClick={() => setOtpSent(false)}
                className="hover:text-white underline cursor-pointer"
              >
                Change Email
              </button>
              <button
                type="button"
                onClick={() => setOtpCode(['4', '8', '2', '9'])}
                className="text-brand-lime hover:underline flex items-center gap-1 cursor-pointer font-semibold"
              >
                <RefreshCw className="w-3 h-3" /> Resend OTP
              </button>
            </div>

            {verifyError && (
              <p className="text-[11px] text-rose-400 font-semibold text-center">{verifyError}</p>
            )}

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-3.5 rounded-xl bg-brand-lime text-black font-extrabold text-xs shadow-glow hover:bg-brand-limeHover transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {isVerifying ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin"></div>
                  Verifying OTP...
                </span>
              ) : (
                <span>Verify OTP & Access Portal</span>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
