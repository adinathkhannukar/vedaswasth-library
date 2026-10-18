import React, { useState, useEffect } from 'react';
import { Customer, EBook, AppView } from './types';
import { getCurrentUser, setCurrentUser, getStoredCustomers } from './lib/storage';
import { Navbar } from './components/Navbar';
import { InstallPWA } from './components/InstallPWA';
import { LoginScreen } from './components/LoginScreen';
import { CustomerLibrary } from './components/CustomerLibrary';
import { SecureReader } from './components/SecureReader';
import { AdminPanel } from './components/AdminPanel';

export default function App() {
  const [currentUser, setCurrentUserState] = useState<Customer | null>(() => getCurrentUser());
  const [currentView, setCurrentView] = useState<AppView>('library');
  const [selectedEbook, setSelectedEbook] = useState<EBook | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);

  // Single device session check on mount / interval
  useEffect(() => {
    if (!currentUser) return;

    const checkSession = () => {
      const customers = getStoredCustomers();
      const latest = customers.find(c => c.id === currentUser.id);
      if (latest && latest.activeSessionId && currentUser.activeSessionId) {
        if (latest.activeSessionId !== currentUser.activeSessionId) {
          // Logged in on another device!
          alert('You have logged in on another device. This session has been signed out.');
          handleLogout();
        }
      }
    };

    const interval = setInterval(checkSession, 5000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const handleLoginSuccess = (customer: Customer) => {
    setCurrentUser(customer);
    setCurrentUserState(customer);
    setCurrentView('library');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentUserState(null);
    setCurrentView('library');
    setSelectedEbook(null);
    setIsPreviewMode(false);
  };

  const handleOpenReader = (ebook: EBook) => {
    setSelectedEbook(ebook);
    setIsPreviewMode(false);
    setCurrentView('reader');
  };

  const handleOpenPreview = (ebook: EBook) => {
    setSelectedEbook(ebook);
    setIsPreviewMode(true);
    setCurrentView('reader');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fbf9f5] text-[#1c2d25] selection:bg-[#047857] selection:text-white">
      {/* PWA Install Banner */}
      <InstallPWA />

      {/* Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        currentView={currentView}
        onViewChange={(view) => {
          if (view !== 'reader') {
            setSelectedEbook(null);
            setIsPreviewMode(false);
          }
          setCurrentView(view);
        }}
        onLogout={handleLogout}
      />

      {/* Main Content View */}
      <main className="flex-1">
        {!currentUser ? (
          <LoginScreen onLoginSuccess={handleLoginSuccess} />
        ) : currentView === 'reader' && selectedEbook ? (
          <SecureReader
            ebook={selectedEbook}
            currentUser={currentUser}
            onBack={() => {
              setIsPreviewMode(false);
              setCurrentView('library');
            }}
            isPreview={isPreviewMode}
          />
        ) : currentView === 'admin' ? (
          <AdminPanel />
        ) : (
          <CustomerLibrary
            currentUser={currentUser}
            onOpenReader={handleOpenReader}
            onOpenPreview={handleOpenPreview}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-[#e8e2d0] text-center text-xs text-[#707e74] bg-[#f5f0e1]">
        <div className="max-w-6xl mx-auto px-4 space-y-1">
          <p className="font-serif font-semibold text-[#064e3b]">Veda Swasth Library</p>
          <p>© {new Date().getFullYear()} Veda Swasth. All rights reserved. Private & Secure Wellness Sanctuary.</p>
        </div>
      </footer>
    </div>
  );
}
