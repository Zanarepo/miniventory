export interface Customer {
  id: string;
  business_id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  balance: number;
  created_at?: string;
}

export type InsertCustomer = Omit<Customer, 'id' | 'business_id' | 'balance' | 'created_at'>;
