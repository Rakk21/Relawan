"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { TPS, Relawan } from "@/lib/mockData";
import { segBySlug } from "@/lib/segmentasi";

import "leaflet/dist/leaflet.css";

function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}

type PropsSuara = { tps: TPS[]; mode: "total"|"sr"|"pks"; kecamatan: string };
type PropsRelawan = { relawans: Relawan[]; tps?: TPS[]; showTPS?: boolean };
type PropsKomparasiB = { tps: TPS[]; relawans: Relawan[]; radius:number };

function colorByMode(t: TPS, mode: "total"|"sr"|"pks"){
  const v = mode==="sr" ? t.suaraSitiRoika : mode==="pks" ? t.suaraPKS : t.suaraSah;
  const ratio = t.dpt ? v / t.dpt : 0;
  if(mode==="sr"){
    if(ratio>0.25) return "#9A3412";
    if(ratio>0.15) return "#F97316";
    if(ratio>0.08) return "#FDBA74";
    return "#FFF7ED";
  }
  if(mode==="pks"){
    if(ratio>0.35) return "#14532D";
    if(ratio>0.25) return "#16A34A";
    if(ratio>0.15) return "#86EFAC";
    return "#F0FDF4";
  }
  if(ratio>0.85) return "#1E293B";
  if(ratio>0.75) return "#475569";
  if(ratio>0.6) return "#94A3B8";
  return "#E2E8F0";
}

function MapFrame({children, height=520}:{children:React.ReactNode; height?:number}){
  return <div style={{height}} className="rounded-2xl overflow-hidden border border-[#E7DDD0] bg-white relative isolate shadow-[0_8px_30px_rgba(28,25,23,0.08)] z-0">{children}</div>
}

const MapContainer = dynamic(()=> import("react-leaflet").then(m=>m.MapContainer), {ssr:false}) as any;
const TileLayer = dynamic(()=> import("react-leaflet").then(m=>m.TileLayer), {ssr:false}) as any;
const CircleMarker = dynamic(()=> import("react-leaflet").then(m=>m.CircleMarker), {ssr:false}) as any;
const Popup = dynamic(()=> import("react-leaflet").then(m=>m.Popup), {ssr:false}) as any;
const Tooltip = dynamic(()=> import("react-leaflet").then(m=>m.Tooltip), {ssr:false}) as any;

