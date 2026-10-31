import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { TrustStats } from './components/TrustStats';
import { SearchBar } from './components/SearchBar';
import { Categories } from './components/Categories';
import { PopularRentals } from './components/PopularRentals';
import { Services } from './components/Services';
import { ProductDetailModal } from './components/ProductDetailModal';
import { PaymentModal } from './components/PaymentModal';
import { PickupVerificationModal } from './components/PickupVerificationModal';
import { ServiceRequestModal } from './components/ServiceRequestModal';
import { ActiveOrdersWidget } from './components/ActiveOrdersWidget';
import { ListItemModal } from './components/ListItemModal';
import { HowItWorks } from './components/HowItWorks';
import { CtaBanner } from './components/CtaBanner';
import { AuthModal } from './components/AuthModal';
import { CampusModal } from './components/CampusModal';
import { Toast } from './components/Toast';
import { Footer } from './components/Footer';
import { HelpSection } from './components/HelpSection';
import { SignInModal } from './components/SignInModal';
import { RegisterModal } from './components/RegisterModal';
import { RentoAIModal } from './components/RentoAIModal';
import { Sparkles } from 'lucide-react';


import { MOCK_ITEMS, CAMPUSES } from './data/mockData';
import { RentalItem, Campus, ItemCategory, RentalOrder, AdminService, ServiceRequest } from './types';
import { getItems, getCampuses } from './api/client';

