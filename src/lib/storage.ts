import { EBook, Customer, AccessGrant, ReadingProgress, Bookmark, PromoBanner } from '../types';
import { getSupabaseClient } from './supabaseConfig';

export const ADMIN_EMAILS = [
  'adinathkhannukar7084@gmail.com'
];
export const ADMIN_EMAIL = ADMIN_EMAILS[0];
export const WHATSAPP_NUMBER = '918310828152'; // Admin WhatsApp number

export function isAdminEmail(email: string): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.some(e => e.toLowerCase() === email.trim().toLowerCase());
}

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
    coverImage: 'https://images.unsplash.com/photo-1512438248247-f0f2a5a8b7f0?w=600&h=800&fit=crop',
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
    coverImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=800&fit=crop',
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
    id: 'cust-admin-1',
    email: ADMIN_EMAILS[0],
    name: 'Adinath',
    activeSessionId: 'session-admin-1',
    notes: 'Platform Administrator',
    createdAt: new Date().toISOString()
  },
  {
    id: 'cust-admin-2',
    email: ADMIN_EMAILS[1],
    name: 'Adinath',
    activeSessionId: 'session-admin-2',
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
  { id: 'g-1', customerId: 'cust-admin-1', ebookId: 'eb-1', grantedAt: new Date().toISOString() },
  { id: 'g-2', customerId: 'cust-admin-1', ebookId: 'eb-2', grantedAt: new Date().toISOString() },
  { id: 'g-3', customerId: 'cust-admin-1', ebookId: 'eb-3', grantedAt: new Date().toISOString() },
  { id: 'g-4', customerId: 'cust-admin-1', ebookId: 'eb-4', grantedAt: new Date().toISOString() },
  { id: 'g-5', customerId: 'cust-admin-1', ebookId: 'eb-5', grantedAt: new Date().toISOString() },
  { id: 'g-6', customerId: 'cust-admin-1', ebookId: 'eb-6', grantedAt: new Date().toISOString() },
  { id: 'g-7', customerId: 'cust-admin-2', ebookId: 'eb-1', grantedAt: new Date().toISOString() },
  { id: 'g-8', customerId: 'cust-admin-2', ebookId: 'eb-2', grantedAt: new Date().toISOString() },
  { id: 'g-9', customerId: 'cust-1', ebookId: 'eb-1', grantedAt: new Date().toISOString() },
  { id: 'g-10', customerId: 'cust-1', ebookId: 'eb-2', grantedAt: new Date().toISOString() }
];

const DEFAULT_PROMOS: PromoBanner[] = [
  {
    id: 'promo-1',
    title: 'Complete Veda Swasth Masterclass Bundle',
    subtitle: 'Unlock all 6 transformative wellness & Ayurveda guides at 50% special discount today.',
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

export async function fetchAndSyncEBooks(): Promise<EBook[]> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return getStoredEBooks();
  }

  try {
    const { data, error } = await supabase.from('ebooks').select('*');
    if (!error && data && data.length > 0) {
      const remoteEbooks: EBook[] = data.map((item: any) => ({
        id: item.id,
        title: item.title,
        subtitle: item.subtitle,
        coverImage: item.cover_image || item.coverImage,
        pdfUrl: item.pdf_url || item.pdfUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        pdfPath: item.pdf_path || item.pdfPath,
        description: item.description,
        cosmofeedUrl: item.cosmofeed_url || item.cosmofeedUrl,
        active: item.active ?? true,
        enableSample: item.enable_sample ?? item.enableSample ?? true,
        sampleStartPage: item.sample_start_page ?? item.sampleStartPage ?? 1,
        sampleEndPage: item.sample_end_page ?? item.sampleEndPage ?? 3,
        createdAt: item.created_at || item.createdAt || new Date().toISOString()
      }));
      localStorage.setItem(STORAGE_KEYS.EBOOKS, JSON.stringify(remoteEbooks));
      return remoteEbooks;
    } else {
      // Auto-seed table if empty or non-existent
      for (const eb of DEFAULT_EBOOKS) {
        try {
          await supabase.from('ebooks').upsert({
            id: eb.id,
            title: eb.title,
            subtitle: eb.subtitle,
            cover_image: eb.coverImage,
            pdf_url: eb.pdfUrl,
            pdf_path: eb.pdfPath || '',
            description: eb.description,
            cosmofeed_url: eb.cosmofeedUrl,
            active: eb.active,
            enable_sample: eb.enableSample ?? true,
            sample_start_page: eb.sampleStartPage ?? 1,
            sample_end_page: eb.sampleEndPage ?? 3,
            created_at: eb.createdAt
          }, { onConflict: 'id' });
        } catch {
          // ignore
        }
      }
      return DEFAULT_EBOOKS;
    }
  } catch (err) {
    console.error('Error fetching ebooks from Supabase, using fallback:', err);
    return getStoredEBooks();
  }
}

export async function saveEBooks(ebooks: EBook[]) {
  localStorage.setItem(STORAGE_KEYS.EBOOKS, JSON.stringify(ebooks));
  const supabase = getSupabaseClient();
  if (supabase) {
    for (const eb of ebooks) {
      try {
        await supabase.from('ebooks').upsert({
          id: eb.id,
          title: eb.title,
          subtitle: eb.subtitle,
          cover_image: eb.coverImage,
          pdf_url: eb.pdfUrl,
          pdf_path: eb.pdfPath || '',
          description: eb.description,
          cosmofeed_url: eb.cosmofeedUrl,
          active: eb.active,
          enable_sample: eb.enableSample ?? true,
          sample_start_page: eb.sampleStartPage ?? 1,
          sample_end_page: eb.sampleEndPage ?? 3,
          created_at: eb.createdAt
        }, { onConflict: 'id' });
      } catch (err) {
        console.error('Supabase ebook upsert error:', err);
      }
    }
  }
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
  return customers.map(c => isAdminEmail(c.email) ? { ...c, name: 'Adinath' } : c);
}

export async function fetchAndSyncCustomers(): Promise<Customer[]> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return getStoredCustomers();
  }

  try {
    const { data, error } = await supabase.from('customers').select('*');
    if (!error && data && data.length > 0) {
      const remoteCustomers: Customer[] = data.map((item: any) => ({
        id: item.id,
        email: item.email,
        name: item.name,
        activeSessionId: item.active_session_id || item.activeSessionId,
        notes: item.notes,
        createdAt: item.created_at || item.createdAt || new Date().toISOString()
      }));
      for (const adm of ADMIN_EMAILS) {
        if (!remoteCustomers.some(c => c.email.toLowerCase() === adm.toLowerCase())) {
          remoteCustomers.unshift({
            id: 'cust-admin-' + Math.random().toString(36).substring(2),
            email: adm,
            name: 'Adinath',
            activeSessionId: 'session-admin',
            notes: 'Platform Administrator',
            createdAt: new Date().toISOString()
          });
        }
      }
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(remoteCustomers));
      return remoteCustomers;
    }
  } catch (err) {
    console.error('Error fetching customers from Supabase:', err);
  }
  return getStoredCustomers();
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
    if (isAdminEmail(user.email)) {
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
