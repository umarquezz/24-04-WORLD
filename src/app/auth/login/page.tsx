'use client'
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { Mail, Loader2, Gamepad2, ArrowLeft, CheckCircle2, ShieldCheck, Zap, Sparkles } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/15 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>

      <div className="w-full max-w-md">
        {/* Back link */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-white/40 hover:text-white transition mb-8 group"
        >
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition">
            <ArrowLeft size={16} />
          </div>
          <span className="text-sm font-medium">Voltar para a loja</span>
        </Link>

        {/* Card */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-10 relative overflow-hidden">
          {/* Glow effect */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-[80px]" />
          
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent flex items-center justify-center rounded-2xl shadow-lg shadow-primary/30 text-white">
              <Gamepad2 size={28} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                Level<span className="text-accent">UP</span>
              </h1>
              <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Digital Store</p>
            </div>
          </div>

          {sent ? (
            /* Success state */
            <div className="text-center py-4 animate-in fade-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20">
                <CheckCircle2 size={40} className="text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Verifique seu e-mail!</h2>
              <p className="text-white/50 text-sm leading-relaxed mb-2">
                Enviamos um link mágico para:
              </p>
              <p className="text-accent font-bold text-sm mb-6">{email}</p>
              <p className="text-white/30 text-xs leading-relaxed">
                Clique no link que chegou no seu e-mail para acessar sua conta. 
                O link expira em 1 hora.
              </p>
              
              <div className="mt-8 pt-6 border-t border-white/5">
                <button
                  onClick={() => { setSent(false); setEmail('') }}
                  className="text-sm text-white/40 hover:text-white transition"
                >
                  Usar outro e-mail
                </button>
              </div>
            </div>
          ) : (
            /* Login form */
            <>
              <div className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-tight">
                  Acesse sua conta
                </h2>
                <p className="text-white/50 text-sm leading-relaxed">
                  Entre com seu e-mail para comprar e acessar seus produtos digitais.
                </p>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm mb-6 text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold block mb-2">
                    Seu e-mail
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition placeholder-white/20"
                      required
                      autoFocus
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl transition disabled:opacity-50 shadow-xl shadow-primary/20 text-sm flex items-center justify-center gap-2 group"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <>
                      <Sparkles size={16} className="group-hover:animate-pulse" />
                      Enviar link mágico
                    </>
                  )}
                </button>
              </form>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#0c0c12] px-2 text-white/20 font-bold tracking-widest">Ou continue com</span>
                </div>
              </div>

              <button
                onClick={async () => {
                  const supabase = createClient();
                  await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                      redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
                    },
                  });
                }}
                className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-xl transition border border-white/10 text-sm flex items-center justify-center gap-3 group"
              >
                <svg className="w-5 h-5 group-hover:scale-110 transition" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </button>

              <p className="mt-8 text-[10px] text-white/20 text-center leading-relaxed">
                Não tem conta? Basta entrar com seu e-mail ou Google.<br />
                Criaremos sua conta automaticamente.
              </p>
            </>
          )}
        </div>

        {/* Trust badges */}
        <div className="mt-8 flex items-center justify-center gap-6">
          <div className="flex items-center gap-1.5 text-white/20">
            <ShieldCheck size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider">100% Seguro</span>
          </div>
          <div className="w-1 h-1 bg-white/10 rounded-full" />
          <div className="flex items-center gap-1.5 text-white/20">
            <Zap size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Entrega Instantânea</span>
          </div>
        </div>
      </div>
    </div>
  )
}
