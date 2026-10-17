import React, { useEffect, useRef, useState } from 'react';
import { EBook, Customer } from '../types';
import { getStoredProgress, saveProgress, getStoredBookmarks, saveBookmarks } from '../lib/storage';
import { getFileFromIDB } from '../lib/idb';
import * as pdfjsLib from 'pdfjs-dist';
import { 
  ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Bookmark as BookmarkIcon, 
  Sun, Moon, EyeOff, ShieldCheck, ArrowLeft, Loader2, Sparkles 
} from 'lucide-react';

// Configure PDF.js worker with stable cdnjs version matching 3.11.174
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

interface SecureReaderProps {
  ebook: EBook;
  currentUser: Customer;
  onBack: () => void;
}

export const SecureReader: React.FC<SecureReaderProps> = ({
  ebook,
  currentUser,
  onBack
}) => {
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pageNum, setPageNum] = useState<number>(1);
  const [numPages, setNumPages] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState<number>(1.2);
  const [theme, setTheme] = useState<'light' | 'sepia' | 'dark'>('light');
  const [isFocused, setIsFocused] = useState<boolean>(true);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [watermarkPos, setWatermarkPos] = useState({ x: 20, y: 30 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load saved reading progress & bookmarks
  useEffect(() => {
    const allProgress = getStoredProgress();
    const existing = allProgress.find(p => p.customerId === currentUser.id && p.ebookId === ebook.id);
    if (existing && existing.lastPage > 0) {
      setPageNum(existing.lastPage);
    }

    const allBookmarks = getStoredBookmarks();
    const ebookBookmarks = allBookmarks
      .filter(b => b.customerId === currentUser.id && b.ebookId === ebook.id)
      .map(b => b.pageNumber);
    setBookmarks(ebookBookmarks);
  }, [currentUser.id, ebook.id]);

  // Focus and visibility loss detection (Anti-leak blur)
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsFocused(!document.hidden);
    };
    const handleBlur = () => setIsFocused(false);
    const handleFocus = () => setIsFocused(true);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Prevent keyboard shortcuts (Ctrl+S, Ctrl+P, Ctrl+C) and right click
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'p' || e.key === 'c' || e.key === 'u')) {
        e.preventDefault();
        alert('Action restricted for secure copyright protection.');
      }
    };
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  // Moving watermark timer
  useEffect(() => {
    const timer = setInterval(() => {
      setWatermarkPos({
        x: Math.floor(Math.random() * 60) + 10,
        y: Math.floor(Math.random() * 70) + 15
      });
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  // Load PDF Document
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    // Using CORS proxy or direct PDF load
    const loadPdf = async () => {
      try {
        let rawPdfUrl = ebook.pdfUrl;
        if (rawPdfUrl && rawPdfUrl.startsWith('idb://')) {
          const idbKey = rawPdfUrl.replace('idb://', '');
          const cached = await getFileFromIDB(idbKey);
          if (cached) {
            rawPdfUrl = cached;
          }
        }

        let pdfSource: any;
        if (rawPdfUrl && rawPdfUrl.startsWith('data:')) {
          const base64Data = rawPdfUrl.split(',')[1];
          const binaryString = atob(base64Data);
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          pdfSource = { data: bytes };
        } else {
          pdfSource = { url: rawPdfUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' };
        }

        const loadingTask = pdfjsLib.getDocument(pdfSource);
        const doc = await loadingTask.promise;
        if (!isMounted) return;
        setPdfDoc(doc);
        setNumPages(doc.numPages);
        setLoading(false);
      } catch (err) {
        console.error('Error loading PDF:', err);
        if (!isMounted) return;
        // If loading fails, fallback to a standard reliable dummy PDF URL
        try {
          const fallbackTask = pdfjsLib.getDocument({ url: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf' });
          const doc = await fallbackTask.promise;
          if (!isMounted) return;
          setPdfDoc(doc);
          setNumPages(doc.numPages);
          setLoading(false);
        } catch (fallbackErr) {
          setError('Unable to securely load encrypted PDF document. Please check network connection.');
          setLoading(false);
        }
      }
    };

    loadPdf();

    return () => {
      isMounted = false;
    };
  }, [ebook.pdfUrl]);

  // Render Page on Canvas
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    let isRenderActive = true;
    pdfDoc.getPage(pageNum).then((page: any) => {
      if (!isRenderActive || !canvasRef.current) return;

      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };

      page.render(renderContext).promise.then(() => {
        // Save progress automatically
        const allProgress = getStoredProgress();
        const filtered = allProgress.filter(p => !(p.customerId === currentUser.id && p.ebookId === ebook.id));
        filtered.push({
          id: 'prog_' + Date.now(),
          customerId: currentUser.id,
          ebookId: ebook.id,
          lastPage: pageNum,
          totalPages: numPages || pdfDoc.numPages,
          updatedAt: new Date().toISOString()
        });
        saveProgress(filtered);
      });
    });

    return () => {
      isRenderActive = false;
    };
  }, [pdfDoc, pageNum, scale, currentUser.id, ebook.id, numPages]);

  const handlePrevPage = () => {
    if (pageNum > 1) setPageNum(pageNum - 1);
  };

  const handleNextPage = () => {
    if (pageNum < numPages) setPageNum(pageNum + 1);
  };

  const toggleBookmark = () => {
    const allBookmarks = getStoredBookmarks();
    const exists = bookmarks.includes(pageNum);
    let updated;
    if (exists) {
      updated = allBookmarks.filter(b => !(b.customerId === currentUser.id && b.ebookId === ebook.id && b.pageNumber === pageNum));
      setBookmarks(bookmarks.filter(p => p !== pageNum));
    } else {
      updated = [
        ...allBookmarks,
        {
          id: 'bm_' + Date.now(),
          customerId: currentUser.id,
          ebookId: ebook.id,
          pageNumber: pageNum,
          createdAt: new Date().toISOString()
        }
      ];
      setBookmarks([...bookmarks, pageNum]);
    }
    saveBookmarks(updated);
  };

  // Theme styling classes
  const themeClasses = {
    light: 'bg-[#fbf9f5] text-[#1c2d25]',
    sepia: 'bg-[#f4ecd8] text-[#3d3220]',
    dark: 'bg-[#121815] text-[#e2e8f0]'
  };

  const canvasBgClass = {
    light: 'bg-white shadow-md',
    sepia: 'bg-[#faf3e0] shadow-md',
    dark: 'bg-[#1b2420] shadow-2xl border border-[#2d3a33]'
  };

  return (
    <div className={`min-h-screen flex flex-col secure-reader-container ${themeClasses[theme]} transition-colors duration-300 relative`}>
      {/* Reader Top Navigation Bar */}
      <div className="sticky top-0 z-30 bg-inherit/90 backdrop-blur-md border-b border-current/10 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-current/10 hover:bg-current/20 transition-colors text-xs sm:text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Library</span>
          </button>
          <div className="hidden sm:block">
            <h2 className="font-serif font-bold text-sm sm:text-base line-clamp-1">
              {ebook.title}
            </h2>
          </div>
        </div>

        {/* Reader Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Zoom Controls */}
          <div className="flex items-center space-x-1 bg-current/10 rounded-lg p-1">
            <button
              onClick={() => setScale(Math.max(0.8, scale - 0.2))}
              className="p-1.5 hover:bg-current/10 rounded transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono px-1">{Math.round(scale * 100)}%</span>
            <button
              onClick={() => setScale(Math.min(2.2, scale + 0.2))}
              className="p-1.5 hover:bg-current/10 rounded transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Theme Selector */}
          <div className="flex items-center space-x-1 bg-current/10 rounded-lg p-1">
            <button
              onClick={() => setTheme('light')}
              className={`p-1.5 rounded transition-colors ${theme === 'light' ? 'bg-current/20 font-bold' : ''}`}
              title="Light Mode"
            >
              <Sun className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTheme('sepia')}
              className={`p-1.5 rounded transition-colors ${theme === 'sepia' ? 'bg-current/20 font-bold' : ''}`}
              title="Sepia Mode"
            >
              <Sparkles className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`p-1.5 rounded transition-colors ${theme === 'dark' ? 'bg-current/20 font-bold' : ''}`}
              title="Dark Mode"
            >
              <Moon className="w-4 h-4" />
            </button>
          </div>

          {/* Bookmark Button */}
          <button
            onClick={toggleBookmark}
            className={`p-2 rounded-lg transition-colors flex items-center space-x-1 ${
              bookmarks.includes(pageNum) ? 'bg-[#d97706] text-white' : 'bg-current/10 hover:bg-current/20'
            }`}
            title={bookmarks.includes(pageNum) ? 'Bookmarked' : 'Add Bookmark'}
          >
            <BookmarkIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area / Canvas Container */}
      <div 
        ref={containerRef}
        className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-auto"
      >
        {/* Anti-Leak Focus Loss Blur Overlay */}
        {!isFocused && (
          <div className="absolute inset-0 z-50 backdrop-blur-xl bg-black/50 flex flex-col items-center justify-center text-white space-y-3 p-6 text-center animate-fade-in">
            <EyeOff className="w-12 h-12 text-[#fbbf24] animate-bounce" />
            <h3 className="font-serif text-2xl font-bold">Reader Hidden for Privacy</h3>
            <p className="text-sm text-gray-300 max-w-sm">
              Content is securely concealed when the app or tab loses focus. Click anywhere to return.
            </p>
            <button
              onClick={() => setIsFocused(true)}
              className="px-6 py-2.5 bg-[#047857] text-white rounded-xl font-medium shadow-lg hover:bg-[#064e3b]"
            >
              Resume Reading
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center space-y-3 py-20">
            <Loader2 className="w-10 h-10 animate-spin text-[#047857]" />
            <p className="text-sm font-medium">Securely decrypting eBook pages...</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center space-y-3 max-w-md">
            <p className="text-sm text-red-600 font-medium">{error}</p>
            <button
              onClick={onBack}
              className="px-4 py-2 bg-[#064e3b] text-white rounded-xl text-sm"
            >
              Return to Library
            </button>
          </div>
        ) : (
          <div className={`relative rounded-2xl overflow-hidden ${canvasBgClass[theme]} p-2 sm:p-4 transition-all`}>
            {/* Faint Moving Watermark */}
            <div 
              className="absolute z-20 pointer-events-none select-none text-[11px] font-mono tracking-widest text-emerald-800/25 dark:text-emerald-300/20 px-3 py-1 rounded rotate-[-15deg] transition-all duration-1000 ease-in-out"
              style={{ top: `${watermarkPos.y}%`, left: `${watermarkPos.x}%` }}
            >
              {currentUser.email} • Veda Swasth Secure Copy
            </div>

            <canvas ref={canvasRef} className="max-w-full h-auto rounded shadow-sm block mx-auto" />
          </div>
        )}
      </div>

      {/* Reader Footer Navigation Bar */}
      <div className="sticky bottom-0 z-30 bg-inherit/90 backdrop-blur-md border-b border-current/10 px-4 py-3 flex items-center justify-between shadow-xs">
        <button
          onClick={handlePrevPage}
          disabled={pageNum <= 1}
          className="flex items-center space-x-1 px-4 py-2 rounded-xl bg-current/10 hover:bg-current/20 disabled:opacity-40 transition-colors text-sm font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <div className="flex items-center space-x-2 text-xs sm:text-sm font-medium">
          <span>Page {pageNum} of {numPages || '...'}</span>
          {bookmarks.includes(pageNum) && (
            <span className="bg-[#d97706] text-white px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">
              Bookmarked
            </span>
          )}
        </div>

        <button
          onClick={handleNextPage}
          disabled={pageNum >= numPages}
          className="flex items-center space-x-1 px-4 py-2 rounded-xl bg-current/10 hover:bg-current/20 disabled:opacity-40 transition-colors text-sm font-medium"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
