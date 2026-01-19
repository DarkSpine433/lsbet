import { Info } from 'lucide-react'
import React from 'react'

type Props = {}

const LsBetVersion = (props: Props) => {
  return (
    <div className="text-[11px] text-slate-600 flex items-center justify-center gap-1">
      <Info className="h-3 w-3 text-slate-600" />v 1.0.0-alpha Supported by LsBet technology
    </div>
  )
}

export default LsBetVersion
