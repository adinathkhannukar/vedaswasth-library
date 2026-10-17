import React, { useEffect, useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';

export const InstallPWA: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [showIOSModal, setShowIOSModal] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);

  useEffect(() => {
    // Check if iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (isStandalone) {
      return;
    }

    // iOS Safari prompt logic
    if (isIosDevice) {
      const dismissed = localStorage.getItem('veda_pwa_dismissed');
      if (!dismissed) {
        setShowBanner(true);
      }
      return;
    }

    // Android/Chrome beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('veda_pwa_dismissed', 'true');
  };

  if (!showBanner) return null;

  return (
    <>
      <div className="bg-[#064e3b] text-[#f4ecd8] px-4 py-2.5 flex items-center justify-between text-xs sm:text-sm shadow-md transition-all">
        <div className="flex items-center space-x-2.5">
          <Smartphone className="w-5 h-5 text-[#fbbf24] animate-pulse shrink-0" />
          <span>
            <strong>Install Veda Swasth Library</strong> for an immersive offline-ready reading experience.
          </span>
        </div>
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleInstallClick}
            className="bg-[#fbbf24] text-[#064e3b] px-3 py-1 rounded-md font-medium hover:bg-[#f59e0b] transition-colors flex items-center space-x-1 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install App</span>
          </button>
          <button
            onClick={handleDismiss}
            className="text-[#d1fae5] hover:text-white p-1"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showIOSModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#fbf9f5] border border-[#d4cbb3] rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 bg-[#064e3b] text-[#fbbf24] rounded-full flex items-center justify-center mx-auto text-xl font-serif">
              VS
            </div>
            <h3 className="font-serif text-xl font-bold text-[#064e3b]">
              Install on iPhone / iPad
            </h3>
            <p className="text-sm text-[#4a5568] leading-relaxed">
              To install Veda Swasth Library on your iOS device:
            </p>
            <ol className="text-left text-xs sm:text-sm text-[#2d3748] space-y-2 bg-[#f0ebd9] p-3 rounded-xl">
              <li>1. Tap the <strong>Share</strong> button <span className="inline-block px-1 bg-white rounded border">⎋</span> in Safari.</li>
              <li>2. Scroll down and tap <strong>Add to Home Screen</strong> <span className="inline-block px-1 bg-white rounded border">➕</span>.</li>
              <li>3. Tap <strong>Add</strong> in the top right corner.</li>
            </ol>
            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 bg-[#064e3b] text-[#f4ecd8] rounded-xl font-medium hover:bg-[#043d2e] transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
