'use client'
import { useState, useEffect, use } from 'react'
import { createClient } from '@/utils/supabase/client'
import { User } from '@supabase/supabase-js'
import { 
  Gamepad2, 
  Timer, 
  ArrowLeft, 
  ShieldCheck, 
  Zap, 
  Info,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'
import { PurchaseSection } from '@/components/PurchaseSection'
import { cn } from '@/lib/utils'

interface Product {
  id: string
  name: string
  description: string
  price_brl: number
  price_original_brl?: number
  image_url?: string | null
  platforms?: string[]
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [product, setProduct] = useState<Product | null>(null)
  const [stockCount, setStockCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  
  const supabase = createClient()

  useEffect(() => {
    // Auth Check
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null))

    // Fetch Product & Stock
    const fetchData = async () => {
      try {
        // Product Details
        const { data: prod, error: pErr } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single()
        
        if (pErr) throw pErr
        setProduct(prod)

        // Stock Count (Unsold and Unreserved)
        const { data: count, error: cErr } = await supabase
          .rpc('get_stock_count', { p_product_id: id })
        
        if (!cErr) setStockCount(count ?? 0)

      } catch (err) {
        console.error('Error fetching product:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Realtime Subscription for Stock Updates
    const channel = supabase
      .channel(`stock-${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'credentials',
          filter: `product_id=eq.${id}`
        },
        () => {
          console.log('Stock changed, refetching...')
          fetchData()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }

  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-4">
        <AlertTriangle size={48} className="text-orange-500 mb-4" />
        <h1 className="text-2xl font-bold">Produto não encontrado</h1>
        <p className="text-white/50 mt-2">O item que você procura não existe ou foi removido.</p>
        <Link href="/" className="mt-8 bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-hover transition">
          Voltar para a Loja
        </Link>
      </div>
    )
  }

  const isOutOfStock = stockCount === 0

  return (
    <div className="min-h-screen bg-[#020617] text-white pb-20">
      {/* Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        
        {/* Breadcrumbs & Navigation */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            href="/" 
            className="flex items-center gap-2 text-white/40 hover:text-white transition group"
          >
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition">
              <ArrowLeft size={16} />
            </div>
            <span className="text-sm font-medium">Voltar para a loja</span>
          </Link>
          <div className="h-4 w-[1px] bg-white/10 hidden sm:block"></div>
          <div className="hidden sm:flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-white/20">
            <span>Loja</span>
            <span className="text-white/10">/</span>
            <span className="text-white/40 truncate max-w-[150px]">{product.name}</span>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12 items-start">
          
          {/* Left Side: Media & Details */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-8">
            
            {/* Image Section */}
            <div className="relative aspect-video sm:aspect-[16/9] rounded-3xl overflow-hidden bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/10 group">
              {product.image_url ? (
                <img 
                  src={product.image_url} 
                  alt={product.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center">
                  <Gamepad2 size={80} className="text-white/10 mb-6" />
                  <h3 className="text-3xl sm:text-5xl font-black italic uppercase tracking-tighter opacity-20 transform -rotate-3 leading-none">
                    {product.name}
                  </h3>
                </div>
              )}
              
              {/* Floating Badges */}
              <div className="absolute top-6 left-6 flex flex-wrap gap-2">
                {product.platforms?.map((plat) => (
                  <span key={plat} className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-[10px] font-black uppercase tracking-widest text-white shadow-xl">
                    {plat}
                  </span>
                ))}
              </div>

              {/* Special Status (Instant Delivery) */}
              <div className="absolute bottom-6 right-6">
                <div className="bg-accent/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 text-white flex items-center gap-2 shadow-2xl">
                  <Zap size={16} className="fill-white" />
                  <span className="text-xs font-black uppercase tracking-wider italic">Entrega Instantânea</span>
                </div>
              </div>
            </div>

            {/* Title & Stats */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  Item Digital
                </span>
                <div className="flex items-center gap-1 text-yellow-500">
                  <CheckCircle size={14} className="fill-yellow-500/20" />
                  <span className="text-xs font-bold">Verificado</span>
                </div>
              </div>
              <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tighter leading-[0.9]">
                {product.name}
              </h1>
              {stockCount !== null && (
                <div className="flex items-center gap-2 mt-4">
                  <div className={cn(
                    "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border",
                    stockCount > 5 
                      ? "bg-green-500/10 text-green-400 border-green-500/20" 
                      : stockCount > 0 
                        ? "bg-orange-500/10 text-orange-400 border-orange-500/20" 
                        : "bg-red-500/10 text-red-400 border-red-500/20"
                  )}>
                    {stockCount > 0 ? `${stockCount} unidades em estoque` : 'Sem estoque'}
                  </div>
                </div>
              )}
            </div>


            {/* Description Card */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-10 space-y-6">
              <div className="flex items-center gap-3 border-b border-white/5 pb-6">
                <Info size={24} className="text-accent" />
                <h2 className="text-xl font-bold">Sobre este produto</h2>
              </div>
              <div className="prose prose-invert max-w-none">
                <p className="text-lg text-white/70 leading-relaxed whitespace-pre-wrap">
                  {product.description || 'Nenhuma descrição detalhada disponível ainda.'}
                </p>
              </div>
              
              {/* Features List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-8 border-t border-white/5">
                {[
                  { icon: ShieldCheck, title: "Segurança Garantida", desc: "Processamento criptografado via PIX" },
                  { icon: Zap, title: "Entrega Automática", desc: "Receba seus dados imediatamente após o pagamento" },
                  { icon: Timer, title: "Suporte 24/7", desc: "Estamos aqui para ajudar com qualquer dúvida" },
                  { icon: CheckCircle, title: "Acesso Vitalício", desc: "O item é seu para sempre" }
                ].map((feature, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition group">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all duration-300">
                      <feature.icon size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{feature.title}</h4>
                      <p className="text-xs text-white/40">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side: Purchase Sidebar */}
          <div className="lg:col-span-5 xl:col-span-4 sticky top-8">
            {isOutOfStock ? (
              <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-8 sm:p-10 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-red-500/5 -z-10 animate-pulse"></div>
                <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30">
                  <AlertTriangle size={40} className="text-red-400" />
                </div>
                <h2 className="text-2xl font-black text-white mb-3 uppercase tracking-tighter">Estoque Esgotado</h2>
                <p className="text-white/50 text-sm leading-relaxed mb-8">
                  No momento este item está indisponível. Cadastre seu e-mail para ser avisado quando o estoque for reposto.
                </p>
                <div className="space-y-3">
                  <input 
                    placeholder="Em breve..." 
                    disabled
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white/20 text-sm cursor-not-allowed"
                  />
                  <button disabled className="w-full bg-white/5 text-white/20 border border-white/10 font-bold py-4 rounded-xl text-sm cursor-not-allowed">
                    Me avise
                  </button>
                </div>
              </div>
            ) : (
              <PurchaseSection 
                product={product} 
                user={user} 
                supabase={supabase} 
                className="shadow-2xl shadow-primary/5"
              />
            )}

            {/* Support / Small Stats */}
            <div className="mt-6 px-4 space-y-4">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-white/30">
                <span>Vendedor</span>
                <span className="text-white/60">Level UP Digital</span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-white/30">
                <span>Plataformas</span>
                <div className="flex gap-2">
                  {product.platforms?.slice(0, 3).map(p => (
                    <span key={p} className="text-white/60">{p}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
