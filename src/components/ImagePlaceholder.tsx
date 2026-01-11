import { ImageIcon, ZapOff, Sparkles } from 'lucide-react'
import { Media as MediaType } from '@/payload-types'

export function ImagePlaceholder({
  className = '',
  title = '?',
}: {
  className?: string
  title?: string
}) {
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-[#020617] group w-full h-full ${className}`}
    >
      {/* 1. Dynamiczne tło z efektem siatki - dopasowane do skali */}
      <div
        className="absolute inset-0 opacity-20 transition-opacity duration-500 group-hover:opacity-40"
        style={{
          backgroundImage: `
            linear-gradient(#1e293b 1px, transparent 1px), 
            linear-gradient(90deg, #1e293b 1px, transparent 1px)
          `,
          backgroundSize: '20% 20%',
        }}
      />

      {/* 2. Radialny Glow - centralny punkt świetlny */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(37,99,235,0.15)_0%,transparent_75%)] group-hover:bg-[radial-gradient(circle_at_center,_rgba(37,99,235,0.3)_0%,transparent_70%)] transition-all duration-700" />

      {/* 3. Główny Kontener Ikony - zawsze wycentrowany bez względu na tekst */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full p-2">
        <div className="relative flex items-center justify-center w-[40%] aspect-square transition-transform duration-500 group-hover:scale-110">
          {/* GŁÓWNA IKONA - skaluje się idealnie do rodzica */}
          <ImageIcon className="w-full h-full text-slate-800 group-hover:text-blue-500/50 transition-colors duration-500 stroke-[1.5]" />

          {/* Mini-dekoracje - widoczne tylko w większych kontenerach (powyżej 60px) */}
          <div className="absolute -top-[15%] -right-[15%] w-[35%] h-[35%] hidden min-[60px]:block">
            <ZapOff className="w-full h-full text-red-500/40 animate-pulse" />
          </div>
        </div>

        {/* 4. Napis "NO MEDIA" - tylko jeśli jest wystarczająco dużo miejsca w pionie */}
        <div className="absolute bottom-[10%] left-0 right-0 hidden min-[100px]:flex flex-col items-center pointer-events-none">
          <p className="text-[min(9px,2.5vw)] font-black uppercase tracking-[0.2em] text-slate-700 group-hover:text-blue-400/50 transition-colors">
            No Media
          </p>
          {title !== '?' && (
            <p className="text-[min(7px,2vw)] font-bold text-slate-800 uppercase italic opacity-0 group-hover:opacity-100 transition-opacity truncate max-w-[80%]">
              {title}
            </p>
          )}
        </div>
      </div>

      {/* 5. Efekt skanera (Laser) - subtelniejszy */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="w-full h-[10%] bg-gradient-to-b from-transparent via-blue-500/20 to-transparent absolute -top-[10%] animate-[scan_5s_linear_infinite]" />
      </div>

      <style jsx>{`
        @keyframes scan {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(1000%);
          }
        }
      `}</style>
    </div>
  )
}

export const isValidMedia = (media: string | MediaType | null | undefined): boolean => {
  if (!media) return false
  if (typeof media === 'object') {
    return 'url' in media && typeof media.url === 'string' && media.url.trim().length > 0
  }
  return false
}
