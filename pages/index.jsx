import{useState,useEffect,createContext,useContext,useCallback,useRef}from"react";
import{supabase}from"../lib/supabase";

const Ctx=createContext();
const D={bg:"#080C14",s1:"#0D1420",s2:"#111827",s3:"#162030",bd:"#1E2D42",tx:"#CBD5E1",tm:"#7A92AB",td:"#4A6480",tw:"#F1F5F9",bl:"#3B82F6",bG:"rgba(59,130,246,.12)",gn:"#10B981",gG:"rgba(16,185,129,.1)",am:"#F59E0B",aG:"rgba(245,158,11,.1)",rd:"#EF4444",rG:"rgba(239,68,68,.1)",pr:"#A78BFA",pG:"rgba(167,139,250,.1)",tl:"#14B8A6",pk:"#EC4899",or:"#F97316"};
const L={bg:"#F0F4F8",s1:"#FFFFFF",s2:"#F1F5F9",s3:"#E2E8F0",bd:"#CBD5E1",tx:"#1E293B",tm:"#475569",td:"#94A3B8",tw:"#0F172A",bl:"#2563EB",bG:"rgba(37,99,235,.08)",gn:"#059669",gG:"rgba(5,150,105,.08)",am:"#D97706",aG:"rgba(217,119,6,.08)",rd:"#DC2626",rG:"rgba(220,38,38,.08)",pr:"#7C3AED",pG:"rgba(124,58,237,.08)",tl:"#0D9488",pk:"#DB2777",or:"#EA580C"};
const STG=["Prospect","Funnel","Upside","Commit","Awarded","Lost","Dropped"];
const sC=s=>({"Prospect":"#64748B","Funnel":"#3B82F6","Upside":"#A78BFA","Commit":"#F59E0B","Awarded":"#10B981","Lost":"#EF4444","Dropped":"#475569"}[s]||"#64748B");

// UAE Major Events Database
const UAE_EVENTS=[
  {title:"GITEX Global",date:"2025-10-13",end:"2025-10-17",cat:"Technology",venue:"DWTC, Dubai",url:"https://gitex.com",desc:"World's largest tech show. 6,000+ exhibitors, 180+ countries."},
  {title:"Arabian Travel Market",date:"2025-04-28",end:"2025-05-01",cat:"Travel",venue:"DWTC, Dubai",url:"https://arabiantravelmarket.wtm.com",desc:"Leading travel & tourism event in Middle East."},
  {title:"Gulfood",date:"2026-02-16",end:"2026-02-20",cat:"Food & Beverage",venue:"DWTC, Dubai",url:"https://gulfood.com",desc:"World's largest annual food & beverage trade show."},
  {title:"Dubai Lynx",date:"2026-03-09",end:"2026-03-11",cat:"Marketing",venue:"Dubai",url:"https://dubailynx.com",desc:"MENA's biggest marketing & creativity festival."},
  {title:"Step Conference",date:"2026-02-25",end:"2026-02-26",cat:"Tech & Startups",venue:"Dubai",url:"https://stepconference.com",desc:"Middle East's leading startup & tech conference."},
  {title:"Index Dubai",date:"2025-05-19",end:"2025-05-22",cat:"Design",venue:"DWTC, Dubai",url:"https://indexdubai.com",desc:"Largest interior design exhibition in Middle East."},
  {title:"The Bride Show Dubai",date:"2025-10-23",end:"2025-10-26",cat:"Events",venue:"DWTC, Dubai",url:"",desc:"Premier wedding & bridal exhibition."},
  {title:"Dubai Airshow",date:"2025-11-17",end:"2025-11-21",cat:"Aviation",venue:"Dubai Airshow Site",url:"https://dubaiairshow.aero",desc:"World's premier airshow & aviation trade event."},
  {title:"Beautyworld Middle East",date:"2025-05-27",end:"2025-05-29",cat:"Beauty",venue:"DWTC, Dubai",url:"",desc:"Largest beauty trade fair in Middle East."},
  {title:"Hotel Show Dubai",date:"2025-09-22",end:"2025-09-24",cat:"Hospitality",venue:"DWTC, Dubai",url:"",desc:"Middle East's leading hospitality event."},
  {title:"Arab Health",date:"2026-01-26",end:"2026-01-29",cat:"Healthcare",venue:"DWTC, Dubai",url:"https://arabhealth.com",desc:"World's second largest healthcare event."},
  {title:"Intersec Dubai",date:"2026-01-20",end:"2026-01-22",cat:"Security",venue:"DWTC, Dubai",url:"https://intersec.com",desc:"World's leading trade fair for security & safety."},
  {title:"Big5 Dubai",date:"2025-11-24",end:"2025-11-27",cat:"Construction",venue:"DWTC, Dubai",url:"https://thebig5.net",desc:"Middle East's largest construction event."},
  {title:"ADIPEC",date:"2025-11-04",end:"2025-11-07",cat:"Energy",venue:"ADNEC, Abu Dhabi",url:"https://adipec.com",desc:"World's most influential energy event."},
  {title:"Dubai Shopping Festival",date:"2025-12-26",end:"2026-02-01",cat:"Retail",venue:"Dubai",url:"",desc:"Annual mega shopping & entertainment festival."},
  {title:"Dubai Fitness Challenge",date:"2025-10-31",end:"2025-11-29",cat:"Health",venue:"Dubai",url:"",desc:"30x30 challenge across Dubai."},
  {title:"Art Dubai",date:"2026-03-18",end:"2026-03-22",cat:"Art",venue:"Madinat Jumeirah",url:"https://artdubai.ae",desc:"Leading international art fair in the region."},
  {title:"Dubai Food Festival",date:"2026-02-26",end:"2026-03-14",cat:"Food",venue:"Dubai",url:"",desc:"Annual celebration of Dubai's diverse food culture."},
  {title:"UAE National Day",date:"2025-12-02",end:"2025-12-03",cat:"National",venue:"UAE-wide",url:"",desc:"54th UAE National Day celebrations."},
  {title:"Ramadan 2026",date:"2026-02-28",end:"2026-03-29",cat:"Cultural",venue:"UAE-wide",url:"",desc:"Holy month - key marketing & campaign season."},
];

function getUpcomingEvents(days=90){
  const now=new Date();
  const future=new Date(now.getTime()+days*86400000);
  return UAE_EVENTS.filter(e=>{
    const d=new Date(e.date);
    return d>=now&&d<=future;
  }).sort((a,b)=>new Date(a.date)-new Date(b.date));
}

function daysUntil(dateStr){
  const d=new Date(dateStr);
  const now=new Date();
  now.setHours(0,0,0,0);
  return Math.ceil((d-now)/86400000);
}

