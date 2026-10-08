# Relawan Siti Roika — Dapil 1 Kota Semarang (sr-app)

Next.js 16 App Router + Leaflet — Dashboard Peta Relawan Dapil 1.

## Jalankan lokal

```bash
cd sr-app
npm install
npm run dev
```

Buka http://localhost:3000

## Fitur V1

- **Peta Relawan** — cluster marker per segmentasi (Relawan SR, Majelis Taklim, RT/RW, UMKM, OJOL, Advokasi, Remaja) — `components/Maps.tsx`
- **Perbandingan A: Suara SR 2024 vs Relawan** — heatmap overlay + filter kecamatan — `lib/geo.ts` `korelasiByKecamatan`
- **Perbandingan B: TPS Dapil 1 vs Relawan** — blank spot detection radius 300/500/1000m — `lib/geo.ts` `blankSpot`
- Dashboard sidebar + 4 KPI cards + donut segmentasi + Top 5 Koordinator + aktivitas — `app/page.tsx:197`
- Import TPS/Relawan CSV/XLSX (papaparse + xlsx) + validasi + export CSV — `app/page.tsx:88`

## Struktur

```
sr-app/
├── app/page.tsx        # dashboard utama
├── app/layout.tsx
├── components/Maps.tsx # MapRelawan / MapSuara / MapKomparasiA/B
├── components/Tabs.tsx
├── lib/mockData.ts     # seed TPS/relawan/koordinator
├── lib/segmentasi.ts
├── lib/geo.ts          # blankSpot, korelasi
└── lib/format.ts
```

Dokumentasi lengkap di `../docs/` (PRD, ARCHITECTURE, RANCANGAN-SISTEM) dan template CSV di `../templates/`.

## Build

```bash
npm run build
npm start
```
