import React, { useState } from 'react';
import { Customer, EBook, AccessGrant, PromoBanner } from '../types';
import { 
  getStoredEBooks, saveEBooks, getStoredCustomers, saveCustomers, 
  getStoredGrants, saveGrants, getStoredProgress, saveProgress, 
  getStoredBookmarks, saveBookmarks, ADMIN_EMAIL,
  getStoredPromos, savePromos, getPromoEnabled, setPromoEnabled
} from '../lib/storage';
import { getStoredSupabaseConfig, saveSupabaseConfig } from '../lib/supabaseConfig';
import { saveFileToIDB, deleteFileFromIDB } from '../lib/idb';
import { EBookCover } from './EBookCover';
import { 
  BookOpen, Users, KeyRound, BarChart3, Plus, Trash2, Edit2, 
  CheckCircle, ShieldAlert, Smartphone, Database, ExternalLink, Save, RefreshCw, Search, Megaphone 
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ebooks' | 'grants' | 'customers' | 'stats' | 'supabase' | 'promos'>('ebooks');

  const [ebooks, setEbooks] = useState<EBook[]>(getStoredEBooks());
  const [customers, setCustomers] = useState<Customer[]>(getStoredCustomers());
  const [grants, setGrants] = useState<AccessGrant[]>(getStoredGrants());

  // eBook form state
  const [editingEbook, setEditingEbook] = useState<EBook | null>(null);
  const [showEbookModal, setShowEbookModal] = useState(false);
  const [ebookForm, setEbookForm] = useState({
    title: '',
    subtitle: '',
    coverImage: '',
    pdfUrl: '',
    description: '',
    cosmofeedUrl: '',
    active: true,
    enableSample: true,
    samplePages: 3
  });

  // Grant Access form state
  const [grantEmail, setGrantEmail] = useState('');
  const [grantName, setGrantName] = useState('');
  const [grantNotes, setGrantNotes] = useState('');
  const [selectedEbookIds, setSelectedEbookIds] = useState<string[]>([]);
  const [grantSuccessMsg, setGrantSuccessMsg] = useState('');

  // Customer search state
  const [customerSearch, setCustomerSearch] = useState('');

  // Supabase settings state
  const [supabaseCfg, setSupabaseCfg] = useState(getStoredSupabaseConfig());
  const [supabaseSaved, setSupabaseSaved] = useState(false);

  // Promotions state
  const [promos, setPromos] = useState<PromoBanner[]>(getStoredPromos());
  const [promoEnabled, setPromoEnabledState] = useState<boolean>(getPromoEnabled());
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoBanner | null>(null);
  const [promoForm, setPromoForm] = useState({
    title: '',
    subtitle: '',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1200&h=500&fit=crop',
    linkUrl: '',
    buttonText: 'Claim Offer',
    badgeText: 'Special Offer',
    active: true
  });

  const handleTogglePromoSystem = (checked: boolean) => {
    setPromoEnabledState(checked);
    setPromoEnabled(checked);
  };

  const handleOpenAddPromo = () => {
    setEditingPromo(null);
    setPromoForm({
      title: '',
      subtitle: '',
      imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1200&h=500&fit=crop',
      linkUrl: '',
      buttonText: 'Claim Offer',
      badgeText: 'Special Offer',
      active: true
    });
    setShowPromoModal(true);
  };

  const handleOpenEditPromo = (promo: PromoBanner) => {
    setEditingPromo(promo);
    setPromoForm({
      title: promo.title,
      subtitle: promo.subtitle,
      imageUrl: promo.imageUrl,
      linkUrl: promo.linkUrl,
      buttonText: promo.buttonText,
      badgeText: promo.badgeText || '',
      active: promo.active
    });
    setShowPromoModal(true);
  };

  const handleSavePromo = (e: React.FormEvent) => {
    e.preventDefault();
    let updated: PromoBanner[];
    if (editingPromo) {
      updated = promos.map(p => p.id === editingPromo.id ? { ...p, ...promoForm } : p);
    } else {
      const newPromo: PromoBanner = {
        id: 'promo_' + Date.now(),
        ...promoForm,
        createdAt: new Date().toISOString()
      };
      updated = [newPromo, ...promos];
    }
    setPromos(updated);
    savePromos(updated);
    setShowPromoModal(false);
    setEditingPromo(null);
  };

  const handleDeletePromo = (id: string) => {
    const updated = promos.filter(p => p.id !== id);
    setPromos(updated);
    savePromos(updated);
  };

  // --- EBook Actions ---
  const handleOpenAddEbook = () => {
    setEditingEbook(null);
    setEbookForm({
      title: '',
      subtitle: '',
      coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&h=800&fit=crop',
      pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      description: '',
      cosmofeedUrl: 'https://cosmofeed.com/vig/wellness-ebook',
      active: true,
      enableSample: true,
      samplePages: 3
    });
    setShowEbookModal(true);
  };

  const handleOpenEditEbook = (ebook: EBook) => {
    setEditingEbook(ebook);
    setEbookForm({
      title: ebook.title,
      subtitle: ebook.subtitle,
      coverImage: ebook.coverImage,
      pdfUrl: ebook.pdfUrl,
      description: ebook.description,
      cosmofeedUrl: ebook.cosmofeedUrl,
      active: ebook.active,
      enableSample: ebook.enableSample ?? true,
      samplePages: ebook.samplePages ?? 3
    });
    setShowEbookModal(true);
  };

  const handleSaveEbook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ebookForm.title) {
      alert('Please enter an eBook title.');
      return;
    }
    if (!ebookForm.coverImage) {
      alert('Please upload a cover image from your device.');
      return;
    }
    if (!ebookForm.pdfUrl) {
      alert('Please upload a PDF document from your device.');
      return;
    }

    const ebookId = editingEbook ? editingEbook.id : 'eb_' + Date.now();

    let finalPdfUrl = ebookForm.pdfUrl;
    if (finalPdfUrl.startsWith('data:')) {
      const pdfKey = 'idb_pdf_' + ebookId;
      await saveFileToIDB(pdfKey, finalPdfUrl);
      finalPdfUrl = 'idb://' + pdfKey;
    }

    let finalCoverUrl = ebookForm.coverImage;
    if (finalCoverUrl.startsWith('data:')) {
      const coverKey = 'idb_img_' + ebookId;
      await saveFileToIDB(coverKey, finalCoverUrl);
      finalCoverUrl = 'idb://' + coverKey;
    }

    const savedForm = {
      ...ebookForm,
      pdfUrl: finalPdfUrl,
      coverImage: finalCoverUrl
    };

    let updated: EBook[];
    if (editingEbook) {
      updated = ebooks.map(eb => eb.id === editingEbook.id ? { ...eb, ...savedForm } : eb);
    } else {
      const newEb: EBook = {
        id: ebookId,
        ...savedForm,
        createdAt: new Date().toISOString()
      };
      updated = [newEb, ...ebooks];
    }
    setEbooks(updated);
    saveEBooks(updated);
    setEditingEbook(null);
    setShowEbookModal(false);
  };

  const handleDeleteEbook = async (id: string) => {
    const updatedEbooks = ebooks.filter(e => e.id !== id);
    setEbooks(updatedEbooks);
    saveEBooks(updatedEbooks);

    try {
      await deleteFileFromIDB('idb_pdf_' + id);
      await deleteFileFromIDB('idb_img_' + id);
    } catch (err) {
      console.error('Error deleting files from IDB:', err);
    }

    const updatedGrants = getStoredGrants().filter(g => g.ebookId !== id);
    saveGrants(updatedGrants);
    setGrants(updatedGrants);

    const updatedProgress = getStoredProgress().filter(p => p.ebookId !== id);
    saveProgress(updatedProgress);

    const updatedBookmarks = getStoredBookmarks().filter(b => b.ebookId !== id);
    saveBookmarks(updatedBookmarks);
  };

  // --- Grant Access Actions ---
  const handleGrantAccessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!grantEmail || !grantEmail.includes('@')) {
      alert('Please enter a valid customer email.');
      return;
    }
    if (selectedEbookIds.length === 0) {
      alert('Please select at least one eBook to grant.');
      return;
    }

    const cleanEmail = grantEmail.trim().toLowerCase();
    let customer = customers.find(c => c.email.toLowerCase() === cleanEmail);

    let updatedCustomers = [...customers];
    if (!customer) {
      customer = {
        id: 'cust_' + Date.now(),
        email: cleanEmail,
        name: grantName || cleanEmail.split('@')[0],
        notes: grantNotes || 'Granted via Admin Panel',
        createdAt: new Date().toISOString()
      };
      updatedCustomers.push(customer);
    } else if (grantName || grantNotes) {
      updatedCustomers = updatedCustomers.map(c => c.id === customer!.id ? {
        ...c,
        name: grantName || c.name,
        notes: grantNotes || c.notes
      } : c);
    }

    setCustomers(updatedCustomers);
    saveCustomers(updatedCustomers);

    // Add grants
    const existingGrants = [...grants];
    selectedEbookIds.forEach(ebookId => {
      const alreadyHas = existingGrants.some(g => g.customerId === customer!.id && g.ebookId === ebookId);
      if (!alreadyHas) {
        existingGrants.push({
          id: 'g_' + Math.random().toString(36).substring(2) + Date.now(),
          customerId: customer!.id,
          ebookId,
          grantedAt: new Date().toISOString()
        });
      }
    });

    setGrants(existingGrants);
    saveGrants(existingGrants);

    setGrantSuccessMsg(`Successfully granted ${selectedEbookIds.length} eBook(s) to ${cleanEmail}!`);
    setGrantEmail('');
    setGrantName('');
    setGrantNotes('');
    setSelectedEbookIds([]);

    setTimeout(() => setGrantSuccessMsg(''), 4000);
  };

  // --- Customer Management Actions ---
  const handleResetDevice = (customerId: string) => {
    const updated = customers.map(c => c.id === customerId ? { ...c, activeSessionId: undefined } : c);
    setCustomers(updated);
    saveCustomers(updated);
    alert('Device session reset successfully. Customer will need to verify OTP again.');
  };

  const handleRevokeAllAccess = (customerId: string) => {
    const updated = grants.filter(g => g.customerId !== customerId);
    setGrants(updated);
    saveGrants(updated);
    alert('All eBook access revoked for this customer.');
  };

  // --- Supabase Config Save ---
  const handleSaveSupabase = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseConfig(supabaseCfg);
    setSupabaseSaved(true);
    setTimeout(() => setSupabaseSaved(false), 3000);
  };

  // --- Stats calculations ---
  const totalCustomers = customers.length;
  const totalGrants = grants.length;
  const ebookPopularity = ebooks.map(eb => {
    const count = grants.filter(g => g.ebookId === eb.id).length;
    return { ...eb, grantCount: count };
  }).sort((a, b) => b.grantCount - a.grantCount);
  const mostPopularEbook = ebookPopularity[0];

  const filteredCustomers = customers.filter(c => 
    c.email.toLowerCase().includes(customerSearch.toLowerCase()) ||
    (c.name && c.name.toLowerCase().includes(customerSearch.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Admin Header */}
      <div className="bg-[#064e3b] text-[#f4ecd8] rounded-3xl p-6 sm:p-8 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold">Admin Control Sanctuary</h2>
          <p className="text-xs sm:text-sm text-[#d1fae5] mt-1">
            Manage your secure eBooks, customer access grants, single-device security, and Supabase database.
          </p>
        </div>
        <div className="bg-[#043d2e] px-4 py-2 rounded-xl text-xs font-mono text-[#fbbf24] border border-[#047857]">
          Admin: {ADMIN_EMAIL}
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#e5dec9] pb-3">
        <button
          onClick={() => setActiveTab('ebooks')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'ebooks' ? 'bg-[#064e3b] text-[#f4ecd8] shadow-xs' : 'text-[#526052] hover:bg-[#ede7d3]'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>eBooks ({ebooks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('grants')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'grants' ? 'bg-[#064e3b] text-[#f4ecd8] shadow-xs' : 'text-[#526052] hover:bg-[#ede7d3]'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Grant Access</span>
        </button>

        <button
          onClick={() => setActiveTab('customers')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'customers' ? 'bg-[#064e3b] text-[#f4ecd8] shadow-xs' : 'text-[#526052] hover:bg-[#ede7d3]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Customers ({customers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('stats')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'stats' ? 'bg-[#064e3b] text-[#f4ecd8] shadow-xs' : 'text-[#526052] hover:bg-[#ede7d3]'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Analytics & Stats</span>
        </button>

        <button
          onClick={() => setActiveTab('supabase')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'supabase' ? 'bg-[#064e3b] text-[#f4ecd8] shadow-xs' : 'text-[#526052] hover:bg-[#ede7d3]'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Supabase Config</span>
        </button>

        <button
          onClick={() => setActiveTab('promos')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'promos' ? 'bg-[#064e3b] text-[#f4ecd8] shadow-xs' : 'text-[#526052] hover:bg-[#ede7d3]'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>Promotions / Ads</span>
        </button>
      </div>

      {/* TAB 1: EBOOKS MANAGEMENT */}
      {activeTab === 'ebooks' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-serif text-xl font-bold text-[#064e3b]">Manage eBooks</h3>
            <button
              onClick={handleOpenAddEbook}
              className="flex items-center space-x-2 bg-[#064e3b] text-[#f4ecd8] px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#043d2e] transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add New eBook</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ebooks.map((ebook) => (
              <div key={ebook.id} className="bg-[#f6f2e6] border border-[#dcd2bc] rounded-3xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
                <div className="flex space-x-4">
                  <EBookCover
                    coverUrl={ebook.coverImage}
                    alt={ebook.title}
                    className="w-20 h-28 object-cover rounded-xl shadow-xs shrink-0"
                  />
                  <div className="space-y-1 overflow-hidden">
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${ebook.active ? 'bg-emerald-600' : 'bg-gray-400'}`}></span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#617067]">
                        {ebook.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <h4 className="font-serif font-bold text-[#064e3b] line-clamp-1">{ebook.title}</h4>
                    <p className="text-xs text-[#526052] line-clamp-2">{ebook.subtitle}</p>
                    <a 
                      href={ebook.cosmofeedUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-xs text-[#047857] hover:underline flex items-center space-x-1 pt-1 font-medium"
                    >
                      <span>Cosmofeed Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#e2d8be]">
                  <button
                    onClick={() => handleOpenEditEbook(ebook)}
                    className="p-2 rounded-lg bg-[#e8e2d0] text-[#064e3b] hover:bg-[#ded6c0] transition-colors"
                    title="Edit eBook"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteEbook(ebook.id)}
                    className="p-2 rounded-lg bg-[#fee2e2] text-[#991b1b] hover:bg-[#fecaca] transition-colors"
                    title="Delete eBook"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: GRANT ACCESS */}
      {activeTab === 'grants' && (
        <div className="max-w-2xl bg-[#f6f2e6] border border-[#dcd2bc] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h3 className="font-serif text-xl font-bold text-[#064e3b]">Grant eBook Access to Customer</h3>
            <p className="text-xs text-[#526052] mt-1">
              Type the customer's email and select which eBooks they purchased. This instantly authorizes their login.
            </p>
          </div>

          {grantSuccessMsg && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 p-4 rounded-2xl flex items-center space-x-2 text-sm font-medium animate-fade-in">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{grantSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleGrantAccessSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#36483e]">Customer Email *</label>
              <input
                type="email"
                required
                value={grantEmail}
                onChange={(e) => setGrantEmail(e.target.value)}
                placeholder="customer@example.com"
                className="w-full px-4 py-3 bg-white border border-[#d6ccb2] rounded-xl text-[#1c2d25] text-sm focus:outline-none focus:ring-2 focus:ring-[#047857]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#36483e]">Customer Name (Optional)</label>
                <input
                  type="text"
                  value={grantName}
                  onChange={(e) => setGrantName(e.target.value)}
                  placeholder="Priya Sharma"
                  className="w-full px-4 py-3 bg-white border border-[#d6ccb2] rounded-xl text-[#1c2d25] text-sm focus:outline-none focus:ring-2 focus:ring-[#047857]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#36483e]">Notes (Optional)</label>
                <input
                  type="text"
                  value={grantNotes}
                  onChange={(e) => setGrantNotes(e.target.value)}
                  placeholder="Cosmofeed Order #1042"
                  className="w-full px-4 py-3 bg-white border border-[#d6ccb2] rounded-xl text-[#1c2d25] text-sm focus:outline-none focus:ring-2 focus:ring-[#047857]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#36483e]">Select eBooks to Grant *</label>
              <div className="space-y-2 bg-white/60 p-4 rounded-2xl border border-[#d6ccb2]">
                {ebooks.map(ebook => {
                  const isChecked = selectedEbookIds.includes(ebook.id);
                  return (
                    <label key={ebook.id} className="flex items-center space-x-3 p-2 hover:bg-[#ede7d3] rounded-xl cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedEbookIds([...selectedEbookIds, ebook.id]);
                          } else {
                            setSelectedEbookIds(selectedEbookIds.filter(id => id !== ebook.id));
                          }
                        }}
                        className="w-4 h-4 text-[#047857] rounded border-gray-300 focus:ring-[#047857]"
                      />
                      <span className="text-sm font-medium text-[#1c2d25]">{ebook.title}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-[#064e3b] text-[#f4ecd8] rounded-xl font-semibold hover:bg-[#043d2e] transition-colors shadow-md flex items-center justify-center space-x-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>Give Access</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: CUSTOMERS LIST */}
      {activeTab === 'customers' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="font-serif text-xl font-bold text-[#064e3b]">Customer Directory & Sessions</h3>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#738479]" />
              <input
                type="text"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                placeholder="Search by email or name..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-[#d6ccb2] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#047857]"
              />
            </div>
          </div>

          <div className="bg-[#f6f2e6] border border-[#dcd2bc] rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#e8e2d0] text-[#064e3b] text-xs uppercase tracking-wider border-b border-[#dcd2bc]">
                    <th className="p-4">Customer</th>
                    <th className="p-4">Owned eBooks</th>
                    <th className="p-4">Device Session</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5dec9] text-sm">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-[#627065]">No customers found.</td>
                    </tr>
                  ) : (
                    filteredCustomers.map(cust => {
                      const custGrants = grants.filter(g => g.customerId === cust.id);
                      const ownedTitles = custGrants.map(g => {
                        const eb = ebooks.find(e => e.id === g.ebookId);
                        return eb ? eb.title : null;
                      }).filter(Boolean);

                      return (
                        <tr key={cust.id} className="hover:bg-[#ede7d3]/50 transition-colors">
                          <td className="p-4 space-y-0.5">
                            <p className="font-semibold text-[#064e3b]">{cust.email}</p>
                            <p className="text-xs text-[#526052]">{cust.name || 'No name'} {cust.notes ? `• ${cust.notes}` : ''}</p>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {ownedTitles.length === 0 ? (
                                <span className="text-xs text-[#991b1b] bg-red-50 px-2 py-0.5 rounded">No eBooks</span>
                              ) : (
                                ownedTitles.map((t, idx) => (
                                  <span key={idx} className="text-[11px] bg-[#064e3b]/10 text-[#064e3b] px-2 py-0.5 rounded font-medium">
                                    {t}
                                  </span>
                                ))
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            {cust.activeSessionId ? (
                              <span className="inline-flex items-center space-x-1.5 text-xs bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-medium">
                                <Smartphone className="w-3.5 h-3.5" />
                                <span>Active Device</span>
                              </span>
                            ) : (
                              <span className="text-xs text-gray-500 italic">No active session</span>
                            )}
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <button
                              onClick={() => handleResetDevice(cust.id)}
                              className="px-3 py-1.5 bg-[#e5dec9] text-[#064e3b] hover:bg-[#d8ceb4] rounded-lg text-xs font-medium transition-colors"
                              title="Reset single-device session"
                            >
                              Reset Device
                            </button>
                            <button
                              onClick={() => handleRevokeAllAccess(cust.id)}
                              className="px-3 py-1.5 bg-[#fee2e2] text-[#991b1b] hover:bg-[#fecaca] rounded-lg text-xs font-medium transition-colors"
                              title="Revoke all eBook access"
                            >
                              Revoke Access
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ANALYTICS & STATS */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          <h3 className="font-serif text-xl font-bold text-[#064e3b]">Analytics & Overview</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-[#f6f2e6] border border-[#dcd2bc] rounded-3xl p-6 shadow-sm space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#526052]">Total Customers</p>
              <p className="font-serif text-4xl font-bold text-[#064e3b]">{totalCustomers}</p>
              <p className="text-xs text-[#738479]">Authorized accounts in system</p>
            </div>

            <div className="bg-[#f6f2e6] border border-[#dcd2bc] rounded-3xl p-6 shadow-sm space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#526052]">Total Access Grants</p>
              <p className="font-serif text-4xl font-bold text-[#047857]">{totalGrants}</p>
              <p className="text-xs text-[#738479]">Active eBook licenses assigned</p>
            </div>

            <div className="bg-[#f6f2e6] border border-[#dcd2bc] rounded-3xl p-6 shadow-sm space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#526052]">Most Popular eBook</p>
              <p className="font-serif text-lg font-bold text-[#d97706] truncate">
                {mostPopularEbook ? mostPopularEbook.title : 'None'}
              </p>
              <p className="text-xs text-[#738479]">
                {mostPopularEbook ? `${mostPopularEbook.grantCount} grants` : '0 grants'}
              </p>
            </div>
          </div>

          <div className="bg-[#f6f2e6] border border-[#dcd2bc] rounded-3xl p-6 shadow-sm space-y-4">
            <h4 className="font-serif text-lg font-bold text-[#064e3b]">eBook Popularity Breakdown</h4>
            <div className="space-y-3">
              {ebookPopularity.map(eb => (
                <div key={eb.id} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-[#36483e]">
                    <span>{eb.title}</span>
                    <span>{eb.grantCount} grants</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#e5dec9] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#047857] rounded-full" 
                      style={{ width: `${totalGrants > 0 ? (eb.grantCount / totalGrants) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SUPABASE CONFIG */}
      {activeTab === 'supabase' && (
        <div className="max-w-2xl bg-[#f6f2e6] border border-[#dcd2bc] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h3 className="font-serif text-xl font-bold text-[#064e3b]">Supabase Database & Storage Configuration</h3>
            <p className="text-xs text-[#526052] mt-1">
              Connect your production Supabase project for secure private bucket signed URLs and PostgreSQL backend.
            </p>
          </div>

          {supabaseSaved && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 p-4 rounded-2xl flex items-center space-x-2 text-sm font-medium">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <span>Supabase configuration saved successfully!</span>
            </div>
          )}

          <form onSubmit={handleSaveSupabase} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#36483e]">Supabase Project URL</label>
              <input
                type="text"
                value={supabaseCfg.url}
                onChange={(e) => setSupabaseCfg({ ...supabaseCfg, url: e.target.value })}
                placeholder="https://xyzproject.supabase.co"
                className="w-full px-4 py-3 bg-white border border-[#d6ccb2] rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#047857]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#36483e]">Supabase Anon / Public Key</label>
              <input
                type="password"
                value={supabaseCfg.anonKey}
                onChange={(e) => setSupabaseCfg({ ...supabaseCfg, anonKey: e.target.value })}
                placeholder="eyJhbGciOi..."
                className="w-full px-4 py-3 bg-white border border-[#d6ccb2] rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#047857]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#36483e]">Private Storage Bucket Name</label>
              <input
                type="text"
                value={supabaseCfg.bucketName}
                onChange={(e) => setSupabaseCfg({ ...supabaseCfg, bucketName: e.target.value })}
                placeholder="secure-ebooks"
                className="w-full px-4 py-3 bg-white border border-[#d6ccb2] rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#047857]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-[#064e3b] text-[#f4ecd8] rounded-xl font-semibold hover:bg-[#043d2e] transition-colors shadow-md flex items-center justify-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Supabase Configuration</span>
            </button>
          </form>
        </div>
      )}

      {/* EBOOK ADD/EDIT MODAL */}
      {showEbookModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#fbf9f5] border border-[#d4cbb3] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
            <h3 className="font-serif text-2xl font-bold text-[#064e3b]">
              {editingEbook ? 'Edit eBook' : 'Add New eBook'}
            </h3>

            <form onSubmit={handleSaveEbook} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#36483e]">Title *</label>
                <input
                  type="text"
                  required
                  value={ebookForm.title}
                  onChange={(e) => setEbookForm({ ...ebookForm, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-[#d6ccb2] rounded-xl text-sm focus:ring-2 focus:ring-[#047857]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#36483e]">Subtitle *</label>
                <input
                  type="text"
                  required
                  value={ebookForm.subtitle}
                  onChange={(e) => setEbookForm({ ...ebookForm, subtitle: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-[#d6ccb2] rounded-xl text-sm focus:ring-2 focus:ring-[#047857]"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#36483e]">Cover Image (Upload from Device) *</label>
                <div className="flex items-center space-x-4">
                  {ebookForm.coverImage && (
                    <EBookCover coverUrl={ebookForm.coverImage} alt="Cover Preview" className="w-14 h-20 object-cover rounded-lg border border-[#d6ccb2] shrink-0" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          setEbookForm(prev => ({ ...prev, coverImage: ev.target?.result as string }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full text-xs text-[#526052] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#064e3b] file:text-[#f4ecd8] hover:file:bg-[#043d2e] cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#36483e]">PDF Document (Upload from Device) *</label>
                <div className="space-y-1">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          setEbookForm(prev => ({ ...prev, pdfUrl: ev.target?.result as string }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full text-xs text-[#526052] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#064e3b] file:text-[#f4ecd8] hover:file:bg-[#043d2e] cursor-pointer"
                  />
                  <p className="text-[11px] text-[#738479]">
                    {ebookForm.pdfUrl && ebookForm.pdfUrl.startsWith('data:') ? '✓ PDF loaded successfully from device' : 'Upload PDF file from your device.'}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#36483e]">Cosmofeed Product Page URL *</label>
                <input
                  type="url"
                  required
                  value={ebookForm.cosmofeedUrl}
                  onChange={(e) => setEbookForm({ ...ebookForm, cosmofeedUrl: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-[#d6ccb2] rounded-xl text-sm font-mono focus:ring-2 focus:ring-[#047857]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#36483e]">Description *</label>
                <textarea
                  rows={3}
                  required
                  value={ebookForm.description}
                  onChange={(e) => setEbookForm({ ...ebookForm, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-[#d6ccb2] rounded-xl text-sm focus:ring-2 focus:ring-[#047857]"
                ></textarea>
              </div>

              <div className="bg-[#ede7d3] p-4 rounded-2xl space-y-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="enableSampleToggle"
                    checked={ebookForm.enableSample}
                    onChange={(e) => setEbookForm({ ...ebookForm, enableSample: e.target.checked })}
                    className="w-4 h-4 text-[#047857] rounded border-gray-300 focus:ring-[#047857]"
                  />
                  <label htmlFor="enableSampleToggle" className="text-sm font-semibold text-[#1c2d25]">Enable Free Sample Preview</label>
                </div>
                {ebookForm.enableSample && (
                  <div className="space-y-1 pl-7">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#36483e]">Sample Pages Count</label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={ebookForm.samplePages}
                      onChange={(e) => setEbookForm({ ...ebookForm, samplePages: parseInt(e.target.value) || 3 })}
                      className="w-32 px-3 py-2 bg-white border border-[#d6ccb2] rounded-xl text-sm focus:ring-2 focus:ring-[#047857]"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <input
                  type="checkbox"
                  id="activeToggle"
                  checked={ebookForm.active}
                  onChange={(e) => setEbookForm({ ...ebookForm, active: e.target.checked })}
                  className="w-4 h-4 text-[#047857] rounded border-gray-300 focus:ring-[#047857]"
                />
                <label htmlFor="activeToggle" className="text-sm font-medium text-[#1c2d25]">Active in Library</label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEbookModal(false)}
                  className="w-1/2 py-3 bg-[#e5dec9] text-[#064e3b] rounded-xl font-medium hover:bg-[#d8ceb4] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 bg-[#064e3b] text-[#f4ecd8] rounded-xl font-semibold hover:bg-[#043d2e] transition-colors shadow-md"
                >
                  Save eBook
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 6: PROMOTIONS / ADS */}
      {activeTab === 'promos' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#f6f2e6] border border-[#dcd2bc] rounded-3xl p-6 shadow-sm">
            <div className="space-y-1">
              <h3 className="font-serif text-xl font-bold text-[#064e3b]">Promotional Banner System</h3>
              <p className="text-xs text-[#526052]">
                Manage promotional hero banners shown to customers on their library dashboard.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer bg-white px-4 py-2.5 rounded-xl border border-[#d6ccb2] shadow-xs">
                <input
                  type="checkbox"
                  checked={promoEnabled}
                  onChange={(e) => handleTogglePromoSystem(e.target.checked)}
                  className="w-4 h-4 text-[#047857] rounded border-gray-300 focus:ring-[#047857]"
                />
                <span className="text-sm font-semibold text-[#064e3b]">Banner System {promoEnabled ? 'ON' : 'OFF'}</span>
              </label>
              <button
                onClick={handleOpenAddPromo}
                className="flex items-center space-x-2 bg-[#064e3b] text-[#f4ecd8] px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#043d2e] transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Promo Banner</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {promos.map((promo) => (
              <div key={promo.id} className="bg-[#f6f2e6] border border-[#dcd2bc] rounded-3xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="relative aspect-[21/9] rounded-xl overflow-hidden bg-[#e5dec9]">
                    <img src={promo.imageUrl} alt={promo.title} className="w-full h-full object-cover" />
                    {promo.badgeText && (
                      <span className="absolute top-2.5 left-2.5 bg-[#fbbf24] text-[#064e3b] text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs">
                        {promo.badgeText}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`w-2 h-2 rounded-full ${promo.active ? 'bg-emerald-600' : 'bg-gray-400'}`}></span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#617067]">
                      {promo.active ? 'Active' : 'Hidden'}
                    </span>
                  </div>
                  <h4 className="font-serif font-bold text-[#064e3b] text-lg">{promo.title}</h4>
                  <p className="text-xs text-[#526052] line-clamp-2">{promo.subtitle}</p>
                  <p className="text-[11px] font-mono text-[#047857] truncate">Link: {promo.linkUrl}</p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#e2d8be]">
                  <span className="text-xs font-semibold px-3 py-1 bg-[#ede7d3] text-[#064e3b] rounded-lg">
                    {promo.buttonText}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleOpenEditPromo(promo)}
                      className="p-2 rounded-lg bg-[#e5dec9] text-[#064e3b] hover:bg-[#d8ceb4] transition-colors"
                      title="Edit Promo"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePromo(promo.id)}
                      className="p-2 rounded-lg bg-[#fee2e2] text-[#991b1b] hover:bg-[#fecaca] transition-colors"
                      title="Delete Promo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PROMO ADD/EDIT MODAL */}
      {showPromoModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#fbf9f5] border border-[#d4cbb3] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
            <h3 className="font-serif text-2xl font-bold text-[#064e3b]">
              {editingPromo ? 'Edit Promotional Banner' : 'Add New Promotional Banner'}
            </h3>

            <form onSubmit={handleSavePromo} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#36483e]">Headline / Title *</label>
                <input
                  type="text"
                  required
                  value={promoForm.title}
                  onChange={(e) => setPromoForm({ ...promoForm, title: e.target.value })}
                  placeholder="Complete Masterclass Bundle"
                  className="w-full px-4 py-2.5 bg-white border border-[#d6ccb2] rounded-xl text-sm focus:ring-2 focus:ring-[#047857]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#36483e]">Subheading *</label>
                <textarea
                  rows={2}
                  required
                  value={promoForm.subtitle}
                  onChange={(e) => setPromoForm({ ...promoForm, subtitle: e.target.value })}
                  placeholder="Unlock all 4 masterclasses at 50% discount..."
                  className="w-full px-4 py-2.5 bg-white border border-[#d6ccb2] rounded-xl text-sm focus:ring-2 focus:ring-[#047857]"
                ></textarea>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#36483e]">Poster Image URL *</label>
                <input
                  type="url"
                  required
                  value={promoForm.imageUrl}
                  onChange={(e) => setPromoForm({ ...promoForm, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-2.5 bg-white border border-[#d6ccb2] rounded-xl text-sm font-mono focus:ring-2 focus:ring-[#047857]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#36483e]">Target Destination URL (Cosmofeed/WhatsApp) *</label>
                <input
                  type="url"
                  required
                  value={promoForm.linkUrl}
                  onChange={(e) => setPromoForm({ ...promoForm, linkUrl: e.target.value })}
                  placeholder="https://cosmofeed.com/..."
                  className="w-full px-4 py-2.5 bg-white border border-[#d6ccb2] rounded-xl text-sm font-mono focus:ring-2 focus:ring-[#047857]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#36483e]">Button Text</label>
                  <input
                    type="text"
                    value={promoForm.buttonText}
                    onChange={(e) => setPromoForm({ ...promoForm, buttonText: e.target.value })}
                    placeholder="Claim Offer"
                    className="w-full px-4 py-2.5 bg-white border border-[#d6ccb2] rounded-xl text-sm focus:ring-2 focus:ring-[#047857]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#36483e]">Badge Text</label>
                  <input
                    type="text"
                    value={promoForm.badgeText}
                    onChange={(e) => setPromoForm({ ...promoForm, badgeText: e.target.value })}
                    placeholder="Special Offer"
                    className="w-full px-4 py-2.5 bg-white border border-[#d6ccb2] rounded-xl text-sm focus:ring-2 focus:ring-[#047857]"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <input
                  type="checkbox"
                  id="promoActiveToggle"
                  checked={promoForm.active}
                  onChange={(e) => setPromoForm({ ...promoForm, active: e.target.checked })}
                  className="w-4 h-4 text-[#047857] rounded border-gray-300 focus:ring-[#047857]"
                />
                <label htmlFor="promoActiveToggle" className="text-sm font-medium text-[#1c2d25]">Active (Show on Banner)</label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPromoModal(false)}
                  className="w-1/2 py-3 bg-[#e5dec9] text-[#064e3b] rounded-xl font-medium hover:bg-[#d8ceb4] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 bg-[#064e3b] text-[#f4ecd8] rounded-xl font-semibold hover:bg-[#043d2e] transition-colors shadow-md"
                >
                  Save Promotion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
