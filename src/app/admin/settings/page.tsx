import { getSiteSettings } from './actions'
import { SettingsForm } from './SettingsForm'
import { PromoPopupForm } from './PromoPopupForm'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const heroData = await getSiteSettings('hero_banner') || {
    title: 'É o fim de semana LevelUP!',
    highlight: 'LevelUP!',
    description: 'Super descontos nos best sellers, lançamentos e clássicos! Compre agora com PIX e receba na hora.',
    buttonText: 'Ver Ofertas',
    buttonLink: '/#promocoes',
    backgroundImage: ''
  }

  const promoPopupData = await getSiteSettings('promo_popup') || {
    active: false,
    title: 'Desconto de Boas-vindas!',
    description: 'Use o cupom abaixo em sua primeira compra para ganhar 10% de desconto real!',
    couponCode: 'BEMVINDO10',
    buttonText: 'Aproveitar agora',
    imageUrl: ''
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div>
        <h2 className="text-2xl font-bold text-white">Configurações do Site</h2>
        <p className="text-white/40 text-sm italic">Personalize a aparência e o conteúdo da página inicial.</p>
      </div>

      {/* Hero Banner Section */}
      <div className="bg-[#111118] border border-white/5 rounded-3xl p-8 shadow-2xl">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
          <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
          Painel Principal (Hero Banner)
        </h3>
        
        <SettingsForm initialData={heroData} />
      </div>

      {/* Promo Popup Section */}
      <div className="bg-[#111118] border border-white/5 rounded-3xl p-8 shadow-2xl">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
          <div className="w-1.5 h-6 bg-accent rounded-full"></div>
          Popup Promocional
        </h3>
        
        <PromoPopupForm initialData={promoPopupData} />
      </div>
    </div>
  )
}
