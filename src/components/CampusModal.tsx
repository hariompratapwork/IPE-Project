import React from 'react';
import { X, MapPin, Check, Building2 } from 'lucide-react';
import { Campus } from '../types';
import { CAMPUSES } from '../data/mockData';

interface CampusModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCampus: Campus;
  onSelectCampus: (campus: Campus) => void;
  campuses?: Campus[];
}

export const CampusModal: React.FC<CampusModalProps> = ({
  isOpen,
  onClose,
  currentCampus,
  onSelectCampus,
  campuses = CAMPUSES,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-[#0F141C] border border-white/15 rounded-3xl shadow-glow-lg overflow-hidden p-6 sm:p-8 space-y-6">
        
        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* HEADER */}
        <div>
          <div className="flex items-center gap-2 text-brand-lime mb-1">
            <Building2 className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Select Your Campus</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">Choose University Community</h2>
          <p className="text-xs text-slate-400 mt-1">
            Browse rental items listed by students directly at your institution.
          </p>
        </div>

        {/* CAMPUS LIST */}
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {campuses.map((c) => {
            const isSelected = currentCampus.id === c.id;
            return (
              <div
                key={c.id}
                onClick={() => {
                  onSelectCampus(c);
                  onClose();
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-brand-lime/10 border-brand-lime shadow-glow'
                    : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-brand-lime text-black' : 'bg-white/10 text-slate-300'}`}>
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{c.name}</h4>
                    <span className="text-xs text-slate-400">{c.city} • {c.studentCount} students</span>
                  </div>
                </div>

                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-brand-lime text-black flex items-center justify-center">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
