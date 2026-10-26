import React from 'react';
import { Box, Users, MapPin, ShieldCheck } from 'lucide-react';

interface TrustStatsProps {
  itemCount?: number;
  studentCount?: number;
  campusCount?: number;
}

export const TrustStats: React.FC<TrustStatsProps> = () => {
  return (
    <section className="py-4 bg-[#050708]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-4 px-6 sm:px-8 rounded-2xl bg-[#0B1014] border border-[#24313C] grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 items-center">
          
          {/* 1. Items Listed */}
          <div className="flex items-center gap-3.5">
            <Box className="w-6 h-6 text-[#C8FF00] stroke-[1.8] shrink-0" />
            <div>
              <span className="text-xl sm:text-2xl font-black text-[#F5F7FA] block tracking-tight leading-none">
                120+
              </span>
              <span className="text-xs font-medium text-[#94A3B8] block mt-0.5">
                Items listed
              </span>
            </div>
          </div>

          {/* 2. Verified Students */}
          <div className="flex items-center gap-3.5 md:border-l md:border-[#24313C] md:pl-8">
            <Users className="w-6 h-6 text-[#C8FF00] stroke-[1.8] shrink-0" />
            <div>
              <span className="text-xl sm:text-2xl font-black text-[#F5F7FA] block tracking-tight leading-none">
                85+
              </span>
              <span className="text-xs font-medium text-[#94A3B8] block mt-0.5">
                Verified students
              </span>
            </div>
          </div>

          {/* 3. Campuses */}
          <div className="flex items-center gap-3.5 border-t md:border-t-0 md:border-l border-[#24313C] pt-3 md:pt-0 md:pl-8">
            <MapPin className="w-6 h-6 text-[#C8FF00] stroke-[1.8] shrink-0" />
            <div>
              <span className="text-xl sm:text-2xl font-black text-[#F5F7FA] block tracking-tight leading-none">
                1
              </span>
              <span className="text-xs font-medium text-[#94A3B8] block mt-0.5">
                Campus
              </span>
            </div>
          </div>

          {/* 4. Campus ID verified */}
          <div className="flex items-center gap-3.5 border-t md:border-t-0 md:border-l border-[#24313C] pt-3 md:pt-0 md:pl-8">
            <ShieldCheck className="w-6 h-6 text-[#C8FF00] stroke-[1.8] shrink-0" />
            <div>
              <span className="text-xs sm:text-sm font-semibold text-[#F5F7FA] block tracking-tight">
                Campus ID verified
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
