import React, { useState } from 'react';
import { Menu, X, MapPin, ChevronDown, Plus, LogIn, UserPlus } from 'lucide-react';
import { Campus } from '../types';

interface HeaderProps {
  onOpenListItemModal: () => void;
  onOpenAuthModal: () => void;
  onOpenSignInModal: () => void;
  onOpenRegisterModal: () => void;
  onNavigate: (sectionId: string) => void;
  currentCampus?: Campus;
  onOpenCampusModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenListItemModal,
  onOpenAuthModal,
  onOpenSignInModal,
  onOpenRegisterModal,
  onNavigate,
  currentCampus,
  onOpenCampusModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'explore' | 'how-it-works' | 'campus-map'>('explore');

  const handleNavClick = (tab: 'explore' | 'how-it-works' | 'campus-map', targetId: string) => {
    setActiveTab(tab);
    onNavigate(targetId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#050708]/90 border-b border-[#24313C] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* LEFT: RENTOZI Logo & Campus Borrow Club subtitle */}
          <button 
            onClick={() => handleNavClick('explore', 'hero')}
            className="flex items-center gap-3.5 text-left group cursor-pointer shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-[#C8FF00] text-black font-black text-2xl flex items-center justify-center tracking-tighter shadow-sm">
              R
            </div>
            <div className="flex items-center gap-2.5">
              <span className="font-extrabold text-2xl tracking-tight text-[#F5F7FA] block leading-none">
                RENTOZI
              </span>
              <div className="hidden sm:flex flex-col text-left pl-1">
                <span className="text-[9px] font-bold text-[#94A3B8] tracking-widest uppercase leading-tight">
                  CAMPUS
                </span>
                <span className="text-[9px] font-bold text-[#94A3B8] tracking-widest uppercase leading-tight">
                  BORROW CLUB
                </span>
              </div>
            </div>
          </button>

          {/* CENTER: Navigation Links (Explore, How it works, Campus map) */}
          <nav className="hidden lg:flex items-center gap-8">
            <button
              onClick={() => handleNavClick('explore', 'hero')}
              className={`text-sm font-semibold transition-colors cursor-pointer relative py-2 ${
                activeTab === 'explore'
                  ? 'text-[#F5F7FA]'
                  : 'text-[#94A3B8] hover:text-[#F5F7FA]'
              }`}
            >
              <span>Explore</span>
              {activeTab === 'explore' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#C8FF00] rounded-full"></span>
              )}
            </button>

            <button
              onClick={() => handleNavClick('how-it-works', 'how-it-works')}
              className={`text-sm font-semibold transition-colors cursor-pointer relative py-2 ${
                activeTab === 'how-it-works'
                  ? 'text-[#F5F7FA]'
                  : 'text-[#94A3B8] hover:text-[#F5F7FA]'
              }`}
            >
              <span>How it works</span>
              {activeTab === 'how-it-works' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#C8FF00] rounded-full"></span>
              )}
            </button>

            <button
              onClick={() => handleNavClick('campus-map', 'hero')}
              className={`text-sm font-semibold transition-colors cursor-pointer relative py-2 ${
                activeTab === 'campus-map'
                  ? 'text-[#F5F7FA]'
                  : 'text-[#94A3B8] hover:text-[#F5F7FA]'
              }`}
            >
              <span>Campus map</span>
              {activeTab === 'campus-map' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#C8FF00] rounded-full"></span>
              )}
            </button>
          </nav>

          {/* RIGHT: Campus Selector & + Lend an item button */}
          <div className="hidden md:flex items-center gap-3.5">
            {/* Campus Selector Pill with Verification status */}
            {onOpenCampusModal && (
              <button
                type="button"
                onClick={onOpenCampusModal}
                className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#0B1014] border border-[#24313C] hover:border-[#C8FF00]/50 transition-all text-left cursor-pointer group"
              >
                <div className="w-6 h-6 rounded-lg bg-[#C8FF00]/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-3.5 h-3.5 text-[#C8FF00]" />
                </div>
                <div className="leading-tight">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[#F5F7FA] group-hover:text-[#C8FF00] transition-colors truncate max-w-[130px]">
                      {currentCampus?.name || 'Marwadi University'}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] group-hover:text-[#F5F7FA]" />
                  </div>
                  <span className="text-[10px] font-semibold text-[#C8FF00] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C8FF00]"></span>
                    Verified
                  </span>
                </div>
              </button>
            )}


            {/* Sign In button */}
            <button
              onClick={onOpenSignInModal}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-sm border border-[#24313C] text-[#F5F7FA] hover:border-[#C8FF00]/50 hover:text-[#C8FF00] transition-all cursor-pointer active:scale-95"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>

            {/* Register button */}
            <button
              onClick={onOpenRegisterModal}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-sm bg-[#C8FF00]/10 border border-[#C8FF00]/40 text-[#C8FF00] hover:bg-[#C8FF00]/20 transition-all cursor-pointer active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register</span>
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onOpenListItemModal}
              className="p-2 rounded-xl bg-[#C8FF00] text-black font-bold text-xs"
              title="Lend an item"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-[#0B1014] border border-[#24313C] text-[#F5F7FA]"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#24313C] bg-[#050708]/98 backdrop-blur-2xl px-6 pt-4 pb-6 space-y-4">
          {onOpenCampusModal && (
            <button
              type="button"
              onClick={() => { setMobileMenuOpen(false); onOpenCampusModal(); }}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-[#0B1014] border border-[#24313C] text-left"
            >
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-[#C8FF00]" />
                <div>
                  <span className="text-xs font-bold text-[#F5F7FA] block">
                    {currentCampus?.name || 'Marwadi University'}
                  </span>
                  <span className="text-[10px] font-semibold text-[#C8FF00] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C8FF00]"></span>
                    Campus Verified
                  </span>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-[#94A3B8]" />
            </button>
          )}

          <nav className="flex flex-col space-y-2 pt-2">
            <button
              onClick={() => handleNavClick('explore', 'hero')}
              className="text-left text-sm font-semibold text-[#F5F7FA] py-2"
            >
              Explore
            </button>
            <button
              onClick={() => handleNavClick('how-it-works', 'how-it-works')}
              className="text-left text-sm font-medium text-[#94A3B8] py-2"
            >
              How It Works
            </button>
            <button
              onClick={() => handleNavClick('campus-map', 'hero')}
              className="text-left text-sm font-medium text-[#94A3B8] py-2"
            >
              Campus Map
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); onNavigate('rentals'); }}
              className="text-left text-sm font-medium text-[#94A3B8] py-2"
            >
              Popular Rentals
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); onNavigate('services'); }}
              className="text-left text-sm font-medium text-[#C8FF00] py-2"
            >
              Admin Services
            </button>
          </nav>

          <div className="pt-2 flex flex-col gap-2.5">
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenListItemModal(); }}
              className="w-full py-3 rounded-xl font-bold text-sm bg-[#C8FF00] text-black text-center flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Lend an item</span>
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenSignInModal(); }}
              className="w-full py-2.5 rounded-xl font-semibold text-sm border border-[#24313C] text-[#F5F7FA] text-center flex items-center justify-center gap-1.5 hover:border-[#C8FF00]/50 hover:text-[#C8FF00] transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenRegisterModal(); }}
              className="w-full py-2.5 rounded-xl font-bold text-sm bg-[#C8FF00]/10 border border-[#C8FF00]/40 text-[#C8FF00] text-center flex items-center justify-center gap-1.5 hover:bg-[#C8FF00]/20 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Register
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
