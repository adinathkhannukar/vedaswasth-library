import React, { useState, useEffect } from 'react';
import { Customer, EBook } from '../types';
import { getStoredEBooks, fetchAndSyncEBooks, getStoredGrants, getStoredProgress } from '../lib/storage';
import { EBookCover } from './EBookCover';
import { BookOpen, Lock, ExternalLink, Play, Sparkles, CheckCircle2, Search, X } from 'lucide-react';
import { PromoBannerCarousel } from './PromoBannerCarousel';

interface CustomerLibraryProps {
  currentUser: Customer;
  onOpenReader: (ebook: EBook) => void;
  onOpenPreview: (ebook: EBook) => void;
}

export const CustomerLibrary: React.FC<CustomerLibraryProps> = ({
  currentUser,
  onOpenReader,
  onOpenPreview
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'mine' | 'store'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [ebooksList, setEbooksList] = useState<EBook[]>(getStoredEBooks());

  useEffect(() => {
    fetchAndSyncEBooks().then(res => {
      setEbooksList(res);
    });
  }, []);

  const ebooks = ebooksList.filter(e => e.active);
  const grants = getStoredGrants().filter(g => g.customerId === currentUser.id);
  const ownedEbookIds = new Set(grants.map(g => g.ebookId));
  const progressList = getStoredProgress().filter(p => p.customerId === currentUser.id);

  const filteredEbooks = ebooks.filter(e => 
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const myEbooks = filteredEbooks.filter(e => ownedEbookIds.has(e.id));
  const moreEbooks = filteredEbooks.filter(e => !ownedEbookIds.has(e.id));

  const displayName = currentUser.name || currentUser.email.split('@')[0];

  const getProgressForEbook = (ebookId: string) => {
    const prog = progressList.find(p => p.ebookId === ebookId);
    if (!prog) return { percent: 0, lastPage: 1 };
    const total = prog.totalPages || 10;
    const percent = Math.min(100, Math.round((prog.lastPage / total) * 100));
    return { percent, lastPage: prog.lastPage };
  };

  const handleBuyNow = (cosmofeedUrl: string) => {
    if (!cosmofeedUrl) return;
    window.open(cosmofeedUrl, '_blank');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      {/* Greeting Banner */}
      <div className="bg-gradient-to-r from-[#064e3b] to-[#047857] text-[#f4ecd8] rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none"></div>
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="flex items-center space-x-2 text-[#fbbf24] text-xs font-semibold tracking-widest uppercase">
            <Sparkles className="w-4 h-4" />
            <span>Sacred Knowledge Sanctuary</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
            Namaste, {displayName}
          </h2>
          <p className="text-sm sm:text-base text-[#d1fae5] leading-relaxed">
            Welcome to your private Veda Swasth digital library. Read your acquired masterclasses securely and explore transformative wellness guides.
          </p>
        </div>
      </div>

      {/* Promotional Banner Carousel */}
      <PromoBannerCarousel />

      {/* Search Bar & Tabs Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Tabs / Filter */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all shrink-0 ${
              activeTab === 'all'
                ? 'bg-[#064e3b] text-[#f4ecd8] shadow-xs'
                : 'text-[#526052] hover:bg-[#ede7d3]'
            }`}
          >
            All Masterclasses ({filteredEbooks.length})
          </button>
          <button
            onClick={() => setActiveTab('mine')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all shrink-0 ${
              activeTab === 'mine'
                ? 'bg-[#064e3b] text-[#f4ecd8] shadow-xs'
                : 'text-[#526052] hover:bg-[#ede7d3]'
            }`}
          >
            My eBooks ({myEbooks.length})
          </button>
          <button
            onClick={() => setActiveTab('store')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all shrink-0 ${
              activeTab === 'store'
                ? 'bg-[#064e3b] text-[#f4ecd8] shadow-xs'
                : 'text-[#526052] hover:bg-[#ede7d3]'
            }`}
          >
            Explore More ({moreEbooks.length})
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#738479]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search masterclasses..."
            className="w-full pl-10 pr-9 py-2.5 bg-[#f6f2e6] border border-[#dcd2bc] rounded-xl text-xs sm:text-sm text-[#1c2d25] placeholder-[#738479] focus:outline-none focus:ring-2 focus:ring-[#047857] shadow-xs transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#738479] hover:text-[#064e3b]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Section: My eBooks */}
      {(activeTab === 'all' || activeTab === 'mine') && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-2xl font-bold text-[#064e3b] flex items-center space-x-2">
              <BookOpen className="w-6 h-6 text-[#047857]" />
              <span>My Acquired eBooks</span>
            </h3>
            <span className="text-xs bg-[#e8e2d0] text-[#064e3b] px-3 py-1 rounded-full font-medium">
              {myEbooks.length} Unlocked
            </span>
          </div>

          {myEbooks.length === 0 ? (
            <div className="bg-[#f5f0e1] border border-[#e2d8be] rounded-2xl p-8 text-center space-y-3">
              <p className="text-sm text-[#627065]">
                {searchTerm ? 'No acquired eBooks match your search.' : 'You do not have any eBooks unlocked yet.'}
              </p>
              <p className="text-xs text-[#7b8a7f]">Explore the collection below and unlock guides via Cosmofeed.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {myEbooks.map((ebook) => {
                const prog = getProgressForEbook(ebook.id);
                return (
                  <div
                    key={ebook.id}
                    className="bg-[#f6f2e6] border border-[#dcd2bc] rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="aspect-[3/4] relative overflow-hidden bg-[#e5dec9]">
                        <EBookCover
                          coverUrl={ebook.coverImage}
                          alt={ebook.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 right-3 bg-[#064e3b] text-[#fbbf24] px-2.5 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 shadow-sm">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Unlocked</span>
                        </div>
                      </div>

                      <div className="p-5 space-y-4">
                        <div className="space-y-1.5">
                          <h4 className="font-serif text-lg font-bold text-[#064e3b] line-clamp-1">
                            {ebook.title}
                          </h4>
                          <p className="text-xs text-[#526052] line-clamp-2">
                            {ebook.subtitle}
                          </p>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-[#e2d8be]">
                          <div className="flex justify-between text-xs text-[#627065]">
                            <span>Reading Progress</span>
                            <span className="font-semibold text-[#064e3b]">{prog.percent}%</span>
                          </div>
                          <div className="w-full h-2 bg-[#e5dec9] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#047857] rounded-full transition-all duration-300"
                              style={{ width: `${prog.percent}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 pt-0">
                      <button
                        onClick={() => onOpenReader(ebook)}
                        className="w-full py-3 bg-[#064e3b] text-[#f4ecd8] rounded-xl font-semibold hover:bg-[#043d2e] transition-colors flex items-center justify-center space-x-2 shadow-xs text-sm"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>{prog.percent > 0 ? 'Continue Reading' : 'Start Reading'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Section: More eBooks (Store / Cosmofeed) */}
      {(activeTab === 'all' || activeTab === 'store') && (
        <div className="space-y-6 pt-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-2xl font-bold text-[#064e3b] flex items-center space-x-2">
              <Lock className="w-6 h-6 text-[#d97706]" />
              <span>Explore More eBooks</span>
            </h3>
            <span className="text-xs bg-[#e8e2d0] text-[#064e3b] px-3 py-1 rounded-full font-medium">
              {moreEbooks.length} Available
            </span>
          </div>

          {moreEbooks.length === 0 ? (
            <div className="bg-[#f5f0e1] border border-[#e2d8be] rounded-2xl p-8 text-center space-y-2">
              <p className="text-sm text-[#627065]">
                {searchTerm ? 'No available eBooks match your search.' : 'You own all available eBooks in the library!'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {moreEbooks.map((ebook) => (
                <div
                  key={ebook.id}
                  className="bg-[#f6f2e6] border border-[#dcd2bc] rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative opacity-95 hover:opacity-100"
                >
                  <div>
                    <div className="aspect-[3/4] relative overflow-hidden bg-[#e5dec9]">
                      <EBookCover
                        coverUrl={ebook.coverImage}
                        alt={ebook.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-95"
                      />
                      <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-[#fbbf24] px-2.5 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 shadow-sm">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Locked</span>
                      </div>
                    </div>

                    <div className="p-5 space-y-4">
                      <div className="space-y-1.5">
                        <h4 className="font-serif text-lg font-bold text-[#064e3b] line-clamp-1">
                          {ebook.title}
                        </h4>
                        <p className="text-xs text-[#526052] line-clamp-2">
                          {ebook.subtitle}
                        </p>
                      </div>

                      <p className="text-xs text-[#627065] line-clamp-2 leading-relaxed">
                        {ebook.description}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 pt-0 flex items-center space-x-2">
                    {ebook.enableSample && (
                      <button
                        onClick={() => onOpenPreview(ebook)}
                        className="flex-1 py-3 bg-[#e5dec9] text-[#064e3b] rounded-xl font-semibold hover:bg-[#d8ceb4] transition-colors flex items-center justify-center space-x-1.5 text-xs shadow-xs"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Free Sample</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleBuyNow(ebook.cosmofeedUrl)}
                      className="flex-1 py-3 bg-[#d97706] text-white rounded-xl font-semibold hover:bg-[#b45309] transition-colors flex items-center justify-center space-x-1.5 text-xs shadow-md"
                    >
                      <span>Buy Now</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
