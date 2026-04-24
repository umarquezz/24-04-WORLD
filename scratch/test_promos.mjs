import { supabaseAdmin } from '../src/lib/supabase.mjs'

async function testPromos() {
  const supabase = supabaseAdmin()
  
  // 1. Pegar o ID da categoria de promoções
  const { data: cat } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', 'promocoes-da-semana')
    .single()
  
  if (!cat) {
    console.error('Categoria de promoções não encontrada')
    return
  }

  // 2. Pegar um produto qualquer
  const { data: prod } = await supabase
    .from('products')
    .select('id')
    .limit(1)
    .single()

  if (!prod) {
    console.error('Nenhum produto encontrado')
    return
  }

  // 3. Associar
  const { error } = await supabase
    .from('product_categories')
    .upsert({
      product_id: prod.id,
      category_id: cat.id
    })

  if (error) {
    console.error('Erro ao associar:', error.message)
  } else {
    console.log('Sucesso! O produto agora está na seção de promoções.')
  }
}

testPromos()
