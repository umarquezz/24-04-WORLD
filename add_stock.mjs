import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jehsbtdjlehjveatabpa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplaHNidGRqbGVoanZlYXRhYnBhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDM2NDQ1OCwiZXhwIjoyMDg5OTQwNDU4fQ.g4zlPQORtCF0hZwsSOFRbLo1vUpN_NcYfVIR_isRpog';
const supabase = createClient(supabaseUrl, supabaseKey);

async function addStock() {
  const { data: products } = await supabase.from('products').select('*').eq('active', true);
  
  if (!products || products.length === 0) {
    console.log('Nenhum produto ativo encontrado para adicionar estoque.');
    return;
  }

  const productId = products[0].id;
  console.log(`Adicionando estoque para o produto: ${products[0].name}`);

  const { error } = await supabase.from('credentials').insert({
    product_id: productId,
    type: 'account',
    email: 'teste@exemplo.com ' + Math.floor(Math.random() * 1000),
    password: 'senha_super_secreta_' + Math.floor(Math.random() * 1000),
    sold: false
  });

  if (error) {
    console.error('Erro ao adicionar estoque:', error);
  } else {
    console.log('Estoque adicionado com sucesso!');
  }
}

addStock();
