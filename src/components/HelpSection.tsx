import React, { useState } from 'react';

export const HelpSection: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const email = 'hariompratapwork@gmail.com';

  const handleCopy = () => {
    navigator.clipboard.writeText(email).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <section id="help" className="py-20 px-4 bg-[#07090E]">
      <div className="max-w-4xl mx-auto text-center">

        {/* Label */}
        <p className="text-xs font-semibold text-brand-lime uppercase tracking-widest mb-3">
          Need Help?
        </p>

        {/* Heading */}
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
          We're here to help you
        </h2>

        <p className="text-slate-400 text-base max-w-xl mx-auto mb-12">
          Got a question, issue, or feedback? Reach out directly and we'll get back to you as soon as possible.
        </p>

        {/* Card */}
        <div className="relative bg-white/5 border border-white/10 rounded-2xl p-8 sm:p-12 max-w-2xl mx-auto overflow-hidden">
          
          {/* Subtle neon glow */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-72 h-24 bg-brand-lime/10 rounded-full blur-3xl pointer-events-none" />

          {/* Mail Icon */}
          <div className="w-14 h-14 rounded-2xl bg-brand-lime/10 border border-brand-lime/20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-7 h-7 text-brand-lime" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5H4.5a2.25 2.25 0 00-2.25 2.25m19.5 0-9.75 6.75L2.25 6.75" />
            </svg>
          </div>

          <p className="text-slate-400 text-sm mb-4">Send us an email at</p>

          {/* Email display */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <a
              href={`mailto:${email}`}
              className="text-xl sm:text-2xl font-bold text-brand-lime hover:underline underline-offset-4 transition-all"
            >
              {email}
            </a>

            {/* Copy button */}
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 text-xs font-medium hover:bg-brand-lime/10 hover:text-brand-lime hover:border-brand-lime/30 transition-all"
            >
              {copied ? (
                <>
                  <svg className="w-3.5 h-3.5 text-brand-lime" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>

          {/* Mailto CTA button */}
          <a
            href={`mailto:${email}?subject=RENTOZI%20Help%20Request&body=Hi%2C%20I%20need%20help%20with...`}
            className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-lime text-black font-bold text-sm hover:bg-brand-limeHover transition-all active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
            Send a Message
          </a>

          {/* Response time note */}
          <p className="text-slate-600 text-xs mt-5">
            ⏱ Usually responds within 24 hours
          </p>
        </div>

      </div>
    </section>
  );
};
