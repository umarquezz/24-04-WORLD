import { supabaseAdmin } from '@/lib/supabase'
import { 
  ShoppingBag, 
  Package, 
  Key, 
  Clock, 
  TrendingUp, 
  ArrowUpRight,
  TicketPercent 
} from 'lucide-react'
import { WebhookManager } from './WebhookManager'

export const dynamic = 'force-dynamic'

async function getMetrics() {
  const supabase = supabaseAdmin()
  
  // Total vendas hoje
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const { count: salesToday } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'paid')
    .gte('paid_at', today.toISOString())

  // Produtos ativos
  const { count: activeProducts } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('active', true)

  // Keys disponíveis
  const { count: availableKeys } = await supabase
    .from('credentials')
    .select('*', { count: 'exact', head: true })
    .eq('sold', false)
    .eq('type', 'key')

  // Pedidos pendentes
  const { count: pendingOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  return {
    salesToday: salesToday || 0,
    activeProducts: activeProducts || 0,
    availableKeys: availableKeys || 0,
    pendingOrders: pendingOrders || 0
  }
}

export default async function AdminDashboard() {
  const metrics = await getMetrics()

  const stats = [
    { name: 'Vendas Hoje', value: metrics.salesToday, icon: ShoppingBag, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { name: 'Produtos Ativos', value: metrics.activeProducts, icon: Package, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { name: 'Keys Disponíveis', value: metrics.availableKeys, icon: Key, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { name: 'Pedidos Pendentes', value: metrics.pendingOrders, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/10' },
  ]

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Bem-vindo, Administrador</h2>
        <p className="text-white/40 text-sm">Aqui está o resumo do que está acontecendo na sua loja hoje.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-[#111118] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all group overflow-hidden relative">
            <div className={stat.bg + " absolute -top-4 -right-4 w-24 h-24 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"}></div>
            
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className={stat.bg + " " + stat.color + " p-3 rounded-xl"}>
                <stat.icon className="w-6 h-6" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-white/10 group-hover:text-white/40 transition-colors" />
            </div>
            
            <div className="relative z-10">
              <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-1">{stat.name}</p>
              <h3 className="text-3xl font-bold">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Atividade Recente ou Dicas rápidos */}
        <div className="lg:col-span-2 bg-[#111118] border border-white/5 rounded-2xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold">Resumo de Atividade</h3>
            <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1">
              <button className="px-3 py-1 text-xs font-medium bg-purple-600 rounded-md">Hoje</button>
              <button className="px-3 py-1 text-xs font-medium text-white/40 hover:text-white">Semana</button>
            </div>
          </div>
          
          <div className="h-64 flex flex-col items-center justify-center text-white/20 border-2 border-dashed border-white/5 rounded-xl">
            <TrendingUp className="w-12 h-12 mb-4" />
            <p className="text-sm">Gráficos de vendas em breve...</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#111118] border border-white/5 rounded-2xl p-8">
            <h3 className="text-lg font-bold mb-6">Ações Rápidas</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-sm font-medium border border-white/5">
                <Package className="w-4 h-4 text-purple-400" /> Adicionar Produto
              </button>
              <button className="w-full flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-sm font-medium border border-white/5">
                <Key className="w-4 h-4 text-blue-400" /> Repor Estoque
              </button>
              <button className="w-full flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-sm font-medium border border-white/5">
                <TicketPercent className="w-4 h-4 text-pink-400" /> Criar Cupom
              </button>
            </div>
          </div>

          {/* Gerenciador de Webhook Automático */}
          <WebhookManager />
        </div>
      </div>
    </div>
  )
}
