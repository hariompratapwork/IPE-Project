import React from 'react';
import { SearchBar } from './SearchBar';
import { CampusMap } from './CampusMap';
import { Campus, ItemCategory } from '../types';

interface HeroProps {
  currentCampus: Campus;
  onOpenCampusModal: () => void;
  selectedCategory: string;
  onCategoryChange: (cat: ItemCategory | 'All') => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onExecuteSearch: () => void;
  onSelectProduct?: (productId: string) => void;
  onOpenListItemModal?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  currentCampus,
  onOpenCampusModal,
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchQueryChange,
  onExecuteSearch,
  onSelectProduct,
  onOpenListItemModal,
}) => {
  return (
    <section id="hero" className="relative pt-8 pb-8 lg:pt-12 lg:pb-10 overflow-hidden bg-[#050708]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* TWO-COLUMN BALANCED HERO COMPOSITION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* LEFT COLUMN: Headline & Unified Search Bar (Cols 1-6) */}
          <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
            
            {/* Small Label: CAMPUS RENTALS / 001 with fine lime line */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-[#C8FF00] tracking-widest uppercase">
                CAMPUS RENTALS / 001
              </span>
              <div className="w-10 h-[2px] bg-[#C8FF00] rounded-full"></div>
            </div>

            {/* Main Headline */}
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#F5F7FA] leading-[1.08]">
                Good gear.<br />
                <span className="text-[#C8FF00]">Shared nearby.</span>
              </h1>
              <p className="text-sm sm:text-base text-[#94A3B8] font-normal max-w-lg leading-relaxed">
                Borrow what you need from students around you.
              </p>
            </div>

            {/* Unified Search Bar & Category Shortcuts */}
            <div className="pt-2">
              <SearchBar
                currentCampus={currentCampus}
                onOpenCampusModal={onOpenCampusModal}
                selectedCategory={selectedCategory}
                onCategoryChange={onCategoryChange}
                searchQuery={searchQuery}
                onSearchQueryChange={onSearchQueryChange}
                onExecuteSearch={onExecuteSearch}
                onOpenListItemModal={onOpenListItemModal}
              />
            </div>

          </div>

          {/* RIGHT COLUMN: Subtle Dark Campus Map Blueprint (Cols 7-12) */}
          <div className="lg:col-span-6 w-full">
            <CampusMap onSelectProduct={onSelectProduct} />
          </div>

        </div>

      </div>
    </section>
  );
};
