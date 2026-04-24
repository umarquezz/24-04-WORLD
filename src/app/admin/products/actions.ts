'use server'
import { supabaseAdmin } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export async function saveProduct(formData: FormData) {
  const supabase = supabaseAdmin()
  
  const id = formData.get('id') as string | null
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const price_brl = Math.round(parseFloat(formData.get('price') as string) * 100)
  const price_original_brl = formData.get('price_original') 
    ? Math.round(parseFloat(formData.get('price_original') as string) * 100) 
    : null
  const status = formData.get('status') as string
  const image_url = formData.get('image_url') as string
  const categories = JSON.parse(formData.get('categories') as string || '[]') as string[]
  const platforms = JSON.parse(formData.get('platforms') as string || '[]') as string[]

  let productId = id

  const productData = {
    name,
    description,
    price_brl,
    price_original_brl,
    status,
    image_url,
    platforms
  }

  if (id) {
    // Update
    const { error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', id)
    
    if (error) throw new Error(error.message)
  } else {
    // Create
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single()
    
    if (error) throw new Error(error.message)
    productId = data.id
  }

  // Update Categories (N:N)
  if (productId) {
    // Clear existing
    await supabase
      .from('product_categories')
      .delete()
      .eq('product_id', productId)
    
    // Insert new
    if (categories.length > 0) {
      const categoryRelations = categories.map(catId => ({
        product_id: productId,
        category_id: catId
      }))
      await supabase.from('product_categories').insert(categoryRelations)
    }
  }

  revalidatePath('/admin/products')
  return { success: true, id: productId }
}

export async function deleteProduct(id: string) {
  const supabase = supabaseAdmin()
  
  // Check if there are orders for this product
  const { count, error: countError } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('product_id', id)
  
  if (countError) throw new Error(countError.message)
  
  if (count && count > 0) {
    throw new Error('Não é possível excluir um produto que já possui vendas. Tente desativá-lo em vez disso.')
  }

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
  
  if (error) throw new Error(error.message)
  
  revalidatePath('/admin/products')
  return { success: true }
}

export async function updateProductStatus(id: string, status: 'active' | 'inactive') {
  const supabase = supabaseAdmin()
  const { error } = await supabase
    .from('products')
    .update({ status })
    .eq('id', id)
  
  if (error) throw new Error(error.message)
  
  revalidatePath('/admin/products')
  revalidatePath('/') // Also revalidate homepage to reflect changes
  return { success: true }
}
