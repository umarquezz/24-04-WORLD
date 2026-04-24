import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jehsbtdjlehjveatabpa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplaHNidGRqbGVoanZlYXRhYnBhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDM2NDQ1OCwiZXhwIjoyMDg5OTQwNDU4fQ.g4zlPQORtCF0hZwsSOFRbLo1vUpN_NcYfVIR_isRpog';
const admin = createClient(supabaseUrl, supabaseKey);

async function updatePrice() {
  const { data, error } = await admin
    .from('products')
    .update({ price_brl: 300 }) // 3 reais em centavos = 300
    .gt('price_brl', 0);
    
  if (error) {
    console.error('Erro ao atualizar preços:', error);
  } else {
    console.log('Preços atualizados para R$ 3,00 com sucesso!');
  }
}

updatePrice();
