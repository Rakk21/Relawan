"use client";
import { useState } from "react";

// ---- tiny icons (inline svg to avoid deps) ----
function Icon({ children, cls = "" }: { children: React.ReactNode; cls?: string }) {
  return <span className={`inline-flex items-center justify-center ${cls}`}>{children}</span>;
}

export default function SDPDashboard() {
  const [area, setArea] = useState("Select Area");
  const [showErf, setShowErf] = useState(true);

  return (
    <div className="min-h-screen bg-[#E9EBEF] p-2 sm:p-4 flex justify-center">
      {/* outer shell mimics tablet frame */}
      <div className="w-full max-w-[1500px] bg-[#F2F3F5] rounded-[24px] border border-[#E5E7EB] shadow-[0_8px_40px_rgba(0,0,0,0.08),0_1px_0_rgba(255,255,255,0.8)_inset] overflow-hidden flex flex-col">
        {/* top bar */}
        <div className="h-[56px] shrink-0 bg-[#EDEEF1] border-b border-[#E5E7EB] flex items-center gap-3 px-3 sm:px-4">
          {/* hamburger + breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            <button className="w-9 h-9 rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-center shadow-sm">
              <span className="flex flex-col gap-[4px]">
                <span className="block w-[14px] h-[2px] bg-[#374151] rounded-full" />
                <span className="block w-[14px] h-[2px] bg-[#374151] rounded-full" />
                <span className="block w-[14px] h-[2px] bg-[#374151] rounded-full" />
              </span>
            </button>
            <div className="hidden sm:flex items-center gap-2 text-[13px]">
              <span className="w-5 h-5 rounded bg-white border border-[#E5E7EB] grid place-items-center text-[#6B7280]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>
              </span>
              <span className="text-[#9CA3AF]">/</span>
              <span className="text-[#9CA3AF]">Dashboard</span>
            </div>
          </div>

          <div className="flex-1 flex justify-center">
            <div className="hidden md:flex items-center gap-2 bg-white border border-[#E5E7EB] rounded-full px-3 py-1.5 shadow-sm">
              <span className="text-[13px] font-semibold text-[#111827]">Municipality</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden sm:flex items-center gap-2 bg-white border border-[#E5E7EB] rounded-full pl-3 pr-2 py-1.5 shadow-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.8"><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z" /><circle cx="12" cy="10" r="3" /></svg>
              <span className="text-[13px] font-medium text-[#374151]">Headquarters</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
            </div>
            <button className="w-9 h-9 rounded-full bg-white border border-[#E5E7EB] grid place-items-center shadow-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#6B7280"><path d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2zm6-6v-5a6 6 0 0 0-12 0v5l-2 2v1h16v-1l-2-2z" /></svg>
            </button>
            <button className="w-9 h-9 rounded-full bg-white border border-[#E5E7EB] grid place-items-center shadow-sm overflow-hidden">
              <span className="w-6 h-6 rounded-full bg-[#E5E7EB] grid place-items-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#6B7280"><circle cx="12" cy="8" r="4" /><path d="M12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7z" /></svg>
              </span>
            </button>
          </div>
        </div>

        {/* body flex */}
        <div className="flex flex-1 min-h-0">
          {/* left sidebar */}
          <aside className="hidden lg:flex w-[188px] shrink-0 bg-[#F2F3F5] border-r border-[#E5E7EB] flex-col p-3 gap-2">
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-3 flex items-center gap-2 shadow-sm">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0EA5E9] to-[#0284C7] grid place-items-center text-white font-black text-[11px]">∞</span>
              <div>
                <div className="font-black tracking-tight text-[#0EA5E9] leading-none text-[18px]">SDP</div>
                <div className="text-[7px] tracking-[0.18em] text-[#9CA3AF] font-semibold -mt-0.5">SPATIAL DATA PLATFORM</div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#E5E7EB] px-2.5 py-2 flex items-center justify-between shadow-sm">
              <span className="inline-flex items-center gap-2 text-[12px] font-medium text-[#374151]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.6"><circle cx="12" cy="7" r="3" /><path d="M5 20a7 7 0 0 1 14 0" /><circle cx="9" cy="7" r="1" /><circle cx="15" cy="7" r="1" /></svg>
                Municipality
              </span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
            </div>

            <nav className="space-y-1.5 mt-1">
              {[
                { label: "Dashboard", active: true, icon: "▦" },
                { label: "Map", active: false, icon: "◈" },
                { label: "DMS", active: false, icon: "⧉" },
                { label: "Processing", active: false, icon: "◎" },
              ].map((it) => (
                <a
                  key={it.label}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-[13px] font-medium shadow-sm transition ${
                    it.active ? "bg-white border-[#E5E7EB] text-[#111827] shadow" : "bg-white border-[#E5E7EB]/80 text-[#6B7280] hover:bg-white"
                  }`}
                >
                  <span className="w-6 h-6 rounded-lg bg-[#F3F4F6] border border-[#E5E7EB] grid place-items-center text-[11px] text-[#6B7280]">{it.icon}</span>
                  {it.label}
                  {it.active && <span className="ml-auto w-1 h-6 bg-[#111827] rounded-full" />}
                </a>
              ))}
            </nav>

            <div className="mt-auto space-y-1.5">
              <a className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white border border-[#E5E7EB] text-[13px] font-medium text-[#374151] shadow-sm">
                <span className="w-6 h-6 rounded-lg bg-[#F3F4F6] border border-[#E5E7EB] grid place-items-center">⚙</span>Settings
              </a>
              <a className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white border border-[#E5E7EB] text-[13px] font-medium text-[#374151] shadow-sm">
                <span className="w-6 h-6 rounded-lg bg-[#F3F4F6] border border-[#E5E7EB] grid place-items-center">◐</span>Support
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" className="ml-auto"><path d="M6 9l6 6 6-6" /></svg>
              </a>
              <div className="text-[10px] text-center text-[#9CA3AF] pt-3">Powered by <span className="font-bold text-[#6B7280]">IGLOBE</span></div>
            </div>
          </aside>

          {/* center column : stats */}
          <div className="w-full lg:w-[420px] xl:w-[460px] shrink-0 bg-[#F2F3F5] p-2 sm:p-3 flex flex-col gap-3 overflow-auto">
            {/* Top card with donut + 3 metrics */}
            <div className="bg-[#EDEEF1] rounded-2xl border border-[#E5E7EB] p-3 shadow-sm">
              <div className="flex gap-3">
                <div className="flex-1 bg-white rounded-xl border border-[#E5E7EB] p-3">
                  <div className="flex items-start justify-between">
                    <div className="text-[11px] font-bold text-[#111827]">Devland Gardens</div>
                    <div className="text-[11px] font-medium text-[#6B7280]">Block A1</div>
                  </div>
                  <div className="relative mt-2 flex justify-center">
                    {/* price corners */}
                    <span className="absolute left-0 top-2 text-[9px] font-bold text-[#111827]">R999.99</span>
                    <span className="absolute right-0 top-2 text-[9px] font-bold text-[#111827]">R999.99</span>
                    <span className="absolute left-0 bottom-2 text-[9px] font-bold text-[#111827]">R999.99</span>
                    <span className="absolute right-0 bottom-2 text-[9px] font-bold text-[#111827]">R999.99</span>
                    {/* donut */}
                    <div className="relative w-[132px] h-[132px]">
                      <svg width="132" height="132" viewBox="0 0 132 132" className="rotate-[-90deg]">
                        {/* track */}
                        <circle cx="66" cy="66" r="52" fill="none" stroke="#EEF2FF" strokeWidth="14" />
                        {/* segments */}
                        {/* yellow ~45% */}
                        <circle cx="66" cy="66" r="52" fill="none" stroke="#FBBF24" strokeWidth="14" strokeDasharray={`${52 * 2 * Math.PI * 0.44} ${52 * 2 * Math.PI}`} strokeLinecap="butt" />
                        {/* blue ~15% offset */}
                        <circle cx="66" cy="66" r="52" fill="none" stroke="#38BDF8" strokeWidth="14" strokeDasharray={`${52 * 2 * Math.PI * 0.16} ${52 * 2 * Math.PI}`} strokeDashoffset={`${-52 * 2 * Math.PI * 0.44}`} strokeLinecap="butt" />
                        {/* purple ~32% */}
                        <circle cx="66" cy="66" r="52" fill="none" stroke="#818CF8" strokeWidth="14" strokeDasharray={`${52 * 2 * Math.PI * 0.32} ${52 * 2 * Math.PI}`} strokeDashoffset={`${-52 * 2 * Math.PI * 0.60}`} strokeLinecap="butt" />
                        {/* pink ~8% */}
                        <circle cx="66" cy="66" r="52" fill="none" stroke="#F472B6" strokeWidth="14" strokeDasharray={`${52 * 2 * Math.PI * 0.08} ${52 * 2 * Math.PI}`} strokeDashoffset={`${-52 * 2 * Math.PI * 0.92}`} strokeLinecap="butt" />
                      </svg>
                      <div className="absolute inset-0 grid place-items-center">
                        <div className="w-[68px] h-[68px] rounded-full bg-white border border-[#E5E7EB] shadow-sm grid place-items-center">
                          <div className="grid grid-cols-2 gap-1.5">
                            <span className="w-7 h-7 rounded-full bg-[#FEF3C7] border border-[#FDE68A] grid place-items-center text-[11px]">⚡</span>
                            <span className="w-7 h-7 rounded-full bg-[#E0F2FE] border border-[#BAE6FD] grid place-items-center text-[11px]">♨</span>
                            <span className="w-7 h-7 rounded-full bg-[#EEF2FF] border border-[#C7D2FE] grid place-items-center text-[10px] col-span-2 mx-auto">💧</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-[170px] flex flex-col gap-2">
                  {[
                    { label: "Units Used This Month", val: "9999 kWh", price: "R999.99", icon: "⚡", bg: "bg-[#FEF3C7]", border: "border-[#FDE68A]", dot: "text-[#F59E0B]" },
                    { label: "Units Used This Month", val: "9999 kLh", price: "R999.99", icon: "💧", bg: "bg-[#E0F2FE]", border: "border-[#BAE6FD]", dot: "text-[#0EA5E9]" },
                    { label: "Units Used This Month", val: "9999 kL", price: "R999.99", icon: "💧", bg: "bg-[#FCE7F3]", border: "border-[#FBCFE8]", dot: "text-[#EC4899]" },
                  ].map((c) => (
                    <div key={c.val} className="bg-white rounded-xl border border-[#E5E7EB] px-2.5 py-2.5 flex items-start justify-between shadow-sm">
                      <div>
                        <div className="text-[9px] font-semibold text-[#6B7280] leading-none">{c.label}</div>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-[11px] font-bold text-[#111827]">{c.val}</span>
                          <span className="text-[11px] font-bold text-[#111827] ml-3">{c.price}</span>
                        </div>
                      </div>
                      <span className={`w-6 h-6 rounded-full ${c.bg} border ${c.border} grid place-items-center text-[12px] leading-none ${c.dot}`}>{c.icon}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Electricity chart */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#FEF3C7] border border-[#FDE68A] grid place-items-center text-[12px]">⚡</span>
                <span className="text-[12px] font-bold text-[#111827]">Electricity</span>
                <button className="ml-auto bg-[#1F2937] text-white text-[9px] font-bold tracking-wide px-3 py-1.5 rounded-full">DETAILS</button>
              </div>
              <div className="text-[11px] text-[#6B7280] mt-1">Average over 28 day(s): <span className="font-bold text-[#111827]">1.23 kWh</span></div>
              <div className="mt-2 h-[130px] relative">
                <svg viewBox="0 0 360 130" className="w-full h-full">
                  {/* grid dashed */}
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <line key={i} x1="32" x2="360" y1={20 + i * 18} y2={20 + i * 18} stroke="#E5E7EB" strokeDasharray="4 4" strokeWidth="1" />
                  ))}
                  {/* y labels */}
                  {[60, 50, 40, 30, 20, 10, 0].map((v, i) => (
                    <text key={v} x="6" y={24 + i * 18} fontSize="9" fill="#9CA3AF">{v}</text>
                  ))}
                  {/* x labels */}
                  {["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb"].map((m, i) => (
                    <text key={m} x={36 + i * 42} y="126" fontSize="9" fill="#9CA3AF">{m}</text>
                  ))}
                  {/* line Electricity */}
                  <polyline
                    fill="none"
                    stroke="#6B7280"
                    strokeWidth="1.6"
                    points={[[24, 24], [42, 42], [78, 42], [120, 40], [162, 46], [204, 42], [246, 38], [288, 56], [330, 48], [350, 20]].map((p) => p.join(",")).join(" ")}
                  />
                  {/* dots */}
                  {[[24, 24], [78, 42], [120, 40], [162, 42], [204, 38], [246, 56], [288, 48], [350, 20]].map(([x, y], idx) => (
                    <circle key={idx} cx={x} cy={y} r="2.8" fill="#6B7280" stroke="white" strokeWidth="1.2" />
                  ))}
                </svg>
              </div>
            </div>

            {/* Water chart */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#E0F2FE] border border-[#BAE6FD] grid place-items-center text-[12px]">💧</span>
                <span className="text-[12px] font-bold text-[#111827]">Water</span>
                <button className="ml-auto bg-[#1F2937] text-white text-[9px] font-bold tracking-wide px-3 py-1.5 rounded-full">DETAILS</button>
              </div>
              <div className="text-[11px] text-[#6B7280] mt-1">Average over 28 day(s): <span className="font-bold text-[#111827]">0.07 kL</span></div>
              <div className="mt-2 h-[150px] relative">
                <svg viewBox="0 0 360 150" className="w-full h-full">
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <line key={i} x1="32" x2="360" y1={18 + i * 16} y2={18 + i * 16} stroke="#E5E7EB" strokeDasharray="4 4" strokeWidth="1" />
                  ))}
                  {[4.0, 3.5, 3.0, 2.5, 2.0, 1.5, 1.0, 0.5, 0].map((v, i) => (
                    <text key={v} x="6" y={22 + i * 16} fontSize="9" fill="#9CA3AF">{v.toFixed(1)}</text>
                  ))}
                  {["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb"].map((m, i) => (
                    <text key={m} x={36 + i * 42} y="146" fontSize="9" fill="#9CA3AF">{m}</text>
                  ))}
                  <polyline
                    fill="none"
                    stroke="#6B7280"
                    strokeWidth="1.6"
                    points={[[36, 22], [78, 96], [120, 64], [162, 64], [204, 64], [246, 96], [288, 64], [350, 64]].map((p) => p.join(",")).join(" ")}
                  />
                  {[[36, 22], [78, 96], [120, 64], [162, 64], [204, 64], [246, 96], [288, 64], [350, 64]].map(([x, y], idx) => (
                    <circle key={idx} cx={x} cy={y} r="2.8" fill="#6B7280" stroke="white" strokeWidth="1.2" />
                  ))}
                </svg>
              </div>
            </div>
          </div>

          {/* center map */}
          <div className="flex-1 min-w-0 bg-[#EDEEF1] p-2 sm:p-3 flex flex-col gap-2">
            <div className="flex-1 rounded-2xl overflow-hidden border border-[#E5E7EB] bg-white shadow-sm relative flex flex-col">
              {/* map canvas */}
              <div className="relative flex-1 bg-[#C9C9C7] overflow-hidden">
                {/* aerial base + roads + parcels (absolute) */}
                <div className="absolute inset-0 bg-[#B8B6B1]" />
                {/* roads grid */}
                <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)", backgroundSize: "120px 120px" }} />
                {/* parcels layer */}
                <div className="absolute inset-0">
                  {/* rotated parcels container */}
                  <div className="absolute inset-[-20%] rotate-[28deg] scale-[1.15]">
                    <div className="absolute inset-0 flex flex-wrap content-start gap-[6px] p-6">
                      {Array.from({ length: 48 }).map((_, i) => {
                        const isGreen = i === 18 || i === 30;
                        const isYellow = i >= 38 && i <= 45;
                        const isOrange = i === 41 || i === 46;
                        let bg = "bg-[#7B7ED6]/90";
                        let border = "border-[#6366F1]/30";
                        if (isGreen) { bg = "bg-[#22C55E]"; border = "border-[#16A34A]/40"; }
                        if (isYellow) { bg = "bg-[#FDE68A]"; border = "border-[#F59E0B]/30"; }
                        if (isOrange) { bg = "bg-[#F59E0B]"; border = "border-[#D97706]/40"; }
                        return (
                          <div
                            key={i}
                            className={`w-[92px] h-[86px] rounded-[2px] ${bg} border ${border} shadow-[inset_0_0_0_1px_rgba(255,255,255,0.35)]`}
                          />
                        );
                      })}
                    </div>
                    {/* green lines (street centerlines) */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 800 600">
                      <path d="M -50 180 L 850 180" stroke="#16A34A" strokeWidth="2" opacity="0.7" />
                      <path d="M -50 360 L 850 360" stroke="#16A34A" strokeWidth="2" opacity="0.7" />
                      <path d="M 200 -50 L 200 650" stroke="#16A34A" strokeWidth="2" opacity="0.7" />
                      <path d="M 460 -50 L 460 650" stroke="#16A34A" strokeWidth="2" opacity="0.7" />
                      <path d="M 620 -50 L 620 650" stroke="#16A34A" strokeWidth="2.2" opacity="0.9" />
                    </svg>
                  </div>
                </div>

                {/* top map toolbar vertical */}
                <div className="absolute left-2 top-2 flex flex-col gap-1">
                  <div className="bg-white rounded-lg border border-[#E5E7EB] shadow overflow-hidden">
                    <button className="w-7 h-7 grid place-items-center border-b border-[#E5E7EB]">⧉</button>
                    <button className="w-7 h-7 grid place-items-center border-b border-[#E5E7EB] text-[#6B7280]">✎</button>
                    <button className="w-7 h-7 grid place-items-center text-[#6B7280]">📏</button>
                    <button className="w-7 h-7 grid place-items-center border-t border-[#E5E7EB] text-[#6B7280]">⬢</button>
                  </div>
                </div>

                {/* popup Erf Nr */}
                {showErf && (
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[172px] bg-white rounded-xl border border-[#E5E7EB] shadow-[0_12px_30px_rgba(0,0,0,0.18)] overflow-hidden z-10">
                    <div className="flex items-center justify-between px-3 py-2 border-b border-[#E5E7EB]">
                      <span className="text-[11px] font-bold text-[#111827]">Erf Nr. 2878</span>
                      <button onClick={() => setShowErf(false)} className="w-5 h-5 grid place-items-center text-[#6B7280]">×</button>
                    </div>
                    <div className="px-3 py-2">
                      <div className="grid grid-cols-[72px_1fr] gap-y-1 text-[10px] leading-4">
                        <span className="text-[#6B7280] py-1.5 border-b border-[#F3F4F6]">Extention</span>
                        <span className="text-[#6B7280] font-medium border-b border-[#F3F4F6] py-1.5 border-l border-[#F3F4F6] pl-3">Proper</span>
                        <span className="text-[#6B7280] py-1.5 border-b border-[#F3F4F6]">Township</span>
                        <span className="text-[#6B7280] border-b border-[#F3F4F6] py-1.5 border-l border-[#F3F4F6] pl-3">Cityville</span>
                        <span className="text-[#6B7280] py-1.5 border-b border-[#F3F4F6]">Zone</span>
                        <span className="text-[#6B7280] border-b border-[#F3F4F6] py-1.5 border-l border-[#F3F4F6] pl-3">General Business</span>
                        <span className="text-[#6B7280] py-1.5 border-b border-[#F3F4F6]">Bulk</span>
                        <span className="text-[#6B7280] border-b border-[#F3F4F6] py-1.5 border-l border-[#F3F4F6] pl-3">2.0</span>
                        <span className="text-[#6B7280] py-1.5 border-b border-[#F3F4F6]">Density</span>
                        <span className="text-[#6B7280] border-b border-[#F3F4F6] py-1.5 border-l border-[#F3F4F6] pl-3">N/A</span>
                        <span className="text-[#6B7280] py-1.5">Area</span>
                        <span className="text-[#6B7280] py-1.5 border-l border-[#F3F4F6] pl-3">2500.54m²</span>
                      </div>
                    </div>
                    <div className="px-2 pb-2 space-y-1.5">
                      {["PRIMARY USE", "CONCENT USE", "BUILDING LINE"].map((t) => (
                        <button key={t} className="w-full bg-[#9CA3AF] text-white text-[8px] font-bold tracking-wide py-1.5 rounded-full">{t}</button>
                      ))}
                      <button className="w-full bg-[#1F2937] text-white text-[8px] font-bold tracking-wide py-1.5 rounded-full">CERTIFICATE</button>
                    </div>
                    {/* caret */}
                    <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-l border-b border-[#E5E7EB] rotate-45" />
                  </div>
                )}

                {/* zoom controls */}
                <div className="absolute left-2 bottom-10 bg-white rounded-lg border border-[#E5E7EB] shadow overflow-hidden">
                  <button className="w-7 h-7 grid place-items-center border-b border-[#E5E7EB] font-bold text-[#111827]">+</button>
                  <button className="w-7 h-7 grid place-items-center font-bold text-[#111827]">−</button>
                </div>

                {/* bottom coords bar */}
                <div className="absolute bottom-0 inset-x-0 h-6 bg-[#6B7280]/90 backdrop-blur flex items-center gap-3 px-2 text-[9px] text-white/90">
                  <span>◎ XX°XX&apos;XX.XX&quot; S XX°XX&apos;XX.XX&quot; W</span>
                  <span className="hidden sm:inline">Scale: XXX</span>
                  <span className="hidden md:inline">View Altitude: XX km</span>
                  <span className="ml-auto hidden sm:inline">Message Seder Updates</span>
                </div>
              </div>
            </div>
          </div>

          {/* right layers panel */}
          <aside className="hidden lg:flex w-[264px] shrink-0 bg-[#F2F3F5] border-l border-[#E5E7EB] flex-col">
            <div className="flex-1 bg-[#EDEEF1] m-2 rounded-2xl border border-[#E5E7EB] overflow-hidden flex flex-col shadow-sm">
              <div className="bg-white border-b border-[#E5E7EB] px-3 py-2.5 flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-[#EF4444] grid place-items-center text-white text-[11px]">✕</span>
                <span className="text-[12px] font-bold text-[#111827]">Layers</span>
                <span className="flex-1 h-[1px] bg-[#E5E7EB] ml-2" />
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2"><path d="M6 15l6-6 6 6" /></svg>
              </div>

              <div className="p-2.5 space-y-2 overflow-auto flex-1">
                <div className="flex items-center gap-2 bg-white border border-[#E5E7EB] rounded-lg px-2.5 py-2 shadow-sm">
                  <span className="text-[11px] font-medium text-[#374151]">2023/08/30</span>
                  <span className="ml-auto w-6 h-6 rounded bg-[#F3F4F6] border border-[#E5E7EB] grid place-items-center text-[10px] text-[#6B7280]">📅</span>
                </div>

                <div className="flex gap-2">
                  <div className="flex-1 bg-white border border-[#E5E7EB] rounded-full px-2.5 py-2 flex items-center justify-between shadow-sm">
                    <span className="text-[11px] text-[#6B7280]">{area}</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
                  </div>
                  <button className="bg-[#1F2937] text-white text-[10px] font-bold tracking-wide px-4 py-2 rounded-full">VIEW</button>
                </div>

                <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
                  <div className="px-2.5 py-2 flex items-center gap-2 border-b border-[#E5E7EB]">
                    <span className="w-4 h-4 rounded bg-[#E5E7EB] grid place-items-center text-[9px]">◈</span>
                    <span className="text-[11px] font-semibold text-[#111827]">Thematics</span>
                    <span className="ml-auto inline-flex items-center gap-1">
                      <span className="w-4 h-4 rounded-full border border-[#E5E7EB] grid place-items-center text-[8px] text-[#6B7280]">◯</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
                    </span>
                  </div>

                  <div className="px-2 py-1 max-h-[420px] overflow-auto space-y-0.5 custom-scrollbar">
                    {/* Zoning */}
                    <div className="flex items-center gap-2 py-1.5">
                      <span className="w-3 h-3 rounded-full border-2 border-[#111827] grid place-items-center"><span className="w-1.5 h-1.5 rounded-full bg-[#111827]" /></span>
                      <span className="text-[11px] font-semibold text-[#111827]">Zoning</span>
                      <span className="ml-auto inline-flex items-center gap-1">
                        <span className="w-3.5 h-3.5 rounded border border-[#E5E7EB] grid place-items-center text-[7px]">◯</span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"><path d="M6 15l6-6 6 6" /></svg>
                      </span>
                    </div>

                    {[
                      { label: "Street", color: "#3B82F6", icon: "—" },
                      { label: "Street Widening", color: "#60A5FA", icon: "▭" },
                      { label: "Public Open Space", color: "#22C55E", icon: "■" },
                      { label: "Public Parking", color: "#3B82F6", icon: "■" },
                      { label: "Existing Street", color: "#93C5FD", icon: "■" },
                      { label: "Cemetery", color: "#BFDBFE", icon: "✚" },
                      { label: "Municipal Purposes", color: "#FCA5A5", pattern: true, icon: "⬡" },
                      { label: "Government Purposes", color: "#9CA3AF", icon: "■" },
                      { label: "Single Residential", color: "#FEF3C7", icon: "■" },
                      { label: "Special Residential", color: "#FDE68A", patternDot: true, icon: "■" },
                      { label: "General Residential 1", color: "#E7E5A8", icon: "■" },
                      { label: "General Residential 2", color: "#FEF3C7", icon: "■" },
                      { label: "Accommodation", color: "#BAE6FD", icon: "■" },
                      { label: "General Business", color: "#C4B5FD", icon: "■" },
                      { label: "Local Business", color: "#DDD6FE", icon: "▣" },
                      { label: "Office", color: "#7DD3FC", icon: "■" },
                      { label: "Light Industrial", color: "#F9A8D4", icon: "■" },
                      { label: "Industrial", color: "#EF4444", icon: "■" },
                      { label: "Institutional", color: "#E5E7EB", icon: "◎" },
                      { label: "Undetermined", color: "#E5E7EB", pattern: true, icon: "⬡" },
                      { label: "Special", color: "#F3E8FF", pattern: true, icon: "⬡" },
                      { label: "Special Designation", color: "#FEF9C3", icon: "•" },
                    ].map((row) => (
                      <div key={row.label} className="flex items-center gap-2 py-1 hover:bg-[#F9FAFB] rounded px-1">
                        <span
                          className="w-3.5 h-3.5 rounded-[3px] border border-black/10 shrink-0"
                          style={{
                            background: row.color,
                            backgroundImage: row.pattern ? "repeating-linear-gradient(45deg, rgba(0,0,0,0.12) 0 2px, transparent 2px 4px)" : row.patternDot ? "radial-gradient(circle, rgba(0,0,0,0.2) 1px, transparent 1px)" : undefined,
                            backgroundSize: row.patternDot ? "4px 4px" : undefined,
                          }}
                        />
                        <span className="text-[11px] text-[#374151] leading-none truncate">{row.label}</span>
                        <span className="ml-auto w-3.5 h-3.5 rounded border border-[#E5E7EB] bg-white grid place-items-center text-[8px] text-[#6B7280]">👁</span>
                      </div>
                    ))}

                    {[
                      { label: "Township", eye: "●" },
                      { label: "Extension", eye: "●" },
                      { label: "Bulk", eye: "●" },
                      { label: "Density", eye: "●" },
                    ].map((r) => (
                      <div key={r.label} className="flex items-center gap-2 py-1.5 border-t border-[#F3F4F6] mt-1">
                        <span className="w-3 h-3 rounded-full border border-[#6B7280] grid place-items-center"><span className="w-1 h-1 rounded-full bg-[#6B7280]" /></span>
                        <span className="text-[11px] font-medium text-[#374151]">{r.label}</span>
                        <span className="ml-auto w-3.5 h-3.5 rounded border border-[#E5E7EB] grid place-items-center text-[8px]">▾</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-2 pb-2 flex justify-end">
                <span className="w-6 h-6 rounded bg-white border border-[#E5E7EB] grid place-items-center text-[10px]">⛶</span>
              </div>
            </div>
          </aside>
        </div>

        {/* mobile hint */}
        <div className="lg:hidden bg-white border-t border-[#E5E7EB] px-3 py-2 flex items-center justify-between text-[11px] text-[#6B7280]">
          <span>Geser untuk lihat peta lengkap</span>
          <button onClick={() => setShowErf(!showErf)} className="bg-[#1F2937] text-white px-3 py-1.5 rounded-full text-[11px] font-bold">
            {showErf ? "Hide Erf" : "Show Erf"}
          </button>
        </div>
      </div>
    </div>
  );
}
