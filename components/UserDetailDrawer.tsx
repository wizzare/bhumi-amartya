'use client';

import { X } from 'lucide-react';
import { NormalizedUser, asTime, formatDateTime } from '@/lib/analytics';
import { useUserBlueprintDetail } from '@/hooks/useUserBlueprintDetail';

type Props = {
  user: NormalizedUser | null;
  onClose: () => void;
};

type SystemSpec = { label: string; keys: string[] };

const SYSTEMS: SystemSpec[] = [
  { label: 'Life Path / Numerology', keys: ['lifePath', 'numerology'] },
  { label: 'Human Design', keys: ['humanDesign'] },
  { label: 'Natal Chart', keys: ['natalChart', 'astrology'] },
  { label: 'Destiny Matrix', keys: ['destinyMatrix', 'destiny_matrix'] },
  { label: 'Weton', keys: ['weton'] },
  { label: 'BaZi', keys: ['bazi', 'baZi'] },
  { label: 'Vedic Astrology', keys: ['vedic', 'vedicAstrology'] },
  { label: 'Tzolkin', keys: ['tzolkin'] },
  { label: 'Whole Sign', keys: ['wholeSign', 'wholeSignChart'] },
  { label: 'Astrocartography', keys: ['astrocartography', 'astroCartography'] },
  { label: 'Zi Wei Dou Shu', keys: ['ziWei', 'ziwei', 'ziWeiDouShu'] },
];

function firstValue(source: Record<string, any> | null, keys: string[]) {
  if (!source) return undefined;
  for (const key of keys) {
    if (source[key] !== undefined && source[key] !== null) return source[key];
  }
  return undefined;
}

function labelKey(key: string) {
  return key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function scalar(value: any): string {
  if (value === null || value === undefined || value === '') return '';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) {
    const simple = value.filter((item) => ['string', 'number', 'boolean'].includes(typeof item)).slice(0, 5);
    return simple.length ? simple.join(', ') : `${value.length} item`;
  }
  if (typeof value === 'object') {
    for (const key of ['name', 'value', 'type', 'sign', 'label', 'title', 'number', 'status']) {
      if (value[key] !== undefined && ['string', 'number', 'boolean'].includes(typeof value[key])) return String(value[key]);
    }
  }
  return '';
}

