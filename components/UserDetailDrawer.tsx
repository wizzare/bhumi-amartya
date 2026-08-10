'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { NormalizedUser, asTime, formatDateTime } from '@/lib/analytics';
import { useUserBlueprintDetail } from '@/hooks/useUserBlueprintDetail';
import { sendFounderMessage } from '@/lib/communicationsWrite';

type Props = {
  user: NormalizedUser | null;
  onClose: () => void;
};

function at(source:any,path:string){
  return path.split('.').reduce((value,key)=>value!==null&&value!==undefined?value[key]:undefined,source);
}

function first(source:any,paths:string[]){
  for(const path of paths){
    const value=at(source,path);
    if(value!==undefined&&value!==null&&value!=='') return value;
  }
  return undefined;
}

function text(value:any):string{
  if(value===undefined||value===null||value==='') return '—';
  if(typeof value==='string'||typeof value==='number'||typeof value==='boolean') return String(value);
  if(Array.isArray(value)) return value.map((item)=>text(item)).filter((item)=>item!=='—').join(' · ')||'—';
  if(typeof value==='object'){
    for(const key of ['name','label','title','value','number','sign','type']){
      if(value[key]!==undefined&&value[key]!==null&&value[key]!=='') return String(value[key]);
    }
  }
  return '—';
}

function lifePathValue(data:any){
  return text(first(data,[
    'lifePath','lifePathNumber','numerology.lifePath','numerology.lifePathNumber','numerology.number','numerology.value'
  ]));
}

function destinyValues(data:any){
  const dm=first(data,['destinyMatrix','destiny_matrix'])||data;
  const center=text(first(dm,[
    'centerArcana','arcanaCenter','center','center.number','center.value','matrixCenter','coreArcana'
  ]));
  const karmic=text(first(dm,[
    'karmicTile','karmicTail','karmic_tile','karmic_tail','karmaTile','karmaTail'
  ]));
  return {center,karmic};
}

function humanDesignValues(data:any){
  const hd=first(data,['humanDesign','human_design'])||data;
  const type=text(first(hd,['type','energyType','designType']));
  const profile=text(first(hd,['profile','profileLine','profileLines']));
  const cross=text(first(hd,[
    'incarnationCross.name','incarnationCross','incarnation_cross.name','incarnation_cross','cross.name','cross','incarnation'
  ]));
  return {type,profile,cross};
}

function natalValues(data:any){
  const natal=first(data,['natalChart','astrology','natal_chart'])||data;
  const sun=text(first(natal,['sunSign','sun.sign','planets.sun.sign','sun','placements.sun.sign']));
  const moon=text(first(natal,['moonSign','moon.sign','planets.moon.sign','moon','placements.moon.sign']));
  const asc=text(first(natal,['ascendant','risingSign','asc','angles.ascendant.sign','angles.ascendant','rising.sign']));
  return {sun,moon,asc};
}

function profileDate(value:any) {
  if (!value) return '—';
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year,month,day]=value.split('-');
    return `${day}-${month}-${year}`;
  }
  const ms=asTime(value);
  return ms?new Intl.DateTimeFormat('id-ID',{timeZone:'Asia/Jakarta',day:'2-digit',month:'long',year:'numeric'}).format(new Date(ms)):String(value);
}

function activeLoginDays(user: NormalizedUser): number | null {
  const raw=user.raw||{};
  const value=raw.participationMetrics?.activeDays ?? raw.activeDays;
  if(Array.isArray(value)) return new Set(value.map((item)=>String(item||'').trim()).filter(Boolean)).size;
  if(typeof value==='number'&&Number.isFinite(value)) return Math.max(0,Math.floor(value));
  return null;
}

function accessLabel(user: NormalizedUser) {
  const raw=user.raw||{};
  const badge=`${raw.testerBadge||''} ${raw.badge||''} ${raw.guardianBadge||''} ${raw.guardianRole||''}`.toLowerCase();
  if(user.plan==='Founder') return 'Founder / Lifetime';
  if(user.plan==='Google Play Paid') return 'Premium / Aktif';
  if(user.plan==='Trial') return 'Trial / Aktif';
  if(user.plan==='Penjaga Inti') return 'Penjaga Inti / Aktif';
  if(user.plan==='Penjaga Alfa') return 'Penjaga Alfa / Aktif';
  if(user.plan==='Expired Grant') {
    if(badge.includes('alfa')) return 'Free / Penjaga Alfa selesai';
    if(badge.includes('inti')||badge.includes('core_guardian')) return 'Free / Penjaga Inti selesai';
    return 'Free / Grant selesai';
  }
  if(user.plan==='Expired Paid') return 'Free / Premium selesai';
  if(user.plan==='Pending Verification') return 'Pending / Verifikasi billing';
  if(user.plan==='Data Incomplete') return 'Perlu cek / Data entitlement';
  return 'Free / Trial selesai';
}

