import React from "react"

export function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string
  value: number
  icon: React.ElementType
  accent: string
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div
        className="absolute top-0 right-0 h-20 w-20 rounded-bl-[3rem] opacity-10"
        style={{ background: accent }}
      />
      <div
        className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl"
        style={{ background: `${accent}18` }}
      >
        <Icon className="h-5 w-5" style={{ color: accent }} />
      </div>
      <p className="text-3xl font-black tracking-tight text-slate-900">
        {value}
      </p>
      <p className="mt-0.5 text-xs font-semibold tracking-wider text-slate-400 uppercase">
        {label}
      </p>
    </div>
  )
}