export function MapSuara({tps, mode, kecamatan}: PropsSuara){
  const mounted = useMounted();
  const filtered = kecamatan==="Semua kecamatan" ? tps : tps.filter(t=> t.kecamatan===kecamatan);
  const center: [number,number] = filtered[0] ? [filtered[0].lat, filtered[0].lng] : [-6.98, 110.42];
  if(filtered.length===0){
    return <MapFrame><EmptyState /></MapFrame>
  }
  if (!mounted) return <MapFrame><div className="h-full bg-[#FFFBF5] animate-pulse" /></MapFrame>;
  return (
    <MapFrame>
      {/* @ts-ignore */}
      <MapContainer center={center} zoom={13} scrollWheelZoom={false} style={{height:"100%", width:"100%"}} preferCanvas>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OSM · Dapil 1" />
        {filtered.map(t=>(
          <CircleMarker key={t.id} center={[t.lat,t.lng]} radius={11} pathOptions={{color:"#fff", weight:1.2, fillColor: colorByMode(t,mode), fillOpacity:0.92}}>
            <Tooltip sticky>{t.kelurahan} TPS {t.noTps} — {mode==="sr"? t.suaraSitiRoika : mode==="pks"? t.suaraPKS : t.suaraSah} suara ({Math.round(( (mode==="sr"?t.suaraSitiRoika:mode==="pks"?t.suaraPKS:t.suaraSah)/Math.max(1,t.dpt)*100))}%)</Tooltip>
            <Popup>
              <div className="text-base leading-6 min-w-[200px]">
                <div className="font-bold text-[#1C1917] text-base">{t.kecamatan} — {t.kelurahan} TPS {t.noTps}</div>
                <div className="text-stone-700">DPT {t.dpt} · Sah {t.suaraSah} · SR <b className="text-orange-600">{t.suaraSitiRoika}</b> · PKS {t.suaraPKS}</div>
                <div className="text-stone-500 text-sm">{t.alamatTps} · {t.lat.toFixed(4)}, {t.lng.toFixed(4)}</div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
      <Legend mode={mode} />
      <div className="absolute top-3 right-3 glass rounded-full border border-black/10 px-3 py-1.5 text-base font-medium shadow flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-emerald-500" /> {filtered.length} TPS Dapil 1
      </div>
    </MapFrame>
  )
}

export function MapRelawan({relawans, tps, showTPS}: PropsRelawan){
  const mounted = useMounted();
  const center: [number,number] = relawans[0] ? [relawans[0].lat, relawans[0].lng] : [-6.98,110.42];
  if(relawans.length===0) return <MapFrame><EmptyState text="Belum ada data relawan. Tambah di tab Relawan atau import Excel." /></MapFrame>
  if (!mounted) return <MapFrame><div className="h-full bg-[#FFFBF5] animate-pulse" /></MapFrame>;
  return (
    <MapFrame>
      {/* @ts-ignore */}
      <MapContainer center={center} zoom={13} scrollWheelZoom={false} style={{height:"100%", width:"100%"}} preferCanvas>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OSM · Dapil 1" />
        {showTPS && tps?.map(t=>(
          <CircleMarker key={t.id} center={[t.lat,t.lng]} radius={6} pathOptions={{color:"#fff", weight:1, fillColor:"#94A3B8", fillOpacity:0.55}}>
            <Tooltip>TPS {t.noTps} {t.kelurahan}</Tooltip>
          </CircleMarker>
        ))}
        {relawans.filter(r=>r.status==="aktif").map(r=>{
          const seg = segBySlug(r.segmentasi);
          return (
            <CircleMarker key={r.id} center={[r.lat,r.lng]} radius={9} pathOptions={{color:"#fff", weight:2, fillColor: seg.warna, fillOpacity:0.96}}>
              <Popup>
                <div className="text-base leading-6 min-w-[210px]">
                  <div className="font-bold text-[#1C1917] text-base">{r.nama}</div>
                  <div className="inline-flex text-sm px-2.5 py-1 rounded-full border font-semibold" style={{background: seg.warna+"18", color: seg.warna, borderColor: seg.warna+"40"}}>{seg.nama}</div>
                  <div className="text-stone-700 mt-1">Koordinator: {r.koordinatorNama}</div>
                  <div className="text-stone-600">{r.kelurahan}, {r.kecamatan} · {r.rtRw}</div>
                  <div className="text-stone-500 font-mono text-sm">{r.wa.replace(/(\d{4})$/, "****")}</div>
                </div>
              </Popup>
              <Tooltip>{r.nama} · {seg.nama}</Tooltip>
            </CircleMarker>
          )
        })}
      </MapContainer>
      <div className="absolute bottom-3 left-3 glass rounded-2xl border border-black/10 px-3.5 py-3 text-base shadow-lg max-w-[92%]">
        <div className="font-bold text-[#1C1917] mb-2 flex items-center gap-1.5 text-base"><span className="w-1.5 h-1.5 rounded-full bg-[#F97316]" /> Segmentasi · warna konsisten di badge & peta</div>
        <div className="flex flex-wrap gap-1.5">
          {["sr-inti","majelis-taklim","rt-rw","umkm","ojol","advokasi","remaja","lainnya"].map(s=>{
            const seg=segBySlug(s); return <span key={s} className="inline-flex items-center gap-1.5 bg-white border border-stone-200 rounded-full px-2.5 py-1 text-sm font-medium"><span className="w-3 h-3 rounded-full border border-white shadow" style={{background:seg.warna}} />{seg.nama}</span>
          })}
        </div>
      </div>
    </MapFrame>
  )
}

export function MapKomparasiA({tps, relawans, mode, opacity}:{tps:TPS[]; relawans:Relawan[]; mode:"total"|"sr"|"pks"; opacity:number}){
  const mounted = useMounted();
  const center: [number,number] = tps[0] ? [tps[0].lat, tps[0].lng] : [-6.98,110.42];
  if (!mounted) return <MapFrame height={560}><div className="h-full bg-[#FFFBF5] animate-pulse" /></MapFrame>;
  return (
    <MapFrame height={560}>
      {/* @ts-ignore */}
      <MapContainer center={center} zoom={13} scrollWheelZoom={false} style={{height:"100%", width:"100%"}} preferCanvas>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OSM · Dapil 1" />
        {tps.map(t=>(
          <CircleMarker key={t.id} center={[t.lat,t.lng]} radius={13} pathOptions={{color:"#fff", weight:1.2, fillColor: colorByMode(t,mode), fillOpacity: opacity/100 * 0.88}}>
            <Tooltip>{t.kelurahan} TPS {t.noTps} — SR {t.suaraSitiRoika} · PKS {t.suaraPKS}</Tooltip>
          </CircleMarker>
        ))}
        {relawans.filter(r=>r.status==="aktif").map(r=>{
          const seg=segBySlug(r.segmentasi);
          return <CircleMarker key={r.id} center={[r.lat,r.lng]} radius={6.5} pathOptions={{color:"#fff", weight:1.5, fillColor: seg.warna, fillOpacity:0.96}}><Tooltip>{r.nama} · {seg.nama}</Tooltip></CircleMarker>
        })}
      </MapContainer>
      <div className="absolute top-3 left-3 glass rounded-xl border border-black/10 px-3 py-2 text-base font-medium shadow flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#F97316]" /> Heatmap {mode==="sr"?"SR":mode==="pks"?"PKS":"suara sah"} + titik relawan
        <span className="text-stone-500 hidden sm:inline">· geser opacity lihat overlap</span>
      </div>
    </MapFrame>
  )
}

export function MapKomparasiB({tps, relawans, radius}: PropsKomparasiB){
  const mounted = useMounted();
  const center: [number,number] = tps[0] ? [tps[0].lat, tps[0].lng] : [-6.98,110.42];
  if (!mounted) return <MapFrame height={560}><div className="h-full bg-[#FFFBF5] animate-pulse" /></MapFrame>;
  // scroll peta tidak hijack scroll halaman — zoom hanya via tombol +/- atau Ctrl+scroll
  const R=6371000;
  function hav(lat1:number,lng1:number,lat2:number,lng2:number){
    const dLat=(lat2-lat1)*Math.PI/180, dLng=(lng2-lng1)*Math.PI/180;
    const a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
    return 2*R*Math.asin(Math.sqrt(a));
  }
  const blanks = tps.map(t=>{
    let min=Infinity;
    for(const r of relawans){ if(r.status!=="aktif") continue; const d=hav(t.lat,t.lng,r.lat,r.lng); if(d<min) min=d; }
    const jarak = min===Infinity? null : Math.round(min);
    return {t, jarak, blank: jarak===null || jarak>radius};
  });
  return (
    <MapFrame height={560}>
      {/* @ts-ignore */}
      <MapContainer center={center} zoom={13} scrollWheelZoom={false} style={{height:"100%", width:"100%"}} preferCanvas>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OSM · Dapil 1" />
        {blanks.map(({t, blank, jarak})=>(
          <CircleMarker key={t.id} center={[t.lat,t.lng]} radius={10} pathOptions={{color:"#fff", weight:1.6, fillColor: blank? "#EF4444" : "#10B981", fillOpacity:0.92}}>
            <Popup>
              <div className="text-base leading-6 min-w-[220px]">
                <div className="font-bold text-[#1C1917] text-base">TPS {t.noTps} — {t.kelurahan}, {t.kecamatan}</div>
                <div className="text-stone-700">DPT {t.dpt} · Jarak relawan terdekat: <b>{jarak===null? "—" : jarak+" m"}</b></div>
                <div className={`inline-flex mt-1 px-2.5 py-1 rounded-full text-white text-sm font-bold ${blank?"bg-red-500":"bg-emerald-500"}`}>{blank? "BLANK SPOT":"Ada relawan"}</div>
                <div className="text-stone-500 text-sm mt-1">{t.alamatTps}</div>
              </div>
            </Popup>
            <Tooltip>{blank? "🔴":"🟢"} TPS {t.noTps} {t.kelurahan} — {jarak===null?"—":jarak+"m"}</Tooltip>
          </CircleMarker>
        ))}
        {relawans.filter(r=>r.status==="aktif").map(r=>{
          const seg=segBySlug(r.segmentasi);
          return <CircleMarker key={r.id} center={[r.lat,r.lng]} radius={5} pathOptions={{color: seg.warna, weight:1.2, fillColor:"#fff", fillOpacity:1}}><Tooltip>{r.nama} · {seg.nama}</Tooltip></CircleMarker>
        })}
      </MapContainer>
      <div className="absolute bottom-3 left-3 glass rounded-xl border border-black/10 px-3 py-2 text-base shadow flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 font-medium"><span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow"/> Ada ≤{radius}m</span>
        <span className="inline-flex items-center gap-1.5 font-medium"><span className="w-3 h-3 rounded-full bg-red-500 border-2 border-white shadow"/> Blank spot</span>
      </div>
    </MapFrame>
  )
}

function Legend({mode}:{mode:"total"|"sr"|"pks"}){
  const title = mode==="sr"?"Perolehan Siti Roika": mode==="pks"?"Suara PKS":"Suara per TPS";
  const sub = mode==="sr" ? "vs DPT · gradasi orange" : mode==="pks" ? "vs DPT · gradasi hijau" : "vs DPT · gradasi slate";
  return (
    <div className="absolute bottom-3 left-3 glass rounded-2xl border border-black/10 px-3.5 py-3 text-base shadow-lg">
      <div className="font-bold text-[#1C1917]">{title}</div>
      <div className="text-sm text-stone-600">{sub}</div>
      <div className="flex items-center gap-1 mt-2">
        <span className="w-8 h-3 rounded-full border border-black/5" style={{background: mode==="sr"?"#FFF7ED": mode==="pks"?"#F0FDF4":"#E2E8F0"}}/>
        <span className="w-8 h-3 rounded-full border border-black/5" style={{background: mode==="sr"?"#FDBA74": mode==="pks"?"#86EFAC":"#94A3B8"}}/>
        <span className="w-8 h-3 rounded-full border border-black/5" style={{background: mode==="sr"?"#F97316": mode==="pks"?"#16A34A":"#475569"}}/>
        <span className="w-8 h-3 rounded-full border border-black/5" style={{background: mode==="sr"?"#9A3412": mode==="pks"?"#14532D":"#1E293B"}}/>
      </div>
      <div className="flex justify-between text-sm text-stone-600 mt-1"><span>Rendah</span><span>Sangat tinggi</span></div>
    </div>
  )
}

function EmptyState({text="Belum ada data suara. Unggah file Excel/CSV di tab Data TPS."}:{text?:string}){
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-gradient-to-br from-[#FFFBF5] to-[#F9F6F1]">
      <div className="w-14 h-14 rounded-2xl bg-white border border-[#E7DDD0] shadow flex items-center justify-center text-xl">🗺️</div>
      <div className="text-base font-medium text-stone-700 mt-3 max-w-md leading-6">{text}</div>
      <div className="text-base text-stone-500 mt-1">Gunakan template di tab Data TPS / Relawan untuk upload.</div>
    </div>
  )
}
