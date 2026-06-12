import React from 'react'
import { ShieldCheck, Lock } from 'lucide-react'

export const PrivacyNote: React.FC = () => {
  return (
    <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-4 flex gap-3 items-start hover:border-slate-700/60 transition duration-200">
      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 flex-shrink-0">
        <Lock className="w-4 h-4" />
      </div>
      <div className="space-y-1">
        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
          <span>Client-Side Privacy Assured</span>
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        </h4>
        <p className="text-[10px] text-slate-400 leading-normal font-medium">
          Carbonly is built as a zero-server static platform. All information (your profile preferences, logged commutes, meal types, and energy logs) is stored exclusively inside your browser's local cache (<code className="text-[9px] bg-slate-950 px-1 py-0.5 rounded border border-slate-900">localStorage</code>). No personal data ever leaves your device.
        </p>
      </div>
    </div>
  )
}
export default PrivacyNote
