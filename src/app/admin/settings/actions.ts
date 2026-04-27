'use server'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import efi from '@/lib/efi'

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

export async function setupEfiWebhook() {
  try {
    const headerList = await headers()
    const host = headerList.get('host')
    const protocol = headerList.get('x-forwarded-proto') || 'https'
    
    // Constrói a URL do webhook baseada no domínio atual do site
    const webhookUrl = `${protocol}://${host}/api/webhook/efi`
    const pixKey = process.env.EFI_PIX_KEY

    if (!pixKey) {
      return { success: false, error: 'Variável EFI_PIX_KEY não configurada no servidor.' }
    }

    console.log(`[Admin] Tentando registrar webhook: ${webhookUrl} para a chave ${pixKey}`)

    const params = { chave: pixKey.trim() }
    const body = { webhookUrl }

    // @ts-ignore
    await efi.pixConfigWebhook(params, body)

    return { success: true, url: webhookUrl }
  } catch (error: any) {
    console.error('[Admin] Erro ao configurar webhook:', error)
    return { 
      success: false, 
      error: typeof error === 'string' ? error : (error.message || 'Erro desconhecido na API da Efí') 
    }
  }
}
