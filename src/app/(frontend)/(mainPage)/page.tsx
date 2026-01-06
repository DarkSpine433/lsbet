'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Trophy,
  ShieldCheck,
  Zap,
  TrendingUp,
  Users,
  Award,
  ArrowRight,
  DollarSign,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  CheckCircle2,
  Activity,
} from 'lucide-react'
import { AnimatedCounter } from '@/components/MainPage/AnimatedCounter'
import SignInSignUpDialog from '@/components/MainPage/SignInSignUpDialog'

// --- CUSTOM ACCORDION COMPONENT (DARK VERSION) ---
const AccordionItem = ({
  title,
  content,
  isOpen,
  onClick,
}: {
  title: string
  content: string
  isOpen: boolean
  onClick: () => void
}) => {
  return (
    <div
      className={`border transition-all duration-300 rounded-2xl mb-4 overflow-hidden ${
        isOpen
          ? 'border-blue-500/50 bg-slate-900 shadow-lg shadow-blue-500/10'
          : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
      }`}
    >
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between p-6 text-left focus:outline-none group"
      >
        <div className="flex items-center gap-4">
          <div
            className={`p-2 rounded-lg transition-colors ${isOpen ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500 group-hover:bg-slate-700'}`}
          >
            <HelpCircle className="h-5 w-5" />
          </div>
          <span
            className={`font-bold text-lg transition-colors ${isOpen ? 'text-white' : 'text-slate-300'}`}
          >
            {title}
          </span>
        </div>
        <ChevronDown
          className={`h-5 w-5 transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-500' : 'text-slate-600'}`}
        />
      </button>

      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-6 pt-0 text-slate-400 leading-relaxed border-t border-slate-800/50 mt-[-1px]">
          {content}
        </div>
      </div>
    </div>
  )
}

