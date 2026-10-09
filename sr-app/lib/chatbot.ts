import type { RekapKecamatan, RekapKelurahan } from "./geo";
import type { Progress } from "./target";

export type ChatCtx = {
  stats: { k: number; r: number; t: number; sr: number; pks: number };
  targetRelawan: number;
  targetKoor: number;
  progRelawan: Progress;
  progKoor: Progress;
  rekapKec: RekapKecamatan[];
  rekapKel: RekapKelurahan[];
  segCounts: Record<string, number>;
  topKoors: { nama: string; kecamatan: string; cnt: number }[];
  blanks: { tps: { kelurahan: string; kecamatan: string; dpt: number; noTps: string }; jarakTerdekat: number | null; blank: boolean }[];
};

function fmt(n: number): string {
  return Math.trunc(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
function pct1(p: number): string {
  const s = p.toFixed(1).replace(".", ",");
  return s.endsWith(",0") ? s.slice(0, -2) : s;
}

export const CHAT_SUGGESTIONS = [
  "Progress target relawan?",
  "Jelaskan blank spot",
  "Cara import data?",
  "Strategi tambah relawan?",
  "Rekap per kecamatan",
  "Siapa Siti Roika?",
  "Segmentasi apa saja?",
  "Kelurahan paling kurang relawan?",
];

const GLOSSARY: Record<string, string> = {
  dapil: "Dapil (Daerah Pemilihan) 1 Kota Semarang = 3 kecamatan (Semarang Tengah 15 kel, Timur 10 kel, Utara 9 kel, total 34 kel) dengan 7 kursi DPRD Kota Semarang — alokasi pakai metode Sainte-Laguë (KPU 2019 & 2024).",
  dpt: "DPT (Daftar Pemilih Tetap) = jumlah pemilih terdaftar per TPS. Di Dapil 1 prototype berkisar 220–295 per TPS. `Suara sah ≤ DPT`.",
  tps: "TPS (Tempat Pemungutan Suara) = titik pemungutan suara berkoordinat lat/lng. Dashboard sekarang 38 TPS (34 kel ×1 + 4 TPS ekstra di Pekunden, Sekayu, Kemijen, Bandarharjo). Scroll Data TPS untuk detail.",
  "suara sah": "Suara sah ≤ DPT. Di dashboard: `SR` = suara Siti Roika (PKS) per TPS, `PKS` = total suara partai per TPS. Warna gradasi oranye/hijau = SR/PKS vs DPT.",
  "sainte": "Sainte-Laguë = metode bagi kursi: suara partai dibagi 1,3,5,7... ambil 7 nilai tertinggi → dapat kursi. Di Dapil 1 2024: PDIP 2 kursi, PKB/Gerindra/PKS/Demokrat/PSI @1 kursi.",
  "blank spot": "Blank spot = TPS tanpa relawan aktif dalam radius (pilih 300/500/1000m di peta Komparasi B). Merah = blank, hijau = ter-cover. Prioritas rekrut = blank dengan DPT terbesar.",
  segmentasi: "Segmentasi = kategori relawan: SR Inti (oranye), Majelis Taklim (ungu), RT/RW (biru), UMKM (hijau), OJOL (hijau terang), Advokasi (merah), Remaja (pink), Lainnya (abu) — warna konsisten di peta & badge.",
  koordinator: "Koordinator = pembina relawan (1 koor membina N relawan). Total aktif live di dashboard. Top 5 ada di kartu kanan dashboard.",
  relawan: "Relawan = sukarelawan lapangan ber-KTP Dapil 1, punya lat/lng, segmentasi, dan koordinator. Status `aktif/nonaktif`, bisa di-import massal via Excel/CSV.",
  pks: "PKS = Partai Keadilan Sejahtera. Siti Roika, S.Pd. caleg PKS Dapil 1 terpilih 2024 dengan 3.214 suara (dari 13.651 suara PKS Dapil 1).",
};

export function answerChatbot(qRaw: string, ctx: ChatCtx): string {
  const q = qRaw.toLowerCase().trim();
  if (!q) return helpText();

  // small talk / thanks
  if (/^(makasih|terima kasih|thanks|thank you|mantap|keren|oke|ok|sip|bagus)\b/.test(q)) {
    return `Sama-sama! 🙏 Senang bisa bantu.\n\nMau lanjut tanya apa? Mis: "strategi tambah relawan?" atau "rekap Kemijen?" — semua jawab dari data live Dapil 1.`;
  }
  if (/^(halo|hai|hello|hi|hey|selamat|pagi|siang|sore|malam)\b/.test(q) || q.length < 4) {
    return `Halo! Saya **Tanya Data** — asisten serbaguna Dapil 1 Kota Semarang (34 kelurahan, 3 kec, 7 kursi). Saya bisa jawab **apa saja**, tapi selalu berdasar data sistem (live dari dashboard).\n\nCoba:\n• "Progress target relawan?"\n• "Jelaskan blank spot"\n• "Cara import data?"\n• "Strategi menang di Semarang Timur?"\n• "Apa itu DPT?"\n\nAtau tanya umum — saya jawab + kaitkan ke Dapil 1 bila relevan.`;
  }
  if (q.includes("bantuan") || q.includes("bisa apa") || q.includes("fitur") || q.includes("help") || q.includes("cara pakai") || q.includes("apa saja bisa")) {
    return helpText();
  }

  // siapa siti roika / pks
  if (q.includes("siti roika") || q.includes("roika") || (q.includes("siapa") && (q.includes("caleg") || q.includes("pks")))) {
    return `👩‍🏫 **Siti Roika, S.Pd.** — Caleg **PKS Dapil 1 Kota Semarang**, terpilih DPRD Kota Semarang 2024 dengan **3.214 suara** (total PKS Dapil 1: 13.651). Dapil 1 = Semarang Tengah + Timur + Utara (34 kel, 7 kursi). Data suara & relawan di dashboard live dihitung per TPS/kelurahan — tanya "rekap Kemijen" untuk lihat per kelurahan.`;
  }
  if (q === "pks" || q.includes("partai keadilan") || (q.includes("pks") && q.includes("apa"))) {
    return GLOSSARY["pks"] + `\n\nDi sistem: filter segmentasi & rekap suara SR vs PKS per TPS/kelurahan. Tanya "rekap per kecamatan" untuk komposisi.`;
  }

  // target / progress
  if (q.includes("target") || q.includes("progress") || q.includes("capaian") || q.includes("persentase") || q.includes("persen") || q.includes("%") || (q.includes("sisa") && (q.includes("relawan") || q.includes("koor")))) {
    const pr = ctx.progRelawan, pk = ctx.progKoor;
    return `🎯 **Progress Target (live)**\n\n• Relawan: **${fmt(ctx.stats.r)} / ${fmt(ctx.targetRelawan)} — ${pct1(pr.pct)}%** — ${pr.label} (sisa ${fmt(pr.remaining)})\n• Koordinator: **${fmt(ctx.stats.k)} / ${fmt(ctx.targetKoor)} — ${pct1(pk.pct)}%** — ${pk.label} (sisa ${fmt(pk.remaining)})\n\nUbah di Dashboard → ⚙ Atur Target (tersimpan di browser, ideal untuk simulasi presentasi 10.000/250 atau 10.000/8.000).`;
  }

  // cara pakai sistem
  if (q.includes("cara import") || q.includes("import") && (q.includes("gimana") || q.includes("bagaimana") || q.includes("cara")) ) {
    return `📥 **Cara Import Data (Relawan/TPS)**\n\n1. Buka tab **Relawan** atau **Data TPS** → Download template\n2. Isi Excel/CSV: no_tps, kelurahan, kecamatan (34 kel Dapil 1), lat (-11..6), lng (95..141), dpt (>0), suara_sah ≤ dpt, SR/PKS ≤ sah\n3. Upload → sistem validasi per baris, tampil sukses/gagal\n4. Peta & rekap langsung update + blank spot hitung ulang\n\nTip: lat/lng bisa dari Nominatim/OSM atau kantor kelurahan.`;
  }
  if (q.includes("cara export") || q.includes("export pdf") || q.includes("export csv") || (q.includes("download") && (q.includes("pdf") || q.includes("csv")))) {
    return `📤 **Export**\n\n• Dashboard: **Data TPS** → Export CSV (ikut filter kecamatan/kelurahan)\n• **Laporan & Analitik** → **Export PDF** (landscape A4: ringkasan + tabel kecamatan + kelurahan, ikut filter & search) + Export CSV (2 section)\n• Relawan → Export CSV (ikut segmentasi/koordinator)\n\nPDF pakai jspdf-autotable, filename ` + "`Laporan-Dapil1-<scope>-YYYY-MM-DD.pdf`.";
  }
  if (q.includes("cara filter") || q.includes("filter") || q.includes("dropdown")) {
    return `🔍 **Filter**\n\n• Dashboard Peta: pilih **Kecamatan** → dropdown **Kelurahan** di sebelahnya aktif (bertingkat). Relawan & TPS ikut filter.\n• Laporan: Kecamatan/Kelurahan + Cari kelurahan + Urut (A-Z/relawan/TPS/DPT)\n• Relawan: segmentasi & koordinator\n\nFilter live — peta, rekap, dan blank spot langsung menyesuaikan.`;
  }
  if (q.includes("atur target") || q.includes("ubah target") || q.includes("ganti target")) {
    return "⚙ Atur Target\n\nDashboard → Atur Target → isi Relawan (mis. 10.000) & Koordinator (mis. 250 atau 8.000) → Preview persentase tercapai/target×100% → Simpan. Tersimpan di localStorage sr-target-relawan/koor, survives refresh. Kartu KPI & tab Koordinator/Relawan pakai persentase yang sama.";
  }
  if (q.includes("cara baca peta") || q.includes("mode peta") || q.includes("komparasi") || q.includes("heatmap") || q.includes("peta suara") || q.includes("peta relawan")) {
    return `🗺️ **Mode Peta**\n\n• **Relawan**: titik warna segmentasi (donut kanan), klik popup nama/koordinator/WA\n• **Suara**: gradasi **oranye** SR vs DPT atau **hijau** PKS vs DPT, tooltip persentase\n• **Komparasi A**: heatmap Suara + titik relawan, slider opacity\n• **Komparasi B**: TPS merah (blank) vs hijau (ada relawan ≤ radius), radius 300/500/1000m\n\nSemua ikut filter Kecamatan→Kelurahan.`;
  }

  // blank spot (with explain)
  if (q.includes("blank") || q.includes("kosong") || q.includes("tidak ada relawan") || q.includes("tanpa relawan") || q.includes("spot") || (q.includes("jelaskan") && q.includes("blank"))) {
    const total = ctx.blanks.length; const blank = ctx.blanks.filter((b) => b.blank); const pct = total ? Math.round((blank.length / total) * 100) : 0;
    const top = [...blank].sort((a, b) => b.tps.dpt - a.tps.dpt).slice(0, 5);
    const list = top.map((b, i) => `${i + 1}. ${b.tps.kelurahan}, ${b.tps.kecamatan} — TPS ${b.tps.noTps} (DPT ${fmt(b.tps.dpt)}, jarak ${b.jarakTerdekat ?? "—"}m)`).join("\n");
    return `🔴 **Blank Spot**\n\n${GLOSSARY["blank spot"]}\n\nStatistik filter sekarang: Total ${fmt(total)} · Blank **${fmt(blank.length)} (${pct}%)** · Ter-cover ${fmt(total - blank.length)}\n\nPrioritas rekrut (DPT terbesar):\n${list || "— belum ada —"}\n\n${pct > 10 ? "⚠️ Blank >10% — perlu akselerasi rekrut (KPI V1 target <10%)." : "✅ Blank ≤10% — ideal (KPI V1)."} Ubah radius di peta untuk simulasi.`;
  }

  // strategi / rekomendasi
  if (q.includes("strategi") || q.includes("rekomendasi") || q.includes("saran") || q.includes("gimana menang") || q.includes("cara menang") || q.includes("prioritas")) {
    const sortedBlank = [...ctx.blanks.filter(b=>b.blank)].sort((a,b)=> b.tps.dpt - a.tps.dpt).slice(0,3).map(b=>`${b.tps.kelurahan} (${b.tps.kecamatan})`).join(", ");
    const kurang = [...ctx.rekapKel].sort((a,b)=> a.relawan - b.relawan).slice(0,3).map(r=>`${r.kelurahan} (${fmt(r.relawan)} relawan)`).join(", ");
    return `🧭 **Strategi Dapil 1 (berbasis data)**\n\n1. **Rekrut di blank prioritas**: ${sortedBlank || "-"} — DPT besar + tanpa relawan ≤ radius\n2. **Perkuat kelurahan tipis**: ${kurang || "-"} — relawan paling sedikit\n3. **Kejar target**: Relawan ${pct1(ctx.progRelawan.pct)}% (${fmt(ctx.progRelawan.remaining)} lagi), Koordinator ${pct1(ctx.progKoor.pct)}% (sisa ${fmt(ctx.progKoor.remaining)})\n4. **Overlay Peta Komparasi A**: lihat gap Suara SR tinggi tapi relawan tipis → incar\n5. **Action**: tambah relawan via Import/ Form, lalu cek Laporan → Export PDF untuk rapat\n\nMau detail kelurahan? Tanya "Kemijen strategi?"`;
  }

  // motivation
  if (q.includes("semangat") || q.includes("motivasi") || q.includes("quotes") || q.includes("kata kata")) {
    return `🔥 **Semangat Relawan SR!**\n\n"Bersama Relawan Kita Wujudkan Dapil 1 Kota Semarang" — tiap 1 relawan jaga ~${ctx.stats.r? Math.round(ctx.rekapKec.reduce((a,c)=>a+c.dpt,0)/ctx.stats.r):0} DPT.\n\nProgress sekarang ${pct1(ctx.progRelawan.pct)}% menuju ${fmt(ctx.targetRelawan)} — sisa ${fmt(ctx.progRelawan.remaining)} lagi. Ayo isi blank spot! 💪`;
  }

  // segmentasi
  if (q.includes("segmentasi") || q.includes("kategori") || q.includes("slum") || q.includes("ojol") || q.includes("umkm") || q.includes("majelis") || q.includes("rt/rw") || q.includes("advokasi")) {
    const entries = Object.entries(ctx.segCounts).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
    const total = ctx.stats.r || 1;
    const lines = entries.map(([slug, cnt]) => `• ${slug}: ${fmt(cnt)} (${Math.round((cnt / total) * 100)}%)`).join("\n");
    const top = entries[0];
    return `◈ **Segmentasi Relawan** (total ${fmt(ctx.stats.r)})\n\n${GLOSSARY["segmentasi"]}\n\nKomposisi live:\n${lines || "— belum ada —"}\n\nTerbanyak: **${top ? `${top[0]} — ${fmt(top[1])}` : "-"}**. Donut ada di Dashboard kanan.`;
  }

  // koordinator / top
  if (q.includes("koordinator") || q.includes("korcam") || q.includes("korwil") || (q.includes("top") && !q.includes("kelurahan"))) {
    const lines = ctx.topKoors.map((k, i) => `${i + 1}. ${k.nama} (${k.kecamatan}) — ${fmt(k.cnt)} relawan`).join("\n");
    return `👥 **Top Koordinator**\n\n${lines || "— belum ada —"}\n\nTotal aktif: **${fmt(ctx.stats.k)} / ${fmt(ctx.targetKoor)} (${pct1(ctx.progKoor.pct)}%)**. ${GLOSSARY["koordinator"]}`;
  }

  // kecamatan-specific (exact)
  for (const rk of ctx.rekapKec) {
    const kecLow = rk.kecamatan.toLowerCase();
    if (q.includes(kecLow)) {
      return `📍 **${rk.kecamatan}**\n\n• Kelurahan: ${rk.kelCount} · TPS: ${rk.tpsCount} · DPT: ${fmt(rk.dpt)} · Sah: ${fmt(rk.suaraSah)}\n• SR: ${fmt(rk.suaraSR)} · PKS: ${fmt(rk.suaraPKS)}\n• Relawan: ${fmt(rk.relawan)} · Koordinator: ${fmt(rk.koordinator)}\n\nDetail per kelurahan: tanya "rekap kelurahan ${rk.kecamatan}" atau Laporan & Analitik → filter ${rk.kecamatan}. Titik peta: Dashboard → ${rk.kecamatan} → pilih kelurahan.`;
    }
  }

  // kelurahan-specific (exact) — after kecamatan so kelurahan wins if both
  for (const rk of ctx.rekapKel) {
    const kelLow = rk.kelurahan.toLowerCase();
    if (q.includes(kelLow)) {
      return `🏘️ **${rk.kelurahan}, ${rk.kecamatan}**\n\n• TPS: ${rk.tpsCount} · DPT: ${fmt(rk.dpt)} · Sah: ${fmt(rk.suaraSah)} · SR: ${fmt(rk.suaraSR)} · PKS: ${fmt(rk.suaraPKS)}\n• Relawan: ${fmt(rk.relawan)}\n\nPeta: Dashboard → ${rk.kecamatan} → ${rk.kelurahan}. Laporan lengkap ada di Laporan & Analitik.`;
    }
  }

  // glossary apa itu
  for (const [key, val] of Object.entries(GLOSSARY)) {
    if (q.includes(`apa itu ${key}`) || q.includes(`apa itu ${key.replace(" ", "")}`) || q === key || q === `apa ${key}`) {
      return `📖 **${key.toUpperCase()}**\n\n${val}`;
    }
  }
  // generic apa itu — try extract term
  if (q.startsWith("apa itu") || q.startsWith("apa itu")) {
    const term = q.replace("apa itu","").trim();
    const hit = Object.entries(GLOSSARY).find(([k])=> term.includes(k));
    if(hit) return `📖 **${hit[0].toUpperCase()}**\n\n${hit[1]}`;
  }
  if (q.includes("apa itu sainte") || q.includes("sainte lague") || q.includes("metode kursi")) return `📖 **SAINTE-LAGUË**\n\n${GLOSSARY["sainte"]}`;

  // rekap & ranking intents
  if (q.includes("kelurahan") && (q.includes("kurang") || q.includes("sedikit") || q.includes("minim") || q.includes("kritis") || q.includes("terendah") || q.includes("tipis"))) {
    const sorted = [...ctx.rekapKel].sort((a, b) => a.relawan - b.relawan || b.dpt - a.dpt).slice(0, 5);
    const lines = sorted.map((r, i) => `${i + 1}. ${r.kelurahan}, ${r.kecamatan} — ${fmt(r.relawan)} relawan · ${r.tpsCount} TPS · DPT ${fmt(r.dpt)}`).join("\n");
    return `⚠️ **Kelurahan paling kurang relawan**\n\n${lines || "—"}\n\nRekomendasi: rekrut dulu di 5 ini (DPT besar + relawan tipis) — lihat blank spot untuk jarak.`;
  }
  if (q.includes("kelurahan") && (q.includes("banyak") || q.includes("terbanyak") || q.includes("tertinggi") || q.includes("paling banyak"))) {
    const sorted = [...ctx.rekapKel].sort((a, b) => b.relawan - a.relawan).slice(0, 5);
    const lines = sorted.map((r, i) => `${i + 1}. ${r.kelurahan}, ${r.kecamatan} — ${fmt(r.relawan)} relawan`).join("\n");
    return `✅ **Kelurahan relawan terbanyak**\n\n${lines || "—"}`;
  }

  if (q.includes("rekap") && q.includes("kecamatan") || q === "rekap per kecamatan" || q.includes("ringkasan kecamatan")) {
    const lines = ctx.rekapKec.map((r) => `• ${r.kecamatan}: ${r.kelCount} kel · ${r.tpsCount} TPS · DPT ${fmt(r.dpt)} · SR ${fmt(r.suaraSR)} · relawan ${fmt(r.relawan)}`).join("\n");
    return `📊 **Rekap per Kecamatan** (Dapil 1 — 34 kel)\n\n${lines || "—"}\n\nExport lengkap di Laporan & Analitik → Export PDF/CSV.`;
  }
  if (q.includes("rekap") && q.includes("kelurahan") || q.includes("rekap kelurahan")) {
    const top = [...ctx.rekapKel].sort((a, b) => b.relawan - a.relawan).slice(0, 8);
    const lines = top.map((r, i) => `${i + 1}. ${r.kelurahan} (${r.kecamatan}) — ${fmt(r.relawan)} relawan · ${r.tpsCount} TPS`).join("\n");
    return `📋 **Rekap Kelurahan (top 8 relawan)**\n\n${lines || "—"}\n\n34 baris lengkap di Laporan & Analitik (filter + Export PDF).`;
  }
  if (q.includes("rekap") || q.includes("ringkasan") || (q.includes("laporan") && !q.includes("cara"))) {
    const sum = ctx.rekapKec.reduce((a, c) => ({ tps: a.tps + c.tpsCount, dpt: a.dpt + c.dpt, sah: a.sah + c.suaraSah, sr: a.sr + c.suaraSR, pks: a.pks + c.suaraPKS }), { tps: 0, dpt: 0, sah: 0, sr: 0, pks: 0 });
    return `📑 **Ringkasan Dapil 1**\n\n• TPS: ${fmt(sum.tps)} · DPT: ${fmt(sum.dpt)} · Sah: ${fmt(sum.sah)}\n• SR: ${fmt(sum.sr)} · PKS: ${fmt(sum.pks)}\n• Relawan: ${fmt(ctx.stats.r)} / ${fmt(ctx.targetRelawan)} (${pct1(ctx.progRelawan.pct)}%)\n• Koordinator: ${fmt(ctx.stats.k)} / ${fmt(ctx.targetKoor)} (${pct1(ctx.progKoor.pct)}%)\n\nBuka Laporan & Analitik untuk tabel per kecamatan/kelurahan + Export PDF.`;
  }

  // summary / total
  if (q.includes("total") || q.includes("jumlah") || (q.includes("berapa") && (q.includes("relawan") || q.includes("tps") || q.includes("dpt"))) || q.includes("statistik") || q.includes("dashboard")) {
    return `📊 **Statistik Dapil 1 (live)**\n\n• TPS: ${fmt(ctx.stats.t)} · DPT: ${fmt(ctx.rekapKec.reduce((a, c) => a + c.dpt, 0))}\n• Relawan aktif: ${fmt(ctx.stats.r)} / ${fmt(ctx.targetRelawan)} (${pct1(ctx.progRelawan.pct)}%)\n• Koordinator aktif: ${fmt(ctx.stats.k)} / ${fmt(ctx.targetKoor)} (${pct1(ctx.progKoor.pct)}%)\n• SR: ${fmt(ctx.stats.sr)} · PKS: ${fmt(ctx.stats.pks)}\n• Blank spot: ${fmt(ctx.blanks.filter((b) => b.blank).length)} / ${fmt(ctx.blanks.length)}\n\nTanya spesifik: "Kemijen berapa relawan?" atau "hitung 12% dari 10.000"`;
  }

  // dapil general
  if (q.includes("dapil") || q.includes("kota semarang") && (q.includes("kelurahan") || q.includes("kecamatan") || q.includes("kursi")) || q.includes("kursi dprd")) {
    return `🗳️ **Dapil 1 Kota Semarang** — 7 kursi (KPU 2019 & 2024)\n\n• Semarang Tengah 15 kelurahan\n• Semarang Timur 10 kelurahan\n• Semarang Utara 9 kelurahan\n• Total 34 kelurahan — semua di filter peta & Laporan.\n\nTitik peta per kelurahan (bukan numpuk di pusat kecamatan) — ganti koordinat presisi di KELURAHAN_CENTER untuk produksi.`;
  }

  // math simple: "hitung X" / "berapa X% dari Y"
  if (q.includes("hitung") || q.includes("berapa") && (q.includes("%") || q.includes("persen")) || q.includes("kali") || q.includes("bagi")) {
    const mathAns = tryMath(q, ctx);
    if (mathAns) return mathAns;
  }

  // general knowledge but grounded
  const general = tryGeneralKnowledge(q);
  if (general) {
    // ground with Dapil context
    return `${general}\n\n—\nKonteks Dapil 1: ${fmt(ctx.stats.r)} relawan / ${fmt(ctx.targetRelawan)} target (${pct1(ctx.progRelawan.pct)}%), ${fmt(ctx.stats.t)} TPS, 34 kelurahan. Tanya "rekap Kemijen" untuk hubungkan ke data.`;
  }

  // fallback — tetap berguna, tidak "belum paham" mentah
  return `Saya bisa bantu! 💡 "${qRaw}" belum ada jawaban spesifik, tapi ini yang relevan dari sistem Dapil 1:\n\n• Relawan: ${fmt(ctx.stats.r)}/${fmt(ctx.targetRelawan)} (${pct1(ctx.progRelawan.pct)}%) · Koordinator: ${fmt(ctx.stats.k)}/${fmt(ctx.targetKoor)} (${pct1(ctx.progKoor.pct)}%)\n• TPS: ${fmt(ctx.stats.t)} · Blank: ${fmt(ctx.blanks.filter(b=>b.blank).length)}/${fmt(ctx.blanks.length)}\n• Dapil 1 = 34 kelurahan (Tengah 15, Timur 10, Utara 9)\n\nCoba tanya:\n${CHAT_SUGGESTIONS.map((s) => `• ${s}`).join("\n")}\n• "Apa itu DPT?" / "Jelaskan blank spot" / "Cara import?"\n• Sebut nama kelurahan: "Pekunden berapa relawan?"\n\nAtau tanya umum — saya jawab + kaitkan ke Dapil 1.`;
}

function tryMath(q: string, ctx: ChatCtx): string | null {
  // "berapa 15% dari 10000" / "12% dari 8000"
  const pctOf = q.match(/(\d+(?:[.,]\d+)?)\s*%\s*dari\s*(\d+(?:[.,]\d+)?)/);
  if (pctOf) {
    const p = parseFloat(pctOf[1].replace(",",".")); const base = parseFloat(pctOf[2].replace(/[.,]/g,"").replace(/ /g,""));
    // handle base with dots; fallback to raw
    const b = Number(pctOf[2].replace(/\./g,"").replace(",",".")) || base;
    const res = Math.round(b * p / 100);
    return `🧮 **Hitung**: ${pctOf[1]}% dari ${fmt(b)} = **${fmt(res)}**\n\nKonteks Dapil 1: target relawan ${fmt(ctx.targetRelawan)} → ${p}% = ${fmt(Math.round(ctx.targetRelawan*p/100))} orang.`;
  }
  // "hitung 5000 * 12 / 100"
  const simple = q.match(/hitung\s+([0-9+\-*/().%\s]+)/);
  if(simple){
    try{
      const expr = simple[1].replace(/x/gi,"*").replace(/:/g,"/").replace(/%/g,"*0.01").trim().slice(0,40);
      if(/^[0-9+\-*/().\s]+$/.test(expr)){
        // eslint-disable-next-line no-new-func
        const v = Function(`"use strict"; return (${expr})`)();
        if(Number.isFinite(v)) return `🧮 **Hitung**: ${expr} = **${fmt(Math.round(v*100)/100).replace(".",",")}**`;
      }
    }catch{}
  }
  return null;
}

function tryGeneralKnowledge(q: string): string | null {
  if (q.includes("ibu kota") && q.includes("indonesia")) return "🏛️ Ibu kota Indonesia adalah **Jakarta** (Ibu Kota Nusantara/I KN dalam proses pemindahan ke Kalimantan Timur).";
  if (q.includes("ibu kota") && q.includes("jawa tengah")) return "🏛️ Ibu kota Jawa Tengah adalah **Semarang** — tempat Dapil 1 berada.";
  if (q.includes("pemilu") && q.includes("kapan")) return "🗳️ Pemilu legislatif & presiden terakhir **2024** (14 Feb 2024), selanjutnya **2029** (jadwal KPU). Dapil 1 2024: 7 kursi.";
  if (q.includes("cuaca")) return "🌤️ Saya tidak akses cuaca live, tapi Semarang pesisir umumnya panas 27–33°C. Untuk data relawan, peta Dapil 1 tetap bisa dicek tanpa tergantung cuaca.";
  if (q.includes("lelucon") || q.includes("joke") || q.includes("luc") || q.includes("pantun")) return "😄 Pantun relawan:\n*Jalan-jalan ke Pekunden,*\n*Beli jamu di Kemijen,*\n*Relawan kompak se-Dapil 1,*\n*Menang bersama Siti Roika!*";
  if (q.includes("siapa kamu") || q.includes("kamu siapa") || q.includes("apa kamu")) return "🤖 Saya **Tanya Data** — asisten serbaguna Dapil 1. Bisa jawab umum (ibu kota, pemilu, hitungan) tapi selalu kaitkan ke data sistem: 34 kelurahan, target, rekap, blank spot, peta.";
  if (q.includes("jam berapa") || q.includes("tanggal berapa") || q.includes("hari ini")) {
    const now = new Date(); return `🕒 Sekarang: **${now.toLocaleDateString("id-ID", { weekday:"long", day:"2-digit", month:"long", year:"numeric" })} ${now.toLocaleTimeString("id-ID", {hour:"2-digit", minute:"2-digit"})} WIB** — waktu laporan PDF juga pakai timestamp ini.`;
  }
  if (q.includes("terima kasih") || q.includes("thanks")) return null; // handled above
  return null;
}

function helpText(): string {
  return `💬 **Tanya Data — Asisten Serbaguna Dapil 1**\n\nSaya jawab **apa saja** (umum + sistem), tapi selalu berdasar data dashboard (live).\n\n**Sistem:**\n${CHAT_SUGGESTIONS.map((s) => `• ${s}`).join("\n")}\n• "Apa itu DPT / TPS / blank spot?"\n• "Cara import / export PDF?"\n• "Strategi tambah relawan?"\n\n**Umum (tetap dikaitkan Dapil 1):**\n• "Ibu kota Jawa Tengah?"\n• "Kapan pemilu?"\n• "Hitung 15% dari 10.000"\n\nTip: sebut nama **kelurahan/kecamatan** untuk detail spesifik.`;
}
