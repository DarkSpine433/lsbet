'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Play,
  Shield,
  Headphones,
  Menu,
  TrendingUp,
  Users,
  Zap,
  Award,
  Globe,
  Sparkles,
  ArrowRight,
  ChevronDown,
  DollarSign,
} from 'lucide-react'
import Link from 'next/link'
import { FloatingElements } from '@/components/MainPage/FloatingElements'
import { Logo } from '@/components/Logo/Logo'
import { AnimatedCounter } from '@/components/MainPage/AnimatedCounter'
import { GlassCard } from '@/components/MainPage/GlassCard'
import SignInSignUpDialog from '@/components/MainPage/SignInSignUpDialog'
import { getMeUser } from '@/utilities/getMeUser'

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-red-900 relative overflow-hidden">
      {/* Animated background elements with patriotic colors */}
      <FloatingElements />

      {/* Mouse follower gradient with patriotic colors */}
      <div className="fixed w-96 h-96 bg-gradient-to-r from-blue-500/20 to-red-500/20 rounded-full blur-3xl pointer-events-none transition-all duration-300 ease-out" />

      {/* Hero Section */}
      <main className="relative z-10 container mx-auto px-4 pt-10 pb-20 md:py-20">
        <div className="text-center max-w-6xl mx-auto">
          {/* Animated Badge */}
          <div
            className={`inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500/20 to-red-500/20 backdrop-blur-lg border border-white/20 rounded-full px-6 py-3 mb-8 transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
          >
            <DollarSign className="h-4 w-4 text-green-400 animate-pulse" />
            <span className="text-white/90 font-medium md:text-base text-sm">
              Zarabiaj Dzięki Naszej Platformie
            </span>
            <Badge className="bg-gradient-to-r from-red-500 to-blue-500 text-white border-0">
              LIVE
            </Badge>
          </div>

          {/* Main Logo/Badge */}

          {/* Main Headline with Staggered Animation */}
          <div className="space-y-4 mb-8">
            <h1 className="text-6xl md:text-8xl font-black text-white leading-tight">
              <span
                className={`block transition-all duration-1000 delay-900 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}
              >
                GRAJ
              </span>
              <span
                className={`block bg-gradient-to-r from-blue-400 via-white to-red-400 bg-clip-text text-transparent animate-gradient-x transition-all duration-1000 delay-1100 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}
              >
                BEZ PODATKU
              </span>
            </h1>
          </div>

          {/* Subtitle with Typewriter Effect */}
          <div
            className={`space-y-4 mb-12 transition-all duration-1000 delay-1300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}
          >
            <p className="text-xl md:text-3xl text-white/90 max-w-4xl mx-auto leading-relaxed font-light">
              Na zakłady pojedyncze oraz łączone.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-red-400 font-semibold">
                Spróbuj pomnożyć
              </span>{' '}
              swój majątek z nami.
            </p>
            <p className="text-lg text-white/70 max-w-3xl mx-auto">
              Dołącz do tysięcy zwycięzców, którzy ufają naszej platformie dla bezpiecznych,
              szybkich i zyskownych zakładów.
            </p>
          </div>

          {/* CTA Button with Pulse Animation */}

          <SignInSignUpDialog signUp>
            <div
              className={`mb-16 transition-all duration-1000 delay-1500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
            >
              <Button
                size="lg"
                className="group relative bg-gradient-to-r from-red-600 to-blue-700 hover:from-red-700 hover:to-blue-800 text-white px-16 py-8 text-2xl font-bold rounded-2xl shadow-2xl hover:shadow-red-500/25 transform hover:scale-105 transition-all duration-300 overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-red-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative flex items-center space-x-3">
                  <span>ZAŁÓŻ KONTO</span>
                  <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
              </Button>
            </div>
          </SignInSignUpDialog>
          {/* Animated Stats */}
          <div
            className={`grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 transition-all duration-1000 delay-1700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
          >
            {[
              { icon: Users, label: 'Aktywni Użytkownicy', value: 500, suffix: '+' },
              { icon: TrendingUp, label: 'Wskaźnik Wypłat', value: 98, suffix: '%' },
              { icon: Award, label: 'Dzienni Zwycięzcy', value: 100, suffix: '+' },
            ].map((stat, index) => (
              <div
                key={stat.label}
                className="text-center group"
                style={{ animationDelay: `${1700 + index * 200}ms` }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl mb-4 group-hover:scale-110 transition-all duration-300 border border-white/10">
                  <stat.icon className="h-8 w-8 text-white/80" />
                </div>
                <div className="text-3xl font-black text-white mb-2">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-white/60 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Features Section with Glass Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              icon: Play,
              title: 'ZAKŁADY LIVE',
              description:
                'Obstawiaj mecze na żywo z kursami w czasie rzeczywistym i natychmiastowymi aktualizacjami. Nigdy nie przegap okazji na wygraną.',
              gradient: 'from-blue-500 to-blue-600',
              delay: 1900,
            },
            {
              icon: Shield,
              title: 'BEZPIECZNE PŁATNOŚCI',
              description:
                'Twoje środki są chronione zabezpieczeniami na poziomie bankowym. Szybkie wpłaty i natychmiastowe wypłaty gwarantowane.',
              gradient: 'from-red-500 to-red-600',
              delay: 2100,
            },
            {
              icon: Headphones,
              title: 'WSPARCIE 24/7',
              description:
                'Nasz zespół ekspertów jest dostępny przez całą dobę, aby pomóc Ci z wszelkimi pytaniami lub problemami.',
              gradient: 'from-blue-600 to-red-600',
              delay: 2300,
            },
          ].map((feature, index) => (
            <GlassCard key={feature.title} delay={feature.delay}>
              <div className="p-8 text-center group">
                <div
                  className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${feature.gradient} rounded-3xl mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg`}
                >
                  <feature.icon className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-white/70 leading-relaxed">{feature.description}</p>
              </div>
            </GlassCard>
          ))}
        </div>
      </main>
    </div>
  )
}