// ── UI PRIMITIVES ─────────────────────────────────────────────────────────────
function Pill({children,c,size="sm"}){const t=useContext(Ctx);const pad=size==="lg"?"5px 14px":"3px 10px";const fs=size==="lg"?12:11;return <span style={{padding:pad,borderRadius:20,fontSize:fs,fontWeight:700,background:(c||t.bl)+"22",color:c||t.bl,whiteSpace:"nowrap"}}>{children}</span>}
function KPI({l,v,s,p=true,icon,c}){const t=useContext(Ctx);return <div style={{background:t.s1,borderRadius:16,padding:"18px 20px",border:"1px solid "+t.bd,flex:1,minWidth:140,position:"relative",overflow:"hidden"}}><div style={{position:"absolute",top:0,left:0,right:0,height:3,background:c||(p?t.gn:t.am),borderRadius:"16px 16px 0 0"}}/><div style={{fontSize:11,color:t.td,textTransform:"uppercase",letterSpacing:1,marginBottom:6,fontWeight:700}}>{icon&&<span style={{marginRight:5}}>{icon}</span>}{l}</div><div style={{fontSize:24,fontWeight:800,color:t.tw,lineHeight:1.1}}>{v}</div>{s&&<div style={{marginTop:5,fontSize:12,color:p?t.gn:t.am,fontWeight:500}}>{s}</div>}</div>}
function Card({children,style={}}){const t=useContext(Ctx);return <div style={{background:t.s1,borderRadius:16,border:"1px solid "+t.bd,overflow:"hidden",...style}}>{children}</div>}
function CH({title,right,sub}){const t=useContext(Ctx);return <div style={{padding:"16px 20px",borderBottom:"1px solid "+t.bd,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}><div><div style={{fontSize:15,fontWeight:700,color:t.tw}}>{title}</div>{sub&&<div style={{fontSize:11,color:t.td,marginTop:2}}>{sub}</div>}</div>{right}</div>}
function Btn({a,l,onClick,c}){const t=useContext(Ctx);return <button onClick={onClick} style={{padding:"5px 14px",borderRadius:8,border:"none",background:a?(c||t.bl):"transparent",color:a?"#fff":t.tm,fontSize:12,fontWeight:600,cursor:"pointer",transition:"all .15s"}}>{l}</button>}
function AB({onClick,l="+ Add",c}){const t=useContext(Ctx);return <button onClick={onClick} style={{padding:"7px 16px",borderRadius:10,border:"none",background:c||t.bl,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>{l}</button>}
function DB({onClick}){return <button onClick={onClick} style={{padding:"3px 8px",borderRadius:6,border:"none",background:"transparent",color:"#EF4444",fontSize:12,cursor:"pointer",opacity:.4}} onMouseEnter={e=>e.target.style.opacity=1} onMouseLeave={e=>e.target.style.opacity=.4}>✕</button>}
function EB({onClick}){return <button onClick={onClick} style={{padding:"3px 8px",borderRadius:6,border:"none",background:"transparent",color:"#60A5FA",fontSize:12,cursor:"pointer",opacity:.4}} onMouseEnter={e=>e.target.style.opacity=1} onMouseLeave={e=>e.target.style.opacity=.4}>✎</button>}
function Modal({open,onClose,title,children,wide}){const t=useContext(Ctx);if(!open)return null;return <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,padding:16}} onClick={onClose}><div onClick={e=>e.stopPropagation()} style={{background:t.s1,borderRadius:20,border:"1px solid "+t.bd,padding:28,width:wide?700:460,maxHeight:"85vh",overflow:"auto"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:20}}><div style={{fontSize:19,fontWeight:800,color:t.tw}}>{title}</div><div onClick={onClose} style={{cursor:"pointer",color:t.td,fontSize:22,lineHeight:1}}>&times;</div></div>{children}</div></div>}
function F({l,v,onChange,type="text",opts,rows}){const t=useContext(Ctx);const s={width:"100%",padding:"9px 12px",borderRadius:10,border:"1px solid "+t.bd,background:t.s2,color:t.tx,fontSize:13,outline:"none",boxSizing:"border-box"};return <div style={{marginBottom:13}}><div style={{fontSize:12,color:t.tm,marginBottom:5,fontWeight:600}}>{l}</div>{opts?<select value={v} onChange={e=>onChange(e.target.value)} style={s}>{opts.map(o=><option key={o} value={o}>{o}</option>)}</select>:rows?<textarea value={v} onChange={e=>onChange(e.target.value)} rows={rows} style={{...s,resize:"vertical"}}/>:<input type={type} value={v} onChange={e=>onChange(e.target.value)} style={s}/>}</div>}
function SB({onClick,loading,l="Save"}){const t=useContext(Ctx);return <button onClick={onClick} disabled={loading} style={{width:"100%",padding:"11px",borderRadius:10,border:"none",background:t.bl,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",marginTop:10,opacity:loading?.6:1}}>{loading?"Saving...":l}</button>}

// ── CHARTS ────────────────────────────────────────────────────────────────────
function VBar({data,h=120}){
  const t=useContext(Ctx);
  if(!data||!data.length)return null;
  const mx=Math.max(...data.map(d=>d.v),1);
  const bw=32,gap=10,padX=6;
  const W=data.length*(bw+gap)+padX*2;
  return <svg width="100%" viewBox={"0 0 "+W+" "+(h+32)} preserveAspectRatio="xMidYMid meet" style={{display:"block"}}>
    {data.map((d,i)=>{
      const x=padX+i*(bw+gap);
      const bh=Math.max((d.v/mx)*(h-10),d.v>0?4:0);
      const y=h-bh;
      return <g key={i}>
        <rect x={x} y={h} width={bw} height={2} fill={t.bd} rx={1}/>
        <rect x={x} y={y} width={bw} height={bh} fill={d.c||t.bl} rx={6} opacity={.9}/>
        {d.v>0&&<text x={x+bw/2} y={y-5} textAnchor="middle" fontSize={10} fill={t.tm} fontWeight="700">{d.v}</text>}
        <text x={x+bw/2} y={h+18} textAnchor="middle" fontSize={9} fill={t.td}>{String(d.k).length>7?String(d.k).slice(0,7)+"..":d.k}</text>
      </g>;
    })}
  </svg>;
}

function HBar({data,h=20,showVal=true}){
  const t=useContext(Ctx);
  if(!data||!data.length)return null;
  const mx=Math.max(...data.map(d=>d.v),1);
  return <div style={{display:"flex",flexDirection:"column",gap:10}}>
    {data.map((d,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:10}}>
      <div style={{width:100,fontSize:11,color:t.tw,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flexShrink:0}}>{d.k}</div>
      <div style={{flex:1,height:h,background:t.s3,borderRadius:4,overflow:"hidden"}}>
        <div style={{height:"100%",width:(d.v/mx*100)+"%",background:d.c||t.bl,borderRadius:4,opacity:.9}}/>
      </div>
      {showVal&&<div style={{width:56,textAlign:"right",fontSize:11,fontWeight:700,color:t.tw,flexShrink:0}}>{typeof d.v==="number"&&d.v>999?d.v.toLocaleString():d.v}</div>}
    </div>)}
  </div>;
}

function Donut({data,size=120}){
  const t=useContext(Ctx);
  const total=data.reduce((a,d)=>a+d.v,0)||1;
  const cx=size/2,cy=size/2,r=size*.42,ir=size*.26;
  let angle=-Math.PI/2;
  const slices=data.filter(d=>d.v>0).map(d=>{
    const sweep=(d.v/total)*Math.PI*2;
    const x1=cx+r*Math.cos(angle),y1=cy+r*Math.sin(angle);
    angle+=sweep;
    const x2=cx+r*Math.cos(angle),y2=cy+r*Math.sin(angle);
    const ix1=cx+ir*Math.cos(angle-sweep),iy1=cy+ir*Math.sin(angle-sweep);
    const ix2=cx+ir*Math.cos(angle),iy2=cy+ir*Math.sin(angle);
    const lg=sweep>Math.PI?1:0;
    return{path:"M "+x1+" "+y1+" A "+r+" "+r+" 0 "+lg+" 1 "+x2+" "+y2+" L "+ix2+" "+iy2+" A "+ir+" "+ir+" 0 "+lg+" 0 "+ix1+" "+iy1+" Z",c:d.c,v:d.v,k:d.k};
  });
  return <div style={{display:"flex",alignItems:"center",gap:20}}>
    <svg width={size} height={size} viewBox={"0 0 "+size+" "+size} style={{flexShrink:0}}>
      {slices.map((s,i)=><path key={i} d={s.path} fill={s.c} opacity={.92}/>)}
      <text x={cx} y={cy-6} textAnchor="middle" fontSize={16} fontWeight="800" fill={t.tw}>{total.toLocaleString()}</text>
      <text x={cx} y={cy+11} textAnchor="middle" fontSize={9} fill={t.td}>total</text>
    </svg>
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      {data.map((d,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:8,fontSize:12}}>
        <div style={{width:10,height:10,borderRadius:3,background:d.c,flexShrink:0}}/>
        <span style={{color:t.tw,fontWeight:700,minWidth:24}}>{d.v}</span>
        <span style={{color:t.td}}>{d.k}</span>
        <span style={{color:t.td,fontSize:10}}>({Math.round(d.v/total*100)}%)</span>
      </div>)}
    </div>
  </div>;
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
function DashPage({ld,inv,qt,exp}){
  const t=useContext(Ctx);
  const tr=inv.reduce((a,f)=>a+(f.revenue||0),0);
  const tp=inv.reduce((a,f)=>a+(f.amount_paid||0),0);
  const pi={};ld.forEach(l=>pi[l.stage]=(pi[l.stage]||0)+1);
  const qs={};qt.forEach(q=>qs[q.status]=(qs[q.status]||0)+1);
  const cr={};inv.forEach(f=>cr[f.client]=(cr[f.client]||0)+(f.revenue||0));
  const tc=Object.entries(cr).sort((a,b)=>b[1]-a[1]).slice(0,6);
  const mx=tc[0]?.[1]||1;
  const pD=STG.map(s=>({k:s,c:sC(s),v:pi[s]||0}));
  const tot=pD.reduce((a,d)=>a+d.v,0);
  const vt={};inv.forEach(f=>vt[f.vertical||"Other"]=(vt[f.vertical||"Other"]||0)+(f.revenue||0));
  const tvArr=Object.entries(vt).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([k,v])=>({k,v,c:t.tl}));
  const collRate=tr>0?Math.round(tp/tr*100):0;
  const upcoming=getUpcomingEvents(60);
  const qDonut=[{k:"Awarded",v:qs.Awarded||0,c:t.gn},{k:"Dropped",v:qs.Dropped||0,c:t.td},{k:"Lost",v:qs.Lost||0,c:t.rd},{k:"Pending",v:qs.Pending||0,c:t.am}];
  const now=new Date();
  const hour=now.getHours();
  const greeting=hour<12?"Good morning":"hour<17"?"Good afternoon":"Good evening";
  const greet=hour<12?"Good morning ☀️":hour<17?"Good afternoon 🌤":"Good evening 🌙";
  const pendingInv=inv.filter(f=>(f.revenue-f.amount_paid)>0).length;
  const hotLeads=ld.filter(l=>l.stage==="Commit"||l.stage==="Funnel").length;
  return <div style={{display:"flex",flexDirection:"column",gap:18}}>
    {/* Morning briefing */}
    <div style={{background:"linear-gradient(135deg,"+t.bl+"22,"+t.pr+"22)",border:"1px solid "+t.bl+"33",borderRadius:20,padding:"20px 24px"}}>
      <div style={{fontSize:20,fontWeight:800,color:t.tw,marginBottom:6}}>{greet}, Bader</div>
      <div style={{fontSize:13,color:t.tm,marginBottom:16}}>Here's what needs your attention today — {new Date().toLocaleDateString("en-AE",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</div>
      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
        {hotLeads>0&&<div style={{background:t.am+"22",border:"1px solid "+t.am+"44",borderRadius:12,padding:"8px 16px",fontSize:12,color:t.am,fontWeight:700}}>🔥 {hotLeads} hot leads need action</div>}
        {pendingInv>0&&<div style={{background:t.rd+"22",border:"1px solid "+t.rd+"44",borderRadius:12,padding:"8px 16px",fontSize:12,color:t.rd,fontWeight:700}}>💰 {pendingInv} unpaid invoices</div>}
        {upcoming.length>0&&<div style={{background:t.tl+"22",border:"1px solid "+t.tl+"44",borderRadius:12,padding:"8px 16px",fontSize:12,color:t.tl,fontWeight:700}}>📅 {upcoming[0].title} in {daysUntil(upcoming[0].date)} days</div>}
        {(qs.Pending||0)>0&&<div style={{background:t.pr+"22",border:"1px solid "+t.pr+"44",borderRadius:12,padding:"8px 16px",fontSize:12,color:t.pr,fontWeight:700}}>📋 {qs.Pending} quotations pending</div>}
      </div>
    </div>

    {/* KPIs */}
    <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
      <KPI l="Total Revenue" v={tr.toLocaleString()+" AED"} s={"Collected: "+tp.toLocaleString()} p c={t.gn}/>
      <KPI l="Outstanding" v={(tr-tp).toLocaleString()+" AED"} s={pendingInv+" invoices pending"} p={tr-tp===0} c={tr-tp>0?t.rd:t.gn}/>
      <KPI l="Pipeline" v={tot+" deals"} s={(pi.Awarded||0)+" awarded · "+(pi.Commit||0)+" commit"} p c={t.bl}/>
      <KPI l="Monthly Expenses" v={exp.reduce((a,e)=>a+(e.amount||0),0).toLocaleString()+" AED"} p={false} c={t.am}/>
    </div>

    {/* Charts row */}
    <div style={{display:"grid",gridTemplateColumns:"1.2fr 1fr",gap:14}}>
      <Card><CH title="Pipeline by stage" sub={tot+" total deals"}/>
        <div style={{padding:"16px 20px 8px"}}><VBar data={pD} h={120}/></div>
      </Card>
      <Card><CH title="Collection rate"/>
        <div style={{padding:"20px"}}>
          <div style={{display:"flex",alignItems:"flex-end",gap:8,marginBottom:14}}>
            <div style={{fontSize:42,fontWeight:900,color:collRate>=80?t.gn:collRate>=50?t.am:t.rd,lineHeight:1}}>{collRate}%</div>
            <div style={{fontSize:13,color:t.td,paddingBottom:6}}>collected</div>
          </div>
          <div style={{height:12,background:t.s3,borderRadius:6,overflow:"hidden",marginBottom:16}}>
            <div style={{height:"100%",width:collRate+"%",background:collRate>=80?"linear-gradient(90deg,"+t.gn+",#34D399)":collRate>=50?"linear-gradient(90deg,"+t.am+",#FCD34D)":"linear-gradient(90deg,"+t.rd+",#F87171)",borderRadius:6}}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:13}}>
            <div><div style={{color:t.td,marginBottom:3,fontSize:11}}>Collected</div><div style={{fontWeight:800,color:t.gn}}>{tp.toLocaleString()} AED</div></div>
            <div style={{textAlign:"right"}}><div style={{color:t.td,marginBottom:3,fontSize:11}}>Outstanding</div><div style={{fontWeight:800,color:t.rd}}>{(tr-tp).toLocaleString()} AED</div></div>
          </div>
        </div>
      </Card>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
      <Card><CH title="Quotations breakdown"/>
        <div style={{padding:"16px 20px"}}><Donut data={qDonut} size={130}/></div>
      </Card>
      <Card><CH title="Revenue by vertical"/>
        <div style={{padding:"16px 20px"}}><HBar data={tvArr} h={22}/></div>
      </Card>
    </div>

    {/* Top clients + Upcoming UAE events */}
    <div style={{display:"grid",gridTemplateColumns:"1.2fr 1fr",gap:14}}>
      <Card><CH title="Top clients by revenue"/>
        <div style={{padding:"6px 20px 12px"}}>
          {tc.map(([cl,v],i)=><div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid "+t.bd}}>
            <div style={{width:22,fontSize:12,fontWeight:800,color:t.td}}>#{i+1}</div>
            <div style={{flex:1,fontSize:13,fontWeight:700,color:t.tw,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{cl}</div>
            <div style={{flex:2,height:6,background:t.s3,borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",background:"linear-gradient(90deg,"+t.tl+","+t.bl+")",borderRadius:3,width:(v/mx*100)+"%"}}/></div>
            <div style={{minWidth:70,textAlign:"right",fontSize:12,fontWeight:800,color:t.tw}}>{v.toLocaleString()}</div>
          </div>)}
        </div>
      </Card>
      <Card><CH title="🇦🇪 Upcoming UAE Events" sub="Next 60 days"/>
        <div style={{maxHeight:280,overflow:"auto"}}>
          {upcoming.slice(0,6).map((ev,i)=>{
            const days=daysUntil(ev.date);
            return <div key={i} style={{padding:"10px 20px",borderBottom:"1px solid "+t.bd,display:"flex",gap:12,alignItems:"flex-start"}}>
              <div style={{textAlign:"center",minWidth:36,flexShrink:0}}>
                <div style={{fontSize:20,fontWeight:900,color:days<=7?t.rd:days<=14?t.am:t.bl,lineHeight:1}}>{days}</div>
                <div style={{fontSize:9,color:t.td}}>days</div>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12,fontWeight:700,color:t.tw,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ev.title}</div>
                <div style={{fontSize:10,color:t.td}}>{ev.venue}</div>
              </div>
              <Pill c={t.tl}>{ev.cat}</Pill>
            </div>;
          })}
        </div>
      </Card>
    </div>
  </div>;
}

// ── SALES ─────────────────────────────────────────────────────────────────────
function SalesPage({ld,rl}){
  const t=useContext(Ctx);
  const[fi,sfi]=useState("All");const[se,sse]=useState("");const[mo,smo]=useState(false);
  const dF={client:"",vertical:"",contact_person:"",email:"",stage:"Prospect",notes:""};
  const[fo,sfo]=useState(dF);const[sv,ssv]=useState(false);const[er,ser]=useState(null);
  let ls=ld;if(fi!=="All")ls=ls.filter(s=>s.stage===fi);if(se)ls=ls.filter(s=>(s.client+s.contact_person+s.vertical).toLowerCase().includes(se.toLowerCase()));
  const pi={};ld.forEach(l=>pi[l.stage]=(pi[l.stage]||0)+1);
  const pD=STG.map(s=>({k:s,c:sC(s),v:pi[s]||0}));
  const vt={};ld.forEach(l=>vt[l.vertical||"Other"]=(vt[l.vertical||"Other"]||0)+1);
  const vtArr=Object.entries(vt).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([k,v])=>({k,v,c:t.bl}));
  const openAdd=()=>{ser(null);sfo(dF);smo(true)};
  const openEdit=r=>{ser(r);sfo({client:r.client||"",vertical:r.vertical||"",contact_person:r.contact_person||"",email:r.email||"",stage:r.stage||"Prospect",notes:r.notes||""});smo(true)};
  const save=async()=>{if(!fo.client.trim())return;ssv(true);if(er){await supabase.from("leads").update(fo).eq("id",er.id)}else{await supabase.from("leads").insert([fo])}ssv(false);smo(false);ser(null);sfo(dF);rl()};
  const del=async id=>{if(!confirm("Delete this lead?"))return;await supabase.from("leads").delete().eq("id",id);rl()};
  return <div style={{display:"flex",flexDirection:"column",gap:16}}>
    <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
      <KPI l="Total leads" v={ld.length} s={(pi.Awarded||0)+" awarded"} p c={t.gn}/>
      <KPI l="Active pipeline" v={(pi.Prospect||0)+(pi.Funnel||0)+(pi.Upside||0)+(pi.Commit||0)} s="Active deals" p c={t.bl}/>
      <KPI l="Win rate" v={ld.length?((pi.Awarded||0)/ld.length*100).toFixed(0)+"%":"0%"} p c={t.tl}/>
      <KPI l="Lost + Dropped" v={(pi.Lost||0)+(pi.Dropped||0)} p={false} c={t.rd}/>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1.3fr 1fr",gap:14}}>
      <Card><CH title="Pipeline stages"/>
        <div style={{padding:"16px 20px 8px"}}><VBar data={pD} h={120}/></div>
      </Card>
      <Card><CH title="Leads by vertical"/>
        <div style={{padding:"16px 20px"}}><HBar data={vtArr} h={20}/></div>
      </Card>
    </div>
    <Card>
      <CH title={"Leads ("+ls.length+")"} right={
        <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
          <input placeholder="Search..." value={se} onChange={e=>sse(e.target.value)} style={{background:t.bg,border:"1px solid "+t.bd,borderRadius:8,padding:"6px 12px",color:t.tx,fontSize:12,width:160,outline:"none"}}/>
          <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
            {["All",...STG].map(s=><Btn key={s} a={fi===s} l={s} onClick={()=>sfi(s)}/>)}
          </div>
          <AB onClick={openAdd} l="+ Add Lead"/>
        </div>
      }/>
      <div style={{maxHeight:480,overflow:"auto"}}>
        {ls.map((s,i)=><div key={s.id||i} style={{display:"flex",alignItems:"center",padding:"11px 20px",borderBottom:"1px solid "+t.bd,gap:12}} onMouseEnter={e=>e.currentTarget.style.background=t.s3} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
          <div style={{width:36,height:36,borderRadius:10,background:sC(s.stage)+"22",display:"flex",alignItems:"center",justifyContent:"center",color:sC(s.stage),fontWeight:800,fontSize:14,flexShrink:0}}>{(s.client||"?")[0]}</div>
          <div style={{flex:2,minWidth:0}}>
            <div style={{fontWeight:700,color:t.tw,fontSize:13}}>{s.client}</div>
            <div style={{fontSize:11,color:t.td}}>{s.contact_person}{s.vertical?" · "+s.vertical:""}</div>
          </div>
          <Pill c={sC(s.stage)}>{s.stage}</Pill>
          {s.id&&<><EB onClick={()=>openEdit(s)}/><DB onClick={()=>del(s.id)}/></>}
        </div>)}
      </div>
    </Card>
    <Modal open={mo} onClose={()=>smo(false)} title={er?"Edit Lead":"Add New Lead"}>
      <F l="Client / Company" v={fo.client} onChange={v=>sfo({...fo,client:v})}/>
      <F l="Vertical / Industry" v={fo.vertical} onChange={v=>sfo({...fo,vertical:v})}/>
      <F l="Contact Person" v={fo.contact_person} onChange={v=>sfo({...fo,contact_person:v})}/>
      <F l="Email" v={fo.email} onChange={v=>sfo({...fo,email:v})}/>
      <F l="Stage" v={fo.stage} onChange={v=>sfo({...fo,stage:v})} opts={STG}/>
      <F l="Notes" v={fo.notes||""} onChange={v=>sfo({...fo,notes:v})} rows={3}/>
      <SB onClick={save} loading={sv}/>
    </Modal>
  </div>;
}

// ── CASH FLOW ─────────────────────────────────────────────────────────────────
function CashPage({inv,rl}){
  const t=useContext(Ctx);
  const[se,sse]=useState("");const[mo,smo]=useState(false);
  const dF={client:"",vertical:"",revenue:0,amount_paid:0};
  const[fo,sfo]=useState(dF);const[sv,ssv]=useState(false);const[er,ser]=useState(null);
  let ls=inv;if(se)ls=ls.filter(f=>(f.client||"").toLowerCase().includes(se.toLowerCase()));
  const tr=inv.reduce((a,f)=>a+(f.revenue||0),0);
  const tp=inv.reduce((a,f)=>a+(f.amount_paid||0),0);
  const vt={};inv.forEach(f=>vt[f.vertical||"Other"]=(vt[f.vertical||"Other"]||0)+(f.revenue||0));
  const tvArr=Object.entries(vt).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([k,v])=>({k,v,c:t.tl}));
  const cr={};inv.forEach(f=>{if(!cr[f.client])cr[f.client]={r:0,p:0};cr[f.client].r+=f.revenue||0;cr[f.client].p+=f.amount_paid||0;});
  const top5=Object.entries(cr).sort((a,b)=>b[1].r-a[1].r).slice(0,5);
  const openAdd=()=>{ser(null);sfo(dF);smo(true)};
  const openEdit=r=>{ser(r);sfo({client:r.client||"",vertical:r.vertical||"",revenue:r.revenue||0,amount_paid:r.amount_paid||0});smo(true)};
  const save=async()=>{if(!fo.client.trim())return;ssv(true);const d={...fo,revenue:Number(fo.revenue),amount_paid:Number(fo.amount_paid),due_payment:Number(fo.revenue)-Number(fo.amount_paid)};if(er){await supabase.from("invoices").update(d).eq("id",er.id)}else{await supabase.from("invoices").insert([d])}ssv(false);smo(false);ser(null);sfo(dF);rl()};
  const del=async id=>{if(!confirm("Delete?"))return;await supabase.from("invoices").delete().eq("id",id);rl()};
  return <div style={{display:"flex",flexDirection:"column",gap:16}}>
    <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
      <KPI l="Total Revenue" v={tr.toLocaleString()+" AED"} s={inv.length+" invoices"} p c={t.gn}/>
      <KPI l="Collected" v={tp.toLocaleString()+" AED"} s={tr?(tp/tr*100).toFixed(0)+"%":"0%"} p c={t.tl}/>
      <KPI l="Outstanding" v={(tr-tp).toLocaleString()+" AED"} p={tr-tp===0} c={tr-tp>0?t.rd:t.gn}/>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
      <Card><CH title="Revenue by vertical"/>
        <div style={{padding:"16px 20px"}}><HBar data={tvArr} h={22}/></div>
      </Card>
      <Card><CH title="Top 5 — Revenue vs Collected"/>
        <div style={{padding:"12px 20px"}}>
          {top5.map(([cl,v],i)=><div key={i} style={{marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
              <span style={{fontWeight:700,color:t.tw,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:120}}>{cl}</span>
              <span style={{color:t.td,flexShrink:0}}>{v.r.toLocaleString()} AED</span>
            </div>
            <div style={{height:8,background:t.s3,borderRadius:4,overflow:"hidden",marginBottom:3}}>
              <div style={{height:"100%",width:(v.r/(top5[0][1].r||1)*100)+"%",background:t.tl,borderRadius:4}}/>
            </div>
            <div style={{height:6,background:t.s3,borderRadius:3,overflow:"hidden"}}>
              <div style={{height:"100%",width:(v.p/(top5[0][1].r||1)*100)+"%",background:t.gn,borderRadius:3}}/>
            </div>
          </div>)}
          <div style={{display:"flex",gap:16,marginTop:8}}>
            <div style={{display:"flex",alignItems:"center",gap:5,fontSize:10,color:t.td}}><div style={{width:10,height:4,background:t.tl,borderRadius:2}}/> Revenue</div>
            <div style={{display:"flex",alignItems:"center",gap:5,fontSize:10,color:t.td}}><div style={{width:10,height:4,background:t.gn,borderRadius:2}}/> Collected</div>
          </div>
        </div>
      </Card>
    </div>
    <Card>
      <CH title={"Invoices ("+ls.length+")"} right={
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <input placeholder="Search client..." value={se} onChange={e=>sse(e.target.value)} style={{background:t.bg,border:"1px solid "+t.bd,borderRadius:8,padding:"6px 12px",color:t.tx,fontSize:12,width:160,outline:"none"}}/>
          <AB onClick={openAdd} l="+ Add"/>
        </div>
      }/>
      <div style={{display:"flex",padding:"7px 20px",borderBottom:"1px solid "+t.bd,fontSize:10,color:t.td,fontWeight:700,textTransform:"uppercase",letterSpacing:.5}}>
        <div style={{flex:2}}>Client</div><div style={{flex:1}}>Vertical</div>
        <div style={{width:90,textAlign:"right"}}>Revenue</div>
        <div style={{width:90,textAlign:"right"}}>Collected</div>
        <div style={{width:80,textAlign:"right"}}>Due</div>
        <div style={{width:56}}/>
      </div>
      <div style={{maxHeight:380,overflow:"auto"}}>
        {ls.map((f,i)=><div key={f.id||i} style={{display:"flex",alignItems:"center",padding:"10px 20px",borderBottom:"1px solid "+t.bd,fontSize:13}} onMouseEnter={e=>e.currentTarget.style.background=t.s3} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
          <div style={{flex:2,fontWeight:600,color:t.tw}}>{f.client}</div>
          <div style={{flex:1,color:t.td,fontSize:12}}>{f.vertical}</div>
          <div style={{width:90,textAlign:"right",color:t.gn,fontWeight:700}}>{(f.revenue||0).toLocaleString()}</div>
          <div style={{width:90,textAlign:"right",color:t.tx}}>{(f.amount_paid||0).toLocaleString()}</div>
          <div style={{width:80,textAlign:"right",color:(f.revenue-f.amount_paid)>0?t.rd:t.td,fontWeight:700}}>{(f.revenue-f.amount_paid)>0?(f.revenue-f.amount_paid).toLocaleString():"—"}</div>
          <div style={{width:56,display:"flex",gap:2}}>{f.id&&<><EB onClick={()=>openEdit(f)}/><DB onClick={()=>del(f.id)}/></>}</div>
        </div>)}
      </div>
    </Card>
    <Modal open={mo} onClose={()=>smo(false)} title={er?"Edit Invoice":"Add Invoice"}>
      <F l="Client" v={fo.client} onChange={v=>sfo({...fo,client:v})}/>
      <F l="Vertical" v={fo.vertical} onChange={v=>sfo({...fo,vertical:v})}/>
      <F l="Revenue (AED)" v={fo.revenue} onChange={v=>sfo({...fo,revenue:v})} type="number"/>
      <F l="Collected (AED)" v={fo.amount_paid} onChange={v=>sfo({...fo,amount_paid:v})} type="number"/>
      <SB onClick={save} loading={sv}/>
    </Modal>
  </div>;
}

// ── INFLUENCERS ───────────────────────────────────────────────────────────────
function InfPage({inf,rl}){
  const t=useContext(Ctx);
  const[ti,sti]=useState("All");const[se,sse]=useState("");const[mo,smo]=useState(false);
  const dF={name:"",handle:"",category:"",city:"Dubai",nationality:"",ig_followers:"0",tiktok_followers:"0",youtube_followers:"0",total_reach:"0",engagement:0,tier:"Micro"};
  const[fo,sfo]=useState(dF);const[sv,ssv]=useState(false);const[er,ser]=useState(null);
  const tiers=["All","Mega","Macro","Mid","Micro"];
  const tC={Mega:t.pr,Macro:t.bl,Mid:t.tl,Micro:t.gn};
  let ls=inf;if(ti!=="All")ls=ls.filter(i=>i.tier===ti);if(se)ls=ls.filter(i=>(i.name+i.category+i.handle).toLowerCase().includes(se.toLowerCase()));
  const tc={};inf.forEach(i=>tc[i.tier]=(tc[i.tier]||0)+1);
  const tierDonut=[{k:"Mega",v:tc.Mega||0,c:t.pr},{k:"Macro",v:tc.Macro||0,c:t.bl},{k:"Mid",v:tc.Mid||0,c:t.tl},{k:"Micro",v:tc.Micro||0,c:t.gn}];
  const openAdd=()=>{ser(null);sfo(dF);smo(true)};
  const openEdit=r=>{ser(r);sfo({name:r.name||"",handle:r.handle||"",category:r.category||"",city:r.city||"Dubai",nationality:r.nationality||"",ig_followers:r.ig_followers||"0",tiktok_followers:r.tiktok_followers||"0",youtube_followers:r.youtube_followers||"0",total_reach:r.total_reach||"0",engagement:r.engagement||0,tier:r.tier||"Micro"});smo(true)};
  const save=async()=>{if(!fo.name.trim())return;ssv(true);const d={...fo,engagement:Number(fo.engagement)};if(er){await supabase.from("influencers").update(d).eq("id",er.id)}else{await supabase.from("influencers").insert([d])}ssv(false);smo(false);ser(null);sfo(dF);rl()};
  const del=async id=>{if(!confirm("Delete?"))return;await supabase.from("influencers").delete().eq("id",id);rl()};
  return <div style={{display:"flex",flexDirection:"column",gap:16}}>
    <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
      <KPI l="Total Influencers" v={inf.length.toLocaleString()} s="UAE database" p c={t.pr}/>
      <KPI l="Avg Engagement" v={inf.length?(inf.reduce((a,i)=>a+(i.engagement||0),0)/inf.length).toFixed(1)+"%":"0%"} p c={t.tl}/>
      <KPI l="Mega" v={tc.Mega||0} p c={t.pr}/>
      <KPI l="Micro" v={tc.Micro||0} p c={t.gn}/>
    </div>
    <Card><CH title="Influencers by tier"/>
      <div style={{padding:"16px 20px"}}><Donut data={tierDonut} size={130}/></div>
    </Card>
    <Card>
      <CH title={"Influencers ("+ls.length+")"} right={
        <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
          <input placeholder="Search..." value={se} onChange={e=>sse(e.target.value)} style={{background:t.bg,border:"1px solid "+t.bd,borderRadius:8,padding:"6px 12px",color:t.tx,fontSize:12,width:160,outline:"none"}}/>
          {tiers.map(x=><Btn key={x} a={ti===x} l={x} onClick={()=>sti(x)}/>)}
          <AB onClick={openAdd} l="+"/>
        </div>
      }/>
      <div style={{display:"flex",padding:"7px 20px",borderBottom:"1px solid "+t.bd,fontSize:10,color:t.td,fontWeight:700,textTransform:"uppercase",letterSpacing:.5}}>
        <div style={{flex:2}}>Influencer</div>
        <div style={{width:60,textAlign:"right"}}>IG</div>
        <div style={{width:60,textAlign:"right"}}>TikTok</div>
        <div style={{width:60,textAlign:"right"}}>YT</div>
        <div style={{width:70,textAlign:"right"}}>Reach</div>
        <div style={{width:50,textAlign:"right"}}>Eng%</div>
        <div style={{width:70}}>Tier</div>
        <div style={{width:56}}/>
      </div>
      <div style={{maxHeight:460,overflow:"auto"}}>
        {ls.map((n,i)=><div key={n.id||i} style={{display:"flex",alignItems:"center",padding:"10px 20px",borderBottom:"1px solid "+t.bd,gap:6,fontSize:12}} onMouseEnter={e=>e.currentTarget.style.background=t.s3} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
          <div style={{width:34,height:34,borderRadius:"50%",background:(tC[n.tier]||t.td)+"22",display:"flex",alignItems:"center",justifyContent:"center",color:tC[n.tier],fontWeight:800,fontSize:14,flexShrink:0}}>{(n.name||"?")[0]}</div>
          <div style={{flex:2,minWidth:0}}>
            <div style={{fontWeight:700,color:t.tw,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{n.name}</div>
            <div style={{fontSize:10,color:t.td}}>{n.handle} {n.category?"· "+n.category:""}</div>
          </div>
          <div style={{width:60,textAlign:"right",color:"#E1306C",fontWeight:700}}>{n.ig_followers||"—"}</div>
          <div style={{width:60,textAlign:"right",color:"#00F2EA",fontWeight:700}}>{n.tiktok_followers||"—"}</div>
          <div style={{width:60,textAlign:"right",color:"#FF0000",fontWeight:700}}>{n.youtube_followers||"—"}</div>
          <div style={{width:70,textAlign:"right",fontWeight:700,color:t.tw}}>{n.total_reach||"—"}</div>
          <div style={{width:50,textAlign:"right",color:(n.engagement||0)>=5?t.gn:(n.engagement||0)>=2?t.am:t.td,fontWeight:700}}>{n.engagement||0}%</div>
          <div style={{width:70}}><Pill c={tC[n.tier]}>{n.tier}</Pill></div>
          <div style={{width:56,display:"flex",gap:2}}>{n.id&&<><EB onClick={()=>openEdit(n)}/><DB onClick={()=>del(n.id)}/></>}</div>
        </div>)}
      </div>
    </Card>
    <Modal open={mo} onClose={()=>smo(false)} title={er?"Edit Influencer":"Add Influencer"}>
      <F l="Name" v={fo.name} onChange={v=>sfo({...fo,name:v})}/>
      <F l="Handle (@username)" v={fo.handle} onChange={v=>sfo({...fo,handle:v})}/>
      <F l="Category" v={fo.category} onChange={v=>sfo({...fo,category:v})}/>
      <F l="City" v={fo.city} onChange={v=>sfo({...fo,city:v})}/>
      <F l="Nationality" v={fo.nationality} onChange={v=>sfo({...fo,nationality:v})}/>
      <F l="IG Followers" v={fo.ig_followers} onChange={v=>sfo({...fo,ig_followers:v})}/>
      <F l="TikTok Followers" v={fo.tiktok_followers} onChange={v=>sfo({...fo,tiktok_followers:v})}/>
      <F l="YouTube Subscribers" v={fo.youtube_followers} onChange={v=>sfo({...fo,youtube_followers:v})}/>
      <F l="Engagement %" v={fo.engagement} onChange={v=>sfo({...fo,engagement:v})} type="number"/>
      <F l="Tier" v={fo.tier} onChange={v=>sfo({...fo,tier:v})} opts={["Mega","Macro","Mid","Micro"]}/>
      <SB onClick={save} loading={sv}/>
    </Modal>
  </div>;
}

// ── QUOTATIONS ────────────────────────────────────────────────────────────────
function QuotPage({qt,rl}){
  const t=useContext(Ctx);
  const[fi,sfi]=useState("All");const[se,sse]=useState("");const[mo,smo]=useState(false);
  const dF={client:"",status:"Pending",value:0,notes:""};
  const[fo,sfo]=useState(dF);const[sv,ssv]=useState(false);const[er,ser]=useState(null);
  const sts=["All","Awarded","Dropped","Lost","Pending"];
  let ls=qt;if(fi!=="All")ls=ls.filter(q=>q.status===fi);if(se)ls=ls.filter(q=>(q.client||"").toLowerCase().includes(se.toLowerCase()));
  const qs={};qt.forEach(q=>qs[q.status]=(qs[q.status]||0)+1);
  const qDonut=[{k:"Awarded",v:qs.Awarded||0,c:t.gn},{k:"Dropped",v:qs.Dropped||0,c:t.td},{k:"Lost",v:qs.Lost||0,c:t.rd},{k:"Pending",v:qs.Pending||0,c:t.am}];
  const openAdd=()=>{ser(null);sfo(dF);smo(true)};
  const openEdit=r=>{ser(r);sfo({client:r.client||"",status:r.status||"Pending",value:r.value||0,notes:r.notes||""});smo(true)};
  const save=async()=>{if(!fo.client.trim())return;ssv(true);const d={...fo,value:Number(fo.value)};if(er){await supabase.from("quotations").update(d).eq("id",er.id)}else{await supabase.from("quotations").insert([d])}ssv(false);smo(false);ser(null);sfo(dF);rl()};
  const del=async id=>{if(!confirm("Delete?"))return;await supabase.from("quotations").delete().eq("id",id);rl()};
  const stC={Awarded:t.gn,Dropped:t.td,Lost:t.rd,Pending:t.am};
  return <div style={{display:"flex",flexDirection:"column",gap:16}}>
    <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
      <KPI l="Total" v={qt.length} p c={t.bl}/>
      <KPI l="Awarded" v={qs.Awarded||0} s={qt.length?((qs.Awarded||0)/qt.length*100).toFixed(0)+"% win rate":""} p c={t.gn}/>
      <KPI l="Pending" v={qs.Pending||0} p c={t.am}/>
      <KPI l="Dropped + Lost" v={(qs.Dropped||0)+(qs.Lost||0)} p={false} c={t.rd}/>
    </div>
    <Card><CH title="Quotation breakdown"/>
      <div style={{padding:"16px 20px"}}><Donut data={qDonut} size={130}/></div>
    </Card>
    <Card>
      <CH title={"Quotations ("+ls.length+")"} right={
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          <input placeholder="Search client..." value={se} onChange={e=>sse(e.target.value)} style={{background:t.bg,border:"1px solid "+t.bd,borderRadius:8,padding:"6px 12px",color:t.tx,fontSize:12,width:160,outline:"none"}}/>
          {sts.map(s=><Btn key={s} a={fi===s} l={s} onClick={()=>sfi(s)}/>)}
          <AB onClick={openAdd} l="+"/>
        </div>
      }/>
      <div style={{maxHeight:480,overflow:"auto"}}>
        {ls.map((q,i)=><div key={q.id||i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 20px",borderBottom:"1px solid "+t.bd}} onMouseEnter={e=>e.currentTarget.style.background=t.s3} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
          <div>
            <div style={{fontSize:13,fontWeight:700,color:t.tw}}>{q.client}</div>
            {q.value>0&&<div style={{fontSize:11,color:t.td}}>{Number(q.value).toLocaleString()} AED</div>}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <Pill c={stC[q.status]||t.am}>{q.status}</Pill>
            {q.id&&<><EB onClick={()=>openEdit(q)}/><DB onClick={()=>del(q.id)}/></>}
          </div>
        </div>)}
      </div>
    </Card>
    <Modal open={mo} onClose={()=>smo(false)} title={er?"Edit Quotation":"Add Quotation"}>
      <F l="Client" v={fo.client} onChange={v=>sfo({...fo,client:v})}/>
      <F l="Value (AED)" v={fo.value} onChange={v=>sfo({...fo,value:v})} type="number"/>
      <F l="Status" v={fo.status} onChange={v=>sfo({...fo,status:v})} opts={["Awarded","Dropped","Lost","Pending"]}/>
      <F l="Notes" v={fo.notes||""} onChange={v=>sfo({...fo,notes:v})} rows={3}/>
      <SB onClick={save} loading={sv}/>
    </Modal>
  </div>;
}

// ── EXPENSES ──────────────────────────────────────────────────────────────────
function ExpPage({exp,rl}){
  const t=useContext(Ctx);
  const[mo,smo]=useState(false);
  const dF={item:"",amount:0};
  const[fo,sfo]=useState(dF);const[sv,ssv]=useState(false);const[er,ser]=useState(null);
  const total=exp.reduce((a,e)=>a+(e.amount||0),0);
  const expBars=[...exp].sort((a,b)=>(b.amount||0)-(a.amount||0)).map(e=>({k:e.item,v:e.amount||0,c:t.am}));
  const openAdd=()=>{ser(null);sfo(dF);smo(true)};
  const openEdit=r=>{ser(r);sfo({item:r.item||"",amount:r.amount||0});smo(true)};
  const save=async()=>{if(!fo.item.trim())return;ssv(true);const d={item:fo.item,amount:Number(fo.amount),frequency:"Monthly"};if(er){await supabase.from("expenses").update(d).eq("id",er.id)}else{await supabase.from("expenses").insert([d])}ssv(false);smo(false);ser(null);sfo(dF);rl()};
  const del=async id=>{if(!confirm("Delete?"))return;await supabase.from("expenses").delete().eq("id",id);rl()};
  return <div style={{display:"flex",flexDirection:"column",gap:16}}>
    <KPI l="Monthly Expenses" v={total.toLocaleString()+" AED"} s={exp.length+" line items"} p={false} c={t.am}/>
    <Card><CH title="Expense breakdown"/>
      <div style={{padding:"16px 20px"}}><HBar data={expBars} h={22}/></div>
    </Card>
    <Card><CH title="All Expenses" right={<AB onClick={openAdd} l="+ Add"/>}/>
      <div style={{padding:"0 20px"}}>
        {exp.map((e,i)=><div key={e.id||i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 0",borderBottom:"1px solid "+t.bd}} onMouseEnter={el=>el.currentTarget.style.background=t.s3} onMouseLeave={el=>el.currentTarget.style.background="transparent"}>
          <div style={{fontSize:13,fontWeight:600,color:t.tw}}>{e.item}</div>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <div style={{fontSize:15,fontWeight:800,color:t.am}}>{(e.amount||0).toLocaleString()} AED</div>
            {e.id&&<><EB onClick={()=>openEdit(e)}/><DB onClick={()=>del(e.id)}/></>}
          </div>
        </div>)}
      </div>
    </Card>
    <Modal open={mo} onClose={()=>smo(false)} title={er?"Edit Expense":"Add Expense"}>
      <F l="Item" v={fo.item} onChange={v=>sfo({...fo,item:v})}/>
      <F l="Amount (AED)" v={fo.amount} onChange={v=>sfo({...fo,amount:v})} type="number"/>
      <SB onClick={save} loading={sv}/>
    </Modal>
  </div>;
}

// ── CONTACTS ──────────────────────────────────────────────────────────────────
function ContactsPage(){
  const t=useContext(Ctx);
  const[rows,setRows]=useState([]);const[total,setTotal]=useState(0);
  const[se,sse]=useState("");const[query,setQuery]=useState("");
  const[page,setPage]=useState(0);const[loading,setLoading]=useState(true);
  const[mo,smo]=useState(false);const[er,ser]=useState(null);const[sv,ssv]=useState(false);
  const[tab,setTab]=useState("b2b");
  const PER=250;
  const dF={company:"",category:"",contact_person:"",position:"",email:"",phone:"",website:"",location:"Dubai",type:""};
  const[fo,sfo]=useState(dF);

  const fetch=useCallback(async(q,pg,tb)=>{
    setLoading(true);
    let qb=supabase.from("contacts").select("*",{count:"exact"});
    if(tb==="realestate"){qb=qb.eq("industry","Property Owner")}
    else if(tb==="b2b"){qb=qb.neq("industry","Property Owner")}
    if(q){qb=qb.or("company.ilike.%"+q+"%,email.ilike.%"+q+"%,category.ilike.%"+q+"%,contact_person.ilike.%"+q+"%")}
    qb=qb.order("id").range(pg*PER,(pg+1)*PER-1);
    const{data,count}=await qb;
    setRows(data||[]);if(count!==null)setTotal(count);
    setLoading(false);
  },[]);

  useEffect(()=>{fetch(query,page,tab)},[query,page,tab,fetch]);

  const doSearch=()=>{setPage(0);setQuery(se)};
  const openAdd=()=>{ser(null);sfo(dF);smo(true)};
  const openEdit=r=>{ser(r);sfo({company:r.company||"",category:r.category||"",contact_person:r.contact_person||"",position:r.position||"",email:r.email||"",phone:r.phone||"",website:r.website||"",location:r.location||"Dubai",type:r.type||""});smo(true)};
  const save=async()=>{if(!fo.company.trim())return;ssv(true);if(er){await supabase.from("contacts").update(fo).eq("id",er.id)}else{await supabase.from("contacts").insert([fo])}ssv(false);smo(false);ser(null);sfo(dF);fetch(query,page,tab)};
  const del=async id=>{if(!confirm("Delete?"))return;await supabase.from("contacts").delete().eq("id",id);fetch(query,page,tab)};
  const pages=Math.ceil(total/PER);

  return <div style={{display:"flex",flexDirection:"column",gap:16}}>
    <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
      <KPI l="Total contacts" v={total.toLocaleString()} s="in database" p c={t.bl}/>
      <KPI l="Showing" v={rows.length} s={"Page "+(page+1)+" of "+pages} p/>
    </div>
    {/* Tab switcher */}
    <div style={{display:"flex",gap:3,background:t.s2,borderRadius:12,padding:4,width:"fit-content"}}>
      {[{k:"all",l:"🌐 All Contacts"},{k:"b2b",l:"🏢 B2B / ABM"},{k:"realestate",l:"🏠 Real Estate"}].map(tb=>
        <button key={tb.k} onClick={()=>{setTab(tb.k);setPage(0);setQuery("");sse("");}} style={{padding:"8px 18px",borderRadius:9,border:"none",background:tab===tb.k?t.bl:"transparent",color:tab===tb.k?"#fff":t.tm,fontSize:12,fontWeight:700,cursor:"pointer"}}>{tb.l}</button>
      )}
    </div>
    <Card>
      <CH title={"Contacts ("+total.toLocaleString()+")"} right={
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          <input placeholder="Search company, email, category..." value={se} onChange={e=>sse(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doSearch()} style={{background:t.bg,border:"1px solid "+t.bd,borderRadius:8,padding:"6px 12px",color:t.tx,fontSize:12,width:240,outline:"none"}}/>
          <button onClick={doSearch} style={{padding:"6px 14px",borderRadius:8,border:"none",background:t.bl,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"}}>Search</button>
          {query&&<button onClick={()=>{sse("");setQuery("");setPage(0)}} style={{padding:"6px 12px",borderRadius:8,border:"none",background:"transparent",color:t.tm,fontSize:12,cursor:"pointer"}}>Clear</button>}
          <AB onClick={openAdd} l="+ Add"/>
        </div>
      }/>
      <div style={{display:"flex",padding:"7px 20px",borderBottom:"1px solid "+t.bd,fontSize:10,color:t.td,fontWeight:700,textTransform:"uppercase",letterSpacing:.5}}>
        <div style={{flex:2}}>Company</div><div style={{flex:1.5}}>Category</div>
        <div style={{flex:1.5}}>Contact</div><div style={{flex:2}}>Email</div>
        <div style={{flex:1}}>Phone</div><div style={{flex:1}}>Location</div>
        <div style={{width:60}}/>
      </div>
      <div style={{maxHeight:520,overflow:"auto"}}>
        {loading?<div style={{padding:40,textAlign:"center",color:t.td}}>Loading...</div>:
        rows.length===0?<div style={{padding:40,textAlign:"center",color:t.td}}>No contacts found</div>:
        rows.map((c,i)=><div key={c.id||i} style={{display:"flex",alignItems:"center",padding:"9px 20px",borderBottom:"1px solid "+t.bd,fontSize:12,gap:4}} onMouseEnter={e=>e.currentTarget.style.background=t.s3} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
          <div style={{flex:2,fontWeight:700,color:t.tw,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.company||"—"}</div>
          <div style={{flex:1.5,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.category?<Pill c={t.pr}>{c.category}</Pill>:"—"}</div>
          <div style={{flex:1.5,color:t.tm,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.contact_person||"—"}</div>
          <div style={{flex:2,color:t.bl,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.email||"—"}</div>
          <div style={{flex:1,color:t.tm,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.phone||"—"}</div>
          <div style={{flex:1,color:t.td,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.location||"—"}</div>
          <div style={{width:60,display:"flex",gap:2,flexShrink:0}}><EB onClick={()=>openEdit(c)}/><DB onClick={()=>del(c.id)}/></div>
        </div>)}
      </div>
      {pages>1&&<div style={{padding:"10px 20px",borderTop:"1px solid "+t.bd,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <button onClick={()=>setPage(p=>Math.max(0,p-1))} disabled={page===0} style={{padding:"5px 14px",borderRadius:8,border:"1px solid "+t.bd,background:"transparent",color:page===0?t.td:t.tw,cursor:page===0?"not-allowed":"pointer",fontSize:12}}>← Prev</button>
        <span style={{fontSize:12,color:t.td}}>Page {page+1} of {pages} · {total.toLocaleString()} total</span>
        <button onClick={()=>setPage(p=>Math.min(pages-1,p+1))} disabled={page>=pages-1} style={{padding:"5px 14px",borderRadius:8,border:"1px solid "+t.bd,background:"transparent",color:page>=pages-1?t.td:t.tw,cursor:page>=pages-1?"not-allowed":"pointer",fontSize:12}}>Next →</button>
      </div>}
    </Card>
    <Modal open={mo} onClose={()=>smo(false)} title={er?"Edit Contact":"Add Contact"}>
      <F l="Company / Name" v={fo.company} onChange={v=>sfo({...fo,company:v})}/>
      <F l="Category / Industry" v={fo.category} onChange={v=>sfo({...fo,category:v})}/>
      <F l="Contact Person" v={fo.contact_person} onChange={v=>sfo({...fo,contact_person:v})}/>
      <F l="Position" v={fo.position} onChange={v=>sfo({...fo,position:v})}/>
      <F l="Email" v={fo.email} onChange={v=>sfo({...fo,email:v})}/>
      <F l="Phone" v={fo.phone} onChange={v=>sfo({...fo,phone:v})}/>
      <F l="Location" v={fo.location} onChange={v=>sfo({...fo,location:v})}/>
      <SB onClick={save} loading={sv}/>
    </Modal>
  </div>;
}

// ── EVENTS ────────────────────────────────────────────────────────────────────
const EV_TYPES=["Campaign","Meeting","Deadline","Event","Follow-up","Shoot","Presentation","Other"];
const EV_STATUS=["Upcoming","In Progress","Done","Cancelled"];
const tC_ev={"Campaign":"#3B82F6","Meeting":"#A78BFA","Deadline":"#EF4444","Event":"#10B981","Follow-up":"#F59E0B","Shoot":"#EC4899","Presentation":"#14B8A6","Other":"#64748B"};

function EventsPage(){
  const t=useContext(Ctx);
  const[events,setEvents]=useState([]);const[loading,setLoading]=useState(true);
  const[mo,smo]=useState(false);const[er,ser]=useState(null);const[sv,ssv]=useState(false);
  const[view,setView]=useState("calendar");const[tab,setTab]=useState("mine");
  const now=new Date();
  const[curYear,setCurYear]=useState(now.getFullYear());
  const[curMonth,setCurMonth]=useState(now.getMonth());
  const dF={title:"",type:"Campaign",date:"",end_date:"",client:"",notes:"",status:"Upcoming"};
  const[fo,sfo]=useState(dF);

  const load=useCallback(async()=>{setLoading(true);const{data}=await supabase.from("events").select("*").order("date");setEvents(data||[]);setLoading(false);},[]);
  useEffect(()=>{load()},[load]);

  const openAdd=(dateStr)=>{ser(null);sfo({...dF,date:dateStr||""});smo(true)};
  const openEdit=r=>{ser(r);sfo({title:r.title||"",type:r.type||"Campaign",date:r.date||"",end_date:r.end_date||"",client:r.client||"",notes:r.notes||"",status:r.status||"Upcoming"});smo(true)};
  const save=async()=>{if(!fo.title.trim()||!fo.date)return;ssv(true);if(er){await supabase.from("events").update(fo).eq("id",er.id)}else{await supabase.from("events").insert([fo])}ssv(false);smo(false);ser(null);sfo(dF);load()};
  const del=async id=>{if(!confirm("Delete?"))return;await supabase.from("events").delete().eq("id",id);load()};

  const firstDay=new Date(curYear,curMonth,1).getDay();
  const daysInMonth=new Date(curYear,curMonth+1,0).getDate();
  const monthNames=["January","February","March","April","May","June","July","August","September","October","November","December"];
  const todayStr=now.toISOString().split("T")[0];
  const evByDate={};events.forEach(e=>{const d=e.date?.split("T")[0];if(d){if(!evByDate[d])evByDate[d]=[];evByDate[d].push(e);}});
  const upcoming=getUpcomingEvents(90);
  const counts={};EV_STATUS.forEach(s=>counts[s]=events.filter(e=>e.status===s).length);

  return <div style={{display:"flex",flexDirection:"column",gap:16}}>
    <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
      <KPI l="My Events" v={events.length} p c={t.bl}/>
      <KPI l="Upcoming" v={counts["Upcoming"]||0} s="scheduled" p c={t.tl}/>
      <KPI l="UAE Events (90d)" v={upcoming.length} s="opportunities" p c={t.pr}/>
      <KPI l="Done" v={counts["Done"]||0} p c={t.gn}/>
    </div>

    {/* Tab: My Events vs UAE Events */}
    <div style={{display:"flex",gap:3,background:t.s2,borderRadius:12,padding:4,width:"fit-content"}}>
      {[{k:"mine",l:"📋 My Events"},{k:"uae",l:"🇦🇪 UAE Events"}].map(tb=>
        <button key={tb.k} onClick={()=>setTab(tb.k)} style={{padding:"8px 18px",borderRadius:9,border:"none",background:tab===tb.k?t.bl:"transparent",color:tab===tb.k?"#fff":t.tm,fontSize:12,fontWeight:700,cursor:"pointer"}}>{tb.l}</button>
      )}
    </div>

    {tab==="uae"?(
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        <Card><CH title="🇦🇪 Major UAE Events — Full Calendar" sub="Never miss a networking or campaign opportunity"/>
          <div style={{maxHeight:600,overflow:"auto"}}>
            {UAE_EVENTS.sort((a,b)=>new Date(a.date)-new Date(b.date)).map((ev,i)=>{
              const days=daysUntil(ev.date);
              const isPast=days<0;
              return <div key={i} style={{display:"flex",gap:14,padding:"14px 20px",borderBottom:"1px solid "+t.bd,opacity:isPast?.5:1}} onMouseEnter={e=>e.currentTarget.style.background=t.s3} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <div style={{textAlign:"center",minWidth:50,flexShrink:0}}>
                  <div style={{fontSize:22,fontWeight:900,color:isPast?t.td:days<=7?t.rd:days<=30?t.am:t.bl,lineHeight:1}}>{Math.abs(days)}</div>
                  <div style={{fontSize:9,color:t.td}}>{isPast?"days ago":"days"}</div>
                </div>
                <div style={{width:3,background:isPast?t.td:days<=7?t.rd:days<=30?t.am:t.bl,borderRadius:2,flexShrink:0}}/>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                    <div style={{fontSize:14,fontWeight:800,color:t.tw}}>{ev.title}</div>
                    <Pill c={t.tl}>{ev.cat}</Pill>
                  </div>
                  <div style={{fontSize:12,color:t.td,marginBottom:3}}>📍 {ev.venue} · {new Date(ev.date).toLocaleDateString("en-AE",{day:"numeric",month:"short",year:"numeric"})}{ev.end_date?" – "+new Date(ev.end_date).toLocaleDateString("en-AE",{day:"numeric",month:"short"}):""}</div>
                  <div style={{fontSize:12,color:t.tm}}>{ev.desc}</div>
                </div>
                <button onClick={()=>openAdd(ev.date)} style={{padding:"6px 12px",borderRadius:8,border:"1px solid "+t.bd,background:"transparent",color:t.bl,fontSize:11,fontWeight:700,cursor:"pointer",flexShrink:0,alignSelf:"center"}}>+ Plan</button>
              </div>;
            })}
          </div>
        </Card>
      </div>
    ):(
      <>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
          <div style={{display:"flex",gap:4}}>
            <Btn a={view==="calendar"} l="📅 Calendar" onClick={()=>setView("calendar")}/>
            <Btn a={view==="list"} l="☰ List" onClick={()=>setView("list")}/>
          </div>
          {view==="calendar"&&<div style={{display:"flex",alignItems:"center",gap:10}}>
            <button onClick={()=>{let m=curMonth-1,y=curYear;if(m<0){m=11;y--;}setCurMonth(m);setCurYear(y);}} style={{padding:"4px 10px",borderRadius:8,border:"1px solid "+t.bd,background:"transparent",color:t.tw,cursor:"pointer"}}>←</button>
            <span style={{fontWeight:800,color:t.tw,fontSize:14,minWidth:140,textAlign:"center"}}>{monthNames[curMonth]} {curYear}</span>
            <button onClick={()=>{let m=curMonth+1,y=curYear;if(m>11){m=0;y++;}setCurMonth(m);setCurYear(y);}} style={{padding:"4px 10px",borderRadius:8,border:"1px solid "+t.bd,background:"transparent",color:t.tw,cursor:"pointer"}}>→</button>
          </div>}
          <AB onClick={()=>openAdd("")} l="+ Add Event"/>
        </div>
        {loading?<div style={{padding:40,textAlign:"center",color:t.td}}>Loading...</div>:view==="calendar"?(
          <Card>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",borderBottom:"1px solid "+t.bd}}>
              {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d=><div key={d} style={{padding:"8px 0",textAlign:"center",fontSize:10,fontWeight:700,color:t.td,textTransform:"uppercase"}}>{d}</div>)}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)"}}>
              {Array.from({length:firstDay}).map((_,i)=><div key={"e"+i} style={{minHeight:90,borderRight:"1px solid "+t.bd,borderBottom:"1px solid "+t.bd,background:t.s2}}/>)}
              {Array.from({length:daysInMonth}).map((_,i)=>{
                const day=i+1;
                const dateStr=curYear+"-"+String(curMonth+1).padStart(2,"0")+"-"+String(day).padStart(2,"0");
                const dayEvs=evByDate[dateStr]||[];
                const isToday=dateStr===todayStr;
                return <div key={day} onClick={()=>openAdd(dateStr)} style={{minHeight:90,borderRight:"1px solid "+t.bd,borderBottom:"1px solid "+t.bd,padding:"6px 8px",cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.background=t.s3} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <div style={{width:26,height:26,borderRadius:"50%",background:isToday?t.bl:"transparent",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:4}}>
                    <span style={{fontSize:12,fontWeight:isToday?800:400,color:isToday?"#fff":t.tm}}>{day}</span>
                  </div>
                  {dayEvs.slice(0,3).map((ev,ei)=><div key={ei} onClick={e=>{e.stopPropagation();openEdit(ev);}} style={{fontSize:10,fontWeight:700,color:"#fff",background:tC_ev[ev.type]||t.bl,borderRadius:4,padding:"2px 6px",marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",cursor:"pointer"}}>{ev.title}</div>)}
                  {dayEvs.length>3&&<div style={{fontSize:9,color:t.td}}>+{dayEvs.length-3} more</div>}
                </div>;
              })}
            </div>
          </Card>
        ):(
          <Card><CH title={"All Events ("+events.length+")"}/>
            <div style={{maxHeight:520,overflow:"auto"}}>
              {events.length===0?<div style={{padding:40,textAlign:"center",color:t.td}}>No events yet. Click + Add Event.</div>:
              events.map((ev,i)=><div key={ev.id||i} style={{display:"flex",alignItems:"center",padding:"12px 20px",borderBottom:"1px solid "+t.bd,gap:12}} onMouseEnter={e=>e.currentTarget.style.background=t.s3} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <div style={{width:10,height:10,borderRadius:"50%",background:tC_ev[ev.type]||t.bl,flexShrink:0}}/>
                <div style={{flex:2}}><div style={{fontWeight:700,color:t.tw,fontSize:13}}>{ev.title}</div><div style={{fontSize:11,color:t.td}}>{ev.client}</div></div>
                <div style={{width:90,fontSize:11,color:t.tm}}>{ev.date?.split("T")[0]||"—"}</div>
                <Pill c={tC_ev[ev.type]}>{ev.type}</Pill>
                <Pill c={ev.status==="Done"?t.gn:ev.status==="Cancelled"?t.rd:ev.status==="In Progress"?t.am:t.bl}>{ev.status}</Pill>
                <EB onClick={()=>openEdit(ev)}/><DB onClick={()=>del(ev.id)}/>
              </div>)}
            </div>
          </Card>
        )}
      </>
    )}
    <Modal open={mo} onClose={()=>smo(false)} title={er?"Edit Event":"Add Event"}>
      <F l="Title" v={fo.title} onChange={v=>sfo({...fo,title:v})}/>
      <F l="Type" v={fo.type} onChange={v=>sfo({...fo,type:v})} opts={EV_TYPES}/>
      <F l="Status" v={fo.status} onChange={v=>sfo({...fo,status:v})} opts={EV_STATUS}/>
      <F l="Start Date" v={fo.date} onChange={v=>sfo({...fo,date:v})} type="date"/>
      <F l="End Date" v={fo.end_date} onChange={v=>sfo({...fo,end_date:v})} type="date"/>
      <F l="Client / Brand" v={fo.client} onChange={v=>sfo({...fo,client:v})}/>
      <F l="Notes" v={fo.notes} onChange={v=>sfo({...fo,notes:v})} rows={3}/>
      <SB onClick={save} loading={sv}/>
    </Modal>
  </div>;
}

// ── SOCIAL MEDIA ──────────────────────────────────────────────────────────────
const SM_PLATFORMS=["Instagram","TikTok","YouTube","LinkedIn","X (Twitter)","Facebook","Snapchat"];
const pC={"Instagram":"#E1306C","TikTok":"#00F2EA","YouTube":"#FF0000","LinkedIn":"#0A66C2","X (Twitter)":"#1DA1F2","Facebook":"#1877F2","Snapchat":"#FFFC00"};
const pIcon={"Instagram":"📸","TikTok":"🎵","YouTube":"▶️","LinkedIn":"💼","X (Twitter)":"🐦","Facebook":"f","Snapchat":"👻"};

function SocialPage(){
  const t=useContext(Ctx);
  const[accounts,setAccounts]=useState([]);const[loading,setLoading]=useState(true);
  const[mo,smo]=useState(false);const[er,ser]=useState(null);const[sv,ssv]=useState(false);
  const[fi,sfi]=useState("All");
  const dF={account_name:"",handle:"",platform:"Instagram",followers:0,following:0,posts:0,engagement:0,monthly_reach:0,notes:""};
  const[fo,sfo]=useState(dF);

  const load=useCallback(async()=>{setLoading(true);const{data}=await supabase.from("social_media").select("*").order("followers",{ascending:false});setAccounts(data||[]);setLoading(false);},[]);
  useEffect(()=>{load()},[load]);

  const openAdd=()=>{ser(null);sfo(dF);smo(true)};
  const openEdit=r=>{ser(r);sfo({account_name:r.account_name||"",handle:r.handle||"",platform:r.platform||"Instagram",followers:r.followers||0,following:r.following||0,posts:r.posts||0,engagement:r.engagement||0,monthly_reach:r.monthly_reach||0,notes:r.notes||""});smo(true)};
  const save=async()=>{if(!fo.account_name.trim())return;ssv(true);const d={...fo,followers:Number(fo.followers),following:Number(fo.following),posts:Number(fo.posts),engagement:Number(fo.engagement),monthly_reach:Number(fo.monthly_reach)};if(er){await supabase.from("social_media").update(d).eq("id",er.id)}else{await supabase.from("social_media").insert([d])}ssv(false);smo(false);ser(null);sfo(dF);load()};
  const del=async id=>{if(!confirm("Delete?"))return;await supabase.from("social_media").delete().eq("id",id);load()};

  const filtered=fi==="All"?accounts:accounts.filter(a=>a.platform===fi);
  const totalFollowers=accounts.reduce((a,c)=>a+(c.followers||0),0);
  const totalReach=accounts.reduce((a,c)=>a+(c.monthly_reach||0),0);
  const avgEng=accounts.length?accounts.reduce((a,c)=>a+(c.engagement||0),0)/accounts.length:0;
  const platBars=Object.entries(accounts.reduce((m,a)=>{m[a.platform]=(m[a.platform]||0)+(a.followers||0);return m;},{})).sort((a,b)=>b[1]-a[1]).map(([k,v])=>({k,v,c:pC[k]||"#64748B"}));

  // Social media tips & best practices
  const tips=[
    {icon:"🕐",tip:"Best Instagram posting times in UAE: 7-9am, 12-2pm, 7-10pm (GST)"},
    {icon:"📈",tip:"Reels get 3x more reach than static posts on Instagram"},
    {icon:"🎯",tip:"TikTok: Post 3-5x per week for consistent growth"},
    {icon:"💡",tip:"Use Arabic captions alongside English for 40% more reach in UAE"},
    {icon:"🔥",tip:"Stories with polls get 2x more engagement than regular stories"},
    {icon:"📊",tip:"LinkedIn posts on Tuesday-Thursday 8-10am get highest B2B engagement"},
  ];

  return <div style={{display:"flex",flexDirection:"column",gap:16}}>
    <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
      <KPI l="Total Accounts" v={accounts.length} s="Tracked" p c={t.bl}/>
      <KPI l="Total Followers" v={totalFollowers.toLocaleString()} s="Across all platforms" p c={t.pk}/>
      <KPI l="Monthly Reach" v={totalReach.toLocaleString()} p c={t.tl}/>
      <KPI l="Avg Engagement" v={avgEng.toFixed(2)+"%"} p={avgEng>=3} c={avgEng>=3?t.gn:t.am}/>
    </div>

    {/* Social media tips */}
    <Card><CH title="💡 Social Media Intelligence & Best Practices" sub="Live tips for UAE market"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:0}}>
        {tips.map((tip,i)=><div key={i} style={{padding:"14px 20px",borderBottom:"1px solid "+t.bd,borderRight:i%3!==2?"1px solid "+t.bd:"none",display:"flex",gap:10,alignItems:"flex-start"}}>
          <span style={{fontSize:18,flexShrink:0}}>{tip.icon}</span>
          <span style={{fontSize:12,color:t.tm,lineHeight:1.5}}>{tip.tip}</span>
        </div>)}
      </div>
    </Card>

    {platBars.length>0&&<Card><CH title="Followers by platform"/>
      <div style={{padding:"16px 20px"}}><HBar data={platBars} h={24}/></div>
    </Card>}

    <Card>
      <CH title={"Accounts ("+filtered.length+")"} right={
        <div style={{display:"flex",gap:4,alignItems:"center",flexWrap:"wrap"}}>
          {["All",...SM_PLATFORMS].map(p=><Btn key={p} a={fi===p} l={p} onClick={()=>sfi(p)}/>)}
          <AB onClick={openAdd} l="+ Add"/>
        </div>
      }/>
      <div style={{display:"flex",padding:"7px 20px",borderBottom:"1px solid "+t.bd,fontSize:10,color:t.td,fontWeight:700,textTransform:"uppercase",letterSpacing:.5}}>
        <div style={{flex:2}}>Account</div><div style={{width:110}}>Platform</div>
        <div style={{width:90,textAlign:"right"}}>Followers</div>
        <div style={{width:70,textAlign:"right"}}>Posts</div>
        <div style={{width:100,textAlign:"right"}}>Mo. Reach</div>
        <div style={{width:80,textAlign:"right"}}>Engagement</div>
        <div style={{width:60}}/>
      </div>
      <div style={{maxHeight:500,overflow:"auto"}}>
        {loading?<div style={{padding:40,textAlign:"center",color:t.td}}>Loading...</div>:
        filtered.length===0?<div style={{padding:40,textAlign:"center",color:t.td}}>No accounts yet. Click + Add to start tracking.</div>:
        filtered.map((a,i)=><div key={a.id||i} style={{display:"flex",alignItems:"center",padding:"12px 20px",borderBottom:"1px solid "+t.bd,fontSize:13}} onMouseEnter={e=>e.currentTarget.style.background=t.s3} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
          <div style={{flex:2}}>
            <div style={{fontWeight:700,color:t.tw}}>{a.account_name}</div>
            <div style={{fontSize:11,color:t.td}}>{a.handle}</div>
          </div>
          <div style={{width:110}}><span style={{display:"inline-flex",alignItems:"center",gap:5,padding:"3px 10px",borderRadius:20,background:(pC[a.platform]||"#64748B")+"22",color:pC[a.platform]||"#64748B",fontSize:11,fontWeight:700}}>{pIcon[a.platform]} {a.platform}</span></div>
          <div style={{width:90,textAlign:"right",fontWeight:800,color:t.tw}}>{(a.followers||0).toLocaleString()}</div>
          <div style={{width:70,textAlign:"right",color:t.td}}>{(a.posts||0).toLocaleString()}</div>
          <div style={{width:100,textAlign:"right",color:t.tl,fontWeight:700}}>{(a.monthly_reach||0).toLocaleString()}</div>
          <div style={{width:80,textAlign:"right",color:(a.engagement||0)>=5?t.gn:(a.engagement||0)>=2?t.am:t.td,fontWeight:800}}>{(a.engagement||0).toFixed(2)}%</div>
          <div style={{width:60,display:"flex",gap:2}}>{a.id&&<><EB onClick={()=>openEdit(a)}/><DB onClick={()=>del(a.id)}/></>}</div>
        </div>)}
      </div>
    </Card>
    <Modal open={mo} onClose={()=>smo(false)} title={er?"Edit Account":"Add Social Account"}>
      <F l="Account Name" v={fo.account_name} onChange={v=>sfo({...fo,account_name:v})}/>
      <F l="Handle / URL" v={fo.handle} onChange={v=>sfo({...fo,handle:v})}/>
      <F l="Platform" v={fo.platform} onChange={v=>sfo({...fo,platform:v})} opts={SM_PLATFORMS}/>
      <F l="Followers" v={fo.followers} onChange={v=>sfo({...fo,followers:v})} type="number"/>
      <F l="Following" v={fo.following} onChange={v=>sfo({...fo,following:v})} type="number"/>
      <F l="Posts" v={fo.posts} onChange={v=>sfo({...fo,posts:v})} type="number"/>
      <F l="Monthly Reach" v={fo.monthly_reach} onChange={v=>sfo({...fo,monthly_reach:v})} type="number"/>
      <F l="Engagement %" v={fo.engagement} onChange={v=>sfo({...fo,engagement:v})} type="number"/>
      <F l="Notes" v={fo.notes} onChange={v=>sfo({...fo,notes:v})} rows={2}/>
      <SB onClick={save} loading={sv}/>
    </Modal>
  </div>;
}

// ── GMAIL ─────────────────────────────────────────────────────────────────────
function GmailPage(){
  const t=useContext(Ctx);
  const[connected,setConnected]=useState(false);const[profile,setProfile]=useState(null);
  const[msgs,setMsgs]=useState([]);const[loading,setLoading]=useState(false);
  const[selected,setSelected]=useState(null);const[msgBody,setMsgBody]=useState("");
  const[compose,setCompose]=useState(false);const[mail,setMail]=useState({to:"",subject:"",body:""});
  const[sending,setSending]=useState(false);const[sent,setSent]=useState(false);
  const[search,setSearch]=useState("");const[query,setQuery]=useState("in:inbox");

  const authUrl=`https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent("239120064064-p70c9lqugpspg0ttcu6bbqqlstncn810.apps.googleusercontent.com")}&redirect_uri=${encodeURIComponent(window.location.origin+"/api/auth/callback")}&response_type=code&scope=${encodeURIComponent("https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/userinfo.email")}&access_type=offline&prompt=consent`;

  const checkConnection=useCallback(async()=>{try{const r=await fetch("/api/gmail/messages?action=profile");const d=await r.json();if(d.emailAddress){setConnected(true);setProfile(d);loadMsgs(query);}}catch(e){}},[]);
  const loadMsgs=async(q)=>{setLoading(true);setSelected(null);setMsgBody("");try{const r=await fetch("/api/gmail/messages?q="+encodeURIComponent(q));const d=await r.json();setMsgs(d.messages||[]);}catch(e){}setLoading(false);};
  const openMsg=async(msg)=>{setSelected(msg);try{const r=await fetch("/api/gmail/messages?action=message&messageId="+msg.id);const d=await r.json();const parts=d.payload?.parts||[d.payload];let body="";const findText=(p)=>{if(!p)return;if(p.mimeType==="text/plain"&&p.body?.data){body=atob(p.body.data.replace(/-/g,"+").replace(/_/g,"/"));return;}if(p.parts)p.parts.forEach(findText);};parts.forEach(findText);setMsgBody(body||msg.snippet);}catch(e){setMsgBody(msg.snippet);}};
  const sendMail=async()=>{if(!mail.to||!mail.subject||!mail.body)return;setSending(true);const r=await fetch("/api/gmail/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(mail)});const d=await r.json();setSending(false);if(d.id){setSent(true);setCompose(false);setMail({to:"",subject:"",body:""});setTimeout(()=>setSent(false),4000);}};
  useEffect(()=>{checkConnection();},[checkConnection]);
  useEffect(()=>{const p=new URLSearchParams(window.location.search);if(p.get("connected")==="true"){checkConnection();window.history.replaceState({},"","/");}},[checkConnection]);

  if(!connected)return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:20,padding:80}}>
      <div style={{fontSize:56}}>✉️</div>
      <div style={{fontSize:24,fontWeight:800,color:t.tw}}>Connect Gmail</div>
      <div style={{fontSize:14,color:t.td,textAlign:"center",maxWidth:440,lineHeight:1.7}}>Connect your Gmail to read emails, search your inbox, compose and reply directly from ALBAB Media.</div>
      <button onClick={()=>window.location.href=authUrl} style={{padding:"14px 32px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#3B82F6,#8B5CF6)",color:"#fff",fontSize:15,fontWeight:800,cursor:"pointer"}}>🔗 Connect Gmail Account</button>
    </div>
  );

  return <div style={{display:"flex",flexDirection:"column",gap:16}}>
    <div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"center"}}>
      <KPI l="Connected as" v={profile?.emailAddress||"Gmail"} s="● Active" p c={t.gn}/>
      <KPI l="Messages loaded" v={msgs.length} p c={t.bl}/>
      {sent&&<div style={{padding:"12px 20px",background:t.gG,border:"1px solid "+t.gn+"44",borderRadius:12,color:t.gn,fontWeight:700}}>✓ Email sent successfully!</div>}
    </div>
    <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
      <input placeholder="Search emails..." value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){setQuery(search||"in:inbox");loadMsgs(search||"in:inbox");loadMsgs(search||"in:inbox");}}} style={{flex:1,minWidth:200,padding:"8px 14px",borderRadius:10,border:"1px solid "+t.bd,background:t.bg,color:t.tx,fontSize:13,outline:"none"}}/>
      <button onClick={()=>{setQuery(search||"in:inbox");loadMsgs(search||"in:inbox");}} style={{padding:"8px 16px",borderRadius:10,border:"none",background:t.bl,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>Search</button>
      {["in:inbox","in:sent","is:unread","is:starred"].map(q=><Btn key={q} a={query===q} l={q.replace("in:","").replace("is:","")} onClick={()=>{setQuery(q);loadMsgs(q);}}/>)}
      <AB onClick={()=>setCompose(true)} l="✉ Compose"/>
    </div>
    <div style={{display:"grid",gridTemplateColumns:selected?"1fr 1fr":"1fr",gap:14}}>
      <Card>
        <CH title={"Inbox ("+msgs.length+")"}/>
        <div style={{maxHeight:520,overflow:"auto"}}>
          {loading?<div style={{padding:40,textAlign:"center",color:t.td}}>Loading emails...</div>:
          msgs.length===0?<div style={{padding:40,textAlign:"center",color:t.td}}>No messages found</div>:
          msgs.map((m,i)=><div key={i} onClick={()=>openMsg(m)} style={{padding:"12px 20px",borderBottom:"1px solid "+t.bd,cursor:"pointer",background:selected?.id===m.id?t.bG:"transparent"}} onMouseEnter={e=>e.currentTarget.style.background=t.s3} onMouseLeave={e=>e.currentTarget.style.background=selected?.id===m.id?t.bG:"transparent"}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
              <div style={{fontSize:12,fontWeight:m.unread?800:600,color:t.tw,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>{m.from?.split("<")[0]||m.from}</div>
              <div style={{fontSize:10,color:t.td,flexShrink:0,marginLeft:8}}>{new Date(m.date).toLocaleDateString()}</div>
            </div>
            <div style={{fontSize:12,fontWeight:m.unread?700:500,color:m.unread?t.tw:t.tm,marginBottom:3}}>{m.subject}</div>
            <div style={{fontSize:11,color:t.td,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.snippet}</div>
          </div>)}
        </div>
      </Card>
      {selected&&<Card>
        <CH title={selected.subject} right={<button onClick={()=>{setSelected(null);setMsgBody("");}} style={{background:"transparent",border:"none",color:t.td,cursor:"pointer",fontSize:20}}>&times;</button>}/>
        <div style={{padding:20}}>
          <div style={{fontSize:12,color:t.td,marginBottom:3}}>From: {selected.from}</div>
          <div style={{fontSize:12,color:t.td,marginBottom:16}}>{new Date(selected.date).toLocaleString()}</div>
          <div style={{fontSize:13,color:t.tx,lineHeight:1.8,whiteSpace:"pre-wrap",maxHeight:360,overflow:"auto"}}>{msgBody}</div>
          <button onClick={()=>{setCompose(true);setMail({to:selected.from.match(/<(.+)>/)?.[1]||selected.from,subject:"Re: "+selected.subject,body:"\n\n---\nOn "+new Date(selected.date).toLocaleString()+":\n"+msgBody.slice(0,300)+"..."});}} style={{marginTop:16,padding:"9px 20px",borderRadius:10,border:"none",background:t.bl,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>↩ Reply</button>
        </div>
      </Card>}
    </div>
    <Modal open={compose} onClose={()=>setCompose(false)} title="Compose Email">
      <F l="To" v={mail.to} onChange={v=>setMail({...mail,to:v})}/>
      <F l="Subject" v={mail.subject} onChange={v=>setMail({...mail,subject:v})}/>
      <F l="Message" v={mail.body} onChange={v=>setMail({...mail,body:v})} rows={10}/>
      <SB onClick={sendMail} loading={sending} l="Send Email"/>
    </Modal>
  </div>;
}

// ── AI CO-PILOT ───────────────────────────────────────────────────────────────
function AiPage({data}){
  const t=useContext(Ctx);
  const[msgs,setMsgs]=useState([{role:"assistant",content:"👋 Hi Bader! I'm your AI business co-pilot. I have full context on your ALBAB Media data — ask me anything about your leads, revenue, influencers, contacts, or get help drafting emails and strategies.\n\nHere are some things you can ask me:\n• \"Who are my top clients by revenue?\"\n• \"Draft a follow-up email for a client who hasn't paid\"\n• \"Which leads are in Commit stage?\"\n• \"What influencers should I recommend for a luxury brand campaign?\"\n• \"Summarize my pipeline performance\""}]);
  const[input,setInput]=useState("");const[loading,setLoading]=useState(false);
  const endRef=useRef(null);

  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"});},[msgs]);

  const buildContext=()=>{
    const tr=data.inv.reduce((a,f)=>a+(f.revenue||0),0);
    const tp=data.inv.reduce((a,f)=>a+(f.amount_paid||0),0);
    const pi={};data.ld.forEach(l=>pi[l.stage]=(pi[l.stage]||0)+1);
    const topClients=Object.entries(data.inv.reduce((m,f)=>{m[f.client]=(m[f.client]||0)+(f.revenue||0);return m;},{})).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([k,v])=>k+": "+v.toLocaleString()+" AED").join(", ");
    const commitLeads=data.ld.filter(l=>l.stage==="Commit").map(l=>l.client).join(", ");
    const funnelLeads=data.ld.filter(l=>l.stage==="Funnel").slice(0,5).map(l=>l.client).join(", ");
    const qs={};data.qt.forEach(q=>qs[q.status]=(qs[q.status]||0)+1);
    return `You are the AI business co-pilot for ALBAB Media, a UAE-based media and influencer marketing agency founded by Bader Al Barqawi. You have full context on the business data.

BUSINESS DATA:
- Total Revenue: ${tr.toLocaleString()} AED | Collected: ${tp.toLocaleString()} AED | Outstanding: ${(tr-tp).toLocaleString()} AED
- Pipeline: ${data.ld.length} leads | Prospect:${pi.Prospect||0} Funnel:${pi.Funnel||0} Upside:${pi.Upside||0} Commit:${pi.Commit||0} Awarded:${pi.Awarded||0} Lost:${pi.Lost||0} Dropped:${pi.Dropped||0}
- Commit stage leads (hot): ${commitLeads||"none"}
- Funnel leads: ${funnelLeads||"none"}
- Quotations: ${data.qt.length} total | Awarded:${qs.Awarded||0} Pending:${qs.Pending||0} Dropped:${qs.Dropped||0}
- Top clients: ${topClients}
- Influencers database: ${data.inf.length.toLocaleString()} influencers
- B2B Contacts: ${data.ct} contacts
- Monthly expenses: ${data.exp.reduce((a,e)=>a+(e.amount||0),0).toLocaleString()} AED

COMPANY CONTEXT:
- Agency specializes in influencer marketing, social media management, content creation
- Primary markets: UAE, Saudi Arabia, GCC, Jordan
- Key clients include Nestle, Nine71, Emirates NBD, Careem, Amazon MENA, Emaar, MAF
- Currency: AED only

Be helpful, direct, and specific. When drafting emails, make them professional and UAE-appropriate. When giving business insights, be actionable.`;
  };

  const send=async()=>{
    if(!input.trim()||loading)return;
    const userMsg={role:"user",content:input};
    setMsgs(m=>[...m,userMsg]);
    setInput("");setLoading(true);
    try{
      const r=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          system:buildContext(),
          messages:[...msgs.filter(m=>m.role!=="assistant"||msgs.indexOf(m)>0).map(m=>({role:m.role,content:m.content})),{role:"user",content:input}]
        })
      });
      const d=await r.json();
      const reply=d.content?.[0]?.text||"Sorry, I couldn't process that.";
      setMsgs(m=>[...m,{role:"assistant",content:reply}]);
    }catch(e){setMsgs(m=>[...m,{role:"assistant",content:"Connection error. Please try again."}]);}
    setLoading(false);
  };

  const quickQ=["Summarize my revenue performance","Which leads need follow-up now?","Draft email to chase unpaid invoice","Best influencers for a luxury brand","What's my win rate this year?","UAE events I should attend next month"];

  return <div style={{display:"flex",flexDirection:"column",gap:0,height:"calc(100vh - 120px)"}}>
    <div style={{background:"linear-gradient(135deg,"+t.pr+"22,"+t.bl+"22)",border:"1px solid "+t.pr+"33",borderRadius:16,padding:"16px 20px",marginBottom:14}}>
      <div style={{fontSize:16,fontWeight:800,color:t.tw,marginBottom:4}}>🤖 AI Business Co-Pilot</div>
      <div style={{fontSize:12,color:t.tm}}>Powered by Claude · Full context on your ALBAB Media data · Ask anything</div>
    </div>
    {/* Quick questions */}
    <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}>
      {quickQ.map((q,i)=><button key={i} onClick={()=>{setInput(q);}} style={{padding:"6px 14px",borderRadius:20,border:"1px solid "+t.bd,background:"transparent",color:t.tm,fontSize:11,fontWeight:600,cursor:"pointer"}}>{q}</button>)}
    </div>
    {/* Chat messages */}
    <div style={{flex:1,overflow:"auto",background:t.s1,borderRadius:16,border:"1px solid "+t.bd,padding:20,display:"flex",flexDirection:"column",gap:14,marginBottom:14}}>
      {msgs.map((m,i)=><div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",flexDirection:m.role==="user"?"row-reverse":"row"}}>
        <div style={{width:32,height:32,borderRadius:"50%",background:m.role==="user"?t.bl:t.pr,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>{m.role==="user"?"B":"🤖"}</div>
        <div style={{maxWidth:"75%",background:m.role==="user"?t.bl:t.s2,color:m.role==="user"?"#fff":t.tx,padding:"12px 16px",borderRadius:m.role==="user"?"16px 4px 16px 16px":"4px 16px 16px 16px",fontSize:13,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{m.content}</div>
      </div>)}
      {loading&&<div style={{display:"flex",gap:10,alignItems:"center"}}>
        <div style={{width:32,height:32,borderRadius:"50%",background:t.pr,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>🤖</div>
        <div style={{background:t.s2,padding:"12px 16px",borderRadius:"4px 16px 16px 16px",color:t.td,fontSize:13}}>Thinking...</div>
      </div>}
      <div ref={endRef}/>
    </div>
    {/* Input */}
    <div style={{display:"flex",gap:10}}>
      <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&send()} placeholder="Ask anything about your business, draft emails, get insights..." style={{flex:1,padding:"12px 16px",borderRadius:12,border:"1px solid "+t.bd,background:t.s1,color:t.tx,fontSize:13,outline:"none"}}/>
      <button onClick={send} disabled={loading||!input.trim()} style={{padding:"12px 24px",borderRadius:12,border:"none",background:t.pr,color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer",opacity:loading||!input.trim()?.6:1}}>Send →</button>
    </div>
  </div>;
}

// ── NAV & APP ─────────────────────────────────────────────────────────────────
const NAV=[
  {k:"dash",l:"Dashboard",i:"▣"},
  {k:"sales",l:"Sales",i:"⚡"},
  {k:"inf",l:"Influencers",i:"★"},
  {k:"cash",l:"Cash Flow",i:"$"},
  {k:"quot",l:"Quotations",i:"☑"},
  {k:"exp",l:"Expenses",i:"⚙"},
  {k:"contacts",l:"Contacts",i:"☎"},
  {k:"events",l:"Events",i:"📅"},
  {k:"social",l:"Social Media",i:"📱"},
  {k:"gmail",l:"Gmail",i:"✉"},
  {k:"ai",l:"AI Co-Pilot",i:"🤖"},
];

export default function App(){
  const[mode,setMode]=useState("dark");const[active,setActive]=useState("dash");const[loading,setLoading]=useState(true);
  const[data,setData]=useState({ld:[],inv:[],qt:[],inf:[],exp:[],ct:0});
  const t=mode==="dark"?D:L;

  const load=useCallback(async()=>{
    try{
      const[a,b,c,d,e,f]=await Promise.all([
        supabase.from("leads").select("*").order("id",{ascending:false}),
        supabase.from("invoices").select("*").order("id"),
        supabase.from("quotations").select("*").order("id"),
        supabase.from("influencers").select("*").order("id"),
        supabase.from("expenses").select("*").order("id"),
        supabase.from("contacts").select("id",{count:"exact",head:true}),
      ]);
      setData({ld:a.data||[],inv:b.data||[],qt:c.data||[],inf:d.data||[],exp:e.data||[],ct:f.count||0});
    }catch(e){console.error(e)}
    setLoading(false);
  },[]);

  useEffect(()=>{load()},[load]);

  const pg={
    dash:<DashPage ld={data.ld} inv={data.inv} qt={data.qt} exp={data.exp}/>,
    sales:<SalesPage ld={data.ld} rl={load}/>,
    inf:<InfPage inf={data.inf} rl={load}/>,
    cash:<CashPage inv={data.inv} rl={load}/>,
    quot:<QuotPage qt={data.qt} rl={load}/>,
    exp:<ExpPage exp={data.exp} rl={load}/>,
    contacts:<ContactsPage/>,
    events:<EventsPage/>,
    social:<SocialPage/>,
    gmail:<GmailPage/>,
    ai:<AiPage data={{...data,ct:data.ct}}/>,
  };

  return <Ctx.Provider value={t}>
    <div style={{display:"flex",height:"100vh",background:t.bg,fontFamily:"'Inter',-apple-system,sans-serif",color:t.tx,overflow:"hidden"}}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"/>
      {/* Sidebar */}
      <div style={{width:175,background:t.s1,borderRight:"1px solid "+t.bd,display:"flex",flexDirection:"column",flexShrink:0}}>
        <div style={{padding:"16px 14px",borderBottom:"1px solid "+t.bd,display:"flex",alignItems:"center",gap:9}}>
          <div style={{width:30,height:30,borderRadius:8,background:"linear-gradient(135deg,#3B82F6,#8B5CF6)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:900,fontSize:13}}>A</div>
          <div>
            <div style={{fontWeight:800,fontSize:13,color:t.tw}}>ALBAB Media</div>
            <div style={{fontSize:10,color:t.td}}>Business OS</div>
          </div>
        </div>
        <div style={{flex:1,padding:"6px 0",overflow:"auto"}}>
          {NAV.map(n=><div key={n.k} onClick={()=>setActive(n.k)} style={{display:"flex",alignItems:"center",gap:8,padding:"9px 14px",cursor:"pointer",color:active===n.k?t.bl:t.tm,background:active===n.k?t.bG:"transparent",borderRight:active===n.k?"3px solid "+t.bl:"3px solid transparent",fontSize:12,fontWeight:active===n.k?700:400,transition:"all .1s"}} onMouseEnter={e=>{if(active!==n.k)e.currentTarget.style.background=t.s3;}} onMouseLeave={e=>{if(active!==n.k)e.currentTarget.style.background="transparent";}}>
            <span style={{fontSize:14,width:18,textAlign:"center"}}>{n.i}</span>{n.l}
            {n.k==="ai"&&<span style={{marginLeft:"auto",fontSize:9,background:t.pr,color:"#fff",padding:"2px 5px",borderRadius:6,fontWeight:700}}>AI</span>}
          </div>)}
        </div>
        <div style={{padding:"8px 10px",borderTop:"1px solid "+t.bd}}>
          <div onClick={()=>setMode(m=>m==="dark"?"light":"dark")} style={{padding:"8px 10px",background:t.s2,borderRadius:10,cursor:"pointer",color:t.tm,fontSize:11,textAlign:"center",fontWeight:600}}>{mode==="dark"?"☀ Light mode":"☾ Dark mode"}</div>
        </div>
      </div>
      {/* Main content */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minWidth:0}}>
        <div style={{padding:"10px 22px",borderBottom:"1px solid "+t.bd,background:t.s1,flexShrink:0,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:17,fontWeight:800,color:t.tw}}>{NAV.find(n=>n.k===active)?.l}</div>
            <div style={{fontSize:11,color:t.td}}>ALBAB Media · Business OS</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{fontSize:11,color:t.td}}>{new Date().toLocaleDateString("en-AE",{weekday:"short",day:"numeric",month:"short"})}</div>
            <div style={{display:"flex",alignItems:"center",gap:5}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:loading?t.am:t.gn}}/>
              <span style={{fontSize:11,color:t.td}}>{loading?"Loading...":"Live"}</span>
            </div>
          </div>
        </div>
        <div style={{flex:1,overflow:"auto",padding:18}}>
          {loading?<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",color:t.td,flexDirection:"column",gap:12}}>
            <div style={{fontSize:32}}>⚡</div>
            <div style={{fontSize:14,fontWeight:600}}>Loading ALBAB Media...</div>
          </div>:pg[active]}
        </div>
      </div>
    </div>
    <style>{`*{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{width:4px;height:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${t.bd};border-radius:4px}input::placeholder{color:${t.td}}select{appearance:auto}button{transition:opacity .15s}`}</style>
  </Ctx.Provider>;
}