function Field({label,value}:{label:string;value:any}) {
  return <div style={{padding:'9px 10px',border:'1px solid #e7ece9',borderRadius:8,background:'#fbfcfb'}}><div style={{fontSize:8,color:'#87948c',textTransform:'uppercase',letterSpacing:'.04em',marginBottom:3}}>{label}</div><div style={{fontSize:10,fontWeight:650,color:'#32453b',wordBreak:'break-word'}}>{value ?? '—'}</div></div>;
}

function BlueprintCard({title,children}:{title:string;children:React.ReactNode}){
  return <div style={{border:'1px solid #e6ece8',borderRadius:10,padding:12,background:'#fff'}}>
    <div style={{fontSize:10,fontWeight:800,color:'#30453a',marginBottom:9}}>{title}</div>
    <div style={{display:'grid',gap:6}}>{children}</div>
  </div>;
}

function BlueprintLine({label,value}:{label:string;value:string}){
  return <div style={{display:'grid',gridTemplateColumns:'92px 1fr',gap:10,borderTop:'1px solid #f0f3f1',paddingTop:6,fontSize:9}}>
    <span style={{color:'#7b8981'}}>{label}</span><b style={{color:'#32453b',wordBreak:'break-word'}}>{value}</b>
  </div>;
}

export function UserDetailDrawer({user,onClose}:Props) {
  const blueprint = useUserBlueprintDetail(user?.uid || null);
  const [messageOpen,setMessageOpen]=useState(false);
  const [messageTitle,setMessageTitle]=useState('');
  const [messageContent,setMessageContent]=useState('');
  const [messageState,setMessageState]=useState('');
  const [sendingMessage,setSendingMessage]=useState(false);
  if (!user) return null;

  const raw=user.raw||{};
  const birthDate=raw.birthDate||raw.dateOfBirth||raw.dob;
  const birthTime=raw.birthTime||raw.timeOfBirth||raw.birthHour;
  const loginDays=activeLoginDays(user);
  const destiny=destinyValues(blueprint.data);
  const hd=humanDesignValues(blueprint.data);
  const natal=natalValues(blueprint.data);
  const lifePath=lifePathValue(blueprint.data);

  const sendPersonal=async()=>{
    if(!messageTitle.trim()||!messageContent.trim()||sendingMessage) return;
    const label=user.email||user.name||user.uid;
    if(!window.confirm(`Kirim pesan personal ke ${label}?`)) return;
    setSendingMessage(true);
    setMessageState('');
    try{
      await sendFounderMessage({targetUid:user.uid,title:messageTitle,content:messageContent});
      setMessageTitle('');
      setMessageContent('');
      setMessageState('Pesan personal terkirim ke Inbox user. Tidak ada refetch Firestore otomatis.');
    }catch(error:any){
      setMessageState(error?.message||'Gagal mengirim pesan personal.');
    }finally{
      setSendingMessage(false);
    }
  };

  return <div style={{position:'fixed',inset:0,zIndex:1000,background:'rgba(21,32,26,.36)',display:'flex',justifyContent:'flex-end'}} onMouseDown={(event)=>{if(event.target===event.currentTarget)onClose();}}>
    <aside style={{width:'min(760px,96vw)',height:'100vh',background:'#fff',boxShadow:'-12px 0 30px rgba(21,32,26,.16)',overflowY:'auto'}}>
      <div style={{position:'sticky',top:0,zIndex:2,background:'rgba(255,255,255,.97)',borderBottom:'1px solid #e7ece9',padding:'16px 18px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div><div style={{fontSize:16,fontWeight:800,color:'#263a30'}}>{user.name}</div><div style={{fontSize:9,color:'#7b8981',marginTop:2}}>{user.email || 'Tanpa email'} · UID {user.uid}</div></div>
        <button className="btn" onClick={onClose} aria-label="Tutup detail"><X size={15}/></button>
      </div>

      <div style={{padding:18,display:'grid',gap:14}}>
        <div className="notice"><b>Read cost detail:</b> profil = 0 read tambahan. Blueprint = {blueprint.fromCache?'0 read (session cache)':blueprint.loading?'maks. 1 read sedang dimuat':'maks. 1 read pada pembukaan pertama'}. Klik ulang UID yang sama tidak membaca blueprint lagi selama sesi.</div>

        <section className="panel">
          <div className="panel-head"><div><div className="panel-title">Identitas & Data Lahir</div><span className="panel-subtitle">Dari user document yang sudah dimuat bersama tabel.</span></div><span className="source-badge">0 EXTRA READ</span></div>
          <div className="panel-body"><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(145px,1fr))',gap:8}}>
            <Field label="Nama" value={user.name}/><Field label="Email" value={user.email}/><Field label="Tanggal Lahir" value={profileDate(birthDate)}/><Field label="Jam Lahir" value={birthTime}/><Field label="Kota Lahir" value={user.birthCity}/><Field label="Provinsi" value={user.province}/><Field label="Negara" value={user.country}/><Field label="Setup" value={raw.setupCompleted===true?'Selesai':raw.setupCompleted===false?'Belum selesai':'—'}/>
          </div></div>
        </section>

        <section className="panel">
          <div className="panel-head"><div><div className="panel-title">Account & Access</div><span className="panel-subtitle">Status akses saat ini, bukan badge historis.</span></div></div>
          <div className="panel-body"><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(145px,1fr))',gap:8}}>
            <Field label="Akses Saat Ini" value={accessLabel(user)}/><Field label="Subscription" value={user.subscriptionStatus}/><Field label="Access Until" value={user.accessUntil?formatDateTime(user.accessUntil):user.plan==='Founder'?'Selamanya':'—'}/><Field label="Tanggal Daftar" value={formatDateTime(user.registeredAt)}/><Field label="First Login" value={formatDateTime(user.firstLoginAt)}/><Field label="Last Login" value={formatDateTime(user.lastLoginAt)}/><Field label="Hari Login" value={loginDays}/><Field label="Session Count" value={user.sessionCount}/><Field label="App / Build" value={`${user.appVersion} / ${user.buildNumber}`}/><Field label="Activity Status" value={user.status}/>
          </div></div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <div><div className="panel-title">Pesan Personal</div><span className="panel-subtitle">Langsung ke Inbox user ini.</span></div>
            <button className="btn" onClick={()=>{setMessageOpen((value)=>!value);setMessageState('');}}>{messageOpen?'Tutup':'Tulis Pesan'}</button>
          </div>
          {messageOpen&&<div className="panel-body">
            <div className="notice" style={{marginBottom:10}}><b>Penerima:</b> {user.name} · {user.email||user.uid}</div>
            <input className="search" style={{maxWidth:'none',width:'100%',marginBottom:10}} value={messageTitle} onChange={(event)=>setMessageTitle(event.target.value)} placeholder="Judul pesan" maxLength={160}/>
            <textarea value={messageContent} onChange={(event)=>setMessageContent(event.target.value)} placeholder="Isi pesan personal…" maxLength={5000} style={{width:'100%',minHeight:120,border:'1px solid var(--line)',borderRadius:8,padding:11,fontSize:11,resize:'vertical'}}/>
            {messageState&&<div className="notice" style={{marginTop:9}}>{messageState}</div>}
            <div className="toolbar" style={{justifyContent:'flex-end',marginTop:9,marginBottom:0}}><span style={{fontSize:9,color:'#87948c'}}>{messageContent.length}/5000</span><button className="btn primary" disabled={!messageTitle.trim()||!messageContent.trim()||sendingMessage} onClick={()=>void sendPersonal()}>{sendingMessage?'Mengirim…':'Kirim Pesan'}</button></div>
          </div>}
        </section>

        <section className="panel">
          <div className="panel-head"><div><div className="panel-title">Blueprint Ringkas</div><span className="panel-subtitle">4 sistem utama untuk membaca profil user dengan cepat.</span></div><span className="source-badge">{blueprint.fromCache?'CACHE':'LAZY'}</span></div>
          <div className="panel-body">
            {blueprint.loading&&<div className="empty">Memuat blueprint user…</div>}
            {blueprint.error&&<div className="error-box">{blueprint.error}</div>}
            {!blueprint.loading&&!blueprint.error&&!blueprint.data&&<div className="empty">Blueprint belum tersimpan untuk user ini.</div>}
            {blueprint.data&&<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))',gap:10}}>
              <BlueprintCard title="Life Path">
                <BlueprintLine label="Life Path" value={lifePath}/>
              </BlueprintCard>
              <BlueprintCard title="Destiny Matrix">
                <BlueprintLine label="Arcana Center" value={destiny.center}/>
                <BlueprintLine label="Karmic Tile" value={destiny.karmic}/>
              </BlueprintCard>
              <BlueprintCard title="Human Design">
                <BlueprintLine label="Type" value={hd.type}/>
                <BlueprintLine label="Cross" value={hd.cross}/>
                <BlueprintLine label="Profile" value={hd.profile}/>
              </BlueprintCard>
              <BlueprintCard title="Natal Chart">
                <BlueprintLine label="Sun" value={natal.sun}/>
                <BlueprintLine label="Moon" value={natal.moon}/>
                <BlueprintLine label="Ascendant" value={natal.asc}/>
              </BlueprintCard>
            </div>}
          </div>
        </section>
      </div>
    </aside>
  </div>;
}
