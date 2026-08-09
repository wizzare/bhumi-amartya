'use client';

import { collection, collectionGroup, getDocs } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { asTime } from '@/lib/analytics';

export type AdminMessage = {
  id:string;
  uid:string;
  title:string;
  content:string;
  summary:string;
  createdAt:number;
  isRead:boolean;
  status:string;
  senderRole:string;
  recipientRole:string;
  parentMessageId:string;
  threadId:string;
  type:string;
  raw:Record<string,any>;
};

export type BroadcastLog = {
  id:string;
  title:string;
  content:string;
  createdAt:number;
  targetGroups:string[];
  status:string;
  stats:Record<string,any>;
  raw:Record<string,any>;
};

export function useCommunications(allowedUids:Set<string>){
  const [messages,setMessages]=useState<AdminMessage[]>([]);
  const [broadcasts,setBroadcasts]=useState<BroadcastLog[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');

  const refresh=useCallback(async()=>{
    setLoading(true);setError('');
    try{
      const [msgSnap,broadcastSnap]=await Promise.all([
        getDocs(collectionGroup(db,'communications')),
        getDocs(collection(db,'broadcasts')),
      ]);
      const msgRows=msgSnap.docs.map(d=>{
        const x:any=d.data();
        const uid=String(x.ownerUserId||x.uid||x.senderUid||x.userId||'');
        return {
          id:d.id,uid,
          title:String(x.title||x.subject||'Tanpa judul'),
          content:String(x.content||x.message||x.summary||''),
          summary:String(x.summary||''),
          createdAt:Math.max(asTime(x.createdAt),asTime(x.updatedAt)),
          isRead:Boolean(x.isRead),status:String(x.status||'active'),
          senderRole:String(x.senderRole||''),recipientRole:String(x.recipientRole||''),
          parentMessageId:String(x.parentMessageId||''),threadId:String(x.threadId||''),
          type:String(x.type||'user-message'),raw:x,
        } as AdminMessage;
      }).filter(m=>allowedUids.has(m.uid) && (m.recipientRole.toLowerCase()==='admin' || m.senderRole.toLowerCase()==='user'))
        .sort((a,b)=>b.createdAt-a.createdAt);
      const bRows=broadcastSnap.docs.map(d=>{const x:any=d.data();return{id:d.id,title:String(x.title||'Tanpa judul'),content:String(x.content||x.message||x.summary||''),createdAt:Math.max(asTime(x.createdAt),asTime(x.updatedAt)),targetGroups:Array.isArray(x.targetGroups)?x.targetGroups.map(String):[],status:String(x.status||'sent'),stats:(x.stats&&typeof x.stats==='object')?x.stats:{},raw:x}as BroadcastLog}).sort((a,b)=>b.createdAt-a.createdAt);
      setMessages(msgRows);setBroadcasts(bRows);
    }catch(e:any){setError(e?.message||'Gagal membaca communications.');}
    finally{setLoading(false);}
  },[allowedUids]);

  useEffect(()=>{if(allowedUids.size)void refresh();else{setMessages([]);setBroadcasts([]);setLoading(false)}},[refresh,allowedUids.size]);
  return{messages,broadcasts,loading,error,refresh};
}
