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

function ContactsPage(){
  const t=useContext(Ctx);
  const[rows,setRows]=useState([]);
  const[total,setTotal]=useState(0);
  const[se,sse]=useState("");
  const[query,setQuery]=useState("");
  const[page,setPage]=useState(0);
  const[loading,setLoading]=useState(true);
  const[mo,smo]=useState(false);
  const[er,ser]=useState(null);
  const[sv,ssv]=useState(false);
  const PER=250;
  const dF={name:"",company:"",title:"",email:"",phone:"",industry:"",city:"Dubai"};
  const[fo,sfo]=useState(dF);

  const fetch=useCallback(async(q,pg)=>{
    setLoading(true);
    let qb=supabase.from("contacts").select("*",{count:"exact"});
    if(q){qb=qb.or("name.ilike.%"+q+"%,company.ilike.%"+q+"%,email.ilike.%"+q+"%,industry.ilike.%"+q+"%")}
    qb=qb.order("id").range(pg*PER,(pg+1)*PER-1);
    const{data,count}=await qb;
    setRows(data||[]);
    if(count!==null)setTotal(count);
    setLoading(false);
  },[]);

  useEffect(()=>{fetch(query,page)},[query,page,fetch]);

  const doSearch=()=>{setPage(0);setQuery(se)};
  const openAdd=()=>{ser(null);sfo(dF);smo(true)};
  const openEdit=r=>{ser(r);sfo({name:r.name||"",company:r.company||"",title:r.title||"",email:r.email||"",phone:r.phone||"",industry:r.industry||"",city:r.city||""});smo(true)};
  const save=async()=>{if(!fo.name.trim())return;ssv(true);if(er){await supabase.from("contacts").update(fo).eq("id",er.id)}else{await supabase.from("contacts").insert([fo])}ssv(false);smo(false);ser(null);sfo(dF);fetch(query,page)};
  const del=async id=>{if(!confirm("Delete?"))return;await supabase.from("contacts").delete().eq("id",id);fetch(query,page)};

  const pages=Math.ceil(total/PER);

  return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
        <KPI l="Total contacts" v={total.toLocaleString()} s="B2B database" p/>
        <KPI l="Showing" v={rows.length.toLocaleString()} s={"Page "+(page+1)+" of "+pages} p/>
      </div>
      <Card>
        <CH title={"Contacts ("+total.toLocaleString()+")"} right={
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <input
              placeholder="Search name, company, email..."
              value={se}
              onChange={e=>sse(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&doSearch()}
              style={{background:t.bg,border:"1px solid "+t.bd,borderRadius:6,padding:"5px 10px",color:t.tx,fontSize:12,width:220,outline:"none"}}
            />
            <button onClick={doSearch} style={{padding:"5px 12px",borderRadius:6,border:"none",background:t.bl,color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer"}}>Search</button>
            {query&&<button onClick={()=>{sse("");setQuery("");setPage(0)}} style={{padding:"5px 10px",borderRadius:6,border:"none",background:"transparent",color:t.tm,fontSize:12,cursor:"pointer"}}>Clear</button>}
            <AB onClick={openAdd} l="+ Add"/>
          </div>
        }/>
        {/* Table header */}
        <div style={{display:"flex",padding:"7px 18px",borderBottom:"1px solid "+t.bd,fontSize:11,color:t.td,fontWeight:600,textTransform:"uppercase",letterSpacing:.5}}>
          <div style={{flex:2}}>Name</div>
          <div style={{flex:2}}>Company</div>
          <div style={{flex:1.5}}>Title</div>
          <div style={{flex:2}}>Email</div>
          <div style={{flex:1}}>Phone</div>
          <div style={{flex:1}}>Industry</div>
          <div style={{flex:1}}>City</div>
          <div style={{width:60}}></div>
        </div>
        <div style={{maxHeight:500,overflow:"auto"}}>
          {loading?(
            <div style={{padding:40,textAlign:"center",color:t.td}}>Loading...</div>
          ):rows.length===0?(
            <div style={{padding:40,textAlign:"center",color:t.td}}>No contacts found</div>
          ):rows.map((c,i)=>(
            <div key={c.id||i} style={{display:"flex",alignItems:"center",padding:"9px 18px",borderBottom:"1px solid "+t.bd,fontSize:12,gap:4}} onMouseEnter={e=>e.currentTarget.style.background=t.s3} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <div style={{flex:2,fontWeight:600,color:t.tw,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name||"—"}</div>
              <div style={{flex:2,color:t.tm,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.company||"—"}</div>
              <div style={{flex:1.5,color:t.td,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.title||"—"}</div>
              <div style={{flex:2,color:t.bl,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.email||"—"}</div>
              <div style={{flex:1,color:t.tm,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.phone||"—"}</div>
              <div style={{flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}><Pill c={t.pr}>{c.industry||"—"}</Pill></div>
              <div style={{flex:1,color:t.td,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.city||"—"}</div>
              <div style={{width:60,display:"flex",gap:2,flexShrink:0}}><EB onClick={()=>openEdit(c)}/><DB onClick={()=>del(c.id)}/></div>
            </div>
          ))}
        </div>
        {/* Pagination */}
        {pages>1&&(
          <div style={{padding:"10px 18px",borderTop:"1px solid "+t.bd,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <button onClick={()=>setPage(p=>Math.max(0,p-1))} disabled={page===0} style={{padding:"5px 14px",borderRadius:6,border:"1px solid "+t.bd,background:"transparent",color:page===0?t.td:t.tw,cursor:page===0?"not-allowed":"pointer",fontSize:12}}>&#8592; Prev</button>
            <span style={{fontSize:12,color:t.td}}>Page {page+1} of {pages} &nbsp;&middot;&nbsp; {total.toLocaleString()} total</span>
            <button onClick={()=>setPage(p=>Math.min(pages-1,p+1))} disabled={page>=pages-1} style={{padding:"5px 14px",borderRadius:6,border:"1px solid "+t.bd,background:"transparent",color:page>=pages-1?t.td:t.tw,cursor:page>=pages-1?"not-allowed":"pointer",fontSize:12}}>Next &#8594;</button>
          </div>
        )}
      </Card>
      <Modal open={mo} onClose={()=>smo(false)} title={er?"Edit contact":"Add contact"}>
        <F l="Name" v={fo.name} onChange={v=>sfo({...fo,name:v})}/>
        <F l="Company" v={fo.company} onChange={v=>sfo({...fo,company:v})}/>
        <F l="Title" v={fo.title} onChange={v=>sfo({...fo,title:v})}/>
        <F l="Email" v={fo.email} onChange={v=>sfo({...fo,email:v})}/>
        <F l="Phone" v={fo.phone} onChange={v=>sfo({...fo,phone:v})}/>
        <F l="Industry" v={fo.industry} onChange={v=>sfo({...fo,industry:v})}/>
        <F l="City" v={fo.city} onChange={v=>sfo({...fo,city:v})}/>
        <SB onClick={save} loading={sv}/>
      </Modal>
    </div>
  );
}

const EV_TYPES=["Campaign","Meeting","Deadline","Event","Follow-up","Other"];
const EV_STATUS=["Upcoming","In Progress","Done","Cancelled"];
const tC_ev={"Campaign":"#3B82F6","Meeting":"#A78BFA","Deadline":"#EF4444","Event":"#10B981","Follow-up":"#F59E0B","Other":"#64748B"};

function EventsPage(){
  const t=useContext(Ctx);
  const[events,setEvents]=useState([]);
  const[loading,setLoading]=useState(true);
  const[mo,smo]=useState(false);
  const[er,ser]=useState(null);
  const[sv,ssv]=useState(false);
  const[view,setView]=useState("calendar");
  const now=new Date();
  const[curYear,setCurYear]=useState(now.getFullYear());
  const[curMonth,setCurMonth]=useState(now.getMonth());
  const dF={title:"",type:"Campaign",date:"",end_date:"",client:"",notes:"",status:"Upcoming"};
  const[fo,sfo]=useState(dF);

  const load=useCallback(async()=>{
    setLoading(true);
    const{data}=await supabase.from("events").select("*").order("date");
    setEvents(data||[]);
    setLoading(false);
  },[]);

  useEffect(()=>{load()},[load]);

  const openAdd=(dateStr)=>{ser(null);sfo({...dF,date:dateStr||""});smo(true)};
  const openEdit=r=>{ser(r);sfo({title:r.title||"",type:r.type||"Campaign",date:r.date||"",end_date:r.end_date||"",client:r.client||"",notes:r.notes||"",status:r.status||"Upcoming"});smo(true)};
  const save=async()=>{if(!fo.title.trim()||!fo.date)return;ssv(true);if(er){await supabase.from("events").update(fo).eq("id",er.id)}else{await supabase.from("events").insert([fo])}ssv(false);smo(false);ser(null);sfo(dF);load()};
  const del=async id=>{if(!confirm("Delete?"))return;await supabase.from("events").delete().eq("id",id);load()};

  // Calendar grid
  const firstDay=new Date(curYear,curMonth,1).getDay();
  const daysInMonth=new Date(curYear,curMonth+1,0).getDate();
  const monthNames=["January","February","March","April","May","June","July","August","September","October","November","December"];
  const dayNames=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const todayStr=now.toISOString().split("T")[0];

  const evByDate={};
  events.forEach(e=>{
    const d=e.date?.split("T")[0];
    if(d){if(!evByDate[d])evByDate[d]=[];evByDate[d].push(e);}
  });

  const upcoming=events.filter(e=>e.date>=todayStr&&e.status!=="Cancelled"&&e.status!=="Done").slice(0,10);
  const counts={};EV_STATUS.forEach(s=>counts[s]=events.filter(e=>e.status===s).length);

  return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      {/* KPIs */}
      <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
        <KPI l="Total events" v={events.length} p/>
        <KPI l="Upcoming" v={counts["Upcoming"]||0} s="scheduled" p/>
        <KPI l="In Progress" v={counts["In Progress"]||0} p/>
        <KPI l="Done" v={counts["Done"]||0} p/>
      </div>

      {/* View toggle + nav */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
        <div style={{display:"flex",gap:4}}>
          <Btn a={view==="calendar"} l="\uD83D\uDCC5 Calendar" onClick={()=>setView("calendar")}/>
          <Btn a={view==="list"} l="\u2630 List" onClick={()=>setView("list")}/>
        </div>
        {view==="calendar"&&(
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <button onClick={()=>{let m=curMonth-1;let y=curYear;if(m<0){m=11;y--;}setCurMonth(m);setCurYear(y);}} style={{padding:"4px 10px",borderRadius:6,border:"1px solid "+t.bd,background:"transparent",color:t.tw,cursor:"pointer",fontSize:13}}>&#8592;</button>
            <span style={{fontWeight:700,color:t.tw,fontSize:14,minWidth:140,textAlign:"center"}}>{monthNames[curMonth]} {curYear}</span>
            <button onClick={()=>{let m=curMonth+1;let y=curYear;if(m>11){m=0;y++;}setCurMonth(m);setCurYear(y);}} style={{padding:"4px 10px",borderRadius:6,border:"1px solid "+t.bd,background:"transparent",color:t.tw,cursor:"pointer",fontSize:13}}>&#8594;</button>
          </div>
        )}
        <AB onClick={()=>openAdd("")} l="+ Add event"/>
      </div>

      {loading?<div style={{padding:40,textAlign:"center",color:t.td}}>Loading...</div>:view==="calendar"?(
        <Card>
          {/* Day headers */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",borderBottom:"1px solid "+t.bd}}>
            {dayNames.map(d=><div key={d} style={{padding:"8px 0",textAlign:"center",fontSize:11,fontWeight:700,color:t.td,textTransform:"uppercase",letterSpacing:.5}}>{d}</div>)}
          </div>
          {/* Calendar cells */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)"}}>
            {Array.from({length:firstDay}).map((_,i)=>(
              <div key={"e"+i} style={{minHeight:90,borderRight:"1px solid "+t.bd,borderBottom:"1px solid "+t.bd,background:t.s2}}/>
            ))}
            {Array.from({length:daysInMonth}).map((_,i)=>{
              const day=i+1;
              const dateStr=curYear+"-"+String(curMonth+1).padStart(2,"0")+"-"+String(day).padStart(2,"0");
              const dayEvs=evByDate[dateStr]||[];
              const isToday=dateStr===todayStr;
              return(
                <div key={day} onClick={()=>openAdd(dateStr)} style={{minHeight:90,borderRight:"1px solid "+t.bd,borderBottom:"1px solid "+t.bd,padding:"6px 8px",cursor:"pointer",position:"relative"}} onMouseEnter={e=>e.currentTarget.style.background=t.s3} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <div style={{width:24,height:24,borderRadius:"50%",background:isToday?t.bl:"transparent",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:4}}>
                    <span style={{fontSize:12,fontWeight:isToday?700:400,color:isToday?"#fff":t.tm}}>{day}</span>
                  </div>
                  {dayEvs.slice(0,3).map((ev,ei)=>(
                    <div key={ei} onClick={e=>{e.stopPropagation();openEdit(ev);}} style={{fontSize:10,fontWeight:600,color:"#fff",background:tC_ev[ev.type]||t.bl,borderRadius:3,padding:"2px 5px",marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",cursor:"pointer"}}>{ev.title}</div>
                  ))}
                  {dayEvs.length>3&&<div style={{fontSize:9,color:t.td}}>+{dayEvs.length-3} more</div>}
                </div>
              );
            })}
          </div>
        </Card>
      ):(
        /* List view */
        <Card>
          <CH title={"All events ("+events.length+")"}/>
          <div style={{maxHeight:520,overflow:"auto"}}>
            {events.length===0?(
              <div style={{padding:40,textAlign:"center",color:t.td}}>No events yet. Click + Add event to start.</div>
            ):events.map((ev,i)=>(
              <div key={ev.id||i} style={{display:"flex",alignItems:"center",padding:"11px 18px",borderBottom:"1px solid "+t.bd,gap:12}} onMouseEnter={e=>e.currentTarget.style.background=t.s3} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <div style={{width:10,height:10,borderRadius:"50%",background:tC_ev[ev.type]||t.bl,flexShrink:0}}/>
                <div style={{flex:2,minWidth:0}}>
                  <div style={{fontWeight:600,color:t.tw,fontSize:13}}>{ev.title}</div>
                  <div style={{fontSize:11,color:t.td}}>{ev.client}</div>
                </div>
                <div style={{width:80,fontSize:11,color:t.tm}}>{ev.date?.split("T")[0]||"—"}</div>
                <Pill c={tC_ev[ev.type]}>{ev.type}</Pill>
                <Pill c={ev.status==="Done"?t.gn:ev.status==="Cancelled"?t.rd:ev.status==="In Progress"?t.am:t.bl}>{ev.status}</Pill>
                <EB onClick={()=>openEdit(ev)}/>
                <DB onClick={()=>del(ev.id)}/>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Upcoming sidebar */}
      {upcoming.length>0&&(
        <Card>
          <CH title="Upcoming"/>
          <div style={{padding:"4px 0"}}>
            {upcoming.map((ev,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"9px 18px",borderBottom:"1px solid "+t.bd}} onMouseEnter={e=>e.currentTarget.style.background=t.s3} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <div style={{width:40,textAlign:"center",flexShrink:0}}>
                  <div style={{fontSize:18,fontWeight:800,color:t.bl,lineHeight:1}}>{ev.date?.split("-")[2]}</div>
                  <div style={{fontSize:9,color:t.td,textTransform:"uppercase"}}>{monthNames[parseInt(ev.date?.split("-")[1])-1]?.slice(0,3)}</div>
                </div>
                <div style={{width:3,height:36,background:tC_ev[ev.type]||t.bl,borderRadius:2,flexShrink:0}}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:600,fontSize:13,color:t.tw}}>{ev.title}</div>
                  <div style={{fontSize:11,color:t.td}}>{ev.client||ev.type}</div>
                </div>
                <EB onClick={()=>openEdit(ev)}/>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Modal open={mo} onClose={()=>smo(false)} title={er?"Edit event":"Add event"}>
        <F l="Title" v={fo.title} onChange={v=>sfo({...fo,title:v})}/>
        <F l="Type" v={fo.type} onChange={v=>sfo({...fo,type:v})} opts={EV_TYPES}/>
        <F l="Status" v={fo.status} onChange={v=>sfo({...fo,status:v})} opts={EV_STATUS}/>
        <F l="Start date" v={fo.date} onChange={v=>sfo({...fo,date:v})} type="date"/>
        <F l="End date (optional)" v={fo.end_date} onChange={v=>sfo({...fo,end_date:v})} type="date"/>
        <F l="Client" v={fo.client} onChange={v=>sfo({...fo,client:v})}/>
        <F l="Notes" v={fo.notes} onChange={v=>sfo({...fo,notes:v})}/>
        <SB onClick={save} loading={sv}/>
      </Modal>
    </div>
  );
}

const SM_PLATFORMS=["Instagram","TikTok","YouTube","LinkedIn","X (Twitter)","Facebook","Snapchat"];
const pC={"Instagram":"#E1306C","TikTok":"#00F2EA","YouTube":"#FF0000","LinkedIn":"#0A66C2","X (Twitter)":"#1DA1F2","Facebook":"#1877F2","Snapchat":"#FFFC00"};
const pI={"Instagram":"\uD83D\uDCF7","TikTok":"\uD83C\uDFB5","YouTube":"\u25B6","LinkedIn":"\uD83D\uDCBC","X (Twitter)":"\uD83D\uDC26","Facebook":"f","Snapchat":"\uD83D\uDC7B"};

function SocialPage(){
  const t=useContext(Ctx);
  const[accounts,setAccounts]=useState([]);
  const[loading,setLoading]=useState(true);
  const[mo,smo]=useState(false);
  const[er,ser]=useState(null);
  const[sv,ssv]=useState(false);
  const[fi,sfi]=useState("All");
  const dF={account_name:"",handle:"",platform:"Instagram",followers:0,following:0,posts:0,engagement:0,monthly_reach:0,notes:""};
  const[fo,sfo]=useState(dF);

  const load=useCallback(async()=>{
    setLoading(true);
    const{data}=await supabase.from("social_media").select("*").order("followers",{ascending:false});
    setAccounts(data||[]);
    setLoading(false);
  },[]);

  useEffect(()=>{load()},[load]);

  const openAdd=()=>{ser(null);sfo(dF);smo(true)};
  const openEdit=r=>{ser(r);sfo({account_name:r.account_name||"",handle:r.handle||"",platform:r.platform||"Instagram",followers:r.followers||0,following:r.following||0,posts:r.posts||0,engagement:r.engagement||0,monthly_reach:r.monthly_reach||0,notes:r.notes||""});smo(true)};
  const save=async()=>{if(!fo.account_name.trim())return;ssv(true);const d={...fo,followers:Number(fo.followers),following:Number(fo.following),posts:Number(fo.posts),engagement:Number(fo.engagement),monthly_reach:Number(fo.monthly_reach)};if(er){await supabase.from("social_media").update(d).eq("id",er.id)}else{await supabase.from("social_media").insert([d])}ssv(false);smo(false);ser(null);sfo(dF);load()};
  const del=async id=>{if(!confirm("Delete?"))return;await supabase.from("social_media").delete().eq("id",id);load()};

  const filtered=fi==="All"?accounts:accounts.filter(a=>a.platform===fi);
  const totalFollowers=accounts.reduce((a,c)=>a+(c.followers||0),0);
  const totalReach=accounts.reduce((a,c)=>a+(c.monthly_reach||0),0);
  const avgEng=accounts.length?accounts.reduce((a,c)=>a+(c.engagement||0),0)/accounts.length:0;

  // Platform breakdown for chart
  const platMap={};accounts.forEach(a=>{platMap[a.platform]=(platMap[a.platform]||0)+(a.followers||0);});
  const platBars=Object.entries(platMap).sort((a,b)=>b[1]-a[1]).map(([k,v])=>({k,v,c:pC[k]||"#64748B"}));

  return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
        <KPI l="Total accounts" v={accounts.length} s="Tracked" p/>
        <KPI l="Total followers" v={totalFollowers.toLocaleString()} s="Across all platforms" p/>
        <KPI l="Monthly reach" v={totalReach.toLocaleString()} p/>
        <KPI l="Avg engagement" v={avgEng.toFixed(2)+"%"} p={avgEng>=3}/>
      </div>

      {/* Platform breakdown chart */}
      {platBars.length>0&&(
        <Card>
          <CH title="Followers by platform"/>
          <div style={{padding:"14px 18px"}}>
            <HBar data={platBars} h={24}/>
          </div>
        </Card>
      )}

      <Card>
        <CH title={"Accounts ("+filtered.length+")"} right={
          <div style={{display:"flex",gap:4,alignItems:"center",flexWrap:"wrap"}}>
            {["All",...SM_PLATFORMS].map(p=><Btn key={p} a={fi===p} l={p} onClick={()=>sfi(p)}/>)}
            <AB onClick={openAdd} l="+ Add"/>
          </div>
        }/>
        {/* Header */}
        <div style={{display:"flex",padding:"7px 18px",borderBottom:"1px solid "+t.bd,fontSize:11,color:t.td,fontWeight:600,textTransform:"uppercase",letterSpacing:.5}}>
          <div style={{flex:2}}>Account</div>
          <div style={{width:100}}>Platform</div>
          <div style={{width:90,textAlign:"right"}}>Followers</div>
          <div style={{width:90,textAlign:"right"}}>Following</div>
          <div style={{width:70,textAlign:"right"}}>Posts</div>
          <div style={{width:90,textAlign:"right"}}>Mo. Reach</div>
          <div style={{width:80,textAlign:"right"}}>Engagement</div>
          <div style={{width:60}}></div>
        </div>
        <div style={{maxHeight:500,overflow:"auto"}}>
          {loading?(
            <div style={{padding:40,textAlign:"center",color:t.td}}>Loading...</div>
          ):filtered.length===0?(
            <div style={{padding:40,textAlign:"center",color:t.td}}>No accounts tracked yet. Click + Add to start.</div>
          ):filtered.map((a,i)=>(
            <div key={a.id||i} style={{display:"flex",alignItems:"center",padding:"11px 18px",borderBottom:"1px solid "+t.bd,gap:4,fontSize:13}} onMouseEnter={e=>e.currentTarget.style.background=t.s3} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <div style={{flex:2,minWidth:0}}>
                <div style={{fontWeight:600,color:t.tw}}>{a.account_name}</div>
                <div style={{fontSize:11,color:t.td}}>{a.handle}</div>
              </div>
              <div style={{width:100}}>
                <span style={{display:"inline-flex",alignItems:"center",gap:5,padding:"3px 8px",borderRadius:20,background:(pC[a.platform]||"#64748B")+"1F",color:pC[a.platform]||"#64748B",fontSize:11,fontWeight:600}}>{pI[a.platform]} {a.platform}</span>
              </div>
              <div style={{width:90,textAlign:"right",fontWeight:700,color:t.tw}}>{(a.followers||0).toLocaleString()}</div>
              <div style={{width:90,textAlign:"right",color:t.tm}}>{(a.following||0).toLocaleString()}</div>
              <div style={{width:70,textAlign:"right",color:t.td}}>{(a.posts||0).toLocaleString()}</div>
              <div style={{width:90,textAlign:"right",color:t.tl,fontWeight:600}}>{(a.monthly_reach||0).toLocaleString()}</div>
              <div style={{width:80,textAlign:"right",color:(a.engagement||0)>=5?t.gn:(a.engagement||0)>=2?t.am:t.td,fontWeight:700}}>{(a.engagement||0).toFixed(2)}%</div>
              <div style={{width:60,display:"flex",gap:2,flexShrink:0}}><EB onClick={()=>openEdit(a)}/><DB onClick={()=>del(a.id)}/></div>
            </div>
          ))}
        </div>
      </Card>

      <Modal open={mo} onClose={()=>smo(false)} title={er?"Edit account":"Add account"}>
        <F l="Account name" v={fo.account_name} onChange={v=>sfo({...fo,account_name:v})}/>
        <F l="Handle / URL" v={fo.handle} onChange={v=>sfo({...fo,handle:v})}/>
        <F l="Platform" v={fo.platform} onChange={v=>sfo({...fo,platform:v})} opts={SM_PLATFORMS}/>
        <F l="Followers" v={fo.followers} onChange={v=>sfo({...fo,followers:v})} type="number"/>
        <F l="Following" v={fo.following} onChange={v=>sfo({...fo,following:v})} type="number"/>
        <F l="Posts" v={fo.posts} onChange={v=>sfo({...fo,posts:v})} type="number"/>
        <F l="Monthly reach" v={fo.monthly_reach} onChange={v=>sfo({...fo,monthly_reach:v})} type="number"/>
        <F l="Engagement %" v={fo.engagement} onChange={v=>sfo({...fo,engagement:v})} type="number"/>
        <F l="Notes" v={fo.notes} onChange={v=>sfo({...fo,notes:v})}/>
        <SB onClick={save} loading={sv}/>
      </Modal>
    </div>
  );
}

function GmailPage(){
  const t=useContext(Ctx);
  const[connected,setConnected]=useState(false);
  const[profile,setProfile]=useState(null);
  const[msgs,setMsgs]=useState([]);
  const[loading,setLoading]=useState(false);
  const[selected,setSelected]=useState(null);
  const[msgBody,setMsgBody]=useState("");
  const[compose,setCompose]=useState(false);
  const[mail,setMail]=useState({to:"",subject:"",body:""});
  const[sending,setSending]=useState(false);
  const[sent,setSent]=useState(false);
  const[search,setSearch]=useState("");
  const[query,setQuery]=useState("in:inbox");

  const authUrl=`https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent("239120064064-p70c9lqugpspg0ttcu6bbqqlstncn810.apps.googleusercontent.com")}&redirect_uri=${encodeURIComponent(window.location.origin+"/api/auth/callback")}&response_type=code&scope=${encodeURIComponent("https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/userinfo.email")}&access_type=offline&prompt=consent`;

  const checkConnection=useCallback(async()=>{
    try{
      const r=await fetch("/api/gmail/messages?action=profile");
      const d=await r.json();
      if(d.emailAddress){setConnected(true);setProfile(d);loadMsgs(query);}
    }catch(e){}
  },[]);

  const loadMsgs=async(q)=>{
    setLoading(true);setSelected(null);setMsgBody("");
    try{
      const r=await fetch("/api/gmail/messages?q="+encodeURIComponent(q));
      const d=await r.json();
      setMsgs(d.messages||[]);
    }catch(e){}
    setLoading(false);
  };

  const openMsg=async(msg)=>{
    setSelected(msg);
    try{
      const r=await fetch("/api/gmail/messages?action=message&messageId="+msg.id);
      const d=await r.json();
      const parts=d.payload?.parts||[d.payload];
      let body="";
      const findText=(p)=>{
        if(!p)return;
        if(p.mimeType==="text/plain"&&p.body?.data){body=atob(p.body.data.replace(/-/g,"+").replace(/_/g,"/"));return;}
        if(p.parts)p.parts.forEach(findText);
      };
      parts.forEach(findText);
      setMsgBody(body||msg.snippet);
    }catch(e){setMsgBody(msg.snippet);}
  };

  const sendMail=async()=>{
    if(!mail.to||!mail.subject||!mail.body)return;
    setSending(true);
    const r=await fetch("/api/gmail/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(mail)});
    const d=await r.json();
    setSending(false);
    if(d.id){setSent(true);setCompose(false);setMail({to:"",subject:"",body:""});setTimeout(()=>setSent(false),3000);}
  };

  useEffect(()=>{checkConnection();},[checkConnection]);
  useEffect(()=>{const p=new URLSearchParams(window.location.search);if(p.get("connected")==="true"){checkConnection();window.history.replaceState({},"","/");}},[checkConnection]);

  if(!connected)return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:20,padding:60}}>
      <div style={{fontSize:48}}>✉️</div>
      <div style={{fontSize:22,fontWeight:700,color:t.tw}}>Connect Gmail</div>
      <div style={{fontSize:14,color:t.td,textAlign:"center",maxWidth:400}}>Connect your Gmail account to read emails, search your inbox and send emails directly from ALBAB Media.</div>
      <button onClick={()=>window.location.href=authUrl} style={{padding:"12px 28px",borderRadius:10,border:"none",background:t.bl,color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer"}}>Connect Gmail Account</button>
    </div>
  );

  return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"center"}}>
        <KPI l="Connected as" v={profile?.emailAddress||"Gmail"} s="Active" p/>
        <KPI l="Messages" v={msgs.length} s="loaded" p/>
        {sent&&<div style={{padding:"10px 18px",background:t.gG,border:"1px solid "+t.gn,borderRadius:10,color:t.gn,fontWeight:600}}>✓ Email sent!</div>}
      </div>

      <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
        <input placeholder="Search emails..." value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){setQuery(search||"in:inbox");loadMsgs(search||"in:inbox");}}} style={{flex:1,minWidth:200,padding:"8px 12px",borderRadius:8,border:"1px solid "+t.bd,background:t.bg,color:t.tx,fontSize:13,outline:"none"}}/>
        <button onClick={()=>{setQuery(search||"in:inbox");loadMsgs(search||"in:inbox");}} style={{padding:"8px 14px",borderRadius:8,border:"none",background:t.bl,color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer"}}>Search</button>
        {["in:inbox","in:sent","is:unread"].map(q=><Btn key={q} a={query===q} l={q.replace("in:","").replace("is:","")} onClick={()=>{setQuery(q);loadMsgs(q);}}/>)}
        <AB onClick={()=>setCompose(true)} l="✉ Compose"/>
      </div>

      <div style={{display:"grid",gridTemplateColumns:selected?"1fr 1fr":"1fr",gap:14}}>
        <Card>
          <CH title={"Inbox ("+msgs.length+")"}/>
          <div style={{maxHeight:520,overflow:"auto"}}>
            {loading?<div style={{padding:40,textAlign:"center",color:t.td}}>Loading...</div>:
            msgs.length===0?<div style={{padding:40,textAlign:"center",color:t.td}}>No messages found</div>:
            msgs.map((m,i)=>(
              <div key={i} onClick={()=>openMsg(m)} style={{padding:"11px 18px",borderBottom:"1px solid "+t.bd,cursor:"pointer",background:selected?.id===m.id?t.bG:"transparent"}} onMouseEnter={e=>e.currentTarget.style.background=t.s3} onMouseLeave={e=>e.currentTarget.style.background=selected?.id===m.id?t.bG:"transparent"}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                  <div style={{fontSize:12,fontWeight:m.unread?700:500,color:t.tw,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>{m.from?.split("<")[0]||m.from}</div>
                  <div style={{fontSize:10,color:t.td,flexShrink:0,marginLeft:8}}>{new Date(m.date).toLocaleDateString()}</div>
                </div>
                <div style={{fontSize:12,fontWeight:m.unread?700:500,color:m.unread?t.tw:t.tm,marginBottom:2}}>{m.subject}</div>
                <div style={{fontSize:11,color:t.td,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.snippet}</div>
              </div>
            ))}
          </div>
        </Card>

        {selected&&(
          <Card>
            <CH title={selected.subject} right={<button onClick={()=>{setSelected(null);setMsgBody("");}} style={{background:"transparent",border:"none",color:t.td,cursor:"pointer",fontSize:18}}>×</button>}/>
            <div style={{padding:18}}>
              <div style={{fontSize:12,color:t.td,marginBottom:4}}>From: {selected.from}</div>
              <div style={{fontSize:12,color:t.td,marginBottom:14}}>Date: {new Date(selected.date).toLocaleString()}</div>
              <div style={{fontSize:13,color:t.tx,lineHeight:1.7,whiteSpace:"pre-wrap",maxHeight:380,overflow:"auto"}}>{msgBody}</div>
              <button onClick={()=>{setCompose(true);setMail({to:selected.from.match(/<(.+)>/)?.[1]||selected.from,subject:"Re: "+selected.subject,body:"\n\n---\nOn "+new Date(selected.date).toLocaleString()+", "+selected.from+" wrote:\n"+msgBody.slice(0,300)+"..."});}} style={{marginTop:14,padding:"8px 16px",borderRadius:8,border:"none",background:t.bl,color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer"}}>↩ Reply</button>
            </div>
          </Card>
        )}
      </div>

      {/* Compose modal */}
      <Modal open={compose} onClose={()=>setCompose(false)} title="Compose Email">
        <F l="To" v={mail.to} onChange={v=>setMail({...mail,to:v})}/>
        <F l="Subject" v={mail.subject} onChange={v=>setMail({...mail,subject:v})}/>
        <div style={{marginBottom:12}}>
          <div style={{fontSize:12,color:useContext(Ctx).tm,marginBottom:4}}>Message</div>
          <textarea value={mail.body} onChange={e=>setMail({...mail,body:e.target.value})} rows={8} style={{width:"100%",padding:"8px 12px",borderRadius:8,border:"1px solid "+t.bd,background:t.s2,color:t.tx,fontSize:13,outline:"none",boxSizing:"border-box",resize:"vertical"}}/>
        </div>
        <SB onClick={sendMail} loading={sending}/>
      </Modal>
    </div>
  );
}

const NAV=[{k:"dash",l:"Dashboard",i:"\u25A3"},{k:"sales",l:"Sales",i:"\u26A1"},{k:"inf",l:"Influencers",i:"\u2605"},{k:"cash",l:"Cash flow",i:"$"},{k:"quot",l:"Quotations",i:"\u2611"},{k:"exp",l:"Expenses",i:"\u2699"},{k:"contacts",l:"Contacts",i:"\u260E"},{k:"events",l:"Events",i:"\uD83D\uDCC5"},{k:"social",l:"Social Media",i:"\uD83D\uDCF1"},{k:"gmail",l:"Gmail",i:"\u2709"}];

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
    contacts:<ContactsPage/>,
    events:<EventsPage/>,
    social:<SocialPage/>,
    gmail:<GmailPage/>
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
