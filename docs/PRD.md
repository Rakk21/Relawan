# PRD — Sistem Pemetaan Relawan & Suara Dapil 1 Kota Semarang
## Relawan Siti Roika (SR)

**Versi:** 1.0  
**Tanggal:** 7 Oktober 2026  
**Status:** Draft untuk Review  
**Dapil:** Dapil 1 Kota Semarang — **Semarang Tengah + Semarang Timur + Semarang Utara** (7 kursi, 34 kelurahan) — resmi PKPU Dapil Pileg 2024. Tempat **Siti Roika, S.Pd. (PKS, 3.214 suara)** terpilih. *Koreksi 07-10-2026: sebelumnya tertulis 5 kecamatan selatan — sudah disesuaikan ke resmi KPU.*  
**Referensi UI:** Dashboard screenshot `Relawan Siti Roika - Peta Suara` (5 cards + tab Peta Suara/Koordinator/Relawan/Data TPS)

---

### 1. Ringkasan Eksekutif

Sistem ini memetakan **kekuatan relawan vs perolehan suara 2024 per TPS** untuk strategi pemenangan. Tiga peta inti:

1.  **Peta Relawan** — sebaran titik relawan by segmentasi & koordinator.
2.  **Peta Komparasi A: Suara SR 2024 vs Peta Relawan SR** — korelasi & gap analysis.
3.  **Peta Komparasi B: Peta TPS Dapil 1 vs Peta Relawan SR** — deteksi blank spot TPS tanpa relawan.

Dashboard utama menampilkan 5 metrik: Koordinator, Relawan, TPS Terdata, Suara Siti Roika, Suara PKS — dengan filter `Suara per TPS / Perolehan Siti Roika / Suara PKS per TPS` dan dropdown `Semua kecamatan`.

### 2. Tujuan & Latar Belakang

- Konsolidasi data relawan yang tersebar (WA group, Excel manual) menjadi single source of truth.
- Menjawab pertanyaan strategi: dimana suara PKS/SR kuat tapi relawan tipis? TPS mana belum ada penjaga?
- Menyiapkan rekrutmen berbasis peta: prioritas rekrut di TPS blank spot dengan DPT tinggi.

### 3. Scope

**In Scope (V1):**
- Segmentasi relawan, manajemen koordinator & relawan, master Data TPS (import Excel/CSV), 3 peta, dashboard, import/export, auth role-based.
 - Dapil 1 resmi (Semarang Tengah 15 kel + Semarang Timur 10 kel + Semarang Utara 9 kel, 7 kursi). Data suara 2024 (SR 3.214 + PKS 13.651 di Dapil 1) level TPS.

**Out of Scope (V1 — Next Phase):**
- Aplikasi mobile native,absensi relawan dengan GPS live, fitur broadcast WA blast, e-rekap C1 plano OCR, integrasi KPU API.

### 4. Stakeholder & User Roles

| Role | Deskripsi | Hak Akses |
| :--- | :--- | :--- |
| **Super Admin** | Tim IT Pusat | CRUD semua, manajemen user, upload TPS, hapus data, lihat audit log |
| **Admin Dapil** | Koordinator Dapil 1 | Kelola koordinator/relawan se-Dapil 1, upload TPS, lihat semua peta |
| **Koordinator Relawan** | Korwil/Korcam/Korlur | Kelola relawan binaannya saja, edit profil relawan, lihat peta wilayahnya |
| **Relawan** | Anggota lapangan | Lihat profil sendiri, update lokasi/wa, lihat tugas (read-only peta umum bila diizinkan) |
| **Viewer / Tim Pemenangan** | Konsultan/Caleg | Read-only dashboard & peta, export laporan |

> Auth: Email + Password + OTP WA (opsional V1.1). Session 24 jam. Password hash bcrypt.

### 5. Functional Requirements

