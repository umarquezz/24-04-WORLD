import { CheckCircle, ShieldCheck, Gamepad2 } from 'lucide-react'

interface HeroData {
  title: string
  highlight: string
  description: string
  buttonText: string
  buttonLink: string
  backgroundImage?: string
}

export function HeroBanner({ data }: { data?: HeroData }) {
  const settings = data || {
    title: 'É o fim de semana LevelUP!',
    highlight: 'LevelUP!',
    description: 'Super descontos nos best sellers, lançamentos e clássicos! Compre agora com PIX e receba na hora.',
    buttonText: 'Ver Ofertas',
    buttonLink: '/#promocoes'
  }

  return (
    <div className="w-full mb-12">
      <div 
        className="bg-gradient-to-r from-[#07132B] to-[#112040] border border-white/5 rounded-2xl p-6 sm:p-10 relative overflow-hidden shadow-2xl min-h-[300px] flex flex-col justify-center"
        style={settings.backgroundImage ? {
          backgroundImage: `linear-gradient(rgba(7, 19, 43, 0.8), rgba(7, 19, 43, 0.8)), url(${settings.backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : {}}
      >
        {/* Glow Effects */}
        {!settings.backgroundImage && (
          <>
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary rounded-full blur-[100px] opacity-20"></div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-accent rounded-full blur-[100px] opacity-10"></div>
          </>
        )}
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row gap-6 md:gap-12 items-center justify-between mb-8 opacity-80 scale-90 origin-left">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-accent" size={24} />
              <div>
                <p className="text-xs text-white/60 font-medium uppercase tracking-widest">Loja Oficial</p>
                <p className="text-white font-bold text-base">100% Garantido</p>
              </div>
            </div>
            
            <div className="hidden md:block w-px h-8 bg-white/10"></div>
            
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-accent" size={24} />
              <div>
                <p className="text-xs text-white/60 font-medium uppercase tracking-widest">Experiência Segura</p>
                <p className="text-white font-bold text-base">Compra Simples</p>
              </div>
            </div>
            
            <div className="hidden md:block w-px h-8 bg-white/10"></div>
            
            <div className="flex items-center gap-3">
              <Gamepad2 className="text-accent" size={24} />
              <div>
                <p className="text-xs text-white/60 font-medium uppercase tracking-widest">Divirta-se com</p>
                <p className="text-white font-bold text-base">Os Melhores Jogos</p>
              </div>
            </div>
          </div>
          
          <div className="bg-[#040A18]/50 border border-white/5 rounded-xl p-6 backdrop-blur flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <h2 className="text-2xl sm:text-4xl font-black text-white italic tracking-wide mb-2 uppercase drop-shadow-lg leading-tight">
                {settings.title.split(settings.highlight)[0]}
                <span className="text-accent">{settings.highlight}</span>
                {settings.title.split(settings.highlight)[1]}
              </h2>
              <p className="text-sm text-white/70 max-w-2xl">{settings.description}</p>
            </div>
            <a 
              href={settings.buttonLink}
              className="whitespace-nowrap px-8 py-3 bg-white text-[#040A18] font-bold rounded-lg hover:bg-white/90 transition shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] active:scale-95"
            >
              {settings.buttonText}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
