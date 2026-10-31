import React from 'react';
import { Search, LayoutGrid, ArrowRight, Laptop, BookOpen, Gamepad2, ChevronDown, Plus } from 'lucide-react';
import { Campus, ItemCategory } from '../types';

interface SearchBarProps {
  currentCampus?: Campus;
  onOpenCampusModal?: () => void;
  selectedCategory: string;
  onCategoryChange: (cat: ItemCategory | 'All') => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onExecuteSearch: () => void;
  onOpenListItemModal?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchQueryChange,
  onExecuteSearch,
  onOpenListItemModal,
}) => {
  const handleShortcutClick = (cat: ItemCategory) => {
    onCategoryChange(selectedCategory === cat ? 'All' : cat);
    onExecuteSearch();
  };

  return (
    <div className="w-full">
      {/* 1. COHESIVE HORIZONTAL SEARCH BAR */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onExecuteSearch();
        }}
        className="w-full p-1.5 sm:p-2 rounded-2xl bg-[#0B1014] border border-[#24313C] flex flex-col md:flex-row items-stretch md:items-center gap-2 shadow-2xl transition-all focus-within:border-[#C8FF00]/50"
      >
        {/* SEARCH KEYWORD INPUT */}
        <div className="flex-1 flex items-center gap-2.5 px-3 py-1.5 min-w-0">
          <Search className="w-4 h-4 text-[#94A3B8] shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            placeholder="Search laptops, cameras, calculators..."
            className="w-full bg-transparent text-xs sm:text-sm font-medium text-[#F5F7FA] placeholder-[#94A3B8] focus:outline-none"
          />
        </div>

        {/* DIVIDER */}
        <div className="hidden md:block w-[1px] h-6 bg-[#24313C] shrink-0"></div>

        {/* CATEGORY DROPDOWN */}
        <div className="flex items-center gap-2 px-3 py-1.5 shrink-0 relative">
          <LayoutGrid className="w-4 h-4 text-[#C8FF00] shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value as ItemCategory | 'All')}
            className="bg-transparent text-xs sm:text-sm font-semibold text-[#F5F7FA] focus:outline-none cursor-pointer pr-5 appearance-none"
          >
            <option value="All" className="bg-[#0B1014] text-[#F5F7FA]">All categories</option>
            <option value="Electronics" className="bg-[#0B1014] text-[#F5F7FA]">Tech / Electronics</option>
            <option value="Photography" className="bg-[#0B1014] text-[#F5F7FA]">Creative Gear</option>
            <option value="Study" className="bg-[#0B1014] text-[#F5F7FA]">Study Essentials</option>
            <option value="Gaming" className="bg-[#0B1014] text-[#F5F7FA]">Gaming</option>
            <option value="Travel" className="bg-[#0B1014] text-[#F5F7FA]">Travel</option>
            <option value="Sports" className="bg-[#0B1014] text-[#F5F7FA]">Sports</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] pointer-events-none absolute right-1" />
        </div>

        {/* NEON-LIME SEARCH BUTTON */}
        <button
          type="submit"
          className="w-10 h-10 rounded-xl bg-[#C8FF00] text-black flex items-center justify-center shrink-0 hover:bg-[#B8EA00] transition-transform active:scale-95 cursor-pointer shadow-sm ml-auto md:ml-0"
          title="Search rentals"
        >
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </form>

      {/* 2. CATEGORY SHORTCUTS (Tech, Study, Gaming) */}
      <div className="flex items-center gap-2.5 mt-4">
        <button
          type="button"
          onClick={() => handleShortcutClick('Electronics')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
            selectedCategory === 'Electronics'
              ? 'bg-[#C8FF00]/10 border-[#C8FF00] text-[#C8FF00]'
              : 'bg-[#0B1014] border-[#24313C] text-[#F5F7FA] hover:border-[#94A3B8]'
          }`}
        >
          <Laptop className="w-3.5 h-3.5 text-[#C8FF00]" />
          <span>Tech</span>
        </button>

        <button
          type="button"
          onClick={() => handleShortcutClick('Study')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
            selectedCategory === 'Study'
              ? 'bg-[#C8FF00]/10 border-[#C8FF00] text-[#C8FF00]'
              : 'bg-[#0B1014] border-[#24313C] text-[#F5F7FA] hover:border-[#94A3B8]'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-[#C8FF00]" />
          <span>Study</span>
        </button>

        <button
          type="button"
          onClick={() => handleShortcutClick('Gaming')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
            selectedCategory === 'Gaming'
              ? 'bg-[#C8FF00]/10 border-[#C8FF00] text-[#C8FF00]'
              : 'bg-[#0B1014] border-[#24313C] text-[#F5F7FA] hover:border-[#94A3B8]'
          }`}
        >
          <Gamepad2 className="w-3.5 h-3.5 text-[#C8FF00]" />
          <span>Gaming</span>
        </button>
      </div>

      {/* 3. LEND AN ITEM BUTTON — below category chips */}
      {onOpenListItemModal && (
        <div className="mt-4">
          <button
            type="button"
            onClick={onOpenListItemModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-[#C8FF00] text-black hover:bg-[#d6ff33] active:scale-95 transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Lend an item</span>
          </button>
        </div>
      )}
    </div>
  );
};
