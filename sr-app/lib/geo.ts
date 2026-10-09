import type { TPS, Relawan } from "./mockData";

export function haversine(lat1:number,lng1:number, lat2:number,lng2:number){
  const R=6371000;
  const dLat=(lat2-lat1)*Math.PI/180;
  const dLng=(lng2-lng1)*Math.PI/180;
  const a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return 2*R*Math.asin(Math.sqrt(a));
}

export type BlankResult = {
  tps: TPS;
  jarakTerdekat: number | null;
  blank: boolean;
};

export function blankSpot(tpsList: TPS[], relawans: Relawan[], radiusM:number): BlankResult[] {
  return tpsList.map(t=>{
    let min=Infinity;
    for(const r of relawans){
      if(r.status!=="aktif") continue;
      const d=haversine(t.lat,t.lng,r.lat,r.lng);
      if(d<min) min=d;
    }
    const jarak = min===Infinity? null : Math.round(min);
    return { tps:t, jarakTerdekat: jarak, blank: jarak===null || jarak>radiusM };
  });
}

export function korelasiByKecamatan(tpsList: TPS[], relawans: Relawan[]){
  const map=new Map<string,{kec:string, totalSR:number, totalPKS:number, totalTPS:number, jmlRelawan:number}>();
  for(const t of tpsList){
    const cur=map.get(t.kecamatan) ?? {kec:t.kecamatan, totalSR:0, totalPKS:0, totalTPS:0, jmlRelawan:0};
    cur.totalSR+=t.suaraSitiRoika; cur.totalPKS+=t.suaraPKS; cur.totalTPS+=1;
    map.set(t.kecamatan,cur);
  }
  for(const r of relawans){
    if(r.status!=="aktif") continue;
    const cur=map.get(r.kecamatan);
    if(cur) cur.jmlRelawan+=1; else map.set(r.kecamatan,{kec:r.kecamatan,totalSR:0,totalPKS:0,totalTPS:0,jmlRelawan:1});
  }
  return Array.from(map.values()).map(v=>({
    ...v,
    ratio: v.totalSR===0?0: v.jmlRelawan / v.totalSR,
    status: v.totalSR>0 && v.jmlRelawan<10 ? "kurang relawan" : v.jmlRelawan / Math.max(1,v.totalSR) < 0.015 ? "perlu tambah" : "ideal",
  })).sort((a,b)=> b.totalSR - a.totalSR);
}

export type RekapKecamatan = {
  kecamatan: string;
  kelCount: number;
  tpsCount: number;
  dpt: number;
  suaraSah: number;
  suaraSR: number;
  suaraPKS: number;
  relawan: number;
  koordinator: number;
};
export type RekapKelurahan = {
  kecamatan: string;
  kelurahan: string;
  tpsCount: number;
  dpt: number;
  suaraSah: number;
  suaraSR: number;
  suaraPKS: number;
  relawan: number;
};

export function rekapByKecamatan(tpsList: TPS[], relawans: Relawan[], koors: {kecamatan:string; status:string}[]): RekapKecamatan[] {
  const m = new Map<string, RekapKecamatan>();
  for(const t of tpsList){
    const cur = m.get(t.kecamatan) ?? { kecamatan:t.kecamatan, kelCount:0, tpsCount:0, dpt:0, suaraSah:0, suaraSR:0, suaraPKS:0, relawan:0, koordinator:0 };
    cur.tpsCount+=1; cur.dpt+=t.dpt; cur.suaraSah+=t.suaraSah; cur.suaraSR+=t.suaraSitiRoika; cur.suaraPKS+=t.suaraPKS;
    m.set(t.kecamatan, cur);
  }
  // kelurahan unik per kecamatan
  for(const [kec, v] of m){
    const set = new Set(tpsList.filter(t=>t.kecamatan===kec).map(t=>t.kelurahan));
    v.kelCount = set.size;
  }
  for(const r of relawans){ if(r.status!=="aktif") continue; const c=m.get(r.kecamatan); if(c) c.relawan+=1; }
  for(const k of koors){ if(k.status!=="aktif") continue; const c=m.get(k.kecamatan); if(c) c.koordinator+=1; }
  return Array.from(m.values()).sort((a,b)=> a.kecamatan.localeCompare(b.kecamatan));
}

export function rekapByKelurahan(tpsList: TPS[], relawans: Relawan[]): RekapKelurahan[] {
  const m = new Map<string, RekapKelurahan>();
  for(const t of tpsList){
    const key = `${t.kecamatan}|${t.kelurahan}`;
    const cur = m.get(key) ?? { kecamatan:t.kecamatan, kelurahan:t.kelurahan, tpsCount:0, dpt:0, suaraSah:0, suaraSR:0, suaraPKS:0, relawan:0 };
    cur.tpsCount+=1; cur.dpt+=t.dpt; cur.suaraSah+=t.suaraSah; cur.suaraSR+=t.suaraSitiRoika; cur.suaraPKS+=t.suaraPKS;
    m.set(key, cur);
  }
  for(const r of relawans){ if(r.status!=="aktif") continue; const key=`${r.kecamatan}|${r.kelurahan}`; const c=m.get(key); if(c) c.relawan+=1; else {
    // kelurahan tanpa TPS tapi ada relawan — tetap tampil
    m.set(key, { kecamatan:r.kecamatan, kelurahan:r.kelurahan, tpsCount:0, dpt:0, suaraSah:0, suaraSR:0, suaraPKS:0, relawan:1 });
  }}
  return Array.from(m.values()).sort((a,b)=> a.kecamatan.localeCompare(b.kecamatan) || a.kelurahan.localeCompare(b.kelurahan));
}