// --- FEATURE CARD COMPONENT (DARK VERSION) ---
function FeatureCard({
  icon,
  title,
  description,
  status,
}: {
  icon: React.ReactNode
  title: string
  description: string
  status: string
}) {
  return (
    <Card className="bg-slate-900 border-slate-800 shadow-xl hover:border-blue-500/50 transition-all duration-300 rounded-2xl overflow-hidden group">
      <CardHeader className="p-6 border-b border-slate-800/50">
        <div className="flex items-center gap-3 mb-4">
          <Badge
            variant="outline"
            className="text-[10px] font-bold tracking-widest uppercase py-0 px-2 text-blue-500 border-blue-500/20 bg-blue-500/5"
          >
            {status}
          </Badge>
        </div>
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-slate-800 text-blue-500 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
            {icon}
          </div>
          <CardTitle className="text-xl font-bold text-white">{title}</CardTitle>
        </div>
      </CardHeader>
      <div className="p-6">
        <CardDescription className="text-slate-400 text-base leading-relaxed">
          {description}
        </CardDescription>
      </div>
    </Card>
  )
}

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false)
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const faqData = [
    {
      question: 'Co oznacza gra bez podatku?',
      answer:
        'W naszej platformie bierzemy 12% podatek obrotowy na siebie. Ty otrzymujesz pełną kwotę wygranej wynikającą z przemnożenia stawki przez kurs.',
    },
    {
      question: 'Jak szybko otrzymam swoją wygraną?',
      answer: 'Większość wygranych trafia na konto bankowe gracza w czasie krótszym niż 24 godzin.',
    },
    {
      question: 'Czy platforma jest legalna?',
      answer:
        'Tak, działamy w oparciu o pełną licencję i certyfikowane systemy losujące oraz rozliczające, zapewniając 100% bezpieczeństwa.',
    },
  ]

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 selection:bg-blue-500/30">
      {/* 1. HERO SECTION */}
      <section className="relative pt-20 pb-32 md:pt-32 md:pb-48 px-4 overflow-hidden">
        {/* Deep Glow Effects */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-red-600/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
          <div
            className={`flex justify-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            <Badge className="px-4 py-1.5 text-blue-400 bg-blue-500/10 border-blue-500/20 flex items-center gap-2 rounded-full hover:bg-blue-500/30">
              <Activity className="h-3 w-3 animate-pulse" />
              Platforma Zakładów Live 2.0
            </Badge>
          </div>

          <h1
            className={`text-5xl md:text-8xl font-black text-white tracking-tight transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            Graj{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
              Bez Podatku
            </span>{' '}
            <br />
            Wygrywaj 100%
          </h1>

          <p
            className={`text-lg md:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            Najszybsza platforma bukmacherska w regionie. <br className="hidden md:block" />
            Błyskawiczne kursy, zero opóźnień i wypłaty realizowane w czasie rzeczywistym.
          </p>

          <div
            className={`flex flex-col sm:flex-row gap-4 justify-center pt-8 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            <SignInSignUpDialog signUp>
              <Button
                size="lg"
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold h-16 px-12 text-lg rounded-2xl shadow-xl shadow-blue-600/20 transition-all hover:scale-105"
              >
                Odbierz Bonus <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
            </SignInSignUpDialog>
            <SignInSignUpDialog>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-slate-800 bg-slate-900/50 text-white hover:bg-slate-800 h-16 px-12 text-lg rounded-2xl"
              >
                Zobacz Kursy
              </Button>
            </SignInSignUpDialog>
          </div>
        </div>
      </section>

      {/* 2. STATS BAR (DARK CARD) */}
      <div className="max-w-6xl mx-auto -mt-16 relative z-20 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Aktywnych Graczy', value: 12500, suffix: '+' },
            { label: 'Suma Wypłacona', value: 2000000, suffix: '$' },
            { label: 'Wypłata w średnio', value: 8, suffix: ' min' },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl flex flex-col items-center justify-center text-center"
            >
              <span className="text-4xl font-black text-white tracking-tight">
                <AnimatedCounter end={stat.value} suffix={stat.suffix} />
              </span>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mt-3">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. FEATURES (GRID) */}
      <section className="py-32 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
            Standardy PRO
          </h2>
          <div className="h-1.5 w-20 bg-blue-600 mx-auto mt-6 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.5)]" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Zap className="h-6 w-6" />}
            status="REAL-TIME"
            title="Szybkie Zakłady"
            description="Nasza autorska technologia 'One-Click' pozwala na zawieranie zakładów w ułamku sekundy bez zbędnych potwierdzeń."
          />
          <FeatureCard
            icon={<ShieldCheck className="h-6 w-6" />}
            status="SECURE"
            title="Gwarancja Wypłat"
            description="Twoje środki są przechowywane na oddzielnych, zabezpieczonych kontach. Gwarantujemy wypłacalność w każdych warunkach."
          />
          <FeatureCard
            icon={<Trophy className="h-6 w-6" />}
            status="ELITE"
            title="Kursy Premium"
            description="Eliminujemy marże na najważniejsze wydarzenia sportowe, oferując najwyższe wygrane w branży."
          />
        </div>
      </section>

      {/* 4. MOCKUP PREVIEW (DARK UI) */}
      <section className="py-24 bg-slate-900/30 border-y border-slate-800/50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <Badge className="bg-blue-600 text-white border-none px-4 py-1">NOWOŚĆ</Badge>
              <h2 className="text-4xl md:text-6xl font-bold leading-tight text-white">
                Najlepszy Interface <br />
                <span className="text-blue-500 text-shadow-glow">Na Rynku</span>
              </h2>
              <p className="text-slate-400 text-xl leading-relaxed">
                Zaprojektowaliśmy panel, który nie rozprasza. Skup się na tym co ważne - na analizie
                i wygrywaniu.
              </p>
              <div className="space-y-4">
                {[
                  'Ciemny motyw oszczędzający wzrok',
                  'Intuicyjny kreator kuponów',
                  'Powiadomienia o wynikach push',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 text-slate-200 font-medium">
                    <div className="h-6 w-6 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-blue-500" />
                    </div>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-blue-400 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-[#0f172a] border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden">
                {/* Mock UI Header */}
                <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-6">
                  <div className="flex gap-2">
                    <div className="h-3 w-3 rounded-full bg-slate-700" />
                    <div className="h-3 w-3 rounded-full bg-slate-700" />
                  </div>
                  <div className="h-4 w-32 bg-slate-800 rounded-full" />
                  <div className="w-8 h-8 rounded-lg bg-blue-600/20" />
                </div>
                {/* Mock Content */}
                <div className="space-y-4">
                  <div className="h-24 bg-slate-800/50 rounded-2xl border border-slate-800 p-4">
                    <div className="flex justify-between items-center h-full">
                      <div className="w-12 h-12 bg-slate-700 rounded-xl" />
                      <div className="text-2xl font-black text-white italic">3 : 1</div>
                      <div className="w-12 h-12 bg-slate-700 rounded-xl" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="h-12 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-sm">
                      1.85
                    </div>
                    <div className="h-12 bg-slate-800 rounded-xl flex items-center justify-center font-bold text-sm">
                      3.40
                    </div>
                    <div className="h-12 bg-slate-800 rounded-xl flex items-center justify-center font-bold text-sm">
                      4.20
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FAQ SECTION */}
      <section className="py-32 px-4 max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white italic">FAQ</h2>
          <p className="text-slate-500 mt-4 font-medium uppercase tracking-[0.3em] text-xs">
            Pytania i odpowiedzi
          </p>
        </div>

        <div className="space-y-4">
          {faqData.map((faq, index) => (
            <AccordionItem
              key={index}
              title={faq.question}
              content={faq.answer}
              isOpen={openFaqIndex === index}
              onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
            />
          ))}
        </div>
      </section>

      {/* 6. FINAL CTA (DARK NAVY) */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto bg-gradient-to-br from-blue-700 to-blue-900 rounded-[3rem] p-12 px-4 md:px-20 md:p-20 text-center text-white relative overflow-hidden shadow-[0_20px_50px_rgba(37,99,235,0.3)]">
          <div className="relative z-10 space-y-8">
            <h2 className="text-4xl md:text-7xl font-black tracking-tighter">WEJDŹ DO GRY.</h2>
            <p className="text-blue-100 text-xl max-w-xl mx-auto font-medium">
              Zarejestruj się i odbierz darmowy freebet na start. Dołącz do społeczności
              profesjonalnych graczy.
            </p>
            <div className="pt-6">
              <SignInSignUpDialog signUp>
                <Button
                  size="lg"
                  className="bg-white text-blue-700 hover:bg-slate-100 font-black h-20 px-5 sm:px-16 text-2xl rounded-2xl transition-transform hover:scale-105 active:scale-95 shadow-2xl"
                >
                  ZAREJESTRUJ SIĘ
                </Button>
              </SignInSignUpDialog>
            </div>
          </div>
          {/* Decorative shapes */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />
        </div>
      </section>
    </div>
  )
}
