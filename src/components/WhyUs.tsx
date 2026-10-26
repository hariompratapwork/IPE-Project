import React from 'react';
import { PiggyBank, MapPin, Coins, ShieldCheck, Sparkles } from 'lucide-react';

export const WhyUs: React.FC = () => {
  const benefits = [
    {
      icon: <PiggyBank className="w-6 h-6 text-brand-lime" />,
      title: 'SAVE MONEY',
      description: 'Pay only for the exact hours or days you need something. Save up to 90% over buying new gadgets for one-time use.',
    },
    {
      icon: <MapPin className="w-6 h-6 text-brand-lime" />,
      title: 'NEARBY ON CAMPUS',
      description: 'No long courier delays or shipping fees. Pick up items in 15 minutes right at your hostel block, library, or canteen.',
    },
    {
      icon: <Coins className="w-6 h-6 text-brand-lime" />,
      title: 'EARN FROM YOUR STUFF',
      description: 'Turn your idle cameras, laptops, calculators, or bikes into steady daily pocket money without selling them.',
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-brand-lime" />,
      title: 'TRUSTED COMMUNITY',
      description: 'Verified student emails, peer reviews, hostel tags, and refundable security deposits ensure 100% peace of mind.',
    },
  ];

  return (
    <section id="why-us" className="py-16 sm:py-24 bg-[#07090E] relative z-10 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400 mb-3">
            <span>THE HIRO ADVANTAGE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Why students choose HIRO
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-400">
            Built exclusively for college life — fast, affordable, and safe.
          </p>
        </div>

        {/* 4 CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((b, idx) => (
            <div
              key={idx}
              className="p-6 sm:p-8 rounded-3xl bg-[#0F141C] border border-white/10 hover:border-brand-lime/40 transition-all duration-300 flex flex-col justify-between group shadow-lg hover:shadow-glow"
            >
              <div>
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 w-fit mb-6 group-hover:bg-brand-lime/10 group-hover:border-brand-lime/30 transition-colors">
                  {b.icon}
                </div>
                <h3 className="text-base font-extrabold text-white tracking-wider mb-2 group-hover:text-brand-lime transition-colors">
                  {b.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {b.description}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
