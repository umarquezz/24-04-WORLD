'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, ShoppingCart, User, Gamepad2, LogOut, LayoutDashboard } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export function Header() {
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
    router.push('/')
  }

  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-white/5 shadow-2xl shadow-black/50">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between gap-6">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-white hover:opacity-80 transition shrink-0">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent flex items-center justify-center rounded-xl shadow-lg shadow-primary/30 text-white">
            <Gamepad2 size={24} />
          </div>
          <span className="font-bold text-xl tracking-tight hidden sm:block">
            Level<span className="text-accent">UP</span>
          </span>
        </Link>
        
        {/* Search Bar */}
        <div className="flex-1 max-w-xl hidden md:flex">
          <div className="relative w-full">
            <input 
              type="text" 
              placeholder="Buscar jogos, contas, keys..." 
              className="w-full bg-secondary/80 border border-white/10 rounded-full py-2.5 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-primary focus:bg-secondary focus:ring-1 focus:ring-primary transition placeholder-white/40 shadow-inner"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {user ? (
            <div className="flex items-center gap-2 sm:gap-4">
              <Link 
                href="/dashboard" 
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition text-white border border-white/5"
              >
                <LayoutDashboard size={18} className="text-accent" />
                <span className="text-sm font-medium hidden sm:block">Painel</span>
              </Link>
              <button 
                onClick={handleSignOut}
                className="p-2 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition"
                title="Sair"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link href="/auth/login" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition text-white/80 hover:text-white">
              <User size={20} />
              <span className="text-sm font-medium hidden sm:block">Entrar</span>
            </Link>
          )}
          
          <button className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white hover:bg-primary-hover transition relative shadow-lg shadow-primary/20 hover:shadow-primary/40">
            <ShoppingCart size={18} />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-[#040A18]">
              0
            </span>
          </button>
        </div>
      </div>
    </header>
  )
}
