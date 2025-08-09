import React from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Button } from '../ui/button'
import { Bell, BellRing } from 'lucide-react'

const Notification = () => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-md">
          <Bell className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" side="bottom" align="end">
        <div className="p-3 border-b">
          <h4 className="font-semibold text-sm text-slate-800">Powiadomienia</h4>
        </div>
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="p-3 bg-slate-100 rounded-full">
            <BellRing className="h-6 w-6 text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-700 mt-4">Brak nowych powiadomień</p>
          <p className="text-xs text-slate-500 mt-1">
            Wszystkie Twoje powiadomienia pojawią się tutaj.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default Notification
