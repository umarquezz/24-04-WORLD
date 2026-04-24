'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { User } from '@supabase/supabase-js'

import { HeroBanner } from '@/components/HeroBanner'
import { ProductCard } from '@/components/ProductCard'
import { TestimonialsSection } from '@/components/Testimonials'

interface Product {
  id: string
  name: string
  description: string
  price_brl: number
  active: boolean
  image_url?: string | null
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [promoProducts, setPromoProducts] = useState<Product[]>([])
  const [heroData, setHeroData] = useState<any>(null)
  const [user, setUser] = useState<User | null>(null)
  
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null))
    
    // Fetch Settings
    supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'hero_banner')
      .single()
      .then(({ data }) => setHeroData(data?.value))

    // Fetch All Products (Original logic)
    fetch('/api/products')
      .then(r => r.json())
      .then(setProducts)

    // Fetch Promo Products
    fetch('/api/products?category=promocoes-da-semana')
      .then(r => r.json())
      .then(setPromoProducts)
      .catch(err => console.error('Error fetching promo products:', err))
  }, [])


  return (
    <div className="flex flex-col font-sans">
      
      <main className="flex-1 max-w-7xl mx-auto px-4 w-full py-8">
        <HeroBanner data={heroData} />
        
        {/* Section: Lançamentos */}
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="w-1.5 h-6 bg-accent rounded-full inline-block"></span>
            Lançamentos e Destaques
          </h2>
          <div className="hidden sm:flex flex-wrap gap-2">
            <button className="px-4 py-1.5 rounded-full bg-primary/20 text-primary border border-primary/50 text-sm font-medium">Todos</button>
            <button className="px-4 py-1.5 rounded-full text-white/50 hover:bg-white/5 hover:text-white transition text-sm font-medium">Steam Keys</button>
            <button className="px-4 py-1.5 rounded-full text-white/50 hover:bg-white/5 hover:text-white transition text-sm font-medium">Contas Premium</button>
            <button className="px-4 py-1.5 rounded-full text-white/50 hover:bg-white/5 hover:text-white transition text-sm font-medium">Genshin Impact</button>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-16">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-[280px] sm:h-[340px] bg-white/5 animate-pulse rounded-xl border border-white/5"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 mb-16">
            {products.map((p, idx) => (
              <ProductCard 
                key={p.id} 
                product={p} 
                index={idx}
              />
            ))}
          </div>
        )}

        {/* Section: Promoções da Semana */}
        {promoProducts.length > 0 && (
          <div id="promocoes" className="space-y-8 animate-in fade-in duration-700 delay-300">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span className="w-1.5 h-6 bg-emerald-500 rounded-full inline-block"></span>
                Promoções da Semana
              </h2>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full uppercase tracking-widest animate-pulse">
                Ofertas Ativas
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {promoProducts.map((p, idx) => (
                <ProductCard 
                  key={p.id} 
                  product={p} 
                  index={idx}
                />
              ))}
            </div>
          </div>
        )}

        {/* Section: Depoimentos */}
        <div className="mt-16">
          <TestimonialsSection />
        </div>
      </main>
    </div>
  )
}
