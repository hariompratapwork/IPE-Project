import React, { useState, useEffect } from 'react';
import { Camera, FileText, Video, Palette, ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { AdminService, AdminServiceType } from '../types';
import { ADMIN_SERVICES } from '../data/mockData';
import { getAdminServices } from '../api/client';

interface ServicesProps {
  onSelectService: (service: AdminService) => void;
}

export const Services: React.FC<ServicesProps> = ({ onSelectService }) => {
  const [services, setServices] = useState<AdminService[]>(ADMIN_SERVICES);

  useEffect(() => {
    getAdminServices()
      .then(res => {
        if (res && res.length > 0) setServices(res);
      })
      .catch(err => console.warn('Services API fallback:', err));
  }, []);
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Camera': return <Camera className="w-6 h-6 text-brand-lime" />;
      case 'FileText': return <FileText className="w-6 h-6 text-brand-lime" />;
      case 'Video': return <Video className="w-6 h-6 text-brand-lime" />;
      case 'Palette': return <Palette className="w-6 h-6 text-brand-lime" />;
      default: return <Sparkles className="w-6 h-6 text-brand-lime" />;
    }
  };

  return (
    <section id="services" className="py-16 sm:py-20 bg-[#07090E] relative z-10 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        
        {/* SECTION HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-lime/10 border border-brand-lime/20 text-xs font-bold text-brand-lime mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>DIRECT ADMIN SERVICES</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Professional Campus Services
            </h2>
            <p className="mt-2 text-sm text-slate-400 max-w-xl">
              Get professional photography, content writing, video editing, and graphic design provided directly by our verified admin team.
            </p>
          </div>

          <div className="mt-4 md:mt-0 text-xs text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-lime animate-pulse"></span>
            <span>100% On-Time Delivery Guarantee</span>
          </div>
        </div>

        {/* 4 SERVICES CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((srv) => (
            <div
              key={srv.id}
              className="group rounded-3xl bg-[#0F141C] border border-white/10 hover:border-brand-lime/40 overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 shadow-lg hover:shadow-glow cursor-pointer"
              onClick={() => onSelectService(srv)}
            >
              {/* TOP IMAGE & ICON */}
              <div className="relative h-44 w-full overflow-hidden bg-slate-900">
                <img
                  src={srv.imageUrl}
                  alt={srv.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F141C] via-[#0F141C]/40 to-transparent"></div>

                <div className="absolute top-4 left-4 p-3 rounded-2xl bg-[#0F141C]/90 border border-white/15 backdrop-blur-md">
                  {getIcon(srv.iconName)}
                </div>

                <div className="absolute bottom-3 right-4 text-xs font-extrabold text-brand-lime px-2.5 py-1 rounded-full bg-black/60 border border-brand-lime/30 backdrop-blur-md">
                  {srv.startingPrice}
                </div>
              </div>

              {/* CARD BODY */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    {srv.subtitle}
                  </span>
                  <h3 className="text-xl font-extrabold text-white group-hover:text-brand-lime transition-colors">
                    {srv.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                    {srv.description}
                  </p>
                </div>

                {/* DELIVERABLES CHECKLIST */}
                <div className="space-y-1.5 pt-2 border-t border-white/5">
                  {srv.deliverables.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-lime shrink-0" />
                      <span className="truncate">{item}</span>
                    </div>
                  ))}
                </div>

                {/* CTA BUTTON */}
                <button
                  onClick={() => onSelectService(srv)}
                  className="w-full py-3 px-4 rounded-xl bg-white/5 group-hover:bg-brand-lime group-hover:text-black text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer mt-2"
                >
                  <span>Request {srv.title}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
