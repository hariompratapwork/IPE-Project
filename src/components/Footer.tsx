import React from 'react';
import { Campus } from '../types';

interface FooterProps {
  currentCampus: Campus;
  onOpenCampusModal: () => void;
  onNavigate: (sectionId: string) => void;
  onOpenListItemModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenListItemModal,
}) => {
  return (
    <footer className="bg-[#050708] border-t border-[#24313C] py-10 text-[#94A3B8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* LOGO */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#C8FF00] text-black flex items-center justify-center font-black text-base">
            H
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-extrabold text-xl text-[#F5F7FA]">HIRO</span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#94A3B8]">Campus Borrow Club</span>
          </div>
        </div>

        {/* LINKS */}
        <div className="flex flex-wrap items-center gap-6 text-xs">
          <button onClick={() => onNavigate('hero')} className="hover:text-white transition-colors">
            Home
          </button>
          <button onClick={() => onNavigate('rentals')} className="hover:text-white transition-colors">
            Browse
          </button>
          <button onClick={() => onNavigate('how-it-works')} className="hover:text-white transition-colors">
            How It Works
          </button>
          <button onClick={onOpenListItemModal} className="hover:text-white transition-colors">
            List an Item
          </button>
        </div>

        {/* COPYRIGHT */}
        <p className="text-xs text-slate-500">
          © 2026 HIRO. Campus Rentals.
        </p>

      </div>
    </footer>
  );
};