#### F01 — Segmentasi Relawan (P0)
- Kategori default: `Relawan SR Inti`, `Majelis Taklim`, `RT/RW`, `UMKM`, `OJOL`, `Advokasi`, `Remaja/Milenial`, `Lainnya`
- Admin dapat tambah/edit/hapus segmentasi + atur `warna marker` & `icon` di peta.
- Satu relawan hanya 1 segmentasi utama (FK). Opsional tag sekunder.
- Filter & rekap: jumlah relawan per segmentasi per kecamatan.

**Acceptance:** CRUD segmentasi, warna tampil konsisten di peta & badge tabel.

#### F02 — Manajemen Koordinator (P0)
- Field: `id, nama_lengkap, nik (encrypted), wa, alamat, kecamatan, kelurahan, foto, status_aktif, created_at`
- Assign wilayah: 1 koordinator bisa pegang multi kelurahan/kecamatan. Validasi tumpang tindih wilayah muncul warning.
- Relasi: `koordinator 1—N relawan`.
- Fitur: tambah/edit/nonaktifkan, cari by nama/WA, filter by kecamatan, lihat jumlah relawan binaan.

#### F03 — Manajemen Relawan (P0)
- Field: `id, nama_lengkap, nik_encrypted, wa, alamat_lengkap, kelurahan, kecamatan, rt/rw, lat, lng, segmentasi_id, koordinator_id, tps_terdekat_id, status_aktif, foto, keterangan`
- Geocoding: input alamat → auto geocode ke lat/lng (Nominatim), bisa drag marker.
- Validasi: NIK 16 digit unik (soft warning jika duplikat), WA format +62.
- CRUD + Import massal (Excel). Export Excel/PDF.
- Tabel: paginasi, search, filter (segmentasi, koordinator, kecamatan, kelurahan, status).

#### F04 — Manajemen Data TPS (P0)
- Master TPS: `id, no_tps, kelurahan, kecamatan, dapil, alamat_tps, lat, lng, dpt, dptb, suara_sah, suara_tidak_sah, suara_siti_roika, suara_pks, suara_partai_lain, tahun_pemilu`
- Upload: Excel/CSV via tab `Data TPS` (sesuai empty state screenshot: "Belum ada data suara. Unggah file Excel/CSV di tab Data TPS").
- Validasi import: cek header, no_tps duplikat per kelurahan, lat/lng valid, nilai suara <= DPT.
- Template baku disediakan (`templates/template_data_tps.xlsx`).
- Riwayat upload: siapa upload, kapan, berapa row sukses/gagal.

#### F05 — Dashboard Statistik (P0) — Replika Screenshot
- 5 Cards: `KOORDINATOR`, `RELAWAN`, `TPS TERDATA`, `SUARA SITI ROIKA`, `SUARA PKS` — angka live dari DB.
- Tabs: `Peta Suara | Koordinator | Relawan | Data TPS` (default Peta Suara).
- Sub-filter Peta Suara: `Suara per TPS | Perolehan Siti Roika (active orange #F97316) | Suara PKS per TPS` + Dropdown `Semua kecamatan`.
- Jika data kosong → empty state sesuai screenshot.

#### F06 — Peta Relawan (P0)
- Engine: Leaflet + OpenStreetMap (gratis) / Mapbox (opsional).
- Marker: cluster, warna by segmentasi, popup (nama, segmentasi, koordinator, WA, kelurahan).
- Filter: segmentasi, koordinator, kecamatan/kelurahan, status.
- Cluster click → zoom, spiderfy jika padat.
- Action: klik marker → link ke detail relawan.

#### F07 — Peta Suara (P0)
- Visualisasi: choropleth per kelurahan/kecamatan + heatmap per TPS.
- Mode: `Suara per TPS` (total suara sah), `Perolehan Siti Roika`, `Suara PKS per TPS` — skala warna gradasi.
- Legend & tooltip: jumlah suara + persentase vs DPT.

#### F08 — Peta Komparasi A: Suara SR 2024 vs Peta Relawan SR (P1)
- Layout: overlay (heatmap suara + titik relawan) dengan slider opacity, atau split-screen vertical.
- Analisis: agregasi `SUM(suara_siti_roika), COUNT(relawan) GROUP BY kecamatan/kelurahan`.
- Insight auto: `Kecamatan X: suara tinggi (top 3) tapi relawan < 10 → prioritas rekrut`.
- Export PNG peta.

