import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ItemCategory } from '../types';

interface CategoriesProps {
  selectedCategory: string;
  onSelectCategory: (category: ItemCategory | 'All') => void;
}

interface CategoryCardItem {
  id: string;
  title: string;
  category: ItemCategory;
  description: string;
  imageSrc: string;
}

export const Categories: React.FC<CategoriesProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const cards: CategoryCardItem[] = [
    {
      id: 'tech',
      title: 'Tech',
      category: 'Electronics',
      description: 'Laptops, phones, tablets & more',
      imageSrc: '/laptop.png',
    },
    {
      id: 'creative',
      title: 'Creative gear',
      category: 'Photography',
      description: 'Cameras, tripods, accessories',
      imageSrc: '/instax-camera.png',
    },
    {
      id: 'study',
      title: 'Study essentials',
      category: 'Study',
      description: 'Books, notes, calculators & stationery',
      imageSrc: '/calculator.png',
    },
    {
      id: 'gaming',
      title: 'Gaming',
      category: 'Gaming',
      description: 'Consoles, games, accessories',
      imageSrc: '/game-controller.png',
    },
  ];

  return (
    <section id="categories" className="py-8 bg-[#050708]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* SECTION HEADER: Explore categories with subtle lime line */}
        <div className="flex items-center gap-3.5 mb-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F5F7FA] tracking-tight">
            Explore categories
          </h2>
          <div className="w-10 h-[2px] bg-[#C8FF00] rounded-full"></div>
        </div>

        {/* FOUR EQUALLY SIZED DESKTOP CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {cards.map((card, idx) => {
            // First card (Tech) or active category has the neon lime accent border
            const isActive = idx === 0 || selectedCategory === card.category;

            return (
              <div
                key={card.id}
                onClick={() => onSelectCategory(card.category)}
                className={`group rounded-2xl p-4 sm:p-5 bg-[#0B1014] border transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden min-h-[290px] sm:min-h-[310px] ${
                  isActive
                    ? 'border-[#C8FF00] shadow-[0_0_24px_rgba(200,255,0,0.15)] ring-1 ring-[#C8FF00]/30'
                    : 'border-[#24313C] hover:border-[#94A3B8]/60 hover:shadow-lg'
                }`}
              >
                {/* Product Image Area with ambient glow */}
                <div className="relative w-full h-40 sm:h-44 flex items-center justify-center overflow-hidden rounded-xl bg-[#070A0D] border border-[#16202A]/80 p-3">
                  {/* Subtle ambient glow behind product */}
                  <div className={`absolute inset-0 opacity-40 blur-xl pointer-events-none transition-opacity duration-300 group-hover:opacity-75 ${
                    isActive ? 'bg-[#C8FF00]/15' : 'bg-cyan-500/10'
                  }`} />
                  
                  <img
                    src={card.imageSrc}
                    alt={card.title}
                    className="relative z-10 w-full h-full object-contain filter drop-shadow-[0_10px_16px_rgba(0,0,0,0.6)] group-hover:scale-105 group-hover:-translate-y-1 transition-all duration-300"
                  />
                </div>

                {/* Card Bottom: Title, Description, and Minimal Arrow in Corner */}
                <div className="pt-4 flex items-end justify-between">
                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-bold text-[#F5F7FA] tracking-tight group-hover:text-white">
                      {card.title}
                    </h3>
                    <p className="text-xs text-[#94A3B8] font-normal leading-relaxed">
                      {card.description}
                    </p>
                  </div>

                  {/* Clean minimal arrow */}
                  <div className="pl-3 pb-0.5 shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isActive ? 'bg-[#C8FF00]/10 text-[#C8FF00]' : 'bg-[#111820] text-[#94A3B8] group-hover:text-white'
                    }`}>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