export function App() {
  const [currentCampus, setCurrentCampus] = useState<Campus>(CAMPUSES[0]); // Default: MU Rajkot
  const [items, setItems] = useState<RentalItem[]>(MOCK_ITEMS);
  const [campuses, setCampuses] = useState<Campus[]>(CAMPUSES);
  
  // Search & Filter State
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch initial data from Django backend
  useEffect(() => {
    let isMounted = true;
    Promise.all([getItems(), getCampuses()])
      .then(([serverItems, serverCampuses]) => {
        if (!isMounted) return;
        if (serverItems && serverItems.length > 0) {
          setItems(serverItems);
        }
        if (serverCampuses && serverCampuses.length > 0) {
          setCampuses(serverCampuses);
        }
      })
      .catch(err => {
        console.warn('Backend initial fetch fallback:', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Wishlist / Saved items in LocalStorage
  const [savedItemIds, setSavedItemIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('rentozi_saved_items');
      return stored ? JSON.parse(stored) : ['item-1', 'item-3'];
    } catch (e) {
      return ['item-1', 'item-3'];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('rentozi_saved_items', JSON.stringify(savedItemIds));
    } catch (e) {
      console.error(e);
    }
  }, [savedItemIds]);


  // Modals & Overlay state
  const [selectedItemForDetail, setSelectedItemForDetail] = useState<RentalItem | null>(null);
  const [selectedServiceForRequest, setSelectedServiceForRequest] = useState<AdminService | null>(null);
  const [isListItemModalOpen, setIsListItemModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCampusModalOpen, setIsCampusModalOpen] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Payment Gateway & Verification QR State
  const [checkoutData, setCheckoutData] = useState<{
    item: RentalItem;
    durationMode: 'HOURLY' | 'DAILY';
    durationValue: number;
    startDate: string;
    endDate: string;
    renterName: string;
    renterEmail: string;
    renterCampus: string;
  } | null>(null);

  const [activeOrder, setActiveOrder] = useState<RentalOrder | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Toggle favorite / saved
  const handleToggleSave = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (savedItemIds.includes(itemId)) {
      setSavedItemIds(savedItemIds.filter(id => id !== itemId));
      showToast('Item removed from saved wishlist');
    } else {
      setSavedItemIds([...savedItemIds, itemId]);
      showToast('Item saved to your wishlist');
    }
  };

  // Add new listed item
  const handleItemAdded = (newItem: RentalItem) => {
    setItems(prev => [newItem, ...prev]);
    showToast(`"${newItem.title}" has been listed on ${currentCampus.shortName}!`);
  };

  // Navigation scroll helper
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Checkout & Payment Workflow Handlers
  const handleProceedToPayment = (data: typeof checkoutData) => {
    setCheckoutData(data);
    setSelectedItemForDetail(null);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentComplete = (newOrder: RentalOrder) => {
    setIsPaymentModalOpen(false);
    setActiveOrder(newOrder);
    setIsVerificationModalOpen(true);
    showToast(`Payment confirmed received by owner! Pickup code: ${newOrder.pickupCode}`);
  };

  const handleOrderUpdated = (updatedOrder: RentalOrder) => {
    setActiveOrder(updatedOrder);
    if (updatedOrder.status === 'ACTIVE_RENTAL') {
      showToast(`Handover verified! Live rental timer started for ${updatedOrder.item.title}.`);
    } else if (updatedOrder.depositStatus === 'REFUND_COMPLETED') {
      showToast(`Deposit refund confirmed by both parties! Rental completed.`);
    } else if (updatedOrder.depositStatus === 'REFUND_PENDING_CONFIRMATION') {
      showToast(`Owner marked deposit returned. Renter confirmation pending.`);
    } else if (updatedOrder.status === 'DISPUTED') {
      showToast(`Problem reported. Community resolution team notified.`);
    }
  };

  // Service Request Handler
  const handleServiceRequestSubmitted = (req: ServiceRequest) => {
    showToast(`Direct request for ${req.serviceType} sent to Admin! We will email ${req.studentEmail}.`);
  };

  // Auth Success Handler
  const handleAuthSuccess = (email: string) => {
    showToast(`Authenticated as ${email}! University .ac.in access granted.`);
  };

  // Filtered items list calculation
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchCat = item.category.toLowerCase().includes(q);
        if (!matchTitle && !matchCat) {
          return false;
        }
      }
      return true;
    });
  }, [items, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-[#050708] text-[#F5F7FA] flex flex-col font-sans selection:bg-[#C8FF00] selection:text-black">
      
      {/* HEADER */}
      <Header
        onOpenListItemModal={() => setIsListItemModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenSignInModal={() => setIsSignInModalOpen(true)}
        onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
        onNavigate={scrollToSection}
        currentCampus={currentCampus}
        onOpenCampusModal={() => setIsCampusModalOpen(true)}
      />

      {/* FLOATING ACTIVE ORDERS / LIVE TIMER WIDGET */}
      <ActiveOrdersWidget
        activeOrder={activeOrder}
        onOpenVerificationModal={() => setIsVerificationModalOpen(true)}
      />

      {/* MAIN HOMEPAGE CONTENT */}
      <main className="flex-1">
        
        {/* HERO SECTION WITH BALANCED TWO-COLUMN LAYOUT AND UNIFIED SEARCH */}
        <Hero
          currentCampus={currentCampus}
          onOpenCampusModal={() => setIsCampusModalOpen(true)}
          selectedCategory={selectedCategory}
          onCategoryChange={(cat) => {
            setSelectedCategory(cat);
            scrollToSection('rentals');
          }}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          onExecuteSearch={() => scrollToSection('rentals')}
          onSelectProduct={(productId) => {
            const found = items.find(i => i.id === productId);
            if (found) setSelectedItemForDetail(found);
          }}
          onOpenListItemModal={() => setIsListItemModalOpen(true)}
        />

        {/* SLIM HORIZONTAL TRUST STATISTICS STRIP */}
        <TrustStats
          itemCount={items.length}
          studentCount={85}
          campusCount={campuses.length}
        />

        {/* EXPLORE CATEGORIES (4 EQUALLY SIZED DESKTOP CARDS) */}
        <Categories
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            scrollToSection('rentals');
          }}
        />

        {/* POPULAR RENTALS NEAR YOU */}
        <PopularRentals
          items={filteredItems}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          savedItemIds={savedItemIds}
          onToggleSave={handleToggleSave}
          onSelectItem={(item) => setSelectedItemForDetail(item)}
        />

        {/* DIRECT ADMIN SERVICES SECTION (Photography, Content Writing, Video Editor, Graphic Designer) */}
        <Services
          onSelectService={(srv) => setSelectedServiceForRequest(srv)}
        />

        {/* HOW IT WORKS */}
        <HowItWorks />

        {/* HELP / CONTACT SECTION */}
        <HelpSection />

        {/* LIST YOUR ITEM CTA BANNER */}
        <CtaBanner onListItemClick={() => setIsListItemModalOpen(true)} />


      </main>

      {/* SIMPLE FOOTER */}
      <Footer
        currentCampus={currentCampus}
        onOpenCampusModal={() => setIsCampusModalOpen(true)}
        onNavigate={scrollToSection}
        onOpenListItemModal={() => setIsListItemModalOpen(true)}
      />

      {/* MODALS */}
      <ProductDetailModal
        item={selectedItemForDetail}
        onClose={() => setSelectedItemForDetail(null)}
        isSaved={selectedItemForDetail ? savedItemIds.includes(selectedItemForDetail.id) : false}
        onToggleSave={handleToggleSave}
        onProceedToPayment={handleProceedToPayment}
      />

      {/* DIRECT ADMIN SERVICE REQUEST MODAL */}
      <ServiceRequestModal
        service={selectedServiceForRequest}
        onClose={() => setSelectedServiceForRequest(null)}
        onSubmitRequest={handleServiceRequestSubmitted}
      />

      {/* PAYMENT GATEWAY MODAL */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        item={checkoutData?.item || null}
        durationMode={checkoutData?.durationMode || 'DAILY'}
        durationValue={checkoutData?.durationValue || 1}
        startDate={checkoutData?.startDate || ''}
        endDate={checkoutData?.endDate || ''}
        renterName={checkoutData?.renterName || ''}
        renterEmail={checkoutData?.renterEmail || ''}
        renterCampus={checkoutData?.renterCampus || ''}
        onPaymentComplete={handlePaymentComplete}
      />

      {/* PICKUP CONFIRMATION & QR VERIFICATION / SCANNER MODAL */}
      <PickupVerificationModal
        isOpen={isVerificationModalOpen}
        order={activeOrder}
        onClose={() => setIsVerificationModalOpen(false)}
        onOrderUpdated={handleOrderUpdated}
      />

      <ListItemModal
        isOpen={isListItemModalOpen}
        onClose={() => setIsListItemModalOpen(false)}
        onItemAdded={handleItemAdded}
        currentCampus={currentCampus}
      />

      {/* OTP AUTH MODAL WITH .ac.in EMAIL VALIDATION */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentCampus={currentCampus}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* SIGN IN MODAL */}
      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={() => setIsSignInModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        onSwitchToRegister={() => setIsRegisterModalOpen(true)}
      />

      {/* REGISTER MODAL */}
      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        onSwitchToSignIn={() => setIsSignInModalOpen(true)}
      />

      <CampusModal
        isOpen={isCampusModalOpen}
        onClose={() => setIsCampusModalOpen(false)}
        currentCampus={currentCampus}
        campuses={campuses}
        onSelectCampus={(c) => {
          setCurrentCampus(c);
          showToast(`Campus switched to ${c.name}`);
        }}
      />

      {/* TOAST NOTIFICATIONS */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />

      {/* RENTOAI CAMPUS ASSISTANT MODAL */}
      <RentoAIModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        items={items}
        onSelectItem={(item) => setSelectedItemForDetail(item)}
        currentCampus={currentCampus}
        onOpenListItemModal={() => setIsListItemModalOpen(true)}
      />

      {/* FLOATING RENTOAI TRIGGER BUTTON */}
      <aside 
        aria-label="Campus AI Co-Pilot Assistant"
        className="fixed bottom-6 right-6 z-40"
      >
        <button
          onClick={() => setIsAiModalOpen(true)}
          className="group flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#C8FF00] hover:bg-[#b2e600] text-black font-extrabold text-xs sm:text-sm shadow-2xl shadow-[#C8FF00]/30 hover:scale-105 active:scale-95 transition-all cursor-pointer border-2 border-black"
          title="Open RentoAI Assistant"
        >
          <div className="w-6 h-6 rounded-full bg-black text-[#C8FF00] flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          </div>
          <span className="tracking-tight">Ask RentoAI</span>
          <span className="w-2 h-2 rounded-full bg-emerald-700 animate-ping hidden sm:inline-block" />
        </button>
      </aside>

    </div>
  );
}

export default App;
