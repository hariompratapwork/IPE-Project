import React, { useState } from 'react';
import { X, Mail, Lock, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { Campus } from '../types';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCampus?: Campus;
  onAuthSuccess: (email: string) => void;
  onSwitchToRegister: () => void;
}

export const SignInModal: React.FC<SignInModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  onSwitchToRegister,
}) => {
  if (!isOpen) return null;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!email.toLowerCase().endsWith('.ac.in')) {
      newErrors.email = 'Only .ac.in university emails are allowed.';
    }
    if (!password) {
      newErrors.password = 'Password is required.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    setErrors({});
    try {
      const res = await fetch('/api/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors({ general: data.error || data.detail || 'Invalid email or password.' });
        return;
      }
      if (data.access) {
        localStorage.setItem('rentozi_token', data.access);
        if (data.refresh) localStorage.setItem('rentozi_refresh', data.refresh);
      }
      onAuthSuccess(email.trim().toLowerCase());
      onClose();
    } catch {
      setErrors({ general: 'Network error. Please check your connection and try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim().toLowerCase().endsWith('.ac.in')) {
      setErrors({ email: 'Enter your .ac.in university email.' });
      return;
    }
    setForgotLoading(true);
    setErrors({});
    try {
      await fetch('/api/auth/forgot-password/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim().toLowerCase() }),
      });
      setForgotSent(true);
    } catch {
      setErrors({ general: 'Failed to send reset email. Please try again.' });
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-[#0F141C] border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white cursor-pointer z-10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Logo & Title */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#C8FF00]/10 border border-[#C8FF00]/30 flex items-center justify-center mx-auto">
              <span className="font-extrabold text-2xl text-[#C8FF00]">R</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white">
              {forgotMode ? 'Reset Password' : 'Sign In to RENTOZI'}
            </h2>
            <p className="text-xs text-slate-400">
              {forgotMode
                ? 'Enter your .ac.in email to receive a password reset link.'
                : 'Use your university .ac.in email and password.'}
            </p>
          </div>

          {forgotMode ? (
            forgotSent ? (
              /* Forgot sent success */
              <div className="py-4 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                </div>
                <p className="text-sm font-semibold text-white">Reset link sent!</p>
                <p className="text-xs text-slate-400">
                  Check your inbox at <span className="text-[#C8FF00] font-mono">{forgotEmail}</span>. Follow the link to set a new password.
                </p>
                <button
                  onClick={() => { setForgotMode(false); setForgotSent(false); setForgotEmail(''); }}
                  className="mt-2 w-full py-3 rounded-xl bg-[#C8FF00] text-black font-extrabold text-xs hover:bg-[#d6ff33] transition-all cursor-pointer"
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              /* Forgot password form */
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-[11px] uppercase font-bold text-slate-300 mb-1.5">
                    University Email (.ac.in)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="student@marwadi.ac.in"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#C8FF00] text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                    />
                  </div>
                  {errors.email && <p className="text-[11px] text-rose-400 font-semibold mt-1.5">{errors.email}</p>}
                </div>

                {errors.general && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-[11px] text-rose-400 font-semibold">
                    {errors.general}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-3.5 rounded-xl bg-[#C8FF00] text-black font-extrabold text-xs hover:bg-[#d6ff33] transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {forgotLoading ? (
                    <div className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                  ) : (
                    <>Send Reset Link <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setForgotMode(false)}
                  className="w-full text-center text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  ← Back to Sign In
                </button>
              </form>
            )
          ) : (
            /* Sign In form */
            <form onSubmit={handleSignIn} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-[11px] uppercase font-bold text-slate-300 mb-1.5">
                  University Email (.ac.in) *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="student@marwadi.ac.in"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrors((prev) => ({ ...prev, email: undefined, general: undefined }));
                    }}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border text-xs text-white placeholder-slate-500 focus:outline-none transition-colors ${
                      errors.email ? 'border-rose-500' : 'border-white/10 focus:border-[#C8FF00]'
                    }`}
                  />
                </div>
                {errors.email && <p className="text-[11px] text-rose-400 font-semibold mt-1.5">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] uppercase font-bold text-slate-300 mb-1.5">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrors((prev) => ({ ...prev, password: undefined, general: undefined }));
                    }}
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
                {errors.password && <p className="text-[11px] text-rose-400 font-semibold mt-1.5">{errors.password}</p>}
              </div>

              {/* Forgot Password */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setForgotMode(true)}
                  className="text-[11px] text-[#C8FF00] hover:underline cursor-pointer font-semibold"
                >
                  Forgot Password?
                </button>
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
                  <>Sign In <ArrowRight className="w-4 h-4" /></>
                )}
              </button>

              {/* Switch to Register */}
              <p className="text-center text-xs text-slate-400">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => { onClose(); onSwitchToRegister(); }}
                  className="text-[#C8FF00] font-bold hover:underline cursor-pointer"
                >
                  Register
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
