import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim().replace(/^"|"$/g, '');
  }
});

const url = envVars['VITE_SUPABASE_URL'];
const key = envVars['SUPABASE_SECRET_KEY'];
const supabase = createClient(url, key);

async function run() {
  const { data, error } = await supabase.rpc('process_offline_sale', { 
    p_sale: { 
      id: '123e4567-e89b-12d3-a456-426614174000', 
      business_id: '123e4567-e89b-12d3-a456-426614174000', 
      receipt_number: 'test', 
      subtotal: 0, 
      total_amount: 0, 
      total_cost: 0, 
      gross_profit: 0, 
      payment_method: 'CASH', 
      created_by: '123e4567-e89b-12d3-a456-426614174000',
      payment_status: 'PAID'
    }, 
    p_sale_items: [{
      id: '123e4567-e89b-12d3-a456-426614174000', 
      product_id: '123e4567-e89b-12d3-a456-426614174000', 
      quantity: 1, 
      unit_cost: 5, 
      selling_price: 10, 
      line_total: 10, 
      line_profit: 5
    }],
    p_sale_payments: []
  });
  console.log("RPC result with valid sale:", { data, error });
}
run();
