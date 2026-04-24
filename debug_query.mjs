import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jehsbtdjlehjveatabpa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplaHNidGRqbGVoanZlYXRhYnBhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDM2NDQ1OCwiZXhwIjoyMDg5OTQwNDU4fQ.g4zlPQORtCF0hZwsSOFRbLo1vUpN_NcYfVIR_isRpog';
const admin = createClient(supabaseUrl, supabaseKey);

async function check() {
  const email = 'kauamanero@gmail.com';
  console.log("Checking for exactly:", `"${email}"`);
  
  const { data: orders, error } = await admin
    .from('orders')
    .select(`
      id, created_at, status, buyer_email,
      products (name), 
      credentials (type, email, password, key_value)
    `)
    .eq('buyer_email', email)
    .eq('status', 'paid')
    .order('created_at', { ascending: false });
    
  console.log("Query Results:", JSON.stringify({ orders, error }, null, 2));
}
check();
