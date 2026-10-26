import React from 'react';
import { PlusCircle } from 'lucide-react';

interface CtaBannerProps {
  onListItemClick: () => void;
}

export const CtaBanner: React.FC<CtaBannerProps> = ({ onListItemClick }) => {
  return (
    <section className="py-16 bg-[#07090E] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="rounded-3xl bg-[#0F141C] border border-white/10 p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Got something you're not using?
            </h2>
            <p className="text-sm text-slate-400">
              List it on HIRO and let someone nearby put it to use.
            </p>
          </div>

          <button
            onClick={onListItemClick}
            className="px-6 py-3.5 rounded-xl bg-brand-lime text-black font-extrabold text-sm hover:bg-brand-limeHover transition-all cursor-pointer shrink-0 active:scale-95"
          >
            List an Item
          </button>
        </div>
      </div>
    </section>
  );
};
