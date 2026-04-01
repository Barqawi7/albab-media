import{useState,useEffect,createContext,useContext,useCallback}from"react";
import{supabase}from"../lib/supabase";

const Ctx=createContext();
const D={bg:"#060A13",s1:"#0C1220",s2:"#111827",s3:"#1A2332",bd:"#1E293B",tx:"#E2E8F0",tm:"#94A3B8",td:"#64748B",tw:"#FFF",bl:"#3B82F6",bG:"rgba(59,130,246,.12)",gn:"#10B981",gG:"rgba(16,185,129,.12)",am:"#F59E0B",aG:"rgba(245,158,11,.12)",rd:"#EF4444",rG:"rgba(239,68,68,.12)",pr:"#A78BFA",pG:"rgba(167,139,250,.12)",tl:"#14B8A6",tG:"rgba(20,184,166,.12)",pk:"#EC4899"};
const L={bg:"#F8FAFC",s1:"#FFF",s2:"#F1F5F9",s3:"#E2E8F0",bd:"#E2E8F0",tx:"#1E293B",tm:"#64748B",td:"#94A3B8",tw:"#0F172A",bl:"#3B82F6",bG:"rgba(59,130,246,.08)",gn:"#059669",gG:"rgba(5,150,105,.08)",am:"#D97706",aG:"rgba(217,119,6,.08)",rd:"#DC2626",rG:"rgba(220,38,38,.08)",pr:"#7C3AED",pG:"rgba(124,58,237,.08)",tl:"#0D9488",tG:"rgba(13,148,136,.08)",pk:"#DB2777"};
const STG=["Prospect","Funnel","Upside","Commit","Awarded","Lost","Dropped"];
const sC=s=>({"Prospect":"#94A3B8","Funnel":"#60A5FA","Upside":"#A78BFA","Commit":"#F59E0B","Awarded":"#10B981","Lost":"#EF4444","Dropped":"#6B7280"}[s]||"#94A3B8");
const fm=n=>Number(n||0).toLocaleString();

