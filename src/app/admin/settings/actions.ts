'use server'
import { supabaseAdmin } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export async function getSiteSettings(key: string) {
  const supabase = supabaseAdmin()
  const { data } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', key)
    .single()
  
  return data?.value || null
}

export async function updateSiteSettings(key: string, value: any) {
  const supabase = supabaseAdmin()
  const { error } = await supabase
    .from('site_settings')
    .upsert({ key, value, updated_at: new Date().toISOString() })
  
  if (error) throw new Error(error.message)
  
  revalidatePath('/')
  revalidatePath('/admin/settings')
  return { success: true }
}
