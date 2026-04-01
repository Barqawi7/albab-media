import{useState,useEffect,createContext,useContext,useCallback}from"react";
import{supabase}from"../lib/supabase";

const Ctx=createContext();
const D={bg:"#060A13",s1:"#0C1220",s2:"#111827",s3:"#1A2332",bd:"#1E293B",tx:"#E2E8F0",tm:"#94A3B8",td:"#64748B",tw:"#FFF",bl:"#3B82F6",bG:"rgba(59,130,246,.12)",gn:"#10B981",gG:"rgba(16,185,129,.12)",am:"#F59E0B",aG:"rgba(245,158,11,.12)",rd:"#EF4444",rG:"rgba(239,68,68,.12)",pr:"#A78BFA",pG:"rgba(167,139,250,.12)",tl:"#14B8A6",tG:"rgba(20,184,166,.12)",pk:"#EC4899"};
const L={bg:"#F8FAFC",s1:"#FFF",s2:"#F1F5F9",s3:"#E2E8F0",bd:"#E2E8F0",tx:"#1E293B",tm:"#64748B",td:"#94A3B8",tw:"#0F172A",bl:"#3B82F6",bG:"rgba(59,130,246,.08)",gn:"#059669",gG:"rgba(5,150,105,.08)",am:"#D97706",aG:"rgba(217,119,6,.08)",rd:"#DC2626",rG:"rgba(220,38,38,.08)",pr:"#7C3AED",pG:"rgba(124,58,237,.08)",tl:"#0D9488",tG:"rgba(13,148,136,.08)",pk:"#DB2777"};
const STG=["Prospect","Funnel","Upside","Commit","Awarded","Lost","Dropped"];
const sC=s=>({"Prospect":"#94A3B8","Funnel":"#60A5FA","Upside":"#A78BFA","Commit":"#F59E0B","Awarded":"#10B981","Lost":"#EF4444","Dropped":"#6B7280"}[s]||"#94A3B8");
const fm=n=>n>=1e6?(n/1e6).toFixed(1)+"M":n>=1e3?(n/1e3).toFixed(0)+"K":String(Math.round(n));

