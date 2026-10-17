import React from 'react';
import { Customer, AppView } from '../types';
import { WHATSAPP_NUMBER, ADMIN_EMAIL } from '../lib/storage';
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
  const isAdmin = currentUser?.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Namaste! I need assistance with Veda Swasth Library (User: ${currentUser?.email || 'Guest'})`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
  };

  return (
    <header className="sticky top-0 z-40 bg-[#fbf9f5]/90 backdrop-blur-md border-b border-[#e5dec9] px-4 py-3 shadow-xs">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div 
          className="flex items-center space-x-3 cursor-pointer group"
          onClick={() => onViewChange('library')}
        >
          <div className="w-10 h-10 rounded-full bg-[#064e3b] text-[#f4ecd8] flex items-center justify-center font-serif text-lg font-bold shadow-sm group-hover:scale-105 transition-transform">
            VS
          </div>
          <div>
            <h1 className="font-serif text-lg font-bold text-[#064e3b] tracking-wide">
              Veda Swasth Library
            </h1>
            <p className="text-xs text-[#5c6e65] hidden sm:block">Private Wellness Sanctuary</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          {currentUser && (
            <>
              {currentView === 'reader' && (
                <button
                  onClick={() => onViewChange('library')}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-[#e8e2d0] text-[#064e3b] text-xs sm:text-sm font-medium hover:bg-[#ded6c0] transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Back to Library</span>
                </button>
              )}

              {currentView !== 'admin' && isAdmin && (
                <button
                  onClick={() => onViewChange('admin')}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-[#064e3b] text-[#f4ecd8] text-xs sm:text-sm font-medium hover:bg-[#043d2e] transition-colors shadow-xs"
                >
                  <Settings className="w-4 h-4" />
                  <span>Admin Panel</span>
                </button>
              )}

              {currentView === 'admin' && (
                <button
                  onClick={() => onViewChange('library')}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-[#064e3b] text-[#f4ecd8] text-xs sm:text-sm font-medium hover:bg-[#043d2e] transition-colors shadow-xs"
                >
                  <Home className="w-4 h-4" />
                  <span>Library</span>
                </button>
              )}

              <button
                onClick={handleWhatsApp}
                title="Need Help? Chat on WhatsApp"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#25d366]/15 text-[#075e54] text-xs sm:text-sm font-medium hover:bg-[#25d366]/25 transition-colors border border-[#25d366]/30"
              >
                <MessageCircle className="w-4 h-4 text-[#25d366]" />
                <span className="hidden md:inline">Need Help?</span>
              </button>

              <button
                onClick={onLogout}
                title="Sign Out"
                className="p-2 rounded-lg text-[#6b7280] hover:text-[#991b1b] hover:bg-[#fee2e2]/50 transition-colors"
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
