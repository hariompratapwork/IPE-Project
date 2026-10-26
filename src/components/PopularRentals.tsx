import React from 'react';
import { RentalItem, ItemCategory } from '../types';
import { RentalCard } from './RentalCard';

interface PopularRentalsProps {
  items: RentalItem[];
  selectedCategory: string;
  onSelectCategory: (cat: ItemCategory | 'All') => void;
  savedItemIds: string[];
  onToggleSave: (itemId: string, e: React.MouseEvent) => void;
  onSelectItem: (item: RentalItem) => void;
}

export const PopularRentals: React.FC<PopularRentalsProps> = ({
  items,
  selectedCategory,
  onSelectCategory,
  savedItemIds,
  onToggleSave,
  onSelectItem,
}) => {
  return (
    <section id="rentals" className="py-12 sm:py-16 bg-[#050708] border-t border-[#24313C]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* SECTION HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F5F7FA] tracking-tight">
              Popular near you
            </h2>
            <div className="w-8 h-[2px] bg-[#C8FF00] rounded-full"></div>
          </div>

          <span className="text-xs font-semibold text-[#94A3B8] px-3 py-1 rounded-full bg-[#0B1014] border border-[#24313C]">
            {items.length} available items
          </span>
        </div>

        {/* PRODUCT GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <RentalCard
              key={item.id}
              item={item}
              onSelect={onSelectItem}
              isSaved={savedItemIds.includes(item.id)}
              onToggleSave={onToggleSave}
            />
          ))}
        </div>

      </div>
    </section>
  );
};
