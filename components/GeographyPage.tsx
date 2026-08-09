'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useFounderData } from '@/hooks/useFounderData';
import { pct } from '@/lib/analytics';

type Point = { name:string; country:string; value:number; lat:number; lng:number };
type LocationView = 'profile' | 'play' | 'usage';

const CITY_COORDS: Record<string,[number,number]> = {
  'jakarta':[-6.2088,106.8456], 'jakarta selatan':[-6.2615,106.8106], 'jakarta pusat':[-6.1862,106.8341],
  'jakarta barat':[-6.1674,106.7637], 'jakarta timur':[-6.2250,106.9004], 'jakarta utara':[-6.1384,106.8636],
  'bandung':[-6.9175,107.6191], 'surabaya':[-7.2575,112.7521], 'yogyakarta':[-7.7956,110.3695],
  'jogja':[-7.7956,110.3695], 'denpasar':[-8.6500,115.2167], 'bogor':[-6.5971,106.8060],
  'bekasi':[-6.2383,106.9756], 'depok':[-6.4025,106.7942], 'tangerang':[-6.1783,106.6319],
  'semarang':[-6.9667,110.4167], 'malang':[-7.9666,112.6326], 'solo':[-7.5666,110.8167],
  'surakarta':[-7.5666,110.8167], 'medan':[3.5952,98.6722], 'makassar':[-5.1477,119.4327],
  'palembang':[-2.9909,104.7566], 'kuala lumpur':[3.1390,101.6869], 'penang':[5.4141,100.3288],
  'pulau pinang':[5.4141,100.3288], 'johor bahru':[1.4927,103.7414], 'shah alam':[3.0738,101.5183],
  'petaling jaya':[3.1073,101.6067], 'kuching':[1.5533,110.3592], 'ipoh':[4.5975,101.0901], 'melaka':[2.1896,102.2501],
};
const COUNTRY_COORDS: Record<string,[number,number]> = {
  'indonesia':[-2.3,118.0], 'malaysia':[4.2,102.0], 'singapore':[1.3521,103.8198], 'australia':[-25.2744,133.7751],
  'india':[20.5937,78.9629], 'united arab emirates':[23.4241,53.8478], 'uae':[23.4241,53.8478],
  'united states':[37.0902,-95.7129], 'canada':[56.1304,-106.3468], 'united kingdom':[55.3781,-3.4360],
  'japan':[36.2048,138.2529], 'philippines':[12.8797,121.7740], 'thailand':[15.87,100.9925],
};

function validCity(value:string) {
  const text = String(value || '').trim();
  if (!text) return false;
  return !['unknown','no data','n/a','null','undefined','-','—'].includes(text.toLowerCase());
}

function ProfileMap({ points }: { points:Point[] }) {
  const el = useRef<HTMLDivElement>(null);
  useEffect(()=>{
    if(!el.current) return;
    let map:any;
    let mounted=true;
    void import('leaflet').then((mod)=>{
      if(!mounted||!el.current) return;
      const L:any=(mod as any).default||mod;
      map=L.map(el.current,{zoomControl:true,attributionControl:true}).setView([0,108],2);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'&copy; OpenStreetMap'}).addTo(map);
      points.forEach((point)=>{
        const radius=Math.max(6,Math.min(24,6+Math.sqrt(point.value)*2));
        L.circleMarker([point.lat,point.lng],{radius,weight:2,color:'#24533d',fillColor:'#4f9b73',fillOpacity:.72})
          .bindPopup(`<b>${point.name}</b><br>${point.value} user`).addTo(map);
      });
    });
    return()=>{mounted=false;if(map) map.remove();};
  },[points]);
  return <div ref={el} className="map-wrap" />;
}

function buildCityRows(users:any[]) {
  const map = new Map<string,{value:number,country:string}>();
  users.forEach((user)=>{
    const city=String(user.birthCity||'').trim();
    if(!validCity(city)) return;
    const previous=map.get(city)||{value:0,country:user.country||''};
    map.set(city,{value:previous.value+1,country:user.country||previous.country||''});
  });
  return [...map.entries()].map(([name,data])=>({name,...data})).sort((a,b)=>b.value-a.value);
}

function buildPoints(rows:{name:string;country:string;value:number}[]) {
  return rows.map((row)=>{
    const cityCoord=CITY_COORDS[row.name.toLowerCase()];
    const countryCoord=COUNTRY_COORDS[String(row.country||'').toLowerCase()];
    const coord=cityCoord||countryCoord;
    return coord?{name:row.name,country:row.country,value:row.value,lat:coord[0],lng:coord[1]}:null;
  }).filter(Boolean) as Point[];
}

