import React, { useState } from 'react';
import { Customer, EBook } from '../types';
import { getStoredEBooks, getStoredGrants, getStoredProgress } from '../lib/storage';
import { EBookCover } from './EBookCover';
import { BookOpen, Lock, ExternalLink, Play, Sparkles, CheckCircle2 } from 'lucide-react';

interface CustomerLibraryProps {
  currentUser: Customer;
  onOpenReader: (ebook: EBook) => void;
}

export const CustomerLibrary: React.FC<CustomerLibraryProps> = ({
  currentUser,
  onOpenReader
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'mine' | 'store'>('all');

  const ebooks = getStoredEBooks().filter(e => e.active);
  const grants = getStoredGrants().filter(g => g.customerId === currentUser.id);
  const ownedEbookIds = new Set(grants.map(g => g.ebookId));
  const progressList = getStoredProgress().filter(p => p.customerId === currentUser.id);

  const myEbooks = ebooks.filter(e => ownedEbookIds.has(e.id));
  const moreEbooks = ebooks.filter(e => !ownedEbookIds.has(e.id));

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

      {/* Tabs / Filter */}
      <div className="flex items-center space-x-2 border-b border-[#e5dec9] pb-3">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'all'
              ? 'bg-[#064e3b] text-[#f4ecd8] shadow-xs'
              : 'text-[#526052] hover:bg-[#ede7d3]'
          }`}
        >
          All Masterclasses ({ebooks.length})
        </button>
        <button
          onClick={() => setActiveTab('mine')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'mine'
              ? 'bg-[#064e3b] text-[#f4ecd8] shadow-xs'
              : 'text-[#526052] hover:bg-[#ede7d3]'
          }`}
        >
          My eBooks ({myEbooks.length})
        </button>
        <button
          onClick={() => setActiveTab('store')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'store'
              ? 'bg-[#064e3b] text-[#f4ecd8] shadow-xs'
              : 'text-[#526052] hover:bg-[#ede7d3]'
          }`}
        >
          Explore More ({moreEbooks.length})
        </button>
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
              <p className="text-sm text-[#627065]">You do not have any eBooks unlocked yet.</p>
              <p className="text-xs text-[#7b8a7f]">Explore the collection below and unlock guides via Cosmofeed.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {myEbooks.map((ebook) => {
                const prog = getProgressForEbook(ebook.id);
                return (
                  <div
                    key={ebook.id}
                    className="bg-[#f6f2e6] border border-[#dcd2bc] rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group"
                  >
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

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
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
              <p className="text-sm text-[#627065]">You own all available eBooks in the library!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {moreEbooks.map((ebook) => (
                <div
                  key={ebook.id}
                  className="bg-[#f6f2e6] border border-[#dcd2bc] rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group relative opacity-95 hover:opacity-100"
                >
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

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <h4 className="font-serif text-lg font-bold text-[#064e3b] line-clamp-1">
                        {ebook.title}
                      </h4>
                      <p className="text-xs text-[#526052] line-clamp-2">
                        {ebook.description}
                      </p>
                    </div>

                    <button
                      onClick={() => handleBuyNow(ebook.cosmofeedUrl)}
                      className="w-full py-3 bg-[#d97706] text-white rounded-xl font-semibold hover:bg-[#b45309] transition-colors flex items-center justify-center space-x-2 shadow-xs text-sm"
                    >
                      <span>Buy Now</span>
                      <ExternalLink className="w-4 h-4" />
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
