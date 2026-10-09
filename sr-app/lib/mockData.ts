import { SEGMENTASI } from "./segmentasi";

export type TPS = {
  id: string;
  noTps: string;
  kelurahan: string;
  kecamatan: string;
  lat: number;
  lng: number;
  dpt: number;
  suaraSah: number;
  suaraSitiRoika: number;
  suaraPKS: number;
  alamatTps?: string;
};

export type Koordinator = {
  id: string;
  nama: string;
  wa: string;
  kecamatan: string;
  kelurahan: string;
  lat: number;
  lng: number;
  jmlRelawan?: number;
  status: "aktif" | "nonaktif";
};

export type Relawan = {
  id: string;
  nama: string;
  wa: string;
  kelurahan: string;
  kecamatan: string;
  rtRw: string;
  lat: number;
  lng: number;
  segmentasi: string; // slug
  koordinatorId: string;
  koordinatorNama: string;
  status: "aktif" | "nonaktif";
  alamat?: string;
};

// DAPIL 1 KOTA SEMARANG — RESMI KPU 2019 & 2024 (7 kursi)
// Sumber: Wikipedia + PKPU Dapil — Dapil Kota Semarang 1
export const KECAMATAN = [
  "Semua kecamatan",
  "Semarang Tengah",
  "Semarang Timur",
  "Semarang Utara",
] as const;

// Koordinat pusat tiap kecamatan (dari Wikipedia geohack)
export const KECAMATAN_CENTER: Record<string, { lat:number; lng:number }> = {
  "Semarang Tengah": { lat: -6.9837, lng: 110.4197 },
  "Semarang Timur": { lat: -6.9703, lng: 110.4372 },
  "Semarang Utara": { lat: -6.9592, lng: 110.4172 },
};

// Kelurahan resmi per kecamatan — sesuai Permendagri + Wikipedia (34 kel)
// Verifikasi 12 Okt 2026: Semarang Tengah 15, Semarang Timur 10, Semarang Utara 9 — cocok dengan
// https://id.wikipedia.org/wiki/Semarang_Tengah,_Semarang,
// https://id.wikipedia.org/wiki/Semarang_Timur,_Semarang,
// https://id.wikipedia.org/wiki/Semarang_Utara,_Semarang, dan Permendagri 050-145/2022
export const KELURAHAN_BY_KEC: Record<string, string[]> = {
  "Semarang Tengah": [
    "Bangunharjo","Brumbungan","Gabahan","Jagalan","Karangkidul","Kauman","Kembangsari","Kranggan","Miroto","Pandansari","Pekunden","Pendrikan Kidul","Pendrikan Lor","Purwodinatan","Sekayu",
  ],
  "Semarang Timur": [
    "Bugangan","Karangtempel","Karangturi","Kebonagung","Kemijen","Mlatibaru","Mlatiharjo","Rejomulyo","Rejosari","Sarirejo",
  ],
  "Semarang Utara": [
    "Bandarharjo","Bulu Lor","Dadapsari","Kuningan","Panggung Kidul","Panggung Lor","Plombokan","Purwosari","Tanjung Mas",
  ],
};

