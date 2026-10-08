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
