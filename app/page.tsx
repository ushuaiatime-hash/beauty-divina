"use client";
import { useState, useEffect } from "react";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Space+Grotesk:wght@300;400;500;600&display=swap');
  *{box-sizing:border-box;-webkit-tap-highlight-color:transparent;margin:0;padding:0}
  :root{--acc:#ff6eb4;--bg:#0d0a0e;--sf:#180f18;--br:rgba(255,110,180,.1);--tx:#f5f0f4;--mu:rgba(245,240,244,.45)}
  body,#root{font-family:'Space Grotesk',sans-serif;background:var(--bg);color:var(--tx);min-height:100dvh}
  .ff{font-family:'Syne',sans-serif}
  .sf{background:var(--sf);border:1px solid var(--br)}
  .sfh{cursor:pointer;transition:all .2s}.sfh:hover{border-color:var(--acc)!important;background:rgba(255,255,255,.04)!important}
  .ab{background:var(--acc);color:var(--bg);font-family:'Syne',sans-serif;font-weight:800;cursor:pointer;border:none;transition:transform .1s}
  .ab:active{transform:scale(.97)}.ab:disabled{opacity:.35;cursor:not-allowed}
  .glow{box-shadow:0 0 22px color-mix(in srgb,var(--acc) 30%,transparent)}
  .tag{display:inline-flex;align-items:center;gap:4px;padding:2px 10px;border-radius:999px;font-size:.67rem;font-weight:600;letter-spacing:.05em;text-transform:uppercase;border:1px solid}
  .gbg{background-image:linear-gradient(rgba(255,255,255,.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.02) 1px,transparent 1px);background-size:38px 38px}
  @keyframes fu{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
  @keyframes fi{from{opacity:0}to{opacity:1}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
  .fu{animation:fu .4s cubic-bezier(.16,1,.3,1) both}
  .fi{animation:fi .3s ease both}
  .d1{animation-delay:.05s}.d2{animation-delay:.1s}.d3{animation-delay:.15s}.d4{animation-delay:.2s}
  ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:var(--acc);border-radius:2px}
  input,select{color-scheme:dark;font-family:'Space Grotesk',sans-serif}
  .sdot{width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.68rem;font-weight:700;border:1px solid var(--br);color:var(--mu);transition:all .25s}
  .sdot.act{background:var(--acc);color:var(--bg);border-color:var(--acc)}
  .sdot.done{background:rgba(255,255,255,.06);color:var(--acc);border-color:var(--acc)}
  .ov{position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:50;display:flex;align-items:flex-end;animation:fi .2s ease}
  .sh{background:var(--sf);border-radius:24px 24px 0 0;padding:24px 20px 48px;width:100%;max-height:92vh;overflow-y:auto;animation:fu .3s cubic-bezier(.16,1,.3,1)}
  .bnav{position:fixed;bottom:0;left:0;right:0;background:var(--sf);border-top:1px solid var(--br);display:flex;padding:10px 0 20px;z-index:40}
  .nb{display:flex;flex-direction:column;align-items:center;gap:2px;flex:1;cursor:pointer;background:none;border:none}
  .nb span{font-size:.63rem;font-weight:600;letter-spacing:.04em}
  .wbtn{display:flex;align-items:center;justify-content:center;gap:8px;padding:13px 0;border-radius:14px;font-size:14px;font-weight:700;font-family:'Syne',sans-serif;cursor:pointer;text-decoration:none;transition:transform .1s;width:100%;border:none}
  .wbtn:active{transform:scale(.97)}
  .pin-dot{width:14px;height:14px;border-radius:50%;border:2px solid var(--acc);transition:all .2s}
  .pin-dot.filled{background:var(--acc)}
  .pin-key{width:72px;height:72px;border-radius:18px;background:rgba(255,255,255,.05);border:1px solid var(--br);color:var(--tx);font-size:22px;font-weight:700;font-family:'Syne',sans-serif;cursor:pointer;transition:all .15s;display:flex;align-items:center;justify-content:center}
  .pin-key:active{background:var(--acc);color:var(--bg);transform:scale(.93)}
  .ri{background:rgba(255,255,255,.05);border:1px solid var(--br);border-radius:10px;padding:8px 12px;color:var(--tx);font-size:13px;outline:none;transition:border-color .2s}
  .ri:focus{border-color:var(--acc)}
  /* Calendar */
  .cal-day{display:flex;flex-direction:column;align-items:center;padding:6px 4px;border-radius:12px;cursor:pointer;transition:all .15s;min-width:40px}
  .cal-day.active{background:var(--acc)}
  .cal-day.has-apt::after{content:'';width:4px;height:4px;border-radius:50%;background:var(--acc);display:block;margin-top:3px}
  .cal-day.active.has-apt::after{background:var(--bg)}
  .apt-row{display:flex;align-items:stretch;gap:10px;margin-bottom:8px;cursor:pointer}
  .apt-time-col{display:flex;flex-direction:column;align-items:center;width:44px;flex-shrink:0}
  .apt-line{flex:1;width:1px;background:var(--br);margin-top:4px}
  .apt-card{flex:1;border-radius:14px;padding:12px 14px;border:1px solid var(--br);background:var(--sf);transition:all .2s}
  .apt-card:hover{border-color:var(--acc);background:rgba(255,255,255,.04)}
  /* Toggle switch */
  .toggle{position:relative;width:44px;height:24px;flex-shrink:0}
  .toggle input{opacity:0;width:0;height:0;position:absolute}
  .slider{position:absolute;inset:0;border-radius:999px;background:rgba(255,255,255,.1);border:1px solid var(--br);cursor:pointer;transition:.2s}
  .slider::before{content:'';position:absolute;width:18px;height:18px;border-radius:50%;background:#555;top:2px;left:2px;transition:.2s}
  input:checked+.slider{background:var(--acc);border-color:var(--acc)}
  input:checked+.slider::before{background:var(--bg);transform:translateX(20px)}
`;

const BIZ = { name:"Beauty Divina Turnos", desc:"Salón de belleza & estética premium 💅", phone:"5491155550001", addr:"Monte Grande, Buenos Aires", pin:"1234" };

type Prof = { id:string;name:string;spec:string;ini:string;schedule:DaySched[] };
type TimeBlock = { id:string;start:string;end:string };
type DaySched = { dow:number;active:boolean;blocks:TimeBlock[] };

const mkBlock = (s:string,e:string):TimeBlock => ({id:`b${Math.random().toString(36).slice(2,7)}`,start:s,end:e});
const initSchedule = (days:number[], s:string, e:string): DaySched[] =>
  [0,1,2,3,4,5,6].map(d => ({ dow:d, active:days.includes(d), blocks:[mkBlock(s,e)] }));

const PROFS_INIT: Prof[] = [
  { id:"p1", name:"Valentina Ruiz", spec:"Uñas & Manicuria",   ini:"VR", schedule: initSchedule([1,2,3,4,5],"09:00","18:00") },
  { id:"p2", name:"Camila Torres",  spec:"Facial & Depilación", ini:"CT", schedule: initSchedule([1,2,3,4,6],"10:00","19:00") },
];

const SVCS = [
  { id:"s1", name:"Manicuria Semipermanente", desc:"Esmaltado semi + diseño", dur:60,  price:3500, cat:"Uñas",       active:true },
  { id:"s2", name:"Pedicuría Completa",       desc:"Tratamiento completo",    dur:75,  price:4200, cat:"Uñas",       active:true },
  { id:"s3", name:"Limpieza Facial Profunda", desc:"Limpieza + hidratación",  dur:90,  price:6500, cat:"Facial",     active:true },
  { id:"s4", name:"Depilación Piernas",       desc:"Cera fría premium",       dur:50,  price:3000, cat:"Depilación", active:true },
];

const DAY_NAMES  = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
const today      = () => new Date().toISOString().split("T")[0];
const addDays    = (n:number) => { const d=new Date(); d.setDate(d.getDate()+n); return d.toISOString().split("T")[0]; };
const toMin      = (t:string) => { const [h,m]=t.split(":").map(Number); return h*60+m; };
const addMin     = (t:string,m:number) => { const x=toMin(t)+m; return `${String(Math.floor(x/60)).padStart(2,"0")}:${String(x%60).padStart(2,"0")}`; };
const fmtP       = (n:number) => new Intl.NumberFormat("es-AR",{style:"currency",currency:"ARS",maximumFractionDigits:0}).format(n);
const fmtD       = (d:string) => { if(!d) return ""; const f=new Intl.DateTimeFormat("es-AR",{weekday:"long",day:"numeric",month:"long"}).format(new Date(d+"T00:00:00")); return f.charAt(0).toUpperCase()+f.slice(1); };
const fmtShort   = (d:string) => new Intl.DateTimeFormat("es-AR",{day:"numeric",month:"short"}).format(new Date(d+"T00:00:00"));
const dow        = (d:string) => new Date(d+"T00:00:00").getDay();

function get7Days() {
  return Array.from({length:7},(_,i)=>addDays(i));
}
function genSlots(s:string,e:string,dur:number,ex:{t:string,e:string}[]) {
  const sl:string[]=[]; let c=toMin(s); const fin=toMin(e);
  while(c+dur<=fin){
    const st=`${String(Math.floor(c/60)).padStart(2,"0")}:${String(c%60).padStart(2,"0")}`;
    if(!ex.some(x=>c<toMin(x.e)&&c+dur>toMin(x.t))) sl.push(st);
    c+=dur;
  }
  return sl;
}

const msgConfirm    = (cl:string,d:string,t:string,sv:string) => `¡Hola ${cl}! 🌸\n\n✅ Tu turno está *confirmado*:\n\n📅 *${fmtD(d)}*\n🕐 *${t}hs*\n💅 *${sv}*\n📍 ${BIZ.addr}\n\nTe vamos a estar esperando 🤍\n— ${BIZ.name}`;
const msgCancel     = (cl:string,d:string,t:string) => `¡Hola ${cl}! 😔\n\nTuvimos que cancelar tu turno del *${fmtD(d)}* a las *${t}hs*.\n\nEscribinos para reagendar 🙏\n— ${BIZ.name}`;
const msgReschedule = (cl:string,d:string,t:string) => `¡Hola ${cl}! 📅\n\nNecesitamos mover tu turno del *${fmtD(d)}* a las *${t}hs*.\n\n¿Podés escribirnos para coordinar? 🌸\n— ${BIZ.name}`;
const msgReminder   = (cl:string,d:string,t:string,sv:string) => `¡Hola ${cl}! 👋\n\nTe recordamos tu turno de mañana:\n\n📅 *${fmtD(d)}*\n🕐 *${t}hs*\n💅 *${sv}*\n📍 ${BIZ.addr}\n\n¡Te esperamos! 🌸 — ${BIZ.name}`;
const waLink        = (ph:string,msg:string) => `https://wa.me/${ph.replace(/\D/g,"")}?text=${encodeURIComponent(msg)}`;

type Apt = { id:string;profId:string;svcId:string;date:string;time:string;end:string;status:string;client:string;phone:string;notes:string };
let DB:Apt[] = [
  { id:"a1",profId:"p1",svcId:"s1",date:today(),    time:"10:00",end:"11:00",status:"confirmed",client:"Laura Gómez", phone:"1144445555",notes:"" },
  { id:"a2",profId:"p2",svcId:"s3",date:today(),    time:"11:30",end:"13:00",status:"pending",  client:"Sofía Ríos",  phone:"1166667777",notes:"Primera vez" },
  { id:"a3",profId:"p1",svcId:"s2",date:addDays(1), time:"14:00",end:"15:15",status:"pending",  client:"Mara López",  phone:"1177778888",notes:"" },
  { id:"a4",profId:"p2",svcId:"s4",date:addDays(1), time:"10:00",end:"10:50",status:"confirmed",client:"Carla Vega",  phone:"1133334444",notes:"Alergia al kiwi" },
  { id:"a5",profId:"p1",svcId:"s3",date:addDays(2), time:"09:00",end:"10:30",status:"pending",  client:"Ana Romero",  phone:"1199990000",notes:"" },
  { id:"a6",profId:"p1",svcId:"s1",date:today(),    time:"09:00",end:"10:00",status:"completed",client:"Paula Díaz",  phone:"1155556666",notes:"" },
  { id:"a7",profId:"p2",svcId:"s4",date:today(),    time:"09:00",end:"09:50",status:"completed",client:"Mili Funes",  phone:"1122223333",notes:"" },
  { id:"a8",profId:"p1",svcId:"s2",date:addDays(-1),time:"10:00",end:"11:15",status:"completed",client:"Romi Paz",    phone:"1188889999",notes:"" },
  { id:"a9",profId:"p2",svcId:"s3",date:addDays(-1),time:"14:00",end:"15:30",status:"completed",client:"Nico Torres", phone:"1100001111",notes:"" },
  { id:"a10",profId:"p1",svcId:"s1",date:addDays(-2),time:"11:00",end:"12:00",status:"completed",client:"Flor Reyes", phone:"1144440000",notes:"" },
  { id:"a11",profId:"p1",svcId:"s4",date:addDays(-3),time:"10:00",end:"10:50",status:"completed",client:"Juli Mora",  phone:"1177771111",notes:"" },
  { id:"a12",profId:"p2",svcId:"s2",date:addDays(-3),time:"15:00",end:"16:15",status:"completed",client:"Caro Blanco",phone:"1166662222",notes:"" },
];

const SM:Record<string,{l:string;bg:string;c:string;bc:string;dot:string}> = {
  pending:      {l:"Pendiente",   bg:"rgba(250,204,21,.1)",  c:"#fde047",bc:"rgba(250,204,21,.3)", dot:"#fde047"},
  confirmed:    {l:"Confirmado",  bg:"rgba(163,230,53,.1)",  c:"#bef264",bc:"rgba(163,230,53,.3)", dot:"#bef264"},
  cancelled:    {l:"Cancelado",   bg:"rgba(239,68,68,.1)",   c:"#f87171",bc:"rgba(239,68,68,.3)",  dot:"#f87171"},
  completed:    {l:"Completado",  bg:"rgba(255,255,255,.06)",c:"rgba(255,255,255,.35)",bc:"rgba(255,255,255,.1)", dot:"#555"},
  rescheduling: {l:"Reagendando", bg:"rgba(168,85,247,.1)",  c:"#c084fc",bc:"rgba(168,85,247,.3)", dot:"#c084fc"},
};

// ── PIN ──────────────────────────────────────────────────────────
function PinScreen({onUnlock}:{onUnlock:()=>void}) {
  const [pin,setPin]=useState(""); const [shake,setShake]=useState(false); const [hint,setHint]=useState("");
  function press(k:string){
    if(pin.length>=4) return; const next=pin+k; setPin(next);
    if(next.length===4) setTimeout(()=>{ if(next===BIZ.pin){onUnlock();}else{setShake(true);setPin("");setHint("PIN incorrecto");setTimeout(()=>{setShake(false);setHint("");},700);}},150);
  }
  return (
    <div style={{minHeight:"100dvh",background:"var(--bg)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0 40px"}}>
      <style>{CSS}</style>
      <div style={{textAlign:"center",marginBottom:40}}>
        <div style={{width:64,height:64,borderRadius:18,background:"rgba(200,245,66,.12)",border:"1px solid rgba(200,245,66,.25)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",fontSize:28}}>✂️</div>
        <h1 className="ff" style={{fontSize:22,fontWeight:800,marginBottom:4}}>{BIZ.name}</h1>
        <p style={{fontSize:13,color:"var(--mu)"}}>Panel de gestión</p>
      </div>
      <div style={{display:"flex",gap:16,marginBottom:10,transform:shake?"translateX(-4px)":"none",transition:"transform .1s"}}>
        {[0,1,2,3].map(i=><div key={i} className={`pin-dot ${pin.length>i?"filled":""}`}/>)}
      </div>
      <p style={{fontSize:12,color:hint?"#f87171":"var(--mu)",marginBottom:24,minHeight:18}}>{hint||"Ingresá tu PIN"}</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,72px)",gap:12}}>
        {[1,2,3,4,5,6,7,8,9,"",0,"⌫"].map((k,i)=>
          k===""?<div key={i}/>:
          <button key={i} className="pin-key" onClick={()=>k==="⌫"?setPin(p=>p.slice(0,-1)):press(String(k))}>{k}</button>
        )}
      </div>
      <p style={{fontSize:11,color:"var(--mu)",marginTop:28,opacity:.4}}>Demo: PIN 1234</p>
    </div>
  );
}

// ── BOOKING ──────────────────────────────────────────────────────
type BS="svc"|"prof"|"dt"|"form"|"ok";
const BSTEPS:BS[]=["svc","prof","dt","form"]; const BLABELS=["Servicio","Profesional","Fecha","Datos"];

function Booking({onSwitch,profs}:{onSwitch:()=>void;profs:Prof[]}) {
  const [step,setStep]=useState<BS>("svc");
  const [selSvc,setSvc]=useState<typeof SVCS[0]|null>(null);
  const [selProf,setProf]=useState<Prof|null>(null);
  const [selDate,setDate]=useState(""); const [selTime,setTime]=useState("");
  const [slots,setSlots]=useState<string[]>([]);
  const [form,setForm]=useState({name:"",phone:"",email:"",notes:""});
  const [sub,setSub]=useState(false);
  const activeSvcs = SVCS.filter(s=>s.active);

  useEffect(()=>{
    if(!selProf||!selDate||!selSvc) return;
    const d=dow(selDate); const sched=selProf.schedule.find(s=>s.dow===d);
    if(!sched?.active||!sched.blocks.length){setSlots([]);return;}
    const ex=DB.filter(a=>a.profId===selProf.id&&a.date===selDate&&a.status!=="cancelled").map(a=>({t:a.time,e:a.end}));
    const allSlots:string[]=[];
    sched.blocks.forEach(b=>genSlots(b.start,b.end,selSvc.dur,ex).forEach(sl=>allSlots.push(sl)));
    allSlots.sort();
    setSlots(allSlots);
  },[selProf,selDate,selSvc]);

  function submit(){
    if(!selSvc||!selProf||!selDate||!selTime) return; setSub(true);
    setTimeout(()=>{
      DB.push({id:`a${Date.now()}`,profId:selProf.id,svcId:selSvc.id,date:selDate,time:selTime,end:addMin(selTime,selSvc.dur),status:"pending",client:form.name,phone:form.phone,notes:form.notes});
      setStep("ok"); setSub(false);
    },800);
  }
  const ci=BSTEPS.indexOf(step);
  return (
    <div className="gbg" style={{minHeight:"100dvh",background:"var(--bg)"}}>
      <style>{CSS}</style>
      <header style={{padding:"44px 20px 22px",borderBottom:"1px solid var(--br)",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,rgba(200,245,66,.07),transparent)",pointerEvents:"none"}}/>
        <div style={{position:"relative"}}>
          <div className="tag" style={{borderColor:"var(--acc)",color:"var(--acc)",marginBottom:10}}>
            <span style={{width:6,height:6,borderRadius:"50%",background:"var(--acc)",display:"inline-block",animation:"pulse 2s infinite"}}/>Online
          </div>
          <h1 className="ff" style={{fontSize:26,fontWeight:800,letterSpacing:"-.02em"}}>{BIZ.name}</h1>
          <p style={{fontSize:12,color:"var(--mu)",marginTop:3}}>{BIZ.desc}</p>
          <p style={{fontSize:11,color:"var(--mu)",marginTop:3}}>📍 {BIZ.addr}</p>
        </div>
        <button onClick={onSwitch} style={{position:"absolute",top:44,right:20,fontSize:11,padding:"6px 12px",borderRadius:10,border:"1px solid var(--br)",background:"rgba(255,255,255,.04)",color:"var(--mu)",cursor:"pointer"}}>Panel →</button>
      </header>
      {step!=="ok"&&<div style={{padding:"12px 20px",borderBottom:"1px solid var(--br)",background:"var(--bg)",position:"sticky",top:0,zIndex:20}}>
        <div style={{display:"flex",alignItems:"center",maxWidth:380}}>
          {BSTEPS.map((s,i)=>(
            <div key={s} style={{display:"flex",alignItems:"center",flex:i<BSTEPS.length-1?1:"0 0 auto"}}>
              <div className={`sdot ${step===s?"act":ci>i?"done":""}`}>{ci>i?"✓":i+1}</div>
              <span style={{marginLeft:5,fontSize:10,fontWeight:600,color:step===s||ci>i?"var(--acc)":"var(--mu)",opacity:ci>i&&step!==s?.6:1}}>{BLABELS[i]}</span>
              {i<BSTEPS.length-1&&<div style={{flex:1,height:1,background:"var(--br)",margin:"0 6px"}}/>}
            </div>
          ))}
        </div>
      </div>}
      <div style={{padding:"20px 20px 90px",maxWidth:480,margin:"0 auto"}}>
        {step==="svc"&&<div className="fu">
          <h2 className="ff" style={{fontSize:19,fontWeight:700,marginBottom:14}}>¿Qué servicio?</h2>
          {activeSvcs.map((s,i)=>(
            <div key={s.id} onClick={()=>{setSvc(s);setStep("prof")}} className={`sf sfh fu d${Math.min(i+1,4)}`} style={{borderRadius:16,padding:14,marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",gap:10}}>
                <div style={{flex:1}}>
                  <p className="ff" style={{fontWeight:700,fontSize:15}}>{s.name}</p>
                  <p style={{fontSize:12,color:"var(--mu)",marginTop:3}}>{s.desc}</p>
                  <div style={{display:"flex",gap:8,marginTop:8,alignItems:"center"}}>
                    <span className="tag" style={{borderColor:"var(--br)",color:"var(--mu)"}}>{s.cat}</span>
                    <span style={{fontSize:11,color:"var(--mu)"}}>{s.dur}min</span>
                  </div>
                </div>
                <p className="ff" style={{fontWeight:800,fontSize:18,color:"var(--acc)",flexShrink:0}}>{fmtP(s.price)}</p>
              </div>
            </div>
          ))}
        </div>}
        {step==="prof"&&<div className="fu">
          <button onClick={()=>setStep("svc")} style={{fontSize:12,color:"var(--mu)",marginBottom:12,cursor:"pointer",background:"none",border:"none"}}>← Volver</button>
          <h2 className="ff" style={{fontSize:19,fontWeight:700,marginBottom:14}}>¿Con quién?</h2>
          {profs.map((p,i)=>(
            <div key={p.id} onClick={()=>{setProf(p);setStep("dt")}} className={`sf sfh fu d${i+1}`} style={{borderRadius:16,padding:14,marginBottom:10}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div className="ff glow" style={{width:46,height:46,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:16,flexShrink:0,background:"rgba(200,245,66,.12)",color:"var(--acc)",border:"1px solid rgba(200,245,66,.25)"}}>{p.ini}</div>
                <div><p className="ff" style={{fontWeight:700}}>{p.name}</p><p style={{fontSize:12,color:"var(--mu)",marginTop:2}}>{p.spec}</p></div>
                <span style={{marginLeft:"auto",color:"var(--mu)"}}>→</span>
              </div>
            </div>
          ))}
        </div>}
        {step==="dt"&&<div className="fu">
          <button onClick={()=>setStep("prof")} style={{fontSize:12,color:"var(--mu)",marginBottom:12,cursor:"pointer",background:"none",border:"none"}}>← Volver</button>
          <h2 className="ff" style={{fontSize:19,fontWeight:700,marginBottom:14}}>Fecha y horario</h2>
          <div className="sf" style={{borderRadius:16,padding:16,marginBottom:12}}>
            <label style={{fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:".06em",color:"var(--mu)",display:"block",marginBottom:8}}>Fecha</label>
            <input type="date" min={today()} max={addDays(60)} value={selDate} onChange={e=>{setDate(e.target.value);setTime("")}} style={{width:"100%",background:"transparent",border:"none",borderBottom:"1px solid var(--br)",color:"var(--tx)",fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:16,padding:"4px 0",outline:"none"}}/>
          </div>
          {selDate&&<div className="sf fi" style={{borderRadius:16,padding:16}}>
            <label style={{fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:".06em",color:"var(--mu)",display:"block",marginBottom:12}}>{fmtD(selDate)}</label>
            {slots.length===0?<p style={{textAlign:"center",padding:"20px 0",fontSize:13,color:"var(--mu)"}}>Sin disponibilidad</p>:
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
                {slots.map(sl=><button key={sl} onClick={()=>setTime(sl)} className={selTime===sl?"glow":""} style={{padding:"10px 0",borderRadius:12,fontSize:13,fontFamily:"'Syne',sans-serif",fontWeight:700,cursor:"pointer",transition:"all .15s",background:selTime===sl?"var(--acc)":"rgba(255,255,255,.04)",color:selTime===sl?"var(--bg)":"var(--tx)",border:`1px solid ${selTime===sl?"var(--acc)":"var(--br)"}`}}>{sl}</button>)}
              </div>}
          </div>}
          {selTime&&<button onClick={()=>setStep("form")} className="ab glow fu" style={{width:"100%",marginTop:14,padding:"15px 0",borderRadius:16,fontSize:14}}>Continuar →</button>}
        </div>}
        {step==="form"&&<div className="fu">
          <button onClick={()=>setStep("dt")} style={{fontSize:12,color:"var(--mu)",marginBottom:12,cursor:"pointer",background:"none",border:"none"}}>← Volver</button>
          <div style={{borderRadius:16,padding:16,marginBottom:18,position:"relative",overflow:"hidden",background:"linear-gradient(135deg,rgba(200,245,66,.1),rgba(18,18,26,1))",border:"1px solid rgba(200,245,66,.25)"}}>
            <p style={{fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:".06em",color:"var(--mu)",marginBottom:6}}>Tu reserva</p>
            <p className="ff" style={{fontWeight:800,fontSize:19}}>{selSvc?.name}</p>
            <p style={{fontSize:13,color:"var(--mu)",marginTop:3}}>{selProf?.name} · {selTime}hs · {selDate&&fmtD(selDate)}</p>
            <p className="ff" style={{fontWeight:800,fontSize:22,color:"var(--acc)",marginTop:8}}>{selSvc&&fmtP(selSvc.price)}</p>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {[{k:"name",l:"Nombre *",t:"text",ph:"María García"},{k:"phone",l:"WhatsApp *",t:"tel",ph:"+54 11 1234-5678"},{k:"email",l:"Email",t:"email",ph:"tu@email.com"},{k:"notes",l:"Notas",t:"text",ph:"Indicaciones..."}].map(f=>(
              <div key={f.k} className="sf" style={{borderRadius:14,padding:"11px 14px"}}>
                <label style={{fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:".06em",color:"var(--mu)",display:"block",marginBottom:4}}>{f.l}</label>
                <input type={f.t} placeholder={f.ph} value={(form as Record<string,string>)[f.k]} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} style={{width:"100%",background:"transparent",border:"none",color:"var(--tx)",fontSize:14,fontWeight:500,outline:"none"}}/>
              </div>
            ))}
          </div>
          <button onClick={submit} disabled={!form.name||!form.phone||sub} className="ab glow" style={{width:"100%",marginTop:16,padding:"15px 0",borderRadius:16,fontSize:14}}>{sub?"Reservando...":"✓ Confirmar reserva"}</button>
        </div>}
        {step==="ok"&&<div className="fu" style={{textAlign:"center",paddingTop:36}}>
          <div className="ff glow" style={{width:72,height:72,borderRadius:"50%",background:"var(--acc)",color:"var(--bg)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,fontWeight:800,margin:"0 auto 18px"}}>✓</div>
          <h2 className="ff" style={{fontSize:26,fontWeight:800,marginBottom:6}}>¡Reserva enviada!</h2>
          <p style={{fontSize:13,color:"var(--mu)",marginBottom:22}}>Te avisamos cuando sea confirmada.</p>
          <div className="sf" style={{borderRadius:16,padding:18,textAlign:"left",marginBottom:14}}>
            {[["Servicio",selSvc?.name],["Profesional",selProf?.name],["Fecha",selDate&&fmtD(selDate)],["Horario",`${selTime}hs`],["Total",selSvc&&fmtP(selSvc.price)]].map(([l,v])=>(
              <div key={String(l)} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:"1px solid var(--br)"}}>
                <span style={{fontSize:13,color:"var(--mu)"}}>{l}</span>
                <span className={l==="Total"?"ff":""} style={{fontSize:l==="Total"?16:13,fontWeight:l==="Total"?800:600,color:l==="Total"?"var(--acc)":"var(--tx)"}}>{v}</span>
              </div>
            ))}
          </div>
          <a href={`https://wa.me/${BIZ.phone}`} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,width:"100%",padding:"13px 0",borderRadius:16,background:"#25D366",color:"white",fontWeight:600,fontSize:14,textDecoration:"none"}}>💬 Consultar por WhatsApp</a>
          <button onClick={()=>{setStep("svc");setSvc(null);setProf(null);setDate("");setTime("");setForm({name:"",phone:"",email:"",notes:""})}} style={{marginTop:12,fontSize:12,color:"var(--mu)",background:"none",border:"none",cursor:"pointer"}}>Nueva reserva</button>
        </div>}
      </div>
    </div>
  );
}

// ── ADMIN ────────────────────────────────────────────────────────
type AT="turnos"|"servicios"|"horarios"|"reportes";

function Admin({onSwitch}:{onSwitch:()=>void}) {
  const [tab,setTab]=useState<AT>("turnos");
  const [apts,setApts]=useState([...DB]);
  const [selDay,setSelDay]=useState(today());
  const [sel,setSel]=useState<Apt|null>(null);
  const [showReschedule,setShowReschedule]=useState(false);
  const [rdDate,setRdDate]=useState(""); const [rdTime,setRdTime]=useState("");
  const [profs,setProfs]=useState<Prof[]>(PROFS_INIT);
  const [svcs,setSvcs]=useState(SVCS);
  const [showSF,setShowSF]=useState(false); const [editId,setEditId]=useState<string|null>(null);
  const [sform,setSform]=useState({name:"",desc:"",dur:"60",price:"",cat:"General"});

  const week=get7Days();
  function refresh(){setApts([...DB]);}
  function chSt(id:string,st:string){const a=DB.find(x=>x.id===id);if(a){a.status=st;refresh();setSel({...a,status:st});}}
  function doReschedule(){
    if(!sel||!rdDate||!rdTime) return;
    const a=DB.find(x=>x.id===sel.id); if(!a) return;
    const svc=SVCS.find(s=>s.id===a.svcId);
    a.date=rdDate;a.time=rdTime;a.end=addMin(rdTime,svc?.dur??60);a.status="confirmed";
    refresh();setSel({...a});setShowReschedule(false);
  }
  function saveSvc(){
    if(editId)setSvcs(p=>p.map(s=>s.id===editId?{...s,name:sform.name,desc:sform.desc,dur:+sform.dur,price:+sform.price,cat:sform.cat}:s));
    else setSvcs(p=>[...p,{id:`s${Date.now()}`,name:sform.name,desc:sform.desc,dur:+sform.dur,price:+sform.price,cat:sform.cat,active:true}]);
    setShowSF(false);setEditId(null);setSform({name:"",desc:"",dur:"60",price:"",cat:"General"});
  }

  const dayApts = apts.filter(a=>a.date===selDay&&a.status!=="cancelled").sort((a,b)=>a.time.localeCompare(b.time));
  const counts={p:apts.filter(a=>a.status==="pending").length,c:apts.filter(a=>a.status==="confirmed").length,t:apts.filter(a=>a.date===today()).length};
  const badge=(sm:typeof SM[string])=>({background:sm.bg,color:sm.c,border:`1px solid ${sm.bc}`});
  const NAV=[{id:"turnos",icon:"📅",l:"Turnos"},{id:"reportes",icon:"💰",l:"Reportes"},{id:"servicios",icon:"✂️",l:"Servicios"},{id:"horarios",icon:"🕐",l:"Horarios"}] as const;

  function getRevenue(filterFn:(a:Apt)=>boolean){
    return apts.filter(a=>a.status==="completed"&&filterFn(a))
      .reduce((sum,a)=>{const svc=SVCS.find(s=>s.id===a.svcId);return sum+(svc?.price??0);},0);
  }
  function getCount(filterFn:(a:Apt)=>boolean){
    return apts.filter(a=>a.status==="completed"&&filterFn(a)).length;
  }
  const todayStr=today();
  const weekStart=addDays(-(new Date().getDay()||7)+1);
  const monthStr=todayStr.slice(0,7);
  const revDay   =getRevenue(a=>a.date===todayStr);
  const revWeek  =getRevenue(a=>a.date>=weekStart&&a.date<=addDays(6));
  const revMonth =getRevenue(a=>a.date.startsWith(monthStr));
  const cntDay   =getCount(a=>a.date===todayStr);
  const cntWeek  =getCount(a=>a.date>=weekStart&&a.date<=addDays(6));
  const cntMonth =getCount(a=>a.date.startsWith(monthStr));

  const svcRevMap:Record<string,number>={};
  apts.filter(a=>a.status==="completed").forEach(a=>{svcRevMap[a.svcId]=(svcRevMap[a.svcId]??0)+(SVCS.find(s=>s.id===a.svcId)?.price??0);});
  const topSvcs=Object.entries(svcRevMap).sort((a,b)=>b[1]-a[1]).slice(0,4);
  const maxSvcRev=topSvcs[0]?.[1]??1;
  const completedApts=apts.filter(a=>a.status==="completed").sort((a,b)=>b.date.localeCompare(a.date)||b.time.localeCompare(a.time));

  return (
    <div style={{minHeight:"100dvh",background:"var(--bg)"}}>
      <style>{CSS}</style>
      <header style={{padding:"44px 20px 18px",background:"var(--sf)",borderBottom:"1px solid var(--br)",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,rgba(200,245,66,.07),transparent)",pointerEvents:"none"}}/>
        <div style={{position:"relative",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <p style={{fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:".08em",color:"var(--mu)",marginBottom:4}}>Panel Admin</p>
            <h1 className="ff" style={{fontSize:22,fontWeight:800}}>{BIZ.name}</h1>
          </div>
          <button onClick={onSwitch} style={{fontSize:11,padding:"6px 12px",borderRadius:10,border:"1px solid var(--br)",background:"rgba(255,255,255,.04)",color:"var(--mu)",cursor:"pointer"}}>Ver reservas →</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginTop:14}}>
          {[["Hoy",counts.t,"📅"],["Pendientes",counts.p,"⏳"],["Confirmados",counts.c,"✅"]].map(([l,v,ic])=>(
            <div key={String(l)} style={{background:"rgba(255,255,255,.04)",borderRadius:12,padding:"10px 12px",border:"1px solid var(--br)"}}>
              <p className="ff" style={{fontSize:22,fontWeight:800,color:"var(--acc)"}}>{v}</p>
              <p style={{fontSize:10,color:"var(--mu)",marginTop:1}}>{ic} {l}</p>
            </div>
          ))}
        </div>
      </header>

      <div style={{padding:"16px 20px 100px",maxWidth:600,margin:"0 auto"}}>
        {tab==="turnos"&&<div className="fu">
          <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:6,marginBottom:16}}>
            {week.map(d=>{
              const hasApt=apts.some(a=>a.date===d&&a.status!=="cancelled");
              const isToday=d===today();
              const active=d===selDay;
              return (
                <div key={d} className={`cal-day ${active?"active":""} ${hasApt?"has-apt":""}`}
                  onClick={()=>setSelDay(d)}
                  style={{background:active?"var(--acc)":"rgba(255,255,255,.03)",border:`1px solid ${active?"var(--acc)":isToday?"rgba(200,245,66,.3)":"var(--br)"}`,flexShrink:0}}>
                  <span style={{fontSize:9,fontWeight:600,letterSpacing:".06em",color:active?"var(--bg)":isToday?"var(--acc)":"var(--mu)",textTransform:"uppercase"}}>{DAY_NAMES[dow(d)]}</span>
                  <span className="ff" style={{fontSize:16,fontWeight:800,color:active?"var(--bg)":"var(--tx)",lineHeight:1.1}}>{new Date(d+"T00:00:00").getDate()}</span>
                  <span style={{fontSize:9,color:active?"var(--bg)":"var(--mu)"}}>{fmtShort(d).split(" ")[1]}</span>
                  {hasApt&&<div style={{width:4,height:4,borderRadius:"50%",background:active?"var(--bg)":"var(--acc)",marginTop:2}}/>}
                </div>
              );
            })}
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <p className="ff" style={{fontWeight:700,fontSize:16}}>{fmtD(selDay)}</p>
            <span style={{fontSize:12,color:"var(--mu)"}}>{dayApts.length} turno{dayApts.length!==1?"s":""}</span>
          </div>
          {dayApts.length===0
            ? <div style={{textAlign:"center",padding:"40px 0"}}><p style={{fontSize:32,marginBottom:8}}>📭</p><p style={{color:"var(--mu)",fontSize:14}}>Sin turnos este día</p></div>
            : dayApts.map((a,i)=>{
                const svc=SVCS.find(s=>s.id===a.svcId); const prof=PROFS_INIT.find(p=>p.id===a.profId); const sm=SM[a.status]??SM.pending;
                return (
                  <div key={a.id} className={`apt-row fu d${Math.min(i+1,4)}`} onClick={()=>setSel({...a})}>
                    <div className="apt-time-col"><span className="ff" style={{fontSize:13,fontWeight:700,color:"var(--acc)",whiteSpace:"nowrap"}}>{a.time}</span><div className="apt-line"/></div>
                    <div className="apt-card" style={{borderLeft:`3px solid ${sm.dot}`}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}><p className="ff" style={{fontWeight:700,fontSize:15}}>{a.client}</p><span className="tag" style={badge(sm)}>{sm.l}</span></div>
                      <p style={{fontSize:12,color:"var(--mu)",marginTop:4}}>{svc?.name} · {prof?.name}</p>
                      <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}><span style={{fontSize:11,color:"var(--mu)"}}>{a.time} – {a.end}hs · {svc?.dur}min</span><span className="ff" style={{fontSize:12,color:"var(--acc)",fontWeight:700}}>{svc&&fmtP(svc.price)}</span></div>
                    </div>
                  </div>
                );
              })
          }
        </div>}
        {tab==="reportes"&&<div className="fu">
          <h3 className="ff" style={{fontWeight:700,fontSize:18,marginBottom:16}}>Facturación</h3>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:20}}>
            {[{l:"Hoy", rev:revDay, cnt:cntDay, ic:"☀️"},{l:"Semana", rev:revWeek, cnt:cntWeek, ic:"📆"},{l:"Mes", rev:revMonth, cnt:cntMonth, ic:"📊"}].map(x=>(
              <div key={x.l} style={{background:"rgba(255,255,255,.04)",borderRadius:14,padding:"12px 10px",border:"1px solid var(--br)",textAlign:"center"}}>
                <p style={{fontSize:16,marginBottom:4}}>{x.ic}</p>
                <p className="ff" style={{fontSize:15,fontWeight:800,color:"var(--acc)",lineHeight:1}}>{fmtP(x.rev)}</p>
                <p style={{fontSize:10,color:"var(--mu)",marginTop:4}}>{x.cnt} turno{x.cnt!==1?"s":""}</p>
                <p style={{fontSize:10,color:"var(--mu)",fontWeight:600}}>{x.l}</p>
              </div>
            ))}
          </div>
          {topSvcs.length>0&&<><h4 className="ff" style={{fontWeight:700,fontSize:14,marginBottom:12,color:"var(--mu)",textTransform:"uppercase",letterSpacing:".06em"}}>Servicios más facturados</h4>
          <div className="sf" style={{borderRadius:16,padding:16,marginBottom:20}}>
            {topSvcs.map(([svcId,rev])=>{const svc=SVCS.find(s=>s.id===svcId);const pct=Math.round((rev/maxSvcRev)*100);return (<div key={svcId} style={{marginBottom:14}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><span style={{fontSize:13,fontWeight:500}}>{svc?.name??svcId}</span><span className="ff" style={{fontSize:13,fontWeight:700,color:"var(--acc)"}}>{fmtP(rev)}</span></div><div style={{height:6,borderRadius:999,background:"rgba(255,255,255,.06)",overflow:"hidden"}}><div style={{height:"100%",borderRadius:999,background:"var(--acc)",width:`${pct}%`,transition:"width .6s cubic-bezier(.16,1,.3,1)"}}/></div></div>);})}
          </div></>}
          <h4 className="ff" style={{fontWeight:700,fontSize:14,marginBottom:12,color:"var(--mu)",textTransform:"uppercase",letterSpacing:".06em"}}>Turnos completados</h4>
          {completedApts.length===0?<div style={{textAlign:"center",padding:"30px 0"}}><p style={{color:"var(--mu)"}}>Sin turnos completados aún</p></div>:completedApts.map((a,i)=>{const svc=SVCS.find(s=>s.id===a.svcId); const prof=PROFS_INIT.find(p=>p.id===a.profId);return (<div key={a.id} className={`sf fu d${Math.min(i+1,4)}`} style={{borderRadius:14,padding:"12px 14px",marginBottom:8,borderLeft:"3px solid #555"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}><div><p className="ff" style={{fontWeight:700,fontSize:14}}>{a.client}</p><p style={{fontSize:12,color:"var(--mu)",marginTop:2}}>{svc?.name} · {prof?.name}</p><p style={{fontSize:11,color:"var(--mu)",marginTop:2}}>{fmtD(a.date)} · {a.time}hs</p></div><p className="ff" style={{fontWeight:800,fontSize:15,color:"var(--acc)",flexShrink:0}}>{svc&&fmtP(svc.price)}</p></div></div>);})}
        </div>}
        {tab==="servicios"&&<div className="fu">
          <button onClick={()=>{setShowSF(true);setEditId(null);setSform({name:"",desc:"",dur:"60",price:"",cat:"General"})}} className="ab glow" style={{width:"100%",padding:"14px 0",borderRadius:16,fontSize:14,marginBottom:14}}>+ Agregar servicio</button>
          {svcs.map((s,i)=>(
            <div key={s.id} className={`sf fu d${Math.min(i+1,4)}`} style={{borderRadius:16,padding:14,marginBottom:10,opacity:s.active?1:.45}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div style={{flex:1}}><div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}><p className="ff" style={{fontWeight:700,fontSize:15}}>{s.name}</p><span className="tag" style={{borderColor:"var(--br)",color:"var(--mu)"}}>{s.cat}</span></div><p style={{fontSize:12,color:"var(--mu)",marginTop:3}}>{s.desc}</p><p style={{fontSize:12,marginTop:6}}>{s.dur}min · <span style={{color:"var(--acc)",fontWeight:700}}>{fmtP(s.price)}</span></p></div>
                <div style={{display:"flex",gap:6,marginLeft:8,flexShrink:0}}><button onClick={()=>{setEditId(s.id);setSform({name:s.name,desc:s.desc,dur:String(s.dur),price:String(s.price),cat:s.cat});setShowSF(true)}} style={{fontSize:11,padding:"5px 10px",borderRadius:8,border:"1px solid var(--br)",background:"rgba(255,255,255,.04)",color:"var(--mu)",cursor:"pointer"}}>Editar</button><button onClick={()=>setSvcs(p=>p.map(x=>x.id===s.id?{...x,active:!x.active}:x))} style={{fontSize:11,padding:"5px 10px",borderRadius:8,border:"1px solid",cursor:"pointer",background:s.active?"rgba(239,68,68,.1)":"rgba(163,230,53,.1)",color:s.active?"#f87171":"#bef264",borderColor:s.active?"rgba(239,68,68,.3)":"rgba(163,230,53,.3)"}}>{s.active?"Ocultar":"Activar"}</button></div>
              </div>
            </div>
          ))}
        </div>}
        {tab==="horarios"&&<div className="fu">
          <h3 className="ff" style={{fontWeight:700,fontSize:18,marginBottom:4}}>Disponibilidad semanal</h3>
          <p style={{fontSize:12,color:"var(--mu)",marginBottom:16}}>Activá días y configurá uno o más bloques de horario.</p>
          {profs.map(prof=>(
            <div key={prof.id} className="sf" style={{borderRadius:16,padding:16,marginBottom:14}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}><div className="ff" style={{width:38,height:38,borderRadius:10,background:"rgba(255,110,180,.12)",color:"var(--acc)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:13,border:"1px solid rgba(255,110,180,.25)",flexShrink:0}}>{prof.ini}</div><div><p className="ff" style={{fontWeight:700}}>{prof.name}</p><p style={{fontSize:11,color:"var(--mu)"}}>{prof.spec}</p></div></div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {prof.schedule.map(sch=>(
                  <div key={sch.dow} style={{borderRadius:12,padding:"10px 12px",background:"rgba(255,255,255,.03)",border:`1px solid ${sch.active?"rgba(255,110,180,.25)":"var(--br)"}`,transition:"all .2s",opacity:sch.active?1:.5}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}><span className="ff" style={{fontSize:14,fontWeight:700,width:36,color:sch.active?"var(--acc)":"var(--mu)"}}>{DAY_NAMES[sch.dow]}</span>{sch.active&&<span style={{fontSize:11,color:"var(--mu)",flex:1,marginLeft:8}}>{sch.blocks.map(b=>`${b.start}–${b.end}`).join("  ·  ")}</span>}<label className="toggle"><input type="checkbox" checked={sch.active} onChange={()=>setProfs(ps=>ps.map(p=>p.id===prof.id?{...p,schedule:p.schedule.map(s=>s.dow===sch.dow?{...s,active:!s.active}:s)}:p))}/><span className="slider"/></label></div>
                    {sch.active&&(<div style={{marginTop:10,display:"flex",flexDirection:"column",gap:8}}>{sch.blocks.map((blk,bi)=>(<div key={blk.id} style={{display:"flex",gap:8,alignItems:"center",padding:"8px 10px",borderRadius:10,background:"rgba(255,255,255,.04)",border:"1px solid var(--br)"}}><span style={{fontSize:11,color:"var(--mu)",width:20,textAlign:"center",flexShrink:0}}>#{bi+1}</span><div style={{flex:1}}><label style={{fontSize:9,fontWeight:600,textTransform:"uppercase",letterSpacing:".06em",color:"var(--mu)",display:"block",marginBottom:3}}>Desde</label><input type="time" value={blk.start} className="ri" style={{width:"100%"}} onChange={e=>setProfs(ps=>ps.map(p=>p.id===prof.id?{...p,schedule:p.schedule.map(s=>s.dow===sch.dow?{...s,blocks:s.blocks.map(b=>b.id===blk.id?{...b,start:e.target.value}:b)}:s)}:p))}/></div><span style={{color:"var(--mu)",fontSize:12,marginTop:14}}>→</span><div style={{flex:1}}><label style={{fontSize:9,fontWeight:600,textTransform:"uppercase",letterSpacing:".06em",color:"var(--mu)",display:"block",marginBottom:3}}>Hasta</label><input type="time" value={blk.end} className="ri" style={{width:"100%"}} onChange={e=>setProfs(ps=>ps.map(p=>p.id===prof.id?{...p,schedule:p.schedule.map(s=>s.dow===sch.dow?{...s,blocks:s.blocks.map(b=>b.id===blk.id?{...b,end:e.target.value}:b)}:s)}:p))}/></div>{sch.blocks.length>1&&(<button onClick={()=>setProfs(ps=>ps.map(p=>p.id===prof.id?{...p,schedule:p.schedule.map(s=>s.dow===sch.dow?{...s,blocks:s.blocks.filter(b=>b.id!==blk.id)}:s)}:p))} style={{width:28,height:28,borderRadius:8,background:"rgba(239,68,68,.1)",color:"#f87171",border:"1px solid rgba(239,68,68,.25)",cursor:"pointer",fontSize:14,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",marginTop:14}}>✕</button>)}</div>))}<button onClick={()=>setProfs(ps=>ps.map(p=>p.id===prof.id?{...p,schedule:p.schedule.map(s=>s.dow===sch.dow?{...s,blocks:[...s.blocks,mkBlock("14:00","18:00")]}:s)}:p))} style={{padding:"8px 0",borderRadius:10,background:"rgba(255,110,180,.07)",color:"var(--acc)",border:"1px dashed rgba(255,110,180,.3)",fontSize:12,fontWeight:700,cursor:"pointer",width:"100%",fontFamily:"'Syne',sans-serif"}}>+ Agregar bloque</button></div>)}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>}
      </div>
      <div className="bnav">{NAV.map(n=>(<button key={n.id} className="nb" onClick={()=>setTab(n.id)}><span style={{fontSize:20}}>{n.icon}</span><span style={{color:tab===n.id?"var(--acc)":"var(--mu)",transition:"color .2s"}}>{n.l}</span></button>))}</div>
      {sel&&(()=>{const svc=SVCS.find(s=>s.id===sel.svcId); const prof=PROFS_INIT.find(p=>p.id===sel.profId); const sm=SM[sel.status]??SM.pending;return (<div className="ov" onClick={()=>{setSel(null);setShowReschedule(false);}}><div className="sh" onClick={e=>e.stopPropagation()}><div style={{width:36,height:4,borderRadius:999,background:"var(--br)",margin:"0 auto 18px"}}/><div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}><h3 className="ff" style={{fontWeight:700,fontSize:20}}>Turno</h3><span className="tag" style={badge(sm)}>{sm.l}</span></div>{[["Cliente",sel.client],["Teléfono",sel.phone],["Servicio",svc?.name??"-"],["Profesional",prof?.name??"-"],["Fecha",fmtD(sel.date)],["Horario",`${sel.time}–${sel.end}hs`],["Precio",svc?fmtP(svc.price):"-"],...(sel.notes?[["Notas",sel.notes]]:[])].map(([l,v])=>(<div key={String(l)} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:"1px solid var(--br)"}}><span style={{fontSize:13,color:"var(--mu)"}}>{l}</span><span className={l==="Precio"?"ff":""} style={{fontSize:l==="Precio"?16:13,fontWeight:l==="Precio"?800:600,color:l==="Precio"?"var(--acc)":"var(--tx)",textAlign:"right",maxWidth:"55%"}}>{v}</span></div>))}{showReschedule&&(<div style={{marginTop:14,padding:14,borderRadius:14,background:"rgba(168,85,247,.08)",border:"1px solid rgba(168,85,247,.25)"}}><p className="ff" style={{fontWeight:700,fontSize:13,color:"#c084fc",marginBottom:10}}>📅 Nueva fecha y hora</p><div style={{display:"flex",gap:8}}><input type="date" min={today()} value={rdDate} onChange={e=>setRdDate(e.target.value)} className="ri" style={{flex:1}}/><input type="time" value={rdTime} onChange={e=>setRdTime(e.target.value)} className="ri" style={{flex:1}}/></div><div style={{display:"flex",gap:8,marginTop:10}}><button onClick={doReschedule} disabled={!rdDate||!rdTime} style={{flex:1,padding:"10px 0",borderRadius:10,background:"rgba(168,85,247,.2)",color:"#c084fc",border:"1px solid rgba(168,85,247,.35)",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"'Syne',sans-serif"}}>Confirmar</button><button onClick={()=>setShowReschedule(false)} style={{padding:"10px 14px",borderRadius:10,background:"rgba(255,255,255,.05)",color:"var(--mu)",border:"1px solid var(--br)",fontSize:13,cursor:"pointer"}}>✕</button></div></div>)}<div style={{display:"flex",flexDirection:"column",gap:8,marginTop:16}}>{sel.status==="pending"&&<><a href={waLink(sel.phone,msgConfirm(sel.client,sel.date,sel.time,svc?.name??""))} onClick={()=>chSt(sel.id,"confirmed")} className="wbtn glow" style={{background:"var(--acc)",color:"var(--bg)"}}>✅ Confirmar y avisar por WPP</a><button onClick={()=>{chSt(sel.id,"rescheduling");setShowReschedule(true)}} style={{padding:"13px 0",borderRadius:14,fontSize:14,cursor:"pointer",background:"rgba(168,85,247,.12)",color:"#c084fc",border:"1px solid rgba(168,85,247,.3)",fontWeight:700,fontFamily:"'Syne',sans-serif",width:"100%"}}>🔄 Mover turno</button><a href={waLink(sel.phone,msgCancel(sel.client,sel.date,sel.time))} onClick={()=>chSt(sel.id,"cancelled")} className="wbtn" style={{background:"rgba(239,68,68,.1)",color:"#f87171",border:"1px solid rgba(239,68,68,.25)"}}>❌ Cancelar y avisar por WPP</a></>}{sel.status==="confirmed"&&<><a href={waLink(sel.phone,msgReminder(sel.client,sel.date,sel.time,svc?.name??""))} className="wbtn glow" style={{background:"var(--acc)",color:"var(--bg)"}}>🔔 Enviar recordatorio WPP</a><button onClick={()=>{chSt(sel.id,"rescheduling");setShowReschedule(true)}} style={{padding:"13px 0",borderRadius:14,fontSize:14,cursor:"pointer",background:"rgba(168,85,247,.12)",color:"#c084fc",border:"1px solid rgba(168,85,247,.3)",fontWeight:700,fontFamily:"'Syne',sans-serif",width:"100%"}}>🔄 Mover turno</button><a href={waLink(sel.phone,msgCancel(sel.client,sel.date,sel.time))} onClick={()=>chSt(sel.id,"cancelled")} className="wbtn" style={{background:"rgba(239,68,68,.1)",color:"#f87171",border:"1px solid rgba(239,68,68,.25)"}}>❌ Cancelar y avisar por WPP</a><button onClick={()=>chSt(sel.id,"completed")} style={{padding:"11px 0",borderRadius:14,fontSize:13,cursor:"pointer",background:"rgba(255,255,255,.05)",color:"var(--mu)",border:"1px solid var(--br)",fontFamily:"'Syne',sans-serif",fontWeight:600,width:"100%"}}>✓ Marcar completado</button></>}{sel.status==="rescheduling"&&<><button onClick={()=>setShowReschedule(true)} style={{padding:"13px 0",borderRadius:14,fontSize:14,cursor:"pointer",background:"rgba(168,85,247,.12)",color:"#c084fc",border:"1px solid rgba(168,85,247,.3)",fontWeight:700,fontFamily:"'Syne',sans-serif",width:"100%"}}>📅 Elegir nueva fecha/hora</button><a href={waLink(sel.phone,msgReschedule(sel.client,sel.date,sel.time))} className="wbtn" style={{background:"rgba(168,85,247,.1)",color:"#c084fc",border:"1px solid rgba(168,85,247,.25)"}}>💬 Avisar reagendamiento WPP</a></>}{(sel.status==="completed"||sel.status==="cancelled")&&<a href={waLink(sel.phone,`¡Hola ${sel.client}! 👋 — ${BIZ.name}`)} className="wbtn" style={{background:"rgba(37,211,102,.08)",color:"#4ade80",border:"1px solid rgba(37,211,102,.2)"}}>💬 Abrir WhatsApp</a>}</div></div></div>);})()}
      {showSF&&(<div className="ov" onClick={()=>setShowSF(false)}><div className="sh" onClick={e=>e.stopPropagation()}><div style={{width:36,height:4,borderRadius:999,background:"var(--br)",margin:"0 auto 18px"}}/><h3 className="ff" style={{fontWeight:700,fontSize:20,marginBottom:16}}>{editId?"Editar":"Nuevo"} servicio</h3><div style={{display:"flex",flexDirection:"column",gap:10}}>{[{k:"name",l:"Nombre *",t:"text",ph:"Manicuria Semi"},{k:"desc",l:"Descripción",t:"text",ph:"Desc breve"},{k:"cat",l:"Categoría",t:"text",ph:"Uñas"},{k:"dur",l:"Duración (min)",t:"number",ph:"60"},{k:"price",l:"Precio $",t:"number",ph:"3500"}].map(f=>(<div key={f.k} style={{background:"rgba(255,255,255,.04)",borderRadius:12,padding:"10px 14px",border:"1px solid var(--br)"}}><label style={{fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:".06em",color:"var(--mu)",display:"block",marginBottom:4}}>{f.l}</label><input type={f.t} placeholder={f.ph} value={(sform as Record<string,string>)[f.k]} onChange={e=>setSform(p=>({...p,[f.k]:e.target.value}))} style={{width:"100%",background:"transparent",border:"none",color:"var(--tx)",fontSize:14,fontWeight:500,outline:"none"}}/></div>))}</div><button onClick={saveSvc} disabled={!sform.name||!sform.price} className="ab glow" style={{width:"100%",marginTop:14,padding:"13px 0",borderRadius:14,fontSize:14}}>Guardar</button></div></div>)}
    </div>
  );
}

export default function Home() {
  const [v,setV]=useState<"book"|"pin"|"admin">("book");
  const [unlocked,setUnlocked]=useState(false);
  const [profs]=useState<Prof[]>(PROFS_INIT);
  function goAdmin(){unlocked?setV("admin"):setV("pin");}
  function onUnlock(){setUnlocked(true);setV("admin");}
  return (
    <>
      {v==="book"  && <Booking  onSwitch={goAdmin} profs={profs}/>}
      {v==="pin"   && <PinScreen onUnlock={onUnlock}/>}
      {v==="admin" && <Admin    onSwitch={()=>setV("book")}/>}
    </>
  );
}