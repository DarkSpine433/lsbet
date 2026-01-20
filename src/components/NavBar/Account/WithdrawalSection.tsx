'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Wallet,
  History,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronRight,
  TriangleAlertIcon,
  CreditCard,
  Plus,
  Minus,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDateTime } from '@/utilities/formatDateTime'
import { getWithdrawalHistory, requestWithdrawal } from '@/app/actions/withdrawal'

export default function WithdrawalDialog() {
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<any[]>([])
  const [amount, setAmount] = useState('')
  const [details, setDetails] = useState('')

  const fetchHistory = async () => {
    const data = await getWithdrawalHistory()
    setHistory(data)
  }

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await requestWithdrawal({ amount: Number(amount), method: 'Bank Transfer', details })
      toast.success('Zlecono wypłatę')
      setAmount('')
      setDetails('')
      fetchHistory()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {/* STYLIZOWANA KARTA-PRZYCISK */}
        <button className="w-full group relative flex items-center gap-4 bg-slate-900/40 hover:bg-slate-800/60 border border-slate-800 rounded-2xl p-4 transition-all duration-300 text-left overflow-hidden shadow-lg">
          {/* Subtelny blask w tle po najechaniu */}
          <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />

          {/* Lewa strona: Ikona w boksie */}
          <div className="relative h-12 w-12 shrink-0 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shadow-inner group-hover:border-blue-500/50 transition-colors">
            <Wallet className="h-6 w-6 text-blue-500 group-hover:scale-110 transition-transform" />
          </div>

          {/* Środek: Teksty */}
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-black text-white uppercase tracking-widest italic flex items-center gap-2">
              Zleć wypłatę
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
            </h4>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight mt-0.5 truncate">
              Przelej środki na konto bankowe lub krypto
            </p>
          </div>

          {/* Prawa strona: Chevron lub strzałka */}
          <ChevronRight className="h-5 w-5 text-slate-700 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
        </button>
      </DialogTrigger>
      <DialogContent className="bg-slate-950 border-slate-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-black italic uppercase flex items-center gap-2">
            <Wallet className="text-blue-500" /> System Wypłat
          </DialogTitle>
        </DialogHeader>

        <Tabs
          defaultValue="request"
          className="w-full"
          onValueChange={(v) => v === 'history' && fetchHistory()}
        >
          <TabsList className="grid w-full grid-cols-2 bg-slate-900 mb-4">
            <TabsTrigger value="request" className="font-bold uppercase text-[10px]">
              Zleć wypłatę
            </TabsTrigger>
            <TabsTrigger value="history" className="font-bold uppercase text-[10px]">
              Historia
            </TabsTrigger>
          </TabsList>

          <TabsContent value="request" className="space-y-4">
            <form onSubmit={handleWithdraw} className="space-y-4">
              {/* SEKCJA DANYCH PRZELEWU */}
              <div className="space-y-3 mt-6">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] ml-1">
                  Dane do przelewu / Adres portfela
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors">
                    <CreditCard size={16} />
                  </div>
                  <Input
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    className="bg-black/40 border-slate-800 h-14 pl-12 rounded-2xl font-bold text-sm text-white placeholder:text-slate-700 focus-visible:ring-1 focus-visible:ring-blue-500/50 focus-visible:border-blue-500/50 transition-all shadow-inner"
                    placeholder="Np. Numer konta bankowego Postaci..."
                    required
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] ml-1">
                  Kwota wypłaty ($)
                </label>
                <div className="flex items-center gap-2 bg-black/40 border border-slate-800 rounded-2xl p-1.5 focus-within:border-blue-500/50 transition-all shadow-inner">
                  <button
                    type="button"
                    onClick={() => setAmount((prev) => Math.max(0, Number(prev) - 10).toString())}
                    className="h-10 w-10 shrink-0 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                  >
                    <Minus size={16} strokeWidth={3} />
                  </button>

                  <div className="flex-1 relative">
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="bg-transparent border-none text-center font-black italic text-lg text-white focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-slate-800 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setAmount((prev) => (Number(prev) + 10).toString())}
                    className="h-10 w-10 shrink-0 rounded-xl bg-blue-600 border border-blue-500/50 flex items-center justify-center text-white hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-all"
                  >
                    <Plus size={16} strokeWidth={3} />
                  </button>
                </div>
              </div>

              <div className="p-4 bg-red-600/10 border border-red-500/20 rounded-xl flex gap-3 text-[10px] font-bold text-red-300 leading-relaxed uppercase">
                <TriangleAlertIcon className="h-4 w-4 text-red-500 inline-block" /> Upewnij się, że
                podane dane są poprawne, aby uniknąć utraty majątku.
              </div>
              <div className="p-4 bg-blue-600/10 border border-blue-500/20 rounded-xl flex gap-3">
                <Clock className="text-blue-500 shrink-0" size={20} />
                <p className="text-[10px] font-bold text-blue-200 leading-relaxed uppercase">
                  Uwaga: Czas oczekiwania na przelew może trwać do{' '}
                  <span className="text-white">72h</span>. Każda transakcja jest weryfikowana pod
                  kątem bezpieczeństwa.
                </p>
              </div>

              <Button
                disabled={loading}
                className="w-full bg-blue-600 h-12 font-black uppercase italic"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'POTWIERDŹ WYPŁATĘ'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="history" className="max-h-[300px] overflow-y-auto pr-2 space-y-2">
            {history.length === 0 ? (
              <p className="text-center text-slate-500 py-8 text-xs font-bold uppercase">
                Brak historii wypłat
              </p>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl flex items-center justify-between"
                >
                  <div>
                    <p className="font-black italic text-sm">{item.amount} $</p>
                    <p className="text-[9px] text-slate-500 font-bold uppercase">
                      {formatDateTime(item.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.status === 'pending' && (
                      <BadgeStatus
                        icon={<Clock size={10} />}
                        text="Oczekiwanie"
                        color="text-yellow-500"
                      />
                    )}
                    {item.status === 'completed' && (
                      <BadgeStatus
                        icon={<CheckCircle2 size={10} />}
                        text="Wysłano"
                        color="text-green-500"
                      />
                    )}
                    {item.status === 'rejected' && (
                      <BadgeStatus
                        icon={<AlertCircle size={10} />}
                        text="Odrzucono"
                        color="text-red-500"
                      />
                    )}
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

function BadgeStatus({ icon, text, color }: any) {
  return (
    <div
      className={`flex items-center gap-1.5 px-2 py-1 bg-black/40 rounded-md border border-white/5 ${color}`}
    >
      {icon}
      <span className="text-[8px] font-black uppercase tracking-tighter">{text}</span>
    </div>
  )
}
