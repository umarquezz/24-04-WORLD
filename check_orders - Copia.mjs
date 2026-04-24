import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jehsbtdjlehjveatabpa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplaHNidGRqbGVoanZlYXRhYnBhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDM2NDQ1OCwiZXhwIjoyMDg5OTQwNDU4fQ.g4zlPQORtCF0hZwsSOFRbLo1vUpN_NcYfVIR_isRpog';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkOrders() {
  const { data: orders } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(3);
  console.log(JSON.stringify(orders, null, 2));
}

checkOrders();
