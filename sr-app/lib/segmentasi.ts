export type Segmentasi = {
  slug: string;
  nama: string;
  warna: string;
  bg: string;
  badge: string;
};

export const SEGMENTASI: Segmentasi[] = [
  { slug: "sr-inti", nama: "Relawan SR Inti", warna: "#F97316", bg: "bg-orange-500", badge: "bg-orange-100 text-orange-700 border-orange-200" },
  { slug: "majelis-taklim", nama: "Majelis Taklim", warna: "#7C3AED", bg: "bg-violet-600", badge: "bg-violet-100 text-violet-700 border-violet-200" },
  { slug: "rt-rw", nama: "RT/RW", warna: "#0EA5E9", bg: "bg-sky-500", badge: "bg-sky-100 text-sky-700 border-sky-200" },
  { slug: "umkm", nama: "UMKM", warna: "#10B981", bg: "bg-emerald-500", badge: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { slug: "ojol", nama: "OJOL", warna: "#22C55E", bg: "bg-green-500", badge: "bg-green-100 text-green-700 border-green-200" },
  { slug: "advokasi", nama: "Advokasi", warna: "#EF4444", bg: "bg-red-500", badge: "bg-red-100 text-red-700 border-red-200" },
  { slug: "remaja", nama: "Remaja/Milenial", warna: "#EC4899", bg: "bg-pink-500", badge: "bg-pink-100 text-pink-700 border-pink-200" },
  { slug: "lainnya", nama: "Lainnya", warna: "#6B7280", bg: "bg-zinc-500", badge: "bg-zinc-100 text-zinc-600 border-zinc-200" },
];

export function segBySlug(slug: string) {
  return SEGMENTASI.find((s) => s.slug === slug) ?? SEGMENTASI[7];
}
