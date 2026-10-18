import { EBook, Customer, AccessGrant, ReadingProgress, Bookmark, PromoBanner } from '../types';

export const ADMIN_EMAIL = 'adinathkhannukar7084@gmail.com';
export const WHATSAPP_NUMBER = '918310828152'; // Admin WhatsApp number

const STORAGE_KEYS = {
  EBOOKS: 'veda_swasth_ebooks',
  CUSTOMERS: 'veda_swasth_customers',
  GRANTS: 'veda_swasth_grants',
  PROGRESS: 'veda_swasth_progress',
  BOOKMARKS: 'veda_swasth_bookmarks',
  CURRENT_USER: 'veda_swasth_current_user',
  SESSION_ID: 'veda_swasth_session_id',
  SUPABASE_CONFIG: 'veda_swasth_supabase_config',
  PROMOS: 'veda_swasth_promos',
  PROMO_ENABLED: 'veda_swasth_promo_enabled'
};

const DEFAULT_EBOOKS: EBook[] = [
  {
    id: 'eb-1',
    title: '50 Powerful Yoga Asanas',
    subtitle: 'Comprehensive guide to mastering foundational and advanced yoga asanas for health',
    coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&h=800&fit=crop',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    pdfPath: '2026 50 Powerful Yoga Asanas eBook_compressed (1).pdf',
    description: 'Master 50 powerful yoga asanas with alignment cues, benefits, and contraindications for total physical and spiritual well-being.',
    cosmofeedUrl: 'https://cosmofeed.com/vig/yoga-asanas-guide',
    active: true,
    enableSample: true,
    sampleStartPage: 1,
    sampleEndPage: 3,
    createdAt: new Date().toISOString()
  },
  {
    id: 'eb-2',
    title: 'Heal Your Karmas',
    subtitle: 'Clearing deep-seated energetic blockages and karmic patterns in the body',
    coverImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=800&fit=crop',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    pdfPath: 'Healing Karma in the Body E-Boook pdf_compressed.pdf',
    description: 'Understand how karmic imprints manifest physically in somatic memory and learn proven holistic techniques to release them.',
    cosmofeedUrl: 'https://cosmofeed.com/vig/heal-your-karmas',
    active: true,
    enableSample: true,
    sampleStartPage: 1,
    sampleEndPage: 3,
    createdAt: new Date().toISOString()
  },
  {
    id: 'eb-3',
    title: '50 Powerful Aura Cleansing Techniques',
    subtitle: 'Purify, shield, and elevate your electromagnetic biofield',
    coverImage: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&h=800&fit=crop',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    pdfPath: 'NEW 50 AURA CLEANSING TECHNIQUES EBOOK_compressed.pdf',
    description: 'Explore 50 practical rituals and visualization methods to clear psychic debris, protect your aura, and radiate positive vibration.',
    cosmofeedUrl: 'https://cosmofeed.com/vig/aura-cleansing',
    active: true,
    enableSample: true,
    sampleStartPage: 1,
    sampleEndPage: 3,
    createdAt: new Date().toISOString()
  },
  {
    id: 'eb-4',
    title: '50 Powerful Breathing Techniques',
    subtitle: 'Science and sacred practice of breathwork for vitality and stress immunity',
    coverImage: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=600&h=800&fit=crop',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    pdfPath: '50 Breathing techniques guide.pdf',
    description: 'A complete step-by-step masterclass on 50 breath control techniques to oxygenate cells, clear mental fog, and activate parasympathetic healing.',
    cosmofeedUrl: 'https://cosmofeed.com/vig/breathing-techniques',
    active: true,
    enableSample: true,
    sampleStartPage: 1,
    sampleEndPage: 3,
    createdAt: new Date().toISOString()
  },
  {
    id: 'eb-5',
    title: 'How To Balance Your 7 Chakras',
    subtitle: 'Aligning your subtle energy centers for vibrant health and emotional equilibrium',
    coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&h=800&fit=crop',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    pdfPath: 'how to balance 7 chakras.pdf',
    description: 'A practical guide to diagnosing imbalances in your root, sacral, solar plexus, heart, throat, third eye, and crown chakras.',
    cosmofeedUrl: 'https://cosmofeed.com/vig/balance-7-chakras',
    active: true,
    enableSample: true,
    sampleStartPage: 1,
    sampleEndPage: 3,
    createdAt: new Date().toISOString()
  },
  {
    id: 'eb-6',
    title: '50 Powerful Hand Mudras',
    subtitle: 'Ancient gestures of healing, consciousness, and vital energy redirection',
    coverImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=800&fit=crop',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    pdfPath: 'New Mudra E-Book Guide.pdf',
    description: 'Discover how simple hand gestures (mudras) can heal ailments, sharpen focus, and awaken higher spiritual dimensions.',
    cosmofeedUrl: 'https://cosmofeed.com/vig/hand-mudras',
    active: true,
    enableSample: true,
    sampleStartPage: 1,
    sampleEndPage: 3,
    createdAt: new Date().toISOString()
  }
];

const DEFAULT_CUSTOMERS: Customer[] = [
  {
    id: 'cust-admin',
    email: ADMIN_EMAIL,
    name: 'Adinath',
    activeSessionId: 'session-admin-1',
    notes: 'Platform Administrator',
    createdAt: new Date().toISOString()
  },
  {
    id: 'cust-1',
    email: 'testcustomer@gmail.com',
    name: 'Priya Sharma',
    activeSessionId: 'session-test-1',
    notes: 'Purchased Sleep & Breath bundle',
    createdAt: new Date().toISOString()
  }
];

