import React, { useState } from 'react';
import { X, CheckCircle2, Send, Calendar, ShieldCheck, Sparkles } from 'lucide-react';
import { AdminService, ServiceRequest } from '../types';
import { submitServiceRequest } from '../api/client';

interface ServiceRequestModalProps {
  service: AdminService | null;
  onClose: () => void;
  onSubmitRequest: (req: ServiceRequest) => void;
}

export const ServiceRequestModal: React.FC<ServiceRequestModalProps> = ({
  service,
  onClose,
  onSubmitRequest,
}) => {
  if (!service) return null;

  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [details, setDetails] = useState('');
  const [deadline, setDeadline] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const ADMIN_EMAIL = 'hariompratapwork@gmail.com';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentEmail.endsWith('.ac.in')) {
      setEmailError('University email must end with .ac.in (e.g. name@university.ac.in)');
      return;
    }
    setEmailError('');
    setIsSubmitting(true);

    // Build mailto body
    const subject = encodeURIComponent(`[RENTOZI Service Request] ${service.title}`);
    const body = encodeURIComponent(
      `Hi Hariom,\n\nA new service request has been submitted on RENTOZI Campus Rentals.\n\n` +
      `──────────────────────────\n` +
      `Service Type : ${service.title}\n` +
      `Student Name : ${studentName.trim() || 'Not provided'}\n` +
      `University Email: ${studentEmail.trim()}\n` +
      `Deadline     : ${deadline || 'Within 48 hours'}\n` +
      `──────────────────────────\n\n` +
      `Requirements:\n${details.trim()}\n\n` +
      `──────────────────────────\n` +
      `Sent via RENTOZI Campus Rentals – hariompratapwork@gmail.com`
    );

    // Open mail client with pre-filled data
    window.location.href = `mailto:${ADMIN_EMAIL}?subject=${subject}&body=${body}`;

    // Also try to save to backend (non-blocking)
    try {
      const saved = await submitServiceRequest({
        serviceType: service.title,
        studentName: studentName.trim() || 'Student User',
        studentEmail: studentEmail.trim(),
        campus: 'University Campus',
        details: details.trim(),
        deadline: deadline || 'Within 48 hours',
      });
      onSubmitRequest(saved);
    } catch {
      const newRequest: ServiceRequest = {
        id: `srv-req-${Date.now()}`,
        serviceType: service.title,
        studentName: studentName.trim() || 'Student User',
        studentEmail: studentEmail.trim(),
        campus: 'University Campus',
        details: details.trim(),
        deadline: deadline || 'Within 48 hours',
        status: 'PENDING',
      };
      onSubmitRequest(newRequest);
    }

    setIsSubmitting(false);
    setSubmittedSuccess(true);
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
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-lime/10 border border-brand-lime/20 text-[11px] font-bold text-brand-lime mb-2">
            <span>ADMIN DIRECT SERVICE</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">Request {service.title}</h2>
          <p className="text-xs text-slate-400 mt-1">
            Submit your requirements directly to the RENTOZI Admin Team. Starting at <strong className="text-brand-lime">{service.startingPrice}</strong>.
          </p>
        </div>

        {submittedSuccess ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-glow">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-extrabold text-white">Request Sent to Admin!</h3>
            <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
              Your mail app has opened with a pre-filled message for <strong className="text-brand-lime">{service.title}</strong>. Just hit <strong className="text-white">Send</strong> to deliver it directly to <strong className="text-brand-lime">hariompratapwork@gmail.com</strong>.
            </p>
            <p className="text-[11px] text-slate-500">We'll review and ping you at <strong className="text-white">{studentEmail}</strong> within 2–4 hours.</p>
            <button
              onClick={onClose}
              className="py-3 px-8 rounded-xl bg-brand-lime text-black font-extrabold text-xs shadow-glow hover:bg-brand-limeHover cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Student Name */}
            <div>
              <label className="block text-[11px] uppercase font-bold text-slate-300 mb-1">
                Your Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Hariom Singh"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-lime"
              />
            </div>

            {/* University .ac.in Email */}
            <div>
              <label className="block text-[11px] uppercase font-bold text-slate-300 mb-1">
                Official University Email (.ac.in Required) *
              </label>
              <input
                type="email"
                required
                placeholder="student@university.ac.in"
                value={studentEmail}
                onChange={(e) => {
                  setStudentEmail(e.target.value);
                  if (e.target.value && !e.target.value.endsWith('.ac.in')) {
                    setEmailError('Email must end with .ac.in');
                  } else {
                    setEmailError('');
                  }
                }}
                className={`w-full p-3 rounded-xl bg-white/5 border text-xs text-white placeholder-slate-500 focus:outline-none ${
                  emailError ? 'border-rose-500' : 'border-white/10 focus:border-brand-lime'
                }`}
              />
              {emailError && (
                <p className="text-[11px] text-rose-400 font-semibold mt-1">{emailError}</p>
              )}
            </div>

            {/* Service Specs Details */}
            <div>
              <label className="block text-[11px] uppercase font-bold text-slate-300 mb-1">
                Describe Your Requirements *
              </label>
              <textarea
                rows={3}
                required
                placeholder={`Mention specific details for ${service.title} (e.g. Event date & location for Photography, Word count for Content Writing, Video duration, Poster style...)`}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-lime"
              />
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-[11px] uppercase font-bold text-slate-300 mb-1">
                Target Completion Deadline
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-brand-lime"
              />
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-[11px] text-slate-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Direct Admin Service with guaranteed quality & student pricing.</span>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-brand-lime text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-glow hover:bg-brand-limeHover transition-all cursor-pointer active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>Submit Direct Request to Admin</span>
            </button>

          </form>
        )}

      </div>
    </div>
  );
};
