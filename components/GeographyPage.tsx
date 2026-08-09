'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useFounderData } from '@/hooks/useFounderData';
import { pct } from '@/lib/analytics';

type Point = { name:string; country:string; value:number; lat:number; lng:number };

const CITY_COORDS: Record<string,[number,number]> = {
  'jakarta':[-6.2088,106.8456], 'bandung':[-6.9175,107.6191], 'surabaya':[-7.2575,112.7521],
  'yogyakarta':[-7.7956,110.3695], 'jogja':[-7.7956,110.3695], 'denpasar':[-8.6500,115.2167],
  'bogor':[-6.5971,106.8060], 'bekasi':[-6.2383,106.9756], 'depok':[-6.4025,106.7942],
  'tangerang':[-6.1783,106.6319], 'semarang':[-6.9667,110.4167], 'malang':[-7.9666,112.6326],
  'medan':[3.5952,98.6722], 'makassar':[-5.1477,119.4327], 'palembang':[-2.9909,104.7566],
  'kuala lumpur':[3.1390,101.6869], 'penang':[5.4141,100.3288], 'pulau pinang':[5.4141,100.3288],
  'johor bahru':[1.4927,103.7414], 'shah alam':[3.0738,101.5183], 'petaling jaya':[3.1073,101.6067],
  'kuching':[1.5533,110.3592], 'ipoh':[4.5975,101.0901], 'melaka':[2.1896,102.2501],
};
const COUNTRY_COORDS: Record<string,[number,number]> = {
  'indonesia':[-2.3,118.0], 'malaysia':[4.2,102.0], 'singapore':[1.3521,103.8198], 'australia':[-25.2744,133.7751],
  'india':[20.5937,78.9629], 'united arab emirates':[23.4241,53.8478], 'uae':[23.4241,53.8478],
  'united states':[37.0902,-95.7129], 'canada':[56.1304,-106.3468], 'united kingdom':[55.3781,-3.4360],
  'japan':[36.2048,138.2529], 'philippines':[12.8797,121.7740], 'thailand':[15.87,100.9925],
};

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
      points.forEach(p=>{
        const radius=Math.max(6,Math.min(24,6+Math.sqrt(p.value)*2));
        L.circleMarker([p.lat,p.lng],{radius,weight:2,color:'#24533d',fillColor:'#4f9b73',fillOpacity:.72})
          .bindPopup(`<b>${p.name}</b><br>${p.country}<br>${p.value} user`).addTo(map);
      });
      if(points.length){const group=L.featureGroup(map._layers?Object.values(map._layers).filter((x:any)=>x?.getLatLng):[]); try{if(group.getBounds().isValid()) map.fitBounds(group.getBounds().pad(.35));}catch{}}
    });
    return()=>{mounted=false;if(map) map.remove();};
  },[points]);
  return <div ref={el} className="map-wrap" />;
}

