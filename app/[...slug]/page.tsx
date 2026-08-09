const moduleInfo: Record<string,{title:string;description:string;source:string}> = {
  'analytics': {title:'Activation & Engagement',description:'Funnel signup → profile → first value, feature reach, DAU/WAU/MAU, sessions, dan engagement.',source:'BHUMI TELEMETRY'},
  'retention': {title:'Retention',description:'Cohort D1/D7/D30, returning user rate, dan retention driver per fitur.',source:'BHUMI TELEMETRY'},
  'premium': {title:'Premium & Trial',description:'Trial, verified paid, grace, hold, cancelled, expired, renewal, dan conversion.',source:'BILLING'},
  'inbox': {title:'Inbox',description:'Pesan user → admin, unread/read state, thread detail, dan reply.',source:'COMMUNICATIONS'},
  'broadcast': {title:'Broadcast',description:'Audience selection, preview, recipient count, send safeguards, dan broadcast history.',source:'COMMUNICATIONS'},
  'google-play': {title:'Google Play Overview',description:'Install, audience, active devices, first opens, rating, revenue, dan Play health.',source:'GOOGLE PLAY'},
  'google-play/acquisition': {title:'Play Acquisition',description:'Country/region, traffic source, store visitor, installer, conversion, search term, dan UTM.',source:'GOOGLE PLAY'},
  'google-play/monetization': {title:'Play Monetization',description:'Revenue, buyers, buyer ratio, subscription state, refund, dan ARPMAU.',source:'PLAY + BILLING'},
  'google-play/vitals': {title:'Android Vitals',description:'User-perceived crash, ANR, affected users, device/version breakdown, dan error clusters.',source:'PLAY VITALS'},
  'google-play/releases': {title:'Releases',description:'Version, rollout, adoption, release impact, crash/retention delta, dan release notes.',source:'GOOGLE PLAY'},
};

export default async function Page({params}:{params:Promise<{slug:string[]}>}){
  const p=await params; const key=p.slug.join('/');
  const info=moduleInfo[key]||{title:'Founder Module',description:'Modul ini belum dikonfigurasi.',source:'PENDING'};
  return <div className="page"><div className="page-heading"><div><h1>{info.title}</h1><p>{info.description}</p></div><span className="source-badge">{info.source}</span></div><section className="panel"><div className="panel-head"><div><div className="panel-title">Module Status</div><span className="panel-subtitle">Route sudah terpisah dan siap diisi connector/data view tanpa mengubah layout utama.</span></div></div><div className="panel-body"><div className="notice">Struktur multi-page sudah aktif. Modul ini sengaja tidak menampilkan angka palsu sebelum koneksi sumber datanya selesai. Data yang sudah live saat ini: Executive, Data User, Login Activity, dan Profile/Birth Geography.</div></div></section></div>;
}
