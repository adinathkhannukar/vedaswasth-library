import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_CONFIG_KEY = 'veda_swasth_supabase_config';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  bucketName: string;
}

export function getStoredSupabaseConfig(): SupabaseConfig {
  const data = localStorage.getItem(SUPABASE_CONFIG_KEY);
  if (!data) {
    return {
      url: '',
      anonKey: '',
      bucketName: 'secure-ebooks'
    };
  }
  try {
    return JSON.parse(data);
  } catch {
    return {
      url: '',
      anonKey: '',
      bucketName: 'secure-ebooks'
    };
  }
}

export function saveSupabaseConfig(config: SupabaseConfig) {
  localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(config));
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const config = getStoredSupabaseConfig();
  if (!config.url || !config.anonKey) {
    return null;
  }
  if (!supabaseInstance) {
    supabaseInstance = createClient(config.url, config.anonKey);
  }
  return supabaseInstance;
}
