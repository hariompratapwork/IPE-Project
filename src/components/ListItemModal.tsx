import React, { useState } from 'react';
import { X, Plus, Upload, CheckCircle2, Sparkles, Image as ImageIcon, ShieldCheck } from 'lucide-react';
import { RentalItem, ItemCategory, ItemCondition, Campus } from '../types';
import { createItem } from '../api/client';

interface ListItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemAdded: (newItem: RentalItem) => void;
  currentCampus: Campus;
}

export const ListItemModal: React.FC<ListItemModalProps> = ({
  isOpen,
  onClose,
  onItemAdded,
  currentCampus,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ItemCategory>('Electronics');
  const [pricePerDay, setPricePerDay] = useState<number>(150);
  const [securityDeposit, setSecurityDeposit] = useState<number>(1000);
  const [condition, setCondition] = useState<ItemCondition>('Like New');
  const [location, setLocation] = useState('Hostel Block B');
  const [description, setDescription] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerDept, setOwnerDept] = useState('CSE, 3rd Year');

  // Sample preset product images for student convenience
  const sampleImages = [
    { label: 'Laptop', url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800' },
    { label: 'Camera', url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800' },
    { label: 'Headphones', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800' },
    { label: 'Speaker', url: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&q=80&w=800' },
    { label: 'Calculator', url: 'https://images.unsplash.com/photo-1610563166150-b34df4f3bcd6?auto=format&fit=crop&q=80&w=800' },
    { label: 'Bicycle', url: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=800' },
    { label: 'Projector', url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800' },
    { label: 'Backpack', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800' },
  ];

  const [imageUrl, setImageUrl] = useState<string>(sampleImages[0].url);
  const [customUrl, setCustomUrl] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newItem: RentalItem = {
      id: `user-item-${Date.now()}`,
      title: title.trim(),
      category,
      pricePerDay: Number(pricePerDay) || 100,
      securityDeposit: Number(securityDeposit) || 500,
      rating: 5.0,
      reviewCount: 1,
      location: `${location} (${currentCampus.shortName})`,
      campus: currentCampus.name,
      imageUrl: customUrl.trim() ? customUrl.trim() : imageUrl,
      condition,
      isPopular: false,
      availableNow: true,
      description: description || 'Great condition item available for quick rental on campus.',
      highlights: ['Verified student listing', 'Pick up directly on campus', 'Sanitized & tested'],
      includedItems: [title.trim(), 'Protective case / Charger'],
      owner: {
        id: `owner-${Date.now()}`,
        name: ownerName.trim() || 'Student Host',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
        campus: currentCampus.name,
        hostelOrDept: ownerDept || 'Student',
        rating: 5.0,
        rentalsCompleted: 1,
        verifiedStudent: true,
        joinYear: '2024',
      },
      reviews: []
    };

    // Persist to backend database and frontend state
    createItem(newItem).catch(err => console.warn('Could not persist item to backend:', err));

    onItemAdded(newItem);
    setSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#0F141C] border border-white/15 rounded-2xl sm:rounded-3xl shadow-glow-lg overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#07090E]/60 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-brand-lime text-black font-extrabold text-xs">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">List Your Item for Rent</h2>
              <p className="text-[11px] text-slate-400">Earn extra money from unused gadgets & gear</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 overflow-y-auto">
          {success ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-brand-lime/20 border border-brand-lime/40 text-brand-lime flex items-center justify-center mx-auto shadow-glow">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-extrabold text-white">Your Item is Live on HIRO!</h3>
              <p className="text-sm text-slate-300 max-w-md mx-auto">
                <strong className="text-brand-lime">{title}</strong> has been published to <strong className="text-white">{currentCampus.name}</strong>. Fellow students near {location} can now discover and request to rent it!
              </p>
              <button
                onClick={onClose}
                className="py-3 px-8 rounded-xl bg-brand-lime text-black font-extrabold text-xs shadow-glow hover:bg-brand-limeHover cursor-pointer"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* FORM FIELDS (Cols 1-7) */}
              <div className="lg:col-span-7 space-y-4">
                
                {/* Title */}
                <div>
                  <label className="block text-[11px] uppercase font-bold text-slate-300 mb-1">
                    Item Title / Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sony Headphones XM4 / Casio Scientific Calculator"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-lime"
                  />
                </div>

                {/* Category & Condition */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] uppercase font-bold text-slate-300 mb-1">
                      Category *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as ItemCategory)}
                      className="w-full p-3 rounded-xl bg-[#0F141C] border border-white/10 text-xs text-white focus:outline-none focus:border-brand-lime cursor-pointer"
                    >
                      <option value="Electronics">Electronics</option>
                      <option value="Study">Study</option>
                      <option value="Gaming">Gaming</option>
                      <option value="Photography">Photography</option>
                      <option value="College Essentials">College Essentials</option>
                      <option value="Sports">Sports</option>
                      <option value="Travel">Travel</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase font-bold text-slate-300 mb-1">
                      Item Condition *
                    </label>
                    <select
                      value={condition}
                      onChange={(e) => setCondition(e.target.value as ItemCondition)}
                      className="w-full p-3 rounded-xl bg-[#0F141C] border border-white/10 text-xs text-white focus:outline-none focus:border-brand-lime cursor-pointer"
                    >
                      <option value="Like New">Like New</option>
                      <option value="Excellent">Excellent</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                    </select>
                  </div>
                </div>

                {/* Pricing & Deposit */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] uppercase font-bold text-slate-300 mb-1">
                      Price / Day (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min="10"
                      value={pricePerDay}
                      onChange={(e) => setPricePerDay(Number(e.target.value))}
                      className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-brand-lime font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase font-bold text-slate-300 mb-1">
                      Security Deposit (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={securityDeposit}
                      onChange={(e) => setSecurityDeposit(Number(e.target.value))}
                      className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-brand-lime font-bold"
                    />
                  </div>
                </div>

                {/* Pickup Location & Owner Name */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] uppercase font-bold text-slate-300 mb-1">
                      Campus Pickup Spot *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Hostel Block B / Library Gate"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-brand-lime"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase font-bold text-slate-300 mb-1">
                      Your Name / Dept *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aarav (CSE 3rd Year)"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-brand-lime"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[11px] uppercase font-bold text-slate-300 mb-1">
                    Short Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Mention key details, charger inclusion, battery condition, etc."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-brand-lime"
                  />
                </div>

                {/* Photo Selection */}
                <div>
                  <label className="block text-[11px] uppercase font-bold text-slate-300 mb-2">
                    Item Photo (Select Preset or Paste Image URL)
                  </label>
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {sampleImages.map((img) => (
                      <button
                        type="button"
                        key={img.label}
                        onClick={() => { setImageUrl(img.url); setCustomUrl(''); }}
                        className={`p-1.5 rounded-xl border text-[10px] font-semibold transition-all flex flex-col items-center gap-1 ${
                          imageUrl === img.url && !customUrl
                            ? 'border-brand-lime bg-brand-lime/10 text-brand-lime'
                            : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'
                        }`}
                      >
                        <img src={img.url} alt="" className="w-8 h-8 object-cover rounded-lg" />
                        <span>{img.label}</span>
                      </button>
                    ))}
                  </div>

                  <input
                    type="url"
                    placeholder="Or paste custom image URL (e.g. https://images.unsplash.com/...)"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-lime"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-xl bg-brand-lime text-black font-extrabold text-sm shadow-glow hover:bg-brand-limeHover cursor-pointer transition-all active:scale-95"
                >
                  Publish Listing Immediately
                </button>

              </div>

              {/* LIVE CARD PREVIEW (Cols 8-12) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 sticky top-20 space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-lime block">
                    Live Preview Card
                  </span>

                  <div className="rounded-2xl bg-[#0F141C] border border-white/15 overflow-hidden shadow-xl">
                    <div className="relative h-44 w-full bg-slate-900">
                      <img
                        src={customUrl.trim() ? customUrl : imageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-black/70 text-brand-lime border border-brand-lime/30">
                        {category}
                      </div>
                      <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded text-[10px] font-bold bg-white/20 text-white backdrop-blur-md">
                        {condition}
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <h4 className="font-bold text-sm text-white line-clamp-2">
                        {title || 'Your Item Title Preview'}
                      </h4>
                      <div className="text-[11px] text-slate-400">
                        {location} • {currentCampus.shortName}
                      </div>
                      <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                        <span className="text-xs text-slate-400">Deposit: ₹{securityDeposit}</span>
                        <span className="text-base font-extrabold text-brand-lime">₹{pricePerDay}/day</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 italic">
                    Your listing will appear instantly in the marketplace for all logged-in campus peers.
                  </p>
                </div>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
