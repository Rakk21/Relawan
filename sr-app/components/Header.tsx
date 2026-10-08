"use client";
export default function Header({ onKeluar }: { onKeluar?: () => void }) {
  return (
    <header className="sticky top-0 z-[1002] border-b border-white/10 isolate">
      <div className="bg-[#1A0F0F] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#1A0F0F] via-[#2A1A10] to-[#3A2314] opacity-100" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#F97316]/[0.14] via-transparent to-transparent" />
        <div className="absolute -right-20 -top-10 w-64 h-32 bg-[#F97316]/20 blur-[40px] rounded-full" />
        <div className="absolute -left-10 -bottom-8 w-40 h-20 bg-[#10B981]/10 blur-[30px] rounded-full" />
        <div className="relative px-4 sm:px-6 py-5 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/15 rounded-full px-3 py-1.5 text-sm tracking-[0.14em] font-semibold text-[#FDBA74]">● DAPIL 1 · KOTA SEMARANG · 7 KURSI</span>
              <span className="hidden sm:inline-flex text-base text-white/55">Pileg 2024 · 34 kelurahan</span>
            </div>
            <div className="flex items-baseline gap-2 mt-2 flex-wrap">
              <h1 className="text-3xl sm:text-[36px] font-extrabold tracking-tight text-white leading-none">Relawan Siti Roika</h1>
              <span className="hidden sm:inline text-base font-medium text-white/65">S.Pd. · PKS Dapil 1 · 3.214 suara</span>
            </div>
            <p className="text-base text-white/65 mt-2 hidden sm:block leading-6">Semarang Tengah · Semarang Timur · Semarang Utara — pemetaan relawan vs suara per TPS</p>
            <p className="text-base text-white/65 mt-1 sm:hidden">Dapil 1 — 3 kecamatan · 34 kelurahan</p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="hidden lg:flex items-center gap-1.5 bg-white/10 border border-white/15 rounded-full px-3.5 py-2 text-sm text-white/85">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" /> Prototype V1 Live
            </div>
            <span className="hidden sm:inline-flex text-sm bg-white/10 border border-white/20 rounded-full px-3.5 py-2 text-white/85">Super Admin</span>
            <button onClick={onKeluar} className="text-base bg-white text-[#1A0F0F] rounded-full px-5 py-2.5 font-bold hover:bg-zinc-100 shadow">Keluar</button>
          </div>
        </div>
      </div>
      <div className="h-[1px] bg-gradient-to-r from-transparent via-[#F97316]/30 to-transparent" />
    </header>
  );
}
