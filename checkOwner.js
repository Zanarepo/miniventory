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
      const res = await client.query(`SELECT tableowner FROM pg_tables WHERE tablename = 'item_units';`);
      console.log("Table owner is:", res.rows[0]?.tableowner);
      await client.end();
    } catch (e) {
      console.error("Error:", e);
      client.end();
    }
  }
  run();
}