#### F09 — Peta Komparasi B: Peta TPS Dapil 1 vs Peta Relawan SR (P1)
- Logika blank spot: PostGIS `ST_DWithin(tps.geom, relawan.geom, 500m)`. TPS tanpa relawan dalam radius = merah, ada = hijau.
- Tabel blank spot: daftar TPS tanpa relawan, sort by DPT terbesar (prioritas).
- Filter radius: 300m / 500m / 1km.

#### F10 — Pencarian, Filter, Export (P0/P1)
- Global search relawan/koordinator/TPS.
- Filter konsisten di semua peta & tabel.
- Export: Excel (data), PDF (laporan rekap + peta snapshot), PNG (peta).

#### F11 — Admin & Audit (P1)
- Manajemen user & role, reset password, nonaktifkan user.
- Audit log: siapa create/update/delete relawan/TPS.

### 6. Non-Functional Requirements

| Aspek | Target |
| :--- | :--- |
| Performa | Peta 2000 TPS + 5000 relawan load < 3 detik (cluster + vector tile) |
| Responsive | Mobile-first, tablet & desktop. PWA installable |
| Keamanan | HTTPS, bcrypt, NIK/WA encrypted at rest (AES-256), RBAC, rate limit login |
| Ketersediaan | 99.5% uptime, backup harian DB |
| Kompatibilitas | Chrome/Edge/Firefox terbaru, Android/iOS browser |
| Privasi | NIK hanya tampil 4 digit terakhir untuk role viewer. Export NIK hanya Super Admin |

### 7. Data & Template Import

Header Excel wajib (urutan bebas, case-insensitive):
`no_tps | kelurahan | kecamatan | lat | lng | dpt | suara_sah | suara_siti_roika | suara_pks`

Contoh baris:
```
01 | Pekunden | Semarang Tengah | -6.9837 | 110.4197 | 278 | 240 | 52 | 88
01 | Kemijen  | Semarang Timur  | -6.9703 | 110.4372 | 265 | 220 | 48 | 76
01 | Bandarharjo | Semarang Utara | -6.9592 | 110.4172 | 282 | 250 | 61 | 92
```

Aturan: `suara_siti_roika + suara_pks <= suara_sah`, `lat -11..6, lng 95..141` (Indonesia).

### 8. KPI Keberhasilan V1

- 100% TPS Dapil 1 terdata (N TPS)
- 100% relawan punya koordinator & segmentasi & koordinat
- < 10% TPS blank spot (tanpa relawan 500m)
- Waktu upload 1000 TPS < 30 detik

### 9. Risiko & Mitigasi

| Risiko | Mitigasi |
| :--- | :--- |
| Data TPS lat/lng tidak akurat | Sediakan geocoding massal + validasi manual drag marker |
| NIK ganda / data kotor | Validasi import + laporan duplikat |
| Peta lambat di HP spek rendah | Cluster + pagination + vector tile |

### 10. Roadmap

- **M1 (2 minggu):** F01-F05 + Auth + Import TPS
- **M2 (1 minggu):** F06-F07 Peta Relawan & Peta Suara
- **M3 (1 minggu):** F08-F09 Peta Komparasi + Blank Spot + Export
- **M4 (1 minggu):** Hardening, UAT, Deploy, Training

### 11. Kriteria Penerimaan (UAT)

- Admin dapat import 500 TPS tanpa error & peta langsung tampil.
- Filter segmentasi OJOL hanya tampil marker hijau.
- Peta komparasi B menampilkan minimal 1 TPS merah jika ada TPS tanpa relawan.
- Viewer tidak bisa akses menu hapus.

---
**Lampiran:** Lihat `ARCHITECTURE.md` (arsitektur & ERD) dan `RANCANGAN-SISTEM.md` (wireframe & API spec).
