import { Client } from 'pg';
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

const urlMatch = envVars['VITE_SUPABASE_URL']?.match(/https:\/\/(.*?)\.supabase\.co/);
if (urlMatch && envVars['SUPABASE_DB_PASSWORD']) {
  const projectId = urlMatch[1];
  const password = envVars['SUPABASE_DB_PASSWORD'];
  const connString = `postgresql://postgres.${projectId}:${password}@aws-0-eu-west-2.pooler.supabase.com:6543/postgres`;
  
  const client = new Client({
    connectionString: connString,
    ssl: { rejectUnauthorized: false }
  });

  async function run() {
    try {
      await client.connect();
      
      // 1. Find all voided sales
      const salesRes = await client.query(`SELECT id FROM sales WHERE payment_status = 'VOIDED'`);
      const voidedSaleIds = salesRes.rows.map(r => r.id);
      
      console.log(`Found ${voidedSaleIds.length} voided sales.`);
      
      if (voidedSaleIds.length > 0) {
        // 2. Find all serials in the sale_items of those voided sales
        const itemsRes = await client.query(`
          SELECT serials FROM sale_items 
          WHERE sale_id = ANY($1::uuid[]) AND serials IS NOT NULL
        `, [voidedSaleIds]);
        
        let orphanedSerials = [];
        itemsRes.rows.forEach(r => {
           if (r.serials && Array.isArray(r.serials)) {
             orphanedSerials.push(...r.serials);
           }
        });
        
        console.log(`Found ${orphanedSerials.length} serials attached to voided sales.`);
        
        if (orphanedSerials.length > 0) {
          // 3. Force update their status to VOID in item_units
          const updateRes = await client.query(`
            UPDATE item_units 
            SET status = 'VOID' 
            WHERE serial_barcode = ANY($1::text[]) AND status != 'VOID'
          `, [orphanedSerials]);
          
          console.log(`Fixed ${updateRes.rowCount} orphaned serials to VOID.`);
        }
      }

      await client.end();
    } catch (e) {
      console.error("Error:", e);
      client.end();
    }
  }
  run();
} else {
  console.log("Missing password in env");
}
