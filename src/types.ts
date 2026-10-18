export interface EBook {
  id: string;
  title: string;
  subtitle: string;
  coverImage: string;
  pdfUrl: string;
  description: string;
  cosmofeedUrl: string;
  active: boolean;
  enableSample?: boolean;
  samplePages?: number;
  createdAt: string;
}

export interface Customer {
  id: string;
  email: string;
  name?: string;
  activeSessionId?: string;
  notes?: string;
  createdAt: string;
}

export interface AccessGrant {
  id: string;
  customerId: string;
  ebookId: string;
  grantedAt: string;
}

export interface ReadingProgress {
  id: string;
  customerId: string;
  ebookId: string;
  lastPage: number;
  totalPages: number;
  updatedAt: string;
}

export interface Bookmark {
  id: string;
  customerId: string;
  ebookId: string;
  pageNumber: number;
  note?: string;
  createdAt: string;
}

export interface PromoBanner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  linkUrl: string;
  buttonText: string;
  badgeText?: string;
  active: boolean;
  createdAt: string;
}

export type AppView = 'library' | 'reader' | 'admin';