export function GeographyPage(){
  const { users, loading, error, refresh }=useFounderData();
  const [view,setView]=useState<'profile'|'play'|'usage'>('profile');
  const countryRows=useMemo(()=>{const m=new Map<string,number>();users.forEach(u=>m.set(u.country,(m.get(u.country)||0)+1));return [...m.entries()].map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value);},[users]);
  const cityRows=useMemo(()=>{const m=new Map<string,{value:number,country:string}>();users.forEach(u=>{const key=u.city||'Unknown';const prev=m.get(key)||{value:0,country:u.country};m.set(key,{value:prev.value+1,country:u.country});});return [...m.entries()].map(([name,x])=>({name,...x})).sort((a,b)=>b.value-a.value);},[users]);
  const points=useMemo(()=>cityRows.filter(x=>x.name!=='Unknown').map(x=>{const cityKey=x.name.toLowerCase();const coord=CITY_COORDS[cityKey]||COUNTRY_COORDS[x.country.toLowerCase()];return coord?{name:x.name,country:x.country,value:x.value,lat:coord[0],lng:coord[1]}:null;}).filter(Boolean) as Point[],[cityRows]);
  const unknown=countryRows.find(x=>x.name==='Unknown')?.value||0;

  return <div className="page">
    <div className="page-heading"><div><h1>User Geography</h1><p>Tiga sumber dipisahkan: Google Play country, usage geography, dan profile/birth geography.</p></div><button className="btn" onClick={()=>void refresh()}>Refresh Internal</button></div>
    {error&&<div className="error-box" style={{marginBottom:12}}>{error}</div>}
    <div className="range-tabs" style={{marginBottom:14}}><button className={view==='profile'?'active':''} onClick={()=>setView('profile')}>Profile / Birth</button><button className={view==='play'?'active':''} onClick={()=>setView('play')}>Google Play</button><button className={view==='usage'?'active':''} onClick={()=>setView('usage')}>Usage / GA4</button></div>

    {view==='profile'&&<>
      <div className="kpi-grid">
        <div className="kpi-card"><div className="kpi-label">Included Real Users</div><div className="kpi-value">{loading?'—':users.length}</div><div className="kpi-foot"><span>Deleted/test excluded</span></div></div>
        <div className="kpi-card"><div className="kpi-label">Named Countries</div><div className="kpi-value">{countryRows.filter(x=>x.name!=='Unknown').length}</div><div className="kpi-foot"><span>Profile-derived</span></div></div>
        <div className="kpi-card"><div className="kpi-label">Named Cities</div><div className="kpi-value">{cityRows.filter(x=>x.name!=='Unknown').length}</div><div className="kpi-foot"><span>Profile/birth</span></div></div>
        <div className="kpi-card"><div className="kpi-label">Unknown Country</div><div className="kpi-value">{unknown}</div><div className="kpi-foot"><span>{pct(unknown,users.length)}%</span></div></div>
        <div className="kpi-card"><div className="kpi-label">Map Points</div><div className="kpi-value">{points.length}</div><div className="kpi-foot"><span>Geocoded locally</span></div></div>
      </div>
      <div className="grid-2">
        <section className="panel"><div className="panel-head"><div><div className="panel-title">Global Profile / Birth Map</div><span className="panel-subtitle">Marker size = jumlah user. Ini bukan current GPS location.</span></div><span className="source-badge warn">PROFILE</span></div><ProfileMap points={points}/></section>
        <section className="panel"><div className="panel-head"><div><div className="panel-title">Country Distribution</div><span className="panel-subtitle">Explicit field / conservative profile inference</span></div></div><div className="panel-body"><div className="stat-list">{countryRows.map(x=><div className="stat-row" key={x.name}><span className="stat-name">{x.name}</span><div className="progress"><span style={{width:`${pct(x.value,users.length)}%`}}/></div><span className="stat-value">{x.value}</span></div>)}</div></div></section>
      </div>
      <section className="panel"><div className="panel-head"><div><div className="panel-title">Top Profile / Birth Cities</div><span className="panel-subtitle">Dipisahkan dari Play country dan current usage geography</span></div></div><div className="table-wrap"><table><thead><tr><th>City</th><th>Country</th><th>Users</th><th>% Base</th><th>Meaning</th></tr></thead><tbody>{cityRows.slice(0,30).map(x=><tr key={x.name}><td><b>{x.name}</b></td><td>{x.country}</td><td>{x.value}</td><td>{pct(x.value,users.length)}%</td><td>Profile / birth location</td></tr>)}</tbody></table></div></section>
    </>}

    {view==='play'&&<div className="grid-2"><section className="panel"><div className="panel-head"><div><div className="panel-title">Google Play Country / Region</div><span className="panel-subtitle">Negara/region akun Google user</span></div><span className="source-badge play">PLAY</span></div><div className="panel-body"><div className="notice"><b>Multi-country sudah terkonfirmasi dari Play Console.</b><br/>Halaman ini sengaja belum mengarang jumlah per negara dari screenshot. Setelah Play reporting/API/export tersambung, tabel dan world map di sini akan terisi otomatis.</div></div></section><section className="panel"><div className="panel-head"><div><div className="panel-title">Interpretation Rule</div></div></div><div className="panel-body"><div className="notice">Play Country/Region adalah negara/region akun Google, bukan current GPS. Karena itu jangan direkonsiliasi 1:1 dengan kota lahir internal.</div></div></section></div>}

    {view==='usage'&&<div className="grid-2"><section className="panel"><div className="panel-head"><div><div className="panel-title">Usage Geography</div><span className="panel-subtitle">GA4 Country / Region / City</span></div><span className="source-badge">GA4</span></div><div className="panel-body"><div className="notice">Ini akan menjadi sumber paling dekat untuk melihat geography saat aplikasi digunakan. Koneksi GA4 Data API / BigQuery belum dipasang pada repo baru.</div></div></section><section className="panel"><div className="panel-head"><div><div className="panel-title">Target View</div></div></div><div className="panel-body"><div className="notice">World → Country → Region → City. Filter: 7D, 30D, language, app version, Free/Trial/Premium, acquisition source.</div></div></section></div>}
  </div>;
}
