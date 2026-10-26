import React from 'react';
import { Star, Heart, MapPin } from 'lucide-react';
import { RentalItem } from '../types';

interface RentalCardProps {
  item: RentalItem;
  onSelect: (item: RentalItem) => void;
  isSaved: boolean;
  onToggleSave: (itemId: string, e: React.MouseEvent) => void;
}

export const RentalCard: React.FC<RentalCardProps> = ({
  item,
  onSelect,
  isSaved,
  onToggleSave,
}) => {
  return (
    <div
      onClick={() => onSelect(item)}
      className="group rounded-2xl bg-[#0B1014] border border-[#24313C] hover:border-[#C8FF00]/50 overflow-hidden flex flex-col justify-between transition-all duration-300 cursor-pointer shadow-lg hover:shadow-[0_0_25px_rgba(200,255,0,0.1)]"
    >
      {/* PRODUCT IMAGE */}
      <div className="relative h-48 w-full overflow-hidden bg-[#070A0D] flex items-center justify-center p-3">
        <img
          src={item.imageUrl}
          alt={item.title}
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
        />

        {/* Favorite Icon */}
        <button
          onClick={(e) => onToggleSave(item.id, e)}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all cursor-pointer ${
            isSaved
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              : 'bg-black/40 text-slate-400 hover:text-white border border-white/10'
          }`}
        >
          <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-500' : ''}`} />
        </button>
      </div>

      {/* CARD CONTENT */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h3 className="text-sm font-bold text-white group-hover:text-slate-200 transition-colors line-clamp-1">
            {item.title}
          </h3>

          <div className="flex items-center justify-between mt-2 text-xs">
            <div className="flex items-center text-amber-400 font-semibold gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{item.rating}</span>
            </div>

            <div className="flex items-center text-slate-400 gap-1 text-[11px]">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span className="truncate max-w-[120px]">Nearby</span>
            </div>
          </div>
        </div>

        {/* PRICE & FOOTER */}
        <div className="pt-3 border-t border-[#24313C] flex items-center justify-between">
          <div className="text-xs text-[#94A3B8] font-medium">Per Day</div>
          <div className="text-base font-extrabold text-[#C8FF00]">
            ₹{item.pricePerDay}
          </div>
        </div>
      </div>
    </div>
  );
};
