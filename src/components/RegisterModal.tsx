import React, { useState } from 'react';
import { X, Mail, Lock, User, Hash, ArrowRight, Eye, EyeOff, CheckCircle2, ShieldCheck, KeyRound, RefreshCw } from 'lucide-react';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (email: string) => void;
  onSwitchToSignIn: () => void;
}

type Step = 'form' | 'otp' | 'success';

interface FormData {
  fullName: string;
  email: string;
  enrollmentNumber: string;
  giaNumber: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  enrollmentNumber?: string;
  giaNumber?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  onSwitchToSignIn,
}) => {
  if (!isOpen) return null;

  const [step, setStep] = useState<Step>('form');
  const [form, setForm] = useState<FormData>({
    fullName: '',
    email: '',
    enrollmentNumber: '',
    giaNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // OTP step
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const updateField = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined, general: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.fullName.trim() || form.fullName.trim().length < 2) {
      newErrors.fullName = 'Enter your full name (at least 2 characters).';
    }

    const cleanEmail = form.email.trim().toLowerCase();
    if (!cleanEmail) {
      newErrors.email = 'Email is required.';
    } else if (!cleanEmail.endsWith('.ac.in')) {
      newErrors.email = 'Only official university emails ending with .ac.in are allowed.';
    }

    if (!form.enrollmentNumber.trim()) {
      newErrors.enrollmentNumber = 'Enrollment number is required.';
    } else if (form.enrollmentNumber.trim().length < 4) {
      newErrors.enrollmentNumber = 'Enter a valid enrollment number.';
    }

    if (!form.giaNumber.trim()) {
      newErrors.giaNumber = 'GIA number is required.';
    } else if (form.giaNumber.trim().length < 3) {
      newErrors.giaNumber = 'Enter a valid GIA number.';
    }

    if (!form.password) {
      newErrors.password = 'Password is required.';
    } else if (form.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters.';
    } else if (!/[A-Z]/.test(form.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter.';
    } else if (!/[0-9]/.test(form.password)) {
      newErrors.password = 'Password must contain at least one number.';
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.';
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    setErrors({});
    try {
      const res = await fetch('/api/auth/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: form.fullName.trim(),
          email: form.email.trim().toLowerCase(),
          enrollment_number: form.enrollmentNumber.trim(),
          gia_number: form.giaNumber.trim(),
          password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg =
          data.email?.[0] ||
          data.enrollment_number?.[0] ||
          data.gia_number?.[0] ||
          data.error ||
          data.detail ||
          'Registration failed. Please check your details and try again.';
        setErrors({ general: msg });
        return;
      }
      setStep('otp');
    } catch {
      setErrors({ general: 'Network error. Please check your connection and try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (idx: number, value: string) => {
    if (value.length > 1) return;
    const newDigits = [...otpDigits];
    newDigits[idx] = value;
    setOtpDigits(newDigits);
    setOtpError('');
    // Auto-focus next
    if (value && idx < 5) {
      const next = document.getElementById(`reg-otp-${idx + 1}`);
      next?.focus();
    }
  };

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpDigits[idx] && idx > 0) {
      const prev = document.getElementById(`reg-otp-${idx - 1}`);
      prev?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpDigits.join('');
    if (code.length < 6) {
      setOtpError('Enter the full 6-digit code sent to your email.');
      return;
    }
    setIsVerifying(true);
    setOtpError('');
    try {
      const res = await fetch('/api/auth/verify-email/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email.trim().toLowerCase(), otp: code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOtpError(data.error || data.detail || 'Invalid or expired OTP. Please try again.');
        return;
      }
      if (data.access) {
        localStorage.setItem('rentozi_token', data.access);
        if (data.refresh) localStorage.setItem('rentozi_refresh', data.refresh);
      }
      setStep('success');
    } catch {
      setOtpError('Network error. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    setOtpError('');
    try {
      await fetch('/api/auth/resend-otp/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email.trim().toLowerCase() }),
      });
      setOtpDigits(['', '', '', '', '', '']);
    } catch {
      setOtpError('Could not resend OTP. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleSuccess = () => {
    onAuthSuccess(form.email.trim().toLowerCase());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-[#0F141C] border border-white/10 rounded-3xl shadow-2xl overflow-hidden max-h-[95vh] overflow-y-auto">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white cursor-pointer z-10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 sm:p-8 space-y-5">
          {/* Logo & Title */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#C8FF00]/10 border border-[#C8FF00]/30 flex items-center justify-center mx-auto">
              <span className="font-extrabold text-2xl text-[#C8FF00]">R</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white">
              {step === 'otp' ? 'Verify Your Email' : step === 'success' ? 'Welcome to RENTOZI!' : 'Create Account'}
            </h2>
            <p className="text-xs text-slate-400">
              {step === 'otp'
                ? `A 6-digit code was sent to ${form.email}`
                : step === 'success'
                ? 'Your university account is ready.'
                : 'Join RENTOZI with your university .ac.in email.'}
            </p>
          </div>

          {/* STEP: REGISTRATION FORM */}
          {step === 'form' && (
            <form onSubmit={handleSubmitForm} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-[11px] uppercase font-bold text-slate-300 mb-1.5">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hariom Pratap Singh"
                    value={form.fullName}
                    onChange={(e) => updateField('fullName', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border text-xs text-white placeholder-slate-500 focus:outline-none transition-colors ${
                      errors.fullName ? 'border-rose-500' : 'border-white/10 focus:border-[#C8FF00]'
                    }`}
                  />
                </div>
                {errors.fullName && <p className="text-[11px] text-rose-400 font-semibold mt-1">{errors.fullName}</p>}
              </div>

              {/* College Email */}
              <div>
                <label className="block text-[11px] uppercase font-bold text-slate-300 mb-1.5">College Email (.ac.in) *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="student@marwadi.ac.in"
                    value={form.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border text-xs text-white placeholder-slate-500 focus:outline-none transition-colors ${
                      errors.email ? 'border-rose-500' : 'border-white/10 focus:border-[#C8FF00]'
                    }`}
                  />
                </div>
                {errors.email && <p className="text-[11px] text-rose-400 font-semibold mt-1">{errors.email}</p>}
              </div>

              {/* Enrollment Number */}
              <div>
                <label className="block text-[11px] uppercase font-bold text-slate-300 mb-1.5">Enrollment Number *</label>
                <div className="relative">
                  <Hash className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. 22BCOM10001"
                    value={form.enrollmentNumber}
                    onChange={(e) => updateField('enrollmentNumber', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border text-xs text-white placeholder-slate-500 focus:outline-none transition-colors ${
                      errors.enrollmentNumber ? 'border-rose-500' : 'border-white/10 focus:border-[#C8FF00]'
                    }`}
                  />
                </div>
                {errors.enrollmentNumber && <p className="text-[11px] text-rose-400 font-semibold mt-1">{errors.enrollmentNumber}</p>}
              </div>

              {/* GIA Number */}
              <div>
                <label className="block text-[11px] uppercase font-bold text-slate-300 mb-1.5">GR No. *</label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. GR2024XXXXX"
                    value={form.giaNumber}
                    onChange={(e) => updateField('giaNumber', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border text-xs text-white placeholder-slate-500 focus:outline-none transition-colors ${
                      errors.giaNumber ? 'border-rose-500' : 'border-white/10 focus:border-[#C8FF00]'
                    }`}
                  />
                </div>
                {errors.giaNumber && <p className="text-[11px] text-rose-400 font-semibold mt-1">{errors.giaNumber}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] uppercase font-bold text-slate-300 mb-1.5">Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Min 8 chars, 1 uppercase, 1 number"
                    value={form.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    className={`w-full pl-10 pr-11 py-3 rounded-xl bg-white/5 border text-xs text-white placeholder-slate-500 focus:outline-none transition-colors ${
                      errors.password ? 'border-rose-500' : 'border-white/10 focus:border-[#C8FF00]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-[11px] text-rose-400 font-semibold mt-1">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-[11px] uppercase font-bold text-slate-300 mb-1.5">Confirm Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="Re-enter your password"
                    value={form.confirmPassword}
                    onChange={(e) => updateField('confirmPassword', e.target.value)}
                    className={`w-full pl-10 pr-11 py-3 rounded-xl bg-white/5 border text-xs text-white placeholder-slate-500 focus:outline-none transition-colors ${
                      errors.confirmPassword ? 'border-rose-500' : 'border-white/10 focus:border-[#C8FF00]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-[11px] text-rose-400 font-semibold mt-1">{errors.confirmPassword}</p>}
              </div>

              {/* General Error */}
              {errors.general && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-[11px] text-rose-400 font-semibold">
                  {errors.general}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-[#C8FF00] text-black font-extrabold text-xs hover:bg-[#d6ff33] transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                ) : (
                  <>Create Account <ArrowRight className="w-4 h-4" /></>
                )}
              </button>

              {/* Switch to Sign In */}
              <p className="text-center text-xs text-slate-400">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { onClose(); onSwitchToSignIn(); }}
                  className="text-[#C8FF00] font-bold hover:underline cursor-pointer"
                >
                  Sign In
                </button>
              </p>
            </form>
          )}

          {/* STEP: OTP VERIFICATION */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-full bg-[#C8FF00]/10 border border-[#C8FF00]/20 w-fit mx-auto">
                <KeyRound className="w-3.5 h-3.5 text-[#C8FF00]" />
                <span className="text-xs font-mono font-bold text-[#C8FF00]">Code sent to {form.email}</span>
              </div>

              {/* 6-digit OTP boxes */}
              <div className="flex justify-center gap-2">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`reg-otp-${idx}`}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value.replace(/\D/, ''))}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-11 h-13 rounded-2xl bg-black/60 border-2 border-[#C8FF00]/40 text-center font-mono font-extrabold text-lg text-[#C8FF00] focus:outline-none focus:border-[#C8FF00] transition-colors"
                    style={{ height: '3.25rem' }}
                  />
                ))}
              </div>

              {otpError && (
                <p className="text-[11px] text-rose-400 font-semibold text-center">{otpError}</p>
              )}

              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="hover:text-white underline cursor-pointer transition-colors"
                >
                  ← Change Details
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isResending}
                  className="text-[#C8FF00] hover:underline flex items-center gap-1 cursor-pointer font-semibold disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${isResending ? 'animate-spin' : ''}`} />
                  Resend Code
                </button>
              </div>

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full py-3.5 rounded-xl bg-[#C8FF00] text-black font-extrabold text-xs hover:bg-[#d6ff33] transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {isVerifying ? (
                  <div className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                ) : (
                  <>Verify & Activate Account <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>
          )}

          {/* STEP: SUCCESS */}
          {step === 'success' && (
            <div className="py-4 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-9 h-9 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-white mb-1">Account Created!</h3>
                <p className="text-xs text-slate-300">
                  Welcome to RENTOZI,{' '}
                  <span className="text-[#C8FF00] font-bold">{form.fullName}</span>.
                  <br />
                  You can now rent gadgets and list your own items.
                </p>
              </div>
              <button
                onClick={handleSuccess}
                className="w-full py-3.5 rounded-xl bg-[#C8FF00] text-black font-extrabold text-xs hover:bg-[#d6ff33] transition-all cursor-pointer active:scale-95"
              >
                Go to RENTOZI →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
