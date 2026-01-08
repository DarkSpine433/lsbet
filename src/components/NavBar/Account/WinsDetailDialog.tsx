'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatDateTime } from '@/utilities/formatDateTime'
import { Button } from '@/components/ui/button'

export default function WinsDetailDialog({
  wins,
  children,
}: {
  wins: any[]
  children: React.ReactNode
}) {
  const ITEMS_PER_PAGE = 5
  const [currentPage, setCurrentPage] = useState(1)

  // Grupowanie danych
  const games = Array.from(new Set(wins.map((w) => w.gameTitle)))

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl bg-[#020617] border-slate-800 text-slate-100 max-h-[80dvh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4 border-b border-slate-800">
          <DialogTitle className="text-xl font-black italic uppercase tracking-tight">
            Szczegółowa Historia Wygranych
          </DialogTitle>
        </DialogHeader>

        <Tabs
          defaultValue={games[0]}
          className="flex-1 flex flex-col overflow-hidden mt-4"
          onValueChange={() => setCurrentPage(1)}
        >
          <TabsList className="bg-slate-900 border border-slate-800 p-1 mb-4 overflow-x-auto justify-start flex-nowrap">
            {games.map((game) => (
              <TabsTrigger
                key={game}
                value={game}
                className="text-[10px] font-black uppercase px-4 py-2 data-[state=active]:bg-blue-600"
              >
                {game}
              </TabsTrigger>
            ))}
          </TabsList>

          {games.map((game) => {
            const gameWins = wins.filter((w) => w.gameTitle === game)
            const gameTotal = gameWins.reduce((acc, curr) => acc + (Number(curr.winAmount) || 0), 0)

            // Paginacja
            const totalPages = Math.ceil(gameWins.length / ITEMS_PER_PAGE)
            const paginatedWins = gameWins.slice(
              (currentPage - 1) * ITEMS_PER_PAGE,
              currentPage * ITEMS_PER_PAGE,
            )

            return (
              <TabsContent
                key={game}
                value={game}
                className="flex-1 flex flex-col overflow-hidden outline-none"
              >
                <div className="bg-blue-600/5 border border-blue-500/20 rounded-lg p-3 mb-4 flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase text-slate-400">
                    Łącznie w tej grze:
                  </span>
                  <span className="text-lg font-black text-green-500">
                    {gameTotal.toFixed(2)} PLN
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {paginatedWins.map((win) => (
                    <div
                      key={win.id}
                      className="bg-slate-900/40 border border-slate-800 p-3 rounded-xl flex justify-between items-center group hover:border-slate-700 transition-colors"
                    >
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500 font-bold uppercase">
                          {formatDateTime(win.createdAt)}
                        </span>
                        <span className="text-[9px] text-blue-500 font-black tracking-widest uppercase">
                          Mnożnik: x{win.multiplier}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] text-slate-500 font-bold uppercase">Wygrana</p>
                        <p className="text-sm font-black text-white">
                          +{Number(win.winAmount).toFixed(2)} PLN
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* PROSTA PAGINACJA */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 py-4 border-t border-slate-800 mt-2">
                    <Button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                      className="h-8 bg-slate-900 text-[10px] font-black"
                    >
                      Poprzednia
                    </Button>
                    <span className="text-[10px] font-black text-slate-500 uppercase">
                      Strona {currentPage} z {totalPages}
                    </span>
                    <Button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => p + 1)}
                      className="h-8 bg-slate-900 text-[10px] font-black"
                    >
                      Następna
                    </Button>
                  </div>
                )}
              </TabsContent>
            )
          })}
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
