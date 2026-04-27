'use client'
import { useState, useEffect } from 'react'
import { Copy, QrCode, CheckCircle2, ShieldCheck, Loader2, X, Info, ArrowRight, Gamepad2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Credential {
  type: 'account' | 'key'
  email?: string
  password?: string
  key_value?: string
}

interface PurchaseSectionProps {
  product: any
  user: any
  supabase: any
  className?: string
}

export function PurchaseSection({ product, user, supabase, className }: PurchaseSectionProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [orderId, setOrderId] = useState<string | null>(null)
  const [polling, setPolling] = useState(false)
  const [pixData, setPixData] = useState<{ qrCode: string, payload: string } | null>(null)
  
  const [credential, setCredential] = useState<Credential | null>(null)
  const [email, setEmail] = useState('')
  const [copied, setCopied] = useState<string | null>(null)
  const [checkingOrder, setCheckingOrder] = useState(true)

  // Verificar se já existe um pedido pago para este produto ao carregar
  useEffect(() => {
    async function checkExisting() {
      if (!user) {
        setCheckingOrder(false)
        return
      }
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('id, status, credential_id')
          .eq('user_id', user.id)
          .eq('product_id', product.id)
          .eq('status', 'paid')
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (data && data.credential_id) {
          // Buscar a credencial
          const { data: cred } = await supabase
            .from('credentials')
            .select('type, email, password, key_value')
            .eq('id', data.credential_id)
            .single()
          
          if (cred) setCredential(cred)
        }
      } catch (err) {
        console.error('Erro ao verificar pedido existente:', err)
      } finally {
        setCheckingOrder(false)
      }
    }
    checkExisting()
  }, [product.id, user, supabase])

  // Polling para verificar pagamento
  useEffect(() => {
    if (!orderId || !polling) return
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/order-status/${orderId}`)
        const data = await res.json()
        if (data.status === 'paid' && data.credential) {
          setCredential(data.credential)
          setPolling(false)
          setPixData(null)
        }
      } catch (err) { }
    }, 3000)
    return () => clearInterval(interval)
  }, [orderId, polling])

  const handleBuy = async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: product.id }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.details ? `${data.error}: ${JSON.stringify(data.details)}` : data.error || 'Erro ao criar pedido')
      } else {
        setOrderId(data.order_id)
        setPixData({
          qrCode: data.qr_code_image,
          payload: data.pix_payload
        })
        setPolling(true)
      }
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
    })
    if (error) setError(error.message)
    else setError('Link mágico enviado! Verifique seu e-mail para confirmar.')
    setLoading(false)
  }

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  // --- UI DE SUCESSO (PÓS-PAGAMENTO) ---
  if (credential) {
    return (
      <div className={cn("bg-green-500/5 border border-green-500/20 rounded-2xl p-6 sm:p-8 text-center animate-in zoom-in-95 duration-500", className)}>
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
          <CheckCircle2 size={32} className="text-green-400" />
        </div>
        
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Muito obrigado pela compra!</h2>
        <p className="text-white/50 text-xs sm:text-sm mb-6">Seu pagamento foi confirmado e seu produto já está disponível abaixo.</p>

        <div className="bg-black/40 rounded-xl p-4 sm:p-6 border border-white/5 text-left mb-8 shadow-inner">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
            <Gamepad2 size={16} className="text-accent" />
            <span className="text-[10px] text-white/60 uppercase tracking-widest font-bold">Dados de Acesso</span>
          </div>

          {credential.type === 'account' ? (
            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-white/40 uppercase tracking-widest block mb-1">E-mail</label>
                <div className="flex bg-white/5 border border-white/10 rounded-lg overflow-hidden group focus-within:border-accent/30 transition">
                  <span className="px-3 py-2.5 text-white font-mono text-sm flex-1 truncate">{credential.email}</span>
                  <button onClick={() => copy(credential.email!, 'email')} className="px-4 hover:bg-white/10 transition text-accent border-l border-white/10">
                    {copied === 'email' ? 'Copiado!' : <Copy size={14} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-[10px] text-white/40 uppercase tracking-widest block mb-1">Senha</label>
                <div className="flex bg-white/5 border border-white/10 rounded-lg overflow-hidden group focus-within:border-accent/30 transition">
                  <span className="px-3 py-2.5 text-white font-mono text-sm flex-1 truncate">{credential.password}</span>
                  <button onClick={() => copy(credential.password!, 'pass')} className="px-4 hover:bg-white/10 transition text-accent border-l border-white/10">
                    {copied === 'pass' ? 'Copiado!' : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className="text-[10px] text-white/40 uppercase tracking-widest block mb-1">Key / Chave / Link</label>
              <div className="flex bg-white/5 border border-white/10 rounded-lg overflow-hidden group focus-within:border-accent/30 transition">
                <span className="px-3 py-3.5 text-white font-mono text-xs flex-1 break-all border-r border-white/10 leading-relaxed">{credential.key_value}</span>
                <button onClick={() => copy(credential.key_value!, 'key')} className="px-4 hover:bg-white/10 transition text-accent shrink-0">
                  {copied === 'key' ? 'Copiado!' : <Copy size={14} />}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <a 
            href="/dashboard" 
            className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl transition shadow-lg shadow-primary/20 text-sm flex items-center justify-center gap-2 group"
          >
            ACESSAR MINHAS COMPRAS
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </a>
          <p className="text-[10px] text-white/30 uppercase tracking-widest font-medium">
            Você também pode acessar seus produtos a qualquer momento pelo menu superior.
          </p>
        </div>
      </div>
    )
  }

  if (checkingOrder) {
    return (
      <div className={cn("bg-white/5 border border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[200px]", className)}>
        <Loader2 className="animate-spin text-accent mb-4" size={32} />
        <p className="text-white/50 text-xs uppercase tracking-widest font-bold">Verificando status...</p>
      </div>
    )
  }

  return (
    <div className={cn("bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col", className)}>
      <div className="flex justify-between items-center mb-8">
        <div className="flex flex-col">
          <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">Preço Atual</span>
          <span className="text-3xl font-black text-white">
            R$ {(product.price_brl / 100).toFixed(2).replace('.', ',')}
          </span>
        </div>
        {product.price_original_brl && (
          <span className="bg-orange-600/20 text-orange-500 border border-orange-600/30 font-bold px-3 py-1.5 rounded-lg text-xs">
            -{Math.round((1 - product.price_brl / product.price_original_brl) * 100)}% OFF
          </span>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-[11px] mb-6 text-center">
          {error}
        </div>
      )}

      {user ? (
        <button
          onClick={handleBuy}
          disabled={loading}
          className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl transition disabled:opacity-50 shadow-xl shadow-primary/20 text-sm flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : 'Comprar agora'}
        </button>
      ) : (
        <form onSubmit={handleAuth} className="space-y-5">
          <div className="bg-accent/5 border border-accent/10 rounded-xl p-4 flex gap-3 items-center">
            <ShieldCheck size={20} className="text-accent shrink-0" />
            <p className="text-[11px] text-white/60 leading-tight">
              Acesse sua conta para processar o pagamento e vincular o item ao seu histórico.
            </p>
          </div>
          <div className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white text-sm focus:outline-none focus:border-accent transition"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black hover:bg-gray-100 font-bold py-4 rounded-xl transition disabled:opacity-50 text-sm shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin text-black" size={18} /> : 'Entrar para Comprar'}
            </button>
          </div>
        </form>
      )}

      {/* --- MODAL DE PIX (SOBREPOSIÇÃO) --- */}
      {pixData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#0c0c0e] border border-white/10 rounded-3xl w-full max-w-md p-6 sm:p-8 relative shadow-2xl animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => { setPixData(null); setPolling(false); }}
              className="absolute top-4 right-4 text-white/30 hover:text-white transition"
            >
              <X size={24} />
            </button>

            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-widest mb-4">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                </span>
                Aguardando Pagamento
              </div>
              <h3 className="text-xl font-bold text-white">Pagamento via PIX</h3>
              <p className="text-white/50 text-sm mt-1">Escaneie o código ou copie a chave abaixo</p>
            </div>

            {/* QR Code */}
            <div className="bg-white p-4 rounded-2xl mx-auto w-fit mb-6 shadow-lg shadow-black/50 border-4 border-white/5">
              <img src={pixData.qrCode} alt="QR Code PIX" className="w-48 h-48 sm:w-56 sm:h-56" />
            </div>

            {/* Valor */}
            <div className="flex justify-between items-center mb-6 px-2">
              <span className="text-white/40 text-sm">Valor Total</span>
              <span className="text-white text-xl font-black">R$ {(product.price_brl / 100).toFixed(2).replace('.', ',')}</span>
            </div>

            {/* Copia e Cola */}
            <div className="space-y-3">
              <label className="text-[10px] text-white/30 uppercase tracking-widest font-bold ml-1">Código Pix Copia e Cola</label>
              <div className="flex bg-white/5 border border-white/10 rounded-xl overflow-hidden focus-within:border-accent/50 transition">
                <input 
                  readOnly 
                  value={pixData.payload}
                  className="bg-transparent px-4 py-3 text-white text-xs flex-1 outline-none font-mono truncate"
                />
                <button 
                  onClick={() => copy(pixData.payload, 'pix')}
                  className="bg-accent hover:bg-accent-hover text-black px-4 transition flex items-center justify-center"
                >
                  {copied === 'pix' ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                </button>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <button 
                onClick={async () => {
                  setLoading(true);
                  try {
                    const res = await fetch(`/api/order-status/${orderId}`);
                    const data = await res.json();
                    if (data.status === 'paid') {
                      if (data.credential) {
                        setCredential(data.credential);
                        setPolling(false);
                        setPixData(null);
                      } else {
                        setError("Pagamento confirmado, mas estamos finalizando a entrega do seu item. Aguarde um instante...");
                      }
                    } else {
                      // Opcional: mostrar um toast ou mensagem temporária
                    }
                  } catch (err) {}
                  setLoading(false);
                }}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 text-xs font-bold hover:bg-white/10 hover:text-white transition flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                JÁ PAGUEI, VERIFICAR AGORA
              </button>

              <div className="flex items-start gap-3 bg-white/5 p-4 rounded-xl border border-white/5">
                <Info size={18} className="text-accent shrink-0 mt-0.5" />
                <p className="text-[11px] text-white/40 leading-relaxed">
                  Após o pagamento, não feche esta página. O sistema detectará o recebimento e entregará seu produto automaticamente em alguns segundos.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <p className="mt-6 text-[10px] text-white/20 text-center uppercase tracking-widest font-bold">
        Compra 100% Segura • Entrega Automática
      </p>
    </div>
  )
}
