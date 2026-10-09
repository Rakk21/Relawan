# SR Map System — Pemetaan Relawan Siti Roika Dapil 1 Kota Semarang

**Status:** Dokumentasi V1 selesai dan siap masuk tahap implementasi.

## Isi Dokumentasi

```text
SR-Relawan-Siti-Roika/
├── docs/
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   └── RANCANGAN-SISTEM.md
├── templates/
│   ├── template_data_tps.xlsx
│   └── template_relawan.xlsx
└── README.md
```

Keterangan dokumen:

* **PRD.md** — Berisi gambaran sistem, fitur yang akan dibuat, target yang ingin dicapai, dan rencana pengembangan.
* **ARCHITECTURE.md** — Menjelaskan teknologi yang digunakan, struktur database, ERD, API, dan rencana deployment.
* **RANCANGAN-SISTEM.md** — Berisi rancangan tampilan website, alur penggunaan sistem, warna untuk setiap segmentasi relawan, dan aturan saat mengimpor data.
* **Template Excel** — Digunakan sebagai format awal untuk memasukkan data relawan dan TPS. File template akan dibuat saat proses setup proyek.

## Tiga Peta Utama

### 1. Peta Relawan

Peta ini digunakan untuk melihat persebaran relawan berdasarkan wilayah dan segmentasinya, seperti Relawan SR, Majelis Taklim, RT/RW, UMKM, OJOL, Advokasi, dan Remaja. Setiap segmentasi dibedakan dengan warna marker agar lebih mudah dikenali.

### 2. Peta Suara SR 2024 vs Peta Relawan SR

Peta ini digunakan untuk membandingkan persebaran suara SR pada tahun 2024 dengan jumlah relawan yang ada saat ini. Dari perbandingan tersebut, kita bisa melihat wilayah yang memiliki suara tinggi tetapi jumlah relawannya masih sedikit.

### 3. Peta TPS Dapil 1 vs Peta Relawan SR

Peta ini digunakan untuk melihat lokasi TPS dan persebaran relawan di sekitarnya. TPS yang belum memiliki relawan dalam radius 500 meter akan ditandai dengan warna merah agar wilayah yang belum terjangkau bisa lebih mudah diketahui.

## Rancangan Dashboard

Dashboard menggunakan header berwarna hitam dengan informasi **Dapil 1 · Kota Semarang / Relawan Siti Roika**.

Di bagian utama terdapat lima kartu statistik yang menampilkan jumlah koordinator, relawan, TPS terdata, suara Siti Roika, dan suara PKS. Kartu suara Siti Roika menggunakan warna oranye sebagai penanda utama.

Dashboard juga dilengkapi beberapa menu, yaitu Peta Suara, Koordinator, Relawan, dan Data TPS. Setiap menu memiliki filter yang bisa digunakan untuk menampilkan data sesuai kebutuhan.

Jika belum ada data yang ditampilkan, sistem akan menampilkan halaman kosong dengan keterangan yang jelas agar pengguna tahu bahwa data belum tersedia.

## Cara Menggunakan Dokumentasi

1. **PRD.md** dibagikan ke tim pemenangan untuk membahas dan menyepakati fitur yang akan dibuat.
2. **ARCHITECTURE.md** digunakan oleh tim pengembang sebagai acuan dalam menyiapkan teknologi, database, dan API.
3. **RANCANGAN-SISTEM.md** digunakan sebagai panduan saat membuat tampilan website dan fitur pemetaan.

## Langkah Selanjutnya

Setelah dokumentasi selesai, pengembangan bisa dilanjutkan ke tahap berikutnya.

* **Opsi A — Mulai membuat sistem:** Menyiapkan proyek menggunakan Next.js, Prisma, PostGIS, dan Leaflet, kemudian mulai mengembangkan fitur sesuai rancangan yang sudah dibuat.
* **Opsi B — Membuat dokumentasi PDF:** Mengubah ketiga dokumen menjadi PDF agar lebih mudah dibagikan dan digunakan sebagai bahan pembahasan bersama tim.