function Pill({children,c}){const t=useContext(Ctx);return <span style={{padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600,background:(c||t.bl)+"1F",color:c||t.bl}}>{children}</span>}
function KPI({l,v,s,p=true}){const t=useContext(Ctx);return <div style={{background:t.s1,borderRadius:14,padding:"16px 18px",border:"1px solid "+t.bd,flex:1,minWidth:150}}><div style={{fontSize:11,color:t.td,textTransform:"uppercase",letterSpacing:1,marginBottom:6,fontWeight:600}}>{l}</div><div style={{fontSize:22,fontWeight:700,color:t.tw}}>{v}</div>{s&&<div style={{marginTop:5,fontSize:12,color:p?t.gn:t.am}}>{s}</div>}</div>}
function Card({children,style={}}){const t=useContext(Ctx);return <div style={{background:t.s1,borderRadius:14,border:"1px solid "+t.bd,overflow:"hidden",...style}}>{children}</div>}
function CH({title,right}){const t=useContext(Ctx);return <div style={{padding:"14px 18px",borderBottom:"1px solid "+t.bd,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}><div style={{fontSize:14,fontWeight:600,color:t.tw}}>{title}</div>{right}</div>}
function Btn({a,l,onClick}){const t=useContext(Ctx);return <button onClick={onClick} style={{padding:"4px 12px",borderRadius:6,border:"none",background:a?t.bl:"transparent",color:a?"#fff":t.tm,fontSize:12,fontWeight:500,cursor:"pointer"}}>{l}</button>}
function AB({onClick,l="+ Add"}){const t=useContext(Ctx);return <button onClick={onClick} style={{padding:"6px 14px",borderRadius:8,border:"none",background:t.gn,color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer"}}>{l}</button>}
function DB({onClick}){return <button onClick={onClick} style={{padding:"2px 8px",borderRadius:4,border:"none",background:"transparent",color:"#EF4444",fontSize:13,cursor:"pointer",opacity:.45,lineHeight:1}} onMouseEnter={e=>e.target.style.opacity=1} onMouseLeave={e=>e.target.style.opacity=.45}>✕</button>}
function EB({onClick}){return <button onClick={onClick} style={{padding:"2px 8px",borderRadius:4,border:"none",background:"transparent",color:"#60A5FA",fontSize:13,cursor:"pointer",opacity:.45,lineHeight:1}} onMouseEnter={e=>e.target.style.opacity=1} onMouseLeave={e=>e.target.style.opacity=.45}>✎</button>}

function Modal({open,onClose,title,children}){const t=useContext(Ctx);if(!open)return null;return <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999}} onClick={onClose}><div onClick={e=>e.stopPropagation()} style={{background:t.s1,borderRadius:16,border:"1px solid "+t.bd,padding:24,width:440,maxHeight:"80vh",overflow:"auto"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:16}}><div style={{fontSize:18,fontWeight:700,color:t.tw}}>{title}</div><div onClick={onClose} style={{cursor:"pointer",color:t.td,fontSize:20}}>×</div></div>{children}</div></div>}
function F({l,v,onChange,type="text",opts}){const t=useContext(Ctx);return <div style={{marginBottom:12}}><div style={{fontSize:12,color:t.tm,marginBottom:4}}>{l}</div>{opts?<select value={v} onChange={e=>onChange(e.target.value)} style={{width:"100%",padding:"8px 12px",borderRadius:8,border:"1px solid "+t.bd,background:t.s2,color:t.tx,fontSize:13}}>{opts.map(o=><option key={o} value={o}>{o}</option>)}</select>:<input type={type} value={v} onChange={e=>onChange(e.target.value)} style={{width:"100%",padding:"8px 12px",borderRadius:8,border:"1px solid "+t.bd,background:t.s2,color:t.tx,fontSize:13,outline:"none",boxSizing:"border-box"}}/>}</div>}
function SB({onClick,loading}){const t=useContext(Ctx);return <button onClick={onClick} disabled={loading} style={{width:"100%",padding:"10px",borderRadius:8,border:"none",background:t.bl,color:"#fff",fontSize:14,fontWeight:600,cursor:"pointer",marginTop:8,opacity:loading?.6:1}}>{loading?"Saving...":"Save"}</button>}

function DashPage({ld,inv,qt,exp}){const t=useContext(Ctx);const tr=inv.reduce((a,f)=>a+(f.revenue||0),0);const tp=inv.reduce((a,f)=>a+(f.amount_paid||0),0);const pi={};ld.forEach(l=>pi[l.stage]=(pi[l.stage]||0)+1);const qs={};qt.forEach(q=>qs[q.status]=(qs[q.status]||0)+1);const cr={};inv.forEach(f=>cr[f.client]=(cr[f.client]||0)+(f.revenue||0));const tc=Object.entries(cr).sort((a,b)=>b[1]-a[1]).slice(0,8);const mx=tc[0]?.[1]||1;const pD=STG.map(s=>({k:s,c:sC(s),n:pi[s]||0}));const tot=pD.reduce((a,d)=>a+d.n,0);
return <div style={{display:"flex",flexDirection:"column",gap:16}}>
<div style={{display:"flex",gap:12,flexWrap:"wrap"}}><KPI l="Total revenue" v={fm(tr)+" AED"} s={"Collected: "+fm(tp)} p/><KPI l="Outstanding" v={fm(tr-tp)+" AED"} s="Due" p={tr-tp===0}/><KPI l="Pipeline" v={tot+" deals"} s={(pi.Awarded||0)+" awarded"} p/><KPI l="Expenses" v={fm(exp.reduce((a,e)=>a+(e.amount||0),0))+" AED/mo"} p={false}/></div>
<Card><div style={{padding:18}}><div style={{fontSize:14,fontWeight:600,color:t.tw,marginBottom:12}}>Pipeline ({tot})</div>{tot>0&&<><div style={{display:"flex",borderRadius:6,overflow:"hidden",height:28,marginBottom:12}}>{pD.filter(d=>d.n>0).map(d=><div key={d.k} style={{width:(d.n/tot*100)+"%",background:d.c,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#fff",minWidth:20}}>{d.n}</div>)}</div><div style={{display:"flex",flexWrap:"wrap",gap:"4px 14px"}}>{pD.map(d=><div key={d.k} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:t.tm}}><div style={{width:8,height:8,borderRadius:2,background:d.c}}/>{d.k} ({d.n})</div>)}</div></>}</div></Card>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
<Card><CH title="Top clients"/><div style={{padding:"6px 18px"}}>{tc.map(([cl,v],i)=><div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom:"1px solid "+t.bd}}><div style={{flex:1,fontSize:13,fontWeight:600,color:t.tw,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{cl}</div><div style={{flex:2,height:6,background:t.bd,borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",background:t.gn,borderRadius:3,width:(v/mx*100)+"%"}}/></div><div style={{minWidth:50,textAlign:"right",fontSize:12,fontWeight:600,color:t.tw}}>{fm(v)}</div></div>)}</div></Card>
<Card><CH title={"Quotations ("+qt.length+")"}/><div style={{padding:"6px 18px"}}>{Object.entries(qs).sort((a,b)=>b[1]-a[1]).map(([st,c],i)=><div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:"1px solid "+t.bd}}><Pill c={st==="Awarded"?t.gn:st==="Dropped"?t.td:st==="Lost"?t.rd:t.am}>{st}</Pill><div style={{flex:1}}/><div style={{fontSize:20,fontWeight:700,color:t.tw}}>{c}</div></div>)}</div></Card>
</div></div>}

function SalesPage({ld,rl}){
const t=useContext(Ctx);
const[fi,sfi]=useState("All");const[se,sse]=useState("");const[mo,smo]=useState(false);
const dF={client:"",vertical:"",contact_person:"",email:"",stage:"Prospect"};
const[fo,sfo]=useState(dF);const[sv,ssv]=useState(false);const[er,ser]=useState(null);
let ls=ld;if(fi!=="All")ls=ls.filter(s=>s.stage===fi);if(se)ls=ls.filter(s=>(s.client+s.contact_person+s.vertical).toLowerCase().includes(se.toLowerCase()));
const pi={};ld.forEach(l=>pi[l.stage]=(pi[l.stage]||0)+1);
const openAdd=()=>{ser(null);sfo(dF);smo(true)};
const openEdit=r=>{ser(r);sfo({client:r.client||"",vertical:r.vertical||"",contact_person:r.contact_person||"",email:r.email||"",stage:r.stage||"Prospect"});smo(true)};
const save=async()=>{if(!fo.client.trim())return;ssv(true);if(er){await supabase.from("leads").update(fo).eq("id",er.id)}else{await supabase.from("leads").insert([fo])}ssv(false);smo(false);ser(null);sfo(dF);rl()};
const del=async id=>{if(!confirm("Delete?"))return;await supabase.from("leads").delete().eq("id",id);rl()};
return <div style={{display:"flex",flexDirection:"column",gap:16}}>
<div style={{display:"flex",gap:12,flexWrap:"wrap"}}><KPI l="Total" v={ld.length} s={(pi.Awarded||0)+" awarded"} p/><KPI l="Active" v={(pi.Prospect||0)+(pi.Funnel||0)+(pi.Upside||0)} s="In pipeline" p/><KPI l="Win rate" v={ld.length?((pi.Awarded||0)/ld.length*100).toFixed(0)+"%":"0%"} p/><KPI l="Lost+Drop" v={(pi.Lost||0)+(pi.Dropped||0)} p={false}/></div>
<Card><CH title={"Leads ("+ls.length+")"} right={<div style={{display:"flex",gap:4,flexWrap:"wrap",alignItems:"center"}}><input placeholder="Search..." value={se} onChange={e=>sse(e.target.value)} style={{background:t.bg,border:"1px solid "+t.bd,borderRadius:6,padding:"5px 10px",color:t.tx,fontSize:12,width:120,outline:"none"}}/>{["All",...STG].map(s=><Btn key={s} a={fi===s} l={s} onClick={()=>sfi(s)}/>)}<AB onClick={openAdd} l="+ Add"/></div>}/>
<div style={{maxHeight:460,overflow:"auto"}}>{ls.map((s,i)=><div key={s.id||i} style={{display:"flex",alignItems:"center",padding:"10px 18px",borderBottom:"1px solid "+t.bd,gap:12,fontSize:13}} onMouseEnter={e=>e.currentTarget.style.background=t.s3} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
<div style={{width:32,height:32,borderRadius:8,background:sC(s.stage)+"1F",display:"flex",alignItems:"center",justifyContent:"center",color:sC(s.stage),fontWeight:700,fontSize:13,flexShrink:0}}>{(s.client||"?")[0]}</div>
<div style={{flex:2,minWidth:0}}><div style={{fontWeight:600,color:t.tw,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.client}</div><div style={{fontSize:11,color:t.td}}>{s.contact_person}{s.vertical?" · "+s.vertical:""}</div></div>
<div style={{width:80}}><Pill c={sC(s.stage)}>{s.stage}</Pill></div>
{s.id&&<><EB onClick={()=>openEdit(s)}/><DB onClick={()=>del(s.id)}/></>}
</div>)}</div></Card>
<Modal open={mo} onClose={()=>smo(false)} title={er?"Edit lead":"Add lead"}><F l="Client" v={fo.client} onChange={v=>sfo({...fo,client:v})}/><F l="Vertical" v={fo.vertical} onChange={v=>sfo({...fo,vertical:v})}/><F l="Contact" v={fo.contact_person} onChange={v=>sfo({...fo,contact_person:v})}/><F l="Email" v={fo.email} onChange={v=>sfo({...fo,email:v})}/><F l="Stage" v={fo.stage} onChange={v=>sfo({...fo,stage:v})} opts={STG}/><SB onClick={save} loading={sv}/></Modal>
</div>}

function CashPage({inv,rl}){
const t=useContext(Ctx);
const[se,sse]=useState("");const[mo,smo]=useState(false);
const dF={client:"",vertical:"",revenue:0,amount_paid:0};
const[fo,sfo]=useState(dF);const[sv,ssv]=useState(false);const[er,ser]=useState(null);
let ls=inv;if(se)ls=ls.filter(f=>f.client.toLowerCase().includes(se.toLowerCase()));
const tr=inv.reduce((a,f)=>a+(f.revenue||0),0);const tp=inv.reduce((a,f)=>a+(f.amount_paid||0),0);
const vt={};inv.forEach(f=>vt[f.vertical||"Other"]=(vt[f.vertical||"Other"]||0)+(f.revenue||0));const tv=Object.entries(vt).sort((a,b)=>b[1]-a[1]).slice(0,8);const mx=tv[0]?.[1]||1;
const openAdd=()=>{ser(null);sfo(dF);smo(true)};
const openEdit=r=>{ser(r);sfo({client:r.client||"",vertical:r.vertical||"",revenue:r.revenue||0,amount_paid:r.amount_paid||0});smo(true)};
const save=async()=>{if(!fo.client.trim())return;ssv(true);const d={...fo,revenue:Number(fo.revenue),amount_paid:Number(fo.amount_paid),due_payment:Number(fo.revenue)-Number(fo.amount_paid)};if(er){await supabase.from("invoices").update(d).eq("id",er.id)}else{await supabase.from("invoices").insert([d])}ssv(false);smo(false);ser(null);sfo(dF);rl()};
const del=async id=>{if(!confirm("Delete?"))return;await supabase.from("invoices").delete().eq("id",id);rl()};
return <div style={{display:"flex",flexDirection:"column",gap:16}}>
<div style={{display:"flex",gap:12,flexWrap:"wrap"}}><KPI l="Revenue" v={fm(tr)+" AED"} s={inv.length+" invoices"} p/><KPI l="Collected" v={fm(tp)+" AED"} s={tr?(tp/tr*100).toFixed(0)+"%":"0%"} p/><KPI l="Outstanding" v={fm(tr-tp)+" AED"} p={tr-tp===0}/></div>
<Card><CH title="By vertical"/><div style={{padding:"6px 18px"}}>{tv.map(([v,a],i)=><div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:"1px solid "+t.bd}}><div style={{flex:1,fontSize:12,color:t.tw}}>{v}</div><div style={{flex:2,height:6,background:t.bd,borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",background:t.tl,borderRadius:3,width:(a/mx*100)+"%"}}/></div><div style={{minWidth:50,textAlign:"right",fontSize:12,fontWeight:600,color:t.tw}}>{fm(a)}</div></div>)}</div></Card>
<Card><CH title={"Invoices ("+ls.length+")"} right={<div style={{display:"flex",gap:6,alignItems:"center"}}><input placeholder="Search..." value={se} onChange={e=>sse(e.target.value)} style={{background:t.bg,border:"1px solid "+t.bd,borderRadius:6,padding:"5px 10px",color:t.tx,fontSize:12,width:150,outline:"none"}}/><AB onClick={openAdd} l="+ Add"/></div>}/>
<div style={{maxHeight:380,overflow:"auto"}}>{ls.map((f,i)=><div key={f.id||i} style={{display:"flex",alignItems:"center",padding:"9px 18px",borderBottom:"1px solid "+t.bd,gap:12,fontSize:13}}>
<div style={{flex:2,fontWeight:500,color:t.tw}}>{f.client}</div><div style={{flex:1,color:t.tm,fontSize:12}}>{f.vertical}</div>
<div style={{width:70,textAlign:"right",color:t.gn,fontWeight:600}}>{(f.revenue||0).toLocaleString()}</div>
<div style={{width:70,textAlign:"right",color:t.tx}}>{(f.amount_paid||0).toLocaleString()}</div>
<div style={{width:55,textAlign:"right",color:(f.revenue-f.amount_paid)>0?t.rd:t.td,fontWeight:600}}>{(f.revenue-f.amount_paid)>0?(f.revenue-f.amount_paid).toLocaleString():"—"}</div>
{f.id&&<><EB onClick={()=>openEdit(f)}/><DB onClick={()=>del(f.id)}/></>}
</div>)}</div></Card>
<Modal open={mo} onClose={()=>smo(false)} title={er?"Edit invoice":"Add invoice"}><F l="Client" v={fo.client} onChange={v=>sfo({...fo,client:v})}/><F l="Vertical" v={fo.vertical} onChange={v=>sfo({...fo,vertical:v})}/><F l="Revenue (AED)" v={fo.revenue} onChange={v=>sfo({...fo,revenue:v})} type="number"/><F l="Paid (AED)" v={fo.amount_paid} onChange={v=>sfo({...fo,amount_paid:v})} type="number"/><SB onClick={save} loading={sv}/></Modal>
</div>}

function InfPage({inf,rl}){
const t=useContext(Ctx);
const[ti,sti]=useState("All");const[se,sse]=useState("");const[mo,smo]=useState(false);
const dF={name:"",handle:"",category:"",city:"Dubai",nationality:"",ig_followers:"0",tiktok_followers:"0",youtube_followers:"0",total_reach:"0",engagement:0,tier:"Micro"};
const[fo,sfo]=useState(dF);const[sv,ssv]=useState(false);const[er,ser]=useState(null);
const tiers=["All","Mega","Macro","Mid","Micro"];const tC={Mega:t.pr,Macro:t.bl,Mid:t.tl,Micro:t.gn};
let ls=inf;if(ti!=="All")ls=ls.filter(i=>i.tier===ti);if(se)ls=ls.filter(i=>(i.name+i.category+i.handle).toLowerCase().includes(se.toLowerCase()));
const openAdd=()=>{ser(null);sfo(dF);smo(true)};
const openEdit=r=>{ser(r);sfo({name:r.name||"",handle:r.handle||"",category:r.category||"",city:r.city||"Dubai",nationality:r.nationality||"",ig_followers:r.ig_followers||"0",tiktok_followers:r.tiktok_followers||"0",youtube_followers:r.youtube_followers||"0",total_reach:r.total_reach||"0",engagement:r.engagement||0,tier:r.tier||"Micro"});smo(true)};
const save=async()=>{if(!fo.name.trim())return;ssv(true);const d={...fo,engagement:Number(fo.engagement)};if(er){await supabase.from("influencers").update(d).eq("id",er.id)}else{await supabase.from("influencers").insert([d])}ssv(false);smo(false);ser(null);sfo(dF);rl()};
const del=async id=>{if(!confirm("Delete?"))return;await supabase.from("influencers").delete().eq("id",id);rl()};
return <div style={{display:"flex",flexDirection:"column",gap:16}}>
<div style={{display:"flex",gap:12,flexWrap:"wrap"}}><KPI l="Total" v={inf.length} s="Influencers" p/><KPI l="Avg engagement" v={inf.length?(inf.reduce((a,i)=>a+(i.engagement||0),0)/inf.length).toFixed(1)+"%":"0%"} p/></div>
<Card><CH title={"Influencers ("+ls.length+")"} right={<div style={{display:"flex",gap:4,alignItems:"center"}}><input placeholder="Search..." value={se} onChange={e=>sse(e.target.value)} style={{background:t.bg,border:"1px solid "+t.bd,borderRadius:6,padding:"5px 10px",color:t.tx,fontSize:12,width:140,outline:"none"}}/>{tiers.map(x=><Btn key={x} a={ti===x} l={x} onClick={()=>sti(x)}/>)}<AB onClick={openAdd} l="+"/></div>}/>
<div style={{maxHeight:460,overflow:"auto"}}>{ls.map((n,i)=><div key={n.id||i} style={{display:"flex",alignItems:"center",padding:"10px 18px",borderBottom:"1px solid "+t.bd,gap:10,fontSize:13}} onMouseEnter={e=>e.currentTarget.style.background=t.s3} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
<div style={{width:34,height:34,borderRadius:"50%",background:(tC[n.tier]||t.td)+"1F",display:"flex",alignItems:"center",justifyContent:"center",color:tC[n.tier],fontWeight:700,fontSize:14,flexShrink:0}}>{(n.name||"?")[0]}</div>
<div style={{flex:2,minWidth:0}}><div style={{fontWeight:600,color:t.tw,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{n.name}</div><div style={{fontSize:11,color:t.td}}>{n.handle} · {n.category}</div></div>
<div style={{width:55,textAlign:"right",fontSize:12,color:t.pk,fontWeight:600}}>{n.ig_followers}</div>
<div style={{width:55,textAlign:"right",fontSize:12,color:t.tl,fontWeight:600}}>{n.tiktok_followers}</div>
<div style={{width:55,textAlign:"right",fontSize:12,color:t.rd,fontWeight:600}}>{n.youtube_followers}</div>
<div style={{width:65,textAlign:"right",fontWeight:700,color:t.tw}}>{n.total_reach}</div>
<div style={{width:42,textAlign:"right",color:(n.engagement||0)>=5?t.gn:(n.engagement||0)>=2?t.am:t.td,fontWeight:600,fontSize:12}}>{n.engagement}%</div>
<Pill c={tC[n.tier]}>{n.tier}</Pill>
{n.id&&<><EB onClick={()=>openEdit(n)}/><DB onClick={()=>del(n.id)}/></>}
</div>)}</div></Card>
<Modal open={mo} onClose={()=>smo(false)} title={er?"Edit influencer":"Add influencer"}><F l="Name" v={fo.name} onChange={v=>sfo({...fo,name:v})}/><F l="Handle" v={fo.handle} onChange={v=>sfo({...fo,handle:v})}/><F l="Category" v={fo.category} onChange={v=>sfo({...fo,category:v})}/><F l="City" v={fo.city} onChange={v=>sfo({...fo,city:v})}/><F l="IG followers" v={fo.ig_followers} onChange={v=>sfo({...fo,ig_followers:v})}/><F l="TikTok" v={fo.tiktok_followers} onChange={v=>sfo({...fo,tiktok_followers:v})}/><F l="YouTube" v={fo.youtube_followers} onChange={v=>sfo({...fo,youtube_followers:v})}/><F l="Engagement %" v={fo.engagement} onChange={v=>sfo({...fo,engagement:v})} type="number"/><F l="Tier" v={fo.tier} onChange={v=>sfo({...fo,tier:v})} opts={["Mega","Macro","Mid","Micro"]}/><SB onClick={save} loading={sv}/></Modal>
</div>}

function QuotPage({qt,rl}){
const t=useContext(Ctx);
const[fi,sfi]=useState("All");const[se,sse]=useState("");const[mo,smo]=useState(false);
const dF={client:"",status:"Pending"};
const[fo,sfo]=useState(dF);const[sv,ssv]=useState(false);const[er,ser]=useState(null);
const sts=["All","Awarded","Dropped","Lost","Pending"];let ls=qt;if(fi!=="All")ls=ls.filter(q=>q.status===fi);if(se)ls=ls.filter(q=>q.client.toLowerCase().includes(se.toLowerCase()));
const qs={};qt.forEach(q=>qs[q.status]=(qs[q.status]||0)+1);
const openAdd=()=>{ser(null);sfo(dF);smo(true)};
const openEdit=r=>{ser(r);sfo({client:r.client||"",status:r.status||"Pending"});smo(true)};
const save=async()=>{if(!fo.client.trim())return;ssv(true);if(er){await supabase.from("quotations").update(fo).eq("id",er.id)}else{await supabase.from("quotations").insert([fo])}ssv(false);smo(false);ser(null);sfo(dF);rl()};
const del=async id=>{if(!confirm("Delete?"))return;await supabase.from("quotations").delete().eq("id",id);rl()};
return <div style={{display:"flex",flexDirection:"column",gap:16}}>
<div style={{display:"flex",gap:12,flexWrap:"wrap"}}><KPI l="Total" v={qt.length} p/><KPI l="Awarded" v={qs.Awarded||0} s={qt.length?((qs.Awarded||0)/qt.length*100).toFixed(0)+"%":"0%"} p/><KPI l="Dropped" v={qs.Dropped||0} p={false}/><KPI l="Pending" v={qs.Pending||0} p/></div>
<Card><CH title={"Quotations ("+ls.length+")"} right={<div style={{display:"flex",gap:4,alignItems:"center"}}><input placeholder="Search..." value={se} onChange={e=>sse(e.target.value)} style={{background:t.bg,border:"1px solid "+t.bd,borderRadius:6,padding:"5px 10px",color:t.tx,fontSize:12,width:120,outline:"none"}}/>{sts.map(s=><Btn key={s} a={fi===s} l={s} onClick={()=>sfi(s)}/>)}<AB onClick={openAdd} l="+"/></div>}/>
<div style={{maxHeight:460,overflow:"auto"}}>{ls.map((q,i)=><div key={q.id||i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 18px",borderBottom:"1px solid "+t.bd}}>
<div style={{fontSize:13,fontWeight:500,color:t.tw}}>{q.client}</div>
<div style={{display:"flex",alignItems:"center",gap:4}}><Pill c={q.status==="Awarded"?t.gn:q.status==="Dropped"?t.td:q.status==="Lost"?t.rd:t.am}>{q.status}</Pill>{q.id&&<><EB onClick={()=>openEdit(q)}/><DB onClick={()=>del(q.id)}/></>}</div>
</div>)}</div></Card>
<Modal open={mo} onClose={()=>smo(false)} title={er?"Edit quotation":"Add quotation"}><F l="Client" v={fo.client} onChange={v=>sfo({...fo,client:v})}/><F l="Status" v={fo.status} onChange={v=>sfo({...fo,status:v})} opts={["Awarded","Dropped","Lost","Pending"]}/><SB onClick={save} loading={sv}/></Modal>
</div>}

function ExpPage({exp,rl}){
const t=useContext(Ctx);
const[mo,smo]=useState(false);
const dF={item:"",amount:0};
const[fo,sfo]=useState(dF);const[sv,ssv]=useState(false);const[er,ser]=useState(null);
const openAdd=()=>{ser(null);sfo(dF);smo(true)};
const openEdit=r=>{ser(r);sfo({item:r.item||"",amount:r.amount||0});smo(true)};
const save=async()=>{if(!fo.item.trim())return;ssv(true);const d={item:fo.item,amount:Number(fo.amount),frequency:"Monthly"};if(er){await supabase.from("expenses").update(d).eq("id",er.id)}else{await supabase.from("expenses").insert([d])}ssv(false);smo(false);ser(null);sfo(dF);rl()};
const del=async id=>{if(!confirm("Delete?"))return;await supabase.from("expenses").delete().eq("id",id);rl()};
return <div style={{display:"flex",flexDirection:"column",gap:16}}>
<KPI l="Monthly expenses" v={fm(exp.reduce((a,e)=>a+(e.amount||0),0))+" AED"} s={exp.length+" items"} p={false}/>
<Card><CH title="Expenses" right={<AB onClick={openAdd} l="+ Add"/>}/>
<div style={{padding:"0 18px"}}>{exp.map((e,i)=><div key={e.id||i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid "+t.bd}}>
<div style={{fontSize:13,fontWeight:500,color:t.tw}}>{e.item}</div>
<div style={{display:"flex",alignItems:"center",gap:4}}><div style={{fontSize:14,fontWeight:700,color:t.am}}>{(e.amount||0).toLocaleString()} AED</div>{e.id&&<><EB onClick={()=>openEdit(e)}/><DB onClick={()=>del(e.id)}/></>}</div>
</div>)}</div></Card>
<Modal open={mo} onClose={()=>smo(false)} title={er?"Edit expense":"Add expense"}><F l="Item" v={fo.item} onChange={v=>sfo({...fo,item:v})}/><F l="Amount (AED)" v={fo.amount} onChange={v=>sfo({...fo,amount:v})} type="number"/><SB onClick={save} loading={sv}/></Modal>
</div>}

const NAV=[{k:"dash",l:"Dashboard",i:"▣"},{k:"sales",l:"Sales",i:"⚡"},{k:"inf",l:"Influencers",i:"★"},{k:"cash",l:"Cash flow",i:"$"},{k:"quot",l:"Quotations",i:"☑"},{k:"exp",l:"Expenses",i:"⚙"}];

export default function App(){
const[mode,setMode]=useState("dark");const[active,setActive]=useState("dash");const[loading,setLoading]=useState(true);
const[data,setData]=useState({ld:[],inv:[],qt:[],inf:[],ct:[],exp:[]});
const t=mode==="dark"?D:L;

const load=useCallback(async()=>{try{
const[a,b,c,d,e]=await Promise.all([
supabase.from("leads").select("*").order("id",{ascending:false}),
supabase.from("invoices").select("*").order("id"),
supabase.from("quotations").select("*").order("id"),
supabase.from("influencers").select("*").order("id"),
supabase.from("expenses").select("*").order("id")]);
setData({ld:a.data||[],inv:b.data||[],qt:c.data||[],inf:d.data||[],exp:e.data||[]});
}catch(e){console.error(e)}setLoading(false)},[]);

useEffect(()=>{load()},[load]);

const pg={dash:<DashPage ld={data.ld} inv={data.inv} qt={data.qt} exp={data.exp}/>,
sales:<SalesPage ld={data.ld} rl={load}/>,inf:<InfPage inf={data.inf} rl={load}/>,
cash:<CashPage inv={data.inv} rl={load}/>,quot:<QuotPage qt={data.qt} rl={load}/>,
exp:<ExpPage exp={data.exp} rl={load}/>};

return <Ctx.Provider value={t}><div style={{display:"flex",height:"100vh",background:t.bg,fontFamily:"'Inter',-apple-system,sans-serif",color:t.tx,overflow:"hidden"}}>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/>
<div style={{width:165,background:t.s1,borderRight:"1px solid "+t.bd,display:"flex",flexDirection:"column",flexShrink:0}}>
<div style={{padding:"14px 12px",borderBottom:"1px solid "+t.bd,display:"flex",alignItems:"center",gap:8}}><div style={{width:28,height:28,borderRadius:7,background:"linear-gradient(135deg,#3B82F6,#8B5CF6)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:12}}>A</div><div style={{fontWeight:700,fontSize:13,color:t.tw}}>ALBAB Media</div></div>
<div style={{flex:1,padding:"4px 0"}}>{NAV.map(n=><div key={n.k} onClick={()=>setActive(n.k)} style={{display:"flex",alignItems:"center",gap:7,padding:"9px 14px",cursor:"pointer",color:active===n.k?t.bl:t.tm,background:active===n.k?t.bG:"transparent",borderRight:active===n.k?"2px solid "+t.bl:"2px solid transparent",fontSize:13,fontWeight:active===n.k?600:400}} onMouseEnter={e=>{if(active!==n.k)e.currentTarget.style.background=t.s3}} onMouseLeave={e=>{if(active!==n.k)e.currentTarget.style.background="transparent"}}><span style={{fontSize:15,width:18,textAlign:"center"}}>{n.i}</span>{n.l}</div>)}</div>
<div style={{padding:"8px 10px",borderTop:"1px solid "+t.bd}}><div onClick={()=>setMode(m=>m==="dark"?"light":"dark")} style={{padding:"8px 10px",background:t.s2,borderRadius:8,cursor:"pointer",color:t.tm,fontSize:12,textAlign:"center"}}>{mode==="dark"?"☀ Light":"☾ Dark"}</div></div>
</div>
<div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minWidth:0}}>
<div style={{padding:"10px 20px",borderBottom:"1px solid "+t.bd,background:t.s1,flexShrink:0,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
<div><div style={{fontSize:16,fontWeight:700,color:t.tw}}>{NAV.find(n=>n.k===active)?.l}</div><div style={{fontSize:11,color:t.td}}>ALBAB Media</div></div>
<div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:8,height:8,borderRadius:"50%",background:loading?t.am:t.gn}}/><span style={{fontSize:11,color:t.td}}>{loading?"Loading...":"Live"}</span></div>
</div>
<div style={{flex:1,overflow:"auto",padding:16}}>{loading?<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",color:t.td}}>Loading...</div>:pg[active]}</div>
</div>
<style>{`*{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${t.bd};border-radius:3px}input::placeholder{color:${t.td}}select{appearance:auto}`}</style>
</div></Ctx.Provider>}
