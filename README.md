# SR Map System — Relawan Siti Roika Dapil 1 Kota Semarang

**Status:** Dokumentasi V1 Lengkap (Siap Implementasi)

### Isi Paket Dokumentasi
```
SR-Relawan-Siti-Roika/
├── docs/
│   ├── PRD.md                 ← Product Requirements Document (scope, fitur F01-F11, KPI, roadmap)
│   ├── ARCHITECTURE.md        ← Arsitektur, ERD, Prisma schema, API contract, deployment Azure
│   └── RANCANGAN-SISTEM.md    ← Wireframe replika screenshot, user flow, warna segmentasi, validasi import
├── templates/
│   ├── template_data_tps.xlsx ← (akan digenerate saat scaffolding code)
│   └── template_relawan.xlsx
└── README.md                  ← file ini
```

### 3 Peta Kunci (sesuai request)
1. **Peta Relawan** — cluster marker warna by segmentasi (Relawan SR, Majelis Taklim, RT/RW, UMKM, OJOL, Advokasi, Remaja)
2. **Peta Suara SR 2024 VS Peta Relawan SR** — overlay heatmap + titik, analisis kecamatan suara tinggi tapi relawan tipis
3. **Peta TPS Dapil 1 VS Peta Relawan SR** — blank spot detection 500m (TPS merah = tanpa relawan)

### Dashboard Replika Screenshot
Header hitam `DAPIL 1 · KOTA SEMARANG / Relawan Siti Roika` + 5 cards (Koordinator, Relawan, TPS Terdata, Suara Siti Roika orange active, Suara PKS) + Tabs Peta Suara/Koordinator/Relawan/Data TPS + Sub-filter + Empty state.

### Cara Pakai Dokumen
1. Share `docs/PRD.md` ke tim pemenangan untuk approval scope.
2. Share `docs/ARCHITECTURE.md` ke tim tech untuk estimasi & setup DB.
3. Share `docs/RANCANGAN-SISTEM.md` ke designer/dev untuk eksekusi UI peta.

### Langkah Selanjutnya (Pilih salah satu)
- **Opsi A:** Aku scaffold boilerplate `Next.js + Prisma + PostGIS + Leaflet` replika 100% screenshot — tinggal `npm install && npm run dev`.
- **Opsi B:** Export 3 dokumen ini ke PDF siap cetak.

Bilang aja "lanjut scaffold" atau "export PDF", langsung aku eksekusi.
