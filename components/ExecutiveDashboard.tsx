'use client';

import { useMemo } from 'react';
import { Activity, CircleDollarSign, Clock3, LogIn, Smartphone, Store, Users } from 'lucide-react';
import { useFounderData } from '@/hooks/useFounderData';
import { pct, startOfToday } from '@/lib/analytics';
import { playSnapshot } from '@/lib/playSnapshot';

type Insight = { title:string; detail:string; tone:'good'|'warn'|'risk'|'info' };

function Kpi({ label, value, foot, icon: Icon }: { label:string; value:string|number; foot:string; icon:any }) {
  return <div className="kpi-card"><div className="kpi-top"><span className="kpi-label">{label}</span><span className="kpi-icon"><Icon /></span></div><div className="kpi-value">{value}</div><div className="kpi-foot"><span>{foot}</span></div></div>;
}

function dayKeys(n:number){
  const out:string[]=[];
  for(let i=n-1;i>=0;i--){
    const d=new Date();
    d.setDate(d.getDate()-i);
    out.push(new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Jakarta',year:'numeric',month:'2-digit',day:'2-digit'}).format(d));
  }
  return out;
}

function insightStyle(tone:Insight['tone']) {
  if(tone==='good') return {borderLeft:'3px solid #2f7555',background:'#f5faf7'};
  if(tone==='risk') return {borderLeft:'3px solid #b65757',background:'#fff7f7'};
  if(tone==='warn') return {borderLeft:'3px solid #c49b4a',background:'#fffbf2'};
  return {borderLeft:'3px solid #687aa8',background:'#f6f8fc'};
}

function InsightList({items}:{items:Insight[]}) {
  return <div style={{display:'grid',gap:8}}>{items.map((item,index)=><div key={`${item.title}-${index}`} style={{...insightStyle(item.tone),padding:'10px 12px',borderRadius:8}}><div style={{fontSize:10,fontWeight:800,marginBottom:3}}>{item.title}</div><div style={{fontSize:9,lineHeight:1.55,color:'#65736b'}}>{item.detail}</div></div>)}</div>;
}

export function ExecutiveDashboard(){
  const {users,activities,loading,error,lastRefresh,refresh}=useFounderData();
  const now=Date.now();
  const today=startOfToday();

  const metrics=useMemo(()=>{
    const todayKey=dayKeys(1)[0];
    const dates30=new Set(dayKeys(30));
    const todayRows=activities.filter((row)=>row.date===todayKey);
    const dau=new Set(todayRows.map((row)=>row.uid)).size;
    const mau=new Set(activities.filter((row)=>dates30.has(row.date)).map((row)=>row.uid)).size;
    const firstLoginToday=users.filter((user)=>user.firstLoginAt>=today).length;
    const active30m=users.filter((user)=>user.lastSeenAt>=now-30*60000).length;
    return {dau,mau,firstLoginToday,active30m};
  },[users,activities,now,today]);

  const access=useMemo(()=>{
    const count=(name:string)=>users.filter((user)=>user.plan===name).length;
    const founder=count('Founder');
    const paid=count('Google Play Paid');
    const trial=count('Trial');
    const inti=count('Penjaga Inti');
    const alfa=count('Penjaga Alfa');
    const free=count('Free');
    const expiredGrant=count('Expired Grant');
    const expiredPaid=count('Expired Paid');
    const pending=count('Pending Verification');
    const incomplete=count('Data Incomplete');
    return {
      founder,paid,trial,inti,alfa,free,expiredGrant,expiredPaid,pending,incomplete,
      activePremium:founder+paid+inti+alfa,
      paidConversion:pct(paid,Math.max(1,users.length-founder)),
    };
  },[users]);

  const internalDauMau=pct(metrics.dau,metrics.mau);
  const playDauMau=pct(playSnapshot.dau,playSnapshot.mau);

  const weeklyChange=useMemo(()=>{
    const dates=dayKeys(14);
    const previous=new Set(dates.slice(0,7));
    const current=new Set(dates.slice(7));
    const prevCount=new Set(activities.filter((row)=>previous.has(row.date)).map((row)=>row.uid)).size;
    const currentCount=new Set(activities.filter((row)=>current.has(row.date)).map((row)=>row.uid)).size;
    if(!prevCount) return currentCount?100:0;
    return Math.round(((currentCount-prevCount)/prevCount)*1000)/10;
  },[activities]);

  const intelligence=useMemo(()=>{
    const attention:Insight[]=[];
    const actions:Insight[]=[];
    const strengths:Insight[]=[];
    const weaknesses:Insight[]=[];
    const opportunities:Insight[]=[];
    const threats:Insight[]=[];

    if(access.paidConversion<2){
      attention.push({title:'Monetization funnel',detail:`Google Play Paid ${access.paid} user atau ${access.paidConversion}% dari basis non-Founder.`,tone:'risk'});
      actions.push({title:'Periksa Trial → Paid',detail:'Fokus pada value discovery, paywall, Restore Purchase, dan titik user berhenti sebelum upgrade.',tone:'warn'});
      weaknesses.push({title:'Paid conversion rendah',detail:`Paid conversion internal ${access.paidConversion}%.`,tone:'risk'});
    }
    if(internalDauMau<20 && metrics.mau>0){
      attention.push({title:'Habit belum kuat',detail:`Internal DAU/MAU ${internalDauMau}% dibanding Play snapshot ${playDauMau}%.`,tone:'warn'});
      actions.push({title:'Perkuat alasan untuk kembali',detail:'Gunakan Activation dan Retention untuk melihat fitur serta cohort yang benar-benar membuat user kembali.',tone:'info'});
      weaknesses.push({title:'Penggunaan harian rendah',detail:`DAU/MAU internal ${internalDauMau}%.`,tone:'warn'});
    }
    if(access.expiredGrant>0){
      attention.push({title:'Expired grant',detail:`${access.expiredGrant} user berada pada grant selesai dan tidak dihitung sebagai akses premium aktif.`,tone:'warn'});
      actions.push({title:'Win-back cohort lama',detail:'Pisahkan alumni Penjaga dari user Free biasa untuk komunikasi upgrade yang lebih relevan.',tone:'good'});
      opportunities.push({title:'Win-back Penjaga',detail:`${access.expiredGrant} akun sudah mengenal produk dan dapat dianalisis sebagai cohort tersendiri.`,tone:'good'});
    }
    if(access.pending+access.incomplete>0){
      attention.push({title:'Entitlement diagnostics',detail:`${access.pending+access.incomplete} akun masih Pending Verification atau Data Incomplete.`,tone:'risk'});
      actions.push({title:'Bersihkan status akses',detail:'Verifikasi akun bermasalah tanpa mengubah entitlement massal.',tone:'warn'});
    }

    if(playSnapshot.storeConversion>=40) strengths.push({title:'Store listing efektif',detail:`Store conversion snapshot ${playSnapshot.storeConversion}%.`,tone:'good'});
    if(pct(playSnapshot.activeDevices,playSnapshot.installs)>=50) strengths.push({title:'Installed base masih hidup',detail:`${playSnapshot.activeDevices} active devices dari ${playSnapshot.installs} installs.`,tone:'good'});
    if(weeklyChange>0) strengths.push({title:'Aktivitas 7 hari naik',detail:`Unique active user 7 hari berubah +${weeklyChange}% dibanding periode 7 hari sebelumnya.`,tone:'good'});
    if(access.trial>0) opportunities.push({title:'Trial cohort aktif',detail:`${access.trial} user masih berada pada trial aktif.`,tone:'good'});
    opportunities.push({title:'Segmentasi komunikasi',detail:'Bedakan Free, Trial, Paid, Penjaga, expired grant, dan dormant agar pesan tidak generik.',tone:'info'});
    if(access.paid<5) threats.push({title:'Basis paid masih kecil',detail:'Perubahan satu atau dua pelanggan dapat menggeser persentase monetisasi cukup besar.',tone:'risk'});
    threats.push({title:'Firestore quota',detail:'Jangan membuat full-collection read baru untuk angka yang sudah bisa diturunkan dari shared cache.',tone:'warn'});

    if(!attention.length) attention.push({title:'Tidak ada alert utama',detail:'Pantau monetization, retention, dan entitlement secara berkala.',tone:'good'});
    if(!actions.length) actions.push({title:'Pertahankan observasi',detail:'Tidak perlu menambah metrik baru sebelum ada keputusan yang membutuhkan data tersebut.',tone:'info'});
    if(!strengths.length) strengths.push({title:'Data operasional tersedia',detail:'User, activity, entitlement, dan Play snapshot sudah dapat dipakai untuk keputusan Founder.',tone:'info'});
    if(!weaknesses.length) weaknesses.push({title:'Tidak ada kelemahan besar terdeteksi',detail:'Tetap pantau paid conversion dan retention.',tone:'info'});

    let conclusion='Dashboard sudah cukup untuk keputusan operasional. Prioritas berikutnya adalah menjaga kualitas data dan mengurangi metrik yang tidak memicu tindakan.';
    if(playSnapshot.storeConversion>=40 && access.paidConversion<2){
      conclusion=`Store conversion ${playSnapshot.storeConversion}% menunjukkan acquisition bukan bottleneck utama. Paid conversion internal ${access.paidConversion}% membuat fokus utama bergeser ke activation, retention, dan Trial → Paid.`;
    }

    return {attention:attention.slice(0,4),actions:actions.slice(0,4),strengths:strengths.slice(0,3),weaknesses:weaknesses.slice(0,3),opportunities:opportunities.slice(0,3),threats:threats.slice(0,3),conclusion};
  },[access,internalDauMau,metrics.mau,playDauMau,weeklyChange]);

  return <div className="page">
    <div className="page-heading">
      <div><h1>Executive Overview</h1><p>Ringkasan keputusan Founder. Detail operasional berada di Users, Engagement, Communication, dan Google Play.</p></div>
      <div className="toolbar" style={{marginBottom:0}}><span className="source-badge">BHUMI DB · CACHED</span><span className="source-badge play">PLAY SNAPSHOT · {playSnapshot.kpiDate}</span><button className="btn" onClick={()=>void refresh()}>Refresh</button></div>
    </div>

    {error&&<div className="error-box" style={{marginBottom:12}}>{error}</div>}

    <div className="kpi-grid">
      <Kpi label="Real Users" value={loading?'—':users.length} foot="internal included users" icon={Users}/>
      <Kpi label="Internal DAU / MAU" value={loading?'—':`${metrics.dau} / ${metrics.mau}`} foot={`${internalDauMau}% ratio`} icon={Activity}/>
      <Kpi label="First Login Hari Ini" value={loading?'—':metrics.firstLoginToday} foot={`${metrics.active30m} active ≤30m`} icon={LogIn}/>
      <Kpi label="Google Play Paid" value={loading?'—':access.paid} foot={`${access.paidConversion}% non-Founder base`} icon={CircleDollarSign}/>
      <Kpi label="Play Installs" value={playSnapshot.installs} foot={`${playSnapshot.activeDevices} active devices`} icon={Smartphone}/>
      <Kpi label="Store Conversion" value={`${playSnapshot.storeConversion}%`} foot="Play snapshot" icon={Store}/>
    </div>

    <section className="panel" style={{marginBottom:14}}>
      <div className="panel-head"><div><div className="panel-title">Kesimpulan Keseluruhan</div><span className="panel-subtitle">Diturunkan dari data yang sudah dimuat; tidak menambah query Firestore.</span></div><span className="source-badge">DERIVED</span></div>
      <div className="panel-body"><div className="notice">{intelligence.conclusion}</div></div>
    </section>

    <div className="grid-2" style={{marginBottom:14}}>
      <section className="panel"><div className="panel-head"><div><div className="panel-title">Yang Perlu Diperhatikan</div><span className="panel-subtitle">Hanya isu yang membutuhkan perhatian Founder.</span></div></div><div className="panel-body"><InsightList items={intelligence.attention}/></div></section>
      <section className="panel"><div className="panel-head"><div><div className="panel-title">Suggested Action</div><span className="panel-subtitle">Tindakan berikutnya berdasarkan kondisi saat ini.</span></div></div><div className="panel-body"><InsightList items={intelligence.actions}/></div></section>
    </div>

    <div className="grid-2" style={{marginBottom:14}}>
      <section className="panel">
        <div className="panel-head"><div><div className="panel-title">Business Snapshot</div><span className="panel-subtitle">Ringkas; distribusi lengkap ada di Users → Access.</span></div></div>
        <div className="panel-body"><div className="stat-list">
          <div className="stat-row"><span className="stat-name">Premium access aktif</span><div className="progress"><span style={{width:`${pct(access.activePremium,users.length)}%`}}/></div><span className="stat-value">{access.activePremium}</span></div>
          <div className="stat-row"><span className="stat-name">Trial aktif</span><div className="progress"><span style={{width:`${pct(access.trial,users.length)}%`}}/></div><span className="stat-value">{access.trial}</span></div>
          <div className="stat-row"><span className="stat-name">Revenue Play</span><div className="progress"><span style={{width:'55%'}}/></div><span className="stat-value">${playSnapshot.revenueUsd.toFixed(2)}</span></div>
          <div className="stat-row"><span className="stat-name">Rating Play</span><div className="progress"><span style={{width:`${Math.min(100,playSnapshot.rating/5*100)}%`}}/></div><span className="stat-value">{playSnapshot.rating.toFixed(1)}</span></div>
        </div></div>
      </section>

      <section className="panel">
        <div className="panel-head"><div><div className="panel-title">SWOT</div><span className="panel-subtitle">Ringkasan kondisi, bukan duplikasi dashboard detail.</span></div></div>
        <div className="panel-body" style={{display:'grid',gap:10}}>
          <div><div style={{fontSize:10,fontWeight:800,marginBottom:6}}>Strengths</div><InsightList items={intelligence.strengths}/></div>
          <div><div style={{fontSize:10,fontWeight:800,marginBottom:6}}>Weaknesses</div><InsightList items={intelligence.weaknesses}/></div>
          <div><div style={{fontSize:10,fontWeight:800,marginBottom:6}}>Opportunities</div><InsightList items={intelligence.opportunities}/></div>
          <div><div style={{fontSize:10,fontWeight:800,marginBottom:6}}>Threats</div><InsightList items={intelligence.threats}/></div>
        </div>
      </section>
    </div>

    <div style={{fontSize:9,color:'#87948c',textAlign:'right'}}>Last internal refresh: {lastRefresh?new Date(lastRefresh).toLocaleString('id-ID',{timeZone:'Asia/Jakarta'}):'—'} · Play metrics masih snapshot sampai connector live aktif.</div>
  </div>;
}
