import type { BusinessCategory, CurrencyOption } from '../types/business';

export const BUSINESS_CATEGORIES: { value: BusinessCategory; label: string; icon: string }[] = [
  { value: 'Provision Store', label: 'Provision Store & Kiosk', icon: '🛒' },
  { value: 'Retail', label: 'General Retail & Superstore', icon: '🛍️' },
  { value: 'Wholesale', label: 'Wholesale & Distribution', icon: '📦' },
  { value: 'Pharmacy', label: 'Pharmacy & Drug Store', icon: '💊' },
  { value: 'Restaurant', label: 'Restaurant, Food & Eatery', icon: '🍽️' },
  { value: 'Fashion', label: 'Fashion, Tailoring & Boutique', icon: '👗' },
  { value: 'Agriculture', label: 'Agriculture & Farm Produce', icon: '🌾' },
  { value: 'Salon', label: 'Salon, Barbershop & Beauty', icon: '💈' },
  { value: 'Electronics', label: 'Electronics & Mobile Phones', icon: '📱' },
  { value: 'Transport', label: 'Logistics, Taxi & Transport', icon: '🚚' },
  { value: 'Manufacturing', label: 'Manufacturing & Production', icon: '⚙️' },
  { value: 'Services', label: 'Professional & Consulting Services', icon: '💼' },
  { value: 'Others', label: 'Other Commercial Trade', icon: '🏪' },
];

export const SUPPORTED_CURRENCIES: CurrencyOption[] = [
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', country: 'Nigeria' },
  { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi', country: 'Ghana' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', country: 'Kenya' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', country: 'South Africa' },
  {
    code: 'XOF',
    symbol: 'CFA',
    name: 'West African CFA Franc',
    country: "Cote d'Ivoire / Senegal",
  },
  { code: 'XAF', symbol: 'FCFA', name: 'Central African CFA Franc', country: 'Cameroon / Gabon' },
  { code: 'TZS', symbol: 'TSh', name: 'Tanzanian Shilling', country: 'Tanzania' },
  { code: 'UGX', symbol: 'USh', name: 'Ugandan Shilling', country: 'Uganda' },
  { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound', country: 'Egypt' },
  { code: 'RWF', symbol: 'FRw', name: 'Rwandan Franc', country: 'Rwanda' },
  { code: 'USD', symbol: '$', name: 'United States Dollar', country: 'International' },
];

export const DEFAULT_COUNTRY = 'Nigeria';
export const DEFAULT_CURRENCY = 'NGN';
