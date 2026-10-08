"use client";
import { KECAMATAN, KELURAHAN_BY_KEC } from "@/lib/mockData";
import { formatNumber } from "@/lib/format";

export default function HeroDapil({ totalTPS, totalRelawan, totalSR, totalPKS }: { totalTPS:number; totalRelawan:number; totalSR:number; totalPKS:number }) {
  const kecamatan = KECAMATAN.slice(1) as string[];
  return (
    <section className="rounded-2xl border border-[#E7DDD0] overflow-hidden bg-white shadow-[0_8px_30px_rgba(28,25,23,0.06)]">
      <div className="mesh-cream px-5 sm:px-7 py-6 sm:py-7">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 text-[15px]">
              <span className="bg-[#1A0F0F] text-white rounded-full px-3.5 py-2 font-bold tracking-wide">DAPIL 1</span>
              <span className="text-stone-700">Kota Semarang · Pileg DPRD 2024</span>
              <span className="hidden sm:inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full px-3 py-1.5 text-sm font-semibold">7 kursi</span>
            </div>
            <h2 className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-[#1C1917] mt-3.5 text-balance leading-tight">Pusat kota Semarang — 3 kecamatan pesisir & heritage</h2>
            <p className="text-base leading-7 text-stone-700 mt-3 max-w-2xl">
              Dapil tempat <b className="text-[#1C1917]">Siti Roika, S.Pd. (PKS)</b> terpilih dengan <b className="text-[#EA580C]">3.214 suara</b>. Total suara sah Dapil 1: <b>137.656</b> — PKS 13.651, PDIP 46.077 (terbesar), Gerindra 18.786. Prototype memetakan TPS & relawan per kelurahan untuk strategi blank spot & korelasi suara.
            </p>
            <div className="flex flex-wrap gap-2.5 mt-5">
              {kecamatan.map(k => (
                <span key={k} className="inline-flex items-center gap-1.5 bg-white border border-[#E7DDD0] rounded-full px-4 py-2.5 text-[15px] font-medium text-stone-700 shadow-sm">
                  <span className="w-2 h-2 rounded-full" style={{background: k==="Semarang Tengah"? "#F97316" : k==="Semarang Timur"? "#0EA5E9" : "#10B981"}} />
                  {k} <span className="text-stone-500">· {KELURAHAN_BY_KEC[k].length} kel</span>
                </span>
              ))}
              <span className="inline-flex items-center bg-[#FFF7ED] border border-orange-200 rounded-full px-4 py-2.5 text-[15px] font-semibold text-orange-800">34 kelurahan total</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:w-[380px] shrink-0">
            <MiniStat label="TPS mock" value={totalTPS} hint="1 per kel + extra" tone="stone" />
            <MiniStat label="Relawan aktif" value={totalRelawan} hint="sebar 34 kel" tone="emerald" />
            <MiniStat label="Suara SR (mock)" value={totalSR} hint="agregasi TPS" tone="orange" />
            <MiniStat label="Suara PKS (mock)" value={totalPKS} hint="agregasi TPS" tone="violet" />
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-2 text-[15px]">
          <span className="text-stone-700 font-medium">Kelurahan unggulan:</span>
          <span className="bg-white border border-[#E7DDD0] rounded-full px-3.5 py-2 shadow-sm">Pekunden</span>
          <span className="bg-white border border-[#E7DDD0] rounded-full px-3.5 py-2 shadow-sm">Kemijen</span>
          <span className="bg-white border border-[#E7DDD0] rounded-full px-3.5 py-2 shadow-sm">Bandarharjo</span>
          <span className="bg-white border border-[#E7DDD0] rounded-full px-3.5 py-2 shadow-sm">Kauman</span>
          <span className="bg-white border border-[#E7DDD0] rounded-full px-3.5 py-2 shadow-sm">Tanjung Mas</span>
          <span className="text-stone-500">+ 29 lainnya — lihat dropdown kecamatan</span>
        </div>
      </div>
      <div className="h-1 bg-gradient-to-r from-[#F97316] via-[#EA580C] to-[#F97316] opacity-90" />
    </section>
  );
}

function MiniStat({label, value, hint, tone}:{label:string; value:number; hint:string; tone:"orange"|"stone"|"emerald"|"violet"}){
  const bg = tone==="orange" ? "bg-[#FFF7ED] border-orange-200 text-orange-900" : tone==="emerald" ? "bg-emerald-50 border-emerald-200 text-emerald-900" : tone==="violet" ? "bg-violet-50 border-violet-200 text-violet-900" : "bg-stone-50 border-stone-200 text-stone-900";
  return (
    <div className={`rounded-xl border p-4 ${bg}`}>
      <div className="text-sm tracking-wide font-semibold opacity-70">{label}</div>
      <div className="text-3xl font-extrabold tabular-nums leading-none mt-1.5">{formatNumber(value)}</div>
      <div className="text-sm opacity-60 mt-1">{hint}</div>
    </div>
  )
}