function Pill({children,c}){const t=useContext(Ctx);return <span style={{padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600,background:(c||t.bl)+"1F",color:c||t.bl}}>{children}</span>}
function KPI({l,v,s,p=true}){const t=useContext(Ctx);return <div style={{background:t.s1,borderRadius:14,padding:"16px 18px",border:"1px solid "+t.bd,flex:1,minWidth:150}}><div style={{fontSize:11,color:t.td,textTransform:"uppercase",letterSpacing:1,marginBottom:6,fontWeight:600}}>{l}</div><div style={{fontSize:22,fontWeight:700,color:t.tw}}>{v}</div>{s&&<div style={{marginTop:5,fontSize:12,color:p?t.gn:t.am}}>{s}</div>}</div>}
function Card({children,style={}}){const t=useContext(Ctx);return <div style={{background:t.s1,borderRadius:14,border:"1px solid "+t.bd,overflow:"hidden",...style}}>{children}</div>}
function CH({title,right}){const t=useContext(Ctx);return <div style={{padding:"14px 18px",borderBottom:"1px solid "+t.bd,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}><div style={{fontSize:14,fontWeight:600,color:t.tw}}>{title}</div>{right}</div>}
function Btn({a,l,onClick}){const t=useContext(Ctx);return <button onClick={onClick} style={{padding:"4px 12px",borderRadius:6,border:"none",background:a?t.bl:"transparent",color:a?"#fff":t.tm,fontSize:12,fontWeight:500,cursor:"pointer"}}>{l}</button>}
function AB({onClick,l="+ Add"}){const t=useContext(Ctx);return <button onClick={onClick} style={{padding:"6px 14px",borderRadius:8,border:"none",background:t.gn,color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer"}}>{l}</button>}
function DB({onClick}){return <button onClick={onClick} style={{padding:"2px 8px",borderRadius:4,border:"none",background:"transparent",color:"#EF4444",fontSize:13,cursor:"pointer",opacity:.45,lineHeight:1}} onMouseEnter={e=>e.target.style.opacity=1} onMouseLeave={e=>e.target.style.opacity=.45}>{"\u2715"}</button>}
function EB({onClick}){return <button onClick={onClick} style={{padding:"2px 8px",borderRadius:4,border:"none",background:"transparent",color:"#60A5FA",fontSize:13,cursor:"pointer",opacity:.45,lineHeight:1}} onMouseEnter={e=>e.target.style.opacity=1} onMouseLeave={e=>e.target.style.opacity=.45}>{"\u270E"}</button>}

function VBar({data,h=130}){
  const t=useContext(Ctx);
  if(!data||!data.length)return null;
  const mx=Math.max(...data.map(d=>d.v),1);
  const bw=34,gap=8,padX=8;
  const W=data.length*(bw+gap)-gap+padX*2;
  return(
    <svg width="100%" viewBox={"0 0 "+W+" "+(h+36)} preserveAspectRatio="xMidYMid meet" style={{overflow:"visible",display:"block"}}>
      {data.map((d,i)=>{
        const x=padX+i*(bw+gap);
        const bh=Math.max((d.v/mx)*(h-16),d.v>0?3:0);
        const y=h-bh;
        return(
          <g key={i}>
            <rect x={x} y={y} width={bw} height={bh} fill={d.c||t.bl} rx={5} opacity={0.88}/>
            {d.v>0&&<text x={x+bw/2} y={y-5} textAnchor="middle" fontSize={10} fill={t.tm} fontWeight="700">{d.v}</text>}
            <text x={x+bw/2} y={h+16} textAnchor="middle" fontSize={9} fill={t.td} fontWeight="500">{d.k.length>6?d.k.slice(0,6)+"..":d.k}</text>
          </g>
        );
      })}
    </svg>
  );
}

function HBar({data,h=22}){
  const t=useContext(Ctx);
  if(!data||!data.length)return null;
  const mx=Math.max(...data.map(d=>d.v),1);
  return(
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      {data.map((d,i)=>(
        <div key={i} style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:90,fontSize:11,color:t.tw,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flexShrink:0}}>{d.k}</div>
          <div style={{flex:1,height:h,background:t.s3,borderRadius:4,overflow:"hidden"}}>
            <div style={{height:"100%",width:(d.v/mx*100)+"%",background:d.c||t.bl,borderRadius:4,opacity:.88}}/>
          </div>
          <div style={{width:52,textAlign:"right",fontSize:11,fontWeight:700,color:t.tw,flexShrink:0}}>{fm(d.v)}</div>
        </div>
      ))}
    </div>
  );
}

function Donut({data,size=110}){
  const t=useContext(Ctx);
  const total=data.reduce((a,d)=>a+d.v,0)||1;
  const cx=size/2,cy=size/2,r=size*.40,ir=size*.24;
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
  return(
    <div style={{display:"flex",alignItems:"center",gap:16}}>
      <svg width={size} height={size} viewBox={"0 0 "+size+" "+size} style={{flexShrink:0}}>
        {slices.map((s,i)=><path key={i} d={s.path} fill={s.c} opacity={.9}/>)}
        <text x={cx} y={cy-5} textAnchor="middle" fontSize={15} fontWeight="700" fill={t.tw}>{total}</text>
        <text x={cx} y={cy+10} textAnchor="middle" fontSize={9} fill={t.td}>total</text>
      </svg>
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {data.map((d,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:6,fontSize:11}}>
            <div style={{width:8,height:8,borderRadius:2,background:d.c,flexShrink:0}}/>
            <span style={{color:t.tw,fontWeight:700,minWidth:20}}>{d.v}</span>
            <span style={{color:t.td}}>{d.k}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function GroupBar({labels,groups,h=130}){
  const t=useContext(Ctx);
  if(!labels||!labels.length)return null;
  const allVals=groups.flatMap(g=>g.data);
  const mx=Math.max(...allVals,1);
  const bw=16,bGap=3,grpGap=14,padX=8;
  const grpW=groups.length*(bw+bGap)-bGap;
  const W=labels.length*(grpW+grpGap)-grpGap+padX*2;
  return(
    <svg width="100%" viewBox={"0 0 "+W+" "+(h+48)} preserveAspectRatio="xMidYMid meet" style={{overflow:"visible",display:"block"}}>
      {labels.map((lbl,li)=>{
        const grpX=padX+li*(grpW+grpGap);
        return(
          <g key={li}>
            {groups.map((g,gi)=>{
              const val=g.data[li]||0;
              const bh=Math.max((val/mx)*(h-16),val>0?3:0);
              const y=h-bh;
              const x=grpX+gi*(bw+bGap);
              return(
                <g key={gi}>
                  <rect x={x} y={y} width={bw} height={bh} fill={g.c} rx={3} opacity={.88}/>
                  {val>0&&<text x={x+bw/2} y={y-4} textAnchor="middle" fontSize={7} fill={t.tm} fontWeight="600">{fm(val)}</text>}
                </g>
              );
            })}
            <text x={grpX+grpW/2} y={h+14} textAnchor="middle" fontSize={8} fill={t.td} fontWeight="500">{lbl.length>8?lbl.slice(0,8)+"..":lbl}</text>
          </g>
        );
      })}
      <g transform={"translate("+padX+","+(h+26)+")"}>
        {groups.map((g,i)=>(
          <g key={i} transform={"translate("+(i*70)+",0)"}>
            <rect width={8} height={8} fill={g.c} rx={2}/>
            <text x={11} y={8} fontSize={9} fill={t.td}>{g.label}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}

function Modal({open,onClose,title,children}){const t=useContext(Ctx);if(!open)return null;return <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999}} onClick={onClose}><div onClick={e=>e.stopPropagation()} style={{background:t.s1,borderRadius:16,border:"1px solid "+t.bd,padding:24,width:440,maxHeight:"80vh",overflow:"auto"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:16}}><div style={{fontSize:18,fontWeight:700,color:t.tw}}>{title}</div><div onClick={onClose} style={{cursor:"pointer",color:t.td,fontSize:20}}>{"\u00D7"}</div></div>{children}</div></div>}
function F({l,v,onChange,type="text",opts}){const t=useContext(Ctx);return <div style={{marginBottom:12}}><div style={{fontSize:12,color:t.tm,marginBottom:4}}>{l}</div>{opts?<select value={v} onChange={e=>onChange(e.target.value)} style={{width:"100%",padding:"8px 12px",borderRadius:8,border:"1px solid "+t.bd,background:t.s2,color:t.tx,fontSize:13}}>{opts.map(o=><option key={o} value={o}>{o}</option>)}</select>:<input type={type} value={v} onChange={e=>onChange(e.target.value)} style={{width:"100%",padding:"8px 12px",borderRadius:8,border:"1px solid "+t.bd,background:t.s2,color:t.tx,fontSize:13,outline:"none",boxSizing:"border-box"}}/>}</div>}
function SB({onClick,loading}){const t=useContext(Ctx);return <button onClick={onClick} disabled={loading} style={{width:"100%",padding:"10px",borderRadius:8,border:"none",background:t.bl,color:"#fff",fontSize:14,fontWeight:600,cursor:"pointer",marginTop:8,opacity:loading?.6:1}}>{loading?"Saving...":"Save"}</button>}

function DashPage({ld,inv,qt,exp}){
  const t=useContext(Ctx);
  const tr=inv.reduce((a,f)=>a+(f.revenue||0),0);
  const tp=inv.reduce((a,f)=>a+(f.amount_paid||0),0);
  const pi={};ld.forEach(l=>pi[l.stage]=(pi[l.stage]||0)+1);
  const qs={};qt.forEach(q=>qs[q.status]=(qs[q.status]||0)+1);
  const cr={};inv.forEach(f=>cr[f.client]=(cr[f.client]||0)+(f.revenue||0));
  const tc=Object.entries(cr).sort((a,b)=>b[1]-a[1]).slice(0,8);
  const mx=tc[0]?.[1]||1;
  const pD=STG.map(s=>({k:s,c:sC(s),v:pi[s]||0}));
  const tot=pD.reduce((a,d)=>a+d.v,0);
  const vt={};inv.forEach(f=>vt[f.vertical||"Other"]=(vt[f.vertical||"Other"]||0)+(f.revenue||0));
  const tvArr=Object.entries(vt).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([k,v])=>({k,v,c:t.tl}));
  const qDonut=[{k:"Awarded",v:qs.Awarded||0,c:t.gn},{k:"Dropped",v:qs.Dropped||0,c:t.td},{k:"Lost",v:qs.Lost||0,c:t.rd},{k:"Pending",v:qs.Pending||0,c:t.am}];
  const collRate=tr>0?Math.round(tp/tr*100):0;
  return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
        <KPI l="Total revenue" v={fm(tr)+" AED"} s={"Collected: "+fm(tp)} p/>
        <KPI l="Outstanding" v={fm(tr-tp)+" AED"} s="Due" p={tr-tp===0}/>
        <KPI l="Pipeline" v={tot+" deals"} s={(pi.Awarded||0)+" awarded"} p/>
        <KPI l="Expenses" v={fm(exp.reduce((a,e)=>a+(e.amount||0),0))+" AED/mo"} p={false}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <Card><CH title={"Pipeline by stage ("+tot+")"}/>
          <div style={{padding:"14px 18px 8px"}}><VBar data={pD} h={130}/></div>
        </Card>
        <Card><CH title="Collection rate"/>
          <div style={{padding:"14px 18px"}}>
            <div style={{display:"flex",alignItems:"flex-end",gap:6,marginBottom:12}}>
              <div style={{fontSize:36,fontWeight:800,color:collRate>=80?t.gn:collRate>=50?t.am:t.rd,lineHeight:1}}>{collRate}%</div>
              <div style={{fontSize:12,color:t.td,paddingBottom:4}}>collected</div>
            </div>
            <div style={{height:10,background:t.s3,borderRadius:5,overflow:"hidden",marginBottom:14}}>
              <div style={{height:"100%",width:collRate+"%",background:collRate>=80?t.gn:collRate>=50?t.am:t.rd,borderRadius:5}}/>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:12}}>
              <div><div style={{color:t.td,marginBottom:2}}>Collected</div><div style={{fontWeight:700,color:t.gn}}>{fm(tp)} AED</div></div>
              <div style={{textAlign:"right"}}><div style={{color:t.td,marginBottom:2}}>Outstanding</div><div style={{fontWeight:700,color:t.rd}}>{fm(tr-tp)} AED</div></div>
            </div>
          </div>
        </Card>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <Card><CH title={"Quotations ("+qt.length+")"}/>
          <div style={{padding:"16px 18px"}}><Donut data={qDonut} size={120}/></div>
        </Card>
        <Card><CH title="Revenue by vertical"/>
          <div style={{padding:"14px 18px"}}><HBar data={tvArr} h={20}/></div>
        </Card>
      </div>
      <Card><CH title="Top clients by revenue"/>
        <div style={{padding:"6px 18px"}}>
          {tc.map(([cl,v],i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom:"1px solid "+t.bd}}>
              <div style={{width:20,fontSize:11,fontWeight:700,color:t.td}}>#{i+1}</div>
              <div style={{flex:1,fontSize:13,fontWeight:600,color:t.tw,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{cl}</div>
              <div style={{flex:2,height:6,background:t.s3,borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",background:t.gn,borderRadius:3,width:(v/mx*100)+"%"}}/></div>
              <div style={{minWidth:60,textAlign:"right",fontSize:12,fontWeight:700,color:t.tw}}>{fm(v)} AED</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function SalesPage({ld,rl}){
  const t=useContext(Ctx);
  const[fi,sfi]=useState("All");const[se,sse]=useState("");const[mo,smo]=useState(false);
  const dF={client:"",vertical:"",contact_person:"",email:"",stage:"Prospect"};
  const[fo,sfo]=useState(dF);const[sv,ssv]=useState(false);const[er,ser]=useState(null);
  let ls=ld;if(fi!=="All")ls=ls.filter(s=>s.stage===fi);if(se)ls=ls.filter(s=>(s.client+s.contact_person+s.vertical).toLowerCase().includes(se.toLowerCase()));
  const pi={};ld.forEach(l=>pi[l.stage]=(pi[l.stage]||0)+1);
  const pD=STG.map(s=>({k:s,c:sC(s),v:pi[s]||0}));
  const vt={};ld.forEach(l=>vt[l.vertical||"Other"]=(vt[l.vertical||"Other"]||0)+1);
  const vtArr=Object.entries(vt).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([k,v])=>({k,v,c:t.bl}));
  const openAdd=()=>{ser(null);sfo(dF);smo(true)};
  const openEdit=r=>{ser(r);sfo({client:r.client||"",vertical:r.vertical||"",contact_person:r.contact_person||"",email:r.email||"",stage:r.stage||"Prospect"});smo(true)};
  const save=async()=>{if(!fo.client.trim())return;ssv(true);if(er){await supabase.from("leads").update(fo).eq("id",er.id)}else{await supabase.from("leads").insert([fo])}ssv(false);smo(false);ser(null);sfo(dF);rl()};
  const del=async id=>{if(!confirm("Delete?"))return;await supabase.from("leads").delete().eq("id",id);rl()};
  return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
        <KPI l="Total" v={ld.length} s={(pi.Awarded||0)+" awarded"} p/>
        <KPI l="Active" v={(pi.Prospect||0)+(pi.Funnel||0)+(pi.Upside||0)} s="In pipeline" p/>
        <KPI l="Win rate" v={ld.length?((pi.Awarded||0)/ld.length*100).toFixed(0)+"%":"0%"} p/>
        <KPI l="Lost+Drop" v={(pi.Lost||0)+(pi.Dropped||0)} p={false}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <Card><CH title="Pipeline stages"/>
          <div style={{padding:"14px 18px 8px"}}><VBar data={pD} h={120}/></div>
        </Card>
        <Card><CH title="Leads by vertical"/>
          <div style={{padding:"14px 18px"}}><HBar data={vtArr} h={20}/></div>
        </Card>
      </div>
      <Card>
        <CH title={"Leads ("+ls.length+")"} right={
          <div style={{display:"flex",gap:4,flexWrap:"wrap",alignItems:"center"}}>
            <input placeholder="Search..." value={se} onChange={e=>sse(e.target.value)} style={{background:t.bg,border:"1px solid "+t.bd,borderRadius:6,padding:"5px 10px",color:t.tx,fontSize:12,width:120,outline:"none"}}/>
            {["All",...STG].map(s=><Btn key={s} a={fi===s} l={s} onClick={()=>sfi(s)}/>)}
            <AB onClick={openAdd} l="+ Add"/>
          </div>
        }/>
        <div style={{maxHeight:420,overflow:"auto"}}>
          {ls.map((s,i)=>(
            <div key={s.id||i} style={{display:"flex",alignItems:"center",padding:"10px 18px",borderBottom:"1px solid "+t.bd,gap:12,fontSize:13}} onMouseEnter={e=>e.currentTarget.style.background=t.s3} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <div style={{width:32,height:32,borderRadius:8,background:sC(s.stage)+"1F",display:"flex",alignItems:"center",justifyContent:"center",color:sC(s.stage),fontWeight:700,fontSize:13,flexShrink:0}}>{(s.client||"?")[0]}</div>
              <div style={{flex:2,minWidth:0}}><div style={{fontWeight:600,color:t.tw,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.client}</div><div style={{fontSize:11,color:t.td}}>{s.contact_person}{s.vertical?" · "+s.vertical:""}</div></div>
              <div style={{width:80}}><Pill c={sC(s.stage)}>{s.stage}</Pill></div>
              {s.id&&<><EB onClick={()=>openEdit(s)}/><DB onClick={()=>del(s.id)}/></>}
            </div>
          ))}
        </div>
      </Card>
      <Modal open={mo} onClose={()=>smo(false)} title={er?"Edit lead":"Add lead"}>
        <F l="Client" v={fo.client} onChange={v=>sfo({...fo,client:v})}/><F l="Vertical" v={fo.vertical} onChange={v=>sfo({...fo,vertical:v})}/><F l="Contact" v={fo.contact_person} onChange={v=>sfo({...fo,contact_person:v})}/><F l="Email" v={fo.email} onChange={v=>sfo({...fo,email:v})}/><F l="Stage" v={fo.stage} onChange={v=>sfo({...fo,stage:v})} opts={STG}/><SB onClick={save} loading={sv}/>
      </Modal>
    </div>
  );
}

function CashPage({inv,rl}){
  const t=useContext(Ctx);
  const[se,sse]=useState("");const[mo,smo]=useState(false);
  const dF={client:"",vertical:"",revenue:0,amount_paid:0};
  const[fo,sfo]=useState(dF);const[sv,ssv]=useState(false);const[er,ser]=useState(null);
  let ls=inv;if(se)ls=ls.filter(f=>f.client.toLowerCase().includes(se.toLowerCase()));
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
  return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
        <KPI l="Revenue" v={fm(tr)+" AED"} s={inv.length+" invoices"} p/>
        <KPI l="Collected" v={fm(tp)+" AED"} s={tr?(tp/tr*100).toFixed(0)+"%":"0%"} p/>
        <KPI l="Outstanding" v={fm(tr-tp)+" AED"} p={tr-tp===0}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <Card><CH title="Revenue by vertical"/>
          <div style={{padding:"14px 18px"}}><HBar data={tvArr} h={22}/></div>
        </Card>
        <Card><CH title="Top 5 — Revenue vs Collected"/>
          <div style={{padding:"14px 18px 8px"}}>
            <GroupBar labels={top5.map(([k])=>k)} groups={[{label:"Revenue",c:t.tl,data:top5.map(([,v])=>v.r)},{label:"Collected",c:t.gn,data:top5.map(([,v])=>v.p)}]} h={120}/>
          </div>
        </Card>
      </div>
      <Card>
        <CH title={"Invoices ("+ls.length+")"} right={
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <input placeholder="Search..." value={se} onChange={e=>sse(e.target.value)} style={{background:t.bg,border:"1px solid "+t.bd,borderRadius:6,padding:"5px 10px",color:t.tx,fontSize:12,width:150,outline:"none"}}/>
            <AB onClick={openAdd} l="+ Add"/>
          </div>
        }/>
        <div style={{maxHeight:360,overflow:"auto"}}>
          {ls.map((f,i)=>(
            <div key={f.id||i} style={{display:"flex",alignItems:"center",padding:"9px 18px",borderBottom:"1px solid "+t.bd,gap:12,fontSize:13}}>
              <div style={{flex:2,fontWeight:500,color:t.tw}}>{f.client}</div>
              <div style={{flex:1,color:t.tm,fontSize:12}}>{f.vertical}</div>
              <div style={{width:70,textAlign:"right",color:t.gn,fontWeight:600}}>{(f.revenue||0).toLocaleString()}</div>
              <div style={{width:70,textAlign:"right",color:t.tx}}>{(f.amount_paid||0).toLocaleString()}</div>
              <div style={{width:55,textAlign:"right",color:(f.revenue-f.amount_paid)>0?t.rd:t.td,fontWeight:600}}>{(f.revenue-f.amount_paid)>0?(f.revenue-f.amount_paid).toLocaleString():"\u2014"}</div>
              {f.id&&<><EB onClick={()=>openEdit(f)}/><DB onClick={()=>del(f.id)}/></>}
            </div>
          ))}
        </div>
      </Card>
      <Modal open={mo} onClose={()=>smo(false)} title={er?"Edit invoice":"Add invoice"}>
        <F l="Client" v={fo.client} onChange={v=>sfo({...fo,client:v})}/><F l="Vertical" v={fo.vertical} onChange={v=>sfo({...fo,vertical:v})}/><F l="Revenue (AED)" v={fo.revenue} onChange={v=>sfo({...fo,revenue:v})} type="number"/><F l="Paid (AED)" v={fo.amount_paid} onChange={v=>sfo({...fo,amount_paid:v})} type="number"/><SB onClick={save} loading={sv}/>
      </Modal>
    </div>
  );
}

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
  return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
        <KPI l="Total" v={inf.length} s="Influencers" p/>
        <KPI l="Avg engagement" v={inf.length?(inf.reduce((a,i)=>a+(i.engagement||0),0)/inf.length).toFixed(1)+"%":"0%"} p/>
      </div>
      <Card><CH title="Influencers by tier"/>
        <div style={{padding:"16px 18px"}}><Donut data={tierDonut} size={120}/></div>
      </Card>
      <Card>
        <CH title={"Influencers ("+ls.length+")"} right={
          <div style={{display:"flex",gap:4,alignItems:"center"}}>
            <input placeholder="Search..." value={se} onChange={e=>sse(e.target.value)} style={{background:t.bg,border:"1px solid "+t.bd,borderRadius:6,padding:"5px 10px",color:t.tx,fontSize:12,width:140,outline:"none"}}/>
            {tiers.map(x=><Btn key={x} a={ti===x} l={x} onClick={()=>sti(x)}/>)}
            <AB onClick={openAdd} l="+"/>
          </div>
        }/>
        <div style={{maxHeight:440,overflow:"auto"}}>
          {ls.map((n,i)=>(
            <div key={n.id||i} style={{display:"flex",alignItems:"center",padding:"10px 18px",borderBottom:"1px solid "+t.bd,gap:10,fontSize:13}} onMouseEnter={e=>e.currentTarget.style.background=t.s3} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <div style={{width:34,height:34,borderRadius:"50%",background:(tC[n.tier]||t.td)+"1F",display:"flex",alignItems:"center",justifyContent:"center",color:tC[n.tier],fontWeight:700,fontSize:14,flexShrink:0}}>{(n.name||"?")[0]}</div>
              <div style={{flex:2,minWidth:0}}><div style={{fontWeight:600,color:t.tw,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{n.name}</div><div style={{fontSize:11,color:t.td}}>{n.handle} {"\u00B7"} {n.category}</div></div>
              <div style={{width:55,textAlign:"right",fontSize:12,color:t.pk,fontWeight:600}}>{n.ig_followers}</div>
              <div style={{width:55,textAlign:"right",fontSize:12,color:t.tl,fontWeight:600}}>{n.tiktok_followers}</div>
              <div style={{width:55,textAlign:"right",fontSize:12,color:t.rd,fontWeight:600}}>{n.youtube_followers}</div>
              <div style={{width:65,textAlign:"right",fontWeight:700,color:t.tw}}>{n.total_reach}</div>
              <div style={{width:42,textAlign:"right",color:(n.engagement||0)>=5?t.gn:(n.engagement||0)>=2?t.am:t.td,fontWeight:600,fontSize:12}}>{n.engagement}%</div>
              <Pill c={tC[n.tier]}>{n.tier}</Pill>
              {n.id&&<><EB onClick={()=>openEdit(n)}/><DB onClick={()=>del(n.id)}/></>}
            </div>
          ))}
        </div>
      </Card>
      <Modal open={mo} onClose={()=>smo(false)} title={er?"Edit influencer":"Add influencer"}>
        <F l="Name" v={fo.name} onChange={v=>sfo({...fo,name:v})}/><F l="Handle" v={fo.handle} onChange={v=>sfo({...fo,handle:v})}/><F l="Category" v={fo.category} onChange={v=>sfo({...fo,category:v})}/><F l="City" v={fo.city} onChange={v=>sfo({...fo,city:v})}/><F l="IG followers" v={fo.ig_followers} onChange={v=>sfo({...fo,ig_followers:v})}/><F l="TikTok" v={fo.tiktok_followers} onChange={v=>sfo({...fo,tiktok_followers:v})}/><F l="YouTube" v={fo.youtube_followers} onChange={v=>sfo({...fo,youtube_followers:v})}/><F l="Engagement %" v={fo.engagement} onChange={v=>sfo({...fo,engagement:v})} type="number"/><F l="Tier" v={fo.tier} onChange={v=>sfo({...fo,tier:v})} opts={["Mega","Macro","Mid","Micro"]}/><SB onClick={save} loading={sv}/>
      </Modal>
    </div>
  );
}

function QuotPage({qt,rl}){
  const t=useContext(Ctx);
  const[fi,sfi]=useState("All");const[se,sse]=useState("");const[mo,smo]=useState(false);
  const dF={client:"",status:"Pending"};
  const[fo,sfo]=useState(dF);const[sv,ssv]=useState(false);const[er,ser]=useState(null);
  const sts=["All","Awarded","Dropped","Lost","Pending"];
  let ls=qt;if(fi!=="All")ls=ls.filter(q=>q.status===fi);if(se)ls=ls.filter(q=>q.client.toLowerCase().includes(se.toLowerCase()));
  const qs={};qt.forEach(q=>qs[q.status]=(qs[q.status]||0)+1);
  const qDonut=[{k:"Awarded",v:qs.Awarded||0,c:t.gn},{k:"Dropped",v:qs.Dropped||0,c:t.td},{k:"Lost",v:qs.Lost||0,c:t.rd},{k:"Pending",v:qs.Pending||0,c:t.am}];
  const openAdd=()=>{ser(null);sfo(dF);smo(true)};
  const openEdit=r=>{ser(r);sfo({client:r.client||"",status:r.status||"Pending"});smo(true)};
  const save=async()=>{if(!fo.client.trim())return;ssv(true);if(er){await supabase.from("quotations").update(fo).eq("id",er.id)}else{await supabase.from("quotations").insert([fo])}ssv(false);smo(false);ser(null);sfo(dF);rl()};
  const del=async id=>{if(!confirm("Delete?"))return;await supabase.from("quotations").delete().eq("id",id);rl()};
  return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
        <KPI l="Total" v={qt.length} p/>
        <KPI l="Awarded" v={qs.Awarded||0} s={qt.length?((qs.Awarded||0)/qt.length*100).toFixed(0)+"%":"0%"} p/>
        <KPI l="Dropped" v={qs.Dropped||0} p={false}/>
        <KPI l="Pending" v={qs.Pending||0} p/>
      </div>
      <Card><CH title="Quotation breakdown"/>
        <div style={{padding:"16px 18px"}}><Donut data={qDonut} size={120}/></div>
      </Card>
      <Card>
        <CH title={"Quotations ("+ls.length+")"} right={
          <div style={{display:"flex",gap:4,alignItems:"center"}}>
            <input placeholder="Search..." value={se} onChange={e=>sse(e.target.value)} style={{background:t.bg,border:"1px solid "+t.bd,borderRadius:6,padding:"5px 10px",color:t.tx,fontSize:12,width:120,outline:"none"}}/>
            {sts.map(s=><Btn key={s} a={fi===s} l={s} onClick={()=>sfi(s)}/>)}
            <AB onClick={openAdd} l="+"/>
          </div>
        }/>
        <div style={{maxHeight:420,overflow:"auto"}}>
          {ls.map((q,i)=>(
            <div key={q.id||i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 18px",borderBottom:"1px solid "+t.bd}}>
              <div style={{fontSize:13,fontWeight:500,color:t.tw}}>{q.client}</div>
              <div style={{display:"flex",alignItems:"center",gap:4}}>
                <Pill c={q.status==="Awarded"?t.gn:q.status==="Dropped"?t.td:q.status==="Lost"?t.rd:t.am}>{q.status}</Pill>
                {q.id&&<><EB onClick={()=>openEdit(q)}/><DB onClick={()=>del(q.id)}/></>}
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Modal open={mo} onClose={()=>smo(false)} title={er?"Edit quotation":"Add quotation"}>
        <F l="Client" v={fo.client} onChange={v=>sfo({...fo,client:v})}/><F l="Status" v={fo.status} onChange={v=>sfo({...fo,status:v})} opts={["Awarded","Dropped","Lost","Pending"]}/><SB onClick={save} loading={sv}/>
      </Modal>
    </div>
  );
}

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
  return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <KPI l="Monthly expenses" v={fm(total)+" AED"} s={exp.length+" items"} p={false}/>
      <Card><CH title="Expense breakdown"/>
        <div style={{padding:"14px 18px"}}><HBar data={expBars} h={22}/></div>
      </Card>
      <Card><CH title="Expenses" right={<AB onClick={openAdd} l="+ Add"/>}/>
        <div style={{padding:"0 18px"}}>
          {exp.map((e,i)=>(
            <div key={e.id||i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid "+t.bd}}>
              <div style={{fontSize:13,fontWeight:500,color:t.tw}}>{e.item}</div>
              <div style={{display:"flex",alignItems:"center",gap:4}}>
                <div style={{fontSize:14,fontWeight:700,color:t.am}}>{(e.amount||0).toLocaleString()} AED</div>
                {e.id&&<><EB onClick={()=>openEdit(e)}/><DB onClick={()=>del(e.id)}/></>}
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Modal open={mo} onClose={()=>smo(false)} title={er?"Edit expense":"Add expense"}>
        <F l="Item" v={fo.item} onChange={v=>sfo({...fo,item:v})}/><F l="Amount (AED)" v={fo.amount} onChange={v=>sfo({...fo,amount:v})} type="number"/><SB onClick={save} loading={sv}/>
      </Modal>
    </div>
  );
}

const NAV=[{k:"dash",l:"Dashboard",i:"\u25A3"},{k:"sales",l:"Sales",i:"\u26A1"},{k:"inf",l:"Influencers",i:"\u2605"},{k:"cash",l:"Cash flow",i:"$"},{k:"quot",l:"Quotations",i:"\u2611"},{k:"exp",l:"Expenses",i:"\u2699"}];

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
        supabase.from("expenses").select("*").order("id")
      ]);
      setData({ld:a.data||[],inv:b.data||[],qt:c.data||[],inf:d.data||[],exp:e.data||[]});
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
    exp:<ExpPage exp={data.exp} rl={load}/>
  };
  return(
    <Ctx.Provider value={t}>
      <div style={{display:"flex",height:"100vh",background:t.bg,fontFamily:"'Inter',-apple-system,sans-serif",color:t.tx,overflow:"hidden"}}>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/>
        <div style={{width:165,background:t.s1,borderRight:"1px solid "+t.bd,display:"flex",flexDirection:"column",flexShrink:0}}>
          <div style={{padding:"14px 12px",borderBottom:"1px solid "+t.bd,display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:28,height:28,borderRadius:7,background:"linear-gradient(135deg,#3B82F6,#8B5CF6)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:12}}>A</div>
            <div style={{fontWeight:700,fontSize:13,color:t.tw}}>ALBAB Media</div>
          </div>
          <div style={{flex:1,padding:"4px 0"}}>
            {NAV.map(n=>(
              <div key={n.k} onClick={()=>setActive(n.k)} dangerouslySetInnerHTML={undefined}
                style={{display:"flex",alignItems:"center",gap:7,padding:"9px 14px",cursor:"pointer",color:active===n.k?t.bl:t.tm,background:active===n.k?t.bG:"transparent",borderRight:active===n.k?"2px solid "+t.bl:"2px solid transparent",fontSize:13,fontWeight:active===n.k?600:400}}
                onMouseEnter={e=>{if(active!==n.k)e.currentTarget.style.background=t.s3}}
                onMouseLeave={e=>{if(active!==n.k)e.currentTarget.style.background="transparent"}}>
                <span style={{fontSize:15,width:18,textAlign:"center"}}>{n.i}</span>{n.l}
              </div>
            ))}
          </div>
          <div style={{padding:"8px 10px",borderTop:"1px solid "+t.bd}}>
            <div onClick={()=>setMode(m=>m==="dark"?"light":"dark")} style={{padding:"8px 10px",background:t.s2,borderRadius:8,cursor:"pointer",color:t.tm,fontSize:12,textAlign:"center"}}>{mode==="dark"?"☀ Light":"☾ Dark"}</div>
          </div>
        </div>
        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minWidth:0}}>
          <div style={{padding:"10px 20px",borderBottom:"1px solid "+t.bd,background:t.s1,flexShrink:0,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontSize:16,fontWeight:700,color:t.tw}}>{NAV.find(n=>n.k===active)?.l}</div>
              <div style={{fontSize:11,color:t.td}}>ALBAB Media</div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:loading?t.am:t.gn}}/>
              <span style={{fontSize:11,color:t.td}}>{loading?"Loading...":"Live"}</span>
            </div>
          </div>
          <div style={{flex:1,overflow:"auto",padding:16}}>
            {loading?<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",color:t.td}}>Loading...</div>:pg[active]}
          </div>
        </div>
        <style>{`*{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${t.bd};border-radius:3px}input::placeholder{color:${t.td}}select{appearance:auto}`}</style>
      </div>
    </Ctx.Provider>
  );
}