function systemFacts(value: any) {
  if (value === null || value === undefined) return [] as { key:string; value:string }[];
  if (typeof value !== 'object') return [{ key: 'Value', value: String(value) }];

  const preferred = [
    'lifePath', 'lifePathNumber', 'number', 'type', 'strategy', 'authority', 'profile', 'definition',
    'sunSign', 'moonSign', 'ascendant', 'risingSign', 'midheaven', 'mc',
    'center', 'centerArcana', 'karmicTail', 'money', 'love',
    'weton', 'totalNeptu', 'wuku', 'dayMaster', 'currentLuckCycle',
    'lagna', 'nakshatra', 'currentMahadasha', 'currentAntardasha',
    'kin', 'tone', 'solarSeal', 'wavespell', 'lifePalace', 'bodyPalace', 'bureau', 'status',
  ];

  const seen = new Set<string>();
  const rows: { key:string; value:string }[] = [];
  const add = (key:string, raw:any) => {
    if (seen.has(key)) return;
    const text = scalar(raw);
    if (!text) return;
    seen.add(key);
    rows.push({ key: labelKey(key), value: text });
  };

  preferred.forEach((key) => add(key, value[key]));
  Object.keys(value).forEach((key) => {
    if (rows.length >= 6) return;
    if (['raw', 'meta', 'planets', 'gates', 'channels', 'centers', 'aspects', 'houses', 'lines', 'palaces'].includes(key)) return;
    add(key, value[key]);
  });

  return rows.slice(0, 6);
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

export function UserDetailDrawer({user,onClose}:Props) {
  const blueprint = useUserBlueprintDetail(user?.uid || null);
  if (!user) return null;

  const raw=user.raw||{};
  const birthDate=raw.birthDate||raw.dateOfBirth||raw.dob;
  const birthTime=raw.birthTime||raw.timeOfBirth||raw.birthHour;
  const blueprintStatus=blueprint.data?.status||raw.blueprintStatus||'—';
  const storedSystems=SYSTEMS.filter((system)=>firstValue(blueprint.data,system.keys)!==undefined).length;
  const loginDays=activeLoginDays(user);

  return <div style={{position:'fixed',inset:0,zIndex:1000,background:'rgba(21,32,26,.36)',display:'flex',justifyContent:'flex-end'}} onMouseDown={(event)=>{if(event.target===event.currentTarget)onClose();}}>
    <aside style={{width:'min(760px,96vw)',height:'100vh',background:'#fff',boxShadow:'-12px 0 30px rgba(21,32,26,.16)',overflowY:'auto'}}>
      <div style={{position:'sticky',top:0,zIndex:2,background:'rgba(255,255,255,.97)',borderBottom:'1px solid #e7ece9',padding:'16px 18px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div><div style={{fontSize:16,fontWeight:800,color:'#263a30'}}>{user.name}</div><div style={{fontSize:9,color:'#7b8981',marginTop:2}}>{user.email || 'Tanpa email'} · UID {user.uid}</div></div>
        <button className="btn" onClick={onClose} aria-label="Tutup detail"><X size={15}/></button>
      </div>

      <div style={{padding:18,display:'grid',gap:14}}>
        <div className="notice"><b>Read cost detail:</b> profil = 0 read tambahan karena memakai dokumen user yang sudah dimuat. Blueprint = {blueprint.fromCache?'0 read (session cache)':blueprint.loading?'maks. 1 read sedang dimuat':'maks. 1 read pada pembukaan pertama'}. Klik ulang UID yang sama tidak membaca blueprint lagi selama sesi.</div>

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
          <div className="panel-head"><div><div className="panel-title">Blueprint User</div><span className="panel-subtitle">`blueprints/{user.uid}` · lazy load per user.</span></div><span className="source-badge">{blueprint.fromCache?'CACHE':'LAZY'}</span></div>
          <div className="panel-body">
            {blueprint.loading&&<div className="empty">Memuat blueprint user…</div>}
            {blueprint.error&&<div className="error-box">{blueprint.error}</div>}
            {!blueprint.loading&&!blueprint.error&&!blueprint.data&&<div className="empty">Blueprint belum tersimpan untuk user ini.</div>}
            {blueprint.data&&<>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(145px,1fr))',gap:8,marginBottom:12}}><Field label="Blueprint Status" value={String(blueprintStatus)}/><Field label="Sistem Tersimpan" value={`${storedSystems} / ${SYSTEMS.length}`}/><Field label="Detail Cache" value={blueprint.fromCache?'Session cache':'Loaded once'}/></div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:10}}>
                {SYSTEMS.map((system)=>{
                  const value=firstValue(blueprint.data,system.keys);
                  const facts=systemFacts(value);
                  return <div key={system.label} style={{border:'1px solid #e6ece8',borderRadius:9,padding:11,background:value!==undefined?'#fff':'#fafbfa'}}>
                    <div style={{display:'flex',justifyContent:'space-between',gap:8,marginBottom:7}}><b style={{fontSize:10}}>{system.label}</b><span className={`pill ${value!==undefined?'green':'gray'}`}>{value!==undefined?'Ada':'Belum ada'}</span></div>
                    {value!==undefined&&facts.length>0?<div style={{display:'grid',gap:5}}>{facts.map((fact)=><div key={fact.key} style={{display:'flex',justifyContent:'space-between',gap:10,fontSize:9,borderTop:'1px solid #f0f3f1',paddingTop:5}}><span style={{color:'#7b8981'}}>{fact.key}</span><b style={{textAlign:'right',maxWidth:'58%',wordBreak:'break-word'}}>{fact.value}</b></div>)}</div>:value!==undefined?<div style={{fontSize:9,color:'#7b8981'}}>Data tersimpan; struktur detail tidak diringkas di dashboard.</div>:<div style={{fontSize:9,color:'#9aa49e'}}>Tidak ditemukan pada dokumen blueprint.</div>}
                  </div>;
                })}
              </div>
            </>}
          </div>
        </section>
      </div>
    </aside>
  </div>;
}