export function GeographyPage(){
  const { users, loading, error, refresh }=useFounderData();
  const [view,setView]=useState<LocationView>('profile');

  const countryRows=useMemo(()=>{
    const map=new Map<string,number>();
    users.forEach((user)=>map.set(user.country,(map.get(user.country)||0)+1));
    return [...map.entries()].map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value);
  },[users]);

  const birthCityRows=useMemo(()=>buildCityRows(users),[users]);
  const birthPoints=useMemo(()=>buildPoints(birthCityRows),[birthCityRows]);
  const missingBirthCity=users.filter((user)=>!validCity(user.birthCity)).length;
  const unknownCountry=countryRows.find((row)=>row.name==='Unknown')?.value||0;

  return <div className="page">
    <div className="page-heading">
      <div><h1>User Geography</h1><p>Birth/profile geography, Google Play geography, dan usage geography dipisahkan berdasarkan sumber datanya.</p></div>
      <button className="btn" onClick={()=>void refresh()}>Refresh Internal</button>
    </div>
    {error&&<div className="error-box" style={{marginBottom:12}}>{error}</div>}

    <div className="range-tabs" style={{marginBottom:14}}>
      <button className={view==='profile'?'active':''} onClick={()=>setView('profile')}>Profile / Birth</button>
      <button className={view==='play'?'active':''} onClick={()=>setView('play')}>Google Play</button>
      <button className={view==='usage'?'active':''} onClick={()=>setView('usage')}>Usage / GA4</button>
    </div>

    {view==='profile'&&<>
      <div className="kpi-grid">
        <div className="kpi-card"><div className="kpi-label">Included Real Users</div><div className="kpi-value">{loading?'—':users.length}</div><div className="kpi-foot"><span>Deleted/test excluded</span></div></div>
        <div className="kpi-card"><div className="kpi-label">Named Countries</div><div className="kpi-value">{countryRows.filter((row)=>row.name!=='Unknown').length}</div><div className="kpi-foot"><span>Profile-derived</span></div></div>
        <div className="kpi-card"><div className="kpi-label">Named Birth Cities</div><div className="kpi-value">{birthCityRows.length}</div><div className="kpi-foot"><span>valid city labels</span></div></div>
        <div className="kpi-card"><div className="kpi-label">Missing Birth City</div><div className="kpi-value">{missingBirthCity}</div><div className="kpi-foot"><span>not ranked</span></div></div>
        <div className="kpi-card"><div className="kpi-label">Unknown Country</div><div className="kpi-value">{unknownCountry}</div><div className="kpi-foot"><span>{pct(unknownCountry,users.length)}%</span></div></div>
      </div>

      <div className="grid-2">
        <section className="panel"><div className="panel-head"><div><div className="panel-title">Birth City Map</div><span className="panel-subtitle">Birth/profile location only.</span></div><span className="source-badge warn">PROFILE</span></div><ProfileMap points={birthPoints}/></section>
        <section className="panel"><div className="panel-head"><div><div className="panel-title">Country Distribution</div><span className="panel-subtitle">Unknown country dipisahkan sebagai data-quality category.</span></div></div><div className="panel-body"><div className="stat-list">{countryRows.filter((row)=>row.name!=='Unknown').map((row)=><div className="stat-row" key={row.name}><span className="stat-name">{row.name}</span><div className="progress"><span style={{width:`${pct(row.value,users.length)}%`}}/></div><span className="stat-value">{row.value}</span></div>)}</div></div></section>
      </div>

      <section className="panel"><div className="panel-head"><div><div className="panel-title">Top Profile / Birth Cities</div><span className="panel-subtitle">Unknown / No Data tidak masuk tabel ranking.</span></div></div><div className="table-wrap"><table><thead><tr><th>City</th><th>Country</th><th>Users</th><th>% Known Birth City</th></tr></thead><tbody>{birthCityRows.slice(0,30).map((row)=><tr key={row.name}><td><b>{row.name}</b></td><td>{row.country||'—'}</td><td>{row.value}</td><td>{pct(row.value,Math.max(1,users.length-missingBirthCity))}%</td></tr>)}</tbody></table></div></section>
    </>}

    {view==='play'&&<div className="grid-2"><section className="panel"><div className="panel-head"><div><div className="panel-title">Google Play Country / Region</div><span className="panel-subtitle">Google Play reporting source</span></div><span className="source-badge play">PLAY</span></div><div className="panel-body"><div className="notice"><b>Multi-country sudah terkonfirmasi dari Play Console.</b><br/>Setelah reporting/API/export tersambung, tabel dan world map di sini akan terisi otomatis.</div></div></section><section className="panel"><div className="panel-head"><div><div className="panel-title">Interpretation Rule</div></div></div><div className="panel-body"><div className="notice">Google Play geography dan birth/profile geography adalah sumber berbeda dan tidak direkonsiliasi 1:1.</div></div></section></div>}

    {view==='usage'&&<div className="grid-2"><section className="panel"><div className="panel-head"><div><div className="panel-title">Usage Geography</div><span className="panel-subtitle">GA4 Country / Region / City</span></div><span className="source-badge">GA4</span></div><div className="panel-body"><div className="notice">Ini akan menjadi geography aktivitas agregat. Connector GA4 Data API / BigQuery belum dipasang pada repo baru.</div></div></section><section className="panel"><div className="panel-head"><div><div className="panel-title">Target View</div></div></div><div className="panel-body"><div className="notice">World → Country → Region → City berdasarkan usage analytics saat connector tersedia.</div></div></section></div>}
  </div>;
}