// Pusat tiap KELURAHAN — jitter deterministik dari pusat kecamatan agar titik peta
// tersebar sesuai kelurahan (bukan numpuk di pusat kecamatan). Untuk produksi
// ganti dengan koordinat kantor kelurahan / batas BPS/BIG hasil survei lapangan.
function hashStr(s: string): number {
  let h = 2166136261;
  for(let i=0;i<s.length;i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
// ±0.012° ≈ ±1.3 km — cukup untuk sebar 9–15 kelurahan dalam luas 6–11 km² tiap kecamatan
function kelurahanOffset(key: string, rangeLat=0.012, rangeLng=0.012): { dLat:number; dLng:number }{
  const h = hashStr(key);
  const a = (h % 1000) / 1000;           // 0..1
  const b = ((h >>> 10) % 1000) / 1000;  // 0..1
  return { dLat: (a - 0.5) * 2 * rangeLat, dLng: (b - 0.5) * 2 * rangeLng };
}
export const KELURAHAN_CENTER: Record<string, { lat:number; lng:number }> = (() => {
  const m: Record<string,{lat:number;lng:number}> = {};
  for(const kec of KECAMATAN.slice(1) as string[]){
    const base = KECAMATAN_CENTER[kec];
    for(const kel of KELURAHAN_BY_KEC[kec]){
      const { dLat, dLng } = kelurahanOffset(`${kec}|${kel}`);
      // round 4 desimal (~11 m) biar stabil
      m[kel] = { lat: Math.round((base.lat + dLat)*10000)/10000, lng: Math.round((base.lng + dLng)*10000)/10000 };
    }
  }
  // Koreksi manual beberapa kelurahan biar urutan pesisir/timur-barat lebih masuk akal
  if(m["Tanjung Mas"]) m["Tanjung Mas"] = { lat: -6.9485, lng: 110.415 };
  if(m["Bandarharjo"]) m["Bandarharjo"] = { lat: -6.955, lng: 110.410 };
  if(m["Bulu Lor"]) m["Bulu Lor"] = { lat: -6.960, lng: 110.425 };
  if(m["Plombokan"]) m["Plombokan"] = { lat: -6.966, lng: 110.418 };
  if(m["Kemijen"]) m["Kemijen"] = { lat: -6.968, lng: 110.444 };
  if(m["Rejomulyo"]) m["Rejomulyo"] = { lat: -6.973, lng: 110.433 };
  if(m["Mlatibaru"]) m["Mlatibaru"] = { lat: -6.975, lng: 110.442 };
  if(m["Pekunden"]) m["Pekunden"] = { lat: -6.985, lng: 110.417 };
  if(m["Sekayu"]) m["Sekayu"] = { lat: -6.982, lng: 110.414 };
  if(m["Kauman"]) m["Kauman"] = { lat: -6.981, lng: 110.423 };
  if(m["Pendrikan Kidul"]) m["Pendrikan Kidul"] = { lat: -6.990, lng: 110.412 };
  if(m["Pendrikan Lor"]) m["Pendrikan Lor"] = { lat: -6.988, lng: 110.415 };
  return m;
})();
export function getKelurahanCenter(kelurahan: string, kecamatan: string){
  return KELURAHAN_CENTER[kelurahan] ?? KECAMATAN_CENTER[kecamatan] ?? { lat: -6.98, lng: 110.42 };
}

export const KOORDINATORS: Koordinator[] = [
  { id: "k1", nama: "Ahmad Fauzi", wa: "6281211110001", kecamatan: "Semarang Tengah", kelurahan: "Pekunden", lat: getKelurahanCenter("Pekunden","Semarang Tengah").lat, lng: getKelurahanCenter("Pekunden","Semarang Tengah").lng, status: "aktif" },
  { id: "k2", nama: "Siti Kholifah", wa: "6281211110002", kecamatan: "Semarang Tengah", kelurahan: "Sekayu", lat: getKelurahanCenter("Sekayu","Semarang Tengah").lat, lng: getKelurahanCenter("Sekayu","Semarang Tengah").lng, status: "aktif" },
  { id: "k3", nama: "Bambang Wijaya", wa: "6281211110003", kecamatan: "Semarang Timur", kelurahan: "Kemijen", lat: getKelurahanCenter("Kemijen","Semarang Timur").lat, lng: getKelurahanCenter("Kemijen","Semarang Timur").lng, status: "aktif" },
  { id: "k4", nama: "Rina Marlina", wa: "6281211110004", kecamatan: "Semarang Timur", kelurahan: "Rejomulyo", lat: getKelurahanCenter("Rejomulyo","Semarang Timur").lat, lng: getKelurahanCenter("Rejomulyo","Semarang Timur").lng, status: "aktif" },
  { id: "k5", nama: "Joko Prasetyo", wa: "6281211110005", kecamatan: "Semarang Utara", kelurahan: "Bandarharjo", lat: getKelurahanCenter("Bandarharjo","Semarang Utara").lat, lng: getKelurahanCenter("Bandarharjo","Semarang Utara").lng, status: "aktif" },
  { id: "k6", nama: "Dewi Fortuna", wa: "6281211110006", kecamatan: "Semarang Utara", kelurahan: "Tanjung Mas", lat: getKelurahanCenter("Tanjung Mas","Semarang Utara").lat, lng: getKelurahanCenter("Tanjung Mas","Semarang Utara").lng, status: "aktif" },
];

// Seeded PRNG biar server & client hasil sama — hindari hydration mismatch
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(0x1a2b3c4d);
function rnd(min: number, max: number) { return rng() * (max - min) + min; }

// Generate TPS: 1 TPS per kelurahan Dapil 1 → 34 TPS (real Dapil 1 punya ratusan TPS, ini seed prototype)
// Titik TPS sekarang berpusat di KELURAHAN (jitter kecil ±0.004° ≈ 400m) — tidak lagi numpuk di pusat kecamatan
export const TPS_SEED: TPS[] = (() => {
  const out: TPS[] = [];
  let id = 1;
  for (const kec of KECAMATAN.slice(1) as string[]) {
    const kels = KELURAHAN_BY_KEC[kec];
    for (const kel of kels) {
      const base = getKelurahanCenter(kel, kec);
      const dpt = Math.floor(rnd(220, 295));
      const suaraSah = Math.floor(dpt * rnd(0.78, 0.92));
      const suaraSR = Math.floor(suaraSah * rnd(0.10, 0.30));
      const suaraPKS = Math.floor(suaraSah * rnd(0.18, 0.38));
      out.push({
        id: `tps-${id++}`,
        noTps: "01",
        kelurahan: kel,
        kecamatan: kec,
        lat: base.lat + rnd(-0.004, 0.004),
        lng: base.lng + rnd(-0.004, 0.004),
        dpt, suaraSah, suaraSitiRoika: suaraSR, suaraPKS,
        alamatTps: `Balai RW 01 Kel. ${kel}`,
      });
    }
  }
  // Tambah TPS ke-02 untuk kelurahan padat penduduk (pusat kota)
  const extraKel = [
    { kec:"Semarang Tengah", kel:"Pekunden" },
    { kec:"Semarang Tengah", kel:"Sekayu" },
    { kec:"Semarang Timur", kel:"Kemijen" },
    { kec:"Semarang Utara", kel:"Bandarharjo" },
  ];
  for(const e of extraKel){
    const base = getKelurahanCenter(e.kel, e.kec);
    const dpt = Math.floor(rnd(240, 290));
    const suaraSah = Math.floor(dpt * rnd(0.78, 0.92));
    const suaraSR = Math.floor(suaraSah * rnd(0.10, 0.30));
    const suaraPKS = Math.floor(suaraSah * rnd(0.18, 0.38));
    out.push({
      id: `tps-${id++}`,
      noTps: "02",
      kelurahan: e.kel,
      kecamatan: e.kec,
      lat: base.lat + rnd(-0.004, 0.004),
      lng: base.lng + rnd(-0.004, 0.004),
      dpt, suaraSah, suaraSitiRoika: suaraSR, suaraPKS,
      alamatTps: `Balai RW 02 Kel. ${e.kel}`,
    });
  }
  return out;
})();

// ~42 relawans — sebar di 34 kelurahan Dapil 1, sengaja tipis di beberapa kelurahan untuk demo blank spot
// Titik relawan juga berpusat di kelurahan (jitter ±0.005°)
export const RELAWAN_SEED: Relawan[] = (() => {
  const out: Relawan[] = [];
  const names = ["Budi Santoso","Siti Aminah","Agus Wijaya","Dewi Lestari","Rudi Hartono","Nurul Huda","Slamet Riyadi","Yuni Astuti","Hendra Gunawan","Lilis Suryani","Fajar Nugroho","Maya Sari","Eko Prasetyo","Wulan Dari","Joko Widodo","Ani Rahayu","Dian Permata","Rizki Maulana","Fitri Handayani","Bambang S","Sari Indah","Umar Faruq","Tuti Alawiyah","Hadi Saputra","Ratna Dewi","Imam Syafi'i","Nadia Putri","Asep Saepudin","Dedi Hermawan","Lestari W","Oki Setiawan","Desi Marlina","Andi Pratama","Sri Wahyuni","Bayu Anggara","Rahmat Hidayat","Ika Kartika","Farhan Aziz","Citra Lestari","Gilang Ramadhan","Puji Astuti","Sony Wijaya","Intan Permata","Doni Saputra","Mega Wati","Arif Rahman","Eka Saputra","Tono Supriadi"];
  let idx=0;
  for (let i = 0; i < 46; i++) {
    const kec = KECAMATAN[1 + (i % 3)] as string;
    const kels = KELURAHAN_BY_KEC[kec];
    const kel = kels[i % kels.length];
    const seg = SEGMENTASI[i % SEGMENTASI.length].slug;
    // Buat blank spot di beberapa kelurahan: Semarang Utara bagian pesisir & Semarang Timur Kemijen
    if ((kec === "Semarang Utara" && ["Tanjung Mas","Bandarharjo"].includes(kel) && i % 2 === 0) || (kec==="Semarang Timur" && kel==="Kemijen" && i%3===0)) {
      // skip untuk simulasi blank spot
      if (i % 4 === 0) continue;
    }
    const koos = KOORDINATORS.filter(k => k.kecamatan === kec);
    const ko = koos[i % koos.length] ?? KOORDINATORS[0];
    const base = getKelurahanCenter(kel, kec);
    out.push({
      id: `rel-${idx+1}`,
      nama: names[idx % names.length] + (idx >= names.length ? ` ${Math.floor(idx/names.length)+1}` : ""),
      wa: `62812${String(10000000 + idx).padStart(8,"0")}`,
      kelurahan: kel, kecamatan: kec,
      rtRw: `${String((idx%8)+1).padStart(2,"0")}/${String((idx%5)+1).padStart(2,"0")}`,
      lat: base.lat + rnd(-0.005, 0.005),
      lng: base.lng + rnd(-0.005, 0.005),
      segmentasi: seg,
      koordinatorId: ko.id, koordinatorNama: ko.nama,
      status: idx % 13 === 0 ? "nonaktif" : "aktif",
      alamat: `Jl. ${kel} No. ${idx+1}`,
    });
    idx++;
  }
  return out;
})();
