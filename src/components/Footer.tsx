import { Gamepad2, MessageCircle } from 'lucide-react'

export function Footer() {
  return (
    <footer className="mt-20 border-t border-white/5 bg-[#030712] py-12">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left Side */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <div className="flex items-center gap-2 text-white mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent flex items-center justify-center rounded-lg text-white">
              <Gamepad2 size={18} />
            </div>
            <span className="font-bold text-lg tracking-tight">
              Level<span className="text-accent">UP</span> Store
            </span>
          </div>
          <p className="text-sm text-white/50 max-w-xs">
            A melhor escolha que você pode fazer. Jogos, Contas, Premium Keys e muito mais. Segurança e agilidade no seu PIX.
          </p>
          <p className="text-xs text-white/30 mt-4">Email para contato: <strong className="text-white/60">levelsuporte@gmail.com</strong></p>
        </div>

        {/* Right Side / Socials */}
        <div className="flex items-center gap-4">
          <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-accent hover:border-accent hover:bg-accent/10 transition">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
          </a>
          <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-accent hover:border-accent hover:bg-accent/10 transition">
            <MessageCircle size={20} />
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-12 pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between text-xs text-white/30">
        <p>Copyright © 2026 - LevelUP Store. Todos os direitos reservados.</p>
        <div className="flex gap-4 mt-4 md:mt-0">
          <a href="#" className="hover:text-white transition">Termos e Condições</a>
          <a href="#" className="hover:text-white transition">Privacidade</a>
        </div>
      </div>
    </footer>
  )
}
