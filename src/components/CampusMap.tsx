import React from 'react';
import { MapPin, Navigation } from 'lucide-react';

interface CampusMapProps {
  onSelectProduct?: (productId: string) => void;
}

export const CampusMap: React.FC<CampusMapProps> = ({ onSelectProduct }) => {
  return (
    <div className="relative w-full aspect-[450/300] sm:aspect-[450/290] lg:h-[480px] rounded-3xl overflow-hidden bg-[#050708] border border-[#24313C] select-none flex items-center justify-center [perspective:1200px] shadow-2xl">
      
      {/* 1. HD VECTOR CAMPUS BLUEPRINT (INFINITE RESOLUTION / NEVER PIXELATES) */}
      <svg
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        viewBox="0 0 800 550"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="hdGlow" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="#C8FF00" stopOpacity="0.09" />
            <stop offset="60%" stopColor="#C8FF00" stopOpacity="0.02" />
            <stop offset="100%" stopColor="#050708" stopOpacity="0" />
          </radialGradient>
          <pattern id="hdGrid" width="36" height="36" patternUnits="userSpaceOnUse">
            <path d="M 36 0 L 0 0 0 36" fill="none" stroke="#24313C" strokeWidth="0.6" strokeOpacity="0.35" />
          </pattern>
        </defs>

        {/* Ambient radial glow & architectural grid */}
        <rect width="100%" height="100%" fill="url(#hdGlow)" />
        <rect width="100%" height="100%" fill="url(#hdGrid)" />

        {/* --- CAMPUS ROADWAYS & GEOMETRY (NEON-LIME #C8FF00) --- */}
        {/* Central Roundabout Complex */}
        <circle cx="390" cy="290" r="48" stroke="#C8FF00" strokeWidth="1.8" strokeOpacity="0.4" />
        <circle cx="390" cy="290" r="38" stroke="#C8FF00" strokeWidth="1.2" strokeDasharray="4 4" strokeOpacity="0.3" />
        <circle cx="390" cy="290" r="16" stroke="#C8FF00" strokeWidth="1.6" strokeOpacity="0.45" />
        <circle cx="390" cy="290" r="5" fill="#C8FF00" fillOpacity="0.7" />

        {/* Radiating Main Campus Arteries */}
        <path d="M 390 242 L 390 30" stroke="#C8FF00" strokeWidth="1.8" strokeOpacity="0.35" />
        <path d="M 390 338 L 390 530" stroke="#C8FF00" strokeWidth="1.8" strokeOpacity="0.35" />
        <path d="M 342 290 L 60 290" stroke="#C8FF00" strokeWidth="1.8" strokeOpacity="0.35" />
        <path d="M 438 290 L 740 290" stroke="#C8FF00" strokeWidth="1.8" strokeOpacity="0.35" />

        {/* Diagonal campus rings & pathways */}
        <path d="M 356 256 L 150 90" stroke="#C8FF00" strokeWidth="1.4" strokeOpacity="0.3" />
        <path d="M 424 256 L 660 70" stroke="#C8FF00" strokeWidth="1.4" strokeOpacity="0.3" />
        <path d="M 356 324 L 170 510" stroke="#C8FF00" strokeWidth="1.4" strokeOpacity="0.3" />
        <path d="M 424 324 L 640 510" stroke="#C8FF00" strokeWidth="1.4" strokeOpacity="0.3" />

        {/* Inner & Outer Boulevard Rings */}
        <circle cx="390" cy="290" r="130" stroke="#C8FF00" strokeWidth="1.2" strokeOpacity="0.22" strokeDasharray="6 5" />
        <circle cx="390" cy="290" r="210" stroke="#C8FF00" strokeWidth="1" strokeOpacity="0.16" />

        {/* Secondary connecting arteries */}
        <path d="M 230 170 L 550 170" stroke="#C8FF00" strokeWidth="1" strokeOpacity="0.2" />
        <path d="M 210 410 L 570 410" stroke="#C8FF00" strokeWidth="1" strokeOpacity="0.2" />
        <path d="M 230 170 L 160 300 L 210 410" stroke="#C8FF00" strokeWidth="1" strokeOpacity="0.2" />
        <path d="M 550 170 L 620 300 L 570 410" stroke="#C8FF00" strokeWidth="1" strokeOpacity="0.2" />

        {/* --- WIREFRAME CAMPUS BUILDINGS (ISOMETRIC 3D) --- */}
        
        {/* 1. LIBRARY (Top Right Building Complex) */}
        <g stroke="#C8FF00" strokeOpacity="0.4" strokeWidth="1.2" fill="#0B1014" fillOpacity="0.65">
          <polygon points="580,75 650,45 685,68 615,98" />
          <polygon points="580,75 615,98 615,145 580,122" />
          <polygon points="615,98 685,68 685,115 615,145" />
          {/* Facade Windows */}
          <line x1="590" y1="88" x2="605" y2="98" strokeOpacity="0.3" />
          <line x1="590" y1="102" x2="605" y2="112" strokeOpacity="0.3" />
          <line x1="628" y1="108" x2="672" y2="88" strokeOpacity="0.3" />
          <line x1="628" y1="122" x2="672" y2="102" strokeOpacity="0.3" />
        </g>
        <text x="635" y="40" fill="#94A3B8" fontSize="10" fontWeight="800" letterSpacing="1.8" textAnchor="middle">
          LIBRARY
        </text>

        {/* 2. HOSTEL GATE (Bottom Left Building Complex) */}
        <g stroke="#C8FF00" strokeOpacity="0.4" strokeWidth="1.2" fill="#0B1014" fillOpacity="0.65">
          <polygon points="130,400 200,370 235,392 165,422" />
          <polygon points="130,400 165,422 165,470 130,448" />
          <polygon points="165,422 235,392 235,440 165,470" />
          <line x1="140" y1="412" x2="155" y2="422" strokeOpacity="0.3" />
          <line x1="178" y1="432" x2="222" y2="412" strokeOpacity="0.3" />
        </g>
        <text x="180" y="495" fill="#94A3B8" fontSize="10" fontWeight="800" letterSpacing="1.8" textAnchor="middle">
          HOSTEL GATE
        </text>

        {/* 3. FoET (Faculty of Engineering & Tech - Mid Right Complex) */}
        <g stroke="#C8FF00" strokeOpacity="0.35" strokeWidth="1.2" fill="#0B1014" fillOpacity="0.65">
          <polygon points="630,360 695,335 725,355 660,380" />
          <polygon points="630,360 660,380 660,420 630,400" />
          <polygon points="660,380 725,355 725,395 660,420" />
        </g>
        <text x="680" y="438" fill="#94A3B8" fontSize="10" fontWeight="800" letterSpacing="1.8" textAnchor="middle">
          FoET
        </text>

        {/* Subtle Campus Foliage / Trees */}
        <circle cx="160" cy="180" r="5" fill="#C8FF00" fillOpacity="0.25" />
        <circle cx="175" cy="170" r="6" fill="#C8FF00" fillOpacity="0.3" />
        <circle cx="150" cy="200" r="4" fill="#C8FF00" fillOpacity="0.2" />

        <circle cx="610" cy="220" r="5" fill="#C8FF00" fillOpacity="0.25" />
        <circle cx="625" cy="210" r="6" fill="#C8FF00" fillOpacity="0.3" />
        <circle cx="640" cy="230" r="4" fill="#C8FF00" fillOpacity="0.2" />

        <circle cx="310" cy="460" r="5" fill="#C8FF00" fillOpacity="0.25" />
        <circle cx="325" cy="450" r="6" fill="#C8FF00" fillOpacity="0.3" />
        <circle cx="340" cy="470" r="4" fill="#C8FF00" fillOpacity="0.2" />
      </svg>

      {/* COMPASS ROSE IN TOP RIGHT */}
      <div className="absolute top-5 right-6 flex flex-col items-center pointer-events-none z-10">
        <span className="text-xs font-black text-[#C8FF00] tracking-widest leading-none mb-1">N</span>
        <div className="w-5 h-5 flex items-center justify-center">
          <Navigation className="w-4 h-4 text-[#C8FF00] rotate-45 stroke-[2.5]" />
        </div>
      </div>

      {/* --- THREE 3D FLOATING GADGETS WITH AMBIENT NEON LIGHT POOLS --- */}
      
      {/* 1. TOP-LEFT: MacBook Air (Item 1) */}
      <div 
        onClick={() => onSelectProduct && onSelectProduct('item-1')}
        className="absolute top-[8%] sm:top-[10%] left-[12%] sm:left-[16%] z-30 group cursor-pointer transition-transform duration-500"
      >
        {/* Neon Lime Ambient Ground Pool */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 sm:w-56 h-32 sm:h-40 rounded-full bg-[#C8FF00]/25 blur-2xl pointer-events-none group-hover:bg-[#C8FF00]/40 transition-colors"></div>

        {/* 3D Floating Assembly */}
        <div className="relative flex flex-col items-center animate-float-3d [transform-style:preserve-3d]">
          {/* HD Transparent Product Image */}
          <div className="w-36 sm:w-48 lg:w-56 h-24 sm:h-32 flex items-center justify-center relative z-10 transition-transform duration-300 group-hover:scale-105">
            <img
              src="/laptop.png"
              alt="MacBook Air"
              className="max-w-full max-h-full object-contain filter drop-shadow-[0_20px_25px_rgba(0,0,0,0.95)]"
            />
          </div>

          {/* Floating Shadow Underneath */}
          <div className="w-28 sm:w-36 h-3 rounded-[100%] bg-black/70 blur-sm -mt-2"></div>

          {/* Floating Tag with Glowing Location Pin */}
          <div className="flex items-center gap-1.5 mt-1 z-20 transition-transform duration-300 group-hover:-translate-y-1">
            <div className="w-6 h-6 rounded-full bg-[#C8FF00] text-black flex items-center justify-center shadow-[0_0_14px_rgba(200,255,0,0.8)] shrink-0">
              <MapPin className="w-3.5 h-3.5 fill-black" />
            </div>
            <div className="px-3 py-1 rounded-lg bg-[#0B1014]/95 border border-[#24313C] text-[11px] font-semibold text-[#F5F7FA] whitespace-nowrap shadow-xl group-hover:border-[#C8FF00] transition-colors">
              MacBook Air <span className="text-[#94A3B8]">·</span> <span className="text-[#94A3B8]">3 min walk</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MIDDLE-RIGHT: Instant Camera (Item 3) */}
      <div 
        onClick={() => onSelectProduct && onSelectProduct('item-3')}
        className="absolute top-[28%] sm:top-[30%] right-[12%] sm:right-[18%] z-30 group cursor-pointer transition-transform duration-500"
      >
        {/* Neon Lime Ambient Ground Pool */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 sm:w-44 h-32 sm:h-36 rounded-full bg-[#C8FF00]/25 blur-2xl pointer-events-none group-hover:bg-[#C8FF00]/40 transition-colors"></div>

        {/* 3D Floating Assembly */}
        <div className="relative flex flex-col items-center animate-float-3d-slow [transform-style:preserve-3d]">
          {/* HD Transparent Product Image */}
          <div className="w-24 sm:w-28 lg:w-32 h-24 sm:h-28 flex items-center justify-center relative z-10 transition-transform duration-300 group-hover:scale-105">
            <img
              src="/instax-camera.png"
              alt="Instant Camera"
              className="max-w-full max-h-full object-contain filter drop-shadow-[0_20px_25px_rgba(0,0,0,0.95)]"
            />
          </div>

          {/* Floating Shadow Underneath */}
          <div className="w-20 sm:w-24 h-3 rounded-[100%] bg-black/70 blur-sm -mt-1"></div>

          {/* Floating Tag with Glowing Location Pin */}
          <div className="flex items-center gap-1.5 mt-1 z-20 transition-transform duration-300 group-hover:-translate-y-1">
            <div className="w-6 h-6 rounded-full bg-[#C8FF00] text-black flex items-center justify-center shadow-[0_0_14px_rgba(200,255,0,0.8)] shrink-0">
              <MapPin className="w-3.5 h-3.5 fill-black" />
            </div>
            <div className="px-3 py-1 rounded-lg bg-[#0B1014]/95 border border-[#24313C] text-[11px] font-semibold text-[#F5F7FA] whitespace-nowrap shadow-xl group-hover:border-[#C8FF00] transition-colors">
              Instant camera <span className="text-[#94A3B8]">·</span> <span className="text-[#94A3B8]">near Library</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM-CENTER: Controller (Item 2) */}
      <div 
        onClick={() => onSelectProduct && onSelectProduct('item-2')}
        className="absolute bottom-[8%] sm:bottom-[10%] left-[32%] sm:left-[38%] z-30 group cursor-pointer transition-transform duration-500"
      >
        {/* Neon Lime Ambient Ground Pool */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 sm:w-48 h-32 sm:h-36 rounded-full bg-[#C8FF00]/25 blur-2xl pointer-events-none group-hover:bg-[#C8FF00]/40 transition-colors"></div>

        {/* 3D Floating Assembly */}
        <div className="relative flex flex-col items-center animate-float-3d-reverse [transform-style:preserve-3d]">
          {/* HD Transparent Product Image */}
          <div className="w-28 sm:w-32 lg:w-36 h-20 sm:h-24 flex items-center justify-center relative z-10 transition-transform duration-300 group-hover:scale-105">
            <img
              src="/game-controller.png"
              alt="Controller"
              className="max-w-full max-h-full object-contain filter drop-shadow-[0_20px_25px_rgba(0,0,0,0.95)]"
            />
          </div>

          {/* Floating Shadow Underneath */}
          <div className="w-24 sm:w-28 h-3 rounded-[100%] bg-black/70 blur-sm -mt-1"></div>

          {/* Floating Tag with Glowing Location Pin */}
          <div className="flex items-center gap-1.5 mt-1 z-20 transition-transform duration-300 group-hover:-translate-y-1">
            <div className="w-6 h-6 rounded-full bg-[#C8FF00] text-black flex items-center justify-center shadow-[0_0_14px_rgba(200,255,0,0.8)] shrink-0">
              <MapPin className="w-3.5 h-3.5 fill-black" />
            </div>
            <div className="px-3 py-1 rounded-lg bg-[#0B1014]/95 border border-[#24313C] text-[11px] font-semibold text-[#F5F7FA] whitespace-nowrap shadow-xl group-hover:border-[#C8FF00] transition-colors">
              Controller <span className="text-[#94A3B8]">·</span> <span className="text-[#94A3B8]">FoET</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
