import { supabaseAdmin } from '@/lib/supabase'
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  ChevronRight, 
  Mail, 
  ExternalLink,
  CreditCard,
  User,
  Package,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

async function getOrders() {
  const supabase = supabaseAdmin()
  const { data } = await supabase
    .from('orders')
    .select(`
      *,
      products (name, price_brl),
      credentials (key_value, email, password)
    `)
    .order('created_at', { ascending: false })
  
  return data || []
}

export default async function AdminOrdersPage() {
  const orders = await getOrders()

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Pedidos & Vendas</h2>
          <p className="text-white/40 text-sm">Acompanhe as transações e entregas da sua loja.</p>
        </div>
      </div>

      <div className="bg-[#111118] border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between bg-white/[0.02]">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <input 
              type="text" 
              placeholder="Buscar por e-mail ou transação..." 
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white outline-none focus:border-purple-500/50 transition-all"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-white/40 hover:text-white transition-all flex items-center gap-2">
              <Filter className="w-3.5 h-3.5" /> Filtrar Status
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[10px] uppercase tracking-widest text-white/30 font-bold bg-white/[0.01]">
                <th className="px-6 py-4">Pedido / Cliente</th>
                <th className="px-6 py-4">Produto</th>
                <th className="px-6 py-4 text-center">Valor</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-white/[0.01] group">
                  <td className="px-6 py-6">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 group-hover:bg-purple-500/10 group-hover:text-purple-400 transition-all">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{order.buyer_email}</p>
                        <p className="text-[10px] font-mono text-white/20 mt-1 uppercase tracking-tight">#{order.id.split('-')[0]} • {new Date(order.created_at).toLocaleString('pt-BR')}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-6 font-medium">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-purple-400" />
                      <span className="text-sm">{order.products?.name}</span>
                    </div>
                  </td>

                  <td className="px-6 py-6 text-center">
                    <span className="text-sm font-bold font-mono text-white/80">
                      R$ {(order.products?.price_brl / 100).toFixed(2).replace('.', ',')}
                    </span>
                  </td>

                  <td className="px-6 py-6">
                    <div className="flex justify-center">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold border flex items-center gap-2",
                        order.status === 'paid' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                        order.status === 'pending' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                        "bg-red-500/10 text-red-100/50 border-red-500/20"
                      )}>
                        {order.status === 'paid' ? <CheckCircle2 className="w-3 h-3" /> :
                         order.status === 'pending' ? <Clock className="w-3 h-3" /> :
                         <AlertCircle className="w-3 h-3" />}
                        {order.status === 'paid' ? 'PAGO' : order.status === 'pending' ? 'PENDENTE' : 'FALHOU'}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {order.status === 'paid' && (
                        <button 
                          className="flex items-center gap-2 px-4 py-2 bg-purple-600/10 hover:bg-purple-600 text-purple-400 hover:text-white border border-purple-500/20 rounded-lg text-[10px] font-bold transition-all"
                          title="Reenviar Key"
                        >
                          <Mail className="w-3.5 h-3.5" /> REENVIAR KEY
                        </button>
                      )}
                      <button className="p-2 text-white/20 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {orders.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-white/20">
              <ShoppingBag className="w-12 h-12 mb-4 opacity-10" />
              <p className="text-sm">Nenhum pedido registrado.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
