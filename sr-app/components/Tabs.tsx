"use client";
export type TabKey = "peta" | "koordinator" | "relawan" | "data-tps";

export function PillTabs({active, onChange}:{active:TabKey; onChange:(k:TabKey)=>void}){
  const tabs: {k:TabKey; label:string; desc:string}[] = [
    {k:"peta", label:"Peta Suara", desc:"3 peta"},
    {k:"koordinator", label:"Koordinator", desc:"6 orang"},
    {k:"relawan", label:"Relawan", desc:"segmentasi"},
    {k:"data-tps", label:"Data TPS", desc:"34 kel"},
  ];
  return (
    <div className="inline-flex bg-[#F0E8DD]/80 backdrop-blur rounded-full p-1 gap-1 border border-[#E7DDD0]/60 shadow-sm max-w-full overflow-x-auto no-scrollbar flex-nowrap">
      {tabs.map(t=>(
        <button key={t.k} onClick={()=>onChange(t.k)}
          className={`shrink-0 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-sm sm:text-base font-semibold transition flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${active===t.k ? "bg-white shadow-[0_2px_10px_rgba(28,25,23,0.08)] text-[#1C1917] border border-[#E7DDD0]" : "text-stone-600 hover:text-stone-900 hover:bg-white/60"}`}>
          {active===t.k && <span className="w-1.5 h-1.5 rounded-full bg-[#F97316] shadow-[0_0_6px_rgba(249,115,22,0.5)] shrink-0" />}
          {t.label}<span className={`hidden sm:inline text-sm font-medium px-2 py-0.5 rounded-full shrink-0 ${active===t.k ? "bg-[#FFF7ED] text-orange-700 border border-orange-200" : "bg-white/70 text-stone-500 border border-stone-200"}`}>{t.desc}</span>
        </button>
      ))}
    </div>
  )
}

export function SubFilter({mode, onMode}:{mode:"total"|"sr"|"pks"; onMode:(m:"total"|"sr"|"pks")=>void}){
  const items = [
    {k:"total" as const, label:"Suara per TPS", hint:"Total sah"},
    {k:"sr" as const, label:"Perolehan Siti Roika", hint:"PKS Dapil 1"},
    {k:"pks" as const, label:"Suara PKS per TPS", hint:"13.651"},
  ];
  return (
    <div className="flex gap-2.5 overflow-x-auto no-scrollbar flex-nowrap pb-1 -mb-1 max-w-full">
      {items.map(it=>(
        <button key={it.k} onClick={()=>onMode(it.k)}
          className={`shrink-0 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-sm sm:text-base font-bold border transition flex items-center gap-2 whitespace-nowrap ${mode===it.k ? "bg-gradient-to-br from-[#F97316] to-[#EA580C] text-white border-[#EA580C] shadow-[0_4px_12px_rgba(234,88,12,0.25)]" : "bg-white text-stone-700 border-[#E7DDD0] hover:bg-stone-50 hover:border-stone-300 shadow-sm"}`}>
          {mode===it.k && <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />}
          {it.label}<span className={`text-sm font-medium px-2 py-0.5 rounded-full shrink-0 ${mode===it.k ? "bg-white/20 text-white" : "bg-stone-100 text-stone-500"}`}>{it.hint}</span>
        </button>
      ))}
    </div>
  )
}
