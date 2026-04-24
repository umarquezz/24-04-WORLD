import { Gamepad2, Timer } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

// Utilizando temporary placeholders gradients até que o backend envie imagens reais
const gradients = [
  'from-blue-600 to-indigo-900',
  'from-violet-600 to-purple-900',
  'from-emerald-600 to-teal-900',
  'from-cyan-600 to-blue-900',
  'from-fuchsia-600 to-pink-900',
]

interface ProductCardProps {
  product: any
  index: number
}

export function ProductCard({ product, index }: ProductCardProps) {
  // Define um gradiente determinístico com base no índice para simular capas diferentes
  const bgGradient = gradients[index % gradients.length]
  
  // Simular um desconto fixo visual para o design
  const originalPrice = (product.price_original_brl || product.price_brl * 1.3)
  const discountPercent = Math.round((1 - product.price_brl / originalPrice) * 100)

  return (
    <Link 
      href={`/product/${product.id}`}
      className="bg-card border border-card-border rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-300 group shadow-lg flex flex-col cursor-pointer"
    >
      {/* Product Image / Fake Cover */}
      <div className={cn(
        "w-full h-32 sm:h-48 relative flex flex-col items-center justify-center text-center transition-transform group-hover:scale-105 duration-500 overflow-hidden",
        !product.image_url && `bg-gradient-to-br ${bgGradient} p-3`
      )}>
        {product.image_url ? (
          <img 
            src={product.image_url} 
            alt={product.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <h3 className="font-black text-sm sm:text-2xl text-white italic drop-shadow-md leading-tight max-w-[95%] mt-2 sm:mt-4 uppercase tracking-tighter">
            {product.name}
          </h3>
        )}

        {/* Top small bar */}
        <div className="absolute top-0 w-full bg-black/40 py-1 flex justify-center items-center gap-1 z-10">
          <Gamepad2 size={10} className="text-white/70" />
          <span className="text-[8px] sm:text-[10px] text-white/70 font-bold uppercase tracking-wider">Digital Item</span>
        </div>
        
        {/* Dynamically rendered badges for all platforms */}
        <div className="absolute bottom-2 left-2 flex flex-wrap gap-1 z-10">
          {product.stock_count === 0 && (
            <span className="bg-red-600 text-white font-black px-2 py-1 rounded text-[8px] sm:text-[10px] uppercase tracking-widest shadow-lg border border-red-500/50">
              Esgotado
            </span>
          )}
          {(product.platforms || ['pc']).map((plat: string) => (
            <span key={plat} className="bg-black/50 backdrop-blur-sm rounded px-1.5 py-0.5 text-[8px] text-white font-bold border border-white/10 uppercase tracking-tighter shadow-sm">
              {plat}
            </span>
          ))}
        </div>

      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 bg-[#0F172A]/80">
        <h4 className="text-white font-bold text-sm sm:text-lg mb-1 line-clamp-1">{product.name}</h4>
        
        {/* Timer Fake (Como na referência) */}
        <div className="flex items-center gap-1.5 mt-1 sm:mt-2 mb-3 sm:mb-4">
          <Timer size={10} className="text-accent" />
          <span className="text-[9px] sm:text-xs font-medium text-accent/80">Entrega Instantânea</span>
        </div>

        <div className="mt-auto flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div className="flex gap-2 items-center">
            <span className="bg-orange-600 text-white font-bold px-1 py-0.5 rounded text-[10px] sm:text-xs">
              -{discountPercent}%
            </span>
            <div className="flex flex-col">
              <span className="text-[10px] text-white/40 line-through">
                R$ {(originalPrice / 100).toFixed(2).replace('.', ',')}
              </span>
              <span className="text-base sm:text-lg font-bold text-white leading-none">
                R$ {(product.price_brl / 100).toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>
        </div>
        
        <div className="w-full mt-3 sm:mt-4 bg-primary text-white group-hover:bg-primary-hover font-bold py-2 rounded-lg transition-all text-[11px] sm:text-sm shadow-lg shadow-primary/10 text-center">
          Ver Detalhes
        </div>
      </div>
    </Link>
  )
}
