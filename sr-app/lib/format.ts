// Deterministic number format — hindari beda server/client locale
export function formatNumber(n: number): string {
  // id-ID style: titik ribuan, tanpa desimal untuk KPI
  const s = Math.trunc(n).toString();
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
export function formatCoord(n: number, digits = 4): string {
  return n.toFixed(digits);
}
