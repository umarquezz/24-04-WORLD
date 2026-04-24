import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('Webhook recebido:', JSON.stringify(body, null, 2))

    // Amplo Pay envia: { event: 'TRANSACTION_PAID', transaction: { id, status, externalId, ... } }
    const event = body.event
    const transaction = body.transaction || body

    // Só processar pagamentos confirmados
    if (event !== 'TRANSACTION_PAID' && transaction?.status !== 'COMPLETED') {
      return NextResponse.json({ received: true })
    }

    const externalId = transaction?.externalId || transaction?.external_id
    const transactionId = transaction?.id

    if (!externalId) {
      console.error('Webhook sem externalId')
      return NextResponse.json({ error: 'externalId não encontrado' }, { status: 400 })
    }

    const admin = supabaseAdmin()

    // Buscar o pedido pelo externalId (que é o order.id)
    const { data: order, error: orderError } = await admin
      .from('orders')
      .select('*')
      .eq('id', externalId)
      .single()

    if (orderError || !order) {
      console.error('Pedido não encontrado:', externalId)
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
    }

    if (order.status === 'paid') {
      // Já processado
      return NextResponse.json({ received: true })
    }

    // Usar a credencial já reservada para este pedido
    if (!order.credential_id) {
      console.error('Pedido sem credencial reservada:', order.id)
      return NextResponse.json({ error: 'Erro de reserva' }, { status: 500 })
    }

    const { data: credential, error: credError } = await admin
      .from('credentials')
      .select('*')
      .eq('id', order.credential_id)
      .single()

    if (credError || !credential) {
      console.error('Credencial reservada não encontrada:', order.credential_id)
      return NextResponse.json({ error: 'Erro de sistema' }, { status: 500 })
    }


    // Marcar credencial como vendida
    await admin
      .from('credentials')
      .update({ sold: true })
      .eq('id', credential.id)
 
    // Atualizar pedido como pago
    await admin
      .from('orders')
      .update({
        status: 'paid',
        amplo_transaction_id: transactionId || order.amplo_transaction_id,
        paid_at: new Date().toISOString(),
      })
      .eq('id', order.id)


    console.log(`Pedido ${order.id} pago. Credencial ${credential.id} entregue.`)
    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Webhook error:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
