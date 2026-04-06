import{useState,useEffect,createContext,useContext,useCallback,useRef}from"react";
import{supabase}from"../lib/supabase";

const Ctx=createContext();
const D={bg:"#070E1A",s1:"#0D1828",s2:"#111F30",s3:"#162438",bd:"#1E3048",tx:"#C8D8E8",tm:"#6A8FAA",td:"#3E5870",tw:"#EEF4FA",bl:"#3B82F6",bG:"rgba(59,130,246,.13)",gn:"#10B981",gG:"rgba(16,185,129,.1)",am:"#F59E0B",aG:"rgba(245,158,11,.1)",rd:"#EF4444",rG:"rgba(239,68,68,.1)",pr:"#A78BFA",tl:"#14B8A6",pk:"#EC4899",or:"#F97316"};
const L={bg:"#EEF2F7",s1:"#FFFFFF",s2:"#F1F5F9",s3:"#E2EAF4",bd:"#C8D8E8",tx:"#1E293B",tm:"#475569",td:"#94A3B8",tw:"#0F172A",bl:"#2563EB",bG:"rgba(37,99,235,.08)",gn:"#059669",gG:"rgba(5,150,105,.08)",am:"#D97706",aG:"rgba(217,119,6,.08)",rd:"#DC2626",rG:"rgba(220,38,38,.08)",pr:"#7C3AED",tl:"#0D9488",pk:"#DB2777",or:"#EA580C"};
const STG=["Prospect","Funnel","Upside","Commit","Awarded","Lost","Dropped"];
const sC={"Prospect":"#64748B","Funnel":"#3B82F6","Upside":"#A78BFA","Commit":"#F59E0B","Awarded":"#10B981","Lost":"#EF4444","Dropped":"#475569"};

// UAE Major Events
const UAE_EVENTS=[
  {title:"GITEX Global",date:"2025-10-13",cat:"Technology",venue:"DWTC, Dubai",desc:"World's largest tech & startup show. 6,000+ exhibitors."},
  {title:"Arabian Travel Market",date:"2025-04-28",cat:"Travel",venue:"DWTC, Dubai",desc:"Leading travel & tourism trade event in MENA."},
  {title:"Beautyworld Middle East",date:"2025-05-27",cat:"Beauty",venue:"DWTC, Dubai",desc:"Largest beauty trade fair in the Middle East."},
  {title:"Gulfood",date:"2026-02-16",cat:"Food & Beverage",venue:"DWTC, Dubai",desc:"World's largest annual food & beverage show."},
  {title:"Dubai Lynx",date:"2026-03-09",cat:"Marketing",venue:"Dubai",desc:"MENA's biggest marketing & creativity festival."},
  {title:"Step Conference",date:"2026-02-25",cat:"Tech & Startups",venue:"Dubai",desc:"Middle East's leading startup conference."},
  {title:"Big5 Dubai",date:"2025-11-24",cat:"Construction",venue:"DWTC, Dubai",desc:"Middle East's largest construction event."},
  {title:"ADIPEC",date:"2025-11-04",cat:"Energy",venue:"ADNEC, Abu Dhabi",desc:"World's most influential energy event."},
  {title:"Arab Health",date:"2026-01-26",cat:"Healthcare",venue:"DWTC, Dubai",desc:"World's 2nd largest healthcare trade show."},
  {title:"Dubai Airshow",date:"2025-11-17",cat:"Aviation",venue:"Dubai",desc:"World's premier airshow & aviation event."},
  {title:"Intersec Dubai",date:"2026-01-20",cat:"Security",venue:"DWTC, Dubai",desc:"World's leading security & safety trade fair."},
  {title:"UAE National Day",date:"2025-12-02",cat:"National",venue:"UAE-wide",desc:"54th UAE National Day — big campaign season."},
  {title:"Dubai Shopping Festival",date:"2025-12-26",cat:"Retail",venue:"Dubai-wide",desc:"Annual mega shopping & entertainment festival."},
  {title:"Ramadan 2026",date:"2026-02-28",cat:"Cultural",venue:"UAE-wide",desc:"Key marketing & influencer campaign season."},
  {title:"Art Dubai",date:"2026-03-18",cat:"Art & Culture",venue:"Madinat Jumeirah",desc:"Leading international art fair in MENA."},
  {title:"Dubai Food Festival",date:"2026-02-26",cat:"Food",venue:"Dubai-wide",desc:"Annual celebration of Dubai's food culture."},
];

function daysUntil(d){const n=new Date();n.setHours(0,0,0,0);return Math.ceil((new Date(d)-n)/86400000);}

// ── UI COMPONENTS ─────────────────────────────────────────────────────────────
function Tag({children,c,size}){const t=useContext(Ctx);const fs=size==="lg"?12:10;return <span style={{padding:size==="lg"?"4px 12px":"3px 8px",borderRadius:20,fontSize:fs,fontWeight:700,background:(c||t.bl)+"20",color:c||t.bl,whiteSpace:"nowrap",flexShrink:0}}>{children}</span>}

function Stat({label,value,sub,good=true,accent,onClick}){
  const t=useContext(Ctx);
  return <div onClick={onClick} style={{background:t.s1,borderRadius:14,padding:"16px 18px",border:"1px solid "+t.bd,flex:1,minWidth:130,cursor:onClick?"pointer":"default",position:"relative",overflow:"hidden",transition:"border-color .15s"}} onMouseEnter={e=>{if(onClick)e.currentTarget.style.borderColor=t.bl}} onMouseLeave={e=>{e.currentTarget.style.borderColor=t.bd}}>
    <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:accent||(good?t.gn:t.rd),borderRadius:"14px 14px 0 0"}}/>
    <div style={{fontSize:10,color:t.td,textTransform:"uppercase",letterSpacing:.8,marginBottom:6,fontWeight:700}}>{label}</div>
    <div style={{fontSize:22,fontWeight:900,color:t.tw,lineHeight:1.1}}>{value}</div>
    {sub&&<div style={{marginTop:5,fontSize:11,color:good?t.gn:t.am,fontWeight:600}}>{sub}</div>}
    {onClick&&<div style={{position:"absolute",bottom:8,right:10,fontSize:10,color:t.td}}>click to view →</div>}
  </div>;
}

function Panel({title,sub,right,children,style={}}){
  const t=useContext(Ctx);
  return <div style={{background:t.s1,borderRadius:16,border:"1px solid "+t.bd,overflow:"hidden",...style}}>
    <div style={{padding:"14px 18px",borderBottom:"1px solid "+t.bd,display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,flexWrap:"wrap"}}>
      <div><div style={{fontSize:14,fontWeight:700,color:t.tw}}>{title}</div>{sub&&<div style={{fontSize:11,color:t.td,marginTop:1}}>{sub}</div>}</div>
      {right}
    </div>
    {children}
  </div>;
}

