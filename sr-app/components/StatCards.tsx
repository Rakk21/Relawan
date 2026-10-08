"use client";
import { formatNumber } from "@/lib/format";
type Props = { k:number; r:number; t:number; sr:number; pks:number };

function Card({label,value, active, sub, accent}:{label:string; value:number| string; active?:boolean; sub?:string; accent?: string}){
  const display = typeof value === "number" ? formatNumber(value) : String(value);
  if(active){
    return (
      <div className="rounded-2xl border border-[#EA580C]/30 p-5 flex flex-col justify-between min-h-[118px] relative overflow-hidden text-white shadow-[0_8px_24px_rgba(234,88,12,0.25)]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F97316] via-[#EA580C] to-[#C2410C]" />
        <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.12] via-transparent to-transparent" />
        <div className="absolute -right-8 -top-8 w-24 h-24 bg-white/20 blur-2xl rounded-full" />
        <div className="relative">
          <div className="text-sm tracking-[0.14em] font-bold text-white/90 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-white shadow" />{label}</div>
          <div className="text-sm text-white/80 mt-1">Pileg 2024 · Dapil 1</div>
        </div>
        <div className="relative">
          <div className="text-4xl font-extrabold tabular-nums leading-none tracking-tight">{display}</div>
          {sub && <div className="text-[15px] mt-1 text-white/90 font-medium leading-5">{sub}</div>}
        </div>
      </div>
    )
  }
  const accentDot = accent ?? "#A8A29E";
  return (
    <div className="rounded-2xl border border-[#E7DDD0] p-5 flex flex-col justify-between min-h-[118px] relative overflow-hidden bg-white shadow-[0_4px_16px_rgba(28,25,23,0.06)] hover:shadow-[0_8px_24px_rgba(28,25,23,0.08)] transition-shadow">
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#E7DDD0] to-transparent" />
      <div className="absolute -right-6 -top-6 w-20 h-20 blur-2xl rounded-full opacity-[0.08]" style={{background: accentDot}} />
      <div className="text-sm tracking-[0.14em] font-bold text-stone-500 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full" style={{background: accentDot}} />{label}</div>
      <div>
        <div className="text-4xl font-extrabold tabular-nums leading-none mt-2 tracking-tight text-[#1C1917]">{display}</div>
        {sub && <div className="text-[15px] mt-1 text-stone-600 leading-6">{sub}</div>}
      </div>
    </div>
  )
}
export default function StatCards({k,r,t,sr,pks}:Props){
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
      <Card label="KOORDINATOR" value={k} accent="#0EA5E9" sub="Aktif · 3 kecamatan" />
      <Card label="RELAWAN" value={r} accent="#10B981" sub="Aktif terpetakan" />
      <Card label="TPS TERDATA" value={t} accent="#78716C" sub="34 kelurahan" />
      <Card label="SUARA SITI ROIKA" value={sr} active sub="Mock agregasi · target 3.214" />
      <Card label="SUARA PKS" value={pks} accent="#7C3AED" sub="Dapil 1: 13.651" />
    </div>
  )
}
