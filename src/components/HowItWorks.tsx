import React from 'react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Find',
      description: 'Search for what you need around your campus.',
    },
    {
      step: '02',
      title: 'Rent',
      description: 'Choose your rental duration and request the item.',
    },
    {
      step: '03',
      title: 'Return',
      description: 'Pick it up, use it, and return it on time.',
    },
  ];

  return (
    <section id="how-it-works" className="py-16 bg-[#050708] border-t border-[#24313C]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER */}
        <div className="mb-10 text-left flex items-center gap-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F5F7FA] tracking-tight">
            How It Works
          </h2>
          <div className="w-8 h-[2px] bg-[#C8FF00] rounded-full"></div>
        </div>

        {/* 3 STEPS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((s) => (
            <div
              key={s.step}
              className="p-6 rounded-2xl bg-[#0B1014] border border-[#24313C] hover:border-[#C8FF00]/40 transition-colors space-y-3"
            >
              <span className="text-3xl font-black text-[#C8FF00] font-mono block">
                {s.step}
              </span>
              <h3 className="text-lg font-bold text-[#F5F7FA]">
                {s.title}
              </h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                {s.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
