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
import { Wallet, History, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
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
        <Button className="w-full bg-blue-600 hover:bg-blue-500 font-black italic uppercase">
          Wypłać środki
        </Button>
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
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500">
                  Kwota wypłaty ($)
                </label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-black/40 border-slate-800 font-black italic"
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500">
                  Dane do przelewu / Adres portfela
                </label>
                <Input
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="bg-black/40 border-slate-800 text-sm"
                  placeholder="Np. Numer konta bankowego Postaci..."
                  required
                />
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
