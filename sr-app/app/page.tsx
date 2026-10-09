"use client";
import { formatNumber } from "@/lib/format";
import { useEffect, useMemo, useState } from "react";
import { PillTabs, SubFilter, TabKey } from "@/components/Tabs";
import { MapSuara, MapRelawan, MapKomparasiA, MapKomparasiB } from "@/components/Maps";
import { TPS_SEED, RELAWAN_SEED, KOORDINATORS, KECAMATAN, KELURAHAN_BY_KEC, KELURAHAN_CENTER, getKelurahanCenter, type TPS, type Relawan, type Koordinator } from "@/lib/mockData";
import { SEGMENTASI, segBySlug } from "@/lib/segmentasi";
import { blankSpot, korelasiByKecamatan, rekapByKecamatan, rekapByKelurahan } from "@/lib/geo";
import { TARGET_RELAWAN_DEFAULT, TARGET_KOOR_DEFAULT, calcProgress, formatPct } from "@/lib/target";
import ChatBot from "@/components/ChatBot";

export default function Home() {
  const [tab, setTab] = useState<TabKey>("peta");
  const [mode, setMode] = useState<"total"|"sr"|"pks">("sr");
  const [kec, setKec] = useState<string>("Semua kecamatan");
  const [kel, setKel] = useState<string>("Semua kelurahan");
  const [mapView, setMapView] = useState<"suara"|"relawan"|"komparasi-a"|"komparasi-b">("relawan");
  const [tpsList, setTpsList] = useState<TPS[]>(()=> [...TPS_SEED]);
  const [relawans, setRelawans] = useState<Relawan[]>(()=> [...RELAWAN_SEED]);
  const [koors, setKoors] = useState<Koordinator[]>(()=> KOORDINATORS.map(k=>({...k, jmlRelawan: RELAWAN_SEED.filter(r=>r.koordinatorId===k.id && r.status==="aktif").length})));
  const [radius, setRadius] = useState<500|300|1000>(500);
  const [opacity, setOpacity] = useState(85);
  const [searchTop, setSearchTop] = useState("");
  const [searchRelawan, setSearchRelawan] = useState("");
  const [filterSeg, setFilterSeg] = useState<string>("semua");
  const [filterKoor, setFilterKoor] = useState<string>("semua");
  const [searchTps, setSearchTps] = useState("");
  const [importMsg, setImportMsg] = useState<string|null>(null);
  const [showTambahRelawan, setShowTambahRelawan] = useState(false);
  const [showTambahKoor, setShowTambahKoor] = useState(false);
  const [formRelawan, setFormRelawan] = useState({nama:"", wa:"", alamat:"", kelurahan:"Pekunden", kecamatan:"Semarang Tengah", rtRw:"01/02", lat:"-6.9837", lng:"110.4197", segmentasi:"ojol", koordinatorId:"k1"});
  const [formKoor, setFormKoor] = useState({nama:"", wa:"", kelurahan:"Pekunden", kecamatan:"Semarang Tengah"});
  const [showErf, setShowErf] = useState(false);
  const [theme, setTheme] = useState<"light"|"dark">("light");
  const [segOpen, setSegOpen] = useState(true);
  const [perbandinganOpen, setPerbandinganOpen] = useState(false);
  const [laporanOpen, setLaporanOpen] = useState(false);
  const [targetRelawan, setTargetRelawan] = useState<number>(TARGET_RELAWAN_DEFAULT);
  const [targetKoor, setTargetKoor] = useState<number>(TARGET_KOOR_DEFAULT);
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [draftTargetRelawan, setDraftTargetRelawan] = useState(String(TARGET_RELAWAN_DEFAULT));
  const [draftTargetKoor, setDraftTargetKoor] = useState(String(TARGET_KOOR_DEFAULT));

  useEffect(()=>{
    const saved = (typeof window !== "undefined" ? localStorage.getItem("sr-theme") : null) as "light"|"dark"|null;
    const prefersDark = typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const init = saved ?? (prefersDark ? "dark" : "light");
    setTheme(init);
    document.documentElement.classList.toggle("dark", init==="dark");
  },[]);
  useEffect(()=>{ document.documentElement.classList.toggle("dark", theme==="dark"); try{ localStorage.setItem("sr-theme", theme); }catch{} },[theme]);
  function toggleTheme(){ setTheme(prev => prev==="dark" ? "light" : "dark"); }
  // target: load sekali di mount (SSR aman, tidak pakai persist-effect agar tidak overwrite di StrictMode)
  useEffect(()=>{
    try{
      const r = Number(localStorage.getItem("sr-target-relawan"));
      const k = Number(localStorage.getItem("sr-target-koor"));
      if(Number.isFinite(r) && r>0) setTargetRelawan(Math.floor(r));
      if(Number.isFinite(k) && k>0) setTargetKoor(Math.floor(k));
    }catch{}
  },[]);
  function persistTarget(nextRelawan: number, nextKoor: number){
    try{ localStorage.setItem("sr-target-relawan", String(nextRelawan)); }catch{}
    try{ localStorage.setItem("sr-target-koor", String(nextKoor)); }catch{}
  }

  // kelurahan bertingkat: opsi ikut kec, reset jika tidak valid
  const kelurahanOptions = useMemo(()=>{
    if(kec==="Semua kecamatan") return ["Semua kelurahan"];
    return ["Semua kelurahan", ...(KELURAHAN_BY_KEC[kec] ?? [])];
  },[kec]);
  useEffect(()=>{
    if(kec==="Semua kecamatan" && kel!=="Semua kelurahan") setKel("Semua kelurahan");
    else if(kec!=="Semua kecamatan" && kel!=="Semua kelurahan" && !(KELURAHAN_BY_KEC[kec] ?? []).includes(kel)) setKel("Semua kelurahan");
  },[kec]); // eslint-disable-line react-hooks/exhaustive-deps
  function handleKecChange(v: string){ setKec(v); setKel("Semua kelurahan"); }

  const stats = useMemo(()=>{
    const totalSR = tpsList.reduce((a,b)=>a+b.suaraSitiRoika,0);
    const totalPKS = tpsList.reduce((a,b)=>a+b.suaraPKS,0);
    return { k: koors.filter(k=>k.status==="aktif").length, r: relawans.filter(r=>r.status==="aktif").length, t: tpsList.length, sr: totalSR, pks: totalPKS };
  },[koors, relawans, tpsList]);
  const progRelawan = useMemo(()=> calcProgress(stats.r, targetRelawan), [stats.r, targetRelawan]);
  const progKoor = useMemo(()=> calcProgress(stats.k, targetKoor), [stats.k, targetKoor]);

  const filteredRelawans = useMemo(()=>{
    return relawans.filter(r=>{
      if(filterSeg!=="semua" && r.segmentasi!==filterSeg) return false;
      if(filterKoor!=="semua" && r.koordinatorId!==filterKoor) return false;
      const q = (searchTop || searchRelawan).toLowerCase();
      if(q && !`${r.nama} ${r.kelurahan} ${r.kecamatan} ${r.koordinatorNama} ${r.wa}`.toLowerCase().includes(q)) return false;
      return true;
    });
  },[relawans, filterSeg, filterKoor, searchRelawan, searchTop]);
  const filteredRelawansForMap = useMemo(()=>{
    return filteredRelawans.filter(r=>{
      if(kec!=="Semua kecamatan" && r.kecamatan!==kec) return false;
      if(kel!=="Semua kelurahan" && r.kelurahan!==kel) return false;
      return true;
    });
  },[filteredRelawans, kec, kel]);

  const filteredTps = useMemo(()=>{
    return tpsList.filter(t=>{
      if(kec!=="Semua kecamatan" && t.kecamatan!==kec) return false;
      if(kel!=="Semua kelurahan" && t.kelurahan!==kel) return false;
      if(searchTps && !`${t.noTps} ${t.kelurahan} ${t.kecamatan}`.toLowerCase().includes(searchTps.toLowerCase())) return false;
      return true;
    });
  },[tpsList, kec, kel, searchTps]);

  const blanks = useMemo(()=> blankSpot(tpsList.filter(t=>{
    if(kec!=="Semua kecamatan" && t.kecamatan!==kec) return false;
    if(kel!=="Semua kelurahan" && t.kelurahan!==kel) return false;
    return true;
  }), relawans, radius), [tpsList, relawans, radius, kec, kel]);
  const korelasi = useMemo(()=> korelasiByKecamatan(tpsList, relawans), [tpsList, relawans]);

  const segCounts = useMemo(()=>{
    const c: Record<string, number> = {};
    SEGMENTASI.forEach(s=> c[s.slug]=0);
    relawans.forEach(r=>{ if(r.status==="aktif") c[r.segmentasi]=(c[r.segmentasi]??0)+1; });
    return c;
  },[relawans]);

  const topKoors = useMemo(()=>{
    return [...koors].map(k=> ({...k, cnt: relawans.filter(r=>r.koordinatorId===k.id && r.status==="aktif").length}))
      .sort((a,b)=> b.cnt-a.cnt).slice(0,5);
  },[koors, relawans]);

  // Laporan — rekap yang ikut filter kec/kel + search
  const [laporanKec, setLaporanKec] = useState<string>("Semua kecamatan");
  const [laporanKel, setLaporanKel] = useState<string>("Semua kelurahan");
  const [laporanSort, setLaporanSort] = useState<"kelurahan"|"relawan"|"tps"|"dpt">("kelurahan");
  const [laporanSearch, setLaporanSearch] = useState("");
  const laporanKelOptions = useMemo(()=>{
    if(laporanKec==="Semua kecamatan") return ["Semua kelurahan"];
    return ["Semua kelurahan", ...(KELURAHAN_BY_KEC[laporanKec] ?? [])];
  },[laporanKec]);
  useEffect(()=>{
    if(laporanKec==="Semua kecamatan" && laporanKel!=="Semua kelurahan") setLaporanKel("Semua kelurahan");
    else if(laporanKec!=="Semua kecamatan" && laporanKel!=="Semua kelurahan" && !(KELURAHAN_BY_KEC[laporanKec] ?? []).includes(laporanKel)) setLaporanKel("Semua kelurahan");
  },[laporanKec]); // eslint-disable-line react-hooks/exhaustive-deps
  function handleLaporanKecChange(v:string){ setLaporanKec(v); setLaporanKel("Semua kelurahan"); }
  const tpsForLaporan = useMemo(()=>{
    return tpsList.filter(t=>{
      if(laporanKec!=="Semua kecamatan" && t.kecamatan!==laporanKec) return false;
      if(laporanKel!=="Semua kelurahan" && t.kelurahan!==laporanKel) return false;
      return true;
    });
  },[tpsList, laporanKec, laporanKel]);
  const relawanForLaporan = useMemo(()=>{
    return relawans.filter(r=>{
      if(r.status!=="aktif") return false;
      if(laporanKec!=="Semua kecamatan" && r.kecamatan!==laporanKec) return false;
      if(laporanKel!=="Semua kelurahan" && r.kelurahan!==laporanKel) return false;
      return true;
    });
  },[relawans, laporanKec, laporanKel]);
  const koorForLaporan = useMemo(()=>{
    return koors.filter(k=>{
      if(k.status!=="aktif") return false;
      if(laporanKec!=="Semua kecamatan" && k.kecamatan!==laporanKec) return false;
      if(laporanKel!=="Semua kelurahan" && k.kelurahan!==laporanKel) return false;
      return true;
    });
  },[koors, laporanKec, laporanKel]);
  const rekapKec = useMemo(()=> rekapByKecamatan(tpsForLaporan, relawanForLaporan, koorForLaporan), [tpsForLaporan, relawanForLaporan, koorForLaporan]);
  const rekapKelRaw = useMemo(()=> rekapByKelurahan(tpsForLaporan, relawanForLaporan), [tpsForLaporan, relawanForLaporan]);
  const rekapKel = useMemo(()=>{
    let arr = [...rekapKelRaw];
    if(laporanSearch){
      const q=laporanSearch.toLowerCase();
      arr = arr.filter(r=> `${r.kecamatan} ${r.kelurahan}`.toLowerCase().includes(q));
    }
    if(laporanSort==="relawan") arr.sort((a,b)=> b.relawan - a.relawan || a.kelurahan.localeCompare(b.kelurahan));
    else if(laporanSort==="tps") arr.sort((a,b)=> b.tpsCount - a.tpsCount || a.kelurahan.localeCompare(b.kelurahan));
    else if(laporanSort==="dpt") arr.sort((a,b)=> b.dpt - a.dpt || a.kelurahan.localeCompare(b.kelurahan));
    else arr.sort((a,b)=> a.kecamatan.localeCompare(b.kecamatan) || a.kelurahan.localeCompare(b.kelurahan));
    return arr;
  },[rekapKelRaw, laporanSearch, laporanSort]);
  const [exportingPdf, setExportingPdf] = useState(false);
  async function exportLaporanPdf(){
    setExportingPdf(true);
    try{
      const jsPDFmod = await import("jspdf");
      const autoTableMod: any = await import("jspdf-autotable");
      const autoTable = autoTableMod.default ?? autoTableMod;
      const JsPDF = (jsPDFmod as any).jsPDF ?? (jsPDFmod as any).default ?? jsPDFmod;
      const doc = new JsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const now = new Date();
      const tgl = now.toLocaleDateString("id-ID", { day:"2-digit", month:"long", year:"numeric" });
      const jam = now.toLocaleTimeString("id-ID", { hour:"2-digit", minute:"2-digit" });
      const scope = laporanKec==="Semua kecamatan" ? "Dapil 1 — Semua kecamatan (34 kelurahan)" : laporanKel==="Semua kelurahan" ? `${laporanKec} — ${rekapKel.length} kelurahan` : `${laporanKec} — ${laporanKel}`;
      // header
      doc.setFontSize(13); doc.setFont("helvetica","bold");
      doc.text("Rekap Laporan & Analitik — Relawan Siti Roika", 14, 14);
      doc.setFontSize(8); doc.setFont("helvetica","normal"); doc.setTextColor(100);
      doc.text(`Dapil 1 Kota Semarang · ${scope} · ${tgl} ${jam} WIB · Total: ${stats.t} TPS · ${stats.r} relawan · ${stats.k} koordinator`, 14, 19);
      doc.setFontSize(7); doc.text(`Filter: ${laporanKec} / ${laporanKel} · Urut: ${laporanSort} · Cari: ${laporanSearch || "-"}`, 14, 23);
      // ringkasan 4 kartu sebagai teks
      const sum = rekapKec.reduce((a,c)=>({ tps:a.tps+c.tpsCount, dpt:a.dpt+c.dpt, sah:a.sah+c.suaraSah, sr:a.sr+c.suaraSR, pks:a.pks+c.suaraPKS, rel:a.rel+c.relawan, koor:a.koor+c.koordinator }), {tps:0,dpt:0,sah:0,sr:0,pks:0,rel:0,koor:0});
      doc.setFontSize(8); doc.setTextColor(30); doc.setFont("helvetica","bold");
      doc.text(`Ringkasan filter: ${sum.tps} TPS · ${sum.dpt.toLocaleString("id-ID")} DPT · ${sum.sah.toLocaleString("id-ID")} sah · SR ${sum.sr.toLocaleString("id-ID")} · PKS ${sum.pks.toLocaleString("id-ID")} · ${sum.rel} relawan · ${sum.koor} koordinator`, 14, 27);
      let y = 31;
      // Tabel 1: Rekap per Kecamatan
      doc.setFontSize(10); doc.setFont("helvetica","bold"); doc.setTextColor(15);
      doc.text("Rekap per Kecamatan", 14, y); y+=2;
      autoTable(doc, {
        startY: y,
        head: [["Kecamatan","Kelurahan","TPS","DPT","Suara Sah","SR","PKS","Relawan","Koordinator"]],
        body: rekapKec.map(r=> [r.kecamatan, String(r.kelCount), String(r.tpsCount), r.dpt.toLocaleString("id-ID"), r.suaraSah.toLocaleString("id-ID"), r.suaraSR.toLocaleString("id-ID"), r.suaraPKS.toLocaleString("id-ID"), String(r.relawan), String(r.koordinator)]),
        foot: rekapKec.length ? [[{content:"TOTAL", colSpan:2, styles:{halign:"right", fontStyle:"bold"}}, String(sum.tps), sum.dpt.toLocaleString("id-ID"), sum.sah.toLocaleString("id-ID"), sum.sr.toLocaleString("id-ID"), sum.pks.toLocaleString("id-ID"), String(sum.rel), String(sum.koor)]] : undefined,
        theme: "grid",
        styles: { fontSize: 7, cellPadding: 1.5, lineColor: [226,232,240] },
        headStyles: { fillColor: [37,99,235], textColor: 255, fontStyle:"bold" },
        footStyles: { fillColor: [241,245,249], textColor: 15, fontStyle:"bold" },
        columnStyles: { 2:{halign:"right"},3:{halign:"right"},4:{halign:"right"},5:{halign:"right"},6:{halign:"right"},7:{halign:"right"},8:{halign:"right"} },
        margin: { left:14, right:14 },
        didDrawPage: (data:any)=>{ y = data.cursor?.y ?? y; }
      });
      // Tabel 2: Rekap per Kelurahan (halaman baru jika perlu)
      const afterKecY: number = (doc as any).lastAutoTable?.finalY ?? y+10;
      let y2 = afterKecY + 6;
      if(y2 > 180){ doc.addPage(); y2 = 14; }
      doc.setFontSize(10); doc.setFont("helvetica","bold"); doc.setTextColor(15);
      doc.text(`Rekap per Kelurahan — ${rekapKel.length} baris${laporanSearch ? ` (cari: "${laporanSearch}")` : ""}`, 14, y2); y2+=2;
      autoTable(doc, {
        startY: y2,
        head: [["#","Kecamatan","Kelurahan","TPS","DPT","Sah","SR","PKS","Relawan"]],
        body: rekapKel.map((r,i)=> [String(i+1), r.kecamatan, r.kelurahan, String(r.tpsCount), r.dpt.toLocaleString("id-ID"), r.suaraSah.toLocaleString("id-ID"), r.suaraSR.toLocaleString("id-ID"), r.suaraPKS.toLocaleString("id-ID"), String(r.relawan)]),
        theme: "grid",
        styles: { fontSize: 6.5, cellPadding: 1.2, lineColor: [226,232,240] },
        headStyles: { fillColor: [14,165,233], textColor: 255, fontStyle:"bold" },
        columnStyles: { 0:{halign:"right"},3:{halign:"right"},4:{halign:"right"},5:{halign:"right"},6:{halign:"right"},7:{halign:"right"},8:{halign:"right"} },
        margin: { left:14, right:14 },
      });
      const pages: number = (doc as any).internal.getNumberOfPages();
      for(let i=1;i<=pages;i++){ doc.setPage(i); doc.setFontSize(6); doc.setTextColor(148); doc.setFont("helvetica","normal"); doc.text(`Relawan SR — Dapil 1 Kota Semarang · Dicetak ${tgl} ${jam} · Hal ${i}/${pages}`, 14, 200); }
      doc.save(`Laporan-Dapil1-${scope.replace(/[^a-zA-Z0-9]+/g,"-")}-${now.toISOString().slice(0,10)}.pdf`);
    }catch(e:any){ alert("Gagal export PDF: "+(e?.message||e)); }
    finally{ setExportingPdf(false); }
  }
  function exportRekapCsv(){
    const headersKel = ["kecamatan","kelurahan","tps","dpt","suara_sah","suara_sr","suara_pks","relawan"];
    const rowsKel = rekapKel.map(r=> ({kecamatan:r.kecamatan, kelurahan:r.kelurahan, tps:r.tpsCount, dpt:r.dpt, suara_sah:r.suaraSah, suara_sr:r.suaraSR, suara_pks:r.suaraPKS, relawan:r.relawan}));
    const headersKec = ["kecamatan","kelurahan","tps","dpt","suara_sah","suara_sr","suara_pks","relawan","koordinator"];
    const rowsKec = rekapKec.map(r=> ({kecamatan:r.kecamatan, kelurahan:r.kelCount, tps:r.tpsCount, dpt:r.dpt, suara_sah:r.suaraSah, suara_sr:r.suaraSR, suara_pks:r.suaraPKS, relawan:r.relawan, koordinator:r.koordinator}));
    // gabung: header + baris kec, baris kosong, header kel, baris kel
    const csvKec = [headersKec.join(","), ...rowsKec.map(r=> headersKec.map(h=> `"${String((r as any)[h]??"").replace(/"/g,'""')}"`).join(","))].join("\n");
    const csvKel = [headersKel.join(","), ...rowsKel.map(r=> headersKel.map(h=> `"${String((r as any)[h]??"").replace(/"/g,'""')}"`).join(","))].join("\n");
    const full = `# Rekap per Kecamatan — ${laporanKec} / ${laporanKel}\n${csvKec}\n\n# Rekap per Kelurahan — ${rekapKel.length} baris\n${csvKel}`;
    const blob=new Blob([full],{type:"text/csv;charset=utf-8;"}); const url=URL.createObjectURL(blob);
    const a=document.createElement("a"); a.href=url; a.download=`rekap-dapil1-${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(url);
  }

  async function handleImportTPS(e: React.ChangeEvent<HTMLInputElement>){
    const file = e.target.files?.[0]; if(!file) return;
    setImportMsg(null);
    try{
      const text = file.name.endsWith(".csv") ? await file.text() : await file.arrayBuffer().then(async buf=>{
        const XLSX = await import("xlsx");
        const wb = XLSX.read(buf); const ws = wb.Sheets[wb.SheetNames[0]]; return XLSX.utils.sheet_to_csv(ws);
      });
      const Papa = (await import("papaparse")).default;
      const parsed = Papa.parse(text, {header:true, skipEmptyLines:true});
      const rows = parsed.data as any[];
      let success=0; const errors:{row:number, msg:string}[]=[];
      const seen = new Set(tpsList.map(t=> `${t.noTps}|${t.kelurahan}`.toLowerCase()));
      const toAdd: TPS[]=[];
      rows.forEach((r:any, idx:number)=>{
        const rowNum = idx+2;
        const no_tps = String(r.no_tps ?? r.noTps ?? "").padStart(2,"0");
        const kelurahan = String(r.kelurahan ?? "").trim();
        const kecamatan = String(r.kecamatan ?? "").trim();
        const lat = Number(r.lat), lng=Number(r.lng), dpt=Number(r.dpt), suara_sah=Number(r.suasa_sah ?? r.suara_sah), sr=Number(r.suara_siti_roika ?? r.suaraSitiRoika ?? 0), pks=Number(r.suara_pks ?? r.suaraPKS ?? 0);
        if(!no_tps || !kelurahan || !kecamatan) { errors.push({row:rowNum, msg:"no_tps/kelurahan/kecamatan wajib"}); return; }
        if(isNaN(lat)|| lat<-11||lat>6) { errors.push({row:rowNum, msg:"lat invalid (-11..6)"}); return; }
        if(isNaN(lng)|| lng<95||lng>141) { errors.push({row:rowNum, msg:"lng invalid (95..141)"}); return; }
        if(!(dpt>0)) { errors.push({row:rowNum, msg:"dpt harus >0"}); return; }
        if(suara_sah>dpt) { errors.push({row:rowNum, msg:"suara_sah > dpt"}); return; }
        if(sr>suara_sah) { errors.push({row:rowNum, msg:"suara_siti_roika > suara_sah"}); return; }
        if(pks>suara_sah) { errors.push({row:rowNum, msg:"suara_pks > suara_sah"}); return; }
        const key = `${no_tps}|${kelurahan}`.toLowerCase();
        if(seen.has(key)) { errors.push({row:rowNum, msg:`no_tps duplikat di ${kelurahan}`}); return; }
        seen.add(key);
        toAdd.push({id:`tps-${Date.now()}-${idx}`, noTps:no_tps, kelurahan, kecamatan, lat, lng, dpt, suaraSah: suara_sah, suaraSitiRoika: sr, suaraPKS: pks, alamatTps: String(r.alamat_tps ?? r.alamat ?? "")});
        success++;
      });
      if(toAdd.length) setTpsList(prev=> [...toAdd, ...prev]);
      setImportMsg(`Import TPS: ${success} sukses, ${errors.length} gagal${errors.length? " — "+errors.slice(0,3).map(e=>`baris ${e.row}: ${e.msg}`).join(" | "):""}`);
    }catch(err:any){ setImportMsg("Gagal import: "+ err.message); }
    e.target.value="";
  }

  async function handleImportRelawan(e: React.ChangeEvent<HTMLInputElement>){
    const file = e.target.files?.[0]; if(!file) return;
    setImportMsg(null);
    try{
      const text = file.name.endsWith(".csv") ? await file.text() : await file.arrayBuffer().then(async buf=>{
        const XLSX = await import("xlsx");
        const wb = XLSX.read(buf); const ws = wb.Sheets[wb.SheetNames[0]]; return XLSX.utils.sheet_to_csv(ws);
      });
      const Papa = (await import("papaparse")).default;
      const parsed = Papa.parse(text, {header:true, skipEmptyLines:true});
      const rows = parsed.data as any[];
      let success=0; const errors:{row:number, msg:string}[]=[];
      const toAdd: Relawan[]=[];
      rows.forEach((r:any, idx:number)=>{
        const rowNum=idx+2;
        const nama=String(r.nama??"").trim(); if(!nama){ errors.push({row:rowNum, msg:"nama wajib"}); return; }
        const wa=String(r.wa??"").replace(/\D/g,""); if(!wa.startsWith("62")){ errors.push({row:rowNum, msg:"wa harus +62"}); return; }
        const lat=Number(r.lat), lng=Number(r.lng);
        if(isNaN(lat)||lat<-11||lat>6){ errors.push({row:rowNum, msg:"lat invalid"}); return; }
        if(isNaN(lng)||lng<95||lng>141){ errors.push({row:rowNum, msg:"lng invalid"}); return; }
        const seg = String(r.segmentasi??"lainnya").toLowerCase();
        const slug = SEGMENTASI.find(s=> s.slug===seg || s.nama.toLowerCase()===seg)?.slug ?? "lainnya";
        const kecVal = String(r.kecamatan??"Semarang Tengah").trim();
        const koName = String(r.koordinator_nama??r.koordinator??"").trim();
        const ko = koors.find(k=> k.nama.toLowerCase()===koName.toLowerCase()) ?? koors.find(k=>k.kecamatan===kecVal) ?? koors[0];
        toAdd.push({id:`rel-${Date.now()}-${idx}`, nama, wa, alamat:String(r.alamat??""), kelurahan:String(r.kelurahan??""), kecamatan:kecVal, rtRw:String(r.rt_rw??r.rtRw??"01/01"), lat, lng, segmentasi: slug, koordinatorId: ko.id, koordinatorNama: ko.nama, status:"aktif"});
        success++;
      });
      if(toAdd.length) setRelawans(prev=> [...toAdd, ...prev]);
      setImportMsg(`Import Relawan: ${success} sukses, ${errors.length} gagal${errors.length? " — "+errors.slice(0,3).map(e=>`baris ${e.row}: ${e.msg}`).join(" | "):""}`);
    }catch(err:any){ setImportMsg("Gagal import relawan: "+err.message); }
    e.target.value="";
  }

  function exportCSV(filename:string, rows:any[], headers:string[]){
    const csv = [headers.join(","), ...rows.map(r=> headers.map(h=> `"${String(r[h]??"").replace(/"/g,'""')}"`).join(","))].join("\n");
    const blob=new Blob([csv],{type:"text/csv;charset=utf-8;"}); const url=URL.createObjectURL(blob);
    const a=document.createElement("a"); a.href=url; a.download=filename; a.click(); URL.revokeObjectURL(url);
  }

  function handleAddRelawan(){
    if(!formRelawan.nama || !formRelawan.wa) return alert("Nama & WA wajib");
    const kecSet = new Set(KECAMATAN.slice(1) as string[]);
    if(!kecSet.has(formRelawan.kecamatan as any)) return alert("Kecamatan tidak valid");
    const kels = KELURAHAN_BY_KEC[formRelawan.kecamatan] ?? [];
    if(!kels.includes(formRelawan.kelurahan)) return alert(`Kelurahan tidak sesuai ${formRelawan.kecamatan}. Pilih dari dropdown kelurahan.`);
    // alamat bebas, kelurahan dari dropdown bertingkat — titik peta ikut kelurahan
    let lat = Number(formRelawan.lat), lng = Number(formRelawan.lng);
    const latEmpty = !String(formRelawan.lat).trim(), lngEmpty = !String(formRelawan.lng).trim();
    if(latEmpty || lngEmpty || !Number.isFinite(lat) || !Number.isFinite(lng)){
      const c = getKelurahanCenter(formRelawan.kelurahan, formRelawan.kecamatan);
      // jitter kecil agar tidak numpuk jika banyak di kelurahan sama
      const jitter = () => (Math.random()-0.5)*0.006; // ±0.003°
      if(latEmpty || !Number.isFinite(lat)) lat = c.lat + jitter();
      if(lngEmpty || !Number.isFinite(lng)) lng = c.lng + jitter();
    }
    if(!Number.isFinite(lat) || lat < -11 || lat > 6) return alert("Lat tidak valid (-11..6) atau kosong — isi lat atau pilih kelurahan lain.");
    if(!Number.isFinite(lng) || lng < 95 || lng > 141) return alert("Lng tidak valid (95..141) atau kosong — isi lng atau pilih kelurahan lain.");
    const ko = koors.find(k=>k.id===formRelawan.koordinatorId) ?? koors[0];
    const r: Relawan = {
      id:`rel-${Date.now()}`, nama:formRelawan.nama, wa:formRelawan.wa.replace(/\D/g,""), alamat:formRelawan.alamat,
      kelurahan:formRelawan.kelurahan, kecamatan:formRelawan.kecamatan, rtRw: formRelawan.rtRw,
      lat, lng,
      segmentasi: formRelawan.segmentasi, koordinatorId: ko.id, koordinatorNama: ko.nama, status:"aktif"
    };
    setRelawans(prev=>[r, ...prev]);
    setShowTambahRelawan(false);
  }
  function handleAddKoor(){
    if(!formKoor.nama || !formKoor.wa) return alert("Nama & WA wajib");
    const kecSet = new Set(KECAMATAN.slice(1) as string[]);
    if(!kecSet.has(formKoor.kecamatan as any)) return alert("Kecamatan tidak valid");
    const kels = KELURAHAN_BY_KEC[formKoor.kecamatan] ?? [];
    if(!kels.includes(formKoor.kelurahan)) return alert(`Kelurahan tidak sesuai ${formKoor.kecamatan}. Pilih dari dropdown kelurahan.`);
    const c = getKelurahanCenter(formKoor.kelurahan, formKoor.kecamatan);
    const k: Koordinator = {id:`k-${Date.now()}`, nama:formKoor.nama, wa:formKoor.wa, kecamatan:formKoor.kecamatan, kelurahan:formKoor.kelurahan, lat:c.lat, lng:c.lng, status:"aktif", jmlRelawan:0};
    setKoors(prev=>[...prev, k]);
    setShowTambahKoor(false);
  }

  const donutData = [
    { slug:"sr-inti", label:"Relawan SR", color:"#2563EB" },
    { slug:"majelis-taklim", label:"Majelis Taklim", color:"#0EA5E9" },
    { slug:"rt-rw", label:"RT/RW", color:"#F59E0B" },
    { slug:"umkm", label:"UMKM", color:"#7C3AED" },
    { slug:"ojol", label:"OJOL", color:"#06B6D4" },
    { slug:"advokasi", label:"Advokasi", color:"#EF4444" },
    { slug:"remaja", label:"Remaja", color:"#EC4899" },
    { slug:"lainnya", label:"Lainnya", color:"#9CA3AF" },
  ];

  return (
    <div className="min-h-screen bg-[#F1F5F9] dark:bg-[#0F172A] flex">
      {/* SIDEBAR */}
      <aside className="hidden lg:flex w-[240px] shrink-0 bg-white dark:bg-[#0F172A] border-r border-[#E2E8F0] dark:border-[#1E293B] flex-col sticky top-0 h-screen overflow-hidden">
        <div className="h-[56px] flex items-center gap-2.5 px-4 border-b border-[#E2E8F0] dark:border-[#1E293B] shrink-0">
          <span className="w-9 h-9 rounded-xl bg-[#0EA5E9] grid place-items-center text-white text-[18px] shrink-0">🫂</span>
          <div className="min-w-0">
            <div className="text-[14px] font-extrabold text-[#0F172A] dark:text-white leading-none">Relawan SR</div>
            <div className="text-[10px] text-[#64748B] font-medium">Peta, Data, Kemenangan</div>
          </div>
        </div>

        <nav className="flex-1 overflow-auto p-2 space-y-0.5">
          <button onClick={()=>{ setTab("peta"); setMapView("relawan"); }} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-left ${tab==="peta" && mapView==="relawan" ? "bg-[#EFF6FF] text-[#2563EB] dark:bg-[#1E293B] dark:text-[#60A5FA]" : "text-[#475569] dark:text-[#94A3B8] hover:bg-slate-50 dark:hover:bg-white/5"}`}>
            <span className="w-7 h-7 rounded-lg bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] grid place-items-center text-[12px]">▦</span>
            Dashboard
          </button>

          <div>
            <button onClick={()=> setSegOpen(v=>!v)} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-[#475569] dark:text-[#94A3B8] hover:bg-slate-50 dark:hover:bg-white/5 text-left">
              <span className="w-7 h-7 rounded-lg bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] grid place-items-center text-[11px]">◈</span>
              <span className="flex-1">Segmentasi Relawan</span>
              <span className={`text-[10px] transition ${segOpen?"rotate-180":""}`}>▾</span>
            </button>
            {segOpen && (
              <div className="ml-4 pl-4 border-l border-[#E2E8F0] dark:border-[#1E293B] space-y-0.5 mt-0.5">
                {SEGMENTASI.map(s=>(
                  <button key={s.slug} onClick={()=>{ setTab("relawan"); setFilterSeg(s.slug); }} className={`w-full text-left px-3 py-1.5 rounded-lg text-[12px] ${filterSeg===s.slug && tab==="relawan" ? "bg-[#EFF6FF] text-[#2563EB] font-semibold" : "text-[#64748B] hover:text-[#334155]"}`}>
                    • {s.nama}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button onClick={()=> setTab("koordinator")} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-left ${tab==="koordinator" ? "bg-[#EFF6FF] text-[#2563EB] dark:bg-[#1E293B] dark:text-[#60A5FA]" : "text-[#475569] dark:text-[#94A3B8] hover:bg-slate-50 dark:hover:bg-white/5"}`}>
            <span className="w-7 h-7 rounded-lg bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] grid place-items-center text-[11px]">👥</span>
            Koordinator Relawan
          </button>

          <button onClick={()=> setTab("relawan")} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-left ${tab==="relawan" ? "bg-[#EFF6FF] text-[#2563EB] dark:bg-[#1E293B] dark:text-[#60A5FA]" : "text-[#475569] dark:text-[#94A3B8] hover:bg-slate-50 dark:hover:bg-white/5"}`}>
            <span className="w-7 h-7 rounded-lg bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] grid place-items-center text-[11px]">👤</span>
            Nama Relawan
          </button>

          <button onClick={()=>{ setTab("peta"); setMapView("relawan"); }} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-left ${tab==="peta" && mapView==="relawan" ? "bg-[#EFF6FF] text-[#2563EB]" : "text-[#475569] dark:text-[#94A3B8] hover:bg-slate-50"}`}>
            <span className="w-7 h-7 rounded-lg bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] grid place-items-center text-[11px]">📍</span>
            Peta Relawan
          </button>

          <div>
            <button onClick={()=> setPerbandinganOpen(v=>!v)} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-[#475569] dark:text-[#94A3B8] hover:bg-slate-50 dark:hover:bg-white/5 text-left">
              <span className="w-7 h-7 rounded-lg bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] grid place-items-center text-[11px]">◫</span>
              <span className="flex-1">Perbandingan Peta</span>
              <span className={`text-[10px] transition ${perbandinganOpen?"rotate-180":""}`}>▾</span>
            </button>
            {perbandinganOpen && (
              <div className="ml-4 pl-4 border-l border-[#E2E8F0] dark:border-[#1E293B] space-y-0.5 mt-0.5">
                <button onClick={()=>{ setTab("peta"); setMapView("komparasi-a"); }} className={`w-full text-left px-3 py-1.5 rounded-lg text-[12px] ${mapView==="komparasi-a" ? "bg-[#EFF6FF] text-[#2563EB] font-semibold":"text-[#64748B]"}`}>• Suara SR vs Relawan</button>
                <button onClick={()=>{ setTab("peta"); setMapView("komparasi-b"); }} className={`w-full text-left px-3 py-1.5 rounded-lg text-[12px] ${mapView==="komparasi-b" ? "bg-[#EFF6FF] text-[#2563EB] font-semibold":"text-[#64748B]"}`}>• TPS vs Relawan</button>
              </div>
            )}
          </div>

          <div>
            <button onClick={()=> setLaporanOpen(v=>!v)} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-left ${tab==="laporan" ? "bg-[#EFF6FF] text-[#2563EB] dark:bg-[#1E293B] dark:text-[#60A5FA]" : "text-[#475569] dark:text-[#94A3B8] hover:bg-slate-50"}`}>
              <span className="w-7 h-7 rounded-lg bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] grid place-items-center text-[11px]">📊</span>
              <span className="flex-1">Laporan & Analitik</span>
              <span className={`text-[10px] transition ${laporanOpen?"rotate-180":""}`}>▾</span>
            </button>
            {laporanOpen && (
              <div className="ml-4 pl-4 border-l border-[#E2E8F0] dark:border-[#1E293B] space-y-0.5 mt-0.5">
                <button onClick={()=> setTab("laporan")} className={`w-full text-left px-3 py-1.5 rounded-lg text-[12px] ${tab==="laporan" ? "bg-[#EFF6FF] text-[#2563EB] font-semibold" : "text-[#64748B]"}`}>• Rekap Kecamatan</button>
                <button onClick={()=> setTab("laporan")} className={`w-full text-left px-3 py-1.5 rounded-lg text-[12px] ${tab==="laporan" ? "bg-[#EFF6FF] text-[#2563EB] font-semibold" : "text-[#64748B]"}`}>• Rekap Kelurahan</button>
                <button onClick={()=> setTab("data-tps")} className="w-full text-left px-3 py-1.5 rounded-lg text-[12px] text-[#64748B]">• Data TPS</button>
              </div>
            )}
          </div>

          <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-[#475569] dark:text-[#94A3B8] hover:bg-slate-50 text-left">
            <span className="w-7 h-7 rounded-lg bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] grid place-items-center text-[11px]">⚙</span>
            Pengaturan
          </button>
        </nav>

        {/* bottom illustration */}
        <div className="p-3 shrink-0">
          <div className="bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE] dark:from-[#1E293B] dark:to-[#0F172A] rounded-xl border border-[#DBEAFE] dark:border-[#334155] p-3 overflow-hidden relative">
            <div className="text-[11px] font-bold text-[#1E40AF] dark:text-[#93C5FD] leading-tight">Bersama Relawan</div>
            <div className="text-[11px] font-bold text-[#1E40AF] dark:text-[#93C5FD] leading-tight">Kita Wujudkan Dapil 1</div>
            <div className="text-[11px] font-bold text-[#F97316] leading-tight">Kota Semarang</div>
            <div className="mt-2 h-[56px] bg-white/60 dark:bg-white/5 rounded-lg border border-white dark:border-white/10 flex items-end justify-center overflow-hidden">
              <span className="text-[28px] leading-none">🕌</span>
            </div>
          </div>
          <div className="text-[10px] text-[#94A3AF] mt-3 leading-tight">Relawan SR v1.0.0<br/>© 2025 - Dapil 1 Kota Semarang</div>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* TOP BAR */}
        <header className="h-[56px] shrink-0 bg-white dark:bg-[#0F172A] border-b border-[#E2E8F0] dark:border-[#1E293B] flex items-center gap-3 px-3 sm:px-4">
          <button className="lg:hidden w-8 h-8 rounded-lg border border-[#E2E8F0] dark:border-[#334155] grid place-items-center text-[#64748B]">☰</button>
          <div className="flex-1 max-w-[560px] relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3AF] text-[13px]">⌕</span>
            <input value={searchTop} onChange={e=>{ setSearchTop(e.target.value); setSearchRelawan(e.target.value); }} placeholder="Cari nama relawan, koordinator, wilayah, atau kata kunci..." className="w-full bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-full pl-9 pr-4 py-2 text-[13px] placeholder:text-[#94A3AF] outline-none focus:border-[#93C5FD] focus:bg-white dark:focus:bg-[#0F172A]" />
          </div>
          <div className="flex items-center gap-2 ml-auto shrink-0">
            <button onClick={toggleTheme} title={theme==="dark"?"Light":"Dark"} className="w-8 h-8 rounded-full bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] grid place-items-center text-[13px]">{theme==="dark"?"☀️":"🌙"}</button>
            <button className="w-8 h-8 rounded-full bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] grid place-items-center relative">
              <span className="text-[14px]">🔔</span><span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#EF4444] border-2 border-white" />
            </button>
            <div className="hidden sm:flex items-center gap-2 pl-2">
              <img src="https://i.pravatar.cc/100?img=12" alt="admin" className="w-8 h-8 rounded-full object-cover border border-[#E2E8F0]" />
              <div className="hidden lg:block leading-tight">
                <div className="text-[12px] font-bold text-[#0F172A] dark:text-white">Admin</div>
                <div className="text-[10px] text-[#94A3AF]">Super Admin</div>
              </div>
              <span className="text-[#94A3AF] text-[10px]">▾</span>
            </div>
          </div>
        </header>

        <main className="flex-1 bg-[#F1F5F9] dark:bg-[#020617] p-3 sm:p-4 space-y-4 overflow-auto">
          {/* banner import */}
          {importMsg && <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-[13px] rounded-xl px-4 py-2.5">{importMsg}</div>}

          {/* DASHBOARD CONTENT */}
          {tab==="peta" && (
            <div className="space-y-4">
              {/* header */}
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="text-[18px] font-extrabold text-[#0F172A] dark:text-white leading-none">Dashboard</h1>
                  <p className="text-[12px] text-[#64748B] mt-1">Ringkasan data relawan dan peta sebaran di Dapil 1 Kota Semarang</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={()=>{ setDraftTargetRelawan(String(targetRelawan)); setDraftTargetKoor(String(targetKoor)); setShowTargetModal(true); }} className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-lg px-3 py-1.5 text-[12px] font-bold text-[#334155] dark:text-[#CBD5E1] hover:bg-[#F8FAFC] dark:hover:bg-[#0F172A] shadow-sm">⚙ Atur Target</button>
                  <div className="flex items-center gap-2 bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-lg px-3 py-1.5 text-[12px] text-[#334155] dark:text-[#CBD5E1]">
                    <span className="text-[#94A3AF]">📅</span> 1 Jan 2025 - 31 Des 2025 <span className="text-[#94A3AF]">▾</span>
                  </div>
                </div>
              </div>

              {/* KPI — 2 kartu target + 2 info */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                {/* Total Relawan — dengan target */}
                <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-[#E2E8F0] dark:border-[#334155] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex gap-3 min-w-0">
                      <span className="w-10 h-10 rounded-xl bg-[#EFF6FF] dark:bg-[#0F172A] border border-[#DBEAFE] dark:border-[#334155] grid place-items-center text-[16px] shrink-0">👥</span>
                      <div className="min-w-0">
                        <div className="text-[11px] font-semibold text-[#64748B] leading-none">Total Relawan</div>
                        <div className="flex items-baseline gap-1.5 flex-wrap mt-1.5 leading-none">
                          <span className="text-[20px] font-extrabold text-[#0F172A] dark:text-white">{formatNumber(stats.r)}</span>
                          <span className="text-[11px] font-semibold text-[#94A3AF]">/ {formatNumber(targetRelawan)}</span>
                        </div>
                        <div className="text-[10px] text-[#94A3AF] mt-0.5">target</div>
                      </div>
                    </div>
                    <span className="shrink-0 inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-extrabold" style={{ background: progRelawan.color+"14", color: progRelawan.color, borderColor: progRelawan.color+"30" }}>{formatPct(progRelawan.pct)}%</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-[#F1F5F9] dark:bg-[#0F172A] overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progRelawan.pctClamped}%`, background: progRelawan.color }} />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px] gap-2">
                    <span className="text-[#64748B] truncate">{progRelawan.remaining===0 ? "Target terpenuhi ✓" : `Sisa ${formatNumber(progRelawan.remaining)} lagi`}</span>
                    <span className="font-bold shrink-0" style={{ color: progRelawan.color }}>{progRelawan.label}</span>
                  </div>
                  {progRelawan.pct >= 100 && <div className="mt-2 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg px-2.5 py-1 text-center">🎉 Target relawan tercapai!</div>}
                </div>

                {/* Koordinator Relawan — dengan target */}
                <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-[#E2E8F0] dark:border-[#334155] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex gap-3 min-w-0">
                      <span className="w-10 h-10 rounded-xl bg-[#FEF3C7] dark:bg-[#0F172A] border border-[#FDE68A] dark:border-[#334155] grid place-items-center text-[16px] shrink-0">👤</span>
                      <div className="min-w-0">
                        <div className="text-[11px] font-semibold text-[#64748B] leading-none">Koordinator Relawan</div>
                        <div className="flex items-baseline gap-1.5 flex-wrap mt-1.5 leading-none">
                          <span className="text-[20px] font-extrabold text-[#0F172A] dark:text-white">{formatNumber(stats.k)}</span>
                          <span className="text-[11px] font-semibold text-[#94A3AF]">/ {formatNumber(targetKoor)}</span>
                        </div>
                        <div className="text-[10px] text-[#94A3AF] mt-0.5">target</div>
                      </div>
                    </div>
                    <span className="shrink-0 inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-extrabold" style={{ background: progKoor.color+"14", color: progKoor.color, borderColor: progKoor.color+"30" }}>{formatPct(progKoor.pct)}%</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-[#F1F5F9] dark:bg-[#0F172A] overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progKoor.pctClamped}%`, background: progKoor.color }} />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px] gap-2">
                    <span className="text-[#64748B] truncate">{progKoor.remaining===0 ? "Target terpenuhi ✓" : `Sisa ${formatNumber(progKoor.remaining)} lagi`}</span>
                    <span className="font-bold shrink-0" style={{ color: progKoor.color }}>{progKoor.label}</span>
                  </div>
                  {progKoor.pct >= 100 && <div className="mt-2 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg px-2.5 py-1 text-center">🎉 Target koordinator tercapai!</div>}
                </div>

                {/* Data TPS */}
                <button onClick={()=> setTab("data-tps")} className="bg-white dark:bg-[#1E293B] rounded-xl border border-[#E2E8F0] dark:border-[#334155] p-4 flex items-start gap-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)] text-left hover:border-[#93C5FD] dark:hover:border-[#60A5FA] transition">
                  <span className="w-10 h-10 rounded-xl bg-[#ECFDF5] dark:bg-[#0F172A] border border-[#A7F3D0] dark:border-[#334155] grid place-items-center text-[16px] shrink-0">🗳️</span>
                  <div className="min-w-0">
                    <div className="text-[11px] font-semibold text-[#64748B] leading-none">Data TPS</div>
                    <div className="text-[20px] font-extrabold text-[#0F172A] dark:text-white leading-none mt-1.5">{formatNumber(stats.t)}</div>
                    <div className="text-[10px] text-[#94A3AF] mt-1">{formatNumber(filteredTps.length)} tampil · 34 Kelurahan · Dapil 1</div>
                    <div className="text-[10px] text-[#2563EB] font-semibold mt-1">Lihat Data TPS →</div>
                  </div>
                </button>

                {/* Segmentasi */}
                <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-[#E2E8F0] dark:border-[#334155] p-4 flex items-start gap-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                  <span className="w-10 h-10 rounded-xl bg-[#F5F3FF] dark:bg-[#0F172A] border border-[#DDD6FE] dark:border-[#334155] grid place-items-center text-[16px] shrink-0">📊</span>
                  <div className="min-w-0">
                    <div className="text-[11px] font-semibold text-[#64748B] leading-none">Segmentasi Relawan</div>
                    <div className="text-[20px] font-extrabold text-[#0F172A] dark:text-white leading-none mt-1.5">8</div>
                    <div className="text-[10px] text-[#94A3AF] mt-1">Kategori relawan</div>
                  </div>
                </div>
              </div>

              {/* middle row: map + right column */}
              <div className="grid xl:grid-cols-[1.65fr_0.85fr] gap-4">
                {/* Peta Sebaran */}
                <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-[#E2E8F0] dark:border-[#334155] overflow-hidden flex flex-col shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                  <div className="h-[44px] flex items-center justify-between px-3 border-b border-[#E2E8F0] dark:border-[#334155] shrink-0">
                    <div className="flex items-center gap-2 text-[13px] font-bold text-[#0F172A] dark:text-white"><span className="w-6 h-6 rounded bg-[#EFF6FF] dark:bg-[#0F172A] border border-[#DBEAFE] dark:border-[#334155] grid place-items-center text-[11px]">🗺️</span> Peta Sebaran Relawan</div>
                    <div className="flex items-center gap-2">
                      <select value={filterSeg} onChange={e=> setFilterSeg(e.target.value)} className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-lg px-2.5 py-1.5 text-[11px] text-[#334155] dark:text-[#CBD5E1] hidden sm:block">
                        <option value="semua">Semua Segmentasi</option>
                        {SEGMENTASI.map(s=> <option key={s.slug} value={s.slug}>{s.nama}</option>)}
                      </select>
                      <select value={kec} onChange={e=> handleKecChange(e.target.value)} className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-lg px-2.5 py-1.5 text-[11px] text-[#334155] dark:text-[#CBD5E1] hidden md:block">
                        {KECAMATAN.map(k=> <option key={k} value={k}>{k}</option>)}
                      </select>
                      <select value={kel} onChange={e=> setKel(e.target.value)} disabled={kec==="Semua kecamatan"} title={kec==="Semua kecamatan" ? "Pilih kecamatan dulu" : "Pilih kelurahan"} className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-lg px-2.5 py-1.5 text-[11px] text-[#334155] dark:text-[#CBD5E1] hidden md:block disabled:opacity-50 disabled:cursor-not-allowed min-w-[150px]">
                        {kelurahanOptions.map(k=> <option key={k} value={k}>{k}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="relative flex-1 min-h-[420px] bg-[#E0F2FE] dark:bg-[#0F172A] overflow-hidden">
                    {/* Map - keep all logic */}
                    <div className="absolute inset-0">
                      {mapView==="relawan" && <div className="h-full [&>div]:!rounded-none [&>div]:!border-0"><MapRelawan relawans={filteredRelawansForMap} tps={filteredTps} showTPS={false} /></div>}
                      {mapView==="suara" && <div className="h-full [&>div]:!rounded-none [&>div]:!border-0"><MapSuara tps={tpsList} mode={mode} kecamatan={kec} kelurahan={kel} /></div>}
                      {mapView==="komparasi-a" && <div className="h-full overflow-auto p-2 bg-white dark:bg-[#1E293B]"><MapKomparasiA tps={filteredTps} relawans={filteredRelawansForMap} mode={mode} opacity={opacity} /></div>}
                      {mapView==="komparasi-b" && <div className="h-full overflow-auto p-2 bg-white dark:bg-[#1E293B]"><MapKomparasiB tps={filteredTps} relawans={filteredRelawansForMap} radius={radius} /></div>}
                    </div>

                    {/* checklist overlay ala screenshot */}
                    <div className="absolute left-2 top-2 w-[148px] bg-white dark:bg-[#1E293B] rounded-lg border border-[#E2E8F0] dark:border-[#334155] shadow p-2 space-y-1">
                      <div className="text-[11px] font-bold text-[#0F172A] dark:text-white">Segmentasi Relawan</div>
                      {donutData.map(d=>{
                        const active = filterSeg==="semua" || filterSeg===d.slug;
                        return (
                          <label key={d.slug} className="flex items-center gap-2 text-[11px] text-[#334155] dark:text-[#CBD5E1] cursor-pointer">
                            <input type="checkbox" checked={filterSeg==="semua" || filterSeg===d.slug} onChange={()=> setFilterSeg(prev=> prev===d.slug ? "semua" : d.slug)} className="w-3.5 h-3.5 rounded border-[#CBD5E1] accent-[#2563EB]" />
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{background:d.color}} />
                            {d.label}
                          </label>
                        )
                      })}
                      <label className="flex items-center gap-2 text-[11px] text-[#334155] dark:text-[#CBD5E1] pt-1 border-t border-[#E2E8F0] dark:border-[#334155] mt-1">
                        <input type="checkbox" checked readOnly className="w-3.5 h-3.5 rounded" /> Batas Kabupaten/Kota
                      </label>
                    </div>

                    {/* zoom hint */}
                    <div className="absolute right-2 top-2 flex flex-col gap-1">
                      <div className="bg-white dark:bg-[#1E293B] rounded-lg border border-[#E2E8F0] dark:border-[#334155] shadow overflow-hidden">
                        <button className="w-7 h-7 grid place-items-center text-[#334155] dark:text-[#CBD5E1] text-[14px] font-bold border-b border-[#E2E8F0] dark:border-[#334155]" onClick={()=>{}}>＋</button>
                        <button className="w-7 h-7 grid place-items-center text-[#334155] dark:text-[#CBD5E1] text-[14px] font-bold border-b border-[#E2E8F0] dark:border-[#334155]">－</button>
                        <button className="w-7 h-7 grid place-items-center text-[#94A3AF] text-[11px]">◎</button>
                      </div>
                    </div>

                    {/* mode switcher bottom */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white dark:bg-[#1E293B] rounded-full border border-[#E2E8F0] dark:border-[#334155] shadow px-1 py-1 flex gap-1">
                      {[
                        {k:"relawan", label:"Relawan"},
                        {k:"suara", label:"Suara"},
                        {k:"komparasi-a", label:"Komparasi A"},
                        {k:"komparasi-b", label:"Komparasi B"},
                      ].map(b=>(
                        <button key={b.k} onClick={()=> setMapView(b.k as any)} className={`px-3 py-1 rounded-full text-[11px] font-bold ${mapView===b.k ? "bg-[#2563EB] text-white" : "text-[#64748B] hover:bg-slate-50 dark:hover:bg-white/5"}`}>{b.label}</button>
                      ))}
                    </div>
                  </div>
                  {(mapView==="komparasi-a" || mapView==="komparasi-b") && (
                    <div className="px-3 py-2 border-t border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#0F172A] flex flex-wrap items-center gap-2 text-[11px]">
                      {mapView==="komparasi-a" && (<>
                        <span className="font-semibold text-[#334155] dark:text-[#CBD5E1]">Opacity heatmap</span>
                        <input type="range" min={10} max={100} value={opacity} onChange={e=>setOpacity(Number(e.target.value))} className="accent-[#2563EB]" />
                        <span className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-full px-2 py-0.5 font-bold">{opacity}%</span>
                      </>)}
                      {mapView==="komparasi-b" && (<>
                        <span className="font-bold text-[#334155] dark:text-[#CBD5E1]">Radius blank spot</span>
                        {[300,500,1000].map(v=>(
                          <button key={v} onClick={()=>setRadius(v as any)} className={`px-3 py-1 rounded-full font-bold border ${radius===v ? "bg-[#0F172A] text-white border-[#0F172A]" : "bg-white dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#334155] text-[#334155] dark:text-[#CBD5E1]"}`}>{v} m</button>
                        ))}
                        <span className="ml-auto bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-full px-2.5 py-1"><span className="text-[#EF4444] font-bold">{blanks.filter(b=>b.blank).length}</span> blank dari {blanks.length}</span>
                      </>)}
                    </div>
                  )}
                </div>

                {/* Right column */}
                <div className="space-y-4">
                  {/* Donut */}
                  <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-[#E2E8F0] dark:border-[#334155] p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[13px] font-bold text-[#0F172A] dark:text-white"><span className="w-6 h-6 rounded bg-[#EFF6FF] dark:bg-[#0F172A] border border-[#DBEAFE] dark:border-[#334155] grid place-items-center text-[11px]">◈</span> Segmentasi Relawan</div>
                      <button onClick={()=> setTab("relawan")} className="text-[11px] text-[#2563EB] font-semibold">Lihat →</button>
                    </div>
                    <div className="flex gap-3 mt-3">
                      <div className="relative w-[132px] h-[132px] shrink-0">
                        <svg width="132" height="132" viewBox="0 0 132 132" className="-rotate-90">
                          {(()=>{ const total = donutData.reduce((a,d)=> a + (segCounts[d.slug]||0), 0) || 1; let off=0; return donutData.map(d=>{ const v=segCounts[d.slug]||0; const pct=v/total; const len=2*Math.PI*44*pct; const el=<circle key={d.slug} cx="66" cy="66" r="44" fill="none" stroke={d.color} strokeWidth="16" strokeDasharray={`${len} ${2*Math.PI*44}`} strokeDashoffset={`${-off}`} />; off+=len; return el; })})()}
                          <circle cx="66" cy="66" r="34" fill="white" className="dark:fill-[#1E293B]" />
                        </svg>
                        <div className="absolute inset-0 grid place-items-center text-center">
                          <div>
                            <div className="text-[16px] font-extrabold text-[#0F172A] dark:text-white leading-none">{formatNumber(stats.r)}</div>
                            <div className="text-[10px] text-[#64748B]">Total Relawan</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 space-y-1.5">
                        {donutData.map(d=>{
                          const v = segCounts[d.slug]||0;
                          const pct = stats.r ? Math.round(v/stats.r*100) : 0;
                          return (
                            <button key={d.slug} onClick={()=>{ setFilterSeg(d.slug); setTab("relawan"); }} className="w-full flex items-center gap-2 text-left hover:bg-slate-50 dark:hover:bg-white/5 rounded px-1 py-0.5">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{background:d.color}} />
                              <span className="text-[11px] text-[#334155] dark:text-[#CBD5E1] flex-1 truncate">{d.label}</span>
                              <span className="text-[11px] font-bold text-[#0F172A] dark:text-white">{formatNumber(v)}</span>
                              <span className="text-[10px] text-[#94A3AF] w-7 text-right">{pct}%</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Top 5 */}
                  <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-[#E2E8F0] dark:border-[#334155] p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                    <div className="flex items-center justify-between">
                      <div className="text-[13px] font-bold text-[#0F172A] dark:text-white">Top 5 Koordinator Relawan</div>
                      <button onClick={()=> setTab("koordinator")} className="text-[11px] text-[#2563EB] font-semibold">Lihat Semua →</button>
                    </div>
                    <div className="mt-3 space-y-2.5">
                      {topKoors.map((k,i)=>(
                        <div key={k.id} className="flex items-center gap-2.5">
                          <span className="text-[11px] font-bold text-[#94A3AF] w-4 text-center">{i+1}</span>
                          <img src={`https://i.pravatar.cc/100?img=${10+i}`} alt={k.nama} className="w-8 h-8 rounded-full object-cover border border-[#E2E8F0]" />
                          <div className="flex-1 min-w-0">
                            <div className="text-[12px] font-bold text-[#0F172A] dark:text-white leading-none truncate">{k.nama}</div>
                            <div className="text-[10px] text-[#64748B]">Koordinator {k.kecamatan}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-[12px] font-bold text-[#0F172A] dark:text-white leading-none">{k.cnt} relawan</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Aktivitas Terbaru */}
                  <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-[#E2E8F0] dark:border-[#334155] p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                    <div className="flex items-center justify-between">
                      <div className="text-[13px] font-bold text-[#0F172A] dark:text-white">Aktivitas Terbaru</div>
                      <span className="text-[11px] text-[#2563EB] font-semibold">Lihat Semua →</span>
                    </div>
                    <div className="mt-3 space-y-3">
                      {[
                        { icon:"＋", bg:"bg-[#2563EB]", title:"Relawan baru ditambahkan", desc:`${relawans[0]?.nama ?? "Siti Rahmawati"} - ${relawans[0]?.kelurahan ?? "Semarang"}`, time:"2 jam lalu" },
                        { icon:"👤", bg:"bg-[#0EA5E9]", title:"Koordinator diperbarui", desc:`${koors[0]?.nama ?? "Ahmad Fauzi"} - Koordinator ${koors[0]?.kecamatan ?? "Banyumas"}`, time:"4 jam lalu" },
                        { icon:"◈", bg:"bg-[#F59E0B]", title:"Segmentasi relawan diperbarui", desc:`Data segmentasi OJOL di Solo`, time:"6 jam lalu" },
                        { icon:"⌖", bg:"bg-[#2563EB]", title:"TPS Dapil 1 diperbarui", desc:`Data TPS dan sinkronisasi`, time:"8 jam lalu" },
                        { icon:"✓", bg:"bg-[#16A34A]", title:"Peta relawan berhasil dimuat", desc:`Total ${formatNumber(stats.r)} relawan ditampilkan`, time:"10 jam lalu" },
                      ].map((a,i)=>(
                        <div key={i} className="flex gap-2.5">
                          <span className={`w-7 h-7 rounded-full ${a.bg} grid place-items-center text-white text-[11px] shrink-0 mt-0.5`}>{a.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-[12px] font-semibold text-[#0F172A] dark:text-white leading-tight">{a.title}</div>
                            <div className="text-[11px] text-[#64748B] truncate">{a.desc}</div>
                          </div>
                          <span className="text-[10px] text-[#94A3AF] shrink-0">{a.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* bottom comparison cards */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-[#E2E8F0] dark:border-[#334155] p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[12px] font-bold text-[#0F172A] dark:text-white"><span className="w-6 h-6 rounded bg-[#EFF6FF] dark:bg-[#0F172A] border border-[#DBEAFE] dark:border-[#334155] grid place-items-center text-[10px]">🗺️</span> Peta Suara SR 2024 vs Peta Relawan SR</div>
                    <button onClick={()=>{ setTab("peta"); setMapView("komparasi-a"); window.scrollTo({top:0, behavior:"smooth"}); }} className="text-[11px] text-[#2563EB] font-semibold">Lihat Detail →</button>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-[11px] font-semibold text-[#334155] dark:text-[#CBD5E1] text-center">Suara SR 2024</div>
                      <div className="mt-1 h-[120px] bg-[#EFF6FF] dark:bg-[#0F172A] rounded-lg border border-[#DBEAFE] dark:border-[#334155] flex items-center justify-center overflow-hidden">
                        <span className="text-[10px] text-[#64748B] text-center px-2">Heatmap biru<br/>SR {formatNumber(stats.sr)} suara</span>
                      </div>
                      <div className="mt-1.5 flex items-center justify-center gap-1 text-[9px] text-[#64748B]"><span>Rendah</span><span className="flex gap-0.5"><span className="w-4 h-2 bg-[#DBEAFE] rounded-sm" /><span className="w-4 h-2 bg-[#93C5FD] rounded-sm" /><span className="w-4 h-2 bg-[#2563EB] rounded-sm" /><span className="w-4 h-2 bg-[#1E3A8A] rounded-sm" /></span><span>Tinggi</span></div>
                    </div>
                    <div className="relative">
                      <span className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#2563EB] text-white grid place-items-center text-[9px] font-black border-2 border-white dark:border-[#1E293B] shadow z-10">VS</span>
                      <div className="text-[11px] font-semibold text-[#334155] dark:text-[#CBD5E1] text-center">Relawan SR</div>
                      <div className="mt-1 h-[120px] bg-[#ECFDF5] dark:bg-[#0F172A] rounded-lg border border-[#A7F3D0] dark:border-[#334155] flex items-center justify-center">
                        <span className="text-[10px] text-[#64748B] text-center px-2">Heatmap hijau<br/>{stats.r} relawan</span>
                      </div>
                      <div className="mt-1.5 flex items-center justify-center gap-1 text-[9px] text-[#64748B]"><span>Rendah</span><span className="flex gap-0.5"><span className="w-4 h-2 bg-[#D1FAE5] rounded-sm" /><span className="w-4 h-2 bg-[#6EE7B7] rounded-sm" /><span className="w-4 h-2 bg-[#10B981] rounded-sm" /><span className="w-4 h-2 bg-[#065F46] rounded-sm" /></span><span>Tinggi</span></div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-[#E2E8F0] dark:border-[#334155] p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[12px] font-bold text-[#0F172A] dark:text-white"><span className="w-6 h-6 rounded bg-[#EFF6FF] dark:bg-[#0F172A] border border-[#DBEAFE] dark:border-[#334155] grid place-items-center text-[10px]">⌖</span> Peta TPS Dapil 1 vs Peta Relawan SR</div>
                    <button onClick={()=>{ setTab("peta"); setMapView("komparasi-b"); window.scrollTo({top:0, behavior:"smooth"}); }} className="text-[11px] text-[#2563EB] font-semibold">Lihat Detail →</button>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-[11px] font-semibold text-[#334155] dark:text-[#CBD5E1] text-center">TPS Dapil 1</div>
                      <div className="mt-1 h-[120px] bg-[#F5F3FF] dark:bg-[#0F172A] rounded-lg border border-[#DDD6FE] dark:border-[#334155] flex items-center justify-center">
                        <span className="text-[10px] text-[#64748B] text-center px-2">{stats.t} TPS<br/>34 kelurahan</span>
                      </div>
                      <div className="mt-1.5 flex items-center justify-center gap-1 text-[9px] text-[#64748B]"><span>Rendah</span><span className="flex gap-0.5"><span className="w-4 h-2 bg-[#E9D5FF] rounded-sm" /><span className="w-4 h-2 bg-[#A78BFA] rounded-sm" /><span className="w-4 h-2 bg-[#7C3AED] rounded-sm" /><span className="w-4 h-2 bg-[#4C1D95] rounded-sm" /></span><span>Tinggi</span></div>
                    </div>
                    <div className="relative">
                      <span className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#475569] text-white grid place-items-center text-[9px] font-black border-2 border-white dark:border-[#1E293B] shadow z-10">VS</span>
                      <div className="text-[11px] font-semibold text-[#334155] dark:text-[#CBD5E1] text-center">Relawan SR</div>
                      <div className="mt-1 h-[120px] bg-[#ECFDF5] dark:bg-[#0F172A] rounded-lg border border-[#A7F3D0] dark:border-[#334155] flex items-center justify-center">
                        <span className="text-[10px] text-[#64748B] text-center px-2">{blanks.filter(b=>b.blank).length} blank spot<br/>{blanks.filter(b=>!b.blank).length} ter-cover</span>
                      </div>
                      <div className="mt-1.5 flex items-center justify-center gap-1 text-[9px] text-[#64748B]"><span>Rendah</span><span className="flex gap-0.5"><span className="w-4 h-2 bg-[#D1FAE5] rounded-sm" /><span className="w-4 h-2 bg-[#6EE7B7] rounded-sm" /><span className="w-4 h-2 bg-[#10B981] rounded-sm" /><span className="w-4 h-2 bg-[#065F46] rounded-sm" /></span><span>Tinggi</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* KOORDINATOR TAB */}
          {tab==="koordinator" && (
            <section className="bg-white dark:bg-[#1E293B] rounded-xl border border-[#E2E8F0] dark:border-[#334155] p-4 space-y-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div><h2 className="font-extrabold text-[#0F172A] dark:text-white text-[14px]">Koordinator — {formatNumber(stats.k)} / {formatNumber(targetKoor)} target <span className="ml-1 inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-extrabold" style={{ background: progKoor.color+"14", color: progKoor.color, borderColor: progKoor.color+"30" }}>{formatPct(progKoor.pct)}%</span></h2><p className="text-[12px] text-[#64748B]">Sebar di 3 kecamatan Dapil 1 · {progKoor.remaining===0 ? "target terpenuhi ✓" : `sisa ${formatNumber(progKoor.remaining)} lagi`} — {progKoor.label}</p></div>
                <div className="flex items-center gap-2">
                  <button onClick={()=>{ setDraftTargetRelawan(String(targetRelawan)); setDraftTargetKoor(String(targetKoor)); setShowTargetModal(true); }} className="hidden sm:inline-flex bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-full px-3 py-2 text-[13px] font-bold text-[#334155] dark:text-[#CBD5E1]">⚙ Atur Target</button>
                  <select value={kec} onChange={e=>handleKecChange(e.target.value)} className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-full px-3 py-2 text-[13px]"><option value="Semua kecamatan">Semua kecamatan</option>{KECAMATAN.slice(1).map(k=> <option key={k} value={k}>{k}</option>)}</select>
                  <select value={kel} onChange={e=> setKel(e.target.value)} disabled={kec==="Semua kecamatan"} title={kec==="Semua kecamatan" ? "Pilih kecamatan dulu" : "Pilih kelurahan"} className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-full px-3 py-2 text-[13px] disabled:opacity-50 disabled:cursor-not-allowed min-w-[150px]">
                    {kelurahanOptions.map(k=> <option key={k} value={k}>{k}</option>)}
                  </select>
                  <button onClick={()=> setShowTambahKoor(true)} className="bg-[#2563EB] text-white rounded-full px-4 py-2 text-[13px] font-bold shadow">+ Tambah Koordinator</button>
                </div>
              </div>
              <div className="rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#0F172A] p-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 text-[11px] font-bold">
                    <span className="text-[#334155] dark:text-[#CBD5E1]">Progress koordinator</span>
                    <span style={{ color: progKoor.color }}>{formatNumber(stats.k)} / {formatNumber(targetKoor)} · {formatPct(progKoor.pct)}%</span>
                  </div>
                  <div className="mt-1.5 h-2 rounded-full bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progKoor.pctClamped}%`, background: progKoor.color }} />
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[10px]"><span className="text-[#64748B]">{progKoor.remaining===0 ? "🎉 Tercapai" : `${formatNumber(progKoor.remaining)} lagi menuju target`}</span><span className="font-bold" style={{ color: progKoor.color }}>{progKoor.label}</span></div>
                </div>
                <button onClick={()=>{ setDraftTargetRelawan(String(targetRelawan)); setDraftTargetKoor(String(targetKoor)); setShowTargetModal(true); }} className="shrink-0 bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-full px-3 py-1.5 text-[11px] font-bold text-[#334155] dark:text-[#CBD5E1]">Ubah target</button>
              </div>
              <div className="overflow-auto rounded-xl border border-[#E2E8F0] dark:border-[#334155]">
                <table className="w-full text-[13px]">
                  <thead className="text-[#64748B] bg-[#F8FAFC] dark:bg-[#0F172A]"><tr><th className="text-left py-2.5 px-3">Nama</th><th className="text-left">Wilayah</th><th className="text-left">WA</th><th className="text-right px-2">Relawan</th><th className="text-left pl-3">Status</th></tr></thead>
                  <tbody>
                    {(kec==="Semua kecamatan"? koors: koors.filter(k=>k.kecamatan===kec)).map(k=>(
                      <tr key={k.id} className="border-t border-[#F1F5F9] dark:border-[#0F172A] hover:bg-[#F8FAFC] dark:hover:bg-[#0F172A]">
                        <td className="py-3 px-3 font-bold text-[#0F172A] dark:text-white">{k.nama}</td>
                        <td className="text-[#64748B]">{k.kelurahan}, {k.kecamatan}</td>
                        <td className="font-mono text-[#94A3AF] text-[12px]">{k.wa.replace(/(\d{4})$/, "****")}</td>
                        <td className="text-right tabular-nums px-2 font-bold">{relawans.filter(r=> r.koordinatorId===k.id && r.status==="aktif").length}</td>
                        <td className="pl-3 py-2"><span className={`text-[11px] px-2.5 py-1 rounded-full border font-bold ${k.status==="aktif"?"bg-emerald-50 border-emerald-200 text-emerald-700":"bg-slate-100 border-slate-200 text-slate-600"}`}>{k.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {showTambahKoor && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={()=>setShowTambahKoor(false)}>
                  <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-5 w-full max-w-md space-y-3 shadow-xl border border-[#E2E8F0] dark:border-[#334155]" onClick={e=>e.stopPropagation()}>
                    <div className="font-bold text-[#0F172A] dark:text-white">Tambah Koordinator</div>
                    <input placeholder="Nama lengkap" value={formKoor.nama} onChange={e=>setFormKoor({...formKoor, nama:e.target.value})} className="w-full border border-[#E2E8F0] dark:border-[#334155] rounded-xl px-3 py-2.5 text-[13px] bg-white dark:bg-[#0F172A] dark:text-white outline-none" />
                    <input placeholder="WA +62..." value={formKoor.wa} onChange={e=>setFormKoor({...formKoor, wa:e.target.value})} className="w-full border border-[#E2E8F0] dark:border-[#334155] rounded-xl px-3 py-2.5 text-[13px] bg-white dark:bg-[#0F172A] dark:text-white outline-none" />
                    <div className="grid grid-cols-2 gap-2">
                      <select value={formKoor.kecamatan} onChange={e=>{ const kecVal=e.target.value; const kels=KELURAHAN_BY_KEC[kecVal]??[]; const keepKel = kels.includes(formKoor.kelurahan) ? formKoor.kelurahan : (kels[0]??""); setFormKoor(prev=>({...prev, kecamatan:kecVal, kelurahan: keepKel})); }} className="border border-[#E2E8F0] dark:border-[#334155] rounded-xl px-3 py-2.5 text-[13px] bg-white dark:bg-[#0F172A] dark:text-white">{KECAMATAN.slice(1).map(k=> <option key={k} value={k}>{k}</option>)}</select>
                      <select value={formKoor.kelurahan} onChange={e=>setFormKoor({...formKoor, kelurahan:e.target.value})} className="border border-[#E2E8F0] dark:border-[#334155] rounded-xl px-3 py-2.5 text-[13px] bg-white dark:bg-[#0F172A] dark:text-white">{(KELURAHAN_BY_KEC[formKoor.kecamatan] ?? []).map(k=> <option key={k} value={k}>{k}</option>)}</select>
                    </div>
                    <p className="text-[11px] text-[#94A3AF]">Pilih kecamatan → dropdown kelurahan di sebelahnya ikut. Titik peta koordinator ikut kelurahan.</p>
                    <div className="flex justify-end gap-2"><button onClick={()=>setShowTambahKoor(false)} className="px-4 py-2 text-[13px] font-medium text-[#64748B]">Batal</button><button onClick={handleAddKoor} className="bg-[#2563EB] text-white rounded-full px-5 py-2 text-[13px] font-bold shadow">Simpan</button></div>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* RELAWAN TAB */}
          {tab==="relawan" && (
            <section className="bg-white dark:bg-[#1E293B] rounded-xl border border-[#E2E8F0] dark:border-[#334155] p-4 space-y-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div><h2 className="font-extrabold text-[#0F172A] dark:text-white text-[14px]">Nama Relawan — {filteredRelawans.length} / {relawans.length} tampil <span className="ml-1 inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-extrabold align-middle" style={{ background: progRelawan.color+"14", color: progRelawan.color, borderColor: progRelawan.color+"30" }}>{formatPct(progRelawan.pct)}% dari target</span></h2><p className="text-[12px] text-[#64748B]">{formatNumber(stats.r)} / {formatNumber(targetRelawan)} relawan · {progRelawan.remaining===0 ? "target terpenuhi ✓" : `sisa ${formatNumber(progRelawan.remaining)} lagi`} — {progRelawan.label} · Warna badge konsisten dengan peta</p></div>
                <button onClick={()=>{ setDraftTargetRelawan(String(targetRelawan)); setDraftTargetKoor(String(targetKoor)); setShowTargetModal(true); }} className="hidden sm:inline-flex bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-full px-3 py-1.5 text-[12px] font-bold text-[#334155] dark:text-[#CBD5E1] shrink-0">⚙ Atur Target</button>
                <div className="flex flex-wrap items-center gap-2">
                  <input placeholder="Cari nama / kelurahan" value={searchRelawan} onChange={e=>setSearchRelawan(e.target.value)} className="border border-[#E2E8F0] dark:border-[#334155] rounded-full px-4 py-2 text-[13px] bg-[#F8FAFC] dark:bg-[#0F172A] dark:text-white w-56 outline-none" />
                  <select value={filterSeg} onChange={e=>setFilterSeg(e.target.value)} className="border border-[#E2E8F0] dark:border-[#334155] rounded-full px-3 py-2 text-[13px] bg-white dark:bg-[#0F172A] dark:text-white"><option value="semua">Semua segmentasi</option>{SEGMENTASI.map(s=> <option key={s.slug} value={s.slug}>{s.nama}</option>)}</select>
                  <select value={filterKoor} onChange={e=>setFilterKoor(e.target.value)} className="border border-[#E2E8F0] dark:border-[#334155] rounded-full px-3 py-2 text-[13px] bg-white dark:bg-[#0F172A] dark:text-white"><option value="semua">Semua koordinator</option>{koors.map(k=> <option key={k.id} value={k.id}>{k.nama}</option>)}</select>
                </div>
              </div>
              <div className="rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#0F172A] p-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 text-[11px] font-bold">
                    <span className="text-[#334155] dark:text-[#CBD5E1]">Progress relawan</span>
                    <span style={{ color: progRelawan.color }}>{formatNumber(stats.r)} / {formatNumber(targetRelawan)} · {formatPct(progRelawan.pct)}%</span>
                  </div>
                  <div className="mt-1.5 h-2 rounded-full bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progRelawan.pctClamped}%`, background: progRelawan.color }} />
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[10px]"><span className="text-[#64748B]">{progRelawan.remaining===0 ? "🎉 Tercapai" : `${formatNumber(progRelawan.remaining)} lagi menuju target`}</span><span className="font-bold" style={{ color: progRelawan.color }}>{progRelawan.label}</span></div>
                </div>
                <button onClick={()=>{ setDraftTargetRelawan(String(targetRelawan)); setDraftTargetKoor(String(targetKoor)); setShowTargetModal(true); }} className="shrink-0 bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-full px-3 py-1.5 text-[11px] font-bold text-[#334155] dark:text-[#CBD5E1]">Ubah target</button>
              </div>
              <div className="flex flex-wrap gap-2">
                <label className="text-[13px] bg-[#0F172A] dark:bg-white dark:text-[#0F172A] text-white rounded-full px-4 py-2 font-bold cursor-pointer shadow">Import Excel/CSV <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleImportRelawan} /></label>
                <button onClick={()=> exportCSV("relawan.csv", filteredRelawans.map(r=>({nama:r.nama, wa:r.wa, kelurahan:r.kelurahan, kecamatan:r.kecamatan, rt_rw:r.rtRw, lat:r.lat, lng:r.lng, segmentasi:r.segmentasi, koordinator:r.koordinatorNama, status:r.status})), ["nama","wa","kelurahan","kecamatan","rt_rw","lat","lng","segmentasi","koordinator","status"])} className="text-[13px] bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-full px-4 py-2 font-bold">Export CSV</button>
                <button onClick={()=> setShowTambahRelawan(true)} className="text-[13px] bg-[#2563EB] text-white rounded-full px-4 py-2 font-bold shadow">+ Tambah Relawan</button>
                <a href="/templates/template_relawan.csv" download className="text-[12px] underline text-[#64748B] py-2">Download template</a>
              </div>
              {(filterSeg!=="semua" || filterKoor!=="semua" || searchRelawan || searchTop) && (
                <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl px-3 py-2 text-[12px] text-amber-800 dark:text-amber-200">
                  <span>Filter aktif: {filteredRelawans.length} dari {relawans.length} relawan</span>
                  <button onClick={()=>{ setFilterSeg("semua"); setFilterKoor("semua"); setSearchRelawan(""); setSearchTop(""); }} className="ml-auto bg-white dark:bg-[#1E293B] border border-amber-200 dark:border-amber-800 rounded-full px-3 py-1 font-bold text-amber-700 dark:text-amber-200">Reset filter → tampil semua</button>
                </div>
              )}
              <div className="overflow-auto max-h-[560px] border border-[#E2E8F0] dark:border-[#334155] rounded-xl">
                <table className="w-full text-[13px]">
                  <thead className="sticky top-0 bg-[#F8FAFC] dark:bg-[#0F172A] text-[#64748B]"><tr><th className="text-left p-2.5 px-3">Nama</th><th className="text-left">Segmentasi</th><th className="text-left">Koordinator</th><th className="text-left">Wilayah</th><th className="text-left">WA</th><th className="text-left">Status</th></tr></thead>
                  <tbody>
                    {filteredRelawans.map(r=>{
                      const seg=segBySlug(r.segmentasi);
                      return (
                        <tr key={r.id} className="border-t border-[#F1F5F9] dark:border-[#0F172A] hover:bg-[#F8FAFC] dark:hover:bg-[#0F172A]">
                          <td className="p-2.5 px-3 font-bold whitespace-nowrap text-[#0F172A] dark:text-white">{r.nama}<div className="text-[11px] text-[#94A3AF] font-normal">{r.alamat}</div></td>
                          <td><span className={`inline-block px-2.5 py-1 rounded-full border text-[11px] font-bold ${seg.badge}`}>{seg.nama}</span></td>
                          <td className="whitespace-nowrap text-[#334155] dark:text-[#CBD5E1]">{r.koordinatorNama}</td>
                          <td className="whitespace-nowrap text-[#64748B] text-[12px]">{r.kelurahan}, {r.kecamatan}<div className="text-[#94A3AF] text-[11px]">{r.rtRw} · {r.lat.toFixed(3)}, {r.lng.toFixed(3)}</div></td>
                          <td className="font-mono text-[#94A3AF] text-[12px]">{r.wa.replace(/(\d{4})$/, "****")}</td>
                          <td><span className={`px-2.5 py-1 rounded-full border text-[11px] font-bold ${r.status==="aktif"?"bg-emerald-50 border-emerald-200 text-emerald-700":"bg-slate-100 border-slate-200 text-slate-600"}`}>{r.status}</span></td>
                        </tr>
                      )
                    })}
                    {filteredRelawans.length===0 && <tr><td colSpan={6} className="py-10 text-center text-[#94A3AF]">Tidak ada relawan sesuai filter. Klik Reset filter.</td></tr>}
                  </tbody>
                </table>
              </div>
              <div className="text-[12px] text-[#64748B] text-center">Menampilkan semua {filteredRelawans.length} relawan dari {relawans.length} — scroll untuk lihat ↓</div>
              {showTambahRelawan && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={()=>setShowTambahRelawan(false)}>
                  <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-5 w-full max-w-lg space-y-3 max-h-[90vh] overflow-auto shadow-xl border border-[#E2E8F0] dark:border-[#334155]" onClick={e=>e.stopPropagation()}>
                    <div className="font-bold text-[#0F172A] dark:text-white">Tambah Relawan</div>
                    <div className="grid grid-cols-2 gap-2">
                      <input placeholder="Nama lengkap" value={formRelawan.nama} onChange={e=>setFormRelawan({...formRelawan, nama:e.target.value})} className="border border-[#E2E8F0] dark:border-[#334155] rounded-xl px-3 py-2.5 text-[13px] col-span-2 bg-white dark:bg-[#0F172A] dark:text-white outline-none" />
                      <input placeholder="WA 628..." value={formRelawan.wa} onChange={e=>setFormRelawan({...formRelawan, wa:e.target.value})} className="border border-[#E2E8F0] dark:border-[#334155] rounded-xl px-3 py-2.5 text-[13px] bg-white dark:bg-[#0F172A] dark:text-white" />
                      <select value={formRelawan.segmentasi} onChange={e=>setFormRelawan({...formRelawan, segmentasi:e.target.value})} className="border border-[#E2E8F0] dark:border-[#334155] rounded-xl px-3 py-2.5 text-[13px] bg-white dark:bg-[#0F172A] dark:text-white">{SEGMENTASI.map(s=> <option key={s.slug} value={s.slug}>{s.nama}</option>)}</select>
                      <select value={formRelawan.koordinatorId} onChange={e=>setFormRelawan({...formRelawan, koordinatorId:e.target.value})} className="border border-[#E2E8F0] dark:border-[#334155] rounded-xl px-3 py-2.5 text-[13px] col-span-2 bg-white dark:bg-[#0F172A] dark:text-white">{koors.map(k=> <option key={k.id} value={k.id}>{k.nama} — {k.kecamatan}</option>)}</select>
                      <input placeholder="Alamat (Jl. ...)" value={formRelawan.alamat} onChange={e=>setFormRelawan({...formRelawan, alamat:e.target.value})} className="border border-[#E2E8F0] dark:border-[#334155] rounded-xl px-3 py-2.5 text-[13px] col-span-2 bg-white dark:bg-[#0F172A] dark:text-white" />
                      <select value={formRelawan.kecamatan} onChange={e=>{ const kecVal=e.target.value; const kels=KELURAHAN_BY_KEC[kecVal]??[]; const kelFirst=kels[0]??""; const keepKel = kels.includes(formRelawan.kelurahan) ? formRelawan.kelurahan : kelFirst; setFormRelawan(prev=>({...prev, kecamatan:kecVal, kelurahan: keepKel})); }} className="border border-[#E2E8F0] dark:border-[#334155] rounded-xl px-3 py-2.5 text-[13px] bg-white dark:bg-[#0F172A] dark:text-white">
                        {KECAMATAN.slice(1).map(k=> <option key={k} value={k}>{k}</option>)}
                      </select>
                      <select value={formRelawan.kelurahan} onChange={e=>setFormRelawan({...formRelawan, kelurahan:e.target.value})} className="border border-[#E2E8F0] dark:border-[#334155] rounded-xl px-3 py-2.5 text-[13px] bg-white dark:bg-[#0F172A] dark:text-white">
                        {(KELURAHAN_BY_KEC[formRelawan.kecamatan] ?? []).map(k=> <option key={k} value={k}>{k}</option>)}
                      </select>
                      <input placeholder="RT/RW 01/02" value={formRelawan.rtRw} onChange={e=>setFormRelawan({...formRelawan, rtRw:e.target.value})} className="border border-[#E2E8F0] dark:border-[#334155] rounded-xl px-3 py-2.5 text-[13px] bg-white dark:bg-[#0F172A] dark:text-white" />
                      <input placeholder="Lat -6.98" value={formRelawan.lat} onChange={e=>setFormRelawan({...formRelawan, lat:e.target.value})} className="border border-[#E2E8F0] dark:border-[#334155] rounded-xl px-3 py-2.5 text-[13px] bg-white dark:bg-[#0F172A] dark:text-white" />
                      <input placeholder="Lng 110.42" value={formRelawan.lng} onChange={e=>setFormRelawan({...formRelawan, lng:e.target.value})} className="border border-[#E2E8F0] dark:border-[#334155] rounded-xl px-3 py-2.5 text-[13px] bg-white dark:bg-[#0F172A] dark:text-white" />
                    </div>
                    <p className="text-[11px] text-[#94A3AF]">Pilih kecamatan → dropdown kelurahan di sebelahnya ikut. Alamat bebas (mis. Jl. Pemuda No. 10). Kelurahan menentukan titik peta — lat/lng otomatis diisi jika kosong; bisa edit manual.</p>
                    <div className="flex justify-end gap-2"><button onClick={()=>setShowTambahRelawan(false)} className="px-4 py-2 text-[13px] text-[#64748B]">Batal</button><button onClick={handleAddRelawan} className="bg-[#2563EB] text-white rounded-full px-5 py-2 text-[13px] font-bold shadow">Simpan</button></div>
                  </div>
                </div>
              )}
            </section>
          )}

          {tab==="data-tps" && (
            <section className="bg-white dark:bg-[#1E293B] rounded-xl border border-[#E2E8F0] dark:border-[#334155] p-4 space-y-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div><h2 className="font-extrabold text-[#0F172A] dark:text-white text-[14px]">Data TPS — {filteredTps.length} / {tpsList.length} TPS</h2><p className="text-[12px] text-[#64748B]">34 kelurahan Dapil 1 · import massal didukung</p></div>
                <div className="flex items-center gap-2">
                  <input placeholder="Cari TPS / kelurahan" value={searchTps} onChange={e=>setSearchTps(e.target.value)} className="border border-[#E2E8F0] dark:border-[#334155] rounded-full px-4 py-2 text-[13px] bg-[#F8FAFC] dark:bg-[#0F172A] dark:text-white w-52 outline-none" />
                  <select value={kec} onChange={e=>handleKecChange(e.target.value)} className="border border-[#E2E8F0] dark:border-[#334155] rounded-full px-3 py-2 text-[13px] bg-white dark:bg-[#0F172A] dark:text-white">{KECAMATAN.map(k=> <option key={k} value={k}>{k}</option>)}</select>
                  <select value={kel} onChange={e=> setKel(e.target.value)} disabled={kec==="Semua kecamatan"} title={kec==="Semua kecamatan" ? "Pilih kecamatan dulu" : "Pilih kelurahan"} className="border border-[#E2E8F0] dark:border-[#334155] rounded-full px-3 py-2 text-[13px] bg-white dark:bg-[#0F172A] dark:text-white disabled:opacity-50 disabled:cursor-not-allowed min-w-[150px]">
                    {kelurahanOptions.map(k=> <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <label className="text-[13px] bg-[#0F172A] dark:bg-white dark:text-[#0F172A] text-white rounded-full px-4 py-2 font-bold cursor-pointer shadow">Unggah Excel/CSV <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleImportTPS} /></label>
                <button onClick={()=> exportCSV("data-tps.csv", filteredTps.map(t=>({no_tps:t.noTps, kelurahan:t.kelurahan, kecamatan:t.kecamatan, lat:t.lat, lng:t.lng, dpt:t.dpt, suara_sah:t.suaraSah, suara_siti_roika:t.suaraSitiRoika, suara_pks:t.suaraPKS})), ["no_tps","kelurahan","kecamatan","lat","lng","dpt","suara_sah","suara_siti_roika","suara_pks"])} className="text-[13px] bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-full px-4 py-2 font-bold dark:text-white">Export CSV</button>
                <a href="/templates/template_data_tps.csv" download className="text-[12px] underline text-[#64748B] py-2">Download template</a>
              </div>
              <div className="overflow-auto max-h-[520px] border border-[#E2E8F0] dark:border-[#334155] rounded-xl">
                <table className="w-full text-[13px]">
                  <thead className="sticky top-0 bg-[#F8FAFC] dark:bg-[#0F172A] text-[#64748B]"><tr><th className="text-left p-2.5 px-3">TPS</th><th className="text-left">Kelurahan</th><th className="text-left">Kecamatan</th><th className="text-right px-2">DPT</th><th className="text-right px-2">Sah</th><th className="text-right px-2">SR</th><th className="text-right px-2">PKS</th><th className="text-left pl-2">Koordinat</th></tr></thead>
                  <tbody>
                    {filteredTps.map(t=>(
                      <tr key={t.id} className="border-t border-[#F1F5F9] dark:border-[#0F172A] hover:bg-[#F8FAFC] dark:hover:bg-[#0F172A]">
                        <td className="p-2.5 px-3 font-mono font-bold">{t.noTps}</td><td className="font-medium text-[#0F172A] dark:text-white">{t.kelurahan}</td><td className="text-[#64748B]">{t.kecamatan}</td>
                        <td className="text-right tabular-nums px-2">{t.dpt}</td><td className="text-right tabular-nums px-2">{t.suaraSah}</td><td className="text-right tabular-nums font-bold text-[#2563EB] px-2">{t.suaraSitiRoika}</td><td className="text-right tabular-nums px-2">{t.suaraPKS}</td>
                        <td className="pl-2 font-mono text-[#94A3AF] text-[11px]">{t.lat.toFixed(4)}, {t.lng.toFixed(4)}</td>
                      </tr>
                    ))}
                    {filteredTps.length===0 && <tr><td colSpan={8} className="py-10 text-center text-[#94A3AF]">Belum ada data TPS.</td></tr>}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {tab==="laporan" && (
            <section className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="text-[18px] font-extrabold text-[#0F172A] dark:text-white leading-none">Laporan & Analitik</h1>
                  <p className="text-[12px] text-[#64748B] mt-1">Rekap per kecamatan & per kelurahan Dapil 1 (34 kelurahan) — bisa diexport PDF/CSV. Filter ikut kecamatan/kelurahan di bawah.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button onClick={exportLaporanPdf} disabled={exportingPdf} className="bg-[#0F172A] dark:bg-white dark:text-[#0F172A] text-white rounded-full px-4 py-2 text-[13px] font-bold shadow disabled:opacity-60 flex items-center gap-1.5">{exportingPdf ? "Membuat PDF..." : "⬇ Export PDF"}</button>
                  <button onClick={exportRekapCsv} className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-full px-4 py-2 text-[13px] font-bold text-[#334155] dark:text-[#CBD5E1]">Export CSV</button>
                </div>
              </div>

              <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-[#E2E8F0] dark:border-[#334155] p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex flex-wrap gap-2 items-end">
                <label className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-[#64748B]">Kecamatan</span>
                  <select value={laporanKec} onChange={e=>handleLaporanKecChange(e.target.value)} className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-full px-3 py-2 text-[13px] min-w-[170px]">{KECAMATAN.map(k=> <option key={k} value={k}>{k}</option>)}</select>
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-[#64748B]">Kelurahan</span>
                  <select value={laporanKel} onChange={e=> setLaporanKel(e.target.value)} disabled={laporanKec==="Semua kecamatan"} title={laporanKec==="Semua kecamatan" ? "Pilih kecamatan dulu" : "Pilih kelurahan"} className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-full px-3 py-2 text-[13px] min-w-[170px] disabled:opacity-50 disabled:cursor-not-allowed">{laporanKelOptions.map(k=> <option key={k} value={k}>{k}</option>)}</select>
                </label>
                <label className="flex flex-col gap-1 flex-1 min-w-[180px] max-w-[260px]">
                  <span className="text-[11px] font-bold text-[#64748B]">Cari kelurahan</span>
                  <input value={laporanSearch} onChange={e=> setLaporanSearch(e.target.value)} placeholder="Cari Kemijen, Pekunden..." className="border border-[#E2E8F0] dark:border-[#334155] rounded-full px-4 py-2 text-[13px] bg-[#F8FAFC] dark:bg-[#0F172A] dark:text-white outline-none w-full" />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-[#64748B]">Urut kelurahan</span>
                  <select value={laporanSort} onChange={e=> setLaporanSort(e.target.value as any)} className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-full px-3 py-2 text-[13px]">
                    <option value="kelurahan">A-Z kelurahan</option>
                    <option value="relawan">Relawan terbanyak</option>
                    <option value="tps">TPS terbanyak</option>
                    <option value="dpt">DPT terbesar</option>
                  </select>
                </label>
                <span className="text-[11px] text-[#94A3AF] py-2">{rekapKel.length} kelurahan tampil · {rekapKec.length} kecamatan</span>
              </div>

              {(()=>{ const sum = rekapKec.reduce((a,c)=>({ tps:a.tps+c.tpsCount, dpt:a.dpt+c.dpt, sah:a.sah+c.suaraSah, sr:a.sr+c.suaraSR, pks:a.pks+c.suaraPKS, rel:a.rel+c.relawan, koor:a.koor+c.koordinator }), {tps:0,dpt:0,sah:0,sr:0,pks:0,rel:0,koor:0}); return (
                <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-2">
                  {[
                    {label:"TPS", v: sum.tps, sub: `${rekapKel.length} kelurahan`},
                    {label:"DPT", v: formatNumber(sum.dpt), sub: "pemilih"},
                    {label:"Suara Sah", v: formatNumber(sum.sah), sub: `${sum.sah? Math.round(sum.sah/sum.dpt*100):0}% dari DPT`},
                    {label:"SR", v: formatNumber(sum.sr), sub: "Siti Roika"},
                    {label:"PKS", v: formatNumber(sum.pks), sub: "suara partai"},
                    {label:"Relawan", v: formatNumber(sum.rel), sub: `${formatPct(sum.rel/targetRelawan*100)}% target`},
                    {label:"Koordinator", v: formatNumber(sum.koor), sub: `${formatPct(sum.koor/targetKoor*100)}% target`},
                  ].map(card=>(
                    <div key={card.label} className="bg-white dark:bg-[#1E293B] rounded-xl border border-[#E2E8F0] dark:border-[#334155] p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                      <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wide">{card.label}</div>
                      <div className="text-[16px] font-extrabold text-[#0F172A] dark:text-white leading-none mt-1">{card.v}</div>
                      <div className="text-[10px] text-[#94A3AF] mt-1 truncate">{card.sub}</div>
                    </div>
                  ))}
                </div>
              )})()}

              <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-[#E2E8F0] dark:border-[#334155] overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                <div className="px-4 py-3 border-b border-[#E2E8F0] dark:border-[#334155] flex flex-wrap items-center justify-between gap-2">
                  <div className="font-bold text-[#0F172A] dark:text-white text-[13px]">Rekap per Kecamatan</div>
                  <span className="text-[11px] text-[#64748B]">{rekapKec.length} kecamatan · total {formatNumber(rekapKec.reduce((a,c)=>a+c.tpsCount,0))} TPS</span>
                </div>
                <div className="overflow-auto">
                  <table className="w-full text-[12px]">
                    <thead className="bg-[#F8FAFC] dark:bg-[#0F172A] text-[#64748B]"><tr>
                      <th className="text-left py-2.5 px-3">Kecamatan</th>
                      <th className="text-right px-2">Kelurahan</th>
                      <th className="text-right px-2">TPS</th>
                      <th className="text-right px-2">DPT</th>
                      <th className="text-right px-2">Sah</th>
                      <th className="text-right px-2">SR</th>
                      <th className="text-right px-2">PKS</th>
                      <th className="text-right px-2">Relawan</th>
                      <th className="text-right px-3">Koordinator</th>
                    </tr></thead>
                    <tbody>
                      {rekapKec.map(r=>(
                        <tr key={r.kecamatan} className="border-t border-[#F1F5F9] dark:border-[#0F172A] hover:bg-[#F8FAFC] dark:hover:bg-[#0F172A]">
                          <td className="py-2.5 px-3 font-bold text-[#0F172A] dark:text-white whitespace-nowrap">{r.kecamatan}</td>
                          <td className="text-right tabular-nums px-2">{r.kelCount}</td>
                          <td className="text-right tabular-nums px-2 font-semibold">{r.tpsCount}</td>
                          <td className="text-right tabular-nums px-2">{formatNumber(r.dpt)}</td>
                          <td className="text-right tabular-nums px-2">{formatNumber(r.suaraSah)}</td>
                          <td className="text-right tabular-nums px-2 font-bold text-[#2563EB]">{formatNumber(r.suaraSR)}</td>
                          <td className="text-right tabular-nums px-2">{formatNumber(r.suaraPKS)}</td>
                          <td className="text-right tabular-nums px-2 font-bold">{formatNumber(r.relawan)}</td>
                          <td className="text-right tabular-nums px-3">{formatNumber(r.koordinator)}</td>
                        </tr>
                      ))}
                      {rekapKec.length===0 && <tr><td colSpan={9} className="py-10 text-center text-[#94A3AF]">Tidak ada data untuk filter ini.</td></tr>}
                    </tbody>
                    {rekapKec.length>0 && (
                      <tfoot className="bg-[#F8FAFC] dark:bg-[#0F172A] border-t-2 border-[#E2E8F0] dark:border-[#334155] font-bold text-[#0F172A] dark:text-white">
                        <tr>
                          <td className="py-2.5 px-3 text-right" colSpan={2}>TOTAL</td>
                          <td className="text-right px-2 tabular-nums">{formatNumber(rekapKec.reduce((a,c)=>a+c.tpsCount,0))}</td>
                          <td className="text-right px-2 tabular-nums">{formatNumber(rekapKec.reduce((a,c)=>a+c.dpt,0))}</td>
                          <td className="text-right px-2 tabular-nums">{formatNumber(rekapKec.reduce((a,c)=>a+c.suaraSah,0))}</td>
                          <td className="text-right px-2 tabular-nums text-[#2563EB]">{formatNumber(rekapKec.reduce((a,c)=>a+c.suaraSR,0))}</td>
                          <td className="text-right px-2 tabular-nums">{formatNumber(rekapKec.reduce((a,c)=>a+c.suaraPKS,0))}</td>
                          <td className="text-right px-2 tabular-nums">{formatNumber(rekapKec.reduce((a,c)=>a+c.relawan,0))}</td>
                          <td className="text-right px-3 tabular-nums">{formatNumber(rekapKec.reduce((a,c)=>a+c.koordinator,0))}</td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>

              <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-[#E2E8F0] dark:border-[#334155] overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                <div className="px-4 py-3 border-b border-[#E2E8F0] dark:border-[#334155] flex flex-wrap items-center justify-between gap-2">
                  <div className="font-bold text-[#0F172A] dark:text-white text-[13px]">Rekap per Kelurahan — {rekapKel.length} baris</div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[#64748B] hidden sm:inline">{laporanSearch ? `cari "${laporanSearch}" · ` : ""}urut {laporanSort}</span>
                    <button onClick={exportLaporanPdf} disabled={exportingPdf} className="text-[11px] font-bold text-[#2563EB] border border-[#DBEAFE] dark:border-[#334155] bg-[#EFF6FF] dark:bg-[#0F172A] rounded-full px-3 py-1 disabled:opacity-60">Export PDF (kelurahan)</button>
                  </div>
                </div>
                <div className="overflow-auto max-h-[520px]">
                  <table className="w-full text-[12px]">
                    <thead className="sticky top-0 bg-[#F8FAFC] dark:bg-[#0F172A] text-[#64748B]"><tr>
                      <th className="text-right py-2.5 px-2 w-8">#</th>
                      <th className="text-left px-2">Kecamatan</th>
                      <th className="text-left px-2">Kelurahan</th>
                      <th className="text-right px-2">TPS</th>
                      <th className="text-right px-2">DPT</th>
                      <th className="text-right px-2">Sah</th>
                      <th className="text-right px-2">SR</th>
                      <th className="text-right px-2">PKS</th>
                      <th className="text-right px-3">Relawan</th>
                    </tr></thead>
                    <tbody>
                      {rekapKel.map((r,i)=>(
                        <tr key={`${r.kecamatan}|${r.kelurahan}`} className="border-t border-[#F1F5F9] dark:border-[#0F172A] hover:bg-[#F8FAFC] dark:hover:bg-[#0F172A]">
                          <td className="text-right tabular-nums px-2 text-[#94A3AF]">{i+1}</td>
                          <td className="px-2 text-[#64748B] whitespace-nowrap">{r.kecamatan}</td>
                          <td className="px-2 font-bold text-[#0F172A] dark:text-white whitespace-nowrap">{r.kelurahan}</td>
                          <td className="text-right tabular-nums px-2">{r.tpsCount}</td>
                          <td className="text-right tabular-nums px-2">{formatNumber(r.dpt)}</td>
                          <td className="text-right tabular-nums px-2">{formatNumber(r.suaraSah)}</td>
                          <td className="text-right tabular-nums px-2 font-bold text-[#2563EB]">{formatNumber(r.suaraSR)}</td>
                          <td className="text-right tabular-nums px-2">{formatNumber(r.suaraPKS)}</td>
                          <td className="text-right tabular-nums px-3 font-bold">{r.relawan}</td>
                        </tr>
                      ))}
                      {rekapKel.length===0 && <tr><td colSpan={9} className="py-10 text-center text-[#94A3AF]">Tidak ada kelurahan cocok.</td></tr>}
                    </tbody>
                  </table>
                </div>
                <div className="px-3 py-2 bg-[#F8FAFC] dark:bg-[#0F172A] border-t border-[#E2E8F0] dark:border-[#334155] text-[11px] text-[#64748B] flex flex-wrap gap-2">
                  <span>Detail per kelurahan — scroll untuk lihat ↓</span>
                  <span className="ml-auto">Sumber: Dapil 1 · 34 kelurahan resmi — data ikut filter di atas & export PDF/CSV</span>
                </div>
              </div>
            </section>
          )}

          {/* bottom info row kelurahan - compact */}
          {tab==="peta" && (
            <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-[#E2E8F0] dark:border-[#334155] p-3 flex flex-wrap items-center gap-2 text-[11px] text-[#64748B]">
              <span className="font-bold text-[#0F172A] dark:text-white">34 kelurahan Dapil 1:</span>
              <span className="bg-[#EFF6FF] dark:bg-[#0F172A] border border-[#DBEAFE] dark:border-[#334155] rounded-full px-2.5 py-1 text-[#2563EB] font-semibold">Tengah 15</span>
              <span className="bg-[#F0F9FF] dark:bg-[#0F172A] border border-[#BAE6FD] dark:border-[#334155] rounded-full px-2.5 py-1 text-[#0284C7] font-semibold">Timur 10</span>
              <span className="bg-[#ECFDF5] dark:bg-[#0F172A] border border-[#A7F3D0] dark:border-[#334155] rounded-full px-2.5 py-1 text-[#059669] font-semibold">Utara 9</span>
              <span className="ml-auto text-[#94A3AF]">Siti Roika, S.Pd. — PKS Dapil 1 · 3.214 suara · Prototype V1</span>
            </div>
          )}
        </main>
      </div>

      {/* Modal Atur Target */}
      {showTargetModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={()=>setShowTargetModal(false)}>
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-5 w-full max-w-md space-y-4 shadow-xl border border-[#E2E8F0] dark:border-[#334155]" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div className="font-bold text-[#0F172A] dark:text-white text-[15px]">Atur Target</div>
              <button onClick={()=>setShowTargetModal(false)} className="w-7 h-7 rounded-full bg-[#F1F5F9] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] grid place-items-center text-[#64748B] text-[12px]">✕</button>
            </div>
            <p className="text-[11px] text-[#64748B] -mt-2">Ubah angka target untuk demo presentasi. Persentase = <code className="bg-[#F1F5F9] dark:bg-[#0F172A] px-1 py-0.5 rounded border border-[#E2E8F0] dark:border-[#334155]">tercapai / target × 100%</code>. Tersimpan otomatis di browser.</p>
            <div className="space-y-3">
              <label className="block">
                <span className="text-[12px] font-bold text-[#334155] dark:text-[#CBD5E1]">Target Relawan</span>
                <input type="number" min={1} value={draftTargetRelawan} onChange={e=>setDraftTargetRelawan(e.target.value)} placeholder="mis. 10000" className="mt-1 w-full border border-[#E2E8F0] dark:border-[#334155] rounded-xl px-3 py-2.5 text-[13px] bg-white dark:bg-[#0F172A] dark:text-white outline-none focus:border-[#93C5FD]" />
                <span className="text-[11px] text-[#94A3AF]">contoh presentasi: 10.000</span>
              </label>
              <label className="block">
                <span className="text-[12px] font-bold text-[#334155] dark:text-[#CBD5E1]">Target Koordinator Relawan</span>
                <input type="number" min={1} value={draftTargetKoor} onChange={e=>setDraftTargetKoor(e.target.value)} placeholder="mis. 250 atau 8000" className="mt-1 w-full border border-[#E2E8F0] dark:border-[#334155] rounded-xl px-3 py-2.5 text-[13px] bg-white dark:bg-[#0F172A] dark:text-white outline-none focus:border-[#93C5FD]" />
                <span className="text-[11px] text-[#94A3AF]">contoh presentasi: 250 (atau 8.000 jika pakai skala besar)</span>
              </label>
            </div>
            {(()=>{ const r = Math.floor(Number(draftTargetRelawan)||0); const k = Math.floor(Number(draftTargetKoor)||0); const pr = r>0 ? calcProgress(stats.r, r) : null; const pk = k>0 ? calcProgress(stats.k, k) : null; if(!pr || !pk) return <div className="text-[11px] text-amber-600 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl px-3 py-2">Isi kedua target dengan angka &gt; 0 untuk preview.</div>; return (
              <div className="rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#0F172A] p-3 space-y-2">
                <div className="text-[11px] font-bold text-[#334155] dark:text-[#CBD5E1]">Preview persentase</div>
                <div className="flex items-center justify-between text-[11px]"><span className="text-[#64748B]">Relawan {formatNumber(stats.r)} / {formatNumber(r)}</span><span className="font-extrabold px-2 py-0.5 rounded-full border" style={{ background: pr.color+"14", color: pr.color, borderColor: pr.color+"30" }}>{formatPct(pr.pct)}% · {pr.label}</span></div>
                <div className="h-1.5 rounded-full bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] overflow-hidden"><div className="h-full rounded-full" style={{ width: `${pr.pctClamped}%`, background: pr.color }} /></div>
                <div className="flex items-center justify-between text-[11px]"><span className="text-[#64748B]">Koordinator {formatNumber(stats.k)} / {formatNumber(k)}</span><span className="font-extrabold px-2 py-0.5 rounded-full border" style={{ background: pk.color+"14", color: pk.color, borderColor: pk.color+"30" }}>{formatPct(pk.pct)}% · {pk.label}</span></div>
                <div className="h-1.5 rounded-full bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] overflow-hidden"><div className="h-full rounded-full" style={{ width: `${pk.pctClamped}%`, background: pk.color }} /></div>
              </div>
            )})()}
            <div className="flex justify-end gap-2">
              <button onClick={()=>{ setDraftTargetRelawan(String(TARGET_RELAWAN_DEFAULT)); setDraftTargetKoor(String(TARGET_KOOR_DEFAULT)); }} className="px-4 py-2 text-[13px] font-medium text-[#64748B]">Reset default</button>
              <button onClick={()=>setShowTargetModal(false)} className="px-4 py-2 text-[13px] font-bold text-[#334155] dark:text-[#CBD5E1] bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-full">Batal</button>
              <button onClick={()=>{
                const r = Math.floor(Number(draftTargetRelawan));
                const k = Math.floor(Number(draftTargetKoor));
                if(!(r>0) || !(k>0)) return alert("Target harus angka > 0");
                persistTarget(r, k); setTargetRelawan(r); setTargetKoor(k); setShowTargetModal(false);
              }} className="bg-[#2563EB] text-white rounded-full px-5 py-2 text-[13px] font-bold shadow">Simpan</button>
            </div>
          </div>
        </div>
      )}

      <ChatBot ctx={{ stats, targetRelawan, targetKoor, progRelawan, progKoor, rekapKec, rekapKel, segCounts, topKoors: topKoors.map(k=>({ nama:k.nama, kecamatan:k.kecamatan, cnt:k.cnt })), blanks: blanks.map(b=>({ tps:{ kelurahan:b.tps.kelurahan, kecamatan:b.tps.kecamatan, dpt:b.tps.dpt, noTps:b.tps.noTps }, jarakTerdekat:b.jarakTerdekat, blank:b.blank })) }} />

      {/* mobile bottom nav */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white dark:bg-[#0F172A] border-t border-[#E2E8F0] dark:border-[#334155] flex items-center justify-around py-2 px-2 z-40">
        {[
          {k:"peta", label:"Dashboard"},
          {k:"relawan", label:"Relawan"},
          {k:"koordinator", label:"Koordinator"},
          {k:"data-tps", label:"TPS"},
        ].map(it=>(
          <button key={it.k} onClick={()=> setTab(it.k as any)} className={`px-3 py-1.5 rounded-full text-[12px] font-bold border ${tab===it.k?"bg-[#0F172A] dark:bg-white dark:text-[#0F172A] text-white border-[#0F172A]":"bg-white dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#334155] text-[#64748B]"}`}>{it.label}</button>
        ))}
      </div>
    </div>
  );
}