const DEFAULT_GRANTS: AccessGrant[] = [
  { id: 'g-1', customerId: 'cust-admin', ebookId: 'eb-1', grantedAt: new Date().toISOString() },
  { id: 'g-2', customerId: 'cust-admin', ebookId: 'eb-2', grantedAt: new Date().toISOString() },
  { id: 'g-3', customerId: 'cust-admin', ebookId: 'eb-3', grantedAt: new Date().toISOString() },
  { id: 'g-4', customerId: 'cust-admin', ebookId: 'eb-4', grantedAt: new Date().toISOString() },
  { id: 'g-5', customerId: 'cust-1', ebookId: 'eb-1', grantedAt: new Date().toISOString() },
  { id: 'g-6', customerId: 'cust-1', ebookId: 'eb-2', grantedAt: new Date().toISOString() }
];

const DEFAULT_PROMOS: PromoBanner[] = [
  {
    id: 'promo-1',
    title: 'Complete Veda Swasth Masterclass Bundle',
    subtitle: 'Unlock all 4 transformative wellness & Ayurveda guides at 50% special discount today.',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1200&h=500&fit=crop',
    linkUrl: 'https://cosmofeed.com/vig/all-masterclasses-bundle',
    buttonText: 'Claim 50% Off Offer',
    badgeText: 'Special Bundle Offer',
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'promo-2',
    title: 'Pranayama & Breathwork Live Masterclass',
    subtitle: 'Master ancient breathing science for profound stress immunity and mental clarity.',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&h=500&fit=crop',
    linkUrl: 'https://cosmofeed.com/vig/pranayama-mastery',
    buttonText: 'Enroll Now',
    badgeText: 'Live Workshop',
    active: true,
    createdAt: new Date().toISOString()
  }
];

export function getStoredEBooks(): EBook[] {
  const data = localStorage.getItem(STORAGE_KEYS.EBOOKS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.EBOOKS, JSON.stringify(DEFAULT_EBOOKS));
    return DEFAULT_EBOOKS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return DEFAULT_EBOOKS;
  }
}

export function saveEBooks(ebooks: EBook[]) {
  localStorage.setItem(STORAGE_KEYS.EBOOKS, JSON.stringify(ebooks));
}

export function getStoredCustomers(): Customer[] {
  const data = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
  let customers: Customer[];
  if (!data) {
    customers = DEFAULT_CUSTOMERS;
  } else {
    try {
      customers = JSON.parse(data);
    } catch {
      customers = DEFAULT_CUSTOMERS;
    }
  }
  return customers.map(c => c.email.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? { ...c, name: 'Adinath' } : c);
}

export function saveCustomers(customers: Customer[]) {
  localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
}

export function getStoredGrants(): AccessGrant[] {
  const data = localStorage.getItem(STORAGE_KEYS.GRANTS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.GRANTS, JSON.stringify(DEFAULT_GRANTS));
    return DEFAULT_GRANTS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return DEFAULT_GRANTS;
  }
}

export function saveGrants(grants: AccessGrant[]) {
  localStorage.setItem(STORAGE_KEYS.GRANTS, JSON.stringify(grants));
}

export function getStoredProgress(): ReadingProgress[] {
  const data = localStorage.getItem(STORAGE_KEYS.PROGRESS);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveProgress(progress: ReadingProgress[]) {
  localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
}

export function getStoredBookmarks(): Bookmark[] {
  const data = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveBookmarks(bookmarks: Bookmark[]) {
  localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
}

export function getStoredPromos(): PromoBanner[] {
  const data = localStorage.getItem(STORAGE_KEYS.PROMOS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.PROMOS, JSON.stringify(DEFAULT_PROMOS));
    return DEFAULT_PROMOS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return DEFAULT_PROMOS;
  }
}

export function savePromos(promos: PromoBanner[]) {
  localStorage.setItem(STORAGE_KEYS.PROMOS, JSON.stringify(promos));
}

export function getPromoEnabled(): boolean {
  const val = localStorage.getItem(STORAGE_KEYS.PROMO_ENABLED);
  if (val === null) return true;
  return val === 'true';
}

export function setPromoEnabled(enabled: boolean) {
  localStorage.setItem(STORAGE_KEYS.PROMO_ENABLED, enabled ? 'true' : 'false');
}

export function getCurrentUser(): Customer | null {
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  if (!data) return null;
  try {
    const user: Customer = JSON.parse(data);
    if (user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      user.name = 'Adinath';
    }
    return user;
  } catch {
    return null;
  }
}

export function setCurrentUser(user: Customer | null) {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
}

export function getSessionId(): string {
  let sessionId = localStorage.getItem(STORAGE_KEYS.SESSION_ID);
  if (!sessionId) {
    sessionId = 'session_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId);
  }
  return sessionId;
}

export function getSupabaseConfig() {
  const data = localStorage.getItem(STORAGE_KEYS.SUPABASE_CONFIG);
  if (!data) {
    return { url: '', anonKey: '', bucketName: 'secure-ebooks' };
  }
  try {
    return JSON.parse(data);
  } catch {
    return { url: '', anonKey: '', bucketName: 'secure-ebooks' };
  }
}

export function saveSupabaseConfig(config: { url: string; anonKey: string; bucketName: string }) {
  localStorage.setItem(STORAGE_KEYS.SUPABASE_CONFIG, JSON.stringify(config));
}
