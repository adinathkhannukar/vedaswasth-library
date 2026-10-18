import React, { useEffect, useRef, useState } from 'react';
import { EBook, Customer } from '../types';
import { getStoredProgress, saveProgress, getStoredBookmarks, saveBookmarks } from '../lib/storage';
import { getFileFromIDB } from '../lib/idb';
import { getSupabaseClient } from '../lib/supabaseConfig';
import * as pdfjsLib from 'pdfjs-dist';
import { 
  ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Bookmark as BookmarkIcon, 
  Sun, Moon, EyeOff, ShieldCheck, ArrowLeft, Loader2, Sparkles, ExternalLink 
} from 'lucide-react';

// Configure PDF.js worker with stable cdnjs version matching 3.11.174
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

interface SecureReaderProps {
  ebook: EBook;
  currentUser?: Customer | null;
  onBack: () => void;
  isPreview?: boolean;
}

export const SecureReader: React.FC<SecureReaderProps> = ({
  ebook,
  currentUser,
  onBack,
  isPreview = false
}) => {
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const sampleStart = isPreview ? (ebook.sampleStartPage ?? 1) : 1;
  const sampleEnd = isPreview ? (ebook.sampleEndPage ?? 3) : 1;

  const [pageNum, setPageNum] = useState<number>(sampleStart);
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

  const sampleLimit = isPreview ? Math.min(sampleEnd, numPages || sampleEnd) : numPages;

  // Set initial page when preview loads
  useEffect(() => {
    if (isPreview) {
      setPageNum(ebook.sampleStartPage ?? 1);
    }
  }, [isPreview, ebook.sampleStartPage]);

  // Load saved reading progress & bookmarks
  useEffect(() => {
    if (!currentUser || isPreview) return;
    const allProgress = getStoredProgress();
    const prog = allProgress.find(p => p.customerId === currentUser.id && p.ebookId === ebook.id);
    if (prog && prog.lastPage > 1) {
      setPageNum(prog.lastPage);
    }

    const allBookmarks = getStoredBookmarks();
    const userBookmarks = allBookmarks
      .filter(b => b.customerId === currentUser.id && b.ebookId === ebook.id)
      .map(b => b.pageNumber);
    setBookmarks(userBookmarks);
  }, [currentUser, ebook.id, isPreview]);

  // Anti-blur & anti-tamper security listener
  useEffect(() => {
    const handleBlur = () => setIsFocused(false);
    const handleFocus = () => setIsFocused(true);

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    const interval = setInterval(() => {
      setWatermarkPos({
        x: Math.floor(Math.random() * 60) + 15,
        y: Math.floor(Math.random() * 70) + 15
      });
    }, 8000);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, []);

  // Load PDF Document from Supabase Storage or direct URL
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const loadPdf = async () => {
      try {
        let pdfUrl = ebook.pdfUrl;
        const path = (ebook.pdfPath || '').trim();

        if (path.startsWith('http://') || path.startsWith('https://')) {
          pdfUrl = path;
        } else if (path) {
          const supabase = getSupabaseClient();
          if (supabase) {
            const { data } = supabase.storage
              .from('secure-ebooks')
              .getPublicUrl(path);
            if (data?.publicUrl) {
              pdfUrl = encodeURI(data.publicUrl);
            }
          }
        }

        if (pdfUrl && pdfUrl.startsWith('idb://')) {
          const idbKey = pdfUrl.replace('idb://', '');
          const cached = await getFileFromIDB(idbKey);
          if (cached) {
            pdfUrl = cached;
          }
        }

        let pdfSource: any;
        if (pdfUrl && pdfUrl.startsWith('data:')) {
          const base64Data = pdfUrl.split(',')[1];
          const binaryString = atob(base64Data);
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          pdfSource = { data: bytes };
        } else {
          pdfSource = { url: pdfUrl, withCredentials: false };
        }

        const loadingTask = pdfjsLib.getDocument(pdfSource);
        const doc = await loadingTask.promise;
        if (!isMounted) return;
        setPdfDoc(doc);
        setNumPages(doc.numPages);
        setLoading(false);
      } catch (err) {
        console.error('Error loading PDF from Supabase Storage:', err);
        if (!isMounted) return;
        setError('Unable to load eBook file from Supabase. Please verify the file name.');
        setLoading(false);
      }
    };

    loadPdf();

    return () => {
      isMounted = false;
    };
  }, [ebook.pdfUrl, ebook.pdfPath]);

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
        if (!isPreview && currentUser) {
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
        }
      });
    });

    return () => {
      isRenderActive = false;
    };
  }, [pdfDoc, pageNum, scale, currentUser, ebook.id, numPages, isPreview]);

  const handlePrevPage = () => {
    const minLimit = isPreview ? (ebook.sampleStartPage ?? 1) : 1;
    if (pageNum > minLimit) setPageNum(pageNum - 1);
  };

  const handleNextPage = () => {
    const maxLimit = isPreview ? (ebook.sampleEndPage ?? 3) : numPages;
    if (pageNum < maxLimit) {
      setPageNum(pageNum + 1);
    } else if (isPreview) {
      window.open(ebook.cosmofeedUrl, '_blank');
    }
  };

  const toggleBookmark = () => {
    if (isPreview || !currentUser) return;
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

  const themeClasses = {
    light: 'bg-[#fbf9f5] text-[#1c2d25]',
    sepia: 'bg-[#f4ecd8] text-[#3d2c1e]',
    dark: 'bg-[#121815] text-[#e2e8f0]'
  };

  const canvasBgClass = theme === 'dark' ? 'bg-[#1a231f]' : theme === 'sepia' ? 'bg-[#fbf6eb]' : 'bg-white';

  const startPg = ebook.sampleStartPage ?? 1;
  const endPg = ebook.sampleEndPage ?? 3;

  return (
    <div 
      ref={containerRef}
      onContextMenu={(e) => e.preventDefault()}
      className={`min-h-[90vh] flex flex-col ${themeClasses[theme]} relative select-none`}
    >
      {/* Top Preview Banner */}
      {isPreview && (
        <div className="bg-[#064e3b] text-[#f4ecd8] px-4 py-2.5 text-center text-xs sm:text-sm font-medium flex flex-wrap items-center justify-center space-x-3 shadow-md z-30 shrink-0">
          <span>Preview Mode: Showing pages {startPg} to {endPg}. Unlock full access to continue reading.</span>
          <a
            href={ebook.cosmofeedUrl}
            target="_blank"
            rel="noreferrer"
            className="bg-[#fbbf24] text-[#064e3b] px-3 py-1 rounded-lg font-bold text-xs hover:bg-[#f59e0b] transition-colors shadow-xs inline-flex items-center space-x-1 mt-1 sm:mt-0"
          >
            <span>Unlock Full Masterclass</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* Reader Header / Controls Toolbar */}
      <div className="bg-[#f5f0e1]/90 dark:bg-[#18221d]/90 backdrop-blur-md border-b border-[#e5dec9] dark:border-[#2a3830] px-4 py-3 flex flex-wrap items-center justify-between gap-3 z-20 shadow-xs">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#e5dec9] dark:bg-[#2a3830] text-[#064e3b] dark:text-[#a7f3d0] text-xs font-semibold hover:bg-[#d8ceb4] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isPreview ? 'Back to Library' : 'Back to Sanctuary'}</span>
          </button>
          <div>
            <h3 className="font-serif font-bold text-sm text-[#064e3b] dark:text-[#a7f3d0] line-clamp-1">
              {ebook.title} {isPreview && <span className="text-xs bg-[#d97706] text-white px-2 py-0.5 rounded ml-2">Free Sample (p. {startPg}-{endPg})</span>}
            </h3>
            <p className="text-[11px] text-[#526052] dark:text-[#9ca3af]">
              Page {pageNum} of {sampleLimit} {isPreview ? '(Preview)' : ''}
            </p>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="flex items-center space-x-1 bg-[#ede7d3] dark:bg-[#222d27] p-1 rounded-xl">
            <button
              onClick={() => setTheme('light')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${theme === 'light' ? 'bg-white text-[#064e3b] shadow-xs' : 'text-[#526052]'}`}
            >
              Light
            </button>
            <button
              onClick={() => setTheme('sepia')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${theme === 'sepia' ? 'bg-[#f4ecd8] text-[#3d2c1e] shadow-xs' : 'text-[#526052]'}`}
            >
              Sepia
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${theme === 'dark' ? 'bg-[#064e3b] text-white shadow-xs' : 'text-[#526052]'}`}
            >
              Dark
            </button>
          </div>

          <div className="flex items-center space-x-1 bg-[#ede7d3] dark:bg-[#222d27] p-1 rounded-xl">
            <button
              onClick={() => setScale(Math.max(0.8, scale - 0.2))}
              className="p-1.5 rounded-lg text-[#064e3b] dark:text-[#a7f3d0] hover:bg-white/50 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-medium px-1 text-[#526052] dark:text-gray-300">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => setScale(Math.min(2.0, scale + 0.2))}
              className="p-1.5 rounded-lg text-[#064e3b] dark:text-[#a7f3d0] hover:bg-white/50 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {!isPreview && (
            <button
              onClick={toggleBookmark}
              className={`p-2 rounded-xl border transition-colors ${bookmarks.includes(pageNum) ? 'bg-[#fbbf24] border-[#d97706] text-[#78350f]' : 'bg-[#ede7d3] dark:bg-[#222d27] border-[#d4cbb3] text-[#526052]'}`}
              title="Bookmark Page"
            >
              <BookmarkIcon className="w-4 h-4 fill-current" />
            </button>
          )}
        </div>
      </div>

      {/* Main Canvas Viewport Area */}
      <div 
        className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 overflow-auto relative"
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Dynamic Watermark overlay for copy/screenshot deterrence */}
        {currentUser && !isPreview && (
          <div 
            style={{ left: `${watermarkPos.x}%`, top: `${watermarkPos.y}%` }}
            className="absolute pointer-events-none select-none opacity-10 text-xs font-mono font-bold tracking-widest text-emerald-900 z-10 rotate-[-15deg] transition-all duration-1000"
          >
            {currentUser.email} • Veda Swasth Secure License
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center space-y-3 py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#047857]" />
            <p className="text-xs font-medium text-[#526052]">Loading eBook from Supabase Storage...</p>
          </div>
        ) : error ? (
          <div className="bg-[#fee2e2] border border-[#fca5a5] text-[#991b1b] p-6 rounded-2xl max-w-md text-center space-y-2">
            <ShieldCheck className="w-8 h-8 mx-auto text-[#991b1b]" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        ) : (
          <div className={`relative shadow-2xl rounded-2xl overflow-hidden border border-[#d4cbb3] dark:border-gray-800 ${canvasBgClass}`}>
            <canvas ref={canvasRef} className="max-w-full h-auto block" />
            {!isFocused && (
              <div className="absolute inset-0 bg-black/70 backdrop-blur-md flex flex-col items-center justify-center text-white p-6 space-y-2 text-center">
                <EyeOff className="w-10 h-10 text-[#fbbf24]" />
                <p className="font-serif text-lg font-bold">Secure Reader Protected</p>
                <p className="text-xs text-gray-300">Click back into window to resume reading.</p>
              </div>
            )}
          </div>
        )}

        {/* Preview End CTA Banner */}
        {isPreview && pageNum === endPg && (
          <div className="mt-8 bg-[#f6f2e6] border border-[#dcd2bc] rounded-3xl p-6 sm:p-8 max-w-lg w-full text-center space-y-4 shadow-lg">
            <Sparkles className="w-8 h-8 text-[#d97706] mx-auto" />
            <h4 className="font-serif text-xl font-bold text-[#064e3b]">End of Free Preview (Page {endPg})</h4>
            <p className="text-xs text-[#526052] leading-relaxed">
              You have read the preview sample pages of <span className="font-semibold">{ebook.title}</span>. Unlock full lifetime access instantly on Cosmofeed.
            </p>
            <a
              href={ebook.cosmofeedUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center space-x-2 w-full py-3.5 bg-[#d97706] text-white rounded-xl font-semibold hover:bg-[#b45309] transition-colors shadow-md text-sm"
            >
              <span>Unlock Full Masterclass on Cosmofeed</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>

      {/* Bottom Navigation Footer */}
      <div className="bg-[#f5f0e1]/90 dark:bg-[#18221d]/90 backdrop-blur-md border-t border-[#e5dec9] dark:border-[#2a3830] px-4 py-3 flex items-center justify-between z-20 shadow-xs">
        <button
          onClick={handlePrevPage}
          disabled={pageNum <= startPg}
          className="flex items-center space-x-1 px-4 py-2 rounded-xl bg-[#e5dec9] dark:bg-[#2a3830] text-[#064e3b] dark:text-[#a7f3d0] font-medium text-xs hover:bg-[#d8ceb4] transition-colors disabled:opacity-40"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <div className="text-xs font-medium text-[#526052] dark:text-gray-300">
          Page {pageNum} of {sampleLimit}
        </div>

        <button
          onClick={handleNextPage}
          disabled={!isPreview && pageNum >= numPages}
          className="flex items-center space-x-1 px-4 py-2 rounded-xl bg-[#064e3b] text-[#f4ecd8] font-medium text-xs hover:bg-[#043d2e] transition-colors shadow-xs disabled:opacity-40"
        >
          <span>{isPreview && pageNum === endPg ? 'Unlock Full' : 'Next'}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
