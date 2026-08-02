/**
 * Data architecture for BizTrack Business entities and settings.
 * Every user in Sprint 1 owns one business that all future financial records (inventory, sales, expenses) will reference.
 */
export interface Business {
  id: string;
  owner_id: string;
  business_name: string;
  business_category: string;
  phone?: string;
  email?: string;
  address?: string;
  country: string;
  currency: string;
  language: string;
  logo_url?: string;
  created_at?: string;
  updated_at?: string;
}

export type BusinessCategory =
  | 'Retail'
  | 'Wholesale'
  | 'Restaurant'
  | 'Pharmacy'
  | 'Provision Store'
  | 'Fashion'
  | 'Agriculture'
  | 'Manufacturing'
  | 'Salon'
  | 'Transport'
  | 'Electronics'
  | 'Services'
  | 'Others';

export interface CurrencyOption {
  code: string;
  symbol: string;
  name: string;
  country: string;
}
