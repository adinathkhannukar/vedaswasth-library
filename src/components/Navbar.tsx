import React from 'react';
import { Customer, AppView } from '../types';
import { WHATSAPP_NUMBER, isAdminEmail } from '../lib/storage';
import { BookOpen, ShieldCheck, MessageCircle, LogOut, Settings, Home, ArrowLeft } from 'lucide-react';

interface NavbarProps {
  currentUser: Customer | null;
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  currentView,
  onViewChange,
  onLogout
}) => {
  const isAdmin = isAdminEmail(currentUser?.email || '');

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Namaste, I have purchased the eBook. Please grant me access to my library using my email address: ${currentUser?.email || 'N/A'}. Thank you!`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
  };

  return (
    <header className="sticky top-0 z-40 bg-[#fbf9f5]/95 backdrop-blur-md border-b border-[#e5dec9] w-full max-w-full box-border px-3 py-2 flex items-center justify-between overflow-hidden">
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between gap-2">
        <div 
          className="flex items-center space-x-2 cursor-pointer group min-w-0"
          onClick={() => onViewChange('library')}
        >
          <div className="w-9 h-9 rounded-full bg-[#064e3b] text-[#f4ecd8] flex items-center justify-center font-serif text-base font-bold shadow-sm group-hover:scale-105 transition-transform shrink-0">
            VS
          </div>
          <div className="min-w-0">
            <h1 className="font-serif text-sm sm:text-base font-bold text-[#064e3b] tracking-wide truncate">
              Veda Swasth Library
            </h1>
            <p className="text-[10px] text-[#5c6e65] hidden sm:block">Private Wellness Sanctuary</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {currentUser && (
            <>
              {currentView === 'reader' && (
                <button
                  onClick={() => onViewChange('library')}
                  className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-[#e8e2d0] text-[#064e3b] text-xs font-medium hover:bg-[#ded6c0] transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Library</span>
                </button>
              )}

              {currentView !== 'admin' && isAdmin && (
                <button
                  onClick={() => onViewChange('admin')}
                  className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-[#064e3b] text-[#f4ecd8] text-xs font-medium hover:bg-[#043d2e] transition-colors shadow-xs"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Admin</span>
                </button>
              )}

              {currentView === 'admin' && (
                <button
                  onClick={() => onViewChange('library')}
                  className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-[#064e3b] text-[#f4ecd8] text-xs font-medium hover:bg-[#043d2e] transition-colors shadow-xs"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Library</span>
                </button>
              )}

              <button
                onClick={handleWhatsApp}
                title="Need Help? Chat on WhatsApp"
                className="flex items-center space-x-1 px-2 py-1.5 rounded-lg bg-[#25d366]/15 text-[#075e54] text-xs font-medium hover:bg-[#25d366]/25 transition-colors border border-[#25d366]/30"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#25d366]" />
                <span className="hidden sm:inline">Help</span>
              </button>

              <button
                onClick={onLogout}
                title="Sign Out"
                className="p-1.5 rounded-lg text-[#6b7280] hover:text-[#991b1b] hover:bg-[#fee2e2]/50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
