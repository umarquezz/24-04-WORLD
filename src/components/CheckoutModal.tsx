import { useState, useEffect } from 'react'
import { X, Copy, QrCode, CheckCircle2, ShieldCheck, Gamepad2 } from 'lucide-react'

interface Credential {
  type: 'account' | 'key'
  email?: string
  password?: string
  key_value?: string
}

interface CheckoutModalProps {
  product: any
  user: any
  supabase: any
  onClose: () => void
}

export function CheckoutModal({ product, user, supabase, onClose }: CheckoutModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [pixPayload, setPixPayload] = useState<string | null>(null)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [polling, setPolling] = useState(false)
  
  const [credential, setCredential] = useState<Credential | null>(null)
  const [email, setEmail] = useState('')
  const [copied, setCopied] = useState<string | null>(null)

  // Polling
  useEffect(() => {
    if (!orderId || !polling) return
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/order-status/${orderId}`)
        const data = await res.json()
        if (data.status === 'paid' && data.credential) {
          setCredential(data.credential)
          setPolling(false)
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
        setError(data.error || 'Erro ao criar pedido')
      } else {
        setOrderId(data.order_id)
        setPixPayload(data.pix_payload)
        setQrCode(data.qr_code_image)
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
    else setError('Link mágico enviado! Verifique seu e-mail para aprovar o login.')
    setLoading(false)
  }

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[#0B132B] border border-white/10 rounded-2xl w-full max-w-sm sm:max-w-lg overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300">
        {/* Close Button */}
        {!credential && (
          <button onClick={onClose} className="absolute top-3 right-3 text-white/40 hover:text-white bg-white/5 rounded-full p-2 transition z-10">
            <X size={18} />
          </button>
        )}

        {/* --- STAGE 0: CREDENTIAL DELIVERED --- */}
        {credential && (
          <div className="p-5 sm:p-8 text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
              <CheckCircle2 size={32} className="text-green-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Pronto para usar!</h2>
            <p className="text-white/50 text-xs sm:text-sm mb-6">
              Sua compra foi confirmada e salva com sucesso.
            </p>

            <div className="bg-[#040A18] rounded-xl p-4 sm:p-6 border border-white/5 text-left mb-6">
              {credential.type === 'account' ? (
                <div className="space-y-4 text-xs sm:text-sm">
                  <div>
                    <label className="text-[9px] text-white/40 uppercase tracking-widest block mb-1">E-mail</label>
                    <div className="flex bg-white/5 border border-white/10 rounded-lg overflow-hidden">
                      <span className="px-3 py-2 text-white font-mono flex-1 border-r border-white/10 truncate">{credential.email}</span>
                      <button onClick={() => copy(credential.email!, 'email')} className="px-3 hover:bg-white/10 transition text-accent">
                        {copied === 'email' ? '✓' : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-[9px] text-white/40 uppercase tracking-widest block mb-1">Senha</label>
                    <div className="flex bg-white/5 border border-white/10 rounded-lg overflow-hidden">
                      <span className="px-3 py-2 text-white font-mono flex-1 border-r border-white/10 truncate">{credential.password}</span>
                      <button onClick={() => copy(credential.password!, 'pass')} className="px-3 hover:bg-white/10 transition text-accent">
                        {copied === 'pass' ? '✓' : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-[9px] text-white/40 uppercase tracking-widest block mb-1">Link / Key / Chave</label>
                  <div className="flex bg-white/5 border border-white/10 rounded-lg overflow-hidden">
                    <span className="px-3 py-3 text-white font-mono text-xs flex-1 break-all border-r border-white/10">{credential.key_value}</span>
                    <button onClick={() => copy(credential.key_value!, 'key')} className="px-3 hover:bg-white/10 transition text-accent shrink-0">
                      {copied === 'key' ? '✓' : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <button onClick={onClose} className="w-full bg-white text-black font-bold py-3 px-8 rounded-xl hover:bg-gray-200 transition text-sm">
              Fechar e Voltar
            </button>
          </div>
        )}

        {/* --- STAGE 1: WAITING PAYMENT (EFÍ PIX) --- */}
        {!credential && pixPayload && (
          <div className="p-6 sm:p-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-accent/20">
              <QrCode size={28} className="text-accent" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white mb-2">Escaneie o QR Code</h2>
            <p className="text-white/50 text-xs mb-6">
              O seu pedido foi gerado. Assim que o pagamento for confirmado, as credenciais aparecerão aqui!
            </p>
            
            {/* QR Code Image */}
            <div className="bg-white p-3 rounded-2xl inline-block mb-6 shadow-xl shadow-accent/5">
              <img src={qrCode!} alt="PIX QR Code" className="w-48 h-48 sm:w-56 sm:h-56" />
            </div>

            {/* Pix Copia e Cola */}
            <div className="space-y-3 mb-8">
              <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Ou use o Pix Copia e Cola</p>
              <div className="flex bg-black/40 border border-white/10 rounded-xl overflow-hidden backdrop-blur-sm">
                <div className="px-4 py-3.5 text-white/60 font-mono text-[11px] flex-1 truncate text-left">
                  {pixPayload}
                </div>
                <button 
                  onClick={() => copy(pixPayload, 'pix')} 
                  className="px-5 bg-white/5 hover:bg-white/10 transition text-accent border-l border-white/10 active:scale-95 flex items-center justify-center"
                >
                  {copied === 'pix' ? <CheckCircle2 size={16} className="text-green-400" /> : <Copy size={16} />}
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-[10px] text-white/30 bg-black/20 py-2 rounded-lg">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
              Aguardando confirmação do pagamento...
            </div>
          </div>
        )}

        {/* --- STAGE 2: INITIAL CHECKOUT --- */}
        {!credential && !checkoutUrl && (
          <>
            <div className="bg-gradient-to-r from-primary/30 to-accent/10 p-5 sm:p-6 border-b border-white/5">
              <div className="flex gap-4 items-center">
                <div className="w-12 h-16 bg-[#040A18] rounded border border-white/10 flex items-center justify-center shrink-0">
                  <Gamepad2 className="text-accent/50" size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm sm:text-lg leading-tight line-clamp-2">{product.name}</h3>
                  <p className="text-white/40 text-[10px] mt-1 uppercase tracking-widest font-bold">Entrega via PIX</p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <div className="flex justify-between items-center mb-6 bg-black/30 p-4 rounded-xl border border-white/5">
                <span className="text-white/60 text-xs sm:text-sm">Valor total:</span>
                <span className="text-xl sm:text-2xl font-black text-white">
                  R$ {(product.price_brl / 100).toFixed(2).replace('.', ',')}
                </span>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-[11px] mb-5 text-center">
                  {error}
                </div>
              )}

              {user ? (
                <button
                  onClick={handleBuy}
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl transition disabled:opacity-50 shadow-xl shadow-primary/20 text-sm"
                >
                  {loading ? 'Preparando link...' : 'Confirmar e Pagar agora'}
                </button>
              ) : (
                <form onSubmit={handleAuth} className="space-y-4">
                  <div className="text-center mb-4">
                    <ShieldCheck size={20} className="text-accent mx-auto mb-2 opacity-80" />
                    <p className="text-[11px] text-white/50 leading-relaxed">Insira seu e-mail para vincularmos esta compra e garantirmos sua segurança.</p>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="seu@melhor-email.com"
                    className="w-full bg-[#040A18] border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-accent transition shadow-inner"
                    required
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-white text-black hover:bg-gray-100 font-bold py-3.5 rounded-xl transition disabled:opacity-50 text-sm shadow-lg"
                  >
                    {loading ? 'Enviando...' : 'Entrar para Comprar'}
                  </button>
                </form>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
