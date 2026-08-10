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
  try {
    // 1. Find all voided sales
    const { data: sales, error: salesErr } = await supabase
      .from('sales')
      .select('id')
      .eq('payment_status', 'VOIDED');
      
    if (salesErr) throw salesErr;
    const voidedSaleIds = sales?.map(s => s.id) || [];
    console.log(`Found ${voidedSaleIds.length} voided sales.`);
    
    if (voidedSaleIds.length > 0) {
      // 2. Find all serials in the sale_items of those voided sales
      const { data: items, error: itemsErr } = await supabase
        .from('sale_items')
        .select('serials')
        .in('sale_id', voidedSaleIds);
        
      if (itemsErr) throw itemsErr;
      
      let orphanedSerials = [];
      items?.forEach(r => {
         if (r.serials && Array.isArray(r.serials)) {
           orphanedSerials.push(...r.serials);
         }
      });
      
      console.log(`Found ${orphanedSerials.length} serials attached to voided sales.`);
      console.log(orphanedSerials);
      
      if (orphanedSerials.length > 0) {
        // 3. Force update their status to VOID in item_units
        const { error: updateErr, data: updated } = await supabase
          .from('item_units')
          .update({ status: 'VOID' })
          .in('serial_barcode', orphanedSerials)
          .neq('status', 'VOID')
          .select();
          
        if (updateErr) throw updateErr;
        console.log(`Fixed ${updated?.length || 0} orphaned serials to VOID.`);
      }
    }
  } catch (e) {
    console.error("Error:", e);
  }
}
run();