function Btn({active,label,onClick,c}){const t=useContext(Ctx);return <button onClick={onClick} style={{padding:"5px 13px",borderRadius:8,border:"none",background:active?(c||t.bl):"transparent",color:active?"#fff":t.tm,fontSize:11,fontWeight:700,cursor:"pointer"}}>{label}</button>}
function GreenBtn({onClick,label}){const t=useContext(Ctx);return <button onClick={onClick} style={{padding:"7px 15px",borderRadius:9,border:"none",background:t.gn,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"}}>{label}</button>}
function BlueBtn({onClick,label}){const t=useContext(Ctx);return <button onClick={onClick} style={{padding:"7px 15px",borderRadius:9,border:"none",background:t.bl,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"}}>{label}</button>}
function IconBtn({onClick,label,color}){return <button onClick={onClick} style={{padding:"3px 8px",borderRadius:6,border:"none",background:"transparent",color:color||"#60A5FA",fontSize:12,cursor:"pointer",opacity:.5}} onMouseEnter={e=>e.currentTarget.style.opacity=1} onMouseLeave={e=>e.currentTarget.style.opacity=.5}>{label}</button>}

function SearchBar({value,onChange,onKey,placeholder,width}){const t=useContext(Ctx);return <input value={value} onChange={e=>onChange(e.target.value)} onKeyDown={onKey} placeholder={placeholder||"Search..."} style={{background:t.bg,border:"1px solid "+t.bd,borderRadius:8,padding:"6px 12px",color:t.tx,fontSize:12,width:width||180,outline:"none"}}/>}

function Modal({open,onClose,title,children,wide}){
  const t=useContext(Ctx);
  if(!open)return null;
  return <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.72)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,padding:16}} onClick={onClose}>
    <div onClick={e=>e.stopPropagation()} style={{background:t.s1,borderRadius:18,border:"1px solid "+t.bd,padding:26,width:wide?680:450,maxHeight:"88vh",overflow:"auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:18}}>
        <div style={{fontSize:17,fontWeight:800,color:t.tw}}>{title}</div>
        <div onClick={onClose} style={{cursor:"pointer",color:t.td,fontSize:22,lineHeight:1}}>&times;</div>
      </div>
      {children}
    </div>
  </div>;
}

function Field({label,value,onChange,type,opts,rows}){
  const t=useContext(Ctx);
  const s={width:"100%",padding:"9px 12px",borderRadius:9,border:"1px solid "+t.bd,background:t.s2,color:t.tx,fontSize:13,outline:"none",boxSizing:"border-box"};
  return <div style={{marginBottom:12}}>
    <div style={{fontSize:11,color:t.tm,marginBottom:4,fontWeight:700}}>{label}</div>
    {opts?<select value={value} onChange={e=>onChange(e.target.value)} style={s}>{opts.map(o=><option key={o}>{o}</option>)}</select>
    :rows?<textarea value={value} onChange={e=>onChange(e.target.value)} rows={rows} style={{...s,resize:"vertical"}}/>
    :<input type={type||"text"} value={value} onChange={e=>onChange(e.target.value)} style={s}/>}
  </div>;
}

function SaveBtn({onClick,loading}){const t=useContext(Ctx);return <button onClick={onClick} disabled={loading} style={{width:"100%",padding:"11px",borderRadius:10,border:"none",background:t.bl,color:"#fff",fontSize:14,fontWeight:800,cursor:"pointer",marginTop:10,opacity:loading?.6:1}}>{loading?"Saving...":"Save"}</button>}

// ── CHARTS ─────────────────────────────────────────────────────────────────────
function BarChart({data,h=110}){
  const t=useContext(Ctx);
  if(!data?.length)return null;
  const mx=Math.max(...data.map(d=>d.v),1);
  const bw=30,gap=8,px=6,W=data.length*(bw+gap)+px*2;
  return <svg width="100%" viewBox={"0 0 "+W+" "+(h+30)} style={{display:"block"}}>
    {data.map((d,i)=>{
      const x=px+i*(bw+gap),bh=Math.max((d.v/mx)*(h-8),d.v>0?4:0),y=h-bh;
      return <g key={i}>
        <rect x={x} y={y} width={bw} height={bh} fill={d.c||t.bl} rx={5} opacity={.88}/>
        {d.v>0&&<text x={x+bw/2} y={y-4} textAnchor="middle" fontSize={9} fill={t.tm} fontWeight="700">{d.v}</text>}
        <text x={x+bw/2} y={h+16} textAnchor="middle" fontSize={8} fill={t.td}>{String(d.k).slice(0,7)}</text>
      </g>;
    })}
  </svg>;
}

function HorizBars({data,h=18}){
  const t=useContext(Ctx);
  if(!data?.length)return null;
  const mx=Math.max(...data.map(d=>d.v),1);
  return <div style={{display:"flex",flexDirection:"column",gap:9}}>
    {data.map((d,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:10}}>
      <div style={{width:95,fontSize:11,color:t.tw,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flexShrink:0}}>{d.k}</div>
      <div style={{flex:1,height:h,background:t.s3,borderRadius:4,overflow:"hidden"}}>
        <div style={{height:"100%",width:(d.v/mx*100)+"%",background:d.c||t.bl,borderRadius:4,opacity:.9}}/>
      </div>
      <div style={{width:58,textAlign:"right",fontSize:11,fontWeight:700,color:t.tw,flexShrink:0}}>{typeof d.v==="number"&&d.v>999?d.v.toLocaleString():d.v}</div>
    </div>)}
  </div>;
}

function Ring({data,size=110}){
  const t=useContext(Ctx);
  const tot=data.reduce((a,d)=>a+d.v,0)||1;
  const cx=size/2,cy=size/2,r=size*.4,ir=size*.24;
  let ang=-Math.PI/2;
  const slices=data.filter(d=>d.v>0).map(d=>{
    const sw=(d.v/tot)*Math.PI*2,x1=cx+r*Math.cos(ang),y1=cy+r*Math.sin(ang);
    ang+=sw;
    const x2=cx+r*Math.cos(ang),y2=cy+r*Math.sin(ang),ix1=cx+ir*Math.cos(ang-sw),iy1=cy+ir*Math.sin(ang-sw),ix2=cx+ir*Math.cos(ang),iy2=cy+ir*Math.sin(ang);
    return{path:"M "+x1+" "+y1+" A "+r+" "+r+" 0 "+(sw>Math.PI?1:0)+" 1 "+x2+" "+y2+" L "+ix2+" "+iy2+" A "+ir+" "+ir+" 0 "+(sw>Math.PI?1:0)+" 0 "+ix1+" "+iy1+" Z",c:d.c,v:d.v,k:d.k};
  });
  return <div style={{display:"flex",alignItems:"center",gap:18}}>
    <svg width={size} height={size} viewBox={"0 0 "+size+" "+size} style={{flexShrink:0}}>
      {slices.map((s,i)=><path key={i} d={s.path} fill={s.c} opacity={.9}/>)}
      <text x={cx} y={cy-5} textAnchor="middle" fontSize={15} fontWeight="900" fill={t.tw}>{tot.toLocaleString()}</text>
      <text x={cx} y={cy+10} textAnchor="middle" fontSize={9} fill={t.td}>total</text>
    </svg>
    <div style={{display:"flex",flexDirection:"column",gap:7}}>
      {data.map((d,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:7,fontSize:12}}>
        <div style={{width:9,height:9,borderRadius:3,background:d.c,flexShrink:0}}/>
        <span style={{color:t.tw,fontWeight:800,minWidth:22}}>{d.v}</span>
        <span style={{color:t.td}}>{d.k}</span>
        <span style={{color:t.td,fontSize:10}}>({Math.round(d.v/tot*100)}%)</span>
      </div>)}
    </div>
  </div>;
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
function DashPage({ld,inv,qt,exp,setActive}){
  const t=useContext(Ctx);
  const[detailModal,setDetailModal]=useState(null);

  const tr=inv.reduce((a,f)=>a+(f.revenue||0),0);
  const tp=inv.reduce((a,f)=>a+(f.amount_paid||0),0);
  const outstanding=tr-tp;

  // Outstanding clients — the real names
  const outstandingClients=inv.filter(f=>(f.revenue-f.amount_paid)>0).sort((a,b)=>(b.revenue-b.amount_paid)-(a.revenue-a.amount_paid));

  const pi={};ld.forEach(l=>pi[l.stage]=(pi[l.stage]||0)+1);
  const qs={};qt.forEach(q=>qs[q.status]=(qs[q.status]||0)+1);

  // Hot leads — specific names
  const commitLeads=ld.filter(l=>l.stage==="Commit");
  const funnelLeads=ld.filter(l=>l.stage==="Funnel").slice(0,5);
  const pendingQuots=qt.filter(q=>q.status==="Pending");

  const pD=STG.map(s=>({k:s,c:sC[s],v:pi[s]||0}));
  const tot=pD.reduce((a,d)=>a+d.v,0);

  const cr={};inv.forEach(f=>cr[f.client]=(cr[f.client]||0)+(f.revenue||0));
  const topClients=Object.entries(cr).sort((a,b)=>b[1]-a[1]).slice(0,6);
  const mx=topClients[0]?.[1]||1;

  const vt={};inv.forEach(f=>vt[f.vertical||"Other"]=(vt[f.vertical||"Other"]||0)+(f.revenue||0));
  const tvArr=Object.entries(vt).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([k,v])=>({k,v,c:t.tl}));

  const h=new Date().getHours();
  const greet=h<12?"Good morning ☀️":h<17?"Good afternoon 🌤":"Good evening 🌙";
  const upcoming=UAE_EVENTS.filter(e=>daysUntil(e.date)>=0&&daysUntil(e.date)<=60).sort((a,b)=>daysUntil(a.date)-daysUntil(b.date));

  return <div style={{display:"flex",flexDirection:"column",gap:16}}>
    {/* Morning briefing */}
    <div style={{background:"linear-gradient(135deg,#1E3A5F,#162440)",border:"1px solid "+t.bl+"33",borderRadius:18,padding:"20px 24px"}}>
      <div style={{fontSize:19,fontWeight:900,color:"#EEF4FA",marginBottom:4}}>{greet}, Bader</div>
      <div style={{fontSize:12,color:"#6A8FAA",marginBottom:16}}>{new Date().toLocaleDateString("en-AE",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</div>
      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
        {commitLeads.length>0&&<div onClick={()=>setDetailModal({title:"Commit Stage — Close These Now",items:commitLeads.map(l=>({name:l.client,sub:l.contact_person+" · "+l.vertical,badge:l.stage,badgeC:sC[l.stage]}))})} style={{background:"rgba(245,158,11,.15)",border:"1px solid rgba(245,158,11,.4)",borderRadius:12,padding:"8px 16px",fontSize:12,color:"#F59E0B",fontWeight:700,cursor:"pointer"}}>🔥 {commitLeads.length} deals in Commit — close them</div>}
        {outstandingClients.length>0&&<div onClick={()=>setDetailModal({title:"Outstanding Payments — Chase These",items:outstandingClients.map(f=>({name:f.client,sub:(f.revenue-f.amount_paid).toLocaleString()+" AED outstanding",badge:f.vertical||"",badgeC:t.tl}))})} style={{background:"rgba(239,68,68,.15)",border:"1px solid rgba(239,68,68,.4)",borderRadius:12,padding:"8px 16px",fontSize:12,color:"#EF4444",fontWeight:700,cursor:"pointer"}}>💰 {outstandingClients.length} clients with unpaid invoices</div>}
        {pendingQuots.length>0&&<div onClick={()=>setDetailModal({title:"Pending Quotations — Follow Up",items:pendingQuots.map(q=>({name:q.client,sub:"Quotation pending response",badge:"Pending",badgeC:t.am}))})} style={{background:"rgba(167,139,250,.15)",border:"1px solid rgba(167,139,250,.4)",borderRadius:12,padding:"8px 16px",fontSize:12,color:"#A78BFA",fontWeight:700,cursor:"pointer"}}>📋 {pendingQuots.length} quotations awaiting response</div>}
        {upcoming.length>0&&<div style={{background:"rgba(20,184,166,.15)",border:"1px solid rgba(20,184,166,.4)",borderRadius:12,padding:"8px 16px",fontSize:12,color:"#14B8A6",fontWeight:700}}>📅 {upcoming[0].title} in {daysUntil(upcoming[0].date)} days</div>}
      </div>
    </div>

    {/* KPIs */}
    <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
      <Stat label="Total Revenue" value={tr.toLocaleString()+" AED"} sub={"Collected: "+tp.toLocaleString()} good accent={t.gn}/>
      <Stat label="Outstanding" value={outstanding.toLocaleString()+" AED"} sub={outstandingClients.length+" clients pending"} good={outstanding===0} accent={outstanding>0?t.rd:t.gn} onClick={()=>setDetailModal({title:"Who Owes You Money",items:outstandingClients.map(f=>({name:f.client,sub:(f.revenue-f.amount_paid).toLocaleString()+" AED due",badge:f.vertical||"",badgeC:t.tl}))})}/>
      <Stat label="Pipeline" value={tot+" deals"} sub={(pi.Awarded||0)+" awarded · "+(pi.Commit||0)+" commit"} good accent={t.bl} onClick={()=>setActive("sales")}/>
      <Stat label="Expenses/mo" value={exp.reduce((a,e)=>a+(e.amount||0),0).toLocaleString()+" AED"} good={false} accent={t.am}/>
    </div>

    {/* Charts */}
    <div style={{display:"grid",gridTemplateColumns:"1.3fr 1fr",gap:14}}>
      <Panel title="Pipeline by stage" sub={tot+" total leads"}>
        <div style={{padding:"14px 18px 8px"}}><BarChart data={pD} h={110}/></div>
      </Panel>
      <Panel title="Collection rate">
        <div style={{padding:"18px"}}>
          {(() => {
            const rate=tr>0?Math.round(tp/tr*100):0;
            return <>
              <div style={{fontSize:40,fontWeight:900,color:rate>=80?t.gn:rate>=50?t.am:t.rd,lineHeight:1,marginBottom:12}}>{rate}%</div>
              <div style={{height:10,background:t.s3,borderRadius:5,overflow:"hidden",marginBottom:14}}>
                <div style={{height:"100%",width:rate+"%",background:rate>=80?t.gn:rate>=50?t.am:t.rd,borderRadius:5}}/>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12}}>
                <div><div style={{color:t.td,fontSize:10,marginBottom:2}}>Collected</div><div style={{fontWeight:800,color:t.gn}}>{tp.toLocaleString()} AED</div></div>
                <div style={{textAlign:"right"}}><div style={{color:t.td,fontSize:10,marginBottom:2}}>Outstanding</div><div style={{fontWeight:800,color:t.rd}}>{outstanding.toLocaleString()} AED</div></div>
              </div>
            </>;
          })()}
        </div>
      </Panel>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
      <Panel title="Top clients by revenue">
        <div style={{padding:"8px 18px 12px"}}>
          {topClients.map(([cl,v],i)=><div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom:"1px solid "+t.bd}}>
            <div style={{width:20,fontSize:11,fontWeight:800,color:t.td}}>#{i+1}</div>
            <div style={{flex:1,fontSize:13,fontWeight:700,color:t.tw,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{cl}</div>
            <div style={{flex:2,height:5,background:t.s3,borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",background:t.tl,borderRadius:3,width:(v/mx*100)+"%"}}/></div>
            <div style={{minWidth:68,textAlign:"right",fontSize:12,fontWeight:800,color:t.tw}}>{v.toLocaleString()}</div>
          </div>)}
        </div>
      </Panel>
      <Panel title="Revenue by vertical">
        <div style={{padding:"14px 18px"}}><HorizBars data={tvArr} h={20}/></div>
      </Panel>
    </div>

    {/* Upcoming UAE events */}
    <Panel title="🇦🇪 Upcoming UAE Events" sub="Next 60 days — click to plan">
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:0}}>
        {upcoming.slice(0,6).map((ev,i)=>{
          const d=daysUntil(ev.date);
          return <div key={i} style={{padding:"12px 16px",borderBottom:"1px solid "+t.bd,borderRight:i%3!==2?"1px solid "+t.bd:"none"}}>
            <div style={{display:"flex",align:"center",gap:8,marginBottom:5}}>
              <div style={{fontSize:20,fontWeight:900,color:d<=7?t.rd:d<=21?t.am:t.bl,lineHeight:1,minWidth:28}}>{d}</div>
              <div style={{fontSize:10,color:t.td,paddingTop:2}}>days<br/>away</div>
              <Tag c={t.tl}>{ev.cat}</Tag>
            </div>
            <div style={{fontSize:12,fontWeight:700,color:t.tw}}>{ev.title}</div>
            <div style={{fontSize:10,color:t.td}}>{ev.venue}</div>
          </div>;
        })}
      </div>
    </Panel>

    {/* Detail modal */}
    <Modal open={!!detailModal} onClose={()=>setDetailModal(null)} title={detailModal?.title||""}>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {detailModal?.items?.map((item,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:"1px solid "+useContext(Ctx).bd}}>
          <div style={{width:34,height:34,borderRadius:9,background:useContext(Ctx).s3,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:14,color:useContext(Ctx).tw,flexShrink:0}}>{(item.name||"?")[0]}</div>
          <div style={{flex:1}}><div style={{fontWeight:700,color:useContext(Ctx).tw,fontSize:13}}>{item.name}</div><div style={{fontSize:11,color:useContext(Ctx).td}}>{item.sub}</div></div>
          {item.badge&&<Tag c={item.badgeC}>{item.badge}</Tag>}
        </div>)}
      </div>
    </Modal>
  </div>;
}

// ── SALES ─────────────────────────────────────────────────────────────────────
function SalesPage({ld,rl}){
  const t=useContext(Ctx);
  const[fi,sfi]=useState("All");const[se,sse]=useState("");
  const[mo,smo]=useState(false);const[er,ser]=useState(null);const[sv,ssv]=useState(false);
  const dF={client:"",vertical:"",contact_person:"",email:"",phone:"",stage:"Prospect",notes:""};
  const[fo,sfo]=useState(dF);

  let ls=ld;
  if(fi!=="All")ls=ls.filter(s=>s.stage===fi);
  if(se)ls=ls.filter(s=>(s.client+s.contact_person+s.vertical+s.email).toLowerCase().includes(se.toLowerCase()));

  const pi={};ld.forEach(l=>pi[l.stage]=(pi[l.stage]||0)+1);
  const pD=STG.map(s=>({k:s,c:sC[s],v:pi[s]||0}));
  const vt={};ld.forEach(l=>vt[l.vertical||"Other"]=(vt[l.vertical||"Other"]||0)+1);
  const vtArr=Object.entries(vt).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([k,v])=>({k,v,c:t.bl}));

  const save=async()=>{if(!fo.client.trim())return;ssv(true);if(er){await supabase.from("leads").update(fo).eq("id",er.id)}else{await supabase.from("leads").insert([fo])}ssv(false);smo(false);ser(null);sfo(dF);rl()};
  const del=async id=>{if(!confirm("Delete this lead?"))return;await supabase.from("leads").delete().eq("id",id);rl()};
  const openEdit=r=>{ser(r);sfo({client:r.client||"",vertical:r.vertical||"",contact_person:r.contact_person||"",email:r.email||"",phone:r.phone||"",stage:r.stage||"Prospect",notes:r.notes||""});smo(true)};

  return <div style={{display:"flex",flexDirection:"column",gap:14}}>
    <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
      <Stat label="Total Leads" value={ld.length} sub={(pi.Awarded||0)+" awarded"} accent={t.gn}/>
      <Stat label="Commit Stage" value={pi.Commit||0} sub="Ready to close" accent={t.am}/>
      <Stat label="Win Rate" value={ld.length?((pi.Awarded||0)/ld.length*100).toFixed(0)+"%":"0%"} accent={t.tl}/>
      <Stat label="Lost + Dropped" value={(pi.Lost||0)+(pi.Dropped||0)} good={false} accent={t.rd}/>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"1.3fr 1fr",gap:14}}>
      <Panel title="Pipeline stages"><div style={{padding:"14px 18px 8px"}}><BarChart data={pD} h={110}/></div></Panel>
      <Panel title="Leads by vertical"><div style={{padding:"14px 18px"}}><HorizBars data={vtArr} h={18}/></div></Panel>
    </div>

    <Panel title={"Leads ("+ls.length+")"} right={
      <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
        <SearchBar value={se} onChange={sse} placeholder="Search leads..."/>
        <div style={{display:"flex",gap:2,flexWrap:"wrap"}}>
          {["All",...STG].map(s=><Btn key={s} active={fi===s} label={s+(pi[s]?" ("+pi[s]+")":"")} onClick={()=>sfi(s)}/>)}
        </div>
        <GreenBtn onClick={()=>{ser(null);sfo(dF);smo(true)}} label="+ Add Lead"/>
      </div>
    }>
      {/* Column headers */}
      <div style={{display:"flex",padding:"7px 18px",borderBottom:"1px solid "+t.bd,fontSize:10,color:t.td,fontWeight:700,textTransform:"uppercase",letterSpacing:.5}}>
        <div style={{flex:2}}>Client</div><div style={{flex:1.5}}>Contact</div><div style={{flex:1}}>Vertical</div><div style={{flex:1}}>Email</div><div style={{width:80}}>Stage</div><div style={{width:60}}/>
      </div>
      <div style={{maxHeight:460,overflow:"auto"}}>
        {ls.length===0?<div style={{padding:40,textAlign:"center",color:t.td}}>No leads found</div>:
        ls.map((s,i)=><div key={s.id||i} style={{display:"flex",alignItems:"center",padding:"10px 18px",borderBottom:"1px solid "+t.bd,gap:8,fontSize:12}} onMouseEnter={e=>e.currentTarget.style.background=t.s3} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
          <div style={{width:32,height:32,borderRadius:9,background:(sC[s.stage]||t.bd)+"20",display:"flex",alignItems:"center",justifyContent:"center",color:sC[s.stage],fontWeight:900,fontSize:13,flexShrink:0}}>{(s.client||"?")[0]}</div>
          <div style={{flex:2,minWidth:0}}><div style={{fontWeight:700,color:t.tw,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.client}</div></div>
          <div style={{flex:1.5,color:t.tm,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.contact_person||"—"}</div>
          <div style={{flex:1,color:t.td,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.vertical||"—"}</div>
          <div style={{flex:1,color:t.bl,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.email||"—"}</div>
          <div style={{width:80}}><Tag c={sC[s.stage]}>{s.stage}</Tag></div>
          <div style={{width:60,display:"flex",gap:2}}>{s.id&&<><IconBtn onClick={()=>openEdit(s)} label="✎" color={t.bl}/><IconBtn onClick={()=>del(s.id)} label="✕" color={t.rd}/></>}</div>
        </div>)}
      </div>
    </Panel>

    <Modal open={mo} onClose={()=>smo(false)} title={er?"Edit Lead":"Add New Lead"}>
      <Field label="Client / Company" value={fo.client} onChange={v=>sfo({...fo,client:v})}/>
      <Field label="Vertical / Industry" value={fo.vertical} onChange={v=>sfo({...fo,vertical:v})}/>
      <Field label="Contact Person" value={fo.contact_person} onChange={v=>sfo({...fo,contact_person:v})}/>
      <Field label="Email" value={fo.email} onChange={v=>sfo({...fo,email:v})}/>
      <Field label="Phone" value={fo.phone} onChange={v=>sfo({...fo,phone:v})}/>
      <Field label="Stage" value={fo.stage} onChange={v=>sfo({...fo,stage:v})} opts={STG}/>
      <Field label="Notes" value={fo.notes||""} onChange={v=>sfo({...fo,notes:v})} rows={3}/>
      <SaveBtn onClick={save} loading={sv}/>
    </Modal>
  </div>;
}

// ── CASH FLOW ─────────────────────────────────────────────────────────────────
function CashPage({inv,rl}){
  const t=useContext(Ctx);
  const[se,sse]=useState("");const[fi,sfi]=useState("All");
  const[mo,smo]=useState(false);const[er,ser]=useState(null);const[sv,ssv]=useState(false);
  const dF={client:"",vertical:"",revenue:0,amount_paid:0};
  const[fo,sfo]=useState(dF);

  const tr=inv.reduce((a,f)=>a+(f.revenue||0),0);
  const tp=inv.reduce((a,f)=>a+(f.amount_paid||0),0);

  let ls=inv;
  if(fi==="Outstanding")ls=inv.filter(f=>(f.revenue-f.amount_paid)>0);
  else if(fi==="Paid")ls=inv.filter(f=>(f.revenue-f.amount_paid)===0);
  if(se)ls=ls.filter(f=>(f.client||"").toLowerCase().includes(se.toLowerCase()));

  const vt={};inv.forEach(f=>vt[f.vertical||"Other"]=(vt[f.vertical||"Other"]||0)+(f.revenue||0));
  const tvArr=Object.entries(vt).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([k,v])=>({k,v,c:t.tl}));

  const save=async()=>{if(!fo.client.trim())return;ssv(true);const d={...fo,revenue:Number(fo.revenue),amount_paid:Number(fo.amount_paid),due_payment:Number(fo.revenue)-Number(fo.amount_paid)};if(er){await supabase.from("invoices").update(d).eq("id",er.id)}else{await supabase.from("invoices").insert([d])}ssv(false);smo(false);ser(null);sfo(dF);rl()};
  const del=async id=>{if(!confirm("Delete?"))return;await supabase.from("invoices").delete().eq("id",id);rl()};
  const openEdit=r=>{ser(r);sfo({client:r.client||"",vertical:r.vertical||"",revenue:r.revenue||0,amount_paid:r.amount_paid||0});smo(true)};

  const openCompose=(client,email)=>{
    const subject="Invoice Follow-Up — ALBAB Media";
    const body="Dear "+client+",\n\nI hope this message finds you well.\n\nI wanted to follow up regarding the outstanding invoice from ALBAB Media. Could you please provide an update on the payment timeline?\n\nThank you for your continued partnership.\n\nBest regards,\nBader Al Barqawi\nALBAB Media";
    window.open("mailto:"+(email||"")+"?subject="+encodeURIComponent(subject)+"&body="+encodeURIComponent(body));
  };

  return <div style={{display:"flex",flexDirection:"column",gap:14}}>
    <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
      <Stat label="Total Revenue" value={tr.toLocaleString()+" AED"} sub={inv.length+" invoices"} accent={t.gn}/>
      <Stat label="Collected" value={tp.toLocaleString()+" AED"} sub={tr?(tp/tr*100).toFixed(0)+"% collected":""} accent={t.tl}/>
      <Stat label="Outstanding" value={(tr-tp).toLocaleString()+" AED"} sub={inv.filter(f=>(f.revenue-f.amount_paid)>0).length+" clients"} good={tr-tp===0} accent={tr-tp>0?t.rd:t.gn}/>
    </div>

    <Panel title="Revenue by vertical"><div style={{padding:"14px 18px"}}><HorizBars data={tvArr} h={20}/></div></Panel>

    <Panel title={"Invoices ("+ls.length+")"} right={
      <div style={{display:"flex",gap:6,alignItems:"center"}}>
        <SearchBar value={se} onChange={sse} placeholder="Search client..."/>
        {["All","Outstanding","Paid"].map(f=><Btn key={f} active={fi===f} label={f} onClick={()=>sfi(f)}/>)}
        <GreenBtn onClick={()=>{ser(null);sfo(dF);smo(true)}} label="+ Add"/>
      </div>
    }>
      <div style={{display:"flex",padding:"7px 18px",borderBottom:"1px solid "+t.bd,fontSize:10,color:t.td,fontWeight:700,textTransform:"uppercase",letterSpacing:.5}}>
        <div style={{flex:2}}>Client</div><div style={{flex:1}}>Vertical</div>
        <div style={{width:90,textAlign:"right"}}>Revenue</div>
        <div style={{width:90,textAlign:"right"}}>Collected</div>
        <div style={{width:90,textAlign:"right"}}>Due</div>
        <div style={{width:100}}>Action</div>
      </div>
      <div style={{maxHeight:420,overflow:"auto"}}>
        {ls.map((f,i)=>{
          const due=f.revenue-f.amount_paid;
          return <div key={f.id||i} style={{display:"flex",alignItems:"center",padding:"10px 18px",borderBottom:"1px solid "+t.bd,fontSize:12,background:due>0?"rgba(239,68,68,.03)":"transparent"}} onMouseEnter={e=>e.currentTarget.style.background=t.s3} onMouseLeave={e=>e.currentTarget.style.background=due>0?"rgba(239,68,68,.03)":"transparent"}>
            <div style={{flex:2}}><div style={{fontWeight:700,color:t.tw}}>{f.client}</div></div>
            <div style={{flex:1,color:t.td,fontSize:11}}>{f.vertical}</div>
            <div style={{width:90,textAlign:"right",color:t.gn,fontWeight:700}}>{(f.revenue||0).toLocaleString()}</div>
            <div style={{width:90,textAlign:"right",color:t.tx}}>{(f.amount_paid||0).toLocaleString()}</div>
            <div style={{width:90,textAlign:"right",color:due>0?t.rd:t.td,fontWeight:due>0?800:400}}>{due>0?due.toLocaleString():"✓"}</div>
            <div style={{width:100,display:"flex",gap:4}}>
              {due>0&&<button onClick={()=>openCompose(f.client,f.email)} style={{padding:"3px 8px",borderRadius:6,border:"1px solid "+t.am+"44",background:t.aG,color:t.am,fontSize:10,fontWeight:700,cursor:"pointer"}}>Chase</button>}
              {f.id&&<><IconBtn onClick={()=>openEdit(f)} label="✎" color={t.bl}/><IconBtn onClick={()=>del(f.id)} label="✕" color={t.rd}/></>}
            </div>
          </div>;
        })}
      </div>
    </Panel>

    <Modal open={mo} onClose={()=>smo(false)} title={er?"Edit Invoice":"Add Invoice"}>
      <Field label="Client" value={fo.client} onChange={v=>sfo({...fo,client:v})}/>
      <Field label="Vertical" value={fo.vertical} onChange={v=>sfo({...fo,vertical:v})}/>
      <Field label="Revenue (AED)" value={fo.revenue} onChange={v=>sfo({...fo,revenue:v})} type="number"/>
      <Field label="Collected (AED)" value={fo.amount_paid} onChange={v=>sfo({...fo,amount_paid:v})} type="number"/>
      <SaveBtn onClick={save} loading={sv}/>
    </Modal>
  </div>;
}

// ── INFLUENCERS ───────────────────────────────────────────────────────────────
function InfPage({inf,rl}){
  const t=useContext(Ctx);
  const[tier,setTier]=useState("All");const[cat,setCat]=useState("All");
  const[se,sse]=useState("");const[view,setView]=useState("table");
  const[mo,smo]=useState(false);const[er,ser]=useState(null);const[sv,ssv]=useState(false);
  const dF={name:"",handle:"",category:"",city:"Dubai",nationality:"",ig_followers:"0",tiktok_followers:"0",youtube_followers:"0",total_reach:"0",engagement:0,tier:"Micro"};
  const[fo,sfo]=useState(dF);

  const tiers=["All","Mega","Macro","Mid","Micro"];
  const tC={Mega:t.pr,Macro:t.bl,Mid:t.tl,Micro:t.gn};

  const cats=["All",...[...new Set(inf.map(i=>i.category).filter(Boolean))].sort().slice(0,10)];

  let ls=inf;
  if(tier!=="All")ls=ls.filter(i=>i.tier===tier);
  if(cat!=="All")ls=ls.filter(i=>i.category===cat);
  if(se)ls=ls.filter(i=>(i.name+i.handle+i.category+i.nationality).toLowerCase().includes(se.toLowerCase()));

  const tc={};inf.forEach(i=>tc[i.tier]=(tc[i.tier]||0)+1);
  const tierDonut=[{k:"Mega",v:tc.Mega||0,c:t.pr},{k:"Macro",v:tc.Macro||0,c:t.bl},{k:"Mid",v:tc.Mid||0,c:t.tl},{k:"Micro",v:tc.Micro||0,c:t.gn}];

  const save=async()=>{if(!fo.name.trim())return;ssv(true);const d={...fo,engagement:Number(fo.engagement)};if(er){await supabase.from("influencers").update(d).eq("id",er.id)}else{await supabase.from("influencers").insert([d])}ssv(false);smo(false);ser(null);sfo(dF);rl()};
  const del=async id=>{if(!confirm("Delete?"))return;await supabase.from("influencers").delete().eq("id",id);rl()};
  const openEdit=r=>{ser(r);sfo({name:r.name||"",handle:r.handle||"",category:r.category||"",city:r.city||"Dubai",nationality:r.nationality||"",ig_followers:r.ig_followers||"0",tiktok_followers:r.tiktok_followers||"0",youtube_followers:r.youtube_followers||"0",total_reach:r.total_reach||"0",engagement:r.engagement||0,tier:r.tier||"Micro"});smo(true)};

  const parseN=v=>{const n=parseInt(String(v).replace(/[^0-9]/g,""));return isNaN(n)?0:n;};

  return <div style={{display:"flex",flexDirection:"column",gap:14}}>
    <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
      <Stat label="Total Influencers" value={inf.length.toLocaleString()} sub="UAE database" accent={t.pr}/>
      <Stat label="Mega (10M+)" value={tc.Mega||0} accent={t.pr}/>
      <Stat label="Micro" value={tc.Micro||0} accent={t.gn}/>
      <Stat label="Avg Engagement" value={inf.length?(inf.reduce((a,i)=>a+(i.engagement||0),0)/inf.length).toFixed(1)+"%":"0%"} accent={t.tl}/>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"1fr 2fr",gap:14}}>
      <Panel title="By tier"><div style={{padding:"14px 18px"}}><Ring data={tierDonut} size={120}/></div></Panel>
      <Panel title="How to use this database" sub="Campaign planning guide">
        <div style={{padding:"14px 18px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          {[{t:"🟣 Mega (10M+)",d:"Brand awareness, viral campaigns. High cost, broad reach."},{t:"🔵 Macro (1M-10M)",d:"Strong reach with niche authority. Good for product launches."},{t:"🩵 Mid (100K-1M)",d:"Best balance of reach and engagement. UAE sweet spot."},{t:"🟢 Micro (<100K)",d:"Highest engagement rates. Best for targeted local campaigns."}].map((item,i)=><div key={i} style={{background:t.s3,borderRadius:10,padding:"10px 12px"}}>
            <div style={{fontSize:12,fontWeight:700,color:t.tw,marginBottom:4}}>{item.t}</div>
            <div style={{fontSize:11,color:t.td,lineHeight:1.5}}>{item.d}</div>
          </div>)}
        </div>
      </Panel>
    </div>

    <Panel title={"Influencers ("+ls.length+" shown / "+inf.length+" total)"} right={
      <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
        <SearchBar value={se} onChange={sse} placeholder="Search name, handle, category..." width={200}/>
        <div style={{display:"flex",gap:2}}>{tiers.map(tr=><Btn key={tr} active={tier===tr} label={tr} onClick={()=>setTier(tr)}/>)}</div>
        <div style={{display:"flex",gap:2}}>{["All","table","cards"].filter(v=>v==="table"||v==="cards").map(v=><Btn key={v} active={view===v} label={v==="table"?"≡ Table":"⊞ Cards"} onClick={()=>setView(v)}/>)}</div>
        <GreenBtn onClick={()=>{ser(null);sfo(dF);smo(true)}} label="+ Add"/>
      </div>
    }>
      {/* Category filter */}
      <div style={{padding:"8px 18px",borderBottom:"1px solid "+t.bd,display:"flex",gap:4,flexWrap:"wrap"}}>
        {cats.map(c=><Btn key={c} active={cat===c} label={c} onClick={()=>setCat(c)}/>)}
      </div>

      {view==="table"?(
        <>
          <div style={{display:"flex",padding:"7px 18px",borderBottom:"1px solid "+t.bd,fontSize:10,color:t.td,fontWeight:700,textTransform:"uppercase",letterSpacing:.5}}>
            <div style={{flex:2}}>Influencer</div>
            <div style={{flex:1}}>Category</div>
            <div style={{width:70,textAlign:"right"}}>📸 IG</div>
            <div style={{width:70,textAlign:"right"}}>🎵 TikTok</div>
            <div style={{width:70,textAlign:"right"}}>▶ YT</div>
            <div style={{width:50,textAlign:"right"}}>Eng%</div>
            <div style={{width:70}}>Tier</div>
            <div style={{width:56}}/>
          </div>
          <div style={{maxHeight:500,overflow:"auto"}}>
            {ls.slice(0,200).map((n,i)=><div key={n.id||i} style={{display:"flex",alignItems:"center",padding:"9px 18px",borderBottom:"1px solid "+t.bd,gap:6,fontSize:12}} onMouseEnter={e=>e.currentTarget.style.background=t.s3} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <div style={{width:32,height:32,borderRadius:"50%",background:(tC[n.tier]||t.td)+"20",display:"flex",alignItems:"center",justifyContent:"center",color:tC[n.tier],fontWeight:900,fontSize:14,flexShrink:0}}>{(n.name||"?")[0]}</div>
              <div style={{flex:2,minWidth:0}}>
                <div style={{fontWeight:700,color:t.tw,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{n.name}</div>
                <div style={{fontSize:10,color:t.td}}>{n.handle||""}{n.city?" · "+n.city:""}</div>
              </div>
              <div style={{flex:1,color:t.td,fontSize:11,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{n.category||"—"}</div>
              <div style={{width:70,textAlign:"right",color:"#E1306C",fontWeight:700}}>{n.ig_followers||"—"}</div>
              <div style={{width:70,textAlign:"right",color:"#00F2EA",fontWeight:700}}>{n.tiktok_followers||"—"}</div>
              <div style={{width:70,textAlign:"right",color:"#FF0000",fontWeight:700}}>{n.youtube_followers||"—"}</div>
              <div style={{width:50,textAlign:"right",color:(n.engagement||0)>=5?t.gn:(n.engagement||0)>=2?t.am:t.td,fontWeight:700}}>{(n.engagement||0).toFixed(1)}%</div>
              <div style={{width:70}}><Tag c={tC[n.tier]}>{n.tier}</Tag></div>
              <div style={{width:56,display:"flex",gap:2}}>{n.id&&<><IconBtn onClick={()=>openEdit(n)} label="✎" color={t.bl}/><IconBtn onClick={()=>del(n.id)} label="✕" color={t.rd}/></>}</div>
            </div>)}
            {ls.length>200&&<div style={{padding:"12px 18px",color:t.td,fontSize:12,textAlign:"center"}}>Showing 200 of {ls.length} — use filters or search to narrow down</div>}
          </div>
        </>
      ):(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12,padding:16,maxHeight:520,overflow:"auto"}}>
          {ls.slice(0,100).map((n,i)=><div key={n.id||i} style={{background:t.s2,borderRadius:12,padding:"14px",border:"1px solid "+t.bd}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
              <div style={{width:38,height:38,borderRadius:"50%",background:(tC[n.tier]||t.td)+"30",display:"flex",alignItems:"center",justifyContent:"center",color:tC[n.tier],fontWeight:900,fontSize:16,flexShrink:0}}>{(n.name||"?")[0]}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:700,color:t.tw,fontSize:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{n.name}</div>
                <div style={{fontSize:10,color:t.td}}>{n.handle}</div>
              </div>
            </div>
            <Tag c={tC[n.tier]} size="lg">{n.tier}</Tag>
            {n.category&&<div style={{marginTop:8,fontSize:10,color:t.td}}>{n.category}</div>}
            <div style={{marginTop:8,display:"flex",gap:6,flexWrap:"wrap"}}>
              {n.ig_followers&&n.ig_followers!=="0"&&<span style={{fontSize:10,color:"#E1306C",fontWeight:700}}>📸 {n.ig_followers}</span>}
              {n.tiktok_followers&&n.tiktok_followers!=="0"&&<span style={{fontSize:10,color:"#00F2EA",fontWeight:700}}>🎵 {n.tiktok_followers}</span>}
              {n.engagement>0&&<span style={{fontSize:10,color:t.gn,fontWeight:700}}>{n.engagement}% eng</span>}
            </div>
            {n.id&&<div style={{marginTop:8,display:"flex",gap:4}}>
              <IconBtn onClick={()=>openEdit(n)} label="✎ Edit" color={t.bl}/>
              <IconBtn onClick={()=>del(n.id)} label="✕" color={t.rd}/>
            </div>}
          </div>)}
        </div>
      )}
    </Panel>

    <Modal open={mo} onClose={()=>smo(false)} title={er?"Edit Influencer":"Add Influencer"}>
      <Field label="Full Name" value={fo.name} onChange={v=>sfo({...fo,name:v})}/>
      <Field label="Handle (@username)" value={fo.handle} onChange={v=>sfo({...fo,handle:v})}/>
      <Field label="Category / Niche" value={fo.category} onChange={v=>sfo({...fo,category:v})}/>
      <Field label="City" value={fo.city} onChange={v=>sfo({...fo,city:v})}/>
      <Field label="Nationality" value={fo.nationality} onChange={v=>sfo({...fo,nationality:v})}/>
      <Field label="Instagram Followers" value={fo.ig_followers} onChange={v=>sfo({...fo,ig_followers:v})}/>
      <Field label="TikTok Followers" value={fo.tiktok_followers} onChange={v=>sfo({...fo,tiktok_followers:v})}/>
      <Field label="YouTube Subscribers" value={fo.youtube_followers} onChange={v=>sfo({...fo,youtube_followers:v})}/>
      <Field label="Engagement %" value={fo.engagement} onChange={v=>sfo({...fo,engagement:v})} type="number"/>
      <Field label="Tier" value={fo.tier} onChange={v=>sfo({...fo,tier:v})} opts={["Mega","Macro","Mid","Micro"]}/>
      <SaveBtn onClick={save} loading={sv}/>
    </Modal>
  </div>;
}

// ── QUOTATIONS ────────────────────────────────────────────────────────────────
function QuotPage({qt,rl}){
  const t=useContext(Ctx);
  const[fi,sfi]=useState("All");const[se,sse]=useState("");
  const[mo,smo]=useState(false);const[er,ser]=useState(null);const[sv,ssv]=useState(false);
  const dF={client:"",status:"Pending",value:0,notes:""};
  const[fo,sfo]=useState(dF);

  const sts=["All","Awarded","Pending","Dropped","Lost"];
  let ls=qt;
  if(fi!=="All")ls=ls.filter(q=>q.status===fi);
  if(se)ls=ls.filter(q=>(q.client||"").toLowerCase().includes(se.toLowerCase()));

  const qs={};qt.forEach(q=>qs[q.status]=(qs[q.status]||0)+1);
  const qD=[{k:"Awarded",v:qs.Awarded||0,c:t.gn},{k:"Pending",v:qs.Pending||0,c:t.am},{k:"Dropped",v:qs.Dropped||0,c:t.td},{k:"Lost",v:qs.Lost||0,c:t.rd}];
  const stC={Awarded:t.gn,Dropped:t.td,Lost:t.rd,Pending:t.am};

  const save=async()=>{if(!fo.client.trim())return;ssv(true);const d={...fo,value:Number(fo.value)};if(er){await supabase.from("quotations").update(d).eq("id",er.id)}else{await supabase.from("quotations").insert([d])}ssv(false);smo(false);ser(null);sfo(dF);rl()};
  const del=async id=>{if(!confirm("Delete?"))return;await supabase.from("quotations").delete().eq("id",id);rl()};
  const openEdit=r=>{ser(r);sfo({client:r.client||"",status:r.status||"Pending",value:r.value||0,notes:r.notes||""});smo(true)};

  return <div style={{display:"flex",flexDirection:"column",gap:14}}>
    <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
      <Stat label="Total" value={qt.length} accent={t.bl}/>
      <Stat label="Awarded" value={qs.Awarded||0} sub={qt.length?((qs.Awarded||0)/qt.length*100).toFixed(0)+"% win rate":""} accent={t.gn}/>
      <Stat label="Pending" value={qs.Pending||0} sub="Need follow-up" good={false} accent={t.am}/>
      <Stat label="Dropped + Lost" value={(qs.Dropped||0)+(qs.Lost||0)} good={false} accent={t.rd}/>
    </div>

    <Panel title="Breakdown"><div style={{padding:"16px 18px"}}><Ring data={qD} size={120}/></div></Panel>

    <Panel title={"Quotations ("+ls.length+")"} right={
      <div style={{display:"flex",gap:6,alignItems:"center"}}>
        <SearchBar value={se} onChange={sse} placeholder="Search client..."/>
        {sts.map(s=><Btn key={s} active={fi===s} label={s+(qs[s]?" ("+qs[s]+")":"")} onClick={()=>sfi(s)}/>)}
        <GreenBtn onClick={()=>{ser(null);sfo(dF);smo(true)}} label="+ Add"/>
      </div>
    }>
      <div style={{maxHeight:500,overflow:"auto"}}>
        {ls.map((q,i)=><div key={q.id||i} style={{display:"flex",alignItems:"center",padding:"11px 18px",borderBottom:"1px solid "+t.bd,gap:10,background:q.status==="Pending"?"rgba(245,158,11,.04)":q.status==="Awarded"?"rgba(16,185,129,.04)":"transparent"}} onMouseEnter={e=>e.currentTarget.style.background=t.s3} onMouseLeave={e=>e.currentTarget.style.background=q.status==="Pending"?"rgba(245,158,11,.04)":q.status==="Awarded"?"rgba(16,185,129,.04)":"transparent"}>
          <div style={{width:32,height:32,borderRadius:9,background:(stC[q.status]||t.bd)+"20",display:"flex",alignItems:"center",justifyContent:"center",color:stC[q.status],fontWeight:900,fontSize:13,flexShrink:0}}>{(q.client||"?")[0]}</div>
          <div style={{flex:1}}><div style={{fontWeight:700,color:t.tw,fontSize:13}}>{q.client}</div>{q.value>0&&<div style={{fontSize:11,color:t.td}}>{Number(q.value).toLocaleString()} AED</div>}</div>
          {q.notes&&<div style={{flex:2,fontSize:11,color:t.td,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{q.notes}</div>}
          <Tag c={stC[q.status]||t.am} size="lg">{q.status}</Tag>
          {q.id&&<><IconBtn onClick={()=>openEdit(q)} label="✎" color={t.bl}/><IconBtn onClick={()=>del(q.id)} label="✕" color={t.rd}/></>}
        </div>)}
      </div>
    </Panel>

    <Modal open={mo} onClose={()=>smo(false)} title={er?"Edit Quotation":"Add Quotation"}>
      <Field label="Client / Company" value={fo.client} onChange={v=>sfo({...fo,client:v})}/>
      <Field label="Value (AED)" value={fo.value} onChange={v=>sfo({...fo,value:v})} type="number"/>
      <Field label="Status" value={fo.status} onChange={v=>sfo({...fo,status:v})} opts={["Awarded","Pending","Dropped","Lost"]}/>
      <Field label="Notes" value={fo.notes||""} onChange={v=>sfo({...fo,notes:v})} rows={3}/>
      <SaveBtn onClick={save} loading={sv}/>
    </Modal>
  </div>;
}

// ── EXPENSES ──────────────────────────────────────────────────────────────────
function ExpPage({exp,rl}){
  const t=useContext(Ctx);
  const[mo,smo]=useState(false);const[er,ser]=useState(null);const[sv,ssv]=useState(false);
  const dF={item:"",amount:0};const[fo,sfo]=useState(dF);

  const total=exp.reduce((a,e)=>a+(e.amount||0),0);
  const sorted=[...exp].sort((a,b)=>(b.amount||0)-(a.amount||0));

  const save=async()=>{if(!fo.item.trim())return;ssv(true);const d={item:fo.item,amount:Number(fo.amount),frequency:"Monthly"};if(er){await supabase.from("expenses").update(d).eq("id",er.id)}else{await supabase.from("expenses").insert([d])}ssv(false);smo(false);ser(null);sfo(dF);rl()};
  const del=async id=>{if(!confirm("Delete?"))return;await supabase.from("expenses").delete().eq("id",id);rl()};

  return <div style={{display:"flex",flexDirection:"column",gap:14}}>
    <Stat label="Monthly Expenses" value={total.toLocaleString()+" AED"} sub={exp.length+" line items"} good={false} accent={t.am}/>
    <Panel title="Expense breakdown"><div style={{padding:"14px 18px"}}><HorizBars data={sorted.map(e=>({k:e.item,v:e.amount||0,c:t.am}))} h={20}/></div></Panel>
    <Panel title="All Expenses" right={<GreenBtn onClick={()=>{ser(null);sfo(dF);smo(true)}} label="+ Add"/>}>
      <div style={{padding:"0 18px"}}>
        {sorted.map((e,i)=><div key={e.id||i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 0",borderBottom:"1px solid "+t.bd}} onMouseEnter={el=>el.currentTarget.style.background=t.s3} onMouseLeave={el=>el.currentTarget.style.background="transparent"}>
          <div style={{fontSize:13,fontWeight:600,color:t.tw}}>{e.item}</div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{fontSize:15,fontWeight:800,color:t.am}}>{(e.amount||0).toLocaleString()} AED</div>
            {e.id&&<><IconBtn onClick={()=>{ser(e);sfo({item:e.item||"",amount:e.amount||0});smo(true)}} label="✎" color={t.bl}/><IconBtn onClick={()=>del(e.id)} label="✕" color={t.rd}/></>}
          </div>
        </div>)}
      </div>
    </Panel>
    <Modal open={mo} onClose={()=>smo(false)} title={er?"Edit Expense":"Add Expense"}>
      <Field label="Item" value={fo.item} onChange={v=>sfo({...fo,item:v})}/>
      <Field label="Amount (AED)" value={fo.amount} onChange={v=>sfo({...fo,amount:v})} type="number"/>
      <SaveBtn onClick={save} loading={sv}/>
    </Modal>
  </div>;
}

// ── CONTACTS ─────────────────────────────────────────────────────────────────
function ContactsPage(){
  const t=useContext(Ctx);
  const[rows,setRows]=useState([]);const[total,setTotal]=useState(0);
  const[se,sse]=useState("");const[query,setQuery]=useState("");
  const[page,setPage]=useState(0);const[loading,setLoading]=useState(true);
  const[tab,setTab]=useState("b2b");
  const[catFilter,setCatFilter]=useState("All");
  const[mo,smo]=useState(false);const[er,ser]=useState(null);const[sv,ssv]=useState(false);
  const PER=200;
  const dF={company:"",category:"",contact_person:"",position:"",email:"",phone:"",location:"Dubai",type:""};
  const[fo,sfo]=useState(dF);

  const fetch=useCallback(async(q,pg,tb,cf)=>{
    setLoading(true);
    let qb=supabase.from("contacts").select("*",{count:"exact"});
    if(tb==="b2b")qb=qb.neq("industry","Property Owner");
    else if(tb==="realestate")qb=qb.eq("industry","Property Owner");
    if(cf&&cf!=="All")qb=qb.eq("category",cf);
    if(q)qb=qb.or("company.ilike.%"+q+"%,email.ilike.%"+q+"%,category.ilike.%"+q+"%,contact_person.ilike.%"+q+"%");
    qb=qb.order("id").range(pg*PER,(pg+1)*PER-1);
    const{data,count}=await qb;
    setRows(data||[]);if(count!==null)setTotal(count);
    setLoading(false);
  },[]);

  useEffect(()=>{fetch(query,page,tab,catFilter)},[query,page,tab,catFilter,fetch]);

  const doSearch=()=>{setPage(0);setQuery(se)};
  const save=async()=>{if(!fo.company.trim())return;ssv(true);if(er){await supabase.from("contacts").update(fo).eq("id",er.id)}else{await supabase.from("contacts").insert([fo])}ssv(false);smo(false);ser(null);sfo(dF);fetch(query,page,tab,catFilter)};
  const del=async id=>{if(!confirm("Delete?"))return;await supabase.from("contacts").delete().eq("id",id);fetch(query,page,tab,catFilter)};
  const openEdit=r=>{ser(r);sfo({company:r.company||"",category:r.category||"",contact_person:r.contact_person||"",position:r.position||"",email:r.email||"",phone:r.phone||"",location:r.location||"Dubai",type:r.type||""});smo(true)};

  const openCompose=(c)=>{
    if(!c.email)return alert("No email address for this contact");
    window.open("mailto:"+c.email+"?subject=ALBAB Media — Hello "+c.company);
  };

  const pages=Math.ceil(total/PER);

  const cats=["All","Hotel","Restaurant","Clinic / Healthcare","Food & Beverage","Government","Fashion & Products","Education","Sports & Activities","Property Owner","Events / Exhibition","Industry / Factory","B2B"];

  const tabConfig=[
    {k:"all",l:"🌐 All ("+total.toLocaleString()+")"},
    {k:"b2b",l:"🏢 B2B / ABM"},
    {k:"realestate",l:"🏠 Real Estate"},
  ];

  return <div style={{display:"flex",flexDirection:"column",gap:14}}>
    <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
      <Stat label="Total contacts" value={total.toLocaleString()} sub="in database" accent={t.bl}/>
      <Stat label="Showing" value={rows.length} sub={"Page "+(page+1)+" of "+pages} accent={t.tl}/>
    </div>

    {/* Smart tabs */}
    <div style={{display:"flex",gap:3,background:t.s2,borderRadius:12,padding:4,width:"fit-content"}}>
      {tabConfig.map(tb=><button key={tb.k} onClick={()=>{setTab(tb.k);setPage(0);setCatFilter("All");}} style={{padding:"8px 16px",borderRadius:9,border:"none",background:tab===tb.k?t.bl:"transparent",color:tab===tb.k?"#fff":t.tm,fontSize:12,fontWeight:700,cursor:"pointer"}}>{tb.l}</button>)}
    </div>

    {/* Category filters */}
    <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
      {cats.map(c=><Btn key={c} active={catFilter===c} label={c} onClick={()=>{setCatFilter(c);setPage(0);}}/>)}
    </div>

    <Panel title={"Contacts ("+total.toLocaleString()+")"} right={
      <div style={{display:"flex",gap:6,alignItems:"center"}}>
        <SearchBar value={se} onChange={sse} onKey={e=>e.key==="Enter"&&doSearch()} placeholder="Search company, email, category..." width={240}/>
        <BlueBtn onClick={doSearch} label="Search"/>
        {query&&<button onClick={()=>{sse("");setQuery("");setPage(0);}} style={{padding:"6px 12px",borderRadius:8,border:"none",background:"transparent",color:t.tm,fontSize:12,cursor:"pointer"}}>Clear</button>}
        <GreenBtn onClick={()=>{ser(null);sfo(dF);smo(true)}} label="+ Add"/>
      </div>
    }>
      <div style={{display:"flex",padding:"7px 18px",borderBottom:"1px solid "+t.bd,fontSize:10,color:t.td,fontWeight:700,textTransform:"uppercase",letterSpacing:.5}}>
        <div style={{flex:2}}>Company</div><div style={{flex:1.5}}>Category</div>
        <div style={{flex:1.5}}>Contact Person</div><div style={{flex:2}}>Email</div>
        <div style={{flex:1}}>Phone</div><div style={{width:90}}>Actions</div>
      </div>
      <div style={{maxHeight:520,overflow:"auto"}}>
        {loading?<div style={{padding:40,textAlign:"center",color:t.td}}>Loading...</div>:
        rows.length===0?<div style={{padding:40,textAlign:"center",color:t.td}}>No contacts found. Try a different search or filter.</div>:
        rows.map((c,i)=><div key={c.id||i} style={{display:"flex",alignItems:"center",padding:"9px 18px",borderBottom:"1px solid "+t.bd,fontSize:12,gap:4}} onMouseEnter={e=>e.currentTarget.style.background=t.s3} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
          <div style={{flex:2,fontWeight:700,color:t.tw,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.company||"—"}</div>
          <div style={{flex:1.5}}>{c.category?<Tag c={t.pr}>{c.category}</Tag>:<span style={{color:t.td}}>—</span>}</div>
          <div style={{flex:1.5,color:t.tm,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.contact_person||"—"}</div>
          <div style={{flex:2,color:t.bl,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.email||"—"}</div>
          <div style={{flex:1,color:t.td,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.phone||"—"}</div>
          <div style={{width:90,display:"flex",gap:2}}>
            {c.email&&<button onClick={()=>openCompose(c)} style={{padding:"3px 7px",borderRadius:5,border:"1px solid "+t.bl+"44",background:t.bG,color:t.bl,fontSize:10,fontWeight:700,cursor:"pointer"}}>✉ Email</button>}
            <IconBtn onClick={()=>openEdit(c)} label="✎" color={t.bl}/>
            <IconBtn onClick={()=>del(c.id)} label="✕" color={t.rd}/>
          </div>
        </div>)}
      </div>
      {pages>1&&<div style={{padding:"10px 18px",borderTop:"1px solid "+t.bd,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <button onClick={()=>setPage(p=>Math.max(0,p-1))} disabled={page===0} style={{padding:"5px 14px",borderRadius:8,border:"1px solid "+t.bd,background:"transparent",color:page===0?t.td:t.tw,cursor:page===0?"not-allowed":"pointer",fontSize:12}}>← Prev</button>
        <span style={{fontSize:12,color:t.td}}>Page {page+1} of {pages} · {total.toLocaleString()} contacts</span>
        <button onClick={()=>setPage(p=>Math.min(pages-1,p+1))} disabled={page>=pages-1} style={{padding:"5px 14px",borderRadius:8,border:"1px solid "+t.bd,background:"transparent",color:page>=pages-1?t.td:t.tw,cursor:page>=pages-1?"not-allowed":"pointer",fontSize:12}}>Next →</button>
      </div>}
    </Panel>

    <Modal open={mo} onClose={()=>smo(false)} title={er?"Edit Contact":"Add Contact"}>
      <Field label="Company / Name" value={fo.company} onChange={v=>sfo({...fo,company:v})}/>
      <Field label="Category / Industry" value={fo.category} onChange={v=>sfo({...fo,category:v})}/>
      <Field label="Contact Person" value={fo.contact_person} onChange={v=>sfo({...fo,contact_person:v})}/>
      <Field label="Position / Title" value={fo.position} onChange={v=>sfo({...fo,position:v})}/>
      <Field label="Email" value={fo.email} onChange={v=>sfo({...fo,email:v})}/>
      <Field label="Phone" value={fo.phone} onChange={v=>sfo({...fo,phone:v})}/>
      <Field label="Location / Area" value={fo.location} onChange={v=>sfo({...fo,location:v})}/>
      <SaveBtn onClick={save} loading={sv}/>
    </Modal>
  </div>;
}

// ── EVENTS ────────────────────────────────────────────────────────────────────
const EV_TYPES=["Campaign","Shoot","Meeting","Deadline","Event","Follow-up","Presentation","Other"];
const EV_STATUS=["Upcoming","In Progress","Done","Cancelled"];
const evC={"Campaign":"#3B82F6","Shoot":"#EC4899","Meeting":"#A78BFA","Deadline":"#EF4444","Event":"#10B981","Follow-up":"#F59E0B","Presentation":"#14B8A6","Other":"#64748B"};

function EventsPage(){
  const t=useContext(Ctx);
  const[events,setEvents]=useState([]);const[loading,setLoading]=useState(true);
  const[mo,smo]=useState(false);const[er,ser]=useState(null);const[sv,ssv]=useState(false);
  const[view,setView]=useState("calendar");const[tab,setTab]=useState("mine");
  const now=new Date();
  const[yr,setYr]=useState(now.getFullYear());const[mo2,setMo]=useState(now.getMonth());
  const dF={title:"",type:"Campaign",date:"",end_date:"",client:"",notes:"",status:"Upcoming"};
  const[fo,sfo]=useState(dF);

  const load=useCallback(async()=>{setLoading(true);const{data}=await supabase.from("events").select("*").order("date");setEvents(data||[]);setLoading(false);},[]);
  useEffect(()=>{load()},[load]);

  const save=async()=>{if(!fo.title.trim()||!fo.date)return;ssv(true);if(er){await supabase.from("events").update(fo).eq("id",er.id)}else{await supabase.from("events").insert([fo])}ssv(false);smo(false);ser(null);sfo(dF);load()};
  const del=async id=>{if(!confirm("Delete?"))return;await supabase.from("events").delete().eq("id",id);load()};
  const openEdit=r=>{ser(r);sfo({title:r.title||"",type:r.type||"Campaign",date:r.date||"",end_date:r.end_date||"",client:r.client||"",notes:r.notes||"",status:r.status||"Upcoming"});smo(true)};

  const fd=new Date(yr,mo2,1).getDay(),dim=new Date(yr,mo2+1,0).getDate();
  const mns=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const todayStr=now.toISOString().split("T")[0];
  const byDate={};events.forEach(e=>{const d=e.date?.split("T")[0];if(d){if(!byDate[d])byDate[d]=[];byDate[d].push(e);}});
  const upcoming=UAE_EVENTS.filter(e=>daysUntil(e.date)>=0&&daysUntil(e.date)<=90).sort((a,b)=>daysUntil(a.date)-daysUntil(b.date));
  const counts={};EV_STATUS.forEach(s=>counts[s]=events.filter(e=>e.status===s).length);

  return <div style={{display:"flex",flexDirection:"column",gap:14}}>
    <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
      <Stat label="My Events" value={events.length} accent={t.bl}/>
      <Stat label="Upcoming" value={counts["Upcoming"]||0} accent={t.tl}/>
      <Stat label="UAE Events (90d)" value={upcoming.length} sub="opportunities" accent={t.pr}/>
      <Stat label="Done" value={counts["Done"]||0} accent={t.gn}/>
    </div>

    <div style={{display:"flex",gap:3,background:t.s2,borderRadius:12,padding:4,width:"fit-content"}}>
      {[{k:"mine",l:"📋 My Events"},{k:"uae",l:"🇦🇪 UAE Events Calendar"}].map(tb=><button key={tb.k} onClick={()=>setTab(tb.k)} style={{padding:"8px 16px",borderRadius:9,border:"none",background:tab===tb.k?t.bl:"transparent",color:tab===tb.k?"#fff":t.tm,fontSize:12,fontWeight:700,cursor:"pointer"}}>{tb.l}</button>)}
    </div>

    {tab==="uae"?(
      <Panel title="🇦🇪 UAE Events — Full Calendar 2025/2026" sub="Never miss an opportunity">
        <div style={{maxHeight:600,overflow:"auto"}}>
          {UAE_EVENTS.sort((a,b)=>daysUntil(a.date)-daysUntil(b.date)).map((ev,i)=>{
            const d=daysUntil(ev.date),past=d<0;
            return <div key={i} style={{display:"flex",gap:14,padding:"14px 18px",borderBottom:"1px solid "+t.bd,opacity:past?.5:1}} onMouseEnter={e=>e.currentTarget.style.background=t.s3} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <div style={{textAlign:"center",minWidth:48,flexShrink:0}}>
                <div style={{fontSize:22,fontWeight:900,color:past?t.td:d<=7?t.rd:d<=30?t.am:t.bl,lineHeight:1}}>{Math.abs(d)}</div>
                <div style={{fontSize:9,color:t.td}}>{past?"ago":"days"}</div>
              </div>
              <div style={{width:3,background:past?t.td:d<=7?t.rd:d<=30?t.am:t.bl,borderRadius:2,flexShrink:0}}/>
              <div style={{flex:1}}>
                <div style={{display:"flex",gap:8,marginBottom:4,alignItems:"center"}}>
                  <div style={{fontSize:13,fontWeight:800,color:t.tw}}>{ev.title}</div>
                  <Tag c={t.tl}>{ev.cat}</Tag>
                </div>
                <div style={{fontSize:11,color:t.td,marginBottom:3}}>📍 {ev.venue} · {new Date(ev.date).toLocaleDateString("en-AE",{day:"numeric",month:"short",year:"numeric"})}</div>
                <div style={{fontSize:11,color:t.tm}}>{ev.desc}</div>
              </div>
              {!past&&<button onClick={()=>{setTab("mine");setTimeout(()=>{ser(null);sfo({...dF,date:ev.date,title:"Plan: "+ev.title,type:"Event"});smo(true)},100);}} style={{padding:"6px 12px",borderRadius:8,border:"1px solid "+t.bd,background:"transparent",color:t.bl,fontSize:11,fontWeight:700,cursor:"pointer",alignSelf:"center",flexShrink:0}}>+ Plan</button>}
            </div>;
          })}
        </div>
      </Panel>
    ):(
      <>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
          <div style={{display:"flex",gap:4}}>
            <Btn active={view==="calendar"} label="📅 Calendar" onClick={()=>setView("calendar")}/>
            <Btn active={view==="list"} label="☰ List" onClick={()=>setView("list")}/>
          </div>
          {view==="calendar"&&<div style={{display:"flex",alignItems:"center",gap:10}}>
            <button onClick={()=>{let m=mo2-1,y=yr;if(m<0){m=11;y--;}setMo(m);setYr(y);}} style={{padding:"4px 10px",borderRadius:8,border:"1px solid "+t.bd,background:"transparent",color:t.tw,cursor:"pointer"}}>←</button>
            <span style={{fontWeight:800,color:t.tw,fontSize:14,minWidth:130,textAlign:"center"}}>{["January","February","March","April","May","June","July","August","September","October","November","December"][mo2]} {yr}</span>
            <button onClick={()=>{let m=mo2+1,y=yr;if(m>11){m=0;y++;}setMo(m);setYr(y);}} style={{padding:"4px 10px",borderRadius:8,border:"1px solid "+t.bd,background:"transparent",color:t.tw,cursor:"pointer"}}>→</button>
          </div>}
          <GreenBtn onClick={()=>{ser(null);sfo(dF);smo(true)}} label="+ Add Event"/>
        </div>
        {loading?<div style={{padding:40,textAlign:"center",color:t.td}}>Loading...</div>:view==="calendar"?(
          <Panel title="">
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",borderBottom:"1px solid "+t.bd}}>
              {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d=><div key={d} style={{padding:"8px 0",textAlign:"center",fontSize:10,fontWeight:700,color:t.td,textTransform:"uppercase"}}>{d}</div>)}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)"}}>
              {Array.from({length:fd}).map((_,i)=><div key={"e"+i} style={{minHeight:85,borderRight:"1px solid "+t.bd,borderBottom:"1px solid "+t.bd,background:t.s2}}/>)}
              {Array.from({length:dim}).map((_,i)=>{
                const day=i+1,dateStr=yr+"-"+String(mo2+1).padStart(2,"0")+"-"+String(day).padStart(2,"0"),dayEvs=byDate[dateStr]||[],isToday=dateStr===todayStr;
                return <div key={day} onClick={()=>{ser(null);sfo({...dF,date:dateStr});smo(true);}} style={{minHeight:85,borderRight:"1px solid "+t.bd,borderBottom:"1px solid "+t.bd,padding:"5px 7px",cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.background=t.s3} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <div style={{width:24,height:24,borderRadius:"50%",background:isToday?t.bl:"transparent",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:3}}>
                    <span style={{fontSize:11,fontWeight:isToday?900:400,color:isToday?"#fff":t.tm}}>{day}</span>
                  </div>
                  {dayEvs.slice(0,2).map((ev,ei)=><div key={ei} onClick={e=>{e.stopPropagation();openEdit(ev);}} style={{fontSize:9,fontWeight:700,color:"#fff",background:evC[ev.type]||t.bl,borderRadius:3,padding:"2px 5px",marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",cursor:"pointer"}}>{ev.title}</div>)}
                  {dayEvs.length>2&&<div style={{fontSize:8,color:t.td}}>+{dayEvs.length-2} more</div>}
                </div>;
              })}
            </div>
          </Panel>
        ):(
          <Panel title={"All Events ("+events.length+")"}>
            <div style={{maxHeight:500,overflow:"auto"}}>
              {events.length===0?<div style={{padding:40,textAlign:"center",color:t.td}}>No events yet. Click + Add Event to start.</div>:
              events.map((ev,i)=><div key={ev.id||i} style={{display:"flex",alignItems:"center",padding:"11px 18px",borderBottom:"1px solid "+t.bd,gap:10}} onMouseEnter={e=>e.currentTarget.style.background=t.s3} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <div style={{width:8,height:8,borderRadius:"50%",background:evC[ev.type]||t.bl,flexShrink:0}}/>
                <div style={{flex:2}}><div style={{fontWeight:700,color:t.tw,fontSize:13}}>{ev.title}</div><div style={{fontSize:11,color:t.td}}>{ev.client}</div></div>
                <div style={{width:85,fontSize:11,color:t.tm}}>{ev.date?.split("T")[0]||"—"}</div>
                <Tag c={evC[ev.type]}>{ev.type}</Tag>
                <Tag c={ev.status==="Done"?t.gn:ev.status==="Cancelled"?t.rd:ev.status==="In Progress"?t.am:t.bl}>{ev.status}</Tag>
                <IconBtn onClick={()=>openEdit(ev)} label="✎" color={t.bl}/>
                <IconBtn onClick={()=>del(ev.id)} label="✕" color={t.rd}/>
              </div>)}
            </div>
          </Panel>
        )}
      </>
    )}

    <Modal open={mo} onClose={()=>smo(false)} title={er?"Edit Event":"Add Event"}>
      <Field label="Title" value={fo.title} onChange={v=>sfo({...fo,title:v})}/>
      <Field label="Type" value={fo.type} onChange={v=>sfo({...fo,type:v})} opts={EV_TYPES}/>
      <Field label="Status" value={fo.status} onChange={v=>sfo({...fo,status:v})} opts={EV_STATUS}/>
      <Field label="Start Date" value={fo.date} onChange={v=>sfo({...fo,date:v})} type="date"/>
      <Field label="End Date (optional)" value={fo.end_date} onChange={v=>sfo({...fo,end_date:v})} type="date"/>
      <Field label="Client / Brand" value={fo.client} onChange={v=>sfo({...fo,client:v})}/>
      <Field label="Notes" value={fo.notes} onChange={v=>sfo({...fo,notes:v})} rows={3}/>
      <SaveBtn onClick={save} loading={sv}/>
    </Modal>
  </div>;
}

// ── SOCIAL MEDIA ──────────────────────────────────────────────────────────────
const SM_PLAT=["Instagram","TikTok","YouTube","LinkedIn","X (Twitter)","Facebook","Snapchat"];
const pC2={"Instagram":"#E1306C","TikTok":"#00F2EA","YouTube":"#FF0000","LinkedIn":"#0A66C2","X (Twitter)":"#1DA1F2","Facebook":"#1877F2","Snapchat":"#FFFC00"};
const pIcon={"Instagram":"📸","TikTok":"🎵","YouTube":"▶","LinkedIn":"💼","X (Twitter)":"🐦","Facebook":"f","Snapchat":"👻"};

function SocialPage(){
  const t=useContext(Ctx);
  const[accounts,setAccounts]=useState([]);const[loading,setLoading]=useState(true);
  const[mo,smo]=useState(false);const[er,ser]=useState(null);const[sv,ssv]=useState(false);
  const[fi,sfi]=useState("All");
  const dF={account_name:"",handle:"",platform:"Instagram",followers:0,following:0,posts:0,engagement:0,monthly_reach:0,notes:""};
  const[fo,sfo]=useState(dF);

  const load=useCallback(async()=>{setLoading(true);const{data}=await supabase.from("social_media").select("*").order("followers",{ascending:false});setAccounts(data||[]);setLoading(false);},[]);
  useEffect(()=>{load()},[load]);

  const save=async()=>{if(!fo.account_name.trim())return;ssv(true);const d={...fo,followers:Number(fo.followers),following:Number(fo.following),posts:Number(fo.posts),engagement:Number(fo.engagement),monthly_reach:Number(fo.monthly_reach)};if(er){await supabase.from("social_media").update(d).eq("id",er.id)}else{await supabase.from("social_media").insert([d])}ssv(false);smo(false);ser(null);sfo(dF);load()};
  const del=async id=>{if(!confirm("Delete?"))return;await supabase.from("social_media").delete().eq("id",id);load()};
  const openEdit=r=>{ser(r);sfo({account_name:r.account_name||"",handle:r.handle||"",platform:r.platform||"Instagram",followers:r.followers||0,following:r.following||0,posts:r.posts||0,engagement:r.engagement||0,monthly_reach:r.monthly_reach||0,notes:r.notes||""});smo(true)};

  const filtered=fi==="All"?accounts:accounts.filter(a=>a.platform===fi);
  const totalF=accounts.reduce((a,c)=>a+(c.followers||0),0);
  const platBars=Object.entries(accounts.reduce((m,a)=>{m[a.platform]=(m[a.platform]||0)+(a.followers||0);return m;},{})).sort((a,b)=>b[1]-a[1]).map(([k,v])=>({k,v,c:pC2[k]||"#64748B"}));

  const tips=[
    {i:"🕐",t:"Best UAE Instagram times: 7-9am, 12-2pm, 7-10pm (Gulf time)"},
    {i:"📈",t:"Reels get 3x more reach than static posts on Instagram"},
    {i:"🎯",t:"TikTok: Post 3-5x per week for consistent algorithm growth"},
    {i:"💡",t:"Arabic captions alongside English boost UAE reach by ~40%"},
    {i:"🔥",t:"Stories with polls get 2x more engagement than regular stories"},
    {i:"📊",t:"LinkedIn B2B: Tuesday–Thursday 8-10am gets highest engagement"},
  ];

  return <div style={{display:"flex",flexDirection:"column",gap:14}}>
    <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
      <Stat label="Accounts tracked" value={accounts.length} accent={t.bl}/>
      <Stat label="Total followers" value={totalF.toLocaleString()} accent={t.pk}/>
      <Stat label="Platforms" value={new Set(accounts.map(a=>a.platform)).size} accent={t.tl}/>
    </div>

    <Panel title="💡 UAE Social Media Intelligence" sub="Real best practices for this market">
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:0}}>
        {tips.map((tip,i)=><div key={i} style={{padding:"12px 16px",borderBottom:"1px solid "+t.bd,borderRight:i%3!==2?"1px solid "+t.bd:"none",display:"flex",gap:8,alignItems:"flex-start"}}>
          <span style={{fontSize:16,flexShrink:0}}>{tip.i}</span>
          <span style={{fontSize:11,color:t.tm,lineHeight:1.5}}>{tip.t}</span>
        </div>)}
      </div>
    </Panel>

    {platBars.length>0&&<Panel title="Followers by platform"><div style={{padding:"14px 18px"}}><HorizBars data={platBars} h={22}/></div></Panel>}

    <Panel title={"Accounts ("+filtered.length+")"} right={
      <div style={{display:"flex",gap:4,flexWrap:"wrap",alignItems:"center"}}>
        {["All",...SM_PLAT].map(p=><Btn key={p} active={fi===p} label={p} onClick={()=>sfi(p)}/>)}
        <GreenBtn onClick={()=>{ser(null);sfo(dF);smo(true)}} label="+ Add"/>
      </div>
    }>
      <div style={{maxHeight:480,overflow:"auto"}}>
        {loading?<div style={{padding:40,textAlign:"center",color:t.td}}>Loading...</div>:
        filtered.length===0?<div style={{padding:40,textAlign:"center",color:t.td}}>No accounts tracked yet. Add your social accounts to start monitoring.</div>:
        filtered.map((a,i)=><div key={a.id||i} style={{display:"flex",alignItems:"center",padding:"12px 18px",borderBottom:"1px solid "+t.bd,fontSize:12,gap:10}} onMouseEnter={e=>e.currentTarget.style.background=t.s3} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
          <div style={{width:36,height:36,borderRadius:10,background:(pC2[a.platform]||"#64748B")+"20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{pIcon[a.platform]}</div>
          <div style={{flex:2}}><div style={{fontWeight:700,color:t.tw}}>{a.account_name}</div><div style={{fontSize:10,color:t.td}}>{a.handle}</div></div>
          <Tag c={pC2[a.platform]||"#64748B"} size="lg">{a.platform}</Tag>
          <div style={{width:80,textAlign:"right"}}><div style={{fontWeight:800,color:t.tw,fontSize:13}}>{(a.followers||0).toLocaleString()}</div><div style={{fontSize:10,color:t.td}}>followers</div></div>
          <div style={{width:60,textAlign:"right"}}><div style={{fontWeight:700,color:(a.engagement||0)>=5?t.gn:(a.engagement||0)>=2?t.am:t.td}}>{(a.engagement||0).toFixed(1)}%</div><div style={{fontSize:10,color:t.td}}>eng.</div></div>
          <div style={{width:80,textAlign:"right"}}><div style={{color:t.tl,fontWeight:700}}>{(a.monthly_reach||0).toLocaleString()}</div><div style={{fontSize:10,color:t.td}}>reach/mo</div></div>
          {a.id&&<div style={{display:"flex",gap:2}}><IconBtn onClick={()=>openEdit(a)} label="✎" color={t.bl}/><IconBtn onClick={()=>del(a.id)} label="✕" color={t.rd}/></div>}
        </div>)}
      </div>
    </Panel>

    <Modal open={mo} onClose={()=>smo(false)} title={er?"Edit Account":"Add Social Account"}>
      <Field label="Account Name" value={fo.account_name} onChange={v=>sfo({...fo,account_name:v})}/>
      <Field label="Handle / URL" value={fo.handle} onChange={v=>sfo({...fo,handle:v})}/>
      <Field label="Platform" value={fo.platform} onChange={v=>sfo({...fo,platform:v})} opts={SM_PLAT}/>
      <Field label="Followers" value={fo.followers} onChange={v=>sfo({...fo,followers:v})} type="number"/>
      <Field label="Following" value={fo.following} onChange={v=>sfo({...fo,following:v})} type="number"/>
      <Field label="Posts" value={fo.posts} onChange={v=>sfo({...fo,posts:v})} type="number"/>
      <Field label="Monthly Reach" value={fo.monthly_reach} onChange={v=>sfo({...fo,monthly_reach:v})} type="number"/>
      <Field label="Engagement %" value={fo.engagement} onChange={v=>sfo({...fo,engagement:v})} type="number"/>
      <SaveBtn onClick={save} loading={sv}/>
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

  const check=useCallback(async()=>{try{const r=await fetch("/api/gmail/messages?action=profile");const d=await r.json();if(d.emailAddress){setConnected(true);setProfile(d);load("in:inbox");}}catch(e){}},[]);
  const load=async(q)=>{setLoading(true);setSelected(null);setMsgBody("");try{const r=await fetch("/api/gmail/messages?q="+encodeURIComponent(q));const d=await r.json();setMsgs(d.messages||[]);}catch(e){}setLoading(false);};
  const openMsg=async(msg)=>{setSelected(msg);try{const r=await fetch("/api/gmail/messages?action=message&messageId="+msg.id);const d=await r.json();const parts=d.payload?.parts||[d.payload];let body="";const ft=(p)=>{if(!p)return;if(p.mimeType==="text/plain"&&p.body?.data){body=atob(p.body.data.replace(/-/g,"+").replace(/_/g,"/"));return;}if(p.parts)p.parts.forEach(ft);};parts.forEach(ft);setMsgBody(body||msg.snippet);}catch(e){setMsgBody(msg.snippet);}};
  const send=async()=>{if(!mail.to||!mail.subject||!mail.body)return;setSending(true);const r=await fetch("/api/gmail/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(mail)});const d=await r.json();setSending(false);if(d.id){setSent(true);setCompose(false);setMail({to:"",subject:"",body:""});setTimeout(()=>setSent(false),4000);}};
  useEffect(()=>{check();},[check]);
  useEffect(()=>{const p=new URLSearchParams(window.location.search);if(p.get("connected")==="true"){check();window.history.replaceState({},"","/");}},[check]);

  if(!connected)return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:20,padding:80,textAlign:"center"}}>
      <div style={{fontSize:56}}>✉️</div>
      <div style={{fontSize:24,fontWeight:900,color:t.tw}}>Connect Your Gmail</div>
      <div style={{fontSize:14,color:t.td,maxWidth:440,lineHeight:1.7}}>Connect Gmail to read your inbox, search emails, compose and reply directly inside ALBAB Media — no need to switch tabs.</div>
      <button onClick={()=>window.location.href=authUrl} style={{padding:"14px 32px",borderRadius:12,border:"none",background:t.bl,color:"#fff",fontSize:15,fontWeight:800,cursor:"pointer"}}>🔗 Connect Gmail Account</button>
    </div>
  );

  return <div style={{display:"flex",flexDirection:"column",gap:14}}>
    <div style={{display:"flex",gap:12,alignItems:"center",flexWrap:"wrap"}}>
      <Stat label="Connected as" value={profile?.emailAddress||"Gmail"} sub="● Active" accent={t.gn}/>
      <Stat label="Loaded" value={msgs.length+" emails"} accent={t.bl}/>
      {sent&&<div style={{padding:"12px 18px",background:t.gG,border:"1px solid "+t.gn+"44",borderRadius:12,color:t.gn,fontWeight:700}}>✓ Email sent!</div>}
    </div>

    <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
      <SearchBar value={search} onChange={setSearch} onKey={e=>{if(e.key==="Enter"){setQuery(search||"in:inbox");load(search||"in:inbox");}}} placeholder="Search emails..." width={260}/>
      <BlueBtn onClick={()=>{setQuery(search||"in:inbox");load(search||"in:inbox");}} label="Search"/>
      {["in:inbox","in:sent","is:unread","is:starred"].map(q=><Btn key={q} active={query===q} label={q.replace("in:","").replace("is:","")} onClick={()=>{setQuery(q);load(q);}}/>)}
      <GreenBtn onClick={()=>setCompose(true)} label="✉ Compose"/>
    </div>

    <div style={{display:"grid",gridTemplateColumns:selected?"1fr 1fr":"1fr",gap:14}}>
      <Panel title={"Inbox ("+msgs.length+")"}>
        <div style={{maxHeight:520,overflow:"auto"}}>
          {loading?<div style={{padding:40,textAlign:"center",color:t.td}}>Loading emails...</div>:
          msgs.length===0?<div style={{padding:40,textAlign:"center",color:t.td}}>No messages found</div>:
          msgs.map((m,i)=><div key={i} onClick={()=>openMsg(m)} style={{padding:"12px 18px",borderBottom:"1px solid "+t.bd,cursor:"pointer",background:selected?.id===m.id?t.bG:"transparent"}} onMouseEnter={e=>e.currentTarget.style.background=t.s3} onMouseLeave={e=>e.currentTarget.style.background=selected?.id===m.id?t.bG:"transparent"}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
              <div style={{fontSize:12,fontWeight:m.unread?800:600,color:t.tw,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>{m.from?.split("<")[0].trim()||m.from}</div>
              <div style={{fontSize:10,color:t.td,flexShrink:0,marginLeft:8}}>{new Date(m.date).toLocaleDateString()}</div>
            </div>
            <div style={{fontSize:12,fontWeight:m.unread?700:500,color:m.unread?t.tw:t.tm,marginBottom:3}}>{m.subject}</div>
            <div style={{fontSize:11,color:t.td,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.snippet}</div>
          </div>)}
        </div>
      </Panel>
      {selected&&<Panel title={selected.subject} right={<button onClick={()=>{setSelected(null);setMsgBody("");}} style={{background:"transparent",border:"none",color:t.td,cursor:"pointer",fontSize:20}}>&times;</button>}>
        <div style={{padding:18}}>
          <div style={{fontSize:11,color:t.td,marginBottom:3}}>From: {selected.from}</div>
          <div style={{fontSize:11,color:t.td,marginBottom:16}}>{new Date(selected.date).toLocaleString()}</div>
          <div style={{fontSize:13,color:t.tx,lineHeight:1.8,whiteSpace:"pre-wrap",maxHeight:360,overflow:"auto"}}>{msgBody}</div>
          <button onClick={()=>{setCompose(true);setMail({to:selected.from.match(/<(.+)>/)?.[1]||selected.from,subject:"Re: "+selected.subject,body:"\n\n---\nOn "+new Date(selected.date).toLocaleString()+":\n"+msgBody.slice(0,300)+"..."});}} style={{marginTop:14,padding:"9px 18px",borderRadius:10,border:"none",background:t.bl,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"}}>↩ Reply</button>
        </div>
      </Panel>}
    </div>

    <Modal open={compose} onClose={()=>setCompose(false)} title="Compose Email">
      <Field label="To" value={mail.to} onChange={v=>setMail({...mail,to:v})}/>
      <Field label="Subject" value={mail.subject} onChange={v=>setMail({...mail,subject:v})}/>
      <Field label="Message" value={mail.body} onChange={v=>setMail({...mail,body:v})} rows={10}/>
      <SaveBtn onClick={send} loading={sending}/>
    </Modal>
  </div>;
}

// ── AI CO-PILOT ───────────────────────────────────────────────────────────────
function AiPage({ld,inv,qt,inf,exp}){
  const t=useContext(Ctx);
  const[msgs,setMsgs]=useState([{role:"assistant",content:"👋 Hi Bader! I'm your AI business co-pilot for ALBAB Media.\n\nI have full context on your business — ask me anything:\n\n• \"Who are my top clients?\"\n• \"Which leads should I prioritize today?\"\n• \"Draft a follow-up email for a client who hasn't paid\"\n• \"What influencers should I recommend for a food & beverage campaign?\"\n• \"How is my pipeline performing?\"\n• \"Write a cold outreach email to a new client\"\n• \"What events should ALBAB Media attend this year?\""}]);
  const[input,setInput]=useState("");const[loading,setLoading]=useState(false);
  const endRef=useRef(null);
  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"});},[msgs]);

  const ctx=()=>{
    const tr=inv.reduce((a,f)=>a+(f.revenue||0),0),tp=inv.reduce((a,f)=>a+(f.amount_paid||0),0);
    const pi={};ld.forEach(l=>pi[l.stage]=(pi[l.stage]||0)+1);
    const qs={};qt.forEach(q=>qs[q.status]=(qs[q.status]||0)+1);
    const topC=Object.entries(inv.reduce((m,f)=>{m[f.client]=(m[f.client]||0)+(f.revenue||0);return m;},{})).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([k,v])=>k+": "+v.toLocaleString()+" AED").join("; ");
    const commitL=ld.filter(l=>l.stage==="Commit").map(l=>l.client+"("+l.vertical+")").join(", ");
    const outstanding=inv.filter(f=>(f.revenue-f.amount_paid)>0).map(f=>f.client+": "+(f.revenue-f.amount_paid).toLocaleString()+" AED").join(", ");
    return `You are the AI business co-pilot for ALBAB Media, a UAE-based media and influencer marketing agency. Owner: Bader Al Barqawi.

LIVE BUSINESS DATA:
- Revenue: ${tr.toLocaleString()} AED total | ${tp.toLocaleString()} AED collected | ${(tr-tp).toLocaleString()} AED outstanding
- Pipeline: ${ld.length} leads | Prospect:${pi.Prospect||0} Funnel:${pi.Funnel||0} Upside:${pi.Upside||0} Commit:${pi.Commit||0} Awarded:${pi.Awarded||0} Lost:${pi.Lost||0}
- Commit stage (hot): ${commitL||"none"}
- Outstanding payments from: ${outstanding||"none"}
- Quotations: ${qt.length} | Awarded:${qs.Awarded||0} Pending:${qs.Pending||0}
- Top clients by revenue: ${topC}
- Influencer database: ${inf.length.toLocaleString()} influencers
- Monthly expenses: ${exp.reduce((a,e)=>a+(e.amount||0),0).toLocaleString()} AED

ABOUT ALBAB MEDIA:
- Influencer marketing, social media management, content creation, events
- Primary markets: UAE, Saudi Arabia, GCC, Jordan
- Key clients: Nestle, Nine71, Emirates NBD, Careem, Amazon MENA, Emaar, MAF, DAMAC
- Currency: AED. Location: UAE

Be direct, actionable, and specific. When drafting emails be professional and UAE-appropriate. When giving business advice use the actual data above.`;
  };

  const send=async()=>{
    if(!input.trim()||loading)return;
    const uMsg={role:"user",content:input};
    setMsgs(m=>[...m,uMsg]);setInput("");setLoading(true);
    try{
      const history=msgs.slice(-8).map(m=>({role:m.role,content:m.content}));
      const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:ctx(),messages:[...history,{role:"user",content:input}]})});
      const d=await r.json();
      setMsgs(m=>[...m,{role:"assistant",content:d.content?.[0]?.text||"Sorry, couldn't process that."}]);
    }catch(e){setMsgs(m=>[...m,{role:"assistant",content:"Connection error. Please try again."}]);}
    setLoading(false);
  };

  const quick=["Who owes me money?","Which leads to prioritize today?","Draft invoice follow-up email","Influencers for luxury campaign","Write cold outreach email","Upcoming UAE events to attend"];

  return <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 120px)",gap:12}}>
    <div style={{background:"linear-gradient(135deg,#1a1040,#0d1828)",border:"1px solid "+t.pr+"33",borderRadius:14,padding:"14px 18px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <div><div style={{fontSize:15,fontWeight:800,color:t.tw}}>🤖 AI Business Co-Pilot</div><div style={{fontSize:11,color:t.tm}}>Powered by Claude · Full access to your ALBAB Media data</div></div>
      <button onClick={()=>setMsgs([{role:"assistant",content:"Chat cleared. How can I help?"}])} style={{padding:"5px 12px",borderRadius:8,border:"1px solid "+t.bd,background:"transparent",color:t.td,fontSize:11,cursor:"pointer"}}>Clear chat</button>
    </div>
    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
      {quick.map((q,i)=><button key={i} onClick={()=>setInput(q)} style={{padding:"5px 12px",borderRadius:20,border:"1px solid "+t.bd,background:"transparent",color:t.tm,fontSize:11,cursor:"pointer"}}>{q}</button>)}
    </div>
    <div style={{flex:1,overflow:"auto",background:t.s1,borderRadius:14,border:"1px solid "+t.bd,padding:18,display:"flex",flexDirection:"column",gap:12}}>
      {msgs.map((m,i)=><div key={i} style={{display:"flex",gap:10,flexDirection:m.role==="user"?"row-reverse":"row",alignItems:"flex-start"}}>
        <div style={{width:30,height:30,borderRadius:"50%",background:m.role==="user"?t.bl:t.pr,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:900,flexShrink:0,color:"#fff"}}>{m.role==="user"?"B":"🤖"}</div>
        <div style={{maxWidth:"76%",background:m.role==="user"?t.bl:t.s2,color:m.role==="user"?"#fff":t.tx,padding:"11px 15px",borderRadius:m.role==="user"?"14px 4px 14px 14px":"4px 14px 14px 14px",fontSize:13,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{m.content}</div>
      </div>)}
      {loading&&<div style={{display:"flex",gap:10,alignItems:"center"}}><div style={{width:30,height:30,borderRadius:"50%",background:t.pr,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>🤖</div><div style={{background:t.s2,padding:"11px 15px",borderRadius:"4px 14px 14px 14px",color:t.td,fontSize:13}}>Thinking...</div></div>}
      <div ref={endRef}/>
    </div>
    <div style={{display:"flex",gap:10}}>
      <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&send()} placeholder="Ask anything — draft emails, get insights, analyze your pipeline..." style={{flex:1,padding:"11px 16px",borderRadius:12,border:"1px solid "+t.bd,background:t.s1,color:t.tx,fontSize:13,outline:"none"}}/>
      <button onClick={send} disabled={loading||!input.trim()} style={{padding:"11px 22px",borderRadius:12,border:"none",background:t.pr,color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer",opacity:loading||!input.trim()?.6:1}}>Send →</button>
    </div>
  </div>;
}

// ── APP ────────────────────────────────────────────────────────────────────────
const NAV=[
  {k:"dash",l:"Dashboard",i:"▣"},
  {k:"sales",l:"Sales",i:"⚡"},
  {k:"inf",l:"Influencers",i:"★"},
  {k:"cash",l:"Cash Flow",i:"$"},
  {k:"quot",l:"Quotations",i:"☑"},
  {k:"exp",l:"Expenses",i:"⚙"},
  {k:"contacts",l:"Contacts",i:"☎"},
  {k:"events",l:"Events",i:"📅"},
  {k:"social",l:"Social",i:"📱"},
  {k:"gmail",l:"Gmail",i:"✉"},
  {k:"ai",l:"AI Co-Pilot",i:"🤖"},
];

export default function App(){
  const[mode,setMode]=useState("dark");const[active,setActive]=useState("dash");const[loading,setLoading]=useState(true);
  const[data,setData]=useState({ld:[],inv:[],qt:[],inf:[],exp:[]});
  const t=mode==="dark"?D:L;

  const load=useCallback(async()=>{
    try{
      const[a,b,c,d,e]=await Promise.all([
        supabase.from("leads").select("*").order("id",{ascending:false}),
        supabase.from("invoices").select("*").order("id"),
        supabase.from("quotations").select("*").order("id"),
        supabase.from("influencers").select("*").order("id"),
        supabase.from("expenses").select("*").order("id"),
      ]);
      setData({ld:a.data||[],inv:b.data||[],qt:c.data||[],inf:d.data||[],exp:e.data||[]});
    }catch(e){console.error(e)}
    setLoading(false);
  },[]);
  useEffect(()=>{load()},[load]);

  const pg={
    dash:<DashPage ld={data.ld} inv={data.inv} qt={data.qt} exp={data.exp} setActive={setActive}/>,
    sales:<SalesPage ld={data.ld} rl={load}/>,
    inf:<InfPage inf={data.inf} rl={load}/>,
    cash:<CashPage inv={data.inv} rl={load}/>,
    quot:<QuotPage qt={data.qt} rl={load}/>,
    exp:<ExpPage exp={data.exp} rl={load}/>,
    contacts:<ContactsPage/>,
    events:<EventsPage/>,
    social:<SocialPage/>,
    gmail:<GmailPage/>,
    ai:<AiPage ld={data.ld} inv={data.inv} qt={data.qt} inf={data.inf} exp={data.exp}/>,
  };

  return <Ctx.Provider value={t}>
    <div style={{display:"flex",height:"100vh",background:t.bg,fontFamily:"'Inter',-apple-system,sans-serif",color:t.tx,overflow:"hidden"}}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"/>
      <div style={{width:172,background:t.s1,borderRight:"1px solid "+t.bd,display:"flex",flexDirection:"column",flexShrink:0}}>
        <div style={{padding:"15px 13px",borderBottom:"1px solid "+t.bd,display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:30,height:30,borderRadius:8,background:"linear-gradient(135deg,#3B82F6,#8B5CF6)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:900,fontSize:13}}>A</div>
          <div><div style={{fontWeight:900,fontSize:13,color:t.tw}}>ALBAB Media</div><div style={{fontSize:9,color:t.td}}>Business OS</div></div>
        </div>
        <div style={{flex:1,padding:"5px 0",overflow:"auto"}}>
          {NAV.map(n=><div key={n.k} onClick={()=>setActive(n.k)} style={{display:"flex",alignItems:"center",gap:8,padding:"9px 13px",cursor:"pointer",color:active===n.k?t.bl:t.tm,background:active===n.k?t.bG:"transparent",borderRight:active===n.k?"3px solid "+t.bl:"3px solid transparent",fontSize:12,fontWeight:active===n.k?700:400}} onMouseEnter={e=>{if(active!==n.k)e.currentTarget.style.background=t.s3}} onMouseLeave={e=>{if(active!==n.k)e.currentTarget.style.background="transparent"}}>
            <span style={{fontSize:14,width:17,textAlign:"center",flexShrink:0}}>{n.i}</span>
            <span>{n.l}</span>
            {n.k==="ai"&&<span style={{marginLeft:"auto",fontSize:9,background:t.pr,color:"#fff",padding:"1px 5px",borderRadius:5,fontWeight:700}}>AI</span>}
          </div>)}
        </div>
        <div style={{padding:"8px 10px",borderTop:"1px solid "+t.bd}}>
          <div onClick={()=>setMode(m=>m==="dark"?"light":"dark")} style={{padding:"7px 10px",background:t.s2,borderRadius:9,cursor:"pointer",color:t.tm,fontSize:11,textAlign:"center",fontWeight:600}}>{mode==="dark"?"☀ Light":"☾ Dark"}</div>
        </div>
      </div>
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minWidth:0}}>
        <div style={{padding:"10px 20px",borderBottom:"1px solid "+t.bd,background:t.s1,flexShrink:0,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontSize:16,fontWeight:800,color:t.tw}}>{NAV.find(n=>n.k===active)?.l}</div><div style={{fontSize:10,color:t.td}}>ALBAB Media · Business OS</div></div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{fontSize:11,color:t.td}}>{new Date().toLocaleDateString("en-AE",{weekday:"short",day:"numeric",month:"short"})}</div>
            <div style={{width:7,height:7,borderRadius:"50%",background:loading?t.am:t.gn}}/>
            <span style={{fontSize:11,color:t.td}}>{loading?"Loading...":"Live"}</span>
          </div>
        </div>
        <div style={{flex:1,overflow:"auto",padding:16}}>
          {loading?<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",flexDirection:"column",gap:12,color:t.td}}>
            <div style={{fontSize:32}}>⚡</div><div style={{fontSize:14,fontWeight:700}}>Loading ALBAB Media...</div>
          </div>:pg[active]}
        </div>
      </div>
    </div>
    <style>{`*{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{width:4px;height:4px}::-webkit-scrollbar-thumb{background:${t.bd};border-radius:4px}input::placeholder,textarea::placeholder{color:${t.td}}select{appearance:auto}button{font-family:inherit}`}</style>
  </Ctx.Provider>;
}
