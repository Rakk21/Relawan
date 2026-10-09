export const TARGET_RELAWAN_DEFAULT = 10000;
export const TARGET_KOOR_DEFAULT = 250; // contoh presentasi: 10.000 relawan / 250 koordinator — bisa diubah ke 8.000 via Atur Target

export type Progress = {
  current: number;
  target: number;
  pct: number; // 0..Infinity, 1 desimal
  pctClamped: number; // 0..100 untuk lebar bar
  remaining: number;
  status: "belum" | "on-track" | "tercapai" | "over";
  label: string;
  color: string; // hex
  bg: string; // tailwind bg
};

export function calcProgress(current: number, target: number): Progress {
  const t = Math.max(1, Math.floor(target || 1));
  const pctRaw = (current / t) * 100;
  const pct = Math.round(pctRaw * 10) / 10; // 1 desimal
  const pctClamped = Math.max(0, Math.min(100, pctRaw));
  const remaining = Math.max(0, t - current);
  let status: Progress["status"] = "belum";
  let label = "Belum tercapai";
  let color = "#EF4444"; // red
  let bg = "bg-red-500";
  if (pct >= 100 && pct < 120) { status = "tercapai"; label = "Target tercapai 🎉"; color = "#16A34A"; bg = "bg-emerald-500"; }
  else if (pct >= 120) { status = "over"; label = "Melebihi target 🚀"; color = "#059669"; bg = "bg-emerald-600"; }
  else if (pct >= 50) { status = "on-track"; label = "On track"; color = "#2563EB"; bg = "bg-[#2563EB]"; }
  else if (pct >= 25) { status = "belum"; label = "Perlu akselerasi"; color = "#F59E0B"; bg = "bg-amber-500"; }
  else { status = "belum"; label = "Baru mulai"; color = "#EF4444"; bg = "bg-red-500"; }
  return { current, target: t, pct, pctClamped, remaining, status, label, color, bg };
}

export function formatPct(pct: number): string {
  // id-ID: koma desimal, hilangkan ,0
  const s = pct.toFixed(1).replace(".", ",");
  return s.endsWith(",0") ? s.slice(0, -2) : s;
}
